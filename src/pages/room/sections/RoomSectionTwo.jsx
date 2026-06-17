import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const APP_URL = API_URL.replace(/\/api$/, "");

const getToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
};

export default function RoomSectionTwo() {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— NEED HELP CHOOSING?",
    subtitle: "Our concierge is one call away.",
    button_text: "Speak To Concierge",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/rooms/section-two`, {
        headers: { Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        setSectionData({
          id: section.id,
          title: section.title || "— NEED HELP CHOOSING?",
          subtitle: section.subtitle || "Our concierge is one call away.",
          button_text: section.button_text || "Speak To Concierge",
        });
        setHasChanges(false);
      }
    } catch (err) { console.error("Error fetching section two:", err); setError("Failed to load section data"); }
    finally { setLoading(false); }
  };

  const markChanges = () => { setHasChanges(true); setSaved(false); setError(null); };
  const updateField = (field, value) => { setSectionData(prev => ({ ...prev, [field]: value })); markChanges(); };

  const saveToBackend = async () => {
    setSaving(true); setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Please login first");

      const payload = { title: sectionData.title, subtitle: sectionData.subtitle, button_text: sectionData.button_text };
      let url, method;
      if (sectionData.id) { url = `${API_URL}/dana/rooms/section-two/${sectionData.id}`; method = "PUT"; }
      else { url = `${API_URL}/dana/rooms/section-two`; method = "POST"; }

      const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (result.success) { setHasChanges(false); setSaved(true); setTimeout(() => setSaved(false), 3000); await fetchData(); }
      else { setError(result.message || "Error saving section"); }
    } catch (err) { console.error("Save error:", err); setError(err.message || "Failed to save section"); }
    finally { setSaving(false); }
  };

  const handleReset = () => { fetchData(); setError(null); };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-xl font-bold text-gray-900">Section 2 - Need Help Choosing?</h2><p className="text-sm text-gray-500">Edit the call to action section</p></div>
          <div className="flex gap-3">
            {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600"><Check size={16} /> Saved</span>}
            <button onClick={handleReset} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"><RotateCcw size={15} /> Reset</button>
            <button onClick={saveToBackend} disabled={!hasChanges || saving} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all ${hasChanges && !saving ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 cursor-pointer" : "cursor-not-allowed bg-gray-300"}`}>
              {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={15} />}{saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600"><AlertCircle size={16} className="inline mr-2" /> {error}</div>}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div><label className="mb-1 block text-sm font-medium">Section Title</label><input type="text" value={sectionData.title} onChange={(e) => updateField("title", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
        <div className="mt-4"><label className="mb-1 block text-sm font-medium">Section Subtitle</label><input type="text" value={sectionData.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
        <div className="mt-4"><label className="mb-1 block text-sm font-medium">Button Text</label><input type="text" value={sectionData.button_text} onChange={(e) => updateField("button_text", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="bg-gradient-to-r from-amber-800 to-amber-600 rounded-xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">{sectionData.title}</h2>
          <p className="text-white/90 mb-6 text-lg">{sectionData.subtitle}</p>
          <button className="bg-white text-amber-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">{sectionData.button_text}</button>
        </div>
      </div>
    </div>
  );
}