# Plan de développement — Tunisia Tourism App

Plan phasé pour la conception et le développement de l'application mobile dédiée au tourisme en Tunisie (PFE).

**Stack** : React Native (Expo) · Node.js/Express · MongoDB · Redux Toolkit · i18next

---

## État actuel (Phase 1 — terminée)

- **Backend** : `auth` (register/login/refresh/forgot/reset/me/logout) + `users` (profil, préférences, password, avatar)
- **Mobile** : navigation racine (Onboarding/Auth/Main), Redux + redux-persist, SecureStore tokens, i18n fr/en/ar, écrans auth
- **Stubs en attente** : `places`, `categories`, `reviews`, `itineraries`, `currency`, `cultural`, `safety`, `favorites`, `admin`, `sync`

---

## Écart specs ↔ code actuel

Manques à ajouter (pas dans les stubs) :

- **LivingCost / ProductPrice** — "prix des produits essentiels" (eau, pain, repas, taxi, nuitée) → nouveau module
- **SOS** — sous-module de `safety` : contacts d'urgence, partage de position, appel direct
- **Recommandation config** — endpoints admin pour ajuster les poids de scoring → extension de `admin`
- **Notifications push** — expo-notifications + trigger backend

---

## Graphe de dépendances

```
auth (FAIT) ──┬─► users (FAIT) ──┬─► favorites ──┐
              │                   │               │
              ├─► categories ─────┤               │
              │         ▲         ▼               │
              │         │      places ──┬─► reviews
              │         │         │     │
              │         │         │     ├─► itineraries (générateur)
              │         │         │     │
              │         │         │     └─► sync (offline bundle)
              │         │         │
              ├─► currency (indépendant, API externe + cron)
              │
              ├─► cultural (indépendant, contenu)
              │
              ├─► safety ──► SOS ──► notifications push
              │
              └─► living-costs (indépendant, contenu admin)

admin/stats ──► dépend de tous les autres modules (fin)
```

**Parallélisable** : `currency`, `cultural`, `living-costs` peuvent avancer en parallèle de `places`.

---

## Phase 2 — Fondations contenu (places + categories)

**Backend**
- Modèle `Category` : `{ name: {fr,en,ar}, slug, icon, parent }`
- Modèle `Place` :
  ```
  {
    name: {fr, en, ar},
    description: {fr, en, ar},
    location: GeoJSON Point (index 2dsphere),
    region, category, images[],
    priceLevel, openingHours, rating, contact
  }
  ```
- Endpoints : list (pagination + filtres), search (texte + filtres), nearby (`$near`), top-rated, CRUD admin
- Upload images via `upload.middleware.js` (Cloudinary en Phase 9)
- Seed : peupler `seeds/data/` avec 50–100 lieux réels

**Mobile**
- `HomeScreen` : carousel catégories + top-rated
- `ExploreStackNavigator` : liste + filtres + carte
- `PlaceDetailScreen` : galerie + infos + actions

---

## Phase 3 — Engagement (favorites + reviews)

**Backend**
- `Favorite` : `{ user, place }` avec index composé unique, endpoints toggle / check / list
- `Review` : `{ user, place, rating 1–5, comment, photos[], status (pending/approved/rejected) }`
- Recalcul automatique `place.rating` (moyenne + count) via Mongoose post-save hook
- Modération admin

**Mobile**
- Bouton cœur dans `PlaceCard`
- Tab `Favorites`
- Formulaire review + liste reviews dans détail

---

## Phase 4 — Assistant financier (currency) — parallélisable

**Backend**
- Service `currencyService.js` : cron quotidien (`node-cron`, déjà installé) → fetch ExchangeRate API → cache en DB (`ExchangeRate` collection)
- Endpoints : `/rates` (toutes vers TND), `/convert?from=&to=&amount=`

**Mobile**
- Écran convertisseur
- Widget sur Home
- Intégration dans itinéraire pour estimation budget

---

## Phase 5 — Planificateur d'itinéraires (cœur "intelligent")

**Backend**
- Modèle `Itinerary` :
  ```
  {
    user, title, durationDays, budget, interests[], startRegion,
    days: [{ date, places: [{ placeId, order, durationMin, estimatedCost }] }],
    status, totalCost
  }
  ```
- **Algorithme génération** (`POST /itineraries/generate`) :
  1. Filtrer `Place` par région + intérêts utilisateur (intersection avec `tags`)
  2. Scorer : `0.4 * interestMatch + 0.3 * rating + 0.2 * proximityStart + 0.1 * popularity`
  3. Répartir sur N jours par clustering géographique (k-means léger sur lat/lng)
  4. Ordonner dans chaque jour par nearest-neighbor depuis hôtel / point de départ
  5. Couper pour respecter le budget (sum `priceLevel` + transport estimé + repas)

