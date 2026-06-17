import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const APP_URL = API_URL.replace(/\/api$/, "");

console.log("APP_URL:", APP_URL);

const getImageUrl = (path) => {
  if (!path) return null;
  
  console.log("Original path from API:", path);
  
  // Handle localhost URLs - replace with 127.0.0.1:8000
  let cleanPath = path;
  if (cleanPath.includes("localhost")) {
    cleanPath = cleanPath.replace("localhost", "127.0.0.1:8000");
    console.log("After localhost replace:", cleanPath);
  }
  
  // If it's already a full URL with http/https
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    // Make sure it has the correct port
    if (cleanPath.match(/http:\/\/127\.0\.0\.1(\/|$)/)) {
      cleanPath = cleanPath.replace("http://127.0.0.1/", "http://127.0.0.1:8000/");
    }
    console.log("Final URL:", cleanPath);
    return cleanPath;
  }
  
  // If it's a storage path starting with /storage/
  if (cleanPath.startsWith("/storage/")) {
    return `${APP_URL}${cleanPath}`;
  }
  
  // If it's a storage path without leading slash
  if (cleanPath.startsWith("storage/")) {
    return `${APP_URL}/${cleanPath}`;
  }
  
  // If it's just a filename or section-one/filename
  if (cleanPath.includes("section-one/")) {
    return `${APP_URL}/storage/${cleanPath}`;
  }
  
  // Default: assume it's a path under storage
  return `${APP_URL}/storage/${cleanPath}`;
};

const getToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
};

export default function Section1({ data, onSave }) {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— WELCOME",
    subtitle: "Your Home Away from Home.",
    description: "DANA KIGALI HOTEL is more than just a place to stay. It is a story of family, culture, hospitality, and kindness, carried from the banks of the River Nile to the beautiful land of a thousand hills (Rwanda).",
    left_image: null,
    left_image_preview: null,
    left_image_file: null,
    card1_title: "5-Star Service",
    card1_description: "Personal concierge available around the clock.",
    card2_title: "Pristine Setting",
    card2_description: "Acres of forest, valley views, and silence.",
    bottom_card_text: "25+ Years welcoming travellers from over seventy countries.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSectionData();
  }, []);

  const fetchSectionData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/section-one`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      console.log("Section One API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        const imageUrl = getImageUrl(section.left_image);
        console.log("Processed image URL:", imageUrl);
        
        setSectionData({
          id: section.id,
          title: section.title || "— WELCOME",
          subtitle: section.subtitle || "Your Home Away from Home.",
          description: section.description || "",
          left_image: section.left_image,
          left_image_preview: imageUrl,
          left_image_file: null,
          card1_title: section.card1_title || "5-Star Service",
          card1_description: section.card1_description || "Personal concierge available around the clock.",
          card2_title: section.card2_title || "Pristine Setting",
          card2_description: section.card2_description || "Acres of forest, valley views, and silence.",
          bottom_card_text: section.bottom_card_text || "25+ Years welcoming travellers from over seventy countries.",
        });
      }
    } catch (err) {
      console.error("Error fetching section one:", err);
      setError("Failed to load section data");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setSectionData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaved(false);
    setError(null);
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
      left_image_preview: previewUrl,
      left_image_file: file,
    }));
    setHasChanges(true);
    setUploading(false);
  };

  const removeImage = () => {
    if (sectionData.left_image_preview?.startsWith('blob:')) {
      URL.revokeObjectURL(sectionData.left_image_preview);
    }
    setSectionData(prev => ({
      ...prev,
      left_image: null,
      left_image_preview: null,
      left_image_file: null,
    }));
    setHasChanges(true);
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
      formData.append("card1_title", sectionData.card1_title);
      formData.append("card1_description", sectionData.card1_description);
      formData.append("card2_title", sectionData.card2_title);
      formData.append("card2_description", sectionData.card2_description);
      formData.append("bottom_card_text", sectionData.bottom_card_text);

      if (sectionData.left_image_file) {
        formData.append("left_image", sectionData.left_image_file);
      }

      let url, method;
      if (sectionData.id) {
        url = `${API_URL}/dana/section-one/${sectionData.id}`;
        method = "POST";
        formData.append("_method", "PUT");
      } else {
        url = `${API_URL}/dana/section-one`;
        method = "POST";
      }

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
            <h2 className="text-xl font-bold text-gray-900">Section 1 - Welcome to Dana</h2>
            <p className="text-sm text-gray-500">Edit the welcome section with left image and two cards</p>
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
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
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
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
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
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={sectionData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={6}
            className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <label className="mb-1 block text-sm font-medium">Card 1 Title</label>
            <input
              type="text"
              value={sectionData.card1_title}
              onChange={(e) => updateField("card1_title", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 mb-3 focus:border-amber-400 focus:outline-none"
            />
            <label className="mb-1 block text-sm font-medium">Card 1 Description</label>
            <textarea
              value={sectionData.card1_description}
              onChange={(e) => updateField("card1_description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div className="border rounded-lg p-4">
            <label className="mb-1 block text-sm font-medium">Card 2 Title</label>
            <input
              type="text"
              value={sectionData.card2_title}
              onChange={(e) => updateField("card2_title", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 mb-3 focus:border-amber-400 focus:outline-none"
            />
            <label className="mb-1 block text-sm font-medium">Card 2 Description</label>
            <textarea
              value={sectionData.card2_description}
              onChange={(e) => updateField("card2_description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">Bottom Card Text</label>
          <input
            type="text"
            value={sectionData.bottom_card_text}
            onChange={(e) => updateField("bottom_card_text", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Left Image Upload */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Left Image</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-gray-50 p-4">
            {sectionData.left_image_preview ? (
              <div className="relative">
                <img
                  src={sectionData.left_image_preview}
                  alt="Left preview"
                  className="h-64 w-full rounded-lg object-cover"
                  onError={(e) => {
                    console.error("Image failed to load:", sectionData.left_image_preview);
                    e.target.src = "https://placehold.co/600x400?text=Image+Not+Found";
                  }}
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
                {uploading ? "Uploading..." : (sectionData.left_image_preview ? "Change Image" : "Upload Image")}
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
            {sectionData.left_image_preview ? (
              <img
                src={sectionData.left_image_preview}
                alt="Context preview"
                className="max-h-64 rounded-lg shadow"
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x400?text=Image+Not+Found";
                }}
              />
            ) : (
              <p className="text-gray-400">Image preview will appear here</p>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl overflow-hidden">
            {sectionData.left_image_preview ? (
              <img
                src={sectionData.left_image_preview}
                alt="Preview"
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x800?text=Image+Not+Found";
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <ImageIcon size={64} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">{sectionData.title}</h2>
            <p className="text-xl text-amber-600">{sectionData.subtitle}</p>
            <p className="text-gray-600 leading-relaxed">{sectionData.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-amber-50 p-4 rounded-xl">
                <h4 className="font-bold text-amber-800">{sectionData.card1_title}</h4>
                <p className="text-sm text-gray-600 mt-1">{sectionData.card1_description}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl">
                <h4 className="font-bold text-amber-800">{sectionData.card2_title}</h4>
                <p className="text-sm text-gray-600 mt-1">{sectionData.card2_description}</p>
              </div>
            </div>
            <div className="bg-amber-100 p-4 rounded-xl text-center">
              <p className="font-semibold text-amber-800">{sectionData.bottom_card_text}</p>
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
              <li>• Upload a high-quality image for the left side</li>
              <li>• Edit any text field by clicking and typing</li>
              <li>• Click "Save Changes" to store everything in the database</li>
              <li>• The preview shows how it will look on the website</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}