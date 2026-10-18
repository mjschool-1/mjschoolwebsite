export interface NavItem {
  name: string;
  href: string;
  children?: { name: string; href: string }[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    name: 'About Us',
    href: '/about/principals-message/',
    children: [
      { name: "Principal's Message", href: '/about/principals-message/' },
      { name: 'Infrastructure', href: '/about/infrastructure/' },
      { name: 'Facilities', href: '/facilities/' },
      { name: 'Faculty & Staff', href: '/about/faculty-staff/' },
    ],
  },
  {
    name: 'Academics',
    href: '/academics/syllabus/',
    children: [
      { name: 'Syllabus', href: '/academics/syllabus/' },
      { name: 'Gallery', href: '/gallery/' },
      { name: 'Events & Activities', href: '/academics/events-activities/' },
    ],
  },
  {
    name: 'News & Notices',
    href: '/notices/',
    children: [
      { name: 'Notice Board', href: '/notices/' },
      { name: "FAQ's", href: '/faqs/' },
      { name: 'Privacy Policy', href: '/privacy-policy/' },
      { name: 'Terms & Conditions', href: '/terms-and-conditions/' },
    ],
  },
  {
    name: 'Fees & Payment Structure',
    href: '/admissions/fee-structure/',
    children: [
      { name: 'Fee Payment 2026', href: '/admissions/fee-payment-2026/' },
      { name: 'Fee Structure', href: '/admissions/fee-structure/' },
    ],
  },
];

export const ADMISSIONS_CTA = {
  name: 'Admissions 2026',
  href: '/admissions/2026/',
};

export interface FeeStructureItem {
  category: string;
  grades: string;
  tuitionFeePerQuarter?: number | null;
  otherCharges?: number | null;
  totalAnnual?: number | null;
  paymentSchedule?: string;
  includes?: string[];
}

// Official fee schedule will be populated once confirmed and published by the school
export const FEE_STRUCTURE_DATA: FeeStructureItem[] = [];

export const FLASH_NEWS = [
  'Admissions 2026 are now open!',
];

export interface NoticeItem {
  id: string | number;
  title: string;
  date: string;
  category: string;
  isNew?: boolean;
  grades: string[];
  description?: string;
  hasAttachment?: boolean;
  attachmentUrl?: string | null;
  fileSize?: string;
  isPublished?: boolean;
  displayOrder?: number;
}

export const NOTICES_LIST: NoticeItem[] = [
  {
    id: 1,
    title: 'Admission Schedule & Verification Guidelines for Session 2025-26',
    date: 'Oct 04, 2025',
    category: 'Admissions',
    isNew: true,
    grades: ['All Grades'],
    description: 'Detailed instructions regarding document submission, verification timeline, and registration confirmation for all prospective students for the upcoming academic session 2025-26.',
    hasAttachment: true,
    fileSize: '340 KB',
    isPublished: true,
    displayOrder: 1,
  },
  {
    id: 2,
    title: 'Kindergarten Rhyme & Storytelling Celebration 2025',
    date: 'Oct 01, 2025',
    category: 'Events',
    isNew: true,
    grades: ['Jr. KG', 'Sr. KG'],
    description: 'An interactive stage event celebrating early speech, recitation, and dramatic storytelling for pre-primary scholars. Parents are cordially invited to attend the morning assembly.',
    hasAttachment: true,
    fileSize: '180 KB',
    isPublished: true,
    displayOrder: 2,
  },
  {
    id: 3,
    title: 'Datesheet for Half-Yearly Examinations - Grade VI to XII',
    date: 'Sep 28, 2025',
    category: 'Exams',
    isNew: true,
    grades: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    description: 'Official schedule for the Term-I / Half-Yearly theoretical and practical examinations. Students are advised to review reporting times and syllabus portions with respective subject teachers.',
    hasAttachment: true,
    fileSize: '512 KB',
    isPublished: true,
    displayOrder: 3,
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
