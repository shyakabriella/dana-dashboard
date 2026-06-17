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

export default function FooterManager() {
  const [sectionData, setSectionData] = useState({
    id: null,
    hotel_name: "DANA KIGALI HOTEL",
    description: "A place where everyone feels welcomed, cared for, and truly at home. Inspired by Dana — from the banks of the Nile to the hills of Kigali.",
    address: "3 KG 303 St, Kigali, Rwanda",
    phone: "+250788471880",
    email: "danakigalihotel@gmail.com",
    newsletter_placeholder: "Your email",
    newsletter_button: "Join",
    social_links: [
      { platform: "Facebook", url: "https://facebook.com/danakigali" },
      { platform: "Instagram", url: "https://instagram.com/danakigali" },
      { platform: "Twitter", url: "https://twitter.com/danakigali" },
    ],
    copyright_text: "© DANA KIGALI HOTEL. All rights reserved.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingSocial, setEditingSocial] = useState(null);
  const [editSocialValue, setEditSocialValue] = useState({ platform: "", url: "" });
  const [showAddSocial, setShowAddSocial] = useState(false);
  const [newSocial, setNewSocial] = useState({ platform: "", url: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/dana/footer`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const result = await response.json();
      console.log("Footer API Response:", result);

      if (result.success && result.data) {
        const footer = result.data;
        setSectionData({
          id: footer.id,
          hotel_name: footer.hotel_name || "DANA KIGALI HOTEL",
          description: footer.description || "A place where everyone feels welcomed, cared for, and truly at home. Inspired by Dana — from the banks of the Nile to the hills of Kigali.",
          address: footer.address || "3 KG 303 St, Kigali, Rwanda",
          phone: footer.phone || "+250788471880",
          email: footer.email || "danakigalihotel@gmail.com",
          newsletter_placeholder: footer.newsletter_placeholder || "Your email",
          newsletter_button: footer.newsletter_button || "Join",
          social_links: footer.social_links || [],
          copyright_text: footer.copyright_text || "© DANA KIGALI HOTEL. All rights reserved.",
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching footer:", err);
      setError("Failed to load footer data");
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

  const addSocialLink = () => {
    if (newSocial.platform.trim() && newSocial.url.trim()) {
      setSectionData(prev => ({
        ...prev,
        social_links: [...prev.social_links, { platform: newSocial.platform.trim(), url: newSocial.url.trim() }]
      }));
      setNewSocial({ platform: "", url: "" });
      setShowAddSocial(false);
      markChanges();
    }
  };

  const removeSocialLink = (index) => {
    const newSocialLinks = [...sectionData.social_links];
    newSocialLinks.splice(index, 1);
    setSectionData(prev => ({ ...prev, social_links: newSocialLinks }));
    markChanges();
  };

  const startEditingSocial = (index, platform, url) => {
    setEditingSocial(index);
    setEditSocialValue({ platform, url });
  };

  const saveSocialEdit = () => {
    if (editSocialValue.platform.trim() && editSocialValue.url.trim()) {
      const newSocialLinks = [...sectionData.social_links];
      newSocialLinks[editingSocial] = { 
        platform: editSocialValue.platform.trim(), 
        url: editSocialValue.url.trim() 
      };
      setSectionData(prev => ({ ...prev, social_links: newSocialLinks }));
      markChanges();
    }
    setEditingSocial(null);
    setEditSocialValue({ platform: "", url: "" });
  };

  const saveToBackend = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Please login first");
      }

      // Ensure social_links is always an array with valid data
      const socialLinks = sectionData.social_links.filter(link => link.platform && link.url);

      const payload = {
        hotel_name: sectionData.hotel_name,
        description: sectionData.description,
        address: sectionData.address,
        phone: sectionData.phone,
        email: sectionData.email,
        newsletter_placeholder: sectionData.newsletter_placeholder,
        newsletter_button: sectionData.newsletter_button,
        social_links: socialLinks,
        copyright_text: sectionData.copyright_text,
      };

      console.log("Sending payload:", payload);

      let url, method;
      if (sectionData.id) {
        url = `${API_URL}/dana/footer/${sectionData.id}`;
        method = "PUT";
      } else {
        url = `${API_URL}/dana/footer`;
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
          setError(result.message || "Error saving footer");
        }
        return;
      }

      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchData();
      } else {
        setError(result.message || "Error saving footer");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save footer");
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
            <h2 className="text-xl font-bold text-gray-900">Footer Manager</h2>
            <p className="text-sm text-gray-500">Edit the global footer content for all pages</p>
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

      {/* Hotel Info */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Hotel Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Hotel Name</label>
            <input
              type="text"
              value={sectionData.hotel_name}
              onChange={(e) => updateField("hotel_name", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={sectionData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              type="text"
              value={sectionData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Address</label>
            <input
              type="text"
              value={sectionData.address}
              onChange={(e) => updateField("address", e.target.value)}
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

      {/* Newsletter */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Newsletter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Placeholder Text</label>
            <input
              type="text"
              value={sectionData.newsletter_placeholder}
              onChange={(e) => updateField("newsletter_placeholder", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Button Text</label>
            <input
              type="text"
              value={sectionData.newsletter_button}
              onChange={(e) => updateField("newsletter_button", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Social Links ({sectionData.social_links.length})</h3>
          {!showAddSocial ? (
            <button
              onClick={() => setShowAddSocial(true)}
              className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-600"
            >
              <Plus size={14} /> Add Social Link
            </button>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Platform (e.g., Facebook)"
                value={newSocial.platform}
                onChange={(e) => setNewSocial(prev => ({ ...prev, platform: e.target.value }))}
                className="border rounded px-2 py-1 text-sm w-32"
              />
              <input
                type="text"
                placeholder="URL"
                value={newSocial.url}
                onChange={(e) => setNewSocial(prev => ({ ...prev, url: e.target.value }))}
                className="border rounded px-2 py-1 text-sm w-48"
              />
              <button onClick={addSocialLink} className="bg-green-500 text-white px-2 py-1 rounded text-sm">Add</button>
              <button onClick={() => setShowAddSocial(false)} className="bg-gray-300 px-2 py-1 rounded text-sm">Cancel</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectionData.social_links.map((link, index) => (
            <div key={index} className="border rounded-lg p-3 bg-gray-50 flex items-center justify-between">
              {editingSocial === index ? (
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    value={editSocialValue.platform}
                    onChange={(e) => setEditSocialValue(prev => ({ ...prev, platform: e.target.value }))}
                    className="border rounded px-2 py-1 text-sm w-24"
                    placeholder="Platform"
                  />
                  <input
                    type="text"
                    value={editSocialValue.url}
                    onChange={(e) => setEditSocialValue(prev => ({ ...prev, url: e.target.value }))}
                    className="border rounded px-2 py-1 text-sm flex-1"
                    placeholder="URL"
                  />
                  <button onClick={saveSocialEdit} className="text-green-500 hover:text-green-600">Save</button>
                  <button onClick={() => setEditingSocial(null)} className="text-red-500 hover:text-red-600">Cancel</button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium text-gray-900">{link.platform}</p>
                    <p className="text-sm text-gray-500 truncate max-w-[150px]">{link.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditingSocial(index, link.platform, link.url)}
                      className="text-amber-500 hover:text-amber-600"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Copyright</h3>
        <div>
          <label className="mb-1 block text-sm font-medium">Copyright Text</label>
          <input
            type="text"
            value={sectionData.copyright_text}
            onChange={(e) => updateField("copyright_text", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Live Preview</h3>
        <div className="bg-gray-900 rounded-xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold text-amber-400 mb-3">{sectionData.hotel_name}</h4>
              <p className="text-sm text-gray-400">{sectionData.description}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-amber-400 mb-3">Explore</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/" className="hover:text-amber-400 transition">Home</a></li>
                <li><a href="/about" className="hover:text-amber-400 transition">About Us</a></li>
                <li><a href="/rooms" className="hover:text-amber-400 transition">Rooms & Suites</a></li>
                <li><a href="/experiences" className="hover:text-amber-400 transition">Experiences</a></li>
                <li><a href="/contact" className="hover:text-amber-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-amber-400 mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>{sectionData.address}</li>
                <li>{sectionData.phone}</li>
                <li>{sectionData.email}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-amber-400 mb-3">Policies</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/privacy-policy" className="hover:text-amber-400 transition">Privacy Policy</a></li>
                <div className="flex gap-4 pt-2">
                  {sectionData.social_links.map((link, index) => (
                    <a key={index} href={link.url} className="text-gray-400 hover:text-amber-400 transition">
                      {link.platform}
                    </a>
                  ))}
                </div>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm text-gray-500">
            {sectionData.copyright_text}
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
              <li>• Edit hotel information, social links, and copyright text</li>
              <li>• The footer appears on all pages of the website</li>
              <li>• Click "Save Changes" to store everything in the database</li>
              <li>• Social links with "Facebook", "Instagram", "Twitter" will show icons</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}