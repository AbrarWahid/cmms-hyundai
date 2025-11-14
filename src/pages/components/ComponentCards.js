import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function ComponentCard({ component = {}, onEdit = () => {}, onDelete = () => {} }) {
  const getConditionColor = (condition) => {
    const colors = {
      good: 'text-green-600 bg-green-50',
      fair: 'text-yellow-600 bg-yellow-50',
      poor: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50'
    };
    return colors[condition] || 'text-gray-600 bg-gray-50';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-blue-600 bg-blue-50',
      inactive: 'text-gray-600 bg-gray-50',
      replaced: 'text-purple-600 bg-purple-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
              {component?.name || '-'}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              PN: {component?.part_number || '-'}
            </p>
          </div>
          
          {/* Badges */}
          <div className="flex flex-col gap-1 items-end">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(component?.condition)}`}>
              {component?.condition || '-'}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(component?.status)}`}>
              {component?.status || '-'}
            </span>
          </div>
        </div>

        {/* Usage Bar (if has lifespan) */}
        {component?.lifespan_hours > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Usage: {component?.current_hours || 0}h / {component?.lifespan_hours}h</span>
              <span className="font-medium">
                {Math.round(((component?.current_hours || 0) / component?.lifespan_hours) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  ((component?.current_hours || 0) / component?.lifespan_hours) > 0.9 ? 'bg-red-500' :
                  ((component?.current_hours || 0) / component?.lifespan_hours) > 0.7 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(((component?.current_hours || 0) / component?.lifespan_hours) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onEdit(component)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => onDelete(component)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}