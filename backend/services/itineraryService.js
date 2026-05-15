const Place = require('../models/Place');

const PRICE_LEVEL_COST = { budget: 30, moderate: 80, luxury: 200 }; // TND per stop estimate
const STOPS_PER_DAY = 4;
const MEALS_COST_PER_DAY = { budget: 30, moderate: 70, luxury: 150 };
const TRANSPORT_COST_PER_DAY = 25;

const DEFAULT_WEIGHTS = {
  interestMatch: 0.4,
  rating: 0.3,
  proximityStart: 0.2,
  popularity: 0.1,
};

const toRad = (deg) => (deg * Math.PI) / 180;
const haversineKm = ([lng1, lat1], [lng2, lat2]) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
};

const getWeights = async () => {
  try {
    const SystemConfig = require('../models/SystemConfig');
    const cfg = await SystemConfig.findOne({ key: 'recommendation' });
    if (cfg?.value?.weights) {
      return { ...DEFAULT_WEIGHTS, ...cfg.value.weights };
    }
  } catch {
    // SystemConfig not yet available — fall back to defaults
  }
  return DEFAULT_WEIGHTS;
};

/**
 * Score a place against generation params.
 * All sub-scores are normalised to [0, 1].
 */
const scorePlace = (place, { interests, startCoords, maxDistanceKm = 500, popMax = 1, weights }) => {
  const tags = place.tags || [];
  const interestOverlap = interests.length
    ? tags.filter((t) => interests.includes(t)).length / interests.length
    : 0.5;

  const rating = (place.rating?.average || 0) / 5;

  let proximity = 0.5;
  if (startCoords && place.location?.coordinates) {
    const d = haversineKm(startCoords, place.location.coordinates);
    proximity = Math.max(0, 1 - d / maxDistanceKm);
  }

  const popularity = popMax ? Math.min(1, (place.popularity || 0) / popMax) : 0;

  return (
    weights.interestMatch * interestOverlap +
    weights.rating * rating +
    weights.proximityStart * proximity +
    weights.popularity * popularity
  );
};

/**
 * Lightweight k-means on lng/lat. Deterministic seeding (place 0, then farthest-from-existing).
 * Returns array of cluster indices, one per place.
 */
const kMeansClusters = (places, k, iterations = 8) => {
  if (places.length === 0 || k <= 1) return places.map(() => 0);
  const coords = places.map((p) => p.location.coordinates);

  // Farthest-first seeding
  const centroids = [coords[0]];
  while (centroids.length < k) {
    let bestIdx = 0;
    let bestDist = -1;
    coords.forEach((c, i) => {
      const minToCentroid = Math.min(...centroids.map((m) => haversineKm(c, m)));
      if (minToCentroid > bestDist) {
        bestDist = minToCentroid;
        bestIdx = i;
      }
    });
    centroids.push(coords[bestIdx]);
  }

  let assignments = new Array(coords.length).fill(0);
  for (let it = 0; it < iterations; it++) {
    // assign
    assignments = coords.map((c) => {
      let best = 0;
      let bestD = Infinity;
      centroids.forEach((m, idx) => {
        const d = haversineKm(c, m);
        if (d < bestD) {
          bestD = d;
          best = idx;
        }
      });
      return best;
    });

    // recompute centroids
    const sums = centroids.map(() => ({ lng: 0, lat: 0, n: 0 }));
    coords.forEach((c, i) => {
      const a = assignments[i];
      sums[a].lng += c[0];
      sums[a].lat += c[1];
      sums[a].n += 1;
    });
    sums.forEach((s, idx) => {
      if (s.n > 0) centroids[idx] = [s.lng / s.n, s.lat / s.n];
    });
  }
  return assignments;
};

/**
 * Order stops within a day with a simple nearest-neighbor traversal.
 */
const orderByNearestNeighbor = (places, startCoords) => {
  if (places.length === 0) return [];
  const remaining = [...places];
  const ordered = [];
  let current = startCoords;

  if (!current) {
    current = remaining[0].location.coordinates;
    ordered.push(remaining.shift());
  }

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestD = Infinity;
    remaining.forEach((p, i) => {
      const d = haversineKm(current, p.location.coordinates);
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    });
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    current = next.location.coordinates;
  }
  return ordered;
};

const estimateStopCost = (place) => PRICE_LEVEL_COST[place.priceLevel] || PRICE_LEVEL_COST.moderate;

/**
 * Generate an itinerary.
 * params = { durationDays, interests[], startRegion?, startCoords?, budget?, budgetLevel?, regions?[] }
 * Does not persist — returns a plain object the controller can save.
 */
