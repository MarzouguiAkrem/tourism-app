// Demo safety alerts — kept generic to avoid stale references in real life.
// Adjust `active` and `expiresAt` if you don't want them surfaced.
module.exports = [
  {
    title: {
      fr: 'Forte chaleur en région saharienne',
      en: 'High temperatures in Saharan regions',
      ar: 'موجة حر شديدة في المناطق الصحراوية',
    },
    message: {
      fr: 'Températures dépassant 45°C attendues à Tozeur, Douz et Tataouine. Évitez les excursions entre 11h et 17h, hydratez-vous régulièrement.',
      en: 'Temperatures above 45°C expected in Tozeur, Douz and Tataouine. Avoid excursions between 11am and 5pm, drink water often.',
      ar: 'درجات حرارة تتجاوز 45 درجة متوقعة في توزر ودوز وتطاوين.',
    },
    severity: 'warning',
    region: 'sud-ouest',
    active: true,
    source: 'Institut National de la Météorologie',
  },
  {
    title: {
      fr: 'Pickpockets dans la médina de Tunis',
      en: 'Pickpockets in the Tunis medina',
      ar: 'نشالون في مدينة تونس العتيقة',
    },
    message: {
      fr: 'Vigilance renforcée dans les souks bondés. Gardez sacs et téléphones à l\'avant et préférez les espèces en petite coupure.',
      en: 'Be vigilant in busy souks. Keep bags and phones in front and prefer small-denomination cash.',
      ar: 'انتبه في الأسواق المزدحمة.',
    },
    severity: 'info',
    region: 'tunis',
    location: { type: 'Point', coordinates: [10.17, 36.7975] },
    radius: 2000,
    active: true,
    source: 'Tourist Office',
  },
  {
    title: {
      fr: 'Précautions aux frontières sud',
      en: 'Caution near southern borders',
      ar: 'احتياطات قرب الحدود الجنوبية',
    },
    message: {
      fr: 'Les zones frontalières au sud-est et sud-ouest sont déconseillées sans guide local. Consultez votre ambassade avant tout déplacement.',
      en: 'Border zones in the south-east and south-west are not recommended without a local guide. Check with your embassy before travelling.',
      ar: 'يُنصح بعدم زيارة المناطق الحدودية دون مرشد.',
    },
    severity: 'danger',
    region: 'sud',
    active: true,
    source: 'Travel advisory',
  },
  {
    title: {
      fr: 'Méduses signalées à Hammamet',
      en: 'Jellyfish reported in Hammamet',
      ar: 'قناديل البحر في الحمامات',
    },
    message: {
      fr: 'Présence de méduses sur les plages d\'Hammamet et Yasmine. Renseignez-vous auprès des maîtres-nageurs avant la baignade.',
      en: 'Jellyfish reported on Hammamet and Yasmine beaches. Check with lifeguards before swimming.',
      ar: 'تم رصد قناديل البحر في شواطئ الحمامات.',
    },
    severity: 'info',
    region: 'nord-est',
    location: { type: 'Point', coordinates: [10.6203, 36.4] },
    radius: 15000,
    active: true,
    source: 'Local lifeguards',
  },
];
