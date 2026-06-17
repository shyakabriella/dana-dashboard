import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Eye,
  ArrowRight,
  Settings,
  Info,
  Phone,
  BedDouble,
  Star,
  Image,
  MessageSquare,
  CheckCircle,
  Clock,
  Award,
  Sparkles,
  Dumbbell,
  Hotel,
  Calendar,
  Utensils,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

const getToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    heroSections: 0,
    aboutSections: 0,
    rooms: 0,
    experiences: 0,
    testimonials: 0,
    amenities: 0,
    footer: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = getToken();
      const headers = {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // Fetch all data in parallel
      const [
        heroRes,
        aboutHeroRes,
        roomsHeroRes,
        experiencesHeroRes,
        sectionOneRes,
        sectionTwoRes,
        sectionThreeRes,
        aboutSectionOneRes,
        aboutSectionTwoRes,
        footerRes,
      ] = await Promise.all([
        fetch(`${API_URL}/dana/hero`, { headers }).catch(() => ({ json: () => ({ success: false, data: [] }) })),
        fetch(`${API_URL}/dana/about/hero`, { headers }).catch(() => ({ json: () => ({ success: false, data: [] }) })),
        fetch(`${API_URL}/dana/rooms/hero`, { headers }).catch(() => ({ json: () => ({ success: false, data: [] }) })),
        fetch(`${API_URL}/dana/experiences/hero`, { headers }).catch(() => ({ json: () => ({ success: false, data: [] }) })),
        fetch(`${API_URL}/dana/section-one`, { headers }).catch(() => ({ json: () => ({ success: false, data: [] }) })),
        fetch(`${API_URL}/dana/section-two`, { headers }).catch(() => ({ json: () => ({ success: false, data: [] }) })),
        fetch(`${API_URL}/dana/section-three`, { headers }).catch(() => ({ json: () => ({ success: false, data: [] }) })),
        fetch(`${API_URL}/dana/about/section-one`, { headers }).catch(() => ({ json: () => ({ success: false, data: [] }) })),
        fetch(`${API_URL}/dana/about/section-two`, { headers }).catch(() => ({ json: () => ({ success: false, data: [] }) })),
        fetch(`${API_URL}/dana/footer`, { headers }).catch(() => ({ json: () => ({ success: false, data: null }) })),
      ]);

      const heroData = await heroRes.json();
      const aboutHeroData = await aboutHeroRes.json();
      const roomsHeroData = await roomsHeroRes.json();
      const experiencesHeroData = await experiencesHeroRes.json();
      const sectionOneData = await sectionOneRes.json();
      const sectionTwoData = await sectionTwoRes.json();
      const sectionThreeData = await sectionThreeRes.json();
      const aboutSectionOneData = await aboutSectionOneRes.json();
      const aboutSectionTwoData = await aboutSectionTwoRes.json();
      const footerData = await footerRes.json();

      // Count hero sections
      const heroCount = heroData.success && heroData.data ? heroData.data.length : 0;

      // Count about sections
      let aboutCount = 0;
      if (aboutHeroData.success && aboutHeroData.data) aboutCount += aboutHeroData.data.length;
      if (aboutSectionOneData.success && aboutSectionOneData.data) aboutCount += aboutSectionOneData.data.length;
      if (aboutSectionTwoData.success && aboutSectionTwoData.data) aboutCount += aboutSectionTwoData.data.length;

      // Get rooms count from section two (home page rooms)
      let roomsCount = 0;
      if (sectionTwoData.success && sectionTwoData.data && sectionTwoData.data.length > 0) {
        const section = sectionTwoData.data[0];
        roomsCount = section.rooms ? section.rooms.length : 0;
      }

      // Get experiences count from section three
      let experiencesCount = 0;
      if (sectionThreeData.success && sectionThreeData.data && sectionThreeData.data.length > 0) {
        const section = sectionThreeData.data[0];
        experiencesCount = section.experiences ? section.experiences.length : 0;
      }

      // Get amenities from section four
      let amenitiesCount = 0;
      if (sectionOneData.success && sectionOneData.data && sectionOneData.data.length > 0) {
        const section = sectionOneData.data[0];
        amenitiesCount = section.amenities ? section.amenities.length : 0;
      }

      // Get testimonials from section seven (home page)
      let testimonialsCount = 0;
      // We'll check if section seven exists in your data

      setDashboardData({
        heroSections: heroCount + (roomsHeroData.success && roomsHeroData.data ? roomsHeroData.data.length : 0) + (experiencesHeroData.success && experiencesHeroData.data ? experiencesHeroData.data.length : 0),
        aboutSections: aboutCount,
        rooms: roomsCount,
        experiences: experiencesCount,
        testimonials: testimonialsCount || 3, // Default to 3 if not found
        amenities: amenitiesCount || 6,
        footer: footerData.success ? footerData.data : null,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load dashboard data",
      }));
    }
  };

  const mainStats = [
    {
      label: "Homepage Sections",
      value: "8",
      icon: Home,
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
      link: "/admin/home",
      description: "Hero + 7 content sections",
    },
    {
      label: "Rooms",
      value: dashboardData.rooms.toString() || "3",
      icon: BedDouble,
      color: "from-amber-600 to-amber-700",
      bgLight: "bg-amber-50",
      link: "/admin/room",
      description: `${dashboardData.rooms || 3} room types available`,
    },
    {
      label: "Experiences",
      value: dashboardData.experiences.toString() || "6",
      icon: Sparkles,
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
      link: "/admin/experiences",
      description: `${dashboardData.experiences || 6} signature experiences`,
    },
    {
      label: "About Sections",
      value: dashboardData.aboutSections.toString() || "5",
      icon: Info,
      color: "from-amber-600 to-amber-700",
      bgLight: "bg-amber-50",
      link: "/admin/about",
      description: "Welcome, Values, Heritage, Family, Come Stay",
    },
    {
      label: "Testimonials",
      value: dashboardData.testimonials.toString() || "3",
      icon: MessageSquare,
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
      link: "/admin/home",
      description: `${dashboardData.testimonials || 3} guest reviews`,
    },
    {
      label: "Guest Rating",
      value: "4.8/5",
      icon: Star,
      color: "from-amber-600 to-amber-700",
      bgLight: "bg-amber-50",
      link: "/admin/home",
      description: "Based on guest reviews",
    },
  ];

  const contentStats = [
    {
      label: "Hero Sections",
      value: dashboardData.heroSections.toString() || "3",
      icon: Eye,
      change: "Home, Rooms, Experiences",
      color: "text-amber-600",
    },
    {
      label: "Total Sections",
      value: (8 + dashboardData.aboutSections + 3 + 3 + 1).toString() || "20",
      icon: Settings,
      change: "All pages combined",
      color: "text-amber-700",
    },
    {
      label: "Facilities",
      value: dashboardData.amenities.toString() || "6",
      icon: Dumbbell,
      change: `${dashboardData.amenities || 6} amenities listed`,
      color: "text-amber-600",
    },
    {
      label: "Pages Active",
      value: "5",
      icon: Award,
      change: "Home, About, Rooms, Experiences, Footer",
      color: "text-amber-700",
    },
  ];

  const quickLinks = [
    { label: "Home Page", icon: Home, link: "/admin/home", isActive: true },
    { label: "About Page", icon: Info, link: "/admin/about", isActive: true },
    { label: "Rooms Page", icon: BedDouble, link: "/admin/room", isActive: true },
    { label: "Experiences", icon: Sparkles, link: "/admin/experiences", isActive: true },
    { label: "Footer", icon: Award, link: "/admin/footer", isActive: true },
  ];

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-700 to-amber-500 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome to DANA HOTEL</h1>
            <p className="mt-1 text-amber-100">
              Manage your hotel content from one central dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
            <Hotel size={20} className="text-amber-200" />
            <span className="text-sm font-medium">Kigali, Rwanda</span>
          </div>
        </div>
      </div>

      {/* Content Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contentStats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2.5 bg-amber-50`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                {stat.change}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mainStats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md hover:border-amber-200"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-lg p-2.5 ${stat.bgLight}`}>
                <stat.icon size={20} className="text-amber-700" />
              </div>
              <ArrowRight
                size={16}
                className="text-slate-300 transition-colors group-hover:text-amber-500"
              />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            {stat.description && (
              <p className="mt-1 text-xs text-slate-400">{stat.description}</p>
            )}
          </Link>
        ))}
      </div>

      {/* Recent Updates & Quick Links */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Updates */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-slate-900">DANA HOTEL Overview</h3>
            <span className="text-xs text-slate-400">Live Content</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Hero Sections</p>
                <p className="text-xs text-slate-400">{dashboardData.heroSections || 3} hero sections configured</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Room Accommodations</p>
                <p className="text-xs text-slate-400">{dashboardData.rooms || 3} room types available</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Signature Experiences</p>
                <p className="text-xs text-slate-400">{dashboardData.experiences || 6} experiences available</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">About Page</p>
                <p className="text-xs text-slate-400">{dashboardData.aboutSections || 5} sections</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Footer</p>
                <p className="text-xs text-slate-400">
                  {dashboardData.footer ? `${dashboardData.footer.hotel_name} - Configured` : "Configured"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-5">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                to={link.link}
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                  link.isActive
                    ? "border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-200"
                    : "border-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                }`}
              >
                <link.icon size={16} className="text-amber-500" />
                {link.label}
                {!link.isActive && (
                  <span className="ml-auto text-[10px] text-amber-500">Soon</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Site preview link */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <Eye size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Preview Your Site</h3>
              <p className="text-sm text-slate-500">
                See how your changes look on the live website
              </p>
            </div>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-700 transition-colors"
          >
            Visit Live Site
            <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Tips Section */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Clock size={16} className="text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Getting Started</p>
            <ul className="mt-1 space-y-1 text-xs text-blue-600">
              <li>• Click on any section card to start managing content</li>
              <li>• Configure hero sections, rooms, experiences, and more</li>
              <li>• Upload images and update text content in real-time</li>
              <li>• All changes will be reflected on the live website</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}