const generate = async (params) => {
  const {
    durationDays,
    interests = [],
    startRegion = null,
    startCoords = null,
    budget = null,
    budgetLevel = 'moderate',
    regions = null,
    accommodationType = null,
  } = params;

  const weights = await getWeights();

  // 1. Filter candidates — only "visit" places (no accommodation) so the
  //    nightly stay doesn't compete with sightseeing in the scoring pool.
  const filter = { status: 'published', accommodationType: null };
  if (regions?.length) filter.region = { $in: regions };
  else if (startRegion) filter.region = startRegion;
  if (interests.length) filter.tags = { $in: interests };

  let candidates = await Place.find(filter).lean();

  // Fallback: drop tag filter if too few candidates
  if (candidates.length < durationDays * STOPS_PER_DAY) {
    const broad = { ...filter };
    delete broad.tags;
    candidates = await Place.find(broad).lean();
  }

  // Pick a recommended accommodation if requested. We choose the highest-rated
  // one in the start region (or anywhere), close to startCoords if provided.
  let accommodation = null;
  if (accommodationType) {
    const accFilter = { status: 'published', accommodationType };
    if (startRegion) accFilter.region = startRegion;
    const accommodations = await Place.find(accFilter).lean();
    if (accommodations.length) {
      const ranked = accommodations
        .map((a) => ({
          a,
          score:
            (a.rating?.average || 0) / 5 +
            (startCoords && a.location?.coordinates
              ? Math.max(0, 1 - haversineKm(startCoords, a.location.coordinates) / 500)
              : 0),
        }))
        .sort((x, y) => y.score - x.score);
      accommodation = ranked[0].a;
    }
  }

  if (candidates.length === 0) {
    return {
      days: [],
      totalCost: 0,
      warning: 'No places found for the given filters',
    };
  }

  // 2. Score
  const popMax = Math.max(...candidates.map((p) => p.popularity || 0)) || 1;
  const scored = candidates
    .filter((p) => p.location?.coordinates)
    .map((p) => ({
      place: p,
      score: scorePlace(p, { interests, startCoords, popMax, weights }),
    }))
    .sort((a, b) => b.score - a.score);

  // Take top N (a few more than strictly needed, for budget pruning)
  const need = durationDays * STOPS_PER_DAY;
  const pool = scored.slice(0, Math.min(scored.length, need * 2)).map((s) => s.place);

  // 3. Cluster geographically into durationDays buckets
  const k = Math.min(durationDays, pool.length);
  const clusters = kMeansClusters(pool, k);

  const buckets = Array.from({ length: durationDays }, () => []);
  pool.forEach((p, idx) => {
    const c = clusters[idx];
    if (buckets[c]) buckets[c].push(p);
  });

  // Cap each bucket at STOPS_PER_DAY (already scored, so trim from the end)
  buckets.forEach((b, i) => {
    buckets[i] = b.slice(0, STOPS_PER_DAY);
  });

  // 4. Order each day by nearest-neighbor from start. When the traveller asked
  //    for a specific accommodation type, the chosen lodging is appended as
  //    the last stop of every day (an "end of day" night stop).
  const accommodationNightlyCost =
    accommodation?.priceRange?.min ??
    (PRICE_LEVEL_COST[accommodation?.priceLevel] || 0) * 2;
  const days = buckets.map((bucketPlaces, idx) => {
    const ordered = orderByNearestNeighbor(bucketPlaces, idx === 0 ? startCoords : null);
    const stops = ordered.map((p, i) => ({
      place: p._id,
      order: i + 1,
      durationMin: 90,
      estimatedCost: estimateStopCost(p),
    }));
    if (accommodation) {
      stops.push({
        place: accommodation._id,
        order: stops.length + 1,
        durationMin: 0,
        estimatedCost: accommodationNightlyCost,
        note: 'Nightly stay',
      });
    }
    const dayCost =
      stops.reduce((s, x) => s + x.estimatedCost, 0) +
      (MEALS_COST_PER_DAY[budgetLevel] || MEALS_COST_PER_DAY.moderate) +
      TRANSPORT_COST_PER_DAY;
    return {
      dayNumber: idx + 1,
      region: bucketPlaces[0]?.region || null,
      stops,
      estimatedCost: dayCost,
    };
  });

  // 5. Budget cap — drop the cheapest stops from the costliest days until under budget
  let totalCost = days.reduce((s, d) => s + d.estimatedCost, 0);
  let warning = null;
  if (budget && budget > 0 && totalCost > budget) {
    const original = totalCost;
    // Iteratively trim until budget met or no stops left
    while (totalCost > budget) {
      const candidatesToTrim = days
        .map((d, i) => ({ i, last: d.stops[d.stops.length - 1] }))
        .filter((x) => x.last);
      if (candidatesToTrim.length === 0) break;
      // remove the highest-cost trailing stop
      candidatesToTrim.sort((a, b) => b.last.estimatedCost - a.last.estimatedCost);
      const target = candidatesToTrim[0];
      const removed = days[target.i].stops.pop();
      days[target.i].estimatedCost -= removed.estimatedCost;
      totalCost -= removed.estimatedCost;
    }
    if (totalCost > budget) {
      warning = `Could not fit within budget (estimated ${original} TND > ${budget} TND)`;
    }
  }

  // Detach the populated place documents — keep ids only on stops, expose populated separately
  const populatedPlaces = {};
  pool.forEach((p) => {
    populatedPlaces[p._id.toString()] = p;
  });
  if (accommodation) {
    populatedPlaces[accommodation._id.toString()] = accommodation;
  }

  return {
    days,
    totalCost,
    warning,
    weights,
    populatedPlaces, // controller can choose to inline or drop
  };
};

module.exports = {
  generate,
  scorePlace,
  kMeansClusters,
  orderByNearestNeighbor,
  haversineKm,
  DEFAULT_WEIGHTS,
};
