from datetime import datetime
from bson import ObjectId

class Component:
    """Model untuk komponen mesin"""
    
    def __init__(self, db):
        self.collection = db['components']
    
    def create_component(self, data):
        """Buat komponen baru"""
        component = {
            'machine_id': data['machine_id'],
            'name': data['name'],
            'part_number': data['part_number'],
            'condition': data.get('condition', 'good'),  # good, fair, poor, critical
            'status': data.get('status', 'active'),  # active, inactive, replaced
            'installation_date': data.get('installation_date', datetime.utcnow()),
            'last_inspection': None,
            'next_inspection': None,
            'lifespan_hours': data.get('lifespan_hours', 0),
            'current_hours': data.get('current_hours', 0),
            'specifications': data.get('specifications', {}),
            'condition_history': data.get('condition_history', []),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.collection.insert_one(component)
        return str(result.inserted_id)
    
    def get_components_by_machine(self, machine_id):
        """Ambil semua komponen berdasarkan mesin"""
        components = list(self.collection.find({'machine_id': machine_id}))
        for component in components:
            component['_id'] = str(component['_id'])
        return components
    
    def get_component_by_id(self, component_id):
        """Ambil komponen berdasarkan ID"""
        component = self.collection.find_one({'_id': ObjectId(component_id)})
        if component:
            component['_id'] = str(component['_id'])
        return component
    
    def update_component(self, component_id, data):
        """Update data komponen (partial allowed)"""
        data['updated_at'] = datetime.utcnow()
        # do not allow changing _id
        if '_id' in data:
            data.pop('_id')
        result = self.collection.update_one(
            {'_id': ObjectId(component_id)},
            {'$set': data}
        )
        return result.modified_count > 0
    
    def update_condition(self, component_id, condition, notes=''):
        """Update kondisi komponen"""
        result = self.collection.update_one(
            {'_id': ObjectId(component_id)},
            {
                '$set': {
                    'condition': condition,
                    'last_inspection': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                },
                '$push': {
                    'condition_history': {
                        'condition': condition,
                        'notes': notes,
                        'timestamp': datetime.utcnow()
                    }
                }
            }
        )
        return result.modified_count > 0

    def delete_component(self, component_id):
        """Hapus komponen"""
        result = self.collection.delete_one({'_id': ObjectId(component_id)})
        return result.deleted_count > 0