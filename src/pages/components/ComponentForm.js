import { useState, useEffect } from 'react';
import { FiSave, FiX, FiLoader } from 'react-icons/fi';
import api from '../services/api';

export default function ComponentForm({ machineId, initial = {}, onSuccess, onCancel }) {
  // protect against parent explicitly passing null
  const safeInitial = initial || {};

  const [form, setForm] = useState(() => ({
    machine_id: machineId || '',
    name: '',
    part_number: '',
    condition: 'good',
    status: 'active',
    lifespan_hours: '',
    current_hours: '',
    notes: '',
    ...safeInitial
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Sync when initial or machineId changes
  useEffect(() => {
    const si = initial || {};
    if (Object.keys(si).length > 0) {
      setForm(prev => ({
        ...prev,
        ...si,
        machine_id: si.machine_id ?? machineId ?? prev.machine_id,
        // normalize numbers to '' or numbers
        lifespan_hours: si.lifespan_hours === undefined || si.lifespan_hours === null ? prev.lifespan_hours ?? '' : si.lifespan_hours,
        current_hours: si.current_hours === undefined || si.current_hours === null ? prev.current_hours ?? '' : si.current_hours,
        notes: si.notes ?? prev.notes ?? ''
      }));
    } else {
      setForm({
        name: '',
        part_number: '',
        condition: 'good',
        status: 'active',
        lifespan_hours: '',
        current_hours: '',
        notes: '',
        machine_id: machineId || ''
      });
    }
  }, [initial, machineId]);

  // Keep machineId in sync if provided separately
  useEffect(() => {
    if (machineId) {
      setForm(prev => ({ ...prev, machine_id: machineId }));
    }
  }, [machineId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let val;
    if (type === 'number') {
      // allow empty string so input can be cleared without NaN
      val = value === '' ? '' : Number(value);
    } else {
      val = value;
    }
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

      const isEdit = Boolean(form._id ?? safeInitial._id);
      if (isEdit) {
        const id = form._id ?? safeInitial._id;
        await api.put(`/components/${id}`, {
          // normalize numeric fields before sending
          ...form,
          lifespan_hours: form.lifespan_hours === '' ? 0 : Number(form.lifespan_hours),
          current_hours: form.current_hours === '' ? 0 : Number(form.current_hours)
        });
      } else {
        await api.post('/components/', {
          ...form,
          lifespan_hours: form.lifespan_hours === '' ? 0 : Number(form.lifespan_hours),
          current_hours: form.current_hours === '' ? 0 : Number(form.current_hours)
        });
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to save component');
    } finally {
      setSaving(false);
    }
  };

  const isEdit = Boolean(form._id ?? safeInitial._id);

  // safe ratio for progress bar
  const lifespan = Number(form.lifespan_hours) || 0;
  const current = Number(form.current_hours) || 0;
  const ratio = lifespan > 0 ? Math.min(current / lifespan, 1) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <form onSubmit={handleSubmit} className="card animate-slide-in">
      <div className="card-header">
        <h3 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Edit Component' : 'Add New Component'}
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
            value={form.name || ''}
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
            value={form.part_number || ''}
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
              value={form.condition || 'good'}
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
              value={form.status || 'active'}
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
              value={form.lifespan_hours === '' ? '' : form.lifespan_hours}
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
              value={form.current_hours === '' ? '' : form.current_hours}
              onChange={handleChange}
              min="0"
              className="form-input"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Current operating hours</p>
          </div>
        </div>

        {/* Usage Progress Bar */}
        {lifespan > 0 && (
          <div className="form-group">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Usage</span>
              <span className="font-medium">{percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  ratio > 0.9 ? 'bg-red-500' : ratio > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{
                  width: `${percent}%`
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
              {isEdit ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              {isEdit ? 'Save Changes' : 'Add Component'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}