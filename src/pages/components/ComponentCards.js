export default function ComponentCard({ component = {}, onEdit = () => {}, onDelete = () => {} }) {
  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0' }}>{component?.name || '-'}</h3>
          <div className="small">PN: {component?.part_number || '-'}</div>
          <div className="small" style={{ marginTop: 6 }}>
            Condition: <strong>{component?.condition || '-'}</strong> • Status: {component?.status || '-'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => onEdit(component)}
            className="card small"
            style={{ background: '#fff', border: '1px solid #eee' }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(component)}
            className="card small"
            style={{ background: '#ff6a00', color: '#fff', border: 'none' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
