import { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../services/api';
import ComponentCard from './ComponentCards';
import ComponentForm from './ComponentForm';
import { FiPlus, FiTool, FiAlertCircle } from 'react-icons/fi';

export default function ComponentsPage() {
  const [stats, setStats] = useState(null);
  const [components, setComponents] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, machinesRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/machines/')
      ]);
      
      setStats(statsRes.data?.data ?? statsRes.data ?? null);
      setMachines(machinesRes.data?.data ?? []);
      
      // Load all components
      const allComponents = [];
      for (const machine of machinesRes.data?.data ?? []) {
        try {
          const compRes = await api.get(`/components/machine/${machine._id}`);
          const comps = (compRes.data?.data ?? []).map(c => ({
            ...c,
            machine_name: machine.name
          }));
          allComponents.push(...comps);
        } catch (err) {
          console.error(`Error loading components for machine ${machine._id}:`, err);
        }
      }
      setComponents(allComponents);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (component) => {
    setEditingComponent(component);
    setShowForm(true);
  };

  const handleDelete = async (component) => {
    if (!confirm(`Delete component "${component.name}"?`)) return;
    
    try {
      await api.delete(`/components/${component._id}`);
      loadData();
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.error || err.message));
    }
  };

  const handleAddNew = () => {
    setEditingComponent(null);
    setShowForm(true);
  };

  const filteredComponents = selectedMachine === 'all' 
    ? components 
    : components.filter(c => c.machine_id === selectedMachine);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiTool className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Components</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Manage machine components and parts
              </p>
            </div>
          </div>
          <button 
            onClick={handleAddNew}
            className="btn btn-accent"
          >
            <FiPlus className="w-5 h-5" />
            Add Component
          </button>
        </div>

        {/* Dashboard Stats */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="spinner w-12 h-12 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm">
              <p className="text-xs text-gray-600">Total Machines</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                {stats.total_machines}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm">
              <p className="text-xs text-gray-600">Active Work Orders</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600 mt-1">
                {stats.active_work_orders}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm">
              <p className="text-xs text-gray-600">Upcoming (7d)</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-600 mt-1">
                {stats.upcoming_maintenance}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm">
              <p className="text-xs text-gray-600">Low Stock</p>
              <p className="text-xl md:text-2xl font-bold text-orange-600 mt-1">
                {stats.low_stock_items}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm">
              <p className="text-xs text-gray-600">Critical</p>
              <p className="text-xl md:text-2xl font-bold text-red-600 mt-1">
                {stats.critical_components}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm">
              <p className="text-xs text-gray-600">Overdue</p>
              <p className="text-xl md:text-2xl font-bold text-red-600 mt-1">
                {stats.overdue_compliance}
              </p>
            </div>
          </div>
        ) : null}

        {/* Component Form */}
        {showForm && (
          <ComponentForm
            machineId={machines.length > 0 ? machines[0]._id : null}
            initial={editingComponent}
            onSuccess={() => {
              setShowForm(false);
              setEditingComponent(null);
              loadData();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingComponent(null);
            }}
          />
        )}

        {/* Filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Machine
          </label>
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="form-select w-full"
          >
            <option value="all">All Machines</option>
            {machines.map(m => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.model})
              </option>
            ))}
          </select>
        </div>

        {/* Components List */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="spinner w-12 h-12 mx-auto mb-4" />
            <p className="text-gray-600">Loading components...</p>
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 md:p-12 text-center">
            <FiTool className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              No components found
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedMachine === 'all' 
                ? 'Get started by adding your first component' 
                : 'No components for this machine. Add one to get started.'}
            </p>
            <button onClick={handleAddNew} className="btn btn-accent">
              <FiPlus className="w-5 h-5" />
              Add First Component
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Components ({filteredComponents.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredComponents.map((component) => (
                <ComponentCard
                  key={component._id}
                  component={component}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}