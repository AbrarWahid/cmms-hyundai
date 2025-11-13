import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import MachineForm from '../../components/MachineForm';
import ComponentForm from '../../components/ComponentForm';
import api from '../../services/api';
import { 
  FiArrowLeft, FiPlus, FiEdit2, FiTrash2, 
  FiTool, FiActivity, FiClock, FiMapPin 
} from 'react-icons/fi';

export default function MachineDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [machine, setMachine] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadMachineData();
    }
  }, [id]);

  const loadMachineData = async () => {
    try {
      setLoading(true);
      const [machineRes, componentsRes] = await Promise.all([
        api.get(`/machines/${id}`),
        api.get(`/components/machine/${id}`)
      ]);
      setMachine(machineRes.data.data);
      setComponents(componentsRes.data.data || []);
    } catch (err) {
      console.error('Error loading machine:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComponent = async (component) => {
    if (!confirm(`Delete component "${component.name}"?`)) return;
    
    try {
      await api.delete(`/components/${component._id}`);
      loadMachineData();
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.error || err.message));
    }
  };

  const handleEditComponent = (component) => {
    setEditingComponent(component);
    setShowComponentForm(true);
  };

  const handleAddComponent = () => {
    setEditingComponent(null);
    setShowComponentForm(true);
  };

  const getConditionBadge = (condition) => {
    const badges = {
      good: 'badge-success',
      fair: 'badge-warning',
      poor: 'badge bg-orange-100 text-orange-800',
      critical: 'badge-danger'
    };
    return badges[condition] || 'badge-secondary';
  };

  const getStatusBadge = (status) => {
    const badges = {
      operational: 'status-operational',
      maintenance: 'status-maintenance',
      broken: 'status-broken'
    };
    return badges[status] || 'badge-secondary';
  };

  if (!id) return null;

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading machine details...</p>
        </div>
      </Layout>
    );
  }

  if (!machine) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Machine not found</h3>
          <button onClick={() => router.push('/machines')} className="btn btn-primary mt-4">
            Back to Machines
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/machines')}
              className="btn btn-secondary btn-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{machine.name}</h1>
              <p className="text-gray-600 mt-1">{machine.model} • {machine.serial_number}</p>
            </div>
          </div>
          <span className={`${getStatusBadge(machine.status)} text-lg`}>
            {machine.status}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiTool className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Components</p>
                <p className="text-xl font-bold text-gray-900">{components.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiActivity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Good Condition</p>
                <p className="text-xl font-bold text-gray-900">
                  {components.filter(c => c.condition === 'good').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiActivity className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-xl font-bold text-gray-900">
                  {components.filter(c => c.condition === 'critical').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiMapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-sm font-bold text-gray-900">{machine.location || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'components'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Components ({components.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MachineForm 
                initial={machine}
                onSuccess={loadMachineData}
              />
            </div>
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Serial Number</p>
                    <p className="font-medium text-gray-900">{machine.serial_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Model</p>
                    <p className="font-medium text-gray-900">{machine.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{machine.location || 'Not specified'}</p>
                  </div>
                  {machine.installation_date && (
                    <div>
                      <p className="text-sm text-gray-600">Installation Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(machine.installation_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="btn btn-primary w-full">
                    Create Work Order
                  </button>
                  <button className="btn btn-secondary w-full">
                    Schedule Maintenance
                  </button>
                  <button className="btn btn-secondary w-full">
                    View History
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Components</h2>
              <button
                onClick={handleAddComponent}
                className="btn btn-accent"
              >
                <FiPlus className="w-5 h-5" />
                Add Component
              </button>
            </div>

            {showComponentForm && (
              <ComponentForm
                machineId={id}
                initial={editingComponent}
                onSuccess={() => {
                  setShowComponentForm(false);
                  setEditingComponent(null);
                  loadMachineData();
                }}
                onCancel={() => {
                  setShowComponentForm(false);
                  setEditingComponent(null);
                }}
              />
            )}

            {components.length === 0 ? (
              <div className="card text-center py-12">
                <FiTool className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No components yet</h3>
                <p className="text-gray-600 mb-4">Add components to track this machine's parts</p>
                <button onClick={handleAddComponent} className="btn btn-accent">
                  <FiPlus className="w-5 h-5" />
                  Add First Component
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {components.map((component) => (
                  <div key={component._id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{component.name}</h3>
                        <p className="text-sm text-gray-500">PN: {component.part_number}</p>
                      </div>
                      <span className={`${getConditionBadge(component.condition)}`}>
                        {component.condition}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">{component.status}</span>
                      </div>
                      {component.lifespan_hours > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Lifespan:</span>
                          <span className="font-medium">{component.lifespan_hours}h</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={() => handleEditComponent(component)}
                        className="btn btn-secondary btn-sm flex-1"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComponent(component)}
                        className="btn btn-danger btn-sm"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}