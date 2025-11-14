import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import api from './services/api';
import { 
  FiTool, FiClipboard, FiClock, FiPackage, 
  FiAlertTriangle, FiAlertCircle, FiActivity 
} from 'react-icons/fi';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/dashboard');
      setStats(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-16 h-16 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={loadStats}
            className="btn btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      icon: FiTool,
      label: 'Total Machines',
      value: stats?.total_machines || 0,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-900'
    },
    {
      icon: FiClipboard,
      label: 'Active Work Orders',
      value: stats?.active_work_orders || 0,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      valueColor: 'text-green-900'
    },
    {
      icon: FiClock,
      label: 'Upcoming Maintenance (7d)',
      value: stats?.upcoming_maintenance || 0,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-900'
    },
    {
      icon: FiPackage,
      label: 'Low Stock Items',
      value: stats?.low_stock_items || 0,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-900'
    },
    {
      icon: FiAlertTriangle,
      label: 'Critical Components',
      value: stats?.critical_components || 0,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      valueColor: 'text-red-900'
    },
    {
      icon: FiAlertCircle,
      label: 'Overdue Compliance',
      value: stats?.overdue_compliance || 0,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-900'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <FiActivity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to Hyundai CMMS System</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                  </div>
                  <span className={`text-3xl font-bold ${stat.valueColor}`}>
                    {stat.value}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.label}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a 
              href="/machines/new"
              className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FiTool className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Add Machine</span>
            </a>
            <a 
              href="/work-orders"
              className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <FiClipboard className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Create Work Order</span>
            </a>
            <a 
              href="/components"
              className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FiPackage className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Manage Components</span>
            </a>
            <a 
              href="/machines"
              className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <FiActivity className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">View All Machines</span>
            </a>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">System Health</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Operational Machines</span>
                <span className="text-sm font-semibold text-green-600">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">Work Order Completion</span>
                <span className="text-sm font-semibold text-blue-600">
                  {stats?.active_work_orders > 0 ? '75%' : '0%'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: stats?.active_work_orders > 0 ? '75%' : '0%' }} 
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {stats?.total_machines > 0 ? (
                <>
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Machine registered</p>
                      <p className="text-xs text-gray-500">System initialized</p>
                    </div>
                  </div>
                  {stats?.active_work_orders > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Work order created</p>
                        <p className="text-xs text-gray-500">Maintenance scheduled</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}