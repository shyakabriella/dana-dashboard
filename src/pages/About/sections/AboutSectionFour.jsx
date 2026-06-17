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
  if (cleanPath.includes("localhost")) cleanPath = cleanPath.replace("localhost", "127.0.0.1:8000");
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) return cleanPath;
  if (cleanPath.startsWith("/storage/")) return `${APP_URL}${cleanPath}`;
  if (cleanPath.startsWith("storage/")) return `${APP_URL}/${cleanPath}`;
  return `${APP_URL}/storage/${cleanPath}`;
};

const getToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("auth_token");
};

export default function AboutSectionFive() {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— COME STAY",
    subtitle: "A warm welcome is waiting.",
    description: "Reserve a room and experience the true meaning of home in the heart of Kigali.",
    left_image: null,
    left_image_preview: null,
    left_image_file: null,
    button_text: "Back to Home",
    secondary_text: "Reserve a Stay",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/about/section-five`, {
        headers: { Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        const imageUrl = getImageUrl(section.left_image);
        setSectionData({
          id: section.id,
          title: section.title || "— COME STAY",
          subtitle: section.subtitle || "A warm welcome is waiting.",
          description: section.description || "",
          left_image: section.left_image,
          left_image_preview: imageUrl,
          left_image_file: null,
          button_text: section.button_text || "Back to Home",
          secondary_text: section.secondary_text || "Reserve a Stay",
        });
        setHasChanges(false);
      }
    } catch (err) { console.error("Error fetching section five:", err); setError("Failed to load section data"); }
    finally { setLoading(false); }
  };

  const markChanges = () => { setHasChanges(true); setSaved(false); setError(null); };
  const updateField = (field, value) => { setSectionData(prev => ({ ...prev, [field]: value })); markChanges(); };

  const handleImageUpload = (file) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) { setError("Please select a valid image"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image size must be less than 5MB"); return; }
    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    setSectionData(prev => ({ ...prev, left_image_preview: previewUrl, left_image_file: file }));
    markChanges();
    setUploading(false);
  };

  const removeImage = () => {
    if (sectionData.left_image_preview?.startsWith('blob:')) URL.revokeObjectURL(sectionData.left_image_preview);
    setSectionData(prev => ({ ...prev, left_image: null, left_image_preview: null, left_image_file: null }));
    markChanges();
  };

  const saveToBackend = async () => {
    setSaving(true); setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Please login first");

      const formData = new FormData();
      formData.append("title", sectionData.title);
      formData.append("subtitle", sectionData.subtitle);
      formData.append("description", sectionData.description);
      formData.append("button_text", sectionData.button_text);
      formData.append("secondary_text", sectionData.secondary_text);
      if (sectionData.left_image_file) formData.append("left_image", sectionData.left_image_file);

      let url, method;
      if (sectionData.id) { url = `${API_URL}/dana/about/section-five/${sectionData.id}`; method = "POST"; formData.append("_method", "PUT"); }
      else { url = `${API_URL}/dana/about/section-five`; method = "POST"; }

      const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, body: formData });
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
          <div><h2 className="text-xl font-bold text-gray-900">About Section 5 - Come Stay (CTA)</h2><p className="text-sm text-gray-500">Edit the call to action section</p></div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <div><label className="mb-1 block text-sm font-medium">Title</label><input type="text" value={sectionData.title} onChange={(e) => updateField("title", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
          <div><label className="mb-1 block text-sm font-medium">Subtitle</label><input type="text" value={sectionData.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
          <div><label className="mb-1 block text-sm font-medium">Description</label><textarea value={sectionData.description} onChange={(e) => updateField("description", e.target.value)} rows={4} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Button 1 Text</label><input type="text" value={sectionData.button_text} onChange={(e) => updateField("button_text", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
            <div><label className="mb-1 block text-sm font-medium">Button 2 Text</label><input type="text" value={sectionData.secondary_text} onChange={(e) => updateField("secondary_text", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <label className="mb-3 block text-sm font-medium">Left Image</label>
          <div className="rounded-xl border bg-gray-50 p-4">
            {sectionData.left_image_preview ? (<div className="relative"><img src={sectionData.left_image_preview} alt="Preview" className="h-64 w-full rounded-lg object-cover" /><button onClick={removeImage} className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"><Trash2 size={14} /></button></div>) : (<div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-100"><ImageIcon size={48} className="text-gray-300" /></div>)}
            <label className="mt-3 block cursor-pointer"><div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white hover:from-amber-600 hover:to-amber-700 transition">{uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Upload size={14} />}{uploading ? "Uploading..." : (sectionData.left_image_preview ? "Change Image" : "Upload Image")}</div><input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} className="hidden" /></label>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>{sectionData.left_image_preview ? <img src={sectionData.left_image_preview} alt="Preview" className="w-full rounded-lg" /> : <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center"><ImageIcon size={48} className="text-gray-400" /></div>}</div>
          <div className="space-y-4"><h2 className="text-3xl font-bold text-gray-900">{sectionData.title}</h2><p className="text-xl text-amber-600">{sectionData.subtitle}</p><p className="text-gray-600">{sectionData.description}</p><div className="flex gap-4"><button className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600">{sectionData.button_text}</button><button className="border border-amber-500 text-amber-500 px-6 py-2 rounded-lg hover:bg-amber-50">{sectionData.secondary_text}</button></div></div>
        </div>
      </div>
    </div>
  );
}