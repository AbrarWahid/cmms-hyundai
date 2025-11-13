from flask import Flask, jsonify
from flask_cors import CORS
from database import close_db, init_db
import os

# Import all routes
from routes.machine_routes import machine_bp
from routes.component_routes import component_bp
from routes.work_order_routes import work_order_bp
from routes.schedule_routes import schedule_bp
from routes.history_routes import history_bp
from routes.audit_routes import audit_bp
from routes.compliance_routes import compliance_bp
from routes.inventory_routes import inventory_bp
from routes.report_routes import report_bp

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-hyundai-cmms')
    
    # Enable CORS for Next.js frontend
    CORS(app, origins=['http://localhost:3000', 'http://nextjs:3000'])
    
    # Register all blueprints
    app.register_blueprint(machine_bp)
    app.register_blueprint(component_bp)
    app.register_blueprint(work_order_bp)
    app.register_blueprint(schedule_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(audit_bp)
    app.register_blueprint(compliance_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(report_bp)
    
    # Register teardown function
    app.teardown_appcontext(close_db)
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'Hyundai CMMS API'}), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'message': 'Welcome to Hyundai CMMS API',
            'version': '1.0.0',
            'endpoints': {
                'machines': '/api/machines',
                'components': '/api/components',
                'work_orders': '/api/work-orders',
                'schedules': '/api/schedules',
                'history': '/api/history',
                'audits': '/api/audits',
                'compliance': '/api/compliance',
                'inventory': '/api/inventory',
                'reports': '/api/reports'
            }
        }), 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Initialize database on first run
    with app.app_context():
        init_db()
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)