from datetime import datetime
from bson import ObjectId

class Machine:
    """Model untuk mesin Hyundai"""
    
    def __init__(self, db):
        self.collection = db['machines']
    
    def create_machine(self, data):
        """Buat mesin baru"""
        machine = {
            'name': data['name'],
            'model': data['model'],
            'serial_number': data['serial_number'],
            'status': data.get('status', 'operational'),  # operational, maintenance, broken
            'location': data.get('location', ''),
            'installation_date': data.get('installation_date', datetime.utcnow()),
            'last_maintenance': None,
            'next_maintenance': None,
            'components': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.collection.insert_one(machine)
        return str(result.inserted_id)
    
    def get_all_machines(self):
        """Ambil semua mesin"""
        machines = list(self.collection.find())
        for machine in machines:
            machine['_id'] = str(machine['_id'])
        return machines
    
    def get_machine_by_id(self, machine_id):
        """Ambil mesin berdasarkan ID"""
        machine = self.collection.find_one({'_id': ObjectId(machine_id)})
        if machine:
            machine['_id'] = str(machine['_id'])
        return machine
    
    def update_machine(self, machine_id, data):
        """Update data mesin"""
        data['updated_at'] = datetime.utcnow()
        result = self.collection.update_one(
            {'_id': ObjectId(machine_id)},
            {'$set': data}
        )
        return result.modified_count > 0
    
    def delete_machine(self, machine_id):
        """Hapus mesin"""
        result = self.collection.delete_one({'_id': ObjectId(machine_id)})
        return result.deleted_count > 0