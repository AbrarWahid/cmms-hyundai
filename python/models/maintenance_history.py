from datetime import datetime
from bson import ObjectId

class MaintenanceHistory:
    """Model untuk Maintenance History"""
    
    def __init__(self, db):
        self.collection = db['maintenance_history']
    
    def create_history(self, data):
        """Buat record history baru"""
        history = {
            'machine_id': data['machine_id'],
            'component_id': data.get('component_id', None),
            'work_order_id': data.get('work_order_id', None),
            'maintenance_type': data['maintenance_type'],  # preventive, corrective, predictive, emergency
            'title': data['title'],
            'description': data['description'],
            'performed_by': data['performed_by'],
            'performed_at': data.get('performed_at', datetime.utcnow()),
            'duration_hours': data.get('duration_hours', 0),
            'parts_used': data.get('parts_used', []),
            'cost': data.get('cost', 0),
            'outcome': data.get('outcome', 'success'),  # success, partial, failed
            'notes': data.get('notes', ''),
            'attachments': data.get('attachments', []),
            'created_at': datetime.utcnow()
        }
        result = self.collection.insert_one(history)
        return str(result.inserted_id)
    
    def get_history_by_machine(self, machine_id, limit=50):
        """Ambil history berdasarkan mesin"""
        history = list(self.collection.find({
            'machine_id': machine_id
        }).sort('performed_at', -1).limit(limit))
        
        for h in history:
            h['_id'] = str(h['_id'])
        return history
    
    def get_history_by_component(self, component_id, limit=50):
        """Ambil history berdasarkan komponen"""
        history = list(self.collection.find({
            'component_id': component_id
        }).sort('performed_at', -1).limit(limit))
        
        for h in history:
            h['_id'] = str(h['_id'])
        return history