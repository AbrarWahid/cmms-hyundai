import { useState, useEffect } from 'react';
import { FiSave, FiX, FiLoader } from 'react-icons/fi';
import api from '../services/api';

export default function MachineForm({ initial = {}, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    model: '',
    serial_number: '',
    location: '',
    installation_date: '',
    status: 'operational',
    ...initial
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial._id) {
      // Format date for input field
      const formattedInitial = {
        ...initial,
        installation_date: initial.installation_date 
          ? new Date(initial.installation_date).toISOString().split('T')[0]
          : ''
      };
      setForm(formattedInitial);
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Validate required fields
      if (!form.name || !form.model || !form.serial_number) {
        throw new Error('Please fill in all required fields');
      }

      if (initial._id) {
        // Update existing machine
        await api.put(`/machines/${initial._id}`, form);
      } else {
        // Create new machine
        await api.post('/machines/', form);
      }
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="card-header">
        <h3 className="text-xl font-bold text-gray-900">
          {initial._id ? 'Edit Machine' : 'Add New Machine'}
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Machine Name */}
        <div className="form-group">
          <label className="form-label">
            Machine Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., Assembly Line Robot #1"
          />
        </div>

        {/* Model and Serial Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="model"
              value={form.model}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="e.g., HX-2000"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Serial Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="serial_number"
              value={form.serial_number}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="e.g., SN-2024-001"
            />
          </div>
        </div>

        {/* Location */}
        <div className="form-group">
          <label className="form-label">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Production Floor A, Bay 3"
          />
        </div>

        {/* Installation Date and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Installation Date</label>
            <input
              type="date"
              name="installation_date"
              value={form.installation_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="operational">Operational</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="broken">Broken</option>
            </select>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={saving}
          >
            <FiX className="w-4 h-4" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-accent"
          disabled={saving}
        >
          {saving ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              {initial._id ? 'Save Changes' : 'Create Machine'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}