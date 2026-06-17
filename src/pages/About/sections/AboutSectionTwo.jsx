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

export default function AboutSectionTwo() {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— OUR VALUES",
    subtitle: "The spirit of Dana, in everything we do.",
    values: [
      { title: "Kindness", description: "Inspired by Dana's spirit of warmth and care, we welcome every guest with genuine kindness." },
      { title: "Family", description: "Just as Dana's home was a place of togetherness, we treat every guest as part of our family." },
      { title: "Culture", description: "A rich blend of African, Nubian, Arab, and Islamic hospitality in the heart of Rwanda." },
      { title: "Home", description: "A place where everyone feels welcomed, cared for, and truly at home." },
      { title: "Comfort", description: "Comfortable accommodation designed for relaxation, peace, and memorable moments." },
      { title: "Heritage", description: "Carrying forward a legacy of hospitality from the banks of the River Nile to Kigali." },
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
  const [newValue, setNewValue] = useState({ title: "", description: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/about/section-two`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      console.log("About Section Two API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        setSectionData({
          id: section.id,
          title: section.title || "— OUR VALUES",
          subtitle: section.subtitle || "The spirit of Dana, in everything we do.",
          values: section.values || [],
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching section two:", err);
      setError("Failed to load section data");
    } finally {
      setLoading(false);
    }
  };

  const markChanges = () => {
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const updateField = (field, value) => {
    setSectionData(prev => ({ ...prev, [field]: value }));
    markChanges();
  };

  const updateValue = (index, field, value) => {
    const newValues = [...sectionData.values];
    newValues[index] = { ...newValues[index], [field]: value };
    setSectionData(prev => ({ ...prev, values: newValues }));
    markChanges();
  };

  const addValue = () => {
    if (newValue.title.trim() && newValue.description.trim()) {
      setSectionData(prev => ({
        ...prev,
        values: [...prev.values, { title: newValue.title.trim(), description: newValue.description.trim() }]
      }));
      setNewValue({ title: "", description: "" });
      setShowAddForm(false);
      markChanges();
    }
  };

  const removeValue = (index) => {
    const newValues = [...sectionData.values];
    newValues.splice(index, 1);
    setSectionData(prev => ({ ...prev, values: newValues }));
    markChanges();
  };

  const startEditing = (index, field, currentValue) => {
    setEditingIndex(index);
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editValue !== undefined && editValue !== null) {
      updateValue(editingIndex, editingField, editValue);
    }
    setEditingIndex(null);
    setEditingField(null);
    setEditValue("");
  };

  const saveToBackend = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Please login first");
      }

      const payload = {
        title: sectionData.title,
        subtitle: sectionData.subtitle,
        values: sectionData.values,
      };

      let url, method;
      if (sectionData.id) {
        url = `${API_URL}/dana/about/section-two/${sectionData.id}`;
        method = "PUT";
      } else {
        url = `${API_URL}/dana/about/section-two`;
        method = "POST";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchData();
      } else {
        setError(result.message || "Error saving section");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save section");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchData();
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">About Section 2 - Our Values</h2>
            <p className="text-sm text-gray-500">Edit the values cards</p>
          </div>
          <div className="flex gap-3">
            {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600"><Check size={16} /> Saved</span>}
            <button onClick={handleReset} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"><RotateCcw size={15} /> Reset</button>
            <button onClick={saveToBackend} disabled={!hasChanges || saving} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all ${hasChanges && !saving ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 cursor-pointer" : "cursor-not-allowed bg-gray-300"}`}>
              {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={15} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600"><AlertCircle size={16} className="inline mr-2" /> {error}</div>}

      {/* Title and Subtitle */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="mb-1 block text-sm font-medium">Section Title</label><input type="text" value={sectionData.title} onChange={(e) => updateField("title", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
          <div><label className="mb-1 block text-sm font-medium">Section Subtitle</label><input type="text" value={sectionData.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
        </div>
      </div>

      {/* Values Cards */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Values Cards ({sectionData.values.length})</h3>
          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-600"><Plus size={14} /> Add Value</button>
          ) : (
            <div className="flex gap-2">
              <input type="text" placeholder="Title" value={newValue.title} onChange={(e) => setNewValue(prev => ({ ...prev, title: e.target.value }))} className="border rounded px-2 py-1 text-sm w-40" />
              <input type="text" placeholder="Description" value={newValue.description} onChange={(e) => setNewValue(prev => ({ ...prev, description: e.target.value }))} className="border rounded px-2 py-1 text-sm w-60" />
              <button onClick={addValue} className="bg-green-500 text-white px-2 py-1 rounded text-sm">Add</button>
              <button onClick={() => setShowAddForm(false)} className="bg-gray-300 px-2 py-1 rounded text-sm">Cancel</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionData.values.map((value, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              {/* Title */}
              {editingIndex === index && editingField === "title" ? (
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} className="w-full font-bold border rounded px-2 py-1 mb-2 focus:border-amber-400 focus:outline-none" autoFocus />
              ) : (
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900">{value.title}</h4>
                  <button onClick={() => startEditing(index, "title", value.title)} className="text-amber-500"><Edit2 size={14} /></button>
                </div>
              )}
              {/* Description */}
              {editingIndex === index && editingField === "description" ? (
                <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} rows={3} className="w-full text-sm text-gray-600 border rounded px-2 py-1 mt-2 focus:border-amber-400 focus:outline-none" autoFocus />
              ) : (
                <div className="flex items-start justify-between mt-2">
                  <p className="text-sm text-gray-600 flex-1">{value.description}</p>
                  <button onClick={() => startEditing(index, "description", value.description)} className="text-amber-500 ml-2"><Edit2 size={14} /></button>
                </div>
              )}
              <button onClick={() => removeValue(index)} className="text-red-500 text-sm mt-2 hover:text-red-600">Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-900">{sectionData.title}</h2><p className="text-amber-600 mt-2">{sectionData.subtitle}</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionData.values.slice(0, 6).map((value, index) => (
            <div key={index} className="bg-amber-50 p-6 rounded-xl">
              <h4 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h4>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}