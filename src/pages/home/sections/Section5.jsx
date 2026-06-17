import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
  Plus,
  X,
  Edit2,
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

export default function Section6({ data, onSave }) {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— MOMENTS",
    subtitle: "A glimpse of life on the ridge.",
    gallery: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingUploads, setPendingUploads] = useState({});
  const [pendingDeletes, setPendingDeletes] = useState([]);

  useEffect(() => {
    fetchSectionData();
  }, []);

  const fetchSectionData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/section-six`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      console.log("Section Six API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        setSectionData({
          id: section.id,
          title: section.title || "— MOMENTS",
          subtitle: section.subtitle || "A glimpse of life on the ridge.",
          gallery: section.gallery || [],
        });
        setPendingUploads({});
        setPendingDeletes([]);
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching section six:", err);
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

  const addImageSlot = () => {
    setSectionData(prev => ({
      ...prev,
      gallery: [...prev.gallery, null],
    }));
    markChanges();
  };

  const removeImageSlot = async (index) => {
    const imageToDelete = sectionData.gallery[index];

    if (imageToDelete && !imageToDelete.startsWith('blob:')) {
      const galleryImages = sectionData.gallery.filter(img => img !== null && !img.startsWith('blob:'));
      const actualIndex = galleryImages.findIndex(img => img === imageToDelete);
      if (actualIndex !== -1) {
        setPendingDeletes(prev => [...prev, { path: imageToDelete, index: actualIndex }]);
      }
    }

    const newGallery = [...sectionData.gallery];
    newGallery.splice(index, 1);
    setSectionData(prev => ({ ...prev, gallery: newGallery }));

    if (pendingUploads[index]) {
      const newPending = { ...pendingUploads };
      delete newPending[index];
      setPendingUploads(newPending);
    }

    markChanges();
  };

  const uploadImage = async (index, file) => {
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

    const previewUrl = URL.createObjectURL(file);
    const newGallery = [...sectionData.gallery];
    newGallery[index] = previewUrl;
    setSectionData(prev => ({ ...prev, gallery: newGallery }));

    setPendingUploads(prev => ({ ...prev, [index]: file }));
    markChanges();
  };

  const replaceImage = (index) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      if (e.target.files[0]) {
        const file = e.target.files[0];

        const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!validTypes.includes(file.type)) {
          setError("Please select a valid image (JPEG, PNG, WebP)");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Image size must be less than 5MB");
          return;
        }

        const oldImage = sectionData.gallery[index];

        // Mark old image for deletion only if it's a real saved image
        if (oldImage && !oldImage.startsWith('blob:')) {
          const galleryImages = sectionData.gallery.filter(img => img !== null && !img.startsWith('blob:'));
          const actualIndex = galleryImages.findIndex(img => img === oldImage);
          if (actualIndex !== -1) {
            setPendingDeletes(prev => [...prev, { path: oldImage, index: actualIndex }]);
          }
        }

        const previewUrl = URL.createObjectURL(file);
        const newGallery = [...sectionData.gallery];
        newGallery[index] = previewUrl;
        setSectionData(prev => ({ ...prev, gallery: newGallery }));

        setPendingUploads(prev => ({ ...prev, [index]: file }));
        markChanges();
      }
    };
    input.click();
  };

  // ✅ FIXED saveToBackend
  const saveToBackend = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Please login first");

      // 1. Delete pending images — skip those being replaced (replaceImage handles deletion)
      for (const deleteItem of pendingDeletes) {
        const isBeingReplaced = Object.keys(pendingUploads).includes(String(deleteItem.index));
        if (isBeingReplaced) continue;

        try {
          await fetch(`${API_URL}/dana/section-six/${sectionData.id}/image/${deleteItem.index}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          });
        } catch (err) {
          console.error("Delete error:", err);
        }
      }

      // 2. Upload / replace pending images
      let uploadedGallery = [...sectionData.gallery];

      for (const [indexStr, file] of Object.entries(pendingUploads)) {
        const index = parseInt(indexStr);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("section_id", sectionData.id);

        // If this slot was marked for deletion it means we're replacing an existing image
        const isReplacing = pendingDeletes.some(d => d.index === index);

        const endpoint = isReplacing
          ? `${API_URL}/dana/section-six/${sectionData.id}/image/${index}` // PUT — replaceImage
          : `${API_URL}/dana/section-six/add-image`;                        // POST — addImage

        const method = isReplacing ? "PUT" : "POST";

        try {
          const response = await fetch(endpoint, {
            method,
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && result.data.gallery) {
              uploadedGallery = result.data.gallery;
            }
          }
        } catch (err) {
          console.error("Upload error:", err);
        }
      }

      // 3. Filter out any leftover blob URLs
      const finalGallery = uploadedGallery.filter(img => img && !img.startsWith('blob:'));

      // 4. Save title, subtitle, and final gallery
      const payload = {
        title: sectionData.title,
        subtitle: sectionData.subtitle,
        gallery: finalGallery,
      };

      const url = sectionData.id
        ? `${API_URL}/dana/section-six/${sectionData.id}`
        : `${API_URL}/dana/section-six`;
      const method = sectionData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Save response:", result);

      if (result.success) {
        setPendingUploads({});
        setPendingDeletes([]);
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchSectionData();
        if (onSave) onSave(result.data);
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
    setPendingUploads({});
    setPendingDeletes([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const hasImages = sectionData.gallery.some(img => img !== null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Section 6 - Gallery (Moments)</h2>
            <p className="text-sm text-gray-500">Manage gallery images - add, remove, or replace images</p>
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
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
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

      {/* Add New Slot Button */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <button
          onClick={addImageSlot}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition"
        >
          <Plus size={16} />
          Add New Image Slot
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Current total slots: {sectionData.gallery.length} | Images uploaded: {sectionData.gallery.filter(img => img && !img.startsWith('blob:')).length}
          {Object.keys(pendingUploads).length > 0 && ` | Pending uploads: ${Object.keys(pendingUploads).length}`}
          {pendingDeletes.length > 0 && ` | Pending deletes: ${pendingDeletes.length}`}
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Gallery Images ({sectionData.gallery.length} slots)</h3>

        {sectionData.gallery.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No image slots yet. Click "Add New Image Slot" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sectionData.gallery.map((image, index) => (
              <div
                key={index}
                className="group relative bg-gray-50 rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition"
              >
                <div className="relative h-40 bg-gray-100">
                  {image ? (
                    <>
                      <img
                        src={image.startsWith('blob:') ? image : getImageUrl(image)}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/400x300?text=Error";
                        }}
                      />
                      <button
                        onClick={() => replaceImage(index)}
                        className="absolute top-2 left-2 bg-amber-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-amber-600"
                        title="Replace image"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => removeImageSlot(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                        title="Delete image and slot"
                      >
                        <Trash2 size={14} />
                      </button>
                      {pendingUploads[index] && (
                        <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded">
                          Pending update
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                      <ImageIcon size={32} className="text-gray-300 mb-2" />
                      <span className="text-xs text-gray-400">Empty slot</span>
                    </div>
                  )}
                </div>

                {!image && (
                  <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/50 opacity-0 group-hover:opacity-100 transition">
                    <div className="bg-amber-500 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                      <Upload size={14} />
                      Upload
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          uploadImage(index, e.target.files[0]);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}

                {!image && (
                  <button
                    onClick={() => removeImageSlot(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                    title="Remove slot"
                  >
                    <X size={14} />
                  </button>
                )}

                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4 text-center">
          • Click "Add New Image Slot" to create more slots<br />
          • Click on empty slot to upload an image<br />
          • Hover over any image to see Replace (pencil) and Delete buttons<br />
          • Images with "Pending update" badge will be saved when you click "Save Changes"<br />
          • Click Save Changes to store title, subtitle, and image references
        </p>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{sectionData.title}</h2>
          <p className="text-amber-600 mt-2">{sectionData.subtitle}</p>
        </div>
        {hasImages ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sectionData.gallery
              .filter(img => img !== null)
              .slice(0, 12)
              .map((image, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src={image.startsWith('blob:') ? image : getImageUrl(image)}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-40 object-cover"
                  />
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No images yet. Add slots and upload images to see preview.
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertCircle size={16} className="text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">How to manage gallery images</p>
            <ul className="mt-1 space-y-1 text-xs text-amber-600">
              <li>• <strong>Add Slot:</strong> Click "Add New Image Slot" to create a new empty slot</li>
              <li>• <strong>Upload:</strong> Click on any empty slot to upload an image</li>
              <li>• <strong>Replace:</strong> Hover over any uploaded image and click the Edit (pencil) icon to replace it</li>
              <li>• <strong>Delete Slot:</strong> Hover over any empty slot and click the X button to remove it</li>
              <li>• <strong>Delete Image:</strong> Hover over any uploaded image and click the Trash icon to delete it and the slot</li>
              <li>• <strong>Pending Updates:</strong> Replaced images show a "Pending update" badge</li>
              <li>• <strong>Save:</strong> Click "Save Changes" to finalize all changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}