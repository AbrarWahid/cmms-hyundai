from pymongo import MongoClient
from flask import g
import os

def get_db():
    """Get database connection"""
    if 'db' not in g:
        # Get MongoDB connection string from environment variable
        mongo_uri = os.getenv('MONGODB_URI', 'mongodb://mongodb:27017/')
        db_name = os.getenv('MONGODB_DB', 'hyundai_cmms')
        
        client = MongoClient(mongo_uri)
        g.db = client[db_name]
    
    return g.db

def close_db(e=None):
    """Close database connection"""
    db = g.pop('db', None)
    if db is not None:
        db.client.close()

def init_db():
    """Initialize database with indexes"""
    db = get_db()
    
    # Create indexes for better performance
    db['machines'].create_index('serial_number', unique=True)
    db['components'].create_index('machine_id')
    db['components'].create_index('part_number')
    db['work_orders'].create_index('order_number', unique=True)
    db['work_orders'].create_index('machine_id')
    db['work_orders'].create_index('status')
    db['maintenance_schedules'].create_index('machine_id')
    db['maintenance_schedules'].create_index('next_scheduled')
    db['maintenance_history'].create_index('machine_id')
    db['maintenance_history'].create_index('component_id')
    db['maintenance_history'].create_index('performed_at')
    db['audits'].create_index('audit_number', unique=True)
    db['compliance'].create_index('due_date')
    db['compliance'].create_index('status')
    db['inventory'].create_index('part_number', unique=True)
    
    print("Database indexes created successfully!")