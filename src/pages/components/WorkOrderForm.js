import { useState, useEffect } from 'react';
import { FiSave, FiX, FiLoader } from 'react-icons/fi';
import api from '../services/api';

export default function WorkOrderForm({ initial = null, machines = [], onSuccess, onCancel }) {
  const [form, setForm] = useState({
    order_number: '',
    machine_id: '',
    component_id: '',
    title: '',
    description: '',
    priority: 'medium',
    type: 'corrective',
    status: 'pending',
    assigned_to: '',
    estimated_hours: 0,
    scheduled_date: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [components, setComponents] = useState([]);

  useEffect(() => {
    if (initial && initial._id) {
      setForm({
        ...initial,
        scheduled_date: initial.scheduled_date 
          ? new Date(initial.scheduled_date).toISOString().split('T')[0]
          : ''
      });
    }
  }, [initial]);

  useEffect(() => {
    if (form.machine_id) {
      loadComponents(form.machine_id);
    } else {
      setComponents([]);
    }
  }, [form.machine_id]);

  const loadComponents = async (machineId) => {
    try {
      const response = await api.get(`/components/machine/${machineId}`);
      setComponents(response.data.data || []);
    } catch (err) {
      console.error('Error loading components:', err);
      setComponents([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? 0 : parseFloat(value) || 0) : value;
    setForm(f => ({ ...f, [name]: val }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!form.order_number || !form.title || !form.machine_id) {
        throw new Error('Order number, title, and machine are required');
      }

      const isEdit = initial && initial._id;
      if (isEdit) {
        await api.put(`/work-orders/${initial._id}`, form);
      } else {
        await api.post('/work-orders/', form);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const isEdit = initial && initial._id;

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm animate-slide-in">
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-900">
          {isEdit ? 'Edit Work Order' : 'Create Work Order'}
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 md:p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Order Number */}
        <div className="form-group">
          <label className="form-label">
            Order Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="order_number"
            value={form.order_number}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., WO-2024-001"
          />
        </div>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., Replace hydraulic pump"
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="form-textarea"
            placeholder="Detailed description of the work to be done..."
          />
        </div>

        {/* Machine and Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">
              Machine <span className="text-red-500">*</span>
            </label>
            <select
              name="machine_id"
              value={form.machine_id}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select machine...</option>
              {machines.map(m => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.model})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Component (Optional)</label>
            <select
              name="component_id"
              value={form.component_id}
              onChange={handleChange}
              className="form-select"
              disabled={!form.machine_id}
            >
              <option value="">No specific component</option>
              {components.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} - {c.part_number}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="form-select"
            >
              <option value="corrective">Corrective</option>
              <option value="preventive">Preventive</option>
              <option value="predictive">Predictive</option>
            </select>
          </div>
        </div>

        {/* Status (only show when editing) */}
        {isEdit && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        {/* Assigned To and Estimated Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Assigned To</label>
            <input
              type="text"
              name="assigned_to"
              value={form.assigned_to}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., John Doe"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Hours</label>
            <input
              type="number"
              name="estimated_hours"
              value={form.estimated_hours}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="form-input"
              placeholder="0"
            />
          </div>
        </div>

        {/* Scheduled Date */}
        <div className="form-group">
          <label className="form-label">Scheduled Date</label>
          <input
            type="date"
            name="scheduled_date"
            value={form.scheduled_date}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary w-full sm:w-auto"
            disabled={saving}
          >
            <FiX className="w-4 h-4" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-accent w-full sm:w-auto"
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
              {isEdit ? 'Save Changes' : 'Create Work Order'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}