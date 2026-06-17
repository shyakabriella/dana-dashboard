import { useState } from "react";
import { Home, Heart, Clock, Users, ChevronRight, X, Sparkles, Image } from "lucide-react";
import AboutHeroSection from "./sections/AboutHeroSection";
import AboutSectionOne from "./sections/AboutSectionOne";
import AboutSectionTwo from "./sections/AboutSectionTwo";
import AboutSectionThree from "./sections/AboutSectionThree";
import AboutSectionFour from "./sections/AboutSectionFour";

// Only sections that exist
const sections = [
  {
    id: "hero",
    label: "Hero Section",
    icon: Image,
    description: "About page hero banner with background image",
    badge: "Hero",
    component: AboutHeroSection,
  },
  {
    id: "section1",
    label: "Section 1 - Welcome",
    icon: Home,
    description: "Welcome to Dana section with right image, description, and stats",
    badge: "1",
    component: AboutSectionOne,
  },
  {
    id: "section2",
    label: "Section 2 - Our Values",
    icon: Heart,
    description: "Core values of Dana",
    badge: "2",
    component: AboutSectionTwo,
  },
  {
    id: "section3",
    label: "Section 3 - Our Heritage",
    icon: Clock,
    description: "Timeline of Dana's journey",
    badge: "3",
    component: AboutSectionThree,
  },
  {
    id: "section4",
    label: "Section 4 - Our Family",
    icon: Users,
    description: "Team members with images",
    badge: "4",
    component: AboutSectionFour,
  },
];

export default function AboutManager() {
  const [selectedSection, setSelectedSection] = useState(null);

  const active = sections.find((s) => s.id === selectedSection);

  if (active) {
    const EditorComponent = active.component;
    return (
      <div className="space-y-6">
        {/* Back header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedSection(null)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X size={20} />
            </button>
            <div>
              <p className="text-xs font-medium text-amber-500 uppercase tracking-wide">
                About Page
              </p>
              <h1 className="text-xl font-bold text-slate-900">
                Edit {active.label}
              </h1>
            </div>
          </div>
        </div>

        {/* Real editor */}
        <EditorComponent />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          DANA HOTEL — About Page
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Select a section below to edit its content
        </p>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md w-full"
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
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-500">
                Manage Section
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">About Page Sections</p>
            <ul className="mt-1 space-y-1 text-xs text-amber-600">
              {sections.map((s) => (
                <li key={s.id}>
                  • <strong>{s.label}</strong> — {s.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}