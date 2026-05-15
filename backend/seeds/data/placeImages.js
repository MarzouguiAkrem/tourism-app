// Cover images for seeded places.
// URLs use Wikimedia Commons' Special:FilePath which redirects to the canonical
// upload URL with proper headers — this avoids the anti-hotlink 400s you get
// when calling upload.wikimedia.org directly without a Commons referer.
//
// 8 places (mostly small-article entries without an infobox image) fall back
// to a thematic shot of a related article — flagged FALLBACK in comments.
const cdn = (filename) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1024`;

module.exports = {
  // ─── Histoire & Patrimoine ───────────────────────────────
  'amphitheatre-el-jem': cdn(
    'The_Amphitheatre_of_El_Jem,_built_around_AD_238_in_Thysdrus_in_Africa_Proconsularis,_the_estimated_capacity_is_35,000,_Tunisia_-_52717762494.jpg'
  ),
  carthage: cdn('Montage_ville_de_Carthage.png'),
  dougga: cdn('Dougga,_Beja.jpg'),
  kerkouane: cdn('Kerkouane_-_panorama.jpg'),
  'bulla-regia': cdn('Bulla_regia_archaeological_site.jpg'),
  sbeitla: cdn('Sbeitla_10.jpg'),
  'ribat-monastir': cdn('Ribat_Monastir_03.JPG'),
  'ribat-sousse': cdn('Medina_of_Sousse-130323.jpg'),

  // ─── Plages & Mer ───────────────────────────────────────
  'plage-hammamet': cdn('Хаммамет1.jpg'),
  'iles-kerkennah': cdn('Kerkennah_Islands_NASA.jpg'),
  'plage-mahdia': cdn('Mahdia_Museum.jpg'),
  tabarka: cdn('Ile_de_tabarka_1.jpg'),
  djerba: cdn('Djerba_Island.jpeg'),
  'djerba-aghir': cdn('Djerba_Island.jpeg'),

  // ─── Désert & Sahara ─────────────────────────────────────
  douz: cdn(
    'Tunisia_10-12_-_064_-_Douz_and_the_Festival_of_the_Sahara_(6609290791).jpg'
  ),
  // FALLBACK: Tataouine night view as a southern Tunisia stand-in
  'ksar-ghilane': cdn('Tataouine_by_night.jpg'),
  // FALLBACK: ditto
  matmata: cdn('Tataouine_by_night.jpg'),
  tozeur: cdn('Tozeur_sud_tunisien.jpg'),
  'chott-el-jerid': cdn('Chott_Djerid_003.jpg'),
  'tataouine-ksour': cdn('Tataouine_by_night.jpg'),
  chebika: cdn('Abandoned_and_New_Village_of_Chebika.jpg'),

  // ─── Musées ──────────────────────────────────────────────
  'musee-bardo': cdn('Tunis,_musée_du_Bardo,_salle_de_Virgile_01.jpg'),
  'musee-carthage': cdn('Facade_Musee_Carthage.jpg'),
  'dar-cherait': cdn('Dar_Cherait.jpg'),

  // ─── Médinas & Souks ────────────────────────────────────
  'medina-tunis': cdn('Medina_old_Town_of_Tunis.jpeg'),
  'medina-sousse': cdn('Sousse,_Inside_the_Medina,_through_a_window_2016-04-19.jpeg'),
  // FALLBACK: Tunis medina for Sfax
  'medina-sfax': cdn('Medina_old_Town_of_Tunis.jpeg'),
  // FALLBACK: a Sidi Bou Said café shot
  'sidi-bou-said': cdn('Sidi_Chebaan.jpg'),

  // ─── Nature & Parcs ─────────────────────────────────────
  // FALLBACK: Korbous (coastal) for Ichkeul (wetland)
  'parc-ichkeul': cdn('TUNISIE_KORBOUS_02.JPG'),
  // FALLBACK: ditto for Cap Bon
  'cap-bon': cdn('TUNISIE_KORBOUS_02.JPG'),
  korbous: cdn('TUNISIE_KORBOUS_02.JPG'),

  // ─── Religieux ───────────────────────────────────────────
  // FALLBACK: Tunis medina (the Zitouna mosque is inside it)
  'mosquee-zitouna': cdn('Medina_old_Town_of_Tunis.jpeg'),
  'kairouan-grande-mosquee': cdn(
    'Great_Mosque_of_Kairouan_Panorama_-_Grande_Mosquée_de_Kairouan_Panorama.jpg'
  ),
  'grande-mosquee-kairouan': cdn(
    'Great_Mosque_of_Kairouan_Panorama_-_Grande_Mosquée_de_Kairouan_Panorama.jpg'
  ),
  'ghriba-djerba': cdn('El_Ghriba.jpg'),

  // ─── Gastronomie ────────────────────────────────────────
  // Restaurants don't have dedicated Wikipedia articles — using thematic shots.
  'dar-el-jeld': cdn('Bol_de_Leblabi_de_Tunisie,_21_mars_2017.jpg'),
  'cafe-des-delices': cdn('Sidi_Chebaan.jpg'),
  'restaurant-le-golfe': cdn('Bol_de_Leblabi_de_Tunisie,_21_mars_2017.jpg'),
  'fondouk-el-attarine': cdn('Medina_old_Town_of_Tunis.jpeg'),

  // ─── Hébergement ────────────────────────────────────────
  // No hotel-specific photos on Commons — using thematic shots of the
  // surrounding city/landscape so each property has a coherent cover.
  'hotel-africa-tunis': cdn('Avenue_Habib_Bourguiba_-_panoramio.jpg'),
  'russelior-hammamet': cdn('Хаммамет1.jpg'),
  'dar-el-jeld-hotel': cdn('Medina_old_Town_of_Tunis.jpeg'),
  'dar-said-sidi-bou-said': cdn('Sidi_Chebaan.jpg'),
  'dar-hi-nefta': cdn('Tozeur_sud_tunisien.jpg'),
  'sahara-pearl-douz': cdn(
    'Tunisia_10-12_-_064_-_Douz_and_the_Festival_of_the_Sahara_(6609290791).jpg'
  ),
  'auberge-kantaoui': cdn('Medina_of_Sousse-130323.jpg'),
  'camp-ksar-ghilane': cdn('Tataouine_by_night.jpg'),
};
