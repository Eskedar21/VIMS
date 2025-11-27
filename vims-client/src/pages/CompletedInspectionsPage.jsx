import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_COMPLETED = [
  { id: 'VIS-2025-0023', dateTime: '2025-11-26 09:45', plate: 'ET 12345A', vehicleType: 'Passenger Car', technician: 'Abebe Kebede', result: 'PASS', certificateNo: 'CERT-2025-0023' },
  { id: 'VIS-2025-0022', dateTime: '2025-11-26 09:12', plate: 'ET 87923B', vehicleType: 'Mini Bus', technician: 'Sara Tesfaye', result: 'FAIL', certificateNo: null },
  { id: 'VIS-2025-0021', dateTime: '2025-11-26 08:55', plate: 'ET 29487C', vehicleType: 'Cargo Truck', technician: 'Abebe Kebede', result: 'PASS', certificateNo: 'CERT-2025-0021' },
  { id: 'VIS-2025-0020', dateTime: '2025-11-25 16:30', plate: 'ET 85216Z', vehicleType: 'Passenger Car', technician: 'Dawit Haile', result: 'PASS', certificateNo: 'CERT-2025-0020' },
  { id: 'VIS-2025-0019', dateTime: '2025-11-25 15:20', plate: 'ET 44821D', vehicleType: 'Motorcycle', technician: 'Sara Tesfaye', result: 'PASS', certificateNo: 'CERT-2025-0019' },
];

const CompletedInspectionsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return MOCK_COMPLETED;
    const q = searchQuery.toLowerCase();
    return MOCK_COMPLETED.filter(
      (row) =>
        row.plate.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Completed Inspections</h1>
        <input
          type="text"
          placeholder="Search by Plate or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#009639]/20"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Technician</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Result</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Certificate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-600">{row.dateTime}</td>
                <td className="px-4 py-3 font-mono text-xs text-[#009639]">{row.id}</td>
                <td className="px-4 py-3 font-semibold">{row.plate}</td>
                <td className="px-4 py-3 text-gray-600">{row.vehicleType}</td>
                <td className="px-4 py-3">{row.technician}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    row.result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {row.result}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {row.certificateNo || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/result')} className="text-xs text-[#009639] hover:underline font-medium">View</button>
                    <button className="text-xs text-gray-500 hover:underline">Print</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompletedInspectionsPage;

