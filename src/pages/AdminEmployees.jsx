import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, Pencil, Trash2, User, Upload, Search } from 'lucide-react';
import BottomSheet from '../components/BottomSheet';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminEmployees() {
  const { adminPassword } = useOutletContext();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ name: '', role: '', phone: '', photo: null });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [adminPassword]);

  const fetchEmployees = async () => {
    try {
      const data = await api.admin.employees.list(adminPassword);
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setForm({ name: employee.name, role: employee.role || '', phone: employee.phone || '', photo: null });
      setPreview(employee.photo);
    } else {
      setEditingEmployee(null);
      setForm({ name: '', role: '', phone: '', photo: null });
      setPreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setPreview(null);
    setForm({ name: '', role: '', phone: '', photo: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('role', form.role);
      data.append('phone', form.phone);
      if (form.photo) {
        data.append('photo', form.photo);
      }
      if (editingEmployee && preview && !form.photo) {
        data.append('existingPhoto', preview);
      }

      if (editingEmployee) {
        await api.admin.employees.update(editingEmployee.id, data, adminPassword);
      } else {
        await api.admin.employees.create(data, adminPassword);
      }
      fetchEmployees();
      closeModal();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.admin.employees.delete(id, adminPassword);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.role && e.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  return (
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-medium">Employees</h1>
        <div className="relative w-full sm:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
          />
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No employees match your search' : 'No employees yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-50 flex items-center justify-center">
                {employee.photo ? (
                  <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-300" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium">{employee.name}</h3>
                {employee.role && <p className="text-sm text-gray-500">{employee.role}</p>}
                {employee.phone && <p className="text-xs text-gray-400 mt-1">{employee.phone}</p>}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openModal(employee)}
                    className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => openModal()}
        className="fixed right-4 bottom-6 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <BottomSheet
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Pharmacist, Manager"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="01XXXXXXXXX"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Photo</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg mx-auto" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload photo</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview && (
              <button
                type="button"
                onClick={() => { setForm({ ...form, photo: null }); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="mt-2 text-xs text-gray-500 hover:text-black"
              >
                Remove photo
              </button>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            {editingEmployee ? 'Update Employee' : 'Add Employee'}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}