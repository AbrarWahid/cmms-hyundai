from flask import Blueprint, request, jsonify
from models.maintenance_history import MaintenanceHistory
from database import get_db

history_bp = Blueprint('history', __name__, url_prefix='/api/history')

@history_bp.route('/', methods=['POST'])
def create_history():
    """POST buat record history baru"""
    try:
        data = request.get_json()
        db = get_db()
        history_model = MaintenanceHistory(db)
        history_id = history_model.create_history(data)
        return jsonify({'success': True, 'history_id': history_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@history_bp.route('/machine/<machine_id>', methods=['GET'])
def get_history_by_machine(machine_id):
    """GET history berdasarkan mesin"""
    try:
        limit = request.args.get('limit', default=50, type=int)
        db = get_db()
        history_model = MaintenanceHistory(db)
        history = history_model.get_history_by_machine(machine_id, limit)
        return jsonify({'success': True, 'data': history}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@history_bp.route('/component/<component_id>', methods=['GET'])
def get_history_by_component(component_id):
    """GET history berdasarkan komponen"""
    try:
        limit = request.args.get('limit', default=50, type=int)
        db = get_db()
        history_model = MaintenanceHistory(db)
        history = history_model.get_history_by_component(component_id, limit)
        return jsonify({'success': True, 'data': history}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500