from flask import Blueprint, request, jsonify
from database import get_db
from datetime import datetime, timedelta

report_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@report_bp.route('/dashboard', methods=['GET'])
def get_dashboard_stats():
    """GET statistik dashboard"""
    try:
        db = get_db()
        
        # Total machines
        total_machines = db['machines'].count_documents({})
        
        # Active work orders
        active_work_orders = db['work_orders'].count_documents({
            'status': {'$in': ['pending', 'in_progress']}
        })
        
        # Upcoming maintenance (next 7 days)
        next_week = datetime.utcnow() + timedelta(days=7)
        upcoming_maintenance = db['maintenance_schedules'].count_documents({
            'next_scheduled': {'$lte': next_week},
            'status': 'scheduled'
        })
        
        # Low stock items
        low_stock = db['inventory'].count_documents({
            '$expr': {'$lte': ['$quantity', '$min_stock']}
        })
        
        # Critical components
        critical_components = db['components'].count_documents({
            'condition': 'critical'
        })
        
        # Overdue compliance
        overdue_compliance = db['compliance'].count_documents({
            'due_date': {'$lt': datetime.utcnow()},
            'status': {'$in': ['pending', 'overdue']}
        })
        
        stats = {
            'total_machines': total_machines,
            'active_work_orders': active_work_orders,
            'upcoming_maintenance': upcoming_maintenance,
            'low_stock_items': low_stock,
            'critical_components': critical_components,
            'overdue_compliance': overdue_compliance
        }
        
        return jsonify({'success': True, 'data': stats}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@report_bp.route('/maintenance-summary', methods=['GET'])
def get_maintenance_summary():
    """GET ringkasan maintenance dalam periode tertentu"""
    try:
        # Get date range from query params
        days = request.args.get('days', default=30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        db = get_db()
        
        # Aggregate maintenance history
        pipeline = [
            {'$match': {'performed_at': {'$gte': start_date}}},
            {'$group': {
                '_id': '$maintenance_type',
                'count': {'$sum': 1},
                'total_cost': {'$sum': '$cost'},
                'total_hours': {'$sum': '$duration_hours'}
            }}
        ]
        
        summary = list(db['maintenance_history'].aggregate(pipeline))
        
        return jsonify({'success': True, 'data': summary}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@report_bp.route('/machine-health', methods=['GET'])
def get_machine_health():
    """GET status kesehatan semua mesin"""
    try:
        db = get_db()
        
        # Get all machines with their components
        machines = list(db['machines'].find())
        
        health_report = []
        for machine in machines:
            machine['_id'] = str(machine['_id'])
            
            # Get components for this machine
            components = list(db['components'].find({'machine_id': str(machine['_id'])}))
            
            # Count components by condition
            condition_count = {
                'good': 0,
                'fair': 0,
                'poor': 0,
                'critical': 0
            }
            
            for comp in components:
                condition = comp.get('condition', 'good')
                condition_count[condition] += 1
            
            # Calculate health score (0-100)
            total_components = len(components)
            if total_components > 0:
                health_score = (
                    (condition_count['good'] * 100) +
                    (condition_count['fair'] * 70) +
                    (condition_count['poor'] * 40) +
                    (condition_count['critical'] * 10)
                ) / total_components
            else:
                health_score = 100
            
            health_report.append({
                'machine_id': str(machine['_id']),
                'machine_name': machine['name'],
                'health_score': round(health_score, 2),
                'total_components': total_components,
                'condition_breakdown': condition_count,
                'status': machine['status']
            })
        
        return jsonify({'success': True, 'data': health_report}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500