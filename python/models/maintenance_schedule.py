from datetime import datetime
from bson import ObjectId

class MaintenanceSchedule:
    """Model untuk Maintenance Scheduling"""
    
    def __init__(self, db):
        self.collection = db['maintenance_schedules']
    
    def create_schedule(self, data):
        """Buat jadwal maintenance baru"""
        schedule = {
            'machine_id': data['machine_id'],
            'component_id': data.get('component_id', None),
            'title': data['title'],
            'description': data.get('description', ''),
            'frequency': data['frequency'],  # daily, weekly, monthly, quarterly, yearly
            'frequency_value': data.get('frequency_value', 1),
            'scheduled_date': data['scheduled_date'],
            'estimated_duration': data.get('estimated_duration', 0),
            'task_list': data.get('task_list', []),
            'assigned_to': data.get('assigned_to', None),
            'status': data.get('status', 'scheduled'),  # scheduled, completed, skipped, overdue
            'is_recurring': data.get('is_recurring', False),
            'last_completed': None,
            'next_scheduled': data['scheduled_date'],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.collection.insert_one(schedule)
        return str(result.inserted_id)
    
    def get_upcoming_schedules(self, days=30):
        """Ambil jadwal maintenance yang akan datang"""
        from datetime import timedelta
        end_date = datetime.utcnow() + timedelta(days=days)
        
        schedules = list(self.collection.find({
            'next_scheduled': {'$lte': end_date},
            'status': {'$in': ['scheduled', 'overdue']}
        }).sort('next_scheduled', 1))
        
        for schedule in schedules:
            schedule['_id'] = str(schedule['_id'])
        return schedules
    
    def mark_completed(self, schedule_id):
        """Tandai schedule sebagai selesai"""
        schedule = self.collection.find_one({'_id': ObjectId(schedule_id)})
        
        if not schedule:
            return False
        
        update_data = {
            'status': 'completed',
            'last_completed': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Jika recurring, hitung next schedule
        if schedule.get('is_recurring'):
            from datetime import timedelta
            frequency_map = {
                'daily': 1,
                'weekly': 7,
                'monthly': 30,
                'quarterly': 90,
                'yearly': 365
            }
            days = frequency_map.get(schedule['frequency'], 30) * schedule.get('frequency_value', 1)
            update_data['next_scheduled'] = datetime.utcnow() + timedelta(days=days)
            update_data['status'] = 'scheduled'
        
        result = self.collection.update_one(
            {'_id': ObjectId(schedule_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0