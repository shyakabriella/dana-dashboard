import { useState, useEffect } from "react";
import {
  Save, RotateCcw, Check, AlertCircle, Upload, Trash2, Image as ImageIcon, Edit2,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const APP_URL = API_URL.replace(/\/api$/, "");

const getImageUrl = (path) => {
  if (!path) return null;
  let cleanPath = path;
  if (cleanPath.includes("localhost")) cleanPath = cleanPath.replace("localhost", "127.0.0.1:8000");
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    if (cleanPath.match(/http:\/\/127\.0\.0\.1(\/|$)/))
      cleanPath = cleanPath.replace("http://127.0.0.1/", "http://127.0.0.1:8000/");
    return cleanPath;
  }
  if (cleanPath.startsWith("/storage/")) return `${APP_URL}${cleanPath}`;
  if (cleanPath.startsWith("storage/")) return `${APP_URL}/${cleanPath}`;
  return `${APP_URL}/storage/${cleanPath}`;
};

const getToken = () => localStorage.getItem("token") || localStorage.getItem("auth_token");

export default function RoomSectionOne() {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "— SIX WAYS TO STAY",
    subtitle: "Choose your ridge.",
    description: "Each room at DANA KIGALI HOTEL is shaped around its view — from compact alpine retreats to suites with private terraces and stone fireplaces. All include daily housekeeping, hand-finished linens, and unhurried mornings.",
    rooms: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [editField, setEditField] = useState({ index: null, field: "", value: "" });

  useEffect(() => { fetchSectionData(); }, []);

  const fetchSectionData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/rooms/section-one`, {
        headers: { Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const result = await response.json();
      console.log("Rooms Section One API Response:", result);

      if (result.success && result.data?.length > 0) {
        const section = result.data[0];
        setSectionData({
          id: section.id,
          title: section.title || "— SIX WAYS TO STAY",
          subtitle: section.subtitle || "Choose your ridge.",
          description: section.description || "",
          rooms: (section.rooms || []).map((room) => ({
            name: room.name || "",
            description: room.description || "",
            button_text: room.button_text || "Book Now",
            image: room.image || null,           // ✅ stored path
            image_preview: room.image_url ? getImageUrl(room.image_url) : null,
            image_file: null,
          })),
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching section one:", err);
      setError("Failed to load section data");
    } finally {
      setLoading(false);
    }
  };

  const markChanged = () => { setHasChanges(true); setSaved(false); setError(null); };

  const updateField = (field, value) => {
    setSectionData((prev) => ({ ...prev, [field]: value }));
    markChanged();
  };

  const updateRoomField = (index, field, value) => {
    setSectionData((prev) => {
      const rooms = [...prev.rooms];
      rooms[index] = { ...rooms[index], [field]: value };
      return { ...prev, rooms };
    });
    markChanged();
  };

  const startEditing = (index, field, value) =>
    setEditField({ index, field, value });

  const saveEdit = () => {
    if (editField.index !== null) {
      updateRoomField(editField.index, editField.field, editField.value);
    }
    setEditField({ index: null, field: "", value: "" });
  };

  const handleImageUpload = (index, file) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      setError("Please select a valid image (JPEG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }
    setUploadingIndex(index);
    const previewUrl = URL.createObjectURL(file);
    setSectionData((prev) => {
      const rooms = [...prev.rooms];
      rooms[index] = { ...rooms[index], image_preview: previewUrl, image_file: file };
      return { ...prev, rooms };
    });
    markChanged();
    setUploadingIndex(null);
  };

  const removeImage = (index) => {
    setSectionData((prev) => {
      const rooms = [...prev.rooms];
      if (rooms[index].image_preview?.startsWith("blob:"))
        URL.revokeObjectURL(rooms[index].image_preview);
      rooms[index] = { ...rooms[index], image: null, image_preview: null, image_file: null };
      return { ...prev, rooms };
    });
    markChanged();
  };

  const saveToBackend = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Please login first");

      // ✅ Always include image path so backend never wipes it
      const roomsPayload = sectionData.rooms.map((room) => ({
        name: room.name,
        description: room.description,
        button_text: room.button_text,
        image: room.image || null, // ✅ preserve existing path
      }));

      const payload = {
        title: sectionData.title,
        subtitle: sectionData.subtitle,
        description: sectionData.description,
        rooms: roomsPayload,
      };

      const url = sectionData.id
        ? `${API_URL}/dana/rooms/section-one/${sectionData.id}`
        : `${API_URL}/dana/rooms/section-one`;
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
      if (!response.ok) {
        setError(result.errors ? JSON.stringify(result.errors, null, 2) : result.message || "Error saving");
        return;
      }

      if (result.success) {
        const savedId = result.data?.id || sectionData.id;

        // ✅ Upload only rooms that have a new file
        for (let i = 0; i < sectionData.rooms.length; i++) {
          const room = sectionData.rooms[i];
          if (!room.image_file) continue;

          const formData = new FormData();
          formData.append("image", room.image_file);
          formData.append("room_index", i);
          formData.append("section_id", savedId);

          const uploadRes = await fetch(`${API_URL}/dana/rooms/section-one/upload-room-image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            body: formData,
          });
          const uploadResult = await uploadRes.json();
          console.log(`Upload room ${i}:`, uploadResult);
        }

        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchSectionData();
      } else {
        setError(result.message || "Error saving section");
      }
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
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
            <h2 className="text-xl font-bold text-gray-900">Rooms — Six Ways to Stay</h2>
            <p className="text-sm text-gray-500">Edit room cards, images, and section text</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                <Check size={16} /> Saved
              </span>
            )}
            <button
              onClick={() => { fetchSectionData(); setError(null); }}
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
              {saving
                ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <Save size={15} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 whitespace-pre-wrap flex gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Section text fields */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Section Text</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              type="text"
              value={sectionData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Subtitle</label>
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

      {/* Room cards */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          Rooms <span className="text-amber-500">({sectionData.rooms.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionData.rooms.map((room, index) => (
            <div key={index} className="rounded-xl border overflow-hidden">
              {/* Image area */}
              <div className="relative h-48 bg-gray-100">
                {room.image_preview ? (
                  <>
                    <img src={room.image_preview} alt={room.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={40} className="text-gray-300" />
                  </div>
                )}
                <label className="absolute bottom-2 right-2 cursor-pointer">
                  <div className="bg-black/60 hover:bg-black/80 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition">
                    {uploadingIndex === index
                      ? <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                      : <Upload size={12} />}
                    {room.image_preview ? "Change" : "Upload"}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Editable fields */}
              <div className="p-4 space-y-3">
                {[
                  { field: "name", label: "Room Name", bold: true },
                  { field: "description", label: "Description" },
                  { field: "button_text", label: "Button Text" },
                ].map(({ field, label, bold }) => (
                  <div key={field}>
                    <label className="text-xs text-gray-400">{label}</label>
                    {editField.index === index && editField.field === field ? (
                      <input
                        type="text"
                        value={editField.value}
                        onChange={(e) => setEditField((p) => ({ ...p, value: e.target.value }))}
                        onBlur={saveEdit}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        autoFocus
                        className={`w-full border rounded px-2 py-1 focus:border-amber-400 focus:outline-none ${bold ? "font-bold" : "text-sm"}`}
                      />
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className={`${bold ? "font-bold text-gray-900" : "text-sm text-gray-600"} truncate`}>
                          {room[field] || `Enter ${label}`}
                        </span>
                        <button
                          onClick={() => startEditing(index, field, room[field])}
                          className="shrink-0 text-amber-400 hover:text-amber-600"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Live Preview</h3>
        <div className="text-center mb-8">
          <p className="text-sm tracking-widest text-amber-500 uppercase">{sectionData.title}</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">{sectionData.subtitle}</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mt-3 text-sm leading-relaxed">{sectionData.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionData.rooms.map((room, index) => (
            <div key={index} className="group rounded-xl overflow-hidden shadow hover:shadow-lg transition">
              <div className="h-52 overflow-hidden bg-gray-200">
                {room.image_preview ? (
                  <img
                    src={room.image_preview}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={36} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4 text-center bg-white">
                <h4 className="font-bold text-gray-900">{room.name || "Room Name"}</h4>
                <p className="text-gray-500 text-sm mt-1">{room.description}</p>
                <button className="mt-3 text-sm text-amber-600 font-medium hover:text-amber-700">
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
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <ul className="space-y-1 text-xs text-amber-600">
            <li>• Click the <strong>pencil icon</strong> next to any field to edit it inline</li>
            <li>• Click <strong>Upload / Change</strong> on a card to set or replace its image</li>
            <li>• Existing images are <strong>never wiped</strong> when you save text-only changes</li>
            <li>• Click <strong>Save Changes</strong> to persist everything to the database</li>
          </ul>
        </div>
      </div>
    </div>
  );
}