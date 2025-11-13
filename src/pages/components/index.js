import { useEffect, useState } from 'react';
import Layout from './Layout';
import api from '../services/api';
import MachineForm from './MachineForm';
import ComponentForm from './ComponentForm';
import ComponentCards from './ComponentCards';

export default function ComponentsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(res => {
        setStats(res.data?.data ?? res.data ?? null);
      })
      .catch(err => {
        setError(err?.response?.data?.error || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Components / Dashboard</h1>
        {loading && <p className="small">Loading...</p>}
        {error && <p className="small" style={{ color: 'crimson' }}>{error}</p>}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginTop: 12 }}>
            <div className="card">
              <div className="small">Total Machines</div>
              <h2>{stats.total_machines}</h2>
            </div>
            <div className="card">
              <div className="small">Active Work Orders</div>
              <h2>{stats.active_work_orders}</h2>
            </div>
            <div className="card">
              <div className="small">Upcoming Maintenance (7d)</div>
              <h2>{stats.upcoming_maintenance}</h2>
            </div>
            <div className="card">
              <div className="small">Low Stock Items</div>
              <h2>{stats.low_stock_items}</h2>
            </div>
            <div className="card">
              <div className="small">Critical Components</div>
              <h2>{stats.critical_components}</h2>
            </div>
            <div className="card">
              <div className="small">Overdue Compliance</div>
              <h2>{stats.overdue_compliance}</h2>
            </div>
          </div>
        )}

        {/* Example components list area */}
        <div style={{ marginTop: 12 }}>
          <h3>Components</h3>
          <ComponentCards />
        </div>

        {/* Example forms (optional) */}
        <div style={{ marginTop: 12 }}>
          <MachineForm />
          <ComponentForm />
        </div>
      </div>
    </Layout>
  );
}