import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ComponentForm from '../components/ComponentForm';
import api from '../services/api';
import { 
  FiArrowLeft, FiPlus, FiEdit2, FiTrash2, 
  FiTool, FiActivity, FiMapPin, 
  FiClipboard, FiCalendar, FiFileText, FiAlertCircle
} from 'react-icons/fi';

export default function MachineDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [machine, setMachine] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [quickActionType, setQuickActionType] = useState('');

  useEffect(() => {
    if (id) {
      loadMachineData();
    }
  }, [id]);

  const loadMachineData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [machineRes, componentsRes] = await Promise.all([
        api.get(`/machines/${id}`),
        api.get(`/components/machine/${id}`)
      ]);
      setMachine(machineRes.data.data);
      setComponents(componentsRes.data.data || []);
    } catch (err) {
      console.error('Error loading machine:', err);
      setError(err?.response?.data?.error || err.message || 'Failed to load machine data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComponent = async (component) => {
    if (!confirm(`Delete component "${component.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/components/${component._id}`);
      setComponents(components.filter(c => c._id !== component._id));
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

  const handleQuickAction = (actionType) => {
    setQuickActionType(actionType);
    setShowQuickActionModal(true);
  };

  const getConditionBadge = (condition) => {
    const badges = {
      good: 'bg-green-100 text-green-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return badges[condition] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    const badges = {
      operational: 'bg-green-100 text-green-800 border-green-200',
      maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      broken: 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Quick Action Modal Component
  const QuickActionModal = ({ type, onClose }) => {
    const actionDetails = {
      'work-order': {
        title: 'Create Work Order',
        icon: FiClipboard,
        description: 'Create a new maintenance work order for this machine.',
        buttonText: 'Go to Work Orders',
        buttonAction: () => router.push('/work-orders')
      },
      'schedule': {
        title: 'Schedule Maintenance',
        icon: FiCalendar,
        description: 'Schedule preventive maintenance for this machine.',
        buttonText: 'Coming Soon',
        buttonAction: () => alert('Schedule Maintenance feature coming soon!')
      },
      'history': {
        title: 'View History',
        icon: FiFileText,
        description: 'View maintenance history and logs for this machine.',
        buttonText: 'Coming Soon',
        buttonAction: () => alert('History feature coming soon!')
      }
    };

    const action = actionDetails[type];
    const Icon = action.icon;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{action.title}</h3>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-600 mb-4">{action.description}</p>
            
            {machine && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Machine:</p>
                <p className="font-semibold text-gray-900">{machine.name}</p>
                <p className="text-sm text-gray-500">{machine.model} • {machine.serial_number}</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  action.buttonAction();
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {action.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!id) return null;

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading machine details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !machine) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {error ? 'Error Loading Machine' : 'Machine Not Found'}
          </h3>
          <p className="text-red-700 mb-4">{error || 'The machine you are looking for does not exist.'}</p>
          <button 
            onClick={() => router.push('/machines')} 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <FiArrowLeft className="w-4 h-4" />
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/machines')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{machine.name}</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {machine.model} • {machine.serial_number}
              </p>
            </div>
          </div>
          <span className={`self-start sm:self-auto inline-flex px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusBadge(machine.status)}`}>
            {machine.status}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiTool className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Components</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{components.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiActivity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Good</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {components.filter(c => c.condition === 'good').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiActivity className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Critical</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {components.filter(c => c.condition === 'critical').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Location</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{machine.location || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex gap-4 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'components'
                  ? 'border-orange-600 text-orange-600'
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
            <div className="lg:col-span-2 space-y-6">
              {/* Machine Info Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Serial Number</p>
                    <p className="font-medium text-gray-900">{machine.serial_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Model</p>
                    <p className="font-medium text-gray-900">{machine.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-medium text-gray-900">{machine.location || 'Not specified'}</p>
                  </div>
                  {machine.installation_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Installation Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(machine.installation_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleQuickAction('work-order')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <FiClipboard className="w-5 h-5" />
                    <span>Create Work Order</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('schedule')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <FiCalendar className="w-5 h-5" />
                    <span>Schedule Maintenance</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('history')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <FiFileText className="w-5 h-5" />
                    <span>View History</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">Components</h2>
              <button
                onClick={handleAddComponent}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Component</span>
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
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                <FiTool className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No components yet</h3>
                <p className="text-gray-600 mb-4">Add components to track this machine's parts</p>
                <button 
                  onClick={handleAddComponent}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <FiPlus className="w-5 h-5" />
                  Add First Component
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {components.map((component) => {
                  const usage = component.lifespan_hours > 0 
                    ? Math.min((component.current_hours / component.lifespan_hours) * 100, 100)
                    : 0;

                  return (
                    <div key={component._id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{component.name}</h3>
                          <p className="text-sm text-gray-500 truncate">PN: {component.part_number}</p>
                        </div>
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getConditionBadge(component.condition)}`}>
                          {component.condition}
                        </span>
                      </div>

                      {component.lifespan_hours > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Usage</span>
                            <span className="font-medium">{Math.round(usage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                usage > 90 ? 'bg-red-500' : usage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${usage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleEditComponent(component)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteComponent(component)}
                          className="inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Action Modal */}
      {showQuickActionModal && (
        <QuickActionModal
          type={quickActionType}
          onClose={() => setShowQuickActionModal(false)}
        />
      )}
    </Layout>
  );
}