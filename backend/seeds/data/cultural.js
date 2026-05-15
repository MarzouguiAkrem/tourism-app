module.exports = [
  // ─── Coutumes / Etiquette ─────────────────────────────────
  {
    type: 'etiquette',
    title: {
      fr: 'Saluer en Tunisie',
      en: 'Greetings in Tunisia',
      ar: 'التحية في تونس',
    },
    summary: {
      fr: 'Une poignée de main et un sourire suffisent ; on se serre la main avec la droite.',
      en: 'A handshake and a smile go a long way; always shake with the right hand.',
      ar: 'مصافحة وابتسامة تكفيان؛ يُصافَح باليد اليمنى.',
    },
    content: {
      fr: 'Entre hommes, la poignée de main est universelle. Entre hommes et femmes, attendez que la femme tende la main en premier — beaucoup de Tunisiennes préfèrent un salut verbal ou poser la main sur le cœur. Entre proches, deux ou trois bises sur la joue sont courantes.',
      en: 'Among men, handshakes are universal. With women, wait for her to extend her hand — many Tunisian women prefer a verbal greeting or a hand on the heart. Among close friends, two or three cheek kisses are common.',
      ar: 'بين الرجال المصافحة شائعة. مع النساء، انتظر أن تمد المرأة يدها أولاً، فبعضهن يفضلن التحية الشفهية أو وضع اليد على القلب.',
    },
    tags: ['greeting', 'social'],
    order: 1,
  },
  {
    type: 'etiquette',
    title: {
      fr: 'Tenue dans les lieux religieux',
      en: 'Dress in religious sites',
      ar: 'اللباس في الأماكن الدينية',
    },
    summary: {
      fr: 'Épaules et genoux couverts dans les mosquées ; un foulard pour les femmes.',
      en: 'Cover shoulders and knees in mosques; women should bring a headscarf.',
      ar: 'تغطية الكتفين والركبتين في المساجد، والمرأة تحضر وشاحًا.',
    },
    content: {
      fr: 'Les non-musulmans sont rarement autorisés à entrer dans les mosquées sauf Kairouan, Zitouna (cour seulement) et quelques autres. Toujours retirer les chaussures à l\'entrée et ne jamais traverser une rangée de personnes en prière.',
      en: 'Non-Muslims are generally not allowed inside mosques except in Kairouan, Zitouna (courtyard only) and a few others. Always remove shoes at the entrance and never walk in front of someone praying.',
      ar: 'لا يُسمح لغير المسلمين بدخول معظم المساجد. اخلع الحذاء عند الدخول ولا تمر أمام المصلين.',
    },
    tags: ['religious', 'mosque', 'dress'],
    order: 2,
  },
  {
    type: 'etiquette',
    title: {
      fr: 'Marchander dans les souks',
      en: 'Bargaining in the souks',
      ar: 'المساومة في الأسواق',
    },
    summary: {
      fr: 'Le marchandage est attendu et fait partie du folklore.',
      en: 'Bargaining is expected and is part of the experience.',
      ar: 'المساومة متوقعة وجزء من الثقافة.',
    },
    content: {
      fr: 'Comptez démarrer à 30-50% du prix annoncé et négocier avec le sourire. Si on ne s\'entend pas, partir poliment fait souvent baisser le prix. Évitez de marchander si vous n\'avez aucune intention d\'acheter.',
      en: 'Start at 30–50% of the asked price and negotiate with a smile. Walking away politely often brings the price down. Don\'t bargain if you don\'t intend to buy.',
      ar: 'ابدأ بـ 30-50% من السعر المطلوب وتفاوض بابتسامة. لا تساوم إن لم تكن جادًا في الشراء.',
    },
    tags: ['shopping', 'social'],
    order: 3,
  },

  // ─── Traditions ──────────────────────────────────────────
  {
    type: 'tradition',
    title: {
      fr: 'Le thé à la menthe',
      en: 'Mint tea',
      ar: 'الشاي بالنعناع',
    },
    summary: {
      fr: 'Symbole d\'hospitalité, refuser un thé est mal vu.',
      en: 'A symbol of hospitality — refusing tea is impolite.',
      ar: 'رمز الضيافة، ورفضه يعتبر قلة أدب.',
    },
    content: {
      fr: 'Le thé vert à la menthe et aux pignons est servi tout au long de la journée. Il se boit en trois services : le premier "amer comme la vie", le second "doux comme l\'amour", le troisième "léger comme la mort".',
      en: 'Green mint tea with pine nuts is served throughout the day, traditionally in three rounds: the first "bitter as life", the second "sweet as love", the third "light as death".',
      ar: 'الشاي الأخضر بالنعناع والصنوبر يقدم على ثلاث جولات.',
    },
    tags: ['food', 'hospitality'],
    order: 1,
  },
  {
    type: 'tradition',
    title: {
      fr: 'Le hammam',
      en: 'The hammam',
      ar: 'الحمام',
    },
    summary: {
      fr: 'Bain de vapeur traditionnel, rituel social hebdomadaire.',
      en: 'Traditional steam bath and weekly social ritual.',
      ar: 'حمام بخار تقليدي وطقس اجتماعي أسبوعي.',
    },
    content: {
      fr: 'Le hammam est un bain de vapeur public où l\'on alterne salles chaudes et froides. Les heures sont séparées hommes/femmes. Apportez un peignoir, des sandales, du savon noir (saboun beldi) et un gant (kessa).',
      en: 'The hammam is a public steam bath alternating hot and cold rooms. Hours are separated by gender. Bring a robe, sandals, black soap (saboun beldi) and an exfoliating glove (kessa).',
      ar: 'الحمام مكان عام للاستحمام بالبخار، بأوقات منفصلة للرجال والنساء.',
    },
    tags: ['wellness', 'social'],
    order: 2,
  },

  // ─── Cuisine ─────────────────────────────────────────────
  {
    type: 'cuisine',
    title: {
      fr: 'Couscous tunisien',
      en: 'Tunisian couscous',
      ar: 'الكسكسي التونسي',
    },
    summary: {
      fr: 'Plat national, servi le vendredi traditionnellement.',
      en: 'National dish, traditionally served on Fridays.',
      ar: 'الطبق الوطني، يُقدم تقليديا يوم الجمعة.',
    },
    content: {
      fr: 'Semoule de blé dur cuite à la vapeur, accompagnée de viande (agneau, poulet, poisson), de légumes (carottes, navets, citrouille, pois chiches) et d\'une sauce épicée à base d\'harissa et de tomate. À déguster avec les doigts.',
      en: 'Steamed durum-wheat semolina served with meat (lamb, chicken, fish), vegetables (carrots, turnips, pumpkin, chickpeas) and a spicy harissa-tomato broth. Traditionally eaten with the fingers.',
      ar: 'سميد القمح الصلب مع اللحم والخضار وصلصة الحريسة. يؤكل تقليديًا باليد.',
    },
    tags: ['food', 'national-dish'],
    order: 1,
  },
  {
    type: 'cuisine',
    title: {
      fr: 'Brik à l\'œuf',
      en: 'Brik with egg',
      ar: 'بريك بالبيض',
    },
    summary: {
      fr: 'Feuille croustillante fourrée d\'œuf coulant, thon, câpres.',
      en: 'Crispy pastry filled with a runny egg, tuna and capers.',
      ar: 'ورقة مقرمشة محشوة بالبيض السائل والتونة والكبار.',
    },
    content: {
      fr: 'Le brik se déguste sans couverts ; l\'art consiste à mordre dedans sans faire couler le jaune. Le brik à l\'œuf est l\'entrée la plus emblématique des tables familiales tunisiennes.',
      en: 'Brik is eaten without cutlery; the trick is to bite into it without spilling the yolk. The egg brik is the most iconic starter at Tunisian family tables.',
      ar: 'يؤكل البريك باليد، والفن أن تعض دون إسالة الصفار.',
    },
    tags: ['food', 'starter'],
    order: 2,
  },
  {
    type: 'cuisine',
    title: {
      fr: 'Harissa',
      en: 'Harissa',
      ar: 'الهريسة',
    },
    summary: {
      fr: 'Pâte de piment rouge, condiment national.',
      en: 'Red chilli paste, the national condiment.',
      ar: 'معجون الفلفل الأحمر، توابل وطنية.',
    },
    content: {
      fr: 'Mélange de piments séchés, ail, sel, huile d\'olive et coriandre/carvi. Servie partout en accompagnement, l\'harissa tunisienne est inscrite au patrimoine UNESCO depuis 2022.',
      en: 'A blend of dried chillies, garlic, salt, olive oil and coriander/caraway. Served as a side everywhere, Tunisian harissa has been UNESCO-listed since 2022.',
      ar: 'خليط من الفلفل الجاف والثوم وزيت الزيتون. مدرج في تراث اليونسكو منذ 2022.',
    },
    tags: ['food', 'condiment'],
    order: 3,
  },
  {
    type: 'cuisine',
    title: {
      fr: 'Makroudh',
      en: 'Makroudh',
      ar: 'المقروض',
    },
    summary: {
      fr: 'Pâtisserie de semoule fourrée aux dattes.',
      en: 'Semolina pastry stuffed with dates.',
      ar: 'حلويات سميد محشوة بالتمر.',
    },
    content: {
      fr: 'Spécialité de Kairouan, le makroudh associe semoule, dattes et eau de fleur d\'oranger. Frit puis trempé dans le miel, c\'est la pâtisserie reine du sud tunisien.',
      en: 'A Kairouan specialty combining semolina, dates and orange-blossom water. Deep-fried and dipped in honey, it is the king of southern Tunisian pastries.',
      ar: 'حلوى من القيروان مكونة من السميد والتمر وماء الزهر.',
    },
    tags: ['food', 'dessert'],
    order: 4,
  },

  // ─── Customs ─────────────────────────────────────────────
  {
    type: 'custom',
    title: {
      fr: 'Ramadan en Tunisie',
      en: 'Ramadan in Tunisia',
      ar: 'رمضان في تونس',
    },
    summary: {
      fr: 'Mois saint où les rythmes du pays changent en profondeur.',
      en: 'Holy month that reshapes daily rhythms across the country.',
      ar: 'شهر مقدس تتغير فيه إيقاعات الحياة اليومية.',
    },
    content: {
      fr: 'Pendant le mois lunaire de Ramadan, la majorité des Tunisiens jeûne du lever au coucher du soleil. Restaurants ouverts plus tard, ftour familial au coucher, et nuits animées jusqu\'au shour. Évitez de manger/boire ostensiblement en public le jour.',
      en: 'During the lunar month of Ramadan, most Tunisians fast from sunrise to sunset. Restaurants open later, family iftar at sunset, and lively nights until shour. Avoid eating or drinking conspicuously in public during the day.',
      ar: 'يصوم معظم التونسيين من الفجر إلى الغروب. تجنب الأكل علنًا في الشارع.',
    },
    tags: ['religious', 'social', 'season'],
    order: 1,
  },
  {
    type: 'custom',
    title: {
      fr: 'Le mariage tunisien',
      en: 'Tunisian wedding',
      ar: 'العرس التونسي',
    },
    summary: {
      fr: 'Sept jours de festivités, chacun avec son rituel.',
      en: 'Seven days of festivities, each with its own ritual.',
      ar: 'سبعة أيام من الاحتفالات لكل منها طقسه.',
    },
    content: {
      fr: 'Du hammam et du henné jusqu\'à la cérémonie finale, le mariage tunisien est un spectacle communautaire. Si vous êtes invité, prévoyez une tenue élégante et un cadeau monétaire ou en or.',
      en: 'From hammam and henna to the final ceremony, a Tunisian wedding is a community spectacle. If invited, dress elegantly and bring a cash or gold gift.',
      ar: 'حدث جماعي يستمر أيامًا. ارتدِ ثوبًا أنيقًا وأحضر هدية.',
    },
    tags: ['social', 'family'],
    order: 2,
  },
];
