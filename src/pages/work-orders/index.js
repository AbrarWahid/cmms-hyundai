import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import WorkOrderForm from '../components/WorkOrderForm';
import api from '../services/api';
import { 
  FiPlus, FiEdit2, FiTrash2, FiClock, FiUser,
  FiAlertCircle, FiCheckCircle, FiFilter, FiSearch 
} from 'react-icons/fi';

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [machines, setMachines] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWO, setEditingWO] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterWorkOrders();
  }, [searchTerm, statusFilter, priorityFilter, workOrders]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [woRes, machinesRes] = await Promise.all([
        api.get('/work-orders/'),
        api.get('/machines/')
      ]);
      setWorkOrders(woRes.data.data || []);
      setMachines(machinesRes.data.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterWorkOrders = () => {
    let filtered = workOrders;

    if (searchTerm) {
      filtered = filtered.filter(wo =>
        wo.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(wo => wo.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(wo => wo.priority === priorityFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleCreate = () => {
    setEditingWO(null);
    setShowForm(true);
  };

  const handleEdit = (wo) => {
    setEditingWO(wo);
    setShowForm(true);
  };

  const handleDelete = async (wo) => {
    if (!confirm(`Delete work order "${wo.order_number}"?`)) return;
    
    try {
      await api.delete(`/work-orders/${wo._id}`);
      loadData();
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.error || err.message));
    }
  };

  const handleStatusChange = async (wo, newStatus) => {
    try {
      await api.put(`/work-orders/${wo._id}/status`, { status: newStatus });
      loadData();
    } catch (err) {
      alert('Error: ' + (err?.response?.data?.error || err.message));
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      critical: 'priority-critical'
    };
    return badges[priority] || 'badge-secondary';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'status-pending',
      in_progress: 'status-in_progress',
      completed: 'status-completed',
      cancelled: 'badge bg-gray-100 text-gray-800'
    };
    return badges[status] || 'badge-secondary';
  };

  const stats = {
    total: workOrders.length,
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    in_progress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    critical: workOrders.filter(wo => wo.priority === 'critical').length
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
            <p className="text-gray-600 mt-1">Manage maintenance work orders</p>
          </div>
          <button onClick={handleCreate} className="btn btn-accent">
            <FiPlus className="w-5 h-5" />
            Create Work Order
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.in_progress}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Critical</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Work Order Form */}
        {showForm && (
          <WorkOrderForm
            initial={editingWO}
            machines={machines}
            onSuccess={() => {
              setShowForm(false);
              setEditingWO(null);
              loadData();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingWO(null);
            }}
          />
        )}

        {/* Work Orders List */}
        {loading ? (
          <div className="card text-center py-12">
            <div className="spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading work orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card text-center py-12">
            <FiAlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No work orders found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first work order to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
              <button onClick={handleCreate} className="btn btn-accent">
                <FiPlus className="w-5 h-5" />
                Create First Work Order
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((wo) => {
              const machine = machines.find(m => m._id === wo.machine_id);
              return (
                <div key={wo._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {wo.order_number}
                        </h3>
                        <span className={`${getPriorityBadge(wo.priority)}`}>
                          {wo.priority}
                        </span>
                        <span className={`${getStatusBadge(wo.status)}`}>
                          {wo.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{wo.title}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {machine && (
                          <div className="flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            <span>{machine.name}</span>
                          </div>
                        )}
                        {wo.type && (
                          <div className="flex items-center gap-1">
                            <FiCheckCircle className="w-4 h-4" />
                            <span>{wo.type}</span>
                          </div>
                        )}
                        {wo.assigned_to && (
                          <div className="flex items-center gap-1">
                            <FiUser className="w-4 h-4" />
                            <span>{wo.assigned_to}</span>
                          </div>
                        )}
                        {wo.estimated_hours > 0 && (
                          <div className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            <span>{wo.estimated_hours}h estimated</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {wo.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(wo, 'in_progress')}
                          className="btn btn-primary btn-sm"
                        >
                          Start
                        </button>
                      )}
                      {wo.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusChange(wo, 'completed')}
                          className="btn btn-success btn-sm"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(wo)}
                        className="btn btn-secondary btn-sm"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(wo)}
                        className="btn btn-danger btn-sm"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}