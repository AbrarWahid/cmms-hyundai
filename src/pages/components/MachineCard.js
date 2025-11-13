import { FiTool } from 'react-icons/fi';

export default function MachineCard({ machine }) {
  const getStatusColor = (status) => {
    const colors = {
      operational: 'text-green-600 bg-green-50 border-green-200',
      maintenance: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      broken: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiTool className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
            {machine.name}
          </h3>
          <p className="text-xs md:text-sm text-gray-500 truncate">
            {machine.model}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs md:text-sm">
          <span className="text-gray-600">Serial Number:</span>
          <span className="font-medium text-gray-900 truncate ml-2">
            {machine.serial_number}
          </span>
        </div>
        <div className="flex justify-between text-xs md:text-sm">
          <span className="text-gray-600">Location:</span>
          <span className="font-medium text-gray-900 truncate ml-2">
            {machine.location || '-'}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(machine.status)}`}>
          {machine.status}
        </span>
      </div>
    </div>
  );
}