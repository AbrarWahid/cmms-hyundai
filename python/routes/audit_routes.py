from flask import Blueprint, request, jsonify
from models.audit import Audit
from database import get_db

audit_bp = Blueprint('audits', __name__, url_prefix='/api/audits')

@audit_bp.route('/', methods=['POST'])
def create_audit():
    """POST buat audit baru"""
    try:
        data = request.get_json()
        db = get_db()
        audit_model = Audit(db)
        audit_id = audit_model.create_audit(data)
        return jsonify({'success': True, 'audit_id': audit_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@audit_bp.route('/<audit_id>/findings', methods=['POST'])
def add_finding(audit_id):
    """POST tambah temuan audit"""
    try:
        finding = request.get_json()
        db = get_db()
        audit_model = Audit(db)
        success = audit_model.add_finding(audit_id, finding)
        if success:
            return jsonify({'success': True, 'message': 'Finding added'}), 200
        return jsonify({'success': False, 'error': 'Audit not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@audit_bp.route('/<audit_id>/complete', methods=['PUT'])
def complete_audit(audit_id):
    """PUT tandai audit selesai"""
    try:
        data = request.get_json()
        score = data.get('score')
        recommendation = data.get('recommendation', '')
        
        db = get_db()
        audit_model = Audit(db)
        success = audit_model.complete_audit(audit_id, score, recommendation)
        
        if success:
            return jsonify({'success': True, 'message': 'Audit completed'}), 200
        return jsonify({'success': False, 'error': 'Audit not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500