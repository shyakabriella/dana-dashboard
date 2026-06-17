import { useState } from "react";
import { Sparkles, Mountain, Compass, ChevronRight, X } from "lucide-react";
import ExperiencesHeroSection from "./sections/ExperiencesHeroSection";
import ExperiencesSectionOne from "./sections/ExperiencesSectionOne";
import ExperiencesSectionTwo from "./sections/ExperiencesSectionTwo";

const sections = [
  { 
    id: "hero", 
    label: "Hero Section", 
    icon: Sparkles, 
    description: "Main hero banner with title, subtitle, destination and background image", 
    badge: "Hero", 
    component: ExperiencesHeroSection 
  },
  { 
    id: "section1", 
    label: "Section 1 - Six Ways to Remember", 
    icon: Mountain, 
    description: "Manage experiences cards with images and descriptions", 
    badge: "1", 
    component: ExperiencesSectionOne 
  },
  { 
    id: "section2", 
    label: "Section 2 - Begin Your Story", 
    icon: Compass, 
    description: "Call to action section with two buttons", 
    badge: "2", 
    component: ExperiencesSectionTwo 
  },
];

export default function ExperiencesManager() {
  const [selectedSection, setSelectedSection] = useState(null);

  if (selectedSection) {
    const section = sections.find(s => s.id === selectedSection);
    const SectionComponent = section.component;

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedSection(null)}
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

        <SectionComponent />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Experiences Page Sections</h1>
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
              onClick={() => setSelectedSection(section.id)}
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

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-500">
                Manage Section
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}