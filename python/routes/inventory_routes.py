from flask import Blueprint, request, jsonify
from models.inventory import Inventory
from database import get_db

inventory_bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')

@inventory_bp.route('/', methods=['POST'])
def create_item():
    """POST buat item inventory baru"""
    try:
        data = request.get_json()
        db = get_db()
        inventory_model = Inventory(db)
        item_id = inventory_model.create_item(data)
        return jsonify({'success': True, 'item_id': item_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@inventory_bp.route('/<item_id>/quantity', methods=['PUT'])
def update_quantity(item_id):
    """PUT update quantity item"""
    try:
        data = request.get_json()
        quantity_change = data.get('quantity_change')
        transaction_type = data.get('transaction_type')  # in, out, adjustment
        notes = data.get('notes', '')
        
        db = get_db()
        inventory_model = Inventory(db)
        success = inventory_model.update_quantity(item_id, quantity_change, transaction_type, notes)
        
        if success:
            return jsonify({'success': True, 'message': 'Quantity updated'}), 200
        return jsonify({'success': False, 'error': 'Item not found or insufficient stock'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@inventory_bp.route('/low-stock', methods=['GET'])
def get_low_stock():
    """GET item dengan stock rendah"""
    try:
        db = get_db()
        inventory_model = Inventory(db)
        items = inventory_model.get_low_stock_items()
        return jsonify({'success': True, 'data': items}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500