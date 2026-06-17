import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Edit2,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const APP_URL = API_URL.replace(/\/api$/, "");

const getToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
};

export default function Section3({ data, onSave }) {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— SIGNATURE EXPERIENCES",
    subtitle: "Days that linger in memory.",
    cards: [
      { title: "Mountain Trails", description: "Guided hikes along the ridgeline at first light, with a thermos of fresh coffee." },
      { title: "Cliffside Dining", description: "Seasonal tasting menus served by candlelight above the valley." },
      { title: "Stargazing Nights", description: "A private rooftop, warm blankets, and a sky uncluttered by city light." },
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

  useEffect(() => {
    fetchSectionData();
  }, []);

  const fetchSectionData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/section-three`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      console.log("Section Three API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        const cards = section.cards || [];
        
        setSectionData({
          id: section.id,
          title: section.title || "— SIGNATURE EXPERIENCES",
          subtitle: section.subtitle || "Days that linger in memory.",
          cards: cards.map((card, idx) => ({
            title: card.title || "",
            description: card.description || "",
          })),
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

  // Mark changes whenever any field is updated
  const markChanges = () => {
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const updateField = (field, value) => {
    setSectionData(prev => ({ ...prev, [field]: value }));
    markChanges();
  };

  const updateCardField = (index, field, value) => {
    const newCards = [...sectionData.cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setSectionData(prev => ({ ...prev, cards: newCards }));
    markChanges();
  };

  const startEditing = (index, field, currentValue) => {
    setEditingIndex(index);
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editValue !== undefined && editValue !== null) {
      updateCardField(editingIndex, editingField, editValue);
    }
    setEditingIndex(null);
    setEditingField(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingField(null);
    setEditValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
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
        cards: sectionData.cards,
      };

      console.log("Sending payload:", payload);

      let url, method;
      if (sectionData.id) {
        url = `${API_URL}/dana/section-three/${sectionData.id}`;
        method = "PUT";
      } else {
        url = `${API_URL}/dana/section-three`;
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
      console.log("Save response:", result);

      if (!response.ok) {
        if (result.errors) {
          setError(JSON.stringify(result.errors, null, 2));
        } else {
          setError(result.message || "Error saving section");
        }
        return;
      }

      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchSectionData();
        if (onSave) {
          onSave(result.data);
        }
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
    fetchSectionData();
    setError(null);
    setEditingIndex(null);
    setEditingField(null);
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
      {/* Header */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Section 3 - Signature Experiences</h2>
            <p className="text-sm text-gray-500">Edit the experiences cards with titles and descriptions</p>
          </div>
          <div className="flex gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                <Check size={16} /> Saved
              </span>
            )}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              <RotateCcw size={15} /> Reset
            </button>
            <button
              onClick={saveToBackend}
              disabled={!hasChanges || saving}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all ${
                hasChanges && !saving
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 cursor-pointer"
                  : "cursor-not-allowed bg-gray-300"
              }`}
            >
              {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={15} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 whitespace-pre-wrap">
          <AlertCircle size={16} className="inline mr-2" /> {error}
        </div>
      )}

      {/* Title and Subtitle */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Section Title</label>
            <input
              type="text"
              value={sectionData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Section Subtitle</label>
            <input
              type="text"
              value={sectionData.subtitle}
              onChange={(e) => updateField("subtitle", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Experience Cards */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Experience Cards ({sectionData.cards.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionData.cards.map((card, index) => (
            <div key={index} className="border rounded-xl p-4 bg-gray-50">
              {/* Card Title */}
              <div className="mb-3">
                <label className="text-xs text-gray-500 font-medium">Card {index + 1} Title</label>
                {editingIndex === index && editingField === "title" ? (
                  <div className="mt-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyPress}
                      className="w-full font-bold border rounded px-2 py-1 focus:border-amber-400 focus:outline-none"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <h4 className="font-bold text-gray-900">{card.title || "Untitled"}</h4>
                    <button
                      onClick={() => startEditing(index, "title", card.title)}
                      className="text-amber-500 hover:text-amber-600"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Card Description */}
              <div>
                <label className="text-xs text-gray-500 font-medium">Description</label>
                {editingIndex === index && editingField === "description" ? (
                  <div className="mt-1">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      rows={3}
                      className="w-full text-sm text-gray-600 border rounded px-2 py-1 focus:border-amber-400 focus:outline-none"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-start justify-between mt-1 gap-2">
                    <p className="text-sm text-gray-600 flex-1">{card.description || "No description"}</p>
                    <button
                      onClick={() => startEditing(index, "description", card.description)}
                      className="text-amber-500 hover:text-amber-600 shrink-0"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{sectionData.title}</h2>
          <p className="text-gray-500 mt-2">{sectionData.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionData.cards.map((card, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl">
              <h4 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h4>
              <p className="text-gray-600">{card.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertCircle size={16} className="text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">Tips</p>
            <ul className="mt-1 space-y-1 text-xs text-amber-600">
              <li>• Click the Edit icon next to any field to edit it</li>
              <li>• Press Enter to save, Escape to cancel</li>
              <li>• Changes are detected immediately - Save button becomes active</li>
              <li>• Click "Save Changes" to store everything in the database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}