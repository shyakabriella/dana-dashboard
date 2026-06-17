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

export default function Section2({ data, onSave }) {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— THE RIDGE COLLECTION",
    subtitle: "Rooms & Suites",
    rooms: [
      { 
        name: "Deluxe Double room", 
        description: "38m² · 1 double bed · 1 bath", 
        button_text: "Book Now", 
        image: null, 
        image_preview: null, 
        image_file: null 
      },
      { 
        name: "Deluxe Twin Room", 
        description: "38m² · 2 twin beds · 1 bath", 
        button_text: "Book Now", 
        image: null, 
        image_preview: null, 
        image_file: null 
      },
      { 
        name: "Family Room", 
        description: "50m² · 3 beds · 2 baths", 
        button_text: "Book Now", 
        image: null, 
        image_preview: null, 
        image_file: null 
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editField, setEditField] = useState({ index: null, field: "", value: "" });

  useEffect(() => {
    fetchSectionData();
  }, []);

  const fetchSectionData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/section-two`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      console.log("Section Two API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        const section = result.data[0];
        const rooms = section.rooms || [];
        
        setSectionData({
          id: section.id,
          title: section.title || "— THE RIDGE COLLECTION",
          subtitle: section.subtitle || "Rooms & Suites",
          rooms: rooms.map((room, idx) => ({
            name: room.name || "",
            description: room.description || "",
            button_text: room.button_text || "Book Now",
            image: room.image,
            image_preview: room.image_url ? getImageUrl(room.image) : null,
            image_file: null,
          })),
        });
      }
    } catch (err) {
      console.error("Error fetching section two:", err);
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

  const updateRoomField = (index, field, value) => {
    const newRooms = [...sectionData.rooms];
    newRooms[index] = { ...newRooms[index], [field]: value };
    setSectionData(prev => ({ ...prev, rooms: newRooms }));
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const startEditing = (index, field, currentValue) => {
    setEditingIndex(index);
    setEditField({ index, field, value: currentValue });
  };

  const saveEdit = () => {
    if (editField.value !== undefined) {
      updateRoomField(editField.index, editField.field, editField.value);
    }
    setEditingIndex(null);
    setEditField({ index: null, field: "", value: "" });
  };

  const handleImageUpload = async (index, file) => {
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

    setUploadingIndex(index);
    const previewUrl = URL.createObjectURL(file);
    
    const newRooms = [...sectionData.rooms];
    newRooms[index] = { ...newRooms[index], image_preview: previewUrl, image_file: file };
    setSectionData(prev => ({ ...prev, rooms: newRooms }));
    setHasChanges(true);
    setUploadingIndex(null);
  };

  const removeImage = (index) => {
    const newRooms = [...sectionData.rooms];
    if (newRooms[index].image_preview?.startsWith('blob:')) {
      URL.revokeObjectURL(newRooms[index].image_preview);
    }
    newRooms[index] = {
      ...newRooms[index],
      image: null,
      image_preview: null,
      image_file: null,
    };
    setSectionData(prev => ({ ...prev, rooms: newRooms }));
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

      // Prepare rooms data without price
      const roomsData = sectionData.rooms.map(room => ({
        name: room.name,
        description: room.description,
        button_text: room.button_text,
        image: room.image_file ? null : (room.image || null),
      }));

      const payload = {
        title: sectionData.title,
        subtitle: sectionData.subtitle,
        rooms: roomsData,
      };

      console.log("Sending payload:", payload);

      let url, method;
      if (sectionData.id) {
        url = `${API_URL}/dana/section-two/${sectionData.id}`;
        method = "PUT";
      } else {
        url = `${API_URL}/dana/section-two`;
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
        // Upload images if any
        for (let i = 0; i < sectionData.rooms.length; i++) {
          const room = sectionData.rooms[i];
          if (room.image_file) {
            const formData = new FormData();
            formData.append("image", room.image_file);
            formData.append("room_index", i);
            formData.append("section_id", result.data.id || sectionData.id);

            await fetch(`${API_URL}/dana/section-two/upload-room-image`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
              body: formData,
            });
          }
        }

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
            <h2 className="text-xl font-bold text-gray-900">Section 2 - The Ridge Collection (Rooms)</h2>
            <p className="text-sm text-gray-500">Edit rooms with names, descriptions, and images</p>
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

      {/* Rooms Cards */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Rooms ({sectionData.rooms.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionData.rooms.map((room, index) => (
            <div key={index} className="border rounded-xl overflow-hidden">
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {room.image_preview ? (
                  <>
                    <img
                      src={room.image_preview}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-300" />
                  </div>
                )}
                <label className="absolute bottom-2 right-2 cursor-pointer">
                  <div className="bg-black/60 hover:bg-black/80 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition">
                    <Upload size={12} />
                    {uploadingIndex === index ? "..." : "Upload"}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Room Name */}
                <div>
                  <label className="text-xs text-gray-500">Room Name</label>
                  {editingIndex === index && editField.field === "name" ? (
                    <input
                      type="text"
                      value={editField.value}
                      onChange={(e) => setEditField({ ...editField, value: e.target.value })}
                      onBlur={saveEdit}
                      onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                      className="w-full font-bold border rounded px-2 py-1 focus:border-amber-400 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900">{room.name || "Untitled"}</h4>
                      <button
                        onClick={() => startEditing(index, "name", room.name)}
                        className="text-amber-500 hover:text-amber-600"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs text-gray-500">Description</label>
                  {editingIndex === index && editField.field === "description" ? (
                    <input
                      type="text"
                      value={editField.value}
                      onChange={(e) => setEditField({ ...editField, value: e.target.value })}
                      onBlur={saveEdit}
                      onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                      className="w-full text-sm text-gray-600 border rounded px-2 py-1 focus:border-amber-400 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">{room.description || "No description"}</p>
                      <button
                        onClick={() => startEditing(index, "description", room.description)}
                        className="text-amber-500 hover:text-amber-600"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Button Text */}
                <div>
                  <label className="text-xs text-gray-500">Button Text</label>
                  {editingIndex === index && editField.field === "button_text" ? (
                    <input
                      type="text"
                      value={editField.value}
                      onChange={(e) => setEditField({ ...editField, value: e.target.value })}
                      onBlur={saveEdit}
                      onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                      className="w-full border rounded px-2 py-1 focus:border-amber-400 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-amber-600">{room.button_text || "Book Now"}</span>
                      <button
                        onClick={() => startEditing(index, "button_text", room.button_text)}
                        className="text-amber-500 hover:text-amber-600"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
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
          {sectionData.rooms.map((room, index) => (
            <div key={index} className="group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
              <div className="h-56 overflow-hidden">
                {room.image_preview ? (
                  <img
                    src={room.image_preview}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <ImageIcon size={40} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4 text-center bg-white">
                <h4 className="font-bold text-gray-900">{room.name || "Room Name"}</h4>
                <p className="text-gray-500 text-sm mt-1">{room.description}</p>
                <button className="mt-3 inline-block text-sm text-amber-600 hover:text-amber-700 font-medium">
                  {room.button_text || "Book Now"} →
                </button>
              </div>
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
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}