**Mobile**
- Wizard création (3–4 étapes)
- Vue jour-par-jour
- Carte avec tracé
- Réordonnancement drag-and-drop

**Risque** : l'algorithme naïf peut donner des itinéraires médiocres. Prévoir itération post-MVP sur les poids.

---

## Phase 6 — Culturel + sécurité + prix essentiels

**Backend**
- `CulturalContent` : `{ type (custom/etiquette/lexicon/tradition/cuisine), title: {fr,en,ar}, content: {fr,en,ar}, image, tags }`
- `LexiconEntry` : `{ word: {fr,en,ar}, pronunciation (ar→latin), audio?, category }`
- `SafetyAlert` : `{ title: {fr,en,ar}, message: {fr,en,ar}, severity (info/warning/danger), location (GeoJSON, optionnel), radius, expiresAt, active }`
- **SOS** : `EmergencyContact` (police 197, SAMU 190, ambassades par nationalité)
- `LivingCost` : `{ item: {fr,en,ar}, category (food/transport/accommodation), priceTND, priceRange, region }`

**Mobile**
- `CulturalStack` : tabs coutumes / lexique / cuisine
- `SafetyScreen` : alertes géolocalisées + bouton SOS
- SOS : gros boutons appel direct (`Linking.openURL('tel:...')`) + partage position (`expo-location` + `Share`)
- `PricesScreen`

---

## Phase 7 — Admin panel

**Backend**
- `GET /admin/stats/overview` : counts users / places / itineraries / reviews
- `GET /admin/stats/users` : growth 7j / 30j
- `GET /admin/stats/popular-places` : top favoris / vues
- `GET /admin/stats/regions` : distribution
- CRUD admin pour chaque module (déjà implicite dans phases 2–6)
- Config recommandation : collection `SystemConfig` exposant les poids de scoring itinéraire
- Middleware `role.middleware.js` (déjà existant) à utiliser partout

**Admin UI** — à trancher :
- Option A : écrans mobile `screens/admin/` (déjà scaffoldé)
- Option B : interface web séparée (React/Next) — **recommandée pour PFE**, plus démontrable

---

## Phase 8 — Mode hors ligne (sync)

**Backend**
- `GET /sync/bundle` : snapshot JSON compressé (places + categories + cultural + lexicon + living-costs) — tout sauf données user
- `GET /sync/bundle/version` : hash / timestamp pour détecter updates
- `GET /sync/delta?since=<timestamp>` : resources modifiées depuis

**Mobile**
- Au 1er lancement → download bundle → AsyncStorage
- Interceptor API + `NetInfo` → si offline, lire du cache
- Queue writes (favorites, reviews) dans AsyncStorage, rejouer au retour online
- Recharger delta au démarrage si online

**Hors scope** : tuiles carte offline (complexe — nécessite `react-native-maps` custom ou Mapbox)

---

## Phase 9 — Notifications + production

- `expo-notifications` + tokens user stockés backend → push alertes sécurité dans rayon
- Cloudinary pour images (remplace stockage local `uploads/`)
- Sentry (crash reporting), analytics basique
- Tests : au moins les controllers critiques (auth, itinerary generator) avec Jest + supertest
- RTL : vérifier `I18nManager.forceRTL` pour l'arabe, test sur device
- CI GitHub Actions : lint + build Expo preview
- Build production : EAS (Android APK + iOS si Mac), MongoDB Atlas tier payant, VPS/Railway/Render pour API

---

## Décisions transverses à trancher

| Sujet | Option recommandée | Alternative |
|---|---|---|
| i18n modèles | Sous-doc `{fr,en,ar}` embarqué | Collection `Translation` séparée |
| Panel admin | App web séparée (React/Next) | Écrans mobile `screens/admin/` |
| Stockage images | Cloudinary dès Phase 2 | Local `uploads/` puis migration |
| Recommandation | Content-based (scoring explicite) | Collaborative filtering (plus tard) |
| Tests | Ajout progressif par phase | Tout à la fin (risqué) |

---

## Risques identifiés

- **Algorithme itinéraire** : qualité subjective → prévoir feedback utilisateur pour ajuster les poids
- **Contenu multilingue** : 50–100 lieux × 3 langues = beaucoup de saisie → prévoir un import CSV/JSON admin
- **Offline + écritures** : conflits si user modifie offline puis sync → stratégie last-write-wins simple suffit pour PFE
- **RTL arabe** : bugs UI fréquents sur layouts complexes → tester tôt, pas en Phase 9
- **Cloudinary gratuit** : limite 25GB/mois, ok pour PFE, à surveiller en démo
