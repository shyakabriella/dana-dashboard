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

export default function Section4({ data, onSave }) {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— HOTEL FACILITIES",
    subtitle: "The finest amenities, considered for you.",
    description: "Everything that defines a perfect stay — quietly available, never imposed.",
    amenities: [
      "Valet Parking",
      "24/7 Service",
      "Fast Wi-Fi",
      "Coffee Bar",
      "In-Room Safe",
      "Spa Bath",
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newAmenity, setNewAmenity] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchSectionData();
  }, []);

  const fetchSectionData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/section-four`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      console.log("Section Four API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        setSectionData({
          id: section.id,
          title: section.title || "— HOTEL FACILITIES",
          subtitle: section.subtitle || "The finest amenities, considered for you.",
          description: section.description || "Everything that defines a perfect stay — quietly available, never imposed.",
          amenities: section.amenities || [],
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching section four:", err);
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

  const updateAmenity = (index, value) => {
    const newAmenities = [...sectionData.amenities];
    newAmenities[index] = value;
    setSectionData(prev => ({ ...prev, amenities: newAmenities }));
    markChanges();
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setSectionData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity("");
      markChanges();
    }
  };

  const removeAmenity = (index) => {
    const newAmenities = [...sectionData.amenities];
    newAmenities.splice(index, 1);
    setSectionData(prev => ({ ...prev, amenities: newAmenities }));
    markChanges();
  };

  const startEditing = (index, currentValue) => {
    setEditingIndex(index);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editValue.trim() !== sectionData.amenities[editingIndex]) {
      updateAmenity(editingIndex, editValue.trim());
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingIndex !== null) {
        saveEdit();
      } else {
        addAmenity();
      }
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditValue("");
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
        description: sectionData.description,
        amenities: sectionData.amenities,
      };

      console.log("Sending payload:", payload);

      let url, method;
      if (sectionData.id) {
        url = `${API_URL}/dana/section-four/${sectionData.id}`;
        method = "PUT";
      } else {
        url = `${API_URL}/dana/section-four`;
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
    setNewAmenity("");
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
            <h2 className="text-xl font-bold text-gray-900">Section 4 - Hotel Facilities</h2>
            <p className="text-sm text-gray-500">Edit the hotel facilities amenities list</p>
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

      {/* Title, Subtitle, Description */}
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
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={sectionData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Amenities List */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Amenities ({sectionData.amenities.length})</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="New amenity..."
              className="border rounded-lg px-3 py-2 text-sm w-48 focus:border-amber-400 focus:outline-none"
            />
            <button
              onClick={addAmenity}
              className="bg-amber-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-amber-600 flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectionData.amenities.map((amenity, index) => (
            <div key={index} className="flex items-center justify-between border rounded-lg p-3 bg-gray-50">
              {editingIndex === index ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyPress}
                  className="flex-1 border rounded px-2 py-1 text-sm focus:border-amber-400 focus:outline-none"
                  autoFocus
                />
              ) : (
                <span className="text-gray-700">{amenity}</span>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => startEditing(index, amenity)}
                  className="text-amber-500 hover:text-amber-600"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => removeAmenity(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Click the edit icon to change an amenity, trash icon to delete, or use the input above to add new ones.
        </p>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{sectionData.title}</h2>
          <p className="text-amber-600 mt-2">{sectionData.subtitle}</p>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">{sectionData.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionData.amenities.map((amenity, index) => (
            <div key={index} className="bg-amber-50 p-4 rounded-xl text-center">
              <span className="text-gray-800 font-medium">{amenity}</span>
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
              <li>• Click the Edit icon next to any amenity to change it</li>
              <li>• Click the trash icon to delete an amenity</li>
              <li>• Use the input field to add new amenities</li>
              <li>• Press Enter to quickly add a new amenity</li>
              <li>• Click "Save Changes" to store everything in the database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}