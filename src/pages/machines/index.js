import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  FiTool, FiPlus, FiTrash2, FiEye, 
  FiSearch, FiDownload, FiAlertCircle 
} from 'react-icons/fi';

export default function MachinesPage() {
  const router = useRouter();
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMachines();
  }, []);

  useEffect(() => {
    filterMachines();
  }, [searchTerm, statusFilter, machines]);

  const loadMachines = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/machines/');
      setMachines(response.data.data || []);
    } catch (err) {
      console.error('Error loading machines:', err);
      setError(err?.response?.data?.error || err.message || 'Failed to load machines');
    } finally {
      setLoading(false);
    }
  };

  const filterMachines = () => {
    let filtered = machines;

    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    setFilteredMachines(filtered);
  };

  const handleDelete = async (machine) => {
    if (!confirm(`Are you sure you want to delete "${machine.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/machines/${machine._id}`);
      // Update local state immediately for better UX
      setMachines(machines.filter(m => m._id !== machine._id));
    } catch (err) {
      alert('Error deleting machine: ' + (err?.response?.data?.error || err.message));
    }
  };

  const handleView = (machineId) => {
    router.push(`/machines/${machineId}`);
  };

  const handleExport = () => {
    if (filteredMachines.length === 0) {
      alert('No machines to export');
      return;
    }

    try {
      // Create CSV content
      const headers = ['Name', 'Model', 'Serial Number', 'Location', 'Status', 'Installation Date'];
      const rows = filteredMachines.map(m => [
        m.name,
        m.model,
        m.serial_number,
        m.location || 'N/A',
        m.status,
        m.installation_date ? new Date(m.installation_date).toLocaleDateString() : 'N/A'
      ]);

      let csvContent = headers.join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `machines-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export machines');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      operational: 'bg-green-100 text-green-800 border-green-200',
      maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      broken: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'operational', label: 'Operational' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'broken', label: 'Broken' }
  ];

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Machines</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={loadMachines}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
          >
            Try Again
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiTool className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Machines</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all your machines and equipment</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/machines/new')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-medium"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Machine</span>
          </button>
        </div>

        {/* Stats Summary */}
        {!loading && machines.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Machines</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{machines.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Operational</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {machines.filter(m => m.status === 'operational').length}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Maintenance</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                {machines.filter(m => m.status === 'maintenance').length}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Broken</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                {machines.filter(m => m.status === 'broken').length}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search machines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              
              <button 
                onClick={handleExport}
                disabled={filteredMachines.length === 0}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDownload className="w-5 h-5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Machines List */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading machines...</p>
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 text-center shadow-sm">
            <FiTool className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {machines.length === 0 ? 'No machines yet' : 'No machines found'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {machines.length === 0 
                ? 'Get started by adding your first machine' 
                : 'Try adjusting your filters or search terms'}
            </p>
            {machines.length === 0 && (
              <button 
                onClick={() => router.push('/machines/new')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-medium"
              >
                <FiPlus className="w-5 h-5" />
                Add Your First Machine
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMachines.map((machine) => (
              <div key={machine._id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiTool className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{machine.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{machine.model}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${getStatusBadge(machine.status)}`}>
                    {machine.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Serial:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{machine.serial_number}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">{machine.location || 'N/A'}</span>
                  </div>
                  {machine.installation_date && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Installed:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(machine.installation_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleView(machine._id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiEye className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  <button
                    onClick={() => handleDelete(machine)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
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