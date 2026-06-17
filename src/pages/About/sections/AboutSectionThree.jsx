import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Edit2,
  Plus,
  Trash2,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const APP_URL = API_URL.replace(/\/api$/, "");

const getToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
};

export default function AboutSectionThree() {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— OUR HERITAGE",
    subtitle: "A legacy from the Nile to the hills.",
    timeline: [
      { period: "1800s", title: "Dana is born", description: "Dana is born in a Nubian village on the western bank of the River Nile in northern Sudan." },
      { period: "Heritage", title: "A legacy of kindness", description: "Dana becomes known for her kindness, unity, and love for family — her home welcomes all." },
      { period: "Today", title: "DANA KIGALI HOTEL opens", description: "DANA KIGALI HOTEL opens in Kigali, Rwanda, carrying her spirit into the Land of a Thousand Hills." },
      { period: "Future", title: "Welcoming the world", description: "Welcoming guests from around the world as part of the DANA family." },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newTimeline, setNewTimeline] = useState({ period: "", title: "", description: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/about/section-three`, {
        headers: { Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        setSectionData({
          id: section.id,
          title: section.title || "— OUR HERITAGE",
          subtitle: section.subtitle || "A legacy from the Nile to the hills.",
          timeline: section.timeline || [],
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching section three:", err);
      setError("Failed to load section data");
    } finally {
      setLoading(false);
    }
  };

  const markChanges = () => { setHasChanges(true); setSaved(false); setError(null); };
  const updateField = (field, value) => { setSectionData(prev => ({ ...prev, [field]: value })); markChanges(); };
  const updateTimeline = (index, field, value) => { const newTimeline = [...sectionData.timeline]; newTimeline[index] = { ...newTimeline[index], [field]: value }; setSectionData(prev => ({ ...prev, timeline: newTimeline })); markChanges(); };
  const addTimeline = () => { if (newTimeline.period.trim() && newTimeline.title.trim() && newTimeline.description.trim()) { setSectionData(prev => ({ ...prev, timeline: [...prev.timeline, { ...newTimeline }] })); setNewTimeline({ period: "", title: "", description: "" }); setShowAddForm(false); markChanges(); } };
  const removeTimeline = (index) => { const newTimeline = [...sectionData.timeline]; newTimeline.splice(index, 1); setSectionData(prev => ({ ...prev, timeline: newTimeline })); markChanges(); };
  const startEditing = (index, field, currentValue) => { setEditingIndex(index); setEditingField(field); setEditValue(currentValue); };
  const saveEdit = () => { if (editValue !== undefined && editValue !== null) { updateTimeline(editingIndex, editingField, editValue); } setEditingIndex(null); setEditingField(null); setEditValue(""); };

  const saveToBackend = async () => {
    setSaving(true); setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Please login first");
      const payload = { title: sectionData.title, subtitle: sectionData.subtitle, timeline: sectionData.timeline };
      let url, method;
      if (sectionData.id) { url = `${API_URL}/dana/about/section-three/${sectionData.id}`; method = "PUT"; }
      else { url = `${API_URL}/dana/about/section-three`; method = "POST"; }
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
          <div><h2 className="text-xl font-bold text-gray-900">About Section 3 - Our Heritage (Timeline)</h2><p className="text-sm text-gray-500">Edit the heritage timeline</p></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="mb-1 block text-sm font-medium">Section Title</label><input type="text" value={sectionData.title} onChange={(e) => updateField("title", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
          <div><label className="mb-1 block text-sm font-medium">Section Subtitle</label><input type="text" value={sectionData.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Timeline Items ({sectionData.timeline.length})</h3>
          {!showAddForm ? (<button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-600"><Plus size={14} /> Add Timeline Item</button>) : (
            <div className="flex gap-2 flex-wrap">
              <input type="text" placeholder="Period (e.g., 1800s)" value={newTimeline.period} onChange={(e) => setNewTimeline(prev => ({ ...prev, period: e.target.value }))} className="border rounded px-2 py-1 text-sm w-28" />
              <input type="text" placeholder="Title" value={newTimeline.title} onChange={(e) => setNewTimeline(prev => ({ ...prev, title: e.target.value }))} className="border rounded px-2 py-1 text-sm w-32" />
              <input type="text" placeholder="Description" value={newTimeline.description} onChange={(e) => setNewTimeline(prev => ({ ...prev, description: e.target.value }))} className="border rounded px-2 py-1 text-sm w-48" />
              <button onClick={addTimeline} className="bg-green-500 text-white px-2 py-1 rounded text-sm">Add</button>
              <button onClick={() => setShowAddForm(false)} className="bg-gray-300 px-2 py-1 rounded text-sm">Cancel</button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {sectionData.timeline.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Period */}
                {editingIndex === index && editingField === "period" ? (<input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} className="border rounded px-2 py-1 focus:border-amber-400 focus:outline-none" autoFocus />) : (
                  <div className="flex items-center justify-between"><span className="font-semibold text-amber-600">{item.period}</span><button onClick={() => startEditing(index, "period", item.period)} className="text-amber-500"><Edit2 size={14} /></button></div>
                )}
                {/* Title */}
                {editingIndex === index && editingField === "title" ? (<input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} className="border rounded px-2 py-1 focus:border-amber-400 focus:outline-none" autoFocus />) : (
                  <div className="flex items-center justify-between"><span className="font-semibold text-gray-900">{item.title}</span><button onClick={() => startEditing(index, "title", item.title)} className="text-amber-500"><Edit2 size={14} /></button></div>
                )}
                {/* Description */}
                {editingIndex === index && editingField === "description" ? (<textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} rows={2} className="border rounded px-2 py-1 focus:border-amber-400 focus:outline-none" autoFocus />) : (
                  <div className="flex items-start justify-between"><p className="text-sm text-gray-600 flex-1">{item.description}</p><button onClick={() => startEditing(index, "description", item.description)} className="text-amber-500 ml-2"><Edit2 size={14} /></button></div>
                )}
              </div>
              <button onClick={() => removeTimeline(index)} className="text-red-500 text-sm mt-2 hover:text-red-600">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-900">{sectionData.title}</h2><p className="text-amber-600 mt-2">{sectionData.subtitle}</p></div>
        <div className="space-y-6">
          {sectionData.timeline.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 border-l-4 border-amber-500 pl-6 py-2">
              <div className="md:w-32"><span className="text-amber-600 font-bold">{item.period}</span></div>
              <div><h4 className="font-bold text-gray-900">{item.title}</h4><p className="text-gray-600 text-sm">{item.description}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}