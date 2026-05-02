import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../lib/api';
import { Building2, Save, Upload } from 'lucide-react';
import BottomSheet from '../components/BottomSheet';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminCompany() {
  const { adminPassword } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');
  const [faviconFile, setFaviconFile] = useState(null);
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    opening_hours: '',
    emergency_contact: '',
    emergency_phone: '',
    google_maps_embed_url: '',
  });

  useEffect(() => {
    fetchCompanyInfo();
  }, [adminPassword]);

  const fetchCompanyInfo = async () => {
    try {
      const data = await api.admin.company.get(adminPassword);
      if (data) {
        setForm({
          name: data.name || '',
          logo_url: data.logo_url || '',
          favicon: data.favicon || '',
          description: data.description || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          opening_hours: data.opening_hours || '',
          emergency_contact: data.emergency_contact || '',
          emergency_phone: data.emergency_phone || '',
          google_maps_embed_url: data.google_maps_embed_url || '',
        });
        setLogoPreview(data.logo_url || '');
        setFaviconPreview(data.favicon || '');
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (faviconFile) {
        formData.append('favicon', faviconFile);
      }
      await api.admin.company.update(formData, adminPassword);
      alert('Company info saved successfully!');
    } catch (error) {
      console.error('Error saving company info:', error);
      alert('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  return (
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-medium">Company Information</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="Shovagh Pharmacy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Logo</label>
              <div
                onClick={() => logoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-24 h-24 object-contain rounded-lg mx-auto" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload logo</p>
                  </>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              {logoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreview('');
                    if (logoInputRef.current) logoInputRef.current.value = '';
                  }}
                  className="mt-2 text-xs text-gray-500 hover:text-black"
                >
                  Remove logo
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Favicon (SVG)</label>
              <div
                onClick={() => faviconInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
              >
                {faviconPreview ? (
                  <img src={faviconPreview} alt="Preview" className="w-24 h-24 object-contain rounded-lg mx-auto" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload favicon (SVG)</p>
                  </>
                )}
              </div>
              <input
                ref={faviconInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFaviconChange}
                className="hidden"
              />
              {faviconPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setFaviconFile(null);
                    setFaviconPreview('');
                    if (faviconInputRef.current) faviconInputRef.current.value = '';
                  }}
                  className="mt-2 text-xs text-gray-500 hover:text-black"
                >
                  Remove favicon
                </button>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description (About)</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                placeholder="Your trusted neighborhood pharmacy..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="Mirpur, Dhaka, Bangladesh"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="info@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opening Hours</label>
              <textarea
                name="opening_hours"
                value={form.opening_hours}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                placeholder="Sat - Thu: 8:00 AM - 10:00 PM&#10;Friday: 10:00 AM - 10:00 PM"
              />
            </div>

            <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
              <h3 className="font-medium mb-4">Emergency Contact</h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Emergency Contact Label</label>
              <input
                type="text"
                name="emergency_contact"
                value={form.emergency_contact}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="24/7 Emergency Line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Emergency Phone</label>
              <input
                type="text"
                name="emergency_phone"
                value={form.emergency_phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>

            <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
              <h3 className="font-medium mb-4">Google Maps</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Google Maps Embed URL</label>
              <input
                type="text"
                name="google_maps_embed_url"
                value={form.google_maps_embed_url}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Get this from Google Maps → Share → Embed a map → Copy HTML
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <LoadingSpinner size="small" className="min-h-0 py-0" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}