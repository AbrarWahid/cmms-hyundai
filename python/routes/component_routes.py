from flask import Blueprint, request, jsonify
from models.component import Component
from database import get_db

component_bp = Blueprint('components', __name__, url_prefix='/api/components')

@component_bp.route('/machine/<machine_id>', methods=['GET'])
def get_components_by_machine(machine_id):
    """GET komponen berdasarkan mesin"""
    try:
        db = get_db()
        component_model = Component(db)
        components = component_model.get_components_by_machine(machine_id)
        return jsonify({'success': True, 'data': components}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@component_bp.route('/', methods=['POST'])
def create_component():
    """POST buat komponen baru"""
    try:
        data = request.get_json()
        db = get_db()
        component_model = Component(db)
        component_id = component_model.create_component(data)
        return jsonify({'success': True, 'component_id': component_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@component_bp.route('/<component_id>', methods=['GET'])
def get_component(component_id):
    """GET komponen berdasarkan ID"""
    try:
        db = get_db()
        component_model = Component(db)
        component = component_model.get_component_by_id(component_id)
        if component:
            return jsonify({'success': True, 'data': component}), 200
        return jsonify({'success': False, 'error': 'Component not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@component_bp.route('/<component_id>', methods=['PUT'])
def update_component(component_id):
    """PUT update komponen"""
    try:
        data = request.get_json()
        db = get_db()
        component_model = Component(db)
        success = component_model.update_component(component_id, data)
        if success:
            return jsonify({'success': True, 'message': 'Component updated'}), 200
        return jsonify({'success': False, 'error': 'Component not found or no changes made'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@component_bp.route('/<component_id>/condition', methods=['PUT'])
def update_condition(component_id):
    """PUT update kondisi komponen"""
    try:
        data = request.get_json()
        condition = data.get('condition')
        notes = data.get('notes', '')
        
        db = get_db()
        component_model = Component(db)
        success = component_model.update_condition(component_id, condition, notes)
        
        if success:
            return jsonify({'success': True, 'message': 'Condition updated'}), 200
        return jsonify({'success': False, 'error': 'Component not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@component_bp.route('/<component_id>', methods=['DELETE'])
def delete_component(component_id):
    """DELETE hapus komponen"""
    try:
        db = get_db()
        component_model = Component(db)
        success = component_model.delete_component(component_id)
        if success:
            return jsonify({'success': True, 'message': 'Component deleted'}), 200
        return jsonify({'success': False, 'error': 'Component not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500