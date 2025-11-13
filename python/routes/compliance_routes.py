from flask import Blueprint, request, jsonify
from models.compliance import Compliance
from database import get_db

compliance_bp = Blueprint('compliance', __name__, url_prefix='/api/compliance')

@compliance_bp.route('/', methods=['POST'])
def create_compliance():
    """POST buat record compliance baru"""
    try:
        data = request.get_json()
        db = get_db()
        compliance_model = Compliance(db)
        compliance_id = compliance_model.create_compliance(data)
        return jsonify({'success': True, 'compliance_id': compliance_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@compliance_bp.route('/<compliance_id>/status', methods=['PUT'])
def update_status(compliance_id):
    """PUT update status compliance"""
    try:
        data = request.get_json()
        status = data.get('status')
        evidence = data.get('evidence', None)
        
        db = get_db()
        compliance_model = Compliance(db)
        success = compliance_model.update_compliance_status(compliance_id, status, evidence)
        
        if success:
            return jsonify({'success': True, 'message': 'Compliance status updated'}), 200
        return jsonify({'success': False, 'error': 'Compliance not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@compliance_bp.route('/overdue', methods=['GET'])
def get_overdue():
    """GET compliance yang overdue"""
    try:
        db = get_db()
        compliance_model = Compliance(db)
        compliance = compliance_model.get_overdue_compliance()
        return jsonify({'success': True, 'data': compliance}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500