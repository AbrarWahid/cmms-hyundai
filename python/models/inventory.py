from datetime import datetime
from bson import ObjectId

class Inventory:
    """Model untuk Maintenance Inventory"""
    
    def __init__(self, db):
        self.collection = db['inventory']
    
    def create_item(self, data):
        """Buat item inventory baru"""
        item = {
            'part_number': data['part_number'],
            'name': data['name'],
            'description': data.get('description', ''),
            'category': data['category'],  # spare_parts, tools, consumables
            'quantity': data['quantity'],
            'unit': data['unit'],
            'min_stock': data.get('min_stock', 0),
            'max_stock': data.get('max_stock', 0),
            'location': data.get('location', ''),
            'supplier': data.get('supplier', ''),
            'unit_price': data.get('unit_price', 0),
            'compatible_machines': data.get('compatible_machines', []),
            'compatible_components': data.get('compatible_components', []),
            'last_restock': None,
            'transactions': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.collection.insert_one(item)
        return str(result.inserted_id)
    
    def update_quantity(self, item_id, quantity_change, transaction_type, notes=''):
        """Update quantity dengan tracking transaksi"""
        item = self.collection.find_one({'_id': ObjectId(item_id)})
        
        if not item:
            return False
        
        new_quantity = item['quantity'] + quantity_change
        
        if new_quantity < 0:
            return False
        
        transaction = {
            'type': transaction_type,  # in, out, adjustment
            'quantity_change': quantity_change,
            'previous_quantity': item['quantity'],
            'new_quantity': new_quantity,
            'notes': notes,
            'timestamp': datetime.utcnow()
        }
        
        update_data = {
            'quantity': new_quantity,
            'updated_at': datetime.utcnow()
        }
        
        if transaction_type == 'in':
            update_data['last_restock'] = datetime.utcnow()
        
        result = self.collection.update_one(
            {'_id': ObjectId(item_id)},
            {
                '$set': update_data,
                '$push': {'transactions': transaction}
            }
        )
        return result.modified_count > 0
    
    def get_low_stock_items(self):
        """Ambil item dengan stock rendah"""
        items = list(self.collection.find({
            '$expr': {'$lte': ['$quantity', '$min_stock']}
        }))
        
        for item in items:
            item['_id'] = str(item['_id'])
        return items