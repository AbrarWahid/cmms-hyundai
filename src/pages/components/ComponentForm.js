import { useState, useEffect } from 'react';
import { FiSave, FiX, FiLoader } from 'react-icons/fi';
import api from '../services/api';

export default function ComponentForm({ machineId, initial = {}, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    machine_id: machineId || '',
    name: '',
    part_number: '',
    condition: 'good',
    status: 'active',
    lifespan_hours: 0,
    current_hours: 0,
    ...initial
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(f => ({ ...f, ...initial, machine_id: machineId || f.machine_id }));
  }, [initial, machineId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setForm(f => ({ ...f, [name]: val }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!form.name || !form.part_number) {
        throw new Error('Name and Part Number are required');
      }

      if (initial._id) {
        await api.put(`/components/${initial._id}`, form);
      } else {
        await api.post('/components/', form);
      }
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card animate-slide-in">
      <div className="card-header">
        <h3 className="text-xl font-bold text-gray-900">
          {initial._id ? 'Edit Component' : 'Add New Component'}
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Component Name */}
        <div className="form-group">
          <label className="form-label">
            Component Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., Motor Bearing, Hydraulic Pump"
          />
        </div>

        {/* Part Number */}
        <div className="form-group">
          <label className="form-label">
            Part Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="part_number"
            value={form.part_number}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., PN-2024-001"
          />
        </div>

        {/* Condition and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Condition</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="form-select"
            >
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="replaced">Replaced</option>
            </select>
          </div>
        </div>

        {/* Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Lifespan (hours)</label>
            <input
              type="number"
              name="lifespan_hours"
              value={form.lifespan_hours}
              onChange={handleChange}
              min="0"
              className="form-input"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Expected operational lifespan</p>
          </div>

          <div className="form-group">
            <label className="form-label">Current Hours</label>
            <input
              type="number"
              name="current_hours"
              value={form.current_hours}
              onChange={handleChange}
              min="0"
              className="form-input"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Current operating hours</p>
          </div>
        </div>

        {/* Usage Progress Bar */}
        {form.lifespan_hours > 0 && (
          <div className="form-group">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Usage</span>
              <span className="font-medium">
                {Math.round((form.current_hours / form.lifespan_hours) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  (form.current_hours / form.lifespan_hours) > 0.9 ? 'bg-red-500' :
                  (form.current_hours / form.lifespan_hours) > 0.7 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min((form.current_hours / form.lifespan_hours) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
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
              {initial._id ? 'Save Changes' : 'Add Component'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}