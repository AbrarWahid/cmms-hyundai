from datetime import datetime
from bson import ObjectId

class WorkOrder:
    """Model untuk Work Orders"""
    
    def __init__(self, db):
        self.collection = db['work_orders']
    
    def create_work_order(self, data):
        """Buat work order baru"""
        work_order = {
            'order_number': data['order_number'],
            'machine_id': data['machine_id'],
            'component_id': data.get('component_id', None),
            'title': data['title'],
            'description': data['description'],
            'priority': data.get('priority', 'medium'),  # low, medium, high, critical
            'status': data.get('status', 'pending'),  # pending, in_progress, completed, cancelled
            'type': data.get('type', 'corrective'),  # preventive, corrective, predictive
            'assigned_to': data.get('assigned_to', None),
            'estimated_hours': data.get('estimated_hours', 0),
            'actual_hours': 0,
            'scheduled_date': data.get('scheduled_date', None),
            'started_at': None,
            'completed_at': None,
            'notes': data.get('notes', []),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.collection.insert_one(work_order)
        return str(result.inserted_id)
    
    def get_all_work_orders(self, filters=None):
        """Ambil semua work orders dengan filter"""
        query = filters if filters else {}
        work_orders = list(self.collection.find(query).sort('created_at', -1))
        for wo in work_orders:
            wo['_id'] = str(wo['_id'])
        return work_orders
    
    def get_work_order_by_id(self, work_order_id):
        """Ambil work order berdasarkan ID"""
        work_order = self.collection.find_one({'_id': ObjectId(work_order_id)})
        if work_order:
            work_order['_id'] = str(work_order['_id'])
        return work_order
    
    def update_status(self, work_order_id, status):
        """Update status work order"""
        update_data = {
            'status': status,
            'updated_at': datetime.utcnow()
        }
        
        current = self.get_work_order_by_id(work_order_id) or {}
        if status == 'in_progress' and not current.get('started_at'):
            update_data['started_at'] = datetime.utcnow()
        elif status == 'completed':
            update_data['completed_at'] = datetime.utcnow()
        
        result = self.collection.update_one(
            {'_id': ObjectId(work_order_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    def add_note(self, work_order_id, note, author):
        """Tambah catatan ke work order"""
        result = self.collection.update_one(
            {'_id': ObjectId(work_order_id)},
            {
                '$push': {
                    'notes': {
                        'content': note,
                        'author': author,
                        'timestamp': datetime.utcnow()
                    }
                },
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        return result.modified_count > 0

    def update_work_order(self, work_order_id, data):
        """Update seluruh field work order (partial allowed)"""
        data['updated_at'] = datetime.utcnow()
        # prevent modifying created_at/_id
        if '_id' in data:
            data.pop('_id')
        if 'created_at' in data:
            data.pop('created_at')
        result = self.collection.update_one(
            {'_id': ObjectId(work_order_id)},
            {'$set': data}
        )
        return result.modified_count > 0

    def delete_work_order(self, work_order_id):
        """Hapus work order"""
        result = self.collection.delete_one({'_id': ObjectId(work_order_id)})
        return result.deleted_count > 0