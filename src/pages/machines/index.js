import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  FiTool, FiPlus, FiEdit2, FiTrash2, FiEye, 
  FiSearch, FiFilter, FiDownload 
} from 'react-icons/fi';

export default function MachinesPage() {
  const router = useRouter();
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadMachines();
  }, []);

  useEffect(() => {
    filterMachines();
  }, [searchTerm, statusFilter, machines]);

  const loadMachines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/machines/');
      setMachines(response.data.data || []);
    } catch (err) {
      console.error('Error loading machines:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterMachines = () => {
    let filtered = machines;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    setFilteredMachines(filtered);
  };

  const handleDelete = async (machine) => {
    if (!confirm(`Are you sure you want to delete "${machine.name}"?`)) return;
    
    try {
      await api.delete(`/machines/${machine._id}`);
      loadMachines();
    } catch (err) {
      alert('Error deleting machine: ' + (err?.response?.data?.error || err.message));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      operational: 'status-operational',
      maintenance: 'status-maintenance',
      broken: 'status-broken'
    };
    return badges[status] || 'badge-secondary';
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'operational', label: 'Operational' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'broken', label: 'Broken' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Machines</h1>
            <p className="text-gray-600 mt-1">Manage all your machines and equipment</p>
          </div>
          <button 
            onClick={() => router.push('/machines/new')}
            className="btn btn-accent"
          >
            <FiPlus className="w-5 h-5" />
            Add Machine
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search machines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              
              <button className="btn btn-secondary">
                <FiDownload className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total Machines</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{machines.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Operational</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {machines.filter(m => m.status === 'operational').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Maintenance</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {machines.filter(m => m.status === 'maintenance').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Broken</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {machines.filter(m => m.status === 'broken').length}
            </p>
          </div>
        </div>

        {/* Machines List */}
        {loading ? (
          <div className="card text-center py-12">
            <div className="spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading machines...</p>
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="card text-center py-12">
            <FiTool className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No machines found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first machine'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button 
                onClick={() => router.push('/machines/new')}
                className="btn btn-accent"
              >
                <FiPlus className="w-5 h-5" />
                Add Your First Machine
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map((machine) => (
              <div key={machine._id} className="card hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <FiTool className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{machine.name}</h3>
                      <p className="text-sm text-gray-500">{machine.model}</p>
                    </div>
                  </div>
                  <span className={`${getStatusBadge(machine.status)}`}>
                    {machine.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Serial Number:</span>
                    <span className="font-medium text-gray-900">{machine.serial_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">{machine.location || 'N/A'}</span>
                  </div>
                  {machine.installation_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Installed:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(machine.installation_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => router.push(`/machines/${machine._id}`)}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <FiEye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(machine)}
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
    </Layout>
  );
}