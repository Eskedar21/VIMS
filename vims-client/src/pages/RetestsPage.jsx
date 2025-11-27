import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_RETESTS = [
  { id: 'VIS-2025-0022', date: '2025-11-26', plate: 'ET 87923B', vehicleType: 'Mini Bus', failReason: 'Brake Efficiency < 50%', status: 'Pending Re-test', dueDate: '2025-12-03' },
  { id: 'VIS-2025-0018', date: '2025-11-25', plate: 'ET 99123E', vehicleType: 'Mini Bus', failReason: 'Headlight Alignment', status: 'Re-test Scheduled', dueDate: '2025-11-28' },
  { id: 'VIS-2025-0015', date: '2025-11-23', plate: 'ET 66789F', vehicleType: 'Cargo Truck', failReason: 'Emission Exceeded', status: 'Exception Requested', dueDate: '2025-11-30' },
];

const RetestsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');

  const filteredData = MOCK_RETESTS.filter((row) => {
    if (activeTab === 'pending') return row.status === 'Pending Re-test';
    if (activeTab === 'scheduled') return row.status === 'Re-test Scheduled';
    if (activeTab === 'exceptions') return row.status === 'Exception Requested';
    return true;
  });

  const statusBadge = (status) => {
    const styles = {
      'Pending Re-test': 'bg-amber-100 text-amber-700',
      'Re-test Scheduled': 'bg-blue-100 text-blue-700',
      'Exception Requested': 'bg-purple-100 text-purple-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Re-tests & Exceptions</h1>

      <div className="flex gap-2">
        {[
          { key: 'pending', label: 'Pending Re-test' },
          { key: 'scheduled', label: 'Scheduled' },
          { key: 'exceptions', label: 'Exceptions' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-[#009639] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No items in this category
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Original Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Failure Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-600">{row.date}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#009639]">{row.id}</td>
                  <td className="px-4 py-3 font-semibold">{row.plate}</td>
                  <td className="px-4 py-3 text-gray-600">{row.vehicleType}</td>
                  <td className="px-4 py-3 text-red-600 text-xs">{row.failReason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{row.dueDate}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate('/inspection')}
                      className="text-xs text-[#009639] hover:underline font-medium"
                    >
                      Start Re-test
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RetestsPage;

