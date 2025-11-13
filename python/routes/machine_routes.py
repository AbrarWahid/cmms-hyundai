from flask import Blueprint, request, jsonify
from models.machine import Machine
from database import get_db

machine_bp = Blueprint('machines', __name__, url_prefix='/api/machines')

@machine_bp.route('/', methods=['GET'])
def get_all_machines():
    """GET semua mesin"""
    try:
        db = get_db()
        machine_model = Machine(db)
        machines = machine_model.get_all_machines()
        return jsonify({'success': True, 'data': machines}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@machine_bp.route('/', methods=['POST'])
def create_machine():
    """POST buat mesin baru"""
    try:
        data = request.get_json()
        db = get_db()
        machine_model = Machine(db)
        machine_id = machine_model.create_machine(data)
        return jsonify({'success': True, 'machine_id': machine_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@machine_bp.route('/<machine_id>', methods=['GET'])
def get_machine(machine_id):
    """GET mesin berdasarkan ID"""
    try:
        db = get_db()
        machine_model = Machine(db)
        machine = machine_model.get_machine_by_id(machine_id)
        if machine:
            return jsonify({'success': True, 'data': machine}), 200
        return jsonify({'success': False, 'error': 'Machine not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@machine_bp.route('/<machine_id>', methods=['PUT'])
def update_machine(machine_id):
    """PUT update mesin"""
    try:
        data = request.get_json()
        db = get_db()
        machine_model = Machine(db)
        success = machine_model.update_machine(machine_id, data)
        if success:
            return jsonify({'success': True, 'message': 'Machine updated'}), 200
        return jsonify({'success': False, 'error': 'Machine not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@machine_bp.route('/<machine_id>', methods=['DELETE'])
def delete_machine(machine_id):
    """DELETE hapus mesin"""
    try:
        db = get_db()
        machine_model = Machine(db)
        success = machine_model.delete_machine(machine_id)
        if success:
            return jsonify({'success': True, 'message': 'Machine deleted'}), 200
        return jsonify({'success': False, 'error': 'Machine not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500