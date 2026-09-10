// Official Master Repository of Agricultural Crops and Real-World Sub-Crop Varieties
// Supporting national APMC e-NAM Mandi Procurement & Minimum Support Price (MSP) operations

export interface CropVariety {
  id: string;
  name: string;
  localName?: string;
  categoryDesc?: string;
  mspRatePerQuintal: number;
  maxMoisturePct: number;
  payoutTimeline: string;
  qualityGrade: 'FAQ Standard' | 'Grade A' | 'Premium Export' | 'Standard';
  commonInStates: string[];
}

export interface MainCrop {
  id: string;
  name: string;
  teluguName: string;
  hindiName: string;
  category: 'Commercial & Cash' | 'Food Grains (Cereals)' | 'Pulses (Dals)' | 'Oilseeds' | 'Spices' | 'Fiber';
  season: 'Kharif' | 'Rabi' | 'Commercial / Annual';
  icon: string;
  defaultMsp: number;
  defaultMoisturePct: number;
  varieties: CropVariety[];
}

export const COMPREHENSIVE_CROPS: MainCrop[] = [
  {
    id: 'tobacco',
    name: 'Tobacco (तंबाकू / పొగాకు)',
    teluguName: 'పొగాకు',
    hindiName: 'तंबाकू',
    category: 'Commercial & Cash',
    season: 'Commercial / Annual',
    icon: '🍃',
    defaultMsp: 18500,
    defaultMoisturePct: 11.5,
    varieties: [
      {
        id: 'tobacco_maadu',
        name: 'Maadu (Natu / Country Sun-Cured Tobacco)',
        localName: 'నల్ల రేగడి మాడు పొగాకు (Maadu Variety)',
        categoryDesc: 'Authentic Andhra Pradesh / Guntur indigenous dark sun-cured variety for regional trade',
        mspRatePerQuintal: 16500,
        maxMoisturePct: 11.0,
        payoutTimeline: '48-72 hrs DBT (Tobacco Board APBS)',
        qualityGrade: 'FAQ Standard',
        commonInStates: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu'],
      },
      {
        id: 'tobacco_number',
        name: 'Number (Grade 1 / Lanka Leaf Tobacco)',
        localName: 'నంబర్ వన్ పొగాకు (Number 1 Grade)',
        categoryDesc: 'Heavy-bodied River Island Lanka & Northern Light Soil prime tobacco leaf',
        mspRatePerQuintal: 21500,
        maxMoisturePct: 10.5,
        payoutTimeline: '48-72 hrs DBT (Tobacco Board APBS)',
        qualityGrade: 'Premium Export',
        commonInStates: ['Andhra Pradesh', 'Telangana', 'Gujarat', 'Karnataka'],
      },
      {
        id: 'tobacco_fcv_prime',
        name: 'Flue-Cured Virginia (FCV Grade 1 - Export)',
        localName: 'ఎఫ్.సి.వి పొగాకు (FCV Virginia Leaf)',
        categoryDesc: 'High-grade lemon-yellow cured Virginia leaf strictly monitored by Tobacco Board',
        mspRatePerQuintal: 24500,
        maxMoisturePct: 10.0,
        payoutTimeline: '24-48 hrs DBT (Tobacco Board)',
        qualityGrade: 'Premium Export',
        commonInStates: ['Andhra Pradesh', 'Karnataka', 'Telangana'],
      },
      {
        id: 'tobacco_burley',
        name: 'Burley Tobacco (Light Air-Cured)',
        localName: 'బర్లీ పొగాకు (Air Cured)',
        categoryDesc: 'Light air-cured cigarette blend leaf with low nicotine and high filling capacity',
        mspRatePerQuintal: 14800,
        maxMoisturePct: 12.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Standard',
        commonInStates: ['Andhra Pradesh', 'Karnataka', 'Maharashtra'],
      },
      {
        id: 'tobacco_bidi',
        name: 'Bidi Tobacco (Anand / Nipani / Gujarat)',
        localName: 'బీడీ పొగాకు (Bidi Leaf)',
        categoryDesc: 'Crushed and flakes variety with characteristic spangles and high nicotine',
        mspRatePerQuintal: 12800,
        maxMoisturePct: 10.5,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'FAQ Standard',
        commonInStates: ['Gujarat', 'Karnataka', 'Maharashtra', 'Andhra Pradesh'],
      },
    ],
  },
  {
    id: 'paddy',
    name: 'Paddy / Rice (धान / వరి)',
    teluguName: 'వరి',
    hindiName: 'धान',
    category: 'Food Grains (Cereals)',
    season: 'Kharif',
    icon: '🌾',
    defaultMsp: 2320,
    defaultMoisturePct: 17.0,
    varieties: [
      {
        id: 'paddy_sona_masoori',
        name: 'Sona Masoori (BPT 5204 / Samba Mahsuri)',
        localName: 'సోనా మసూరి (BPT 5204)',
        categoryDesc: 'Premium slender non-basmati aromatic grain grown extensively in Andhra & Telangana',
        mspRatePerQuintal: 2550,
        maxMoisturePct: 16.0,
        payoutTimeline: '48-72 hrs DBT (PFMS)',
        qualityGrade: 'Grade A',
        commonInStates: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu'],
      },
      {
        id: 'paddy_pr126',
        name: 'PR-126 (Short Duration High Yield)',
        localName: 'పి.ఆర్-126 వరి (PR-126)',
        categoryDesc: '93-day short duration paddy variety conserving groundwater, popular in North & Central India',
        mspRatePerQuintal: 2320,
        maxMoisturePct: 17.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan'],
      },
      {
        id: 'paddy_swarna',
        name: 'Swarna (MTU 7029 / Mansuri)',
        localName: 'స్వర్ణ వరి (MTU 7029)',
        categoryDesc: 'High yielding popular medium slender grain with high milling recovery rate',
        mspRatePerQuintal: 2320,
        maxMoisturePct: 17.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Andhra Pradesh', 'West Bengal', 'Odisha', 'Bihar', 'Chhattisgarh'],
      },
      {
        id: 'paddy_basmati_1121',
        name: 'Basmati 1121 (Extra Long Grain)',
        localName: 'బాస్మతి 1121 (Export Quality)',
        categoryDesc: 'World-renowned extra long slender aromatic grain with 2.5x elongation ratio',
        mspRatePerQuintal: 3850,
        maxMoisturePct: 14.0,
        payoutTimeline: '24-48 hrs DBT',
        qualityGrade: 'Premium Export',
        commonInStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Uttarakhand'],
      },
      {
        id: 'paddy_ir64',
        name: 'IR-64 (Standard Long Grain)',
        localName: 'ఐ.ఆర్-64 వరి (IR-64)',
        categoryDesc: 'Standard public distribution and buffer stock non-basmati rice grain',
        mspRatePerQuintal: 2300,
        maxMoisturePct: 17.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'FAQ Standard',
        commonInStates: ['Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Odisha', 'West Bengal'],
      },
      {
        id: 'paddy_kerala_matta',
        name: 'Palakkadan Matta (Jyothi / Uma MO-16 Red Rice)',
        localName: 'പാലക്കാടൻ മട്ട അരി (Uma MO-16)',
        categoryDesc: 'Rich nutrient coarse red parboiled rice grown in Palakkad, Alappuzha & Thrissur',
        mspRatePerQuintal: 2820,
        maxMoisturePct: 17.0,
        payoutTimeline: '48-72 hrs DBT (Supplyco / APBS)',
        qualityGrade: 'Grade A',
        commonInStates: ['Kerala', 'Tamil Nadu'],
      },
    ],
  },
  {
    id: 'chilli',
    name: 'Chilli / Red Pepper (मिर्च / మిరప)',
    teluguName: 'మిరప',
    hindiName: 'लाल मिर्च',
    category: 'Spices',
    season: 'Commercial / Annual',
    icon: '🌶️',
    defaultMsp: 18500,
    defaultMoisturePct: 10.0,
    varieties: [
      {
        id: 'chilli_guntur_sannam',
        name: 'Guntur Sannam (S4 Variety - GI Tagged)',
        localName: 'గుంటూరు సన్నం మిరప (Guntur S4)',
        categoryDesc: 'World famous fiery red chilli with high capsaicin content from Guntur Market Yard',
        mspRatePerQuintal: 19800,
        maxMoisturePct: 9.5,
        payoutTimeline: '24-48 hrs DBT (Spices Board)',
        qualityGrade: 'Premium Export',
        commonInStates: ['Andhra Pradesh', 'Telangana'],
      },
      {
        id: 'chilli_teja',
        name: 'Teja Chilli (Export Ultra Hot S17)',
        localName: 'తేజ మిరప (Teja Hot)',
        categoryDesc: 'High pungency small slender export chilli with sharp flavor profile',
        mspRatePerQuintal: 22400,
        maxMoisturePct: 9.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Premium Export',
        commonInStates: ['Andhra Pradesh', 'Telangana', 'Karnataka'],
      },
      {
        id: 'chilli_byadgi',
        name: 'Byadagi (Deep Red Color / Low Pungency)',
        localName: 'బ్యాడగి మిరప (Byadagi Oil Rich)',
        categoryDesc: 'Deep wrinkly red chilli used primarily for natural food oleoresin and coloring',
        mspRatePerQuintal: 26000,
        maxMoisturePct: 10.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Premium Export',
        commonInStates: ['Karnataka', 'Andhra Pradesh', 'Maharashtra'],
      },
    ],
  },
  {
    id: 'cotton',
    name: 'Cotton (कपास / పత్తి)',
    teluguName: 'పత్తి',
    hindiName: 'कपास',
    category: 'Fiber',
    season: 'Kharif',
    icon: '☁️',
    defaultMsp: 7121,
    defaultMoisturePct: 8.0,
    varieties: [
      {
        id: 'cotton_bt_long',
        name: 'BT Cotton (Long Staple 29.5-30.5mm)',
        localName: 'బి.టి పత్తి (Long Staple BT)',
        categoryDesc: 'High tenacity long staple bollgard cotton procured via Cotton Corporation of India (CCI)',
        mspRatePerQuintal: 7521,
        maxMoisturePct: 8.0,
        payoutTimeline: '48-72 hrs DBT (CCI Portal)',
        qualityGrade: 'Grade A',
        commonInStates: ['Andhra Pradesh', 'Telangana', 'Gujarat', 'Maharashtra', 'Haryana', 'Punjab'],
      },
      {
        id: 'cotton_med_staple',
        name: 'Medium Staple Cotton (24.5-25.5mm)',
        localName: 'మధ్యమ పత్తి (Medium Staple)',
        categoryDesc: 'Standard spinning mill grade cotton with good ginning outturn percentage',
        mspRatePerQuintal: 7121,
        maxMoisturePct: 8.5,
        payoutTimeline: '48-72 hrs DBT (CCI)',
        qualityGrade: 'FAQ Standard',
        commonInStates: ['Andhra Pradesh', 'Karnataka', 'Madhya Pradesh', 'Rajasthan'],
      },
      {
        id: 'cotton_suvin',
        name: 'Suvin / Extra Long Staple (ELS 38mm)',
        localName: 'సువిన్ ప్రీమియం పత్తి (Suvin ELS)',
        categoryDesc: 'Finest extra long staple luxury cotton variety termed Indian Egyptian Sea-Island',
        mspRatePerQuintal: 11200,
        maxMoisturePct: 7.5,
        payoutTimeline: '24-48 hrs DBT',
        qualityGrade: 'Premium Export',
        commonInStates: ['Tamil Nadu', 'Andhra Pradesh', 'Gujarat'],
      },
    ],
  },
  {
    id: 'wheat',
    name: 'Wheat (गेहूं / గోధుమ)',
    teluguName: 'గోధుమ',
    hindiName: 'गेहूं',
    category: 'Food Grains (Cereals)',
    season: 'Rabi',
    icon: '🌾',
    defaultMsp: 2425,
    defaultMoisturePct: 12.0,
    varieties: [
      {
        id: 'wheat_sharbati',
        name: 'Sharbati Gold (Sehore Malwa Grain)',
        localName: 'షర్బతి గోల్డెన్ గోధుమ (Sharbati)',
        categoryDesc: 'Sun-drenched heavy lustrous golden grain with highest protein & gluten sweetness',
        mspRatePerQuintal: 2850,
        maxMoisturePct: 11.5,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Madhya Pradesh', 'Rajasthan', 'Gujarat'],
      },
      {
        id: 'wheat_hd2967',
        name: 'HD-2967 (Pusa Wheat / High Yield)',
        localName: 'హెచ్.డి-2967 గోధుమ (HD-2967)',
        categoryDesc: 'Flagship semi-dwarf amber grain variety resistant to rust diseases for FCI buffer pools',
        mspRatePerQuintal: 2425,
        maxMoisturePct: 12.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'FAQ Standard',
        commonInStates: ['Haryana', 'Punjab', 'Uttar Pradesh', 'Bihar', 'Rajasthan'],
      },
      {
        id: 'wheat_hd3086',
        name: 'HD-3086 (Pusa Gautami / Chapati Specialist)',
        localName: 'హెచ్.డి-3086 గోధుమ (HD-3086)',
        categoryDesc: 'Superior bread and chapati baking characteristics with high hectolitre weight',
        mspRatePerQuintal: 2425,
        maxMoisturePct: 12.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Haryana', 'Punjab', 'Uttar Pradesh', 'Madhya Pradesh'],
      },
    ],
  },
  {
    id: 'groundnut',
    name: 'Groundnut / Peanut (मूंगफली / వేరుశనగ)',
    teluguName: 'వేరుశనగ',
    hindiName: 'मूंगफली',
    category: 'Oilseeds',
    season: 'Kharif',
    icon: '🥜',
    defaultMsp: 6783,
    defaultMoisturePct: 8.0,
    varieties: [
      {
        id: 'groundnut_kadiri',
        name: 'Kadiri-6 / Kadiri-9 (K-6 / K-9 Semi-Spreading)',
        localName: 'కదిరి-6 వేరుశనగ (Kadiri Variety)',
        categoryDesc: 'Premier Rayalaseema (Anantapur, Kurnool, Kadapa) high oil yielding bold pod variety',
        mspRatePerQuintal: 6950,
        maxMoisturePct: 8.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu'],
      },
      {
        id: 'groundnut_tag24',
        name: 'TAG-24 (Trombay Spanish Bunch)',
        localName: 'టి.ఎ.జి-24 వేరుశనగ (TAG-24)',
        categoryDesc: 'Early maturing bunch variety with high shelling percentage and 51% oil content',
        mspRatePerQuintal: 6783,
        maxMoisturePct: 8.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'FAQ Standard',
        commonInStates: ['Gujarat', 'Maharashtra', 'Andhra Pradesh', 'Rajasthan'],
      },
    ],
  },
  {
    id: 'gram_chickpea',
    name: 'Gram / Chickpea / Chana (चना / శనగలు)',
    teluguName: 'శనగలు',
    hindiName: 'चना',
    category: 'Pulses (Dals)',
    season: 'Rabi',
    icon: '🥣',
    defaultMsp: 5440,
    defaultMoisturePct: 12.0,
    varieties: [
      {
        id: 'gram_desi_jg11',
        name: 'Desi Chana (JG-11 / Annigeri)',
        localName: 'దేశీ శనగలు (JG-11)',
        categoryDesc: 'Tolerant to terminal drought, widely harvested in Andhra Pradesh, Karnataka and MP',
        mspRatePerQuintal: 5440,
        maxMoisturePct: 12.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Andhra Pradesh', 'Karnataka', 'Madhya Pradesh', 'Maharashtra'],
      },
      {
        id: 'gram_kabuli_dollar',
        name: 'Kabuli Chana (Dollar / KAK-2 Extra Bold)',
        localName: 'కాబూలీ డాలర్ శనగలు (Dollar Chana)',
        categoryDesc: 'Giant white chickpea with great culinary export demand and high test weight',
        mspRatePerQuintal: 8400,
        maxMoisturePct: 10.0,
        payoutTimeline: '24-48 hrs DBT',
        qualityGrade: 'Premium Export',
        commonInStates: ['Madhya Pradesh', 'Andhra Pradesh', 'Maharashtra', 'Rajasthan'],
      },
    ],
  },
  {
    id: 'maize',
    name: 'Maize / Corn (मक्का / మొక్కజొన్న)',
    teluguName: 'మొక్కజొన్న',
    hindiName: 'मक्का',
    category: 'Food Grains (Cereals)',
    season: 'Kharif',
    icon: '🌽',
    defaultMsp: 2090,
    defaultMoisturePct: 14.0,
    varieties: [
      {
        id: 'maize_yellow_dent',
        name: 'Yellow Dent Corn (Feed & Starch Grade)',
        localName: 'పసుపు మొక్కజొన్న (Yellow Hybrid)',
        categoryDesc: 'Hard yellow kernels utilized for poultry feed formulation, bioethanol, and starch industrial processing',
        mspRatePerQuintal: 2090,
        maxMoisturePct: 14.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'FAQ Standard',
        commonInStates: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Bihar', 'Madhya Pradesh'],
      },
      {
        id: 'maize_pusa_hm9',
        name: 'Pusa HM-9 (Quality Protein Maize - QPM)',
        localName: 'పూసా హెచ్.ఎం-9 మొక్కజొన్న (QPM)',
        categoryDesc: 'Enriched in essential amino acids (lysine and tryptophan) with high grain density',
        mspRatePerQuintal: 2250,
        maxMoisturePct: 13.5,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Andhra Pradesh', 'Haryana', 'Punjab', 'Rajasthan'],
      },
    ],
  },
  {
    id: 'soybean',
    name: 'Soybean (सोयाबीन / సోయాబీన్)',
    teluguName: 'సోయాబీన్',
    hindiName: 'सोयाबीन',
    category: 'Oilseeds',
    season: 'Kharif',
    icon: '🌱',
    defaultMsp: 4892,
    defaultMoisturePct: 12.0,
    varieties: [
      {
        id: 'soybean_js9560',
        name: 'JS 95-60 (Yellow Seed / Early Maturity)',
        localName: 'జె.ఎస్ 95-60 సోయాబీన్ (JS 95-60)',
        categoryDesc: 'Short maturity variety with 20% oil and 40% protein content suitable for double-cropping',
        mspRatePerQuintal: 4892,
        maxMoisturePct: 12.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Telangana', 'Andhra Pradesh'],
      },
    ],
  },
  {
    id: 'moong',
    name: 'Moong / Green Gram (मूंग / పెసలు)',
    teluguName: 'పెసలు',
    hindiName: 'मूंग',
    category: 'Pulses (Dals)',
    season: 'Kharif',
    icon: '🥣',
    defaultMsp: 8682,
    defaultMoisturePct: 12.0,
    varieties: [
      {
        id: 'moong_samrat',
        name: 'Samrat / Pusa Vishal (Bold Shiny Green)',
        localName: 'సమ్రాట్ పెసలు (Samrat / Pusa Vishal)',
        categoryDesc: 'Bold shiny green pulse with high nutritional digestibility and quick cooking',
        mspRatePerQuintal: 8682,
        maxMoisturePct: 12.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Rajasthan', 'Andhra Pradesh', 'Karnataka', 'Madhya Pradesh', 'Maharashtra'],
      },
    ],
  },
  {
    id: 'urad',
    name: 'Urad / Black Gram (उड़द / మినుములు)',
    teluguName: 'మినుములు',
    hindiName: 'उड़द',
    category: 'Pulses (Dals)',
    season: 'Kharif',
    icon: '🥣',
    defaultMsp: 7400,
    defaultMoisturePct: 12.0,
    varieties: [
      {
        id: 'urad_lbg752',
        name: 'LBG-752 (Coastal Krishna-Godavari Black Gram)',
        localName: 'ఎల్.బి.జి-752 మినుములు (LBG-752)',
        categoryDesc: 'Premier rice fallow pulse variety famous for high batter volume and South Indian cuisine',
        mspRatePerQuintal: 7550,
        maxMoisturePct: 11.5,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Odisha'],
      },
    ],
  },
  {
    id: 'tur_arhar',
    name: 'Tur / Arhar / Pigeon Pea (अरहर / కందులు)',
    teluguName: 'కందులు',
    hindiName: 'अरहर / तूर दाल',
    category: 'Pulses (Dals)',
    season: 'Kharif',
    icon: '🥣',
    defaultMsp: 7550,
    defaultMoisturePct: 12.0,
    varieties: [
      {
        id: 'tur_asha',
        name: 'Asha (ICPL 87119 / Wilt Resistant)',
        localName: 'ఆశ కందులు (Asha ICPL-87119)',
        categoryDesc: 'Most popular high-yielding medium duration red gram pulse with bold uniform seeds',
        mspRatePerQuintal: 7550,
        maxMoisturePct: 12.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Karnataka', 'Madhya Pradesh'],
      },
    ],
  },
  {
    id: 'mustard',
    name: 'Mustard / Rapeseed (सरसों / ఆవాలు)',
    teluguName: 'ఆవాలు',
    hindiName: 'सरसों',
    category: 'Oilseeds',
    season: 'Rabi',
    icon: '🌼',
    defaultMsp: 5650,
    defaultMoisturePct: 8.0,
    varieties: [
      {
        id: 'mustard_pusa_bold',
        name: 'Pusa Bold (High Pungency & Oil Content)',
        localName: 'పూసా బోల్డ్ ఆవాలు (Pusa Bold)',
        categoryDesc: 'Large bold seeds with 42% high oil content and superior essential oil pungency',
        mspRatePerQuintal: 5650,
        maxMoisturePct: 8.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Grade A',
        commonInStates: ['Rajasthan', 'Haryana', 'Madhya Pradesh', 'Uttar Pradesh'],
      },
    ],
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (गन्ना / చెరకు)',
    teluguName: 'చెరకు',
    hindiName: 'गन्ना',
    category: 'Commercial & Cash',
    season: 'Commercial / Annual',
    icon: '🎋',
    defaultMsp: 340,
    defaultMoisturePct: 70.0,
    varieties: [
      {
        id: 'cane_co0238',
        name: 'Co-0238 (Karan 4 High Sugar Cane)',
        localName: 'సి.ఓ-0238 చెరకు (Co-0238)',
        categoryDesc: 'Revolutionary high-sucrose variety boosting sugar recovery above 12.5%',
        mspRatePerQuintal: 355,
        maxMoisturePct: 70.0,
        payoutTimeline: '14 Days Mandi Token Mill FRP',
        qualityGrade: 'Grade A',
        commonInStates: ['Uttar Pradesh', 'Haryana', 'Punjab', 'Bihar', 'Andhra Pradesh'],
      },
    ],
  },
  {
    id: 'coconut_copra',
    name: 'Coconut / Copra (नारियल / കൊപ്ര)',
    teluguName: 'కొబ్బరి',
    hindiName: 'नारियल / खोपरा',
    category: 'Commercial & Cash',
    season: 'Commercial / Annual',
    icon: '🥥',
    defaultMsp: 11160,
    defaultMoisturePct: 7.0,
    varieties: [
      {
        id: 'copra_milling',
        name: 'Milling Copra (KERAFED / NAFED FAQ Grade)',
        localName: 'മില്ലിംഗ് കൊപ്ര (Milling Copra)',
        categoryDesc: 'Well-dried clean sound kernels with high oil content for pure coconut oil extraction',
        mspRatePerQuintal: 11160,
        maxMoisturePct: 6.0,
        payoutTimeline: '48-72 hrs DBT (Supplyco / KERAFED)',
        qualityGrade: 'Grade A',
        commonInStates: ['Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh'],
      },
      {
        id: 'copra_ball',
        name: 'Ball Copra (Whole Sweet Edible Grade)',
        localName: 'ഉണ്ട കൊപ്ര (Ball Copra)',
        categoryDesc: 'Unbroken whole dried coconut kernels prized for culinary and commercial use',
        mspRatePerQuintal: 12000,
        maxMoisturePct: 7.0,
        payoutTimeline: '48-72 hrs DBT',
        qualityGrade: 'Premium Export',
        commonInStates: ['Kerala', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh'],
      },
    ],
  },
  {
    id: 'black_pepper',
    name: 'Black Pepper (काली मिर्च / കുരുമുളക്)',
    teluguName: 'మిరియాలు',
    hindiName: 'काली मिर्च',
    category: 'Spices',
    season: 'Commercial / Annual',
    icon: '🌿',
    defaultMsp: 35000,
    defaultMoisturePct: 11.0,
    varieties: [
      {
        id: 'pepper_malabar_garbled',
        name: 'Malabar Garbled Black Pepper (MG-1 GI Tagged)',
        localName: 'മലബാർ കുരുമുളക് (Malabar MG-1)',
        categoryDesc: 'GI-tagged world-famous bold aromatic black pepper berries from Idukki and Wayanad',
        mspRatePerQuintal: 38000,
        maxMoisturePct: 10.5,
        payoutTimeline: '24-48 hrs DBT (Spices Board)',
        qualityGrade: 'Premium Export',
        commonInStates: ['Kerala', 'Karnataka', 'Tamil Nadu'],
      },
      {
        id: 'pepper_tellicherry',
        name: 'Tellicherry Extra Bold (TGSEB)',
        localName: 'തലശ്ശേരി പെപ്പർ (TGSEB Grade)',
        categoryDesc: 'Highest grade large berries picked when fully mature for intense culinary aroma',
        mspRatePerQuintal: 42000,
        maxMoisturePct: 10.0,
        payoutTimeline: '24-48 hrs DBT',
        qualityGrade: 'Premium Export',
        commonInStates: ['Kerala', 'Karnataka'],
      },
    ],
  },
];

/**
 * Returns only the main crops cultivated in a specific State.
 * E.g. If Kerala is passed, returns only crops grown in Kerala (e.g. Paddy, Coconut/Copra, Black Pepper).
 * Excludes crops not cultivated in that state (e.g. Tobacco, Wheat, Cotton).
 */
export function getCropsForState(stateName: string): MainCrop[] {
  if (!stateName) return COMPREHENSIVE_CROPS;
  const filtered = COMPREHENSIVE_CROPS.filter((crop) =>
    crop.varieties.some((v) => v.commonInStates && v.commonInStates.includes(stateName))
  );
  return filtered.length > 0 ? filtered : COMPREHENSIVE_CROPS;
}

/**
 * Checks if a specific crop is cultivated in a given state.
 */
export function isCropCultivatedInState(cropId: string, stateName: string): boolean {
  if (!stateName || !cropId) return true;
  const crop = getCropById(cropId);
  if (!crop) return false;
  return crop.varieties.some((v) => v.commonInStates && v.commonInStates.includes(stateName));
}

/**
 * Helper to find main crop by ID
 */
export function getCropById(cropId: string): MainCrop | undefined {
  return COMPREHENSIVE_CROPS.find((c) => c.id.toLowerCase() === cropId.toLowerCase());
}

/**
 * Helper to find variety by crop and variety ID
 */
export function getVarietyById(cropId: string, varietyId: string): CropVariety | undefined {
  const crop = getCropById(cropId);
  return crop?.varieties.find((v) => v.id.toLowerCase() === varietyId.toLowerCase());
}

/**
 * Format full crop display name e.g. "Tobacco - Maadu (Natu Sun-Cured)"
 */
export function formatFullCropName(cropId: string, varietyId?: string): string {
  const crop = getCropById(cropId);
  if (!crop) return cropId;
  if (!varietyId) return crop.name;
  const variety = crop.varieties.find((v) => v.id.toLowerCase() === varietyId.toLowerCase());
  if (!variety) return `${crop.name} (${varietyId})`;
  return `${crop.name.split(' (')[0]} • ${variety.name}`;
}

/**
 * Accurately parses crop and variety, strictly preventing cross-crop mismatch
 * (e.g. Chilli crop paired with Tobacco Maadu variety).
 */
export function parseCropAndVariety(
  rawCropType: string = '',
  rawCropVariety?: string
): { cropName: string; varietyName: string } {
  const cropStr = (rawCropType || '').trim();
  const varietyStr = (rawCropVariety || '').trim();

  // 1. Identify which MainCrop matches the raw crop string
  let matchedCrop: MainCrop | undefined;
  for (const c of COMPREHENSIVE_CROPS) {
    const baseName = c.name.split(' (')[0].toLowerCase();
    const telugu = c.teluguName.toLowerCase();
    const hindi = c.hindiName.toLowerCase();
    const lower = cropStr.toLowerCase();

    if (
      lower.includes(c.id.toLowerCase()) ||
      lower.includes(baseName) ||
      (telugu && lower.includes(telugu)) ||
      (hindi && lower.includes(hindi))
    ) {
      matchedCrop = c;
      break;
    }
  }

  // If no main crop found by name/keywords, fallback to first crop or raw
  if (!matchedCrop) {
    // If it mentions chilli/mirchi
    if (/chilli|pepper|mirch|మిరప/i.test(cropStr)) {
      matchedCrop = COMPREHENSIVE_CROPS.find((c) => c.id === 'chilli');
    } else if (/tobacco|pogaku|तंबाकू|పొగాకు/i.test(cropStr)) {
      matchedCrop = COMPREHENSIVE_CROPS.find((c) => c.id === 'tobacco');
    } else if (/paddy|rice|dhan|వరి|धान/i.test(cropStr)) {
      matchedCrop = COMPREHENSIVE_CROPS.find((c) => c.id === 'paddy');
    } else if (/cotton|kapas|పత్తి|कपास/i.test(cropStr)) {
      matchedCrop = COMPREHENSIVE_CROPS.find((c) => c.id === 'cotton');
    }
  }

  if (matchedCrop) {
    const cropName = matchedCrop.name;

    // First check if a variety of this matched crop is mentioned inside rawCropType
    for (const v of matchedCrop.varieties) {
      const vBase = v.name.split(' (')[0].toLowerCase();
      if (cropStr.toLowerCase().includes(vBase) || cropStr.toLowerCase().includes(v.id.toLowerCase())) {
        return { cropName, varietyName: v.name };
      }
    }

    // Next check if rawCropVariety belongs to this matched crop
    if (varietyStr) {
      const foundInCrop = matchedCrop.varieties.find((v) => {
        const vBase = v.name.split(' (')[0].toLowerCase();
        return (
          v.id.toLowerCase() === varietyStr.toLowerCase() ||
          varietyStr.toLowerCase().includes(vBase) ||
          v.name.toLowerCase().includes(varietyStr.toLowerCase())
        );
      });
      if (foundInCrop) {
        return { cropName, varietyName: foundInCrop.name };
      }
      // If varietyStr was provided but belongs to another crop (e.g. Maadu on Chilli),
      // strictly DO NOT use it! Instead, pick the first authentic variety of THIS matched crop.
      return { cropName, varietyName: matchedCrop.varieties[0]?.name || 'Standard Variety' };
    }

    // Default to first authentic variety of this crop
    return { cropName, varietyName: matchedCrop.varieties[0]?.name || 'Standard Variety' };
  }

  // Fallback if not matched in COMPREHENSIVE_CROPS
  return {
    cropName: cropStr || 'Paddy (धान / వరి)',
    varietyName: varietyStr || 'Standard Variety',
  };
}

