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

export default function ExperiencesHeroSection() {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— SIGNATURE EXPERIENCES",
    subtitle: "Experiences",
    destination: "Home/Experiences",
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/experiences/hero`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      console.log("Experiences Hero API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        const hero = result.data[0];
        const imageUrl = getImageUrl(hero.background_image);
        
        setSectionData({
          id: hero.id,
          title: hero.title || "— SIGNATURE EXPERIENCES",
          subtitle: hero.subtitle || "Experiences",
          destination: hero.destination || "Home/Experiences",
          background_image: hero.background_image,
          background_image_preview: imageUrl,
          background_image_file: null,
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching experiences hero:", err);
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
        url = `${API_URL}/dana/experiences/hero/${sectionData.id}`;
        method = "POST";
        formData.append("_method", "PUT");
      } else {
        url = `${API_URL}/dana/experiences/hero`;
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
        await fetchData();
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
            <h2 className="text-xl font-bold text-gray-900">Experiences Hero Section</h2>
            <p className="text-sm text-gray-500">Edit the experiences page hero banner</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <div><label className="mb-1 block text-sm font-medium">Title</label><input type="text" value={sectionData.title} onChange={(e) => updateField("title", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
          <div><label className="mb-1 block text-sm font-medium">Subtitle</label><input type="text" value={sectionData.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
          <div><label className="mb-1 block text-sm font-medium">Destination (Breadcrumb)</label><input type="text" value={sectionData.destination} onChange={(e) => updateField("destination", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <label className="mb-3 block text-sm font-medium">Background Image</label>
          <div className="rounded-xl border bg-gray-50 p-4">
            {sectionData.background_image_preview ? (
              <div className="relative">
                <img src={sectionData.background_image_preview} alt="Preview" className="h-48 w-full rounded-lg object-cover" />
                <button onClick={removeImage} className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"><Trash2 size={14} /></button>
              </div>
            ) : (
              <div className="flex h-48 w-full items-center justify-center rounded-lg bg-gray-100"><ImageIcon size={48} className="text-gray-300" /></div>
            )}
            <label className="mt-3 block cursor-pointer">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white hover:from-amber-600 hover:to-amber-700">
                {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Upload size={14} />}
                {uploading ? "Uploading..." : (sectionData.background_image_preview ? "Change Image" : "Upload Image")}
              </div>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="relative h-64 overflow-hidden rounded-xl bg-gradient-to-r from-gray-800 to-gray-900">
          {sectionData.background_image_preview && <img src={sectionData.background_image_preview} className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
            <h2 className="text-4xl font-bold mb-2">{sectionData.title}</h2>
            <p className="text-xl mb-4">{sectionData.subtitle}</p>
            <p className="text-amber-300">{sectionData.destination}</p>
          </div>
        </div>
      </div>
    </div>
  );
}