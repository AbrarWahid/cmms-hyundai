from flask import Blueprint, request, jsonify
from models.work_order import WorkOrder
from database import get_db

work_order_bp = Blueprint('work_orders', __name__, url_prefix='/api/work-orders')

@work_order_bp.route('/', methods=['GET'])
def get_all_work_orders():
    """GET semua work orders dengan filter optional"""
    try:
        # Get query parameters for filtering
        status = request.args.get('status')
        priority = request.args.get('priority')
        machine_id = request.args.get('machine_id')
        
        filters = {}
        if status:
            filters['status'] = status
        if priority:
            filters['priority'] = priority
        if machine_id:
            filters['machine_id'] = machine_id
        
        db = get_db()
        wo_model = WorkOrder(db)
        work_orders = wo_model.get_all_work_orders(filters)
        return jsonify({'success': True, 'data': work_orders}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@work_order_bp.route('/', methods=['POST'])
def create_work_order():
    """POST buat work order baru"""
    try:
        data = request.get_json()
        db = get_db()
        wo_model = WorkOrder(db)
        wo_id = wo_model.create_work_order(data)
        return jsonify({'success': True, 'work_order_id': wo_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@work_order_bp.route('/<work_order_id>', methods=['GET'])
def get_work_order(work_order_id):
    """GET work order berdasarkan ID"""
    try:
        db = get_db()
        wo_model = WorkOrder(db)
        work_order = wo_model.get_work_order_by_id(work_order_id)
        if work_order:
            return jsonify({'success': True, 'data': work_order}), 200
        return jsonify({'success': False, 'error': 'Work order not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@work_order_bp.route('/<work_order_id>/status', methods=['PUT'])
def update_status(work_order_id):
    """PUT update status work order"""
    try:
        data = request.get_json()
        status = data.get('status')
        
        db = get_db()
        wo_model = WorkOrder(db)
        success = wo_model.update_status(work_order_id, status)
        
        if success:
            return jsonify({'success': True, 'message': 'Status updated'}), 200
        return jsonify({'success': False, 'error': 'Work order not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@work_order_bp.route('/<work_order_id>/notes', methods=['POST'])
def add_note(work_order_id):
    """POST tambah catatan ke work order"""
    try:
        data = request.get_json()
        note = data.get('note')
        author = data.get('author')
        
        db = get_db()
        wo_model = WorkOrder(db)
        success = wo_model.add_note(work_order_id, note, author)
        
        if success:
            return jsonify({'success': True, 'message': 'Note added'}), 200
        return jsonify({'success': False, 'error': 'Work order not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@work_order_bp.route('/<work_order_id>', methods=['PUT'])
def update_work_order(work_order_id):
    """PUT update seluruh field work order"""
    try:
        data = request.get_json()
        db = get_db()
        wo_model = WorkOrder(db)
        success = wo_model.update_work_order(work_order_id, data)
        if success:
            return jsonify({'success': True, 'message': 'Work order updated'}), 200
        return jsonify({'success': False, 'error': 'Work order not found or no changes made'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@work_order_bp.route('/<work_order_id>', methods=['DELETE'])
def delete_work_order(work_order_id):
    """DELETE hapus work order"""
    try:
        db = get_db()
        wo_model = WorkOrder(db)
        success = wo_model.delete_work_order(work_order_id)
        if success:
            return jsonify({'success': True, 'message': 'Work order deleted'}), 200
        return jsonify({'success': False, 'error': 'Work order not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500