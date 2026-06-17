import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Edit2,
  Plus,
  Trash2,
  Upload,
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

export default function ExperiencesSectionOne() {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— SIX WAYS TO REMEMBER",
    subtitle: "Days that linger.",
    description: "At DANA KIGALI HOTEL, the landscape is not a backdrop — it is the main event. Each experience is designed to draw you deeper into the ridge, the forest, and the quiet rhythm of mountain life.",
    experiences: [
      { category: "Adventure", title: "Mountain Trails", description: "Guided hikes along the ridgeline at first light, with a thermos of fresh coffee. Routes range from gentle forest walks to summit scrambles, each led by a local who knows every switchback.", details: "Available daily · 2–6 hours · All fitness levels", image: null, image_preview: null, image_file: null },
      { category: "Culinary", title: "Cliffside Dining", description: "Seasonal tasting menus served by candlelight above the valley. Our Executive Chef sources from valley farms and mountain foragers, composing dishes that change with the week.", details: "Wed–Sun evenings · 7-course tasting · Wine pairing", image: null, image_preview: null, image_file: null },
      { category: "Wonder", title: "Stargazing Nights", description: "A private rooftop, warm blankets, and a sky uncluttered by city light. Our astronomer guides you through constellations with a telescope and stories older than the ridge itself.", details: "Clear evenings · 2 hours · Includes warm drinks", image: null, image_preview: null, image_file: null },
      { category: "Wellness", title: "Thermal Rituals", description: "Descend into a subterranean world of stone, water, and candlelight. Ancient thermal baths, hammam sessions, and therapeutic massages designed to dissolve tension.", details: "Daily 10am–8pm · Treatments 60–120 min", image: null, image_preview: null, image_file: null },
      { category: "Mindfulness", title: "Forest Yoga", description: "Morning sessions on a timber deck surrounded by pines and mist. Our instructor adapts each class to the group — from restorative stretches to flowing vinyasa.", details: "Daily sunrise · 60 min · All levels welcome", image: null, image_preview: null, image_file: null },
      { category: "Culture", title: "Cellar Tastings", description: "Explore the valley's wine heritage in our stone cellar. Guided tastings of regional vintages, paired with local cheeses and the stories of the families who made them.", details: "Fri–Sun afternoons · 90 min · Reservations required", image: null, image_preview: null, image_file: null },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExperience, setNewExperience] = useState({ category: "", title: "", description: "", details: "", image: null, image_preview: null, image_file: null });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/experiences/section-one`, {
        headers: { Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const result = await response.json();
      console.log("Experiences API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        const experiences = section.experiences || [];
        setSectionData({
          id: section.id,
          title: section.title || "— SIX WAYS TO REMEMBER",
          subtitle: section.subtitle || "Days that linger.",
          description: section.description || "",
          experiences: experiences.map(exp => ({
            category: exp.category || "",
            title: exp.title || "",
            description: exp.description || "",
            details: exp.details || "",
            image: exp.image,
            image_preview: exp.image_url ? getImageUrl(exp.image) : null,
            image_file: null,
          })),
        });
        setHasChanges(false);
      }
    } catch (err) { console.error("Error fetching experiences:", err); setError("Failed to load section data"); }
    finally { setLoading(false); }
  };

  const markChanges = () => { setHasChanges(true); setSaved(false); setError(null); };
  const updateField = (field, value) => { setSectionData(prev => ({ ...prev, [field]: value })); markChanges(); };
  const updateExperience = (index, field, value) => { const newExperiences = [...sectionData.experiences]; newExperiences[index] = { ...newExperiences[index], [field]: value }; setSectionData(prev => ({ ...prev, experiences: newExperiences })); markChanges(); };
  
  const addExperience = () => {
    if (newExperience.title.trim()) {
      setSectionData(prev => ({
        ...prev,
        experiences: [...prev.experiences, { ...newExperience }]
      }));
      setNewExperience({ category: "", title: "", description: "", details: "", image: null, image_preview: null, image_file: null });
      setShowAddForm(false);
      markChanges();
    }
  };
  
  const removeExperience = (index) => { const newExperiences = [...sectionData.experiences]; newExperiences.splice(index, 1); setSectionData(prev => ({ ...prev, experiences: newExperiences })); markChanges(); };
  
  const startEditing = (index, field, currentValue) => { setEditingIndex(index); setEditingField(field); setEditValue(currentValue); };
  const saveEdit = () => { if (editValue !== undefined && editValue !== null) { updateExperience(editingIndex, editingField, editValue); } setEditingIndex(null); setEditingField(null); setEditValue(""); };
  
  const handleImageUpload = (index, file) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) { setError("Please select a valid image (JPEG, PNG, WebP)"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image size must be less than 5MB"); return; }
    setUploadingIndex(index);
    const previewUrl = URL.createObjectURL(file);
    const newExperiences = [...sectionData.experiences];
    newExperiences[index] = { ...newExperiences[index], image_preview: previewUrl, image_file: file };
    setSectionData(prev => ({ ...prev, experiences: newExperiences }));
    markChanges();
    setUploadingIndex(null);
  };
  
  const removeImage = (index) => {
    const newExperiences = [...sectionData.experiences];
    if (newExperiences[index].image_preview?.startsWith('blob:')) URL.revokeObjectURL(newExperiences[index].image_preview);
    newExperiences[index] = { ...newExperiences[index], image: null, image_preview: null, image_file: null };
    setSectionData(prev => ({ ...prev, experiences: newExperiences }));
    markChanges();
  };

  const saveToBackend = async () => {
    setSaving(true); setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Please login first");

      const experiencesData = sectionData.experiences.map(exp => ({
        category: exp.category,
        title: exp.title,
        description: exp.description,
        details: exp.details,
        image: exp.image_file ? null : (exp.image || null),
      }));

      const payload = { title: sectionData.title, subtitle: sectionData.subtitle, description: sectionData.description, experiences: experiencesData };
      let url, method;
      if (sectionData.id) { url = `${API_URL}/dana/experiences/section-one/${sectionData.id}`; method = "PUT"; }
      else { url = `${API_URL}/dana/experiences/section-one`; method = "POST"; }

      const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      console.log("Save response:", result);
      
      if (result.success) {
        const savedSectionId = result.data.id || sectionData.id;
        
        // Upload images if any
        for (let i = 0; i < sectionData.experiences.length; i++) {
          const exp = sectionData.experiences[i];
          if (exp.image_file) {
            const formData = new FormData();
            formData.append("image", exp.image_file);
            formData.append("experience_index", i);
            formData.append("section_id", savedSectionId);
            
            console.log(`Uploading image for experience ${i}...`);
            const uploadResponse = await fetch(`${API_URL}/dana/experiences/section-one/upload-image`, {
              method: "POST", 
              headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, 
              body: formData,
            });
            
            const uploadResult = await uploadResponse.json();
            console.log(`Upload response for experience ${i}:`, uploadResult);
          }
        }
        setHasChanges(false); 
        setSaved(true); 
        setTimeout(() => setSaved(false), 3000); 
        await fetchData(); // Refresh all data
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

  const handleReset = () => { fetchData(); setError(null); };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-xl font-bold text-gray-900">Section 1 - Six Ways to Remember</h2><p className="text-sm text-gray-500">Edit experiences with categories, titles, descriptions, and images</p></div>
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
        <div><label className="mb-1 block text-sm font-medium">Section Title</label><input type="text" value={sectionData.title} onChange={(e) => updateField("title", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
        <div className="mt-4"><label className="mb-1 block text-sm font-medium">Section Subtitle</label><input type="text" value={sectionData.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
        <div className="mt-4"><label className="mb-1 block text-sm font-medium">Description</label><textarea value={sectionData.description} onChange={(e) => updateField("description", e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none" /></div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Experiences ({sectionData.experiences.length})</h3>
          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-600"><Plus size={14} /> Add Experience</button>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <input type="text" placeholder="Category" value={newExperience.category} onChange={(e) => setNewExperience(prev => ({ ...prev, category: e.target.value }))} className="border rounded px-2 py-1 text-sm w-28" />
              <input type="text" placeholder="Title" value={newExperience.title} onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))} className="border rounded px-2 py-1 text-sm w-32" />
              <input type="text" placeholder="Details" value={newExperience.details} onChange={(e) => setNewExperience(prev => ({ ...prev, details: e.target.value }))} className="border rounded px-2 py-1 text-sm w-32" />
              <button onClick={addExperience} className="bg-green-500 text-white px-2 py-1 rounded text-sm">Add</button>
              <button onClick={() => setShowAddForm(false)} className="bg-gray-300 px-2 py-1 rounded text-sm">Cancel</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionData.experiences.map((exp, index) => (
            <div key={index} className="border rounded-xl overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                {exp.image_preview ? (<><img src={exp.image_preview} alt={exp.title} className="w-full h-full object-cover" /><button onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"><Trash2 size={14} /></button></>) : (<div className="w-full h-full flex items-center justify-center"><ImageIcon size={48} className="text-gray-300" /></div>)}
                <label className="absolute bottom-2 right-2 cursor-pointer"><div className="bg-black/60 hover:bg-black/80 text-white px-2 py-1 rounded-lg text-xs">{uploadingIndex === index ? "..." : "Upload"}</div><input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files[0])} className="hidden" /></label>
              </div>
              <div className="p-4 space-y-2">
                <div><label className="text-xs text-gray-500">Category</label>{editingIndex === index && editingField === "category" ? (<input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} className="w-full border rounded px-2 py-1" autoFocus />) : (<div className="flex justify-between"><span className="text-xs text-amber-600 font-medium">{exp.category}</span><button onClick={() => startEditing(index, "category", exp.category)} className="text-amber-500"><Edit2 size={14} /></button></div>)}</div>
                <div><label className="text-xs text-gray-500">Title</label>{editingIndex === index && editingField === "title" ? (<input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} className="w-full font-bold border rounded px-2 py-1" autoFocus />) : (<div className="flex justify-between"><h4 className="font-bold text-gray-900">{exp.title}</h4><button onClick={() => startEditing(index, "title", exp.title)} className="text-amber-500"><Edit2 size={14} /></button></div>)}</div>
                <div><label className="text-xs text-gray-500">Description</label>{editingIndex === index && editingField === "description" ? (<textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} rows={2} className="w-full text-sm border rounded px-2 py-1" autoFocus />) : (<div className="flex items-start justify-between"><p className="text-sm text-gray-600 flex-1">{exp.description}</p><button onClick={() => startEditing(index, "description", exp.description)} className="text-amber-500 ml-2"><Edit2 size={14} /></button></div>)}</div>
                <div><label className="text-xs text-gray-500">Details</label>{editingIndex === index && editingField === "details" ? (<input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} className="w-full text-xs text-amber-600 border rounded px-2 py-1" autoFocus />) : (<div className="flex justify-between"><span className="text-xs text-amber-600">{exp.details}</span><button onClick={() => startEditing(index, "details", exp.details)} className="text-amber-500"><Edit2 size={14} /></button></div>)}</div>
                <button onClick={() => removeExperience(index)} className="text-red-500 text-sm mt-2 hover:text-red-600">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-900">{sectionData.title}</h2><p className="text-gray-500 mt-2">{sectionData.subtitle}</p><p className="text-gray-500 max-w-2xl mx-auto mt-4">{sectionData.description}</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionData.experiences.map((exp, index) => (
            <div key={index} className="group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
              <div className="h-48 overflow-hidden">{exp.image_preview ? <img src={exp.image_preview} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><ImageIcon size={40} className="text-gray-400" /></div>}</div>
              <div className="p-4 bg-white"><span className="text-xs text-amber-600 font-medium uppercase">{exp.category}</span><h4 className="font-bold text-gray-900 mt-1">{exp.title}</h4><p className="text-gray-500 text-sm mt-1">{exp.description}</p><p className="text-xs text-amber-600 mt-2">{exp.details}</p></div>
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
              <li>• Click "Upload" on any card to add an image</li>
              <li>• Click "Save Changes" to store everything in the database</li>
              <li>• After saving, images will be displayed in the preview</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}