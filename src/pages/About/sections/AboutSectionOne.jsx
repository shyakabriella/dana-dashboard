import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
  Edit2,
  Plus,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const APP_URL = API_URL.replace(/\/api$/, "");

const getImageUrl = (path) => {
  if (!path) return null;
  let cleanPath = path;
  if (cleanPath.includes("localhost")) {
    cleanPath = cleanPath.replace("localhost", "127.0.0.1:8000");
  }
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    if (cleanPath.match(/http:\/\/127\.0\.0\.1(\/|$)/)) {
      cleanPath = cleanPath.replace("http://127.0.0.1/", "http://127.0.0.1:8000/");
    }
    return cleanPath;
  }
  if (cleanPath.startsWith("/storage/")) return `${APP_URL}${cleanPath}`;
  if (cleanPath.startsWith("storage/")) return `${APP_URL}/${cleanPath}`;
  return `${APP_URL}/storage/${cleanPath}`;
};

const getToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
};

// The complete welcome description
const DEFAULT_DESCRIPTION = `DANA KIGALI HOTEL is more than just a place to stay. It is a story of family, culture, hospitality, and kindness, carried from the banks of the River Nile to the beautiful land of a thousand hills (Rwanda).

Inspired by Dana, a remarkable woman born more than 150 years ago in a Nubian village on the western bank of the River Nile in northern Sudan, our hotel represents the true meaning of home. Dana was known for her kindness, unity, and love for family. Her home was a place where everyone felt welcomed, cared for, and treated as part of the family.

That same spirit lives on at DANA KIGALI HOTEL.

Located in Kigali, Rwanda, DANA KIGALI brings together the rich heritage of African, Nubian, Arab, and Islamic hospitality with the beauty and warmth of Rwanda. Just as Dana's home was a place of togetherness, comfort, and belonging, our hotel is designed to make every guest feel relaxed, valued, and truly at home.

Whether you are visiting Kigali for business, leisure, family travel, or a short stay, DANA KIGALI HOTEL offers a welcoming atmosphere, comfortable accommodation, and personal service inspired by deeply rooted values of hospitality and care.

For us, hospitality is beyond business. It is about welcoming you with kindness, treating you like family, and creating a stay filled with comfort, peace, and memorable moments.

At DANA KIGALI HOTEL, you are not only our guest — you are part of our family.`;

export default function AboutSectionOne() {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— WELCOME",
    subtitle: "Your Home Away from Home.",
    description: DEFAULT_DESCRIPTION,
    right_image: null,
    right_image_preview: null,
    right_image_file: null,
    card_title: "Please feel at home.",
    stats: [
      { label: "Years of heritage", value: "150+" },
      { label: "Hills of Rwanda", value: "1,000" },
      { label: "You are part of", value: "Family" }
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingStatIndex, setEditingStatIndex] = useState(null);
  const [editingStatField, setEditingStatField] = useState(null);
  const [editStatValue, setEditStatValue] = useState("");
  const [newStat, setNewStat] = useState({ label: "", value: "" });
  const [showAddStat, setShowAddStat] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/about/section-one`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      console.log("About Section One API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        const imageUrl = getImageUrl(section.right_image);
        
        setSectionData({
          id: section.id,
          title: section.title || "— WELCOME",
          subtitle: section.subtitle || "Your Home Away from Home.",
          description: section.description || DEFAULT_DESCRIPTION,
          right_image: section.right_image,
          right_image_preview: imageUrl,
          right_image_file: null,
          card_title: section.card_title || "Please feel at home.",
          stats: section.stats || [
            { label: "Years of heritage", value: "150+" },
            { label: "Hills of Rwanda", value: "1,000" },
            { label: "You are part of", value: "Family" }
          ],
        });
        setHasChanges(false);
      } else {
        // If no data in DB, use default content
        setSectionData(prev => ({
          ...prev,
          description: DEFAULT_DESCRIPTION,
        }));
      }
    } catch (err) {
      console.error("Error fetching section one:", err);
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

  const updateStat = (index, field, value) => {
    const newStats = [...sectionData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setSectionData(prev => ({ ...prev, stats: newStats }));
    markChanges();
  };

  const addStat = () => {
    if (newStat.label.trim() && newStat.value.trim()) {
      setSectionData(prev => ({
        ...prev,
        stats: [...prev.stats, { label: newStat.label.trim(), value: newStat.value.trim() }]
      }));
      setNewStat({ label: "", value: "" });
      setShowAddStat(false);
      markChanges();
    }
  };

  const removeStat = (index) => {
    const newStats = [...sectionData.stats];
    newStats.splice(index, 1);
    setSectionData(prev => ({ ...prev, stats: newStats }));
    markChanges();
  };

  const startEditingStat = (index, field, currentValue) => {
    setEditingStatIndex(index);
    setEditingStatField(field);
    setEditStatValue(currentValue);
  };

  const saveStatEdit = () => {
    if (editStatValue !== undefined && editStatValue !== null) {
      updateStat(editingStatIndex, editingStatField, editStatValue);
    }
    setEditingStatIndex(null);
    setEditingStatField(null);
    setEditStatValue("");
  };

  const handleImageUpload = (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image (JPEG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    setSectionData(prev => ({
      ...prev,
      right_image_preview: previewUrl,
      right_image_file: file,
    }));
    markChanges();
    setUploading(false);
  };

  const removeImage = () => {
    if (sectionData.right_image_preview?.startsWith('blob:')) {
      URL.revokeObjectURL(sectionData.right_image_preview);
    }
    setSectionData(prev => ({
      ...prev,
      right_image: null,
      right_image_preview: null,
      right_image_file: null,
    }));
    markChanges();
  };

  const saveToBackend = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Please login first");
      }

      const formData = new FormData();
      formData.append("title", sectionData.title);
      formData.append("subtitle", sectionData.subtitle);
      formData.append("description", sectionData.description);
      formData.append("card_title", sectionData.card_title);
      
      sectionData.stats.forEach((stat, index) => {
        formData.append(`stats[${index}][label]`, stat.label);
        formData.append(`stats[${index}][value]`, stat.value);
      });

      if (sectionData.right_image_file) {
        formData.append("right_image", sectionData.right_image_file);
      }

      let url, method;
      if (sectionData.id) {
        url = `${API_URL}/dana/about/section-one/${sectionData.id}`;
        method = "POST";
        formData.append("_method", "PUT");
      } else {
        url = `${API_URL}/dana/about/section-one`;
        method = "POST";
      }

      console.log("Saving description length:", sectionData.description.length);

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
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
      {/* Header */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">About Section 1 - Welcome</h2>
            <p className="text-sm text-gray-500">Edit the welcome section with right image, description, and stats</p>
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
            rows={12}
            className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none font-mono text-sm"
            placeholder="Enter the welcome description..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Characters: {sectionData.description?.length || 0}
          </p>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">Card Title (under image)</label>
          <input
            type="text"
            value={sectionData.card_title}
            onChange={(e) => updateField("card_title", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Right Image Upload */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Right Image</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-gray-50 p-4">
            {sectionData.right_image_preview ? (
              <div className="relative">
                <img
                  src={sectionData.right_image_preview}
                  alt="Right preview"
                  className="h-64 w-full rounded-lg object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-100">
                <ImageIcon size={48} className="text-gray-300" />
              </div>
            )}
            <label className="mt-3 block cursor-pointer">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white hover:from-amber-600 hover:to-amber-700 transition">
                {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Upload size={14} />}
                {uploading ? "Uploading..." : (sectionData.right_image_preview ? "Change Image" : "Upload Image")}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
          <div className="rounded-xl bg-gray-100 p-4 flex items-center justify-center">
            {sectionData.right_image_preview ? (
              <img
                src={sectionData.right_image_preview}
                alt="Context preview"
                className="max-h-64 rounded-lg shadow"
              />
            ) : (
              <p className="text-gray-400">Image preview will appear here</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Statistics ({sectionData.stats.length})</h3>
          {!showAddStat ? (
            <button
              onClick={() => setShowAddStat(true)}
              className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-600"
            >
              <Plus size={14} /> Add Stat
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Label"
                value={newStat.label}
                onChange={(e) => setNewStat(prev => ({ ...prev, label: e.target.value }))}
                className="border rounded px-2 py-1 text-sm"
              />
              <input
                type="text"
                placeholder="Value"
                value={newStat.value}
                onChange={(e) => setNewStat(prev => ({ ...prev, value: e.target.value }))}
                className="border rounded px-2 py-1 text-sm"
              />
              <button onClick={addStat} className="bg-green-500 text-white px-2 py-1 rounded text-sm">Add</button>
              <button onClick={() => setShowAddStat(false)} className="bg-gray-300 px-2 py-1 rounded text-sm">Cancel</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionData.stats.map((stat, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              {editingStatIndex === index && editingStatField === "label" ? (
                <input
                  type="text"
                  value={editStatValue}
                  onChange={(e) => setEditStatValue(e.target.value)}
                  onBlur={saveStatEdit}
                  className="w-full font-bold border rounded px-2 py-1 mb-2 focus:border-amber-400 focus:outline-none"
                  autoFocus
                />
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <button onClick={() => startEditingStat(index, "label", stat.label)} className="text-amber-500">
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
              
              {editingStatIndex === index && editingStatField === "value" ? (
                <input
                  type="text"
                  value={editStatValue}
                  onChange={(e) => setEditStatValue(e.target.value)}
                  onBlur={saveStatEdit}
                  className="w-full text-2xl font-bold border rounded px-2 py-1 focus:border-amber-400 focus:outline-none"
                  autoFocus
                />
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-2xl font-bold text-amber-600">{stat.value}</p>
                  <button onClick={() => startEditingStat(index, "value", stat.value)} className="text-amber-500">
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
              
              <button onClick={() => removeStat(index)} className="text-red-500 text-sm mt-2 hover:text-red-600">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">{sectionData.title}</h2>
            <p className="text-xl text-amber-600">{sectionData.subtitle}</p>
            <div className="text-gray-600 leading-relaxed max-h-96 overflow-y-auto">
              <p className="whitespace-pre-wrap">{sectionData.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {sectionData.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden">
            {sectionData.right_image_preview ? (
              <img src={sectionData.right_image_preview} alt="Preview" className="w-full h-auto rounded-lg" />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                <ImageIcon size={48} className="text-gray-400" />
              </div>
            )}
            <div className="mt-3 text-center">
              <p className="text-sm text-amber-600 font-medium">{sectionData.card_title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertCircle size={16} className="text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">Tips</p>
            <ul className="mt-1 space-y-1 text-xs text-amber-600">
              <li>• Upload a high-quality image for the right side</li>
              <li>• Edit the description text - this is the main welcome message</li>
              <li>• The description supports line breaks and formatting</li>
              <li>• Add/remove/edit statistics as needed</li>
              <li>• Click "Save Changes" to store everything in the database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}