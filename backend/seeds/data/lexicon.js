module.exports = [
  // ─── Salutations / Greetings ─────────────────────────────
  {
    word: { fr: 'Bonjour', en: 'Hello', ar: 'السلام عليكم' },
    pronunciation: 'as-salaamu alaykum',
    category: 'greeting',
    example: {
      fr: 'On dit "السلام عليكم" en arrivant.',
      en: 'Say "as-salaamu alaykum" when arriving.',
      ar: 'تقال عند الوصول.',
    },
    order: 1,
  },
  {
    word: { fr: 'Bonjour (informel)', en: 'Hi', ar: 'عسلامة' },
    pronunciation: 'aaslama',
    category: 'greeting',
    order: 2,
  },
  {
    word: { fr: 'Merci', en: 'Thank you', ar: 'شكرا' },
    pronunciation: 'choukran',
    category: 'greeting',
    order: 3,
  },
  {
    word: { fr: "S'il vous plaît", en: 'Please', ar: 'من فضلك' },
    pronunciation: 'min fadhlek',
    category: 'greeting',
    order: 4,
  },
  {
    word: { fr: 'Au revoir', en: 'Goodbye', ar: 'بسلامة' },
    pronunciation: 'bislama',
    category: 'greeting',
    order: 5,
  },
  {
    word: { fr: 'Oui', en: 'Yes', ar: 'إيه' },
    pronunciation: 'eeh',
    category: 'greeting',
    order: 6,
  },
  {
    word: { fr: 'Non', en: 'No', ar: 'لا' },
    pronunciation: 'la',
    category: 'greeting',
    order: 7,
  },

  // ─── Directions ──────────────────────────────────────────
  {
    word: { fr: 'Où ?', en: 'Where?', ar: 'وين ؟' },
    pronunciation: 'wiin',
    category: 'directions',
    example: { fr: 'Où est la médina ?', en: 'Where is the medina?', ar: 'وين المدينة ؟' },
    order: 1,
  },
  {
    word: { fr: 'À droite', en: 'On the right', ar: 'على اليمين' },
    pronunciation: 'aala el-yamiin',
    category: 'directions',
    order: 2,
  },
  {
    word: { fr: 'À gauche', en: 'On the left', ar: 'على اليسار' },
    pronunciation: 'aala el-yasaar',
    category: 'directions',
    order: 3,
  },
  {
    word: { fr: 'Tout droit', en: 'Straight ahead', ar: 'طول' },
    pronunciation: 'tool',
    category: 'directions',
    order: 4,
  },
  {
    word: { fr: 'Loin / Près', en: 'Far / Near', ar: 'بعيد / قريب' },
    pronunciation: 'baeed / qareeb',
    category: 'directions',
    order: 5,
  },

  // ─── Shopping ────────────────────────────────────────────
  {
    word: { fr: 'Combien ?', en: 'How much?', ar: 'بقداش ؟' },
    pronunciation: 'beqaddech',
    category: 'shopping',
    example: { fr: 'Combien ça coûte ?', en: 'How much does it cost?', ar: 'بقداش هذا ؟' },
    order: 1,
  },
  {
    word: { fr: "C'est cher", en: "It's expensive", ar: 'غالي' },
    pronunciation: 'ghaali',
    category: 'shopping',
    order: 2,
  },
  {
    word: { fr: 'Pas cher', en: 'Cheap', ar: 'رخيص' },
    pronunciation: 'rkhees',
    category: 'shopping',
    order: 3,
  },
  {
    word: { fr: 'Je veux acheter', en: 'I want to buy', ar: 'نحب نشري' },
    pronunciation: 'nheb nechri',
    category: 'shopping',
    order: 4,
  },

  // ─── Nourriture ──────────────────────────────────────────
  {
    word: { fr: 'Eau', en: 'Water', ar: 'ماء' },
    pronunciation: 'maa',
    category: 'food',
    order: 1,
  },
  {
    word: { fr: 'Pain', en: 'Bread', ar: 'خبز' },
    pronunciation: 'khobz',
    category: 'food',
    order: 2,
  },
  {
    word: { fr: 'Café', en: 'Coffee', ar: 'قهوة' },
    pronunciation: 'qahwa',
    category: 'food',
    order: 3,
  },
  {
    word: { fr: "J'ai faim", en: "I'm hungry", ar: 'جعت' },
    pronunciation: 'jaayet',
    category: 'food',
    order: 4,
  },
  {
    word: { fr: "L'addition", en: 'The bill', ar: 'الحساب' },
    pronunciation: 'el-hsaab',
    category: 'food',
    order: 5,
  },

  // ─── Urgence ─────────────────────────────────────────────
  {
    word: { fr: 'Au secours !', en: 'Help!', ar: 'النجدة !' },
    pronunciation: 'en-najda',
    category: 'emergency',
    order: 1,
  },
  {
    word: { fr: 'Police', en: 'Police', ar: 'البوليس' },
    pronunciation: 'el-buulees',
    category: 'emergency',
    order: 2,
  },
  {
    word: { fr: 'Hôpital', en: 'Hospital', ar: 'مستشفى' },
    pronunciation: 'mostachfa',
    category: 'emergency',
    order: 3,
  },
  {
    word: { fr: "J'ai mal", en: 'I am in pain', ar: 'يوجعني' },
    pronunciation: 'youjeani',
    category: 'emergency',
    order: 4,
  },

  // ─── Nombres ─────────────────────────────────────────────
  { word: { fr: 'Un', en: 'One', ar: 'واحد' }, pronunciation: 'wahed', category: 'numbers', order: 1 },
  { word: { fr: 'Deux', en: 'Two', ar: 'اثنين' }, pronunciation: 'zooz', category: 'numbers', order: 2 },
  { word: { fr: 'Trois', en: 'Three', ar: 'ثلاثة' }, pronunciation: 'tlatha', category: 'numbers', order: 3 },
  { word: { fr: 'Quatre', en: 'Four', ar: 'أربعة' }, pronunciation: 'arba', category: 'numbers', order: 4 },
  { word: { fr: 'Cinq', en: 'Five', ar: 'خمسة' }, pronunciation: 'khamsa', category: 'numbers', order: 5 },
  { word: { fr: 'Dix', en: 'Ten', ar: 'عشرة' }, pronunciation: 'aachra', category: 'numbers', order: 6 },
  { word: { fr: 'Cent', en: 'Hundred', ar: 'مية' }, pronunciation: 'mya', category: 'numbers', order: 7 },

  // ─── Temps ───────────────────────────────────────────────
  { word: { fr: 'Aujourd\'hui', en: 'Today', ar: 'اليوم' }, pronunciation: 'el-yoom', category: 'time', order: 1 },
  { word: { fr: 'Demain', en: 'Tomorrow', ar: 'غدوة' }, pronunciation: 'ghodwa', category: 'time', order: 2 },
  { word: { fr: 'Hier', en: 'Yesterday', ar: 'البارح' }, pronunciation: 'el-baareh', category: 'time', order: 3 },
];
