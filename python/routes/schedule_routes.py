from flask import Blueprint, request, jsonify
from models.maintenance_schedule import MaintenanceSchedule
from database import get_db

schedule_bp = Blueprint('schedules', __name__, url_prefix='/api/schedules')

@schedule_bp.route('/', methods=['POST'])
def create_schedule():
    """POST buat jadwal maintenance baru"""
    try:
        data = request.get_json()
        db = get_db()
        schedule_model = MaintenanceSchedule(db)
        schedule_id = schedule_model.create_schedule(data)
        return jsonify({'success': True, 'schedule_id': schedule_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@schedule_bp.route('/upcoming', methods=['GET'])
def get_upcoming_schedules():
    """GET jadwal maintenance yang akan datang"""
    try:
        days = request.args.get('days', default=30, type=int)
        db = get_db()
        schedule_model = MaintenanceSchedule(db)
        schedules = schedule_model.get_upcoming_schedules(days)
        return jsonify({'success': True, 'data': schedules}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@schedule_bp.route('/<schedule_id>/complete', methods=['PUT'])
def mark_completed(schedule_id):
    """PUT tandai schedule sebagai selesai"""
    try:
        db = get_db()
        schedule_model = MaintenanceSchedule(db)
        success = schedule_model.mark_completed(schedule_id)
        if success:
            return jsonify({'success': True, 'message': 'Schedule marked as completed'}), 200
        return jsonify({'success': False, 'error': 'Schedule not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500