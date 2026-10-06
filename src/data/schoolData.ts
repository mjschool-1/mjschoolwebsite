export interface NavItem {
  name: string;
  href: string;
  children?: { name: string; href: string }[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '#home' },
  {
    name: 'About Us',
    href: '#about-school',
    children: [
      { name: 'About School', href: '#about-school' },
      { name: 'Vision, Mission & Values', href: '#vision-mission' },
      { name: "Principal's Message", href: '#principal-message' },
    ],
  },
  {
    name: 'Admissions',
    href: '#admissions',
    children: [
      { name: 'Fee Structure', href: '#fee-structure' },
      { name: 'Admission Procedure 2025-26', href: '#admissions' },
      { name: 'Online Registration Form', href: '#admission-form' },
    ],
  },
  { name: 'Notices and Circulars', href: '#notices' },
  { name: 'Contact Us', href: '#contact' },
];

export const FEE_STRUCTURE_DATA = [
  {
    category: 'Pre-Primary',
    grades: 'Nursery, Jr. KG, Sr. KG',
    admissionFee: 15000,
    annualCharges: 18500,
    tuitionFeePerQuarter: 14500,
    activityAndLabFee: 6000,
    totalAnnual: 82500,
    includes: ['Montessori kit', 'Activity materials', 'Smart classes', 'Medical care', 'Music & Dance'],
  },
  {
    category: 'Foundational / Primary',
    grades: 'Grade I to Grade V',
    admissionFee: 15000,
    annualCharges: 21000,
    tuitionFeePerQuarter: 16800,
    activityAndLabFee: 8500,
    totalAnnual: 96700,
    includes: ['IT & Coding lab', 'Library subscription', 'Sports coaching', 'Worksheets & LMS portal', 'First Aid'],
  },
  {
    category: 'Middle School',
    grades: 'Grade VI to Grade VIII',
    admissionFee: 15000,
    annualCharges: 23500,
    tuitionFeePerQuarter: 18900,
    activityAndLabFee: 10500,
    totalAnnual: 109600,
    includes: ['Science labs (Phy/Chem/Bio)', 'Robotics & AI Lab', 'Clubs & SUPW', 'Annual Sports meet kit'],
  },
  {
    category: 'Secondary School',
    grades: 'Grade IX & Grade X (CBSE)',
    admissionFee: 15000,
    annualCharges: 25000,
    tuitionFeePerQuarter: 21200,
    activityAndLabFee: 12000,
    totalAnnual: 121800,
    includes: ['CBSE Registration & Pre-Board materials', 'Advanced Science labs', 'Career counseling & aptitude tests'],
  },
  {
    category: 'Senior Secondary (Science)',
    grades: 'Grade XI & Grade XII (PCM / PCB / PCMB)',
    admissionFee: 18000,
    annualCharges: 28000,
    tuitionFeePerQuarter: 24500,
    activityAndLabFee: 16000,
    totalAnnual: 142000,
    includes: ['Integrated competitive prep guidance', 'High-end specialized labs', 'Practical journals', 'CBSE Project mentorship'],
  },
  {
    category: 'Senior Secondary (Commerce & Arts)',
    grades: 'Grade XI & Grade XII (Commerce / Humanities)',
    admissionFee: 18000,
    annualCharges: 26000,
    tuitionFeePerQuarter: 22800,
    activityAndLabFee: 11000,
    totalAnnual: 128200,
    includes: ['Economics & Accounts workshops', 'Virtual Stock Trading Lab', 'Humanities seminars', 'Field research'],
  },
];

export const FLASH_NEWS = [
  'Admissions Open for Academic Session 2025-26: Registrations for Nursery to Grade IX and Grade XI (Science / Commerce / Humanities) are now live.',
  'MJ School achieves 100% distinction in CBSE Class X & XII Board Examinations with 28 state rank holders.',
  'Annual Inter-School Cultural & Tech Fest "SPARK 2025" to be held on 24th & 25th November. Register now.',
  'CBSE Expression Series on Viksit Bharat: Participation open for Grades 3 to 12. Submit entries at library desk.',
  'Parent-Teacher Interaction (PTM) for Term II scheduled for this Saturday from 09:00 AM to 12:30 PM.',
];

export const NOTICES_LIST = [
  {
    id: 1,
    title: 'Admission Schedule & Verification Guidelines for Session 2025-26',
    date: 'Oct 04, 2025',
    category: 'Admissions',
    isNew: true,
  },
  {
    id: 2,
    title: 'Datesheet for Half-Yearly Examinations - Grade VI to XII',
    date: 'Sep 28, 2025',
    category: 'Exams',
    isNew: true,
  },
  {
    id: 3,
    title: 'Circular: Revised Winter Uniform Guidelines effective November 1st',
    date: 'Sep 22, 2025',
    category: 'Circular',
    isNew: false,
  },
  {
    id: 4,
    title: 'Annual Sports Day 2025 Selection Trials & Schedule',
    date: 'Sep 15, 2025',
    category: 'Sports',
    isNew: false,
  },
  {
    id: 5,
    title: 'Robotics & AI Innovation Expo - Call for Student Projects',
    date: 'Sep 10, 2025',
    category: 'Academic',
    isNew: false,
  },
];

export const HERO_SLIDES = [
  {
    id: 1,
    title: 'Nurturing Lifelong Learners, Shaping Future Leaders',
    subtitle: 'Inspired by the high academic legacy of Kalyan, offering world-class CBSE education with modern values and state-of-the-art facilities.',
    tag: 'Admissions Open 2025-26',
    ctaText: 'Apply for Admission',
    ctaHref: '#admissions',
    secondaryCta: 'Fee Structure',
    secondaryHref: '#fee-structure',
    desktopImage: '/hero-desktop.png',
    mobileImage: '/hero-mobile.png',
  },
  {
    id: 2,
    title: 'Cutting-Edge Laboratories & STEM Innovation Centers',
    subtitle: 'Hands-on practical education in dedicated Physics, Chemistry, Biology, Robotics and 3D Visualizer Labs for future scientists.',
    tag: 'Academic Excellence',
    ctaText: 'Explore Admissions',
    ctaHref: '#admissions',
    secondaryCta: 'About MJ School',
    secondaryHref: '#about-school',
    desktopImage: '/hero-desktop.png',
    mobileImage: '/hero-mobile.png',
  },
  {
    id: 3,
    title: 'Holistic Growth: Olympic-Grade Sports & Performing Arts',
    subtitle: 'Sprawling athletic tracks, synthetic basketball courts, semi-olympic swimming pool, and fine arts auditoriums.',
    tag: 'Beyond Academics',
    ctaText: 'Apply for Admission',
    ctaHref: '#admissions',
    secondaryCta: 'About MJ School',
    secondaryHref: '#about-school',
    desktopImage: '/hero-desktop.png',
    mobileImage: '/hero-mobile.png',
  },
];
