import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const APP_URL = API_URL.replace(/\/api$/, "");

const getToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
};

export default function Section7({ data, onSave }) {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— GUEST WORDS",
    subtitle: "Quiet praise, gratefully received.",
    testimonials: [
      {
        text: "The most considered stay we've had in years. Every detail felt intentional — and the view at dawn is unforgettable.",
        name: "Eleanor Vance",
        location: "London",
      },
      {
        text: "Quiet, refined, and warm. Hilltop reminded us why we travel in the first place.",
        name: "Marc Dubois",
        location: "Paris",
      },
      {
        text: "From the welcome tea to the turndown ritual, a masterclass in hospitality.",
        name: "Aiko Tanaka",
        location: "Kyoto",
      },
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
  const [newTestimonial, setNewTestimonial] = useState({
    text: "",
    name: "",
    location: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchSectionData();
  }, []);

  const fetchSectionData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/section-seven`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      console.log("Section Seven API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        setSectionData({
          id: section.id,
          title: section.title || "— GUEST WORDS",
          subtitle: section.subtitle || "Quiet praise, gratefully received.",
          testimonials: section.testimonials || [],
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching section seven:", err);
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

  const updateTestimonial = (index, field, value) => {
    const newTestimonials = [...sectionData.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setSectionData(prev => ({ ...prev, testimonials: newTestimonials }));
    markChanges();
  };

  const addTestimonial = () => {
    if (!newTestimonial.text.trim() || !newTestimonial.name.trim() || !newTestimonial.location.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setSectionData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, { ...newTestimonial }],
    }));
    setNewTestimonial({ text: "", name: "", location: "" });
    setShowAddForm(false);
    markChanges();
  };

  const removeTestimonial = (index) => {
    const newTestimonials = [...sectionData.testimonials];
    newTestimonials.splice(index, 1);
    setSectionData(prev => ({ ...prev, testimonials: newTestimonials }));
    markChanges();
  };

  const startEditing = (index, field, currentValue) => {
    setEditingIndex(index);
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editValue !== undefined && editValue !== null) {
      updateTestimonial(editingIndex, editingField, editValue);
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
        testimonials: sectionData.testimonials,
      };

      let url, method;
      if (sectionData.id) {
        url = `${API_URL}/dana/section-seven/${sectionData.id}`;
        method = "PUT";
      } else {
        url = `${API_URL}/dana/section-seven`;
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
    setShowAddForm(false);
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
            <h2 className="text-xl font-bold text-gray-900">Section 7 - Guest Testimonials</h2>
            <p className="text-sm text-gray-500">Manage guest testimonials and reviews</p>
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

      {/* Add Testimonial Button */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition"
          >
            <Plus size={16} />
            Add New Testimonial
          </button>
        ) : (
          <div className="border rounded-xl p-4 bg-amber-50">
            <h3 className="font-semibold mb-3">Add New Testimonial</h3>
            <div className="space-y-3">
              <textarea
                placeholder="Testimonial text..."
                value={newTestimonial.text}
                onChange={(e) => setNewTestimonial(prev => ({ ...prev, text: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Guest name"
                value={newTestimonial.name}
                onChange={(e) => setNewTestimonial(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Location"
                value={newTestimonial.location}
                onChange={(e) => setNewTestimonial(prev => ({ ...prev, location: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={addTestimonial}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTestimonial({ text: "", name: "", location: "" });
                  }}
                  className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-3">
          Total testimonials: {sectionData.testimonials.length}
        </p>
      </div>

      {/* Testimonials List */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Testimonials ({sectionData.testimonials.length})</h3>
        
        {sectionData.testimonials.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No testimonials yet. Click "Add New Testimonial" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {sectionData.testimonials.map((testimonial, index) => (
              <div key={index} className="border rounded-xl p-4 bg-gray-50">
                {/* Quote */}
                <div className="mb-3">
                  <label className="text-xs text-gray-500 font-medium">Quote</label>
                  {editingIndex === index && editingField === "text" ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyPress}
                      rows={3}
                      className="w-full text-gray-700 border rounded px-2 py-1 mt-1 focus:border-amber-400 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-start justify-between mt-1 gap-2">
                      <p className="text-gray-700 italic flex-1">"{testimonial.text}"</p>
                      <button
                        onClick={() => startEditing(index, "text", testimonial.text)}
                        className="text-amber-500 hover:text-amber-600 shrink-0"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="mb-3">
                  <label className="text-xs text-gray-500 font-medium">Name</label>
                  {editingIndex === index && editingField === "name" ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyPress}
                      className="w-full border rounded px-2 py-1 mt-1 focus:border-amber-400 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <button
                        onClick={() => startEditing(index, "name", testimonial.name)}
                        className="text-amber-500 hover:text-amber-600"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="mb-3">
                  <label className="text-xs text-gray-500 font-medium">Location</label>
                  {editingIndex === index && editingField === "location" ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyPress}
                      className="w-full border rounded px-2 py-1 mt-1 focus:border-amber-400 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-500 text-sm">{testimonial.location}</p>
                      <button
                        onClick={() => startEditing(index, "location", testimonial.location)}
                        className="text-amber-500 hover:text-amber-600"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => removeTestimonial(index)}
                    className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{sectionData.title}</h2>
          <p className="text-amber-600 mt-2">{sectionData.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionData.testimonials.slice(0, 6).map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl">
              <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
              <p className="font-semibold text-gray-900">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.location}</p>
            </div>
          ))}
        </div>
        {sectionData.testimonials.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No testimonials to preview. Add testimonials above.
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertCircle size={16} className="text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">Tips</p>
            <ul className="mt-1 space-y-1 text-xs text-amber-600">
              <li>• Click "Add New Testimonial" to add a new guest review</li>
              <li>• Click the Edit icon next to any field to edit it</li>
              <li>• Press Enter to save, Escape to cancel editing</li>
              <li>• Click the Delete button to remove a testimonial</li>
              <li>• Click "Save Changes" to store everything in the database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}