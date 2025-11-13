export default function MachineCard({ machine }) {
  return (
    <div className="card">
      <h3 style={{margin:'0 0 8px 0'}}>{machine.name}</h3>
      <div className="small">Model: {machine.model} • SN: {machine.serial_number}</div>
      <div style={{marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div className="small">Status: <strong>{machine.status}</strong></div>
        <div className="small">Location: {machine.location || '-'}</div>
      </div>
    </div>
  );
}