import { useEffect, useState } from "react";
import {
  Check,
  AlertCircle,
  ChevronRight,
  X,
  Sparkles,
  Home,
  BedDouble,
  Utensils,
  Dumbbell,
  Image,
  MessageCircle,
  Calendar,
} from "lucide-react";
import HeroSection from "./sections/HeroSection";
import Section1 from "./sections/Section1";
import Section2 from "./sections/Section2";
import Section3 from "./sections/Section3";
import Section4 from "./sections/Section4";
import Section5 from "./sections/Section5";
import Section6 from "./sections/Section6";
import Section7 from "./sections/Section7";

const sections = [
  { id: "hero", label: "Hero Section", icon: Sparkles, description: "Main hero banner with title, subtitle, description, buttons and background image", badge: "Hero", component: HeroSection },
  { id: "section1", label: "Section 1 - Welcome", icon: Home, description: "Welcome to Dana section with left image and two cards", badge: "1", component: Section1 },
  { id: "section2", label: "Section 2 - Rooms", icon: BedDouble, description: "The Ridge Collection - Rooms & Suites with three cards", badge: "2", component: Section2 },
  { id: "section3", label: "Section 3 - Experiences", icon: Utensils, description: "Signature experiences with three cards", badge: "3", component: Section3 },
  { id: "section4", label: "Section 4 - Facilities", icon: Dumbbell, description: "Hotel facilities amenities list", badge: "4", component: Section4 },
  { id: "section5", label: "Section 5 - Gallery", icon: Image, description: "Moments gallery with multiple images", badge: "5", component: Section5 },
  { id: "section6", label: "Section 6 - Testimonials", icon: MessageCircle, description: "Guest words with testimonials cards", badge: "6", component: Section6 },
  { id: "section7", label: "Section 7 - Events", icon: Calendar, description: "Meetings & Events with description and button", badge: "7", component: Section7 },
];

// Default content for DANA HOTEL
const defaultContent = {
  hero: {
    title: "Welcome home",
    subtitle: "A Home Away From Home.",
    description: "DANA KIGALI HOTEL welcomes you to Kigali, Rwanda — where the warmth of African hospitality and the spirit of Dana meet the comfort of home.",
    button_text: "Reserve A stay",
    secondary_text: "discover",
    background_image: null,
  },
  section1: {
    title: "— WELCOME",
    subtitle: "Your Home Away from Home.",
    description: "DANA KIGALI HOTEL is more than just a place to stay. It is a story of family, culture, hospitality, and kindness, carried from the banks of the River Nile to the beautiful land of a thousand hills (Rwanda).",
    left_image: null,
    card1_title: "5-Star Service",
    card1_description: "Personal concierge available around the clock.",
    card2_title: "Pristine Setting",
    card2_description: "Acres of forest, valley views, and silence.",
    bottom_card_text: "25+ Years welcoming travellers from over seventy countries.",
  },
  section2: {
    title: "— THE RIDGE COLLECTION",
    subtitle: "Rooms & Suites",
    rooms: [
      { name: "Deluxe Ridge Room", description: "38m² · 2 beds · 1 bath", button_text: "Book Now" },
      { name: "Classic Double", description: "32m² · 2 beds · 1 bath", button_text: "Book Now" },
      { name: "Summit Suite", description: "50m² · 3 beds · 2 baths", button_text: "Book Now" },
    ],
  },
  section3: {
    title: "— SIGNATURE EXPERIENCES",
    subtitle: "Days that linger in memory.",
    cards: [
      { title: "Mountain Trails", description: "Guided hikes along the ridgeline at first light, with a thermos of fresh coffee." },
      { title: "Cliffside Dining", description: "Seasonal tasting menus served by candlelight above the valley." },
      { title: "Stargazing Nights", description: "A private rooftop, warm blankets, and a sky uncluttered by city light." },
    ],
  },
  section4: {
    title: "— HOTEL FACILITIES",
    subtitle: "The finest amenities, considered for you.",
    description: "Everything that defines a perfect stay — quietly available, never imposed.",
    amenities: ["Valet Parking", "24/7 Service", "Fast Wi-Fi", "Coffee Bar", "In-Room Safe", "Spa Bath"],
  },
  section5: {
    title: "— MOMENTS",
    subtitle: "A glimpse of life on the ridge.",
    gallery: [],
  },
  section6: {
    title: "— GUEST WORDS",
    subtitle: "Quiet praise, gratefully received.",
    testimonials: [
      { text: "The most considered stay we've had in years. Every detail felt intentional — and the view at dawn is unforgettable.", name: "Eleanor Vance", location: "London" },
      { text: "Quiet, refined, and warm. Hilltop reminded us why we travel in the first place.", name: "Marc Dubois", location: "Paris" },
      { text: "From the welcome tea to the turndown ritual, a masterclass in hospitality.", name: "Aiko Tanaka", location: "Kyoto" },
    ],
  },
  section7: {
    title: "— MEETINGS & EVENTS",
    description: "A warm, exquisite, and elevated space for occasions of every scale.",
    button_text: "Plan Your Event",
  },
};

export default function HomepageManager() {
  const [content, setContent] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedContent = localStorage.getItem("dana_hotel_homepage");
    if (savedContent) {
      setContent(JSON.parse(savedContent));
    } else {
      setContent(defaultContent);
    }
  }, []);

  const saveToLocalStorage = (newContent) => {
    localStorage.setItem("dana_hotel_homepage", JSON.stringify(newContent));
    setContent(newContent);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveSection = (sectionId, updatedData) => {
    const updatedContent = {
      ...content,
      [sectionId]: updatedData,
    };
    saveToLocalStorage(updatedContent);
  };

  const openSection = (sectionId) => {
    setSelectedSection(sectionId);
  };

  const closeSection = () => {
    setSelectedSection(null);
  };

  if (!content) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  // Edit Mode - Show editor for selected section
  if (selectedSection) {
    const section = sections.find(s => s.id === selectedSection);
    const SectionComponent = section.component;
    const sectionData = content[selectedSection];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={closeSection}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Edit {section.label}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {section.description}
              </p>
            </div>
          </div>
        </div>

        <SectionComponent
          data={sectionData}
          onSave={(updatedData) => handleSaveSection(selectedSection, updatedData)}
        />
      </div>
    );
  }

  // Card View - Show all sections as cards
  return (
    <div className="space-y-6">
      {saved && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-600 flex items-center gap-2">
          <Check size={16} /> Content saved successfully!
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">DANA HOTEL - Homepage Sections</h1>
          <p className="mt-1 text-sm text-slate-500">
            Click on any section card to edit its content
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((section) => {
          const Icon = section.icon;
          
          return (
            <button
              key={section.id}
              onClick={() => openSection(section.id)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <Icon size={22} />
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
                  {section.badge}
                </span>
              </div>

              <h3 className="text-[15px] font-bold text-slate-900">
                {section.label}
              </h3>

              <p className="mt-2 min-h-[38px] text-sm leading-6 text-slate-500">
                {section.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 truncate">
                  {content[section.id]?.title ? (
                    <>Title: {content[section.id].title}</>
                  ) : (
                    <span className="italic">No content yet</span>
                  )}
                </p>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-500">
                Manage Section
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">How it works</p>
            <ul className="mt-1 space-y-1 text-xs text-amber-600">
              <li>• Click on any section card to edit its content</li>
              <li>• Each section has its own editor with specific fields</li>
              <li>• Changes are saved automatically to your browser</li>
              <li>• When backend API is ready, data will be saved to the database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}