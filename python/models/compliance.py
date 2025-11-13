from datetime import datetime
from bson import ObjectId

class Compliance:
    """Model untuk Compliance Tracking"""
    
    def __init__(self, db):
        self.collection = db['compliance']
    
    def create_compliance(self, data):
        """Buat record compliance baru"""
        compliance = {
            'regulation': data['regulation'],
            'category': data['category'],  # safety, environmental, quality, labor
            'description': data['description'],
            'requirements': data.get('requirements', []),
            'responsible_party': data['responsible_party'],
            'frequency': data['frequency'],  # monthly, quarterly, annually
            'due_date': data['due_date'],
            'status': data.get('status', 'pending'),  # pending, compliant, non_compliant, overdue
            'last_checked': None,
            'evidence': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.collection.insert_one(compliance)
        return str(result.inserted_id)
    
    def update_compliance_status(self, compliance_id, status, evidence=None):
        """Update status compliance"""
        update_data = {
            'status': status,
            'last_checked': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        if evidence:
            result = self.collection.update_one(
                {'_id': ObjectId(compliance_id)},
                {
                    '$set': update_data,
                    '$push': {'evidence': {
                        'description': evidence,
                        'timestamp': datetime.utcnow()
                    }}
                }
            )
        else:
            result = self.collection.update_one(
                {'_id': ObjectId(compliance_id)},
                {'$set': update_data}
            )
        
        return result.modified_count > 0
    
    def get_overdue_compliance(self):
        """Ambil compliance yang overdue"""
        compliance = list(self.collection.find({
            'due_date': {'$lt': datetime.utcnow()},
            'status': {'$in': ['pending', 'overdue']}
        }))
        
        for c in compliance:
            c['_id'] = str(c['_id'])
        return compliance