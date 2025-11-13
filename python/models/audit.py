from datetime import datetime
from bson import ObjectId

class Audit:
    """Model untuk Audits"""
    
    def __init__(self, db):
        self.collection = db['audits']
    
    def create_audit(self, data):
        """Buat audit baru"""
        audit = {
            'audit_number': data['audit_number'],
            'title': data['title'],
            'audit_type': data['audit_type'],  # safety, quality, compliance, performance
            'machine_id': data.get('machine_id', None),
            'auditor': data['auditor'],
            'scheduled_date': data['scheduled_date'],
            'completed_date': None,
            'status': data.get('status', 'scheduled'),  # scheduled, in_progress, completed
            'checklist': data.get('checklist', []),
            'findings': [],
            'score': None,
            'recommendation': '',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.collection.insert_one(audit)
        return str(result.inserted_id)
    
    def add_finding(self, audit_id, finding):
        """Tambah temuan audit"""
        finding_data = {
            'title': finding['title'],
            'severity': finding['severity'],  # low, medium, high, critical
            'description': finding['description'],
            'recommendation': finding.get('recommendation', ''),
            'timestamp': datetime.utcnow()
        }
        
        result = self.collection.update_one(
            {'_id': ObjectId(audit_id)},
            {
                '$push': {'findings': finding_data},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        return result.modified_count > 0
    
    def complete_audit(self, audit_id, score, recommendation):
        """Tandai audit selesai"""
        result = self.collection.update_one(
            {'_id': ObjectId(audit_id)},
            {
                '$set': {
                    'status': 'completed',
                    'completed_date': datetime.utcnow(),
                    'score': score,
                    'recommendation': recommendation,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0