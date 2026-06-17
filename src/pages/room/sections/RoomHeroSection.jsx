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

export default function RoomHeroSection() {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— THE RIDGE COLLECTION",
    subtitle: "Rooms & Suites",
    destination: "Home/Rooms",
    background_image: null,
    background_image_preview: null,
    background_image_file: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/rooms/hero`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      console.log("Rooms Hero API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        const hero = result.data[0];
        const imageUrl = getImageUrl(hero.background_image);
        
        setSectionData({
          id: hero.id,
          title: hero.title || "— THE RIDGE COLLECTION",
          subtitle: hero.subtitle || "Rooms & Suites",
          destination: hero.destination || "Home/Rooms",
          background_image: hero.background_image,
          background_image_preview: imageUrl,
          background_image_file: null,
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching rooms hero:", err);
      setError("Failed to load hero data");
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
      background_image_preview: previewUrl,
      background_image_file: file,
    }));
    markChanges();
    setUploading(false);
  };

  const removeImage = () => {
    if (sectionData.background_image_preview?.startsWith('blob:')) {
      URL.revokeObjectURL(sectionData.background_image_preview);
    }
    setSectionData(prev => ({
      ...prev,
      background_image: null,
      background_image_preview: null,
      background_image_file: null,
    }));
    markChanges();
  };

  const saveToBackend = async () => {
    if (!sectionData.title) {
      setError("Title is required");
      return;
    }

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
      formData.append("destination", sectionData.destination);

      if (sectionData.background_image_file) {
        formData.append("background_image", sectionData.background_image_file);
      }

      let url, method;
      if (sectionData.id) {
        url = `${API_URL}/dana/rooms/hero/${sectionData.id}`;
        method = "POST";
        formData.append("_method", "PUT");
      } else {
        url = `${API_URL}/dana/rooms/hero`;
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

      if (!response.ok) {
        if (result.errors) {
          setError(JSON.stringify(result.errors, null, 2));
        } else {
          setError(result.message || "Error saving hero");
        }
        return;
      }

      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchHeroData();
      } else {
        setError(result.message || "Error saving hero");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save hero");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchHeroData();
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
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-amber-800">Room Hero Section</h2>
          <p className="text-sm text-gray-500">Edit the room page hero banner</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
              <Check size={16} /> Saved
            </span>
          )}
          <button 
            onClick={handleReset} 
            className="px-3 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button 
            onClick={saveToBackend} 
            disabled={!hasChanges || saving} 
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              hasChanges && !saving
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700" 
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={15} />}
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Form */}
        <div className="space-y-4 bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              value={sectionData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="— THE RIDGE COLLECTION"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              value={sectionData.subtitle}
              onChange={(e) => updateField("subtitle", e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Rooms & Suites"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Destination (Breadcrumb)</label>
            <input
              value={sectionData.destination}
              onChange={(e) => updateField("destination", e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Home/Rooms"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-3">Background Image</label>
            <div className="border rounded-lg p-4 bg-gray-50">
              {sectionData.background_image_preview ? (
                <div className="relative">
                  <img
                    src={sectionData.background_image_preview}
                    alt="Hero preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon size={48} className="text-gray-300" />
                </div>
              )}
              <label className="cursor-pointer block w-full mt-3">
                <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 text-sm font-medium hover:from-amber-600 hover:to-amber-700">
                  {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Upload size={14} />}
                  {uploading ? "Uploading..." : (sectionData.background_image_preview ? "Change Image" : "Upload Image")}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-3">
                Recommended size: 1920x800px. Max 5MB. Supports JPG, PNG, WebP.
              </p>
            </div>
          </div>
        </div>

        {/* Right - Live Preview */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Live Preview</h3>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="relative h-80 overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900">
              {sectionData.background_image_preview ? (
                <>
                  <img
                    src={sectionData.background_image_preview}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900" />
              )}
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div className="max-w-2xl px-6">
                  {sectionData.subtitle && (
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-400">
                      {sectionData.subtitle}
                    </p>
                  )}
                  {sectionData.title && (
                    <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                      {sectionData.title}
                    </h1>
                  )}
                  <p className="mb-6 text-sm text-white/90 md:text-base">
                    {sectionData.destination}
                  </p>
                  <button className="inline-block rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600">
                    Explore Rooms
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">Tips</p>
            <ul className="mt-1 space-y-1 text-xs text-amber-600">
              <li>• Upload a high-quality background image (1920x800px recommended)</li>
              <li>• Edit the title, subtitle, and destination for the room hero section</li>
              <li>• The text appears centered over the image with a dark overlay</li>
              <li>• Click "Save Changes" to store everything in the database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}