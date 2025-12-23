import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_ACTIVE = [
  { 
    id: 'VIS-2025-0024', plate: 'ET 55123A', vehicleType: 'Passenger Car', stage: 'Visual Inspection', 
    technician: 'Abebe Kebede', startTime: '10:15 AM', progress: 40,
    registration: { plateNumber: 'ET 55123A', ownerName: 'Kebede Alemu', chassisNo: 'WDB1234567890124', motorNo: 'M123456', vehicleType: 'Passenger Car' },
    visualChecklist: { 'zone1': { items: { 1: 'correct', 2: 'correct', 3: 'correct', 4: 'correct' } }, 'zone2': { items: { 5: 'correct', 6: 'not_correct' } } }
  },
  { 
    id: 'VIS-2025-0025', plate: 'ET 77891B', vehicleType: 'Mini Bus', stage: 'Machine Test', 
    technician: 'Sara Tesfaye', startTime: '10:32 AM', progress: 65,
    registration: { plateNumber: 'ET 77891B', ownerName: 'Sara Bekele', chassisNo: 'WDB9876543210987', motorNo: 'M987654', vehicleType: 'Mini Bus' },
    visualChecklist: { completed: true, passCount: 28, failCount: 2 },
    machineTest: { alignment: { status: 'complete' }, suspension: { status: 'complete' }, brakes: { status: 'in_progress' } }
  },
  { 
    id: 'VIS-2025-0026', plate: 'ET 33456C', vehicleType: 'Cargo Truck', stage: 'Registration', 
    technician: 'Dawit Haile', startTime: '10:45 AM', progress: 15,
    registration: { plateNumber: 'ET 33456C', ownerName: '', chassisNo: '', motorNo: '', vehicleType: 'Cargo Truck' }
  },
];

const ActiveInspectionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Active Inspections</h1>
        <button
          onClick={() => navigate('/inspection')}
          className="px-4 py-2 bg-[#88bf47] text-white rounded-lg font-medium hover:bg-[#0fa84a] transition"
        >
          + New Inspection
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Current Stage</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Technician</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Started</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ACTIVE.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-mono text-xs text-[#88bf47]">{row.id}</td>
                <td className="px-4 py-3 font-semibold">{row.plate}</td>
                <td className="px-4 py-3 text-gray-600">{row.vehicleType}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {row.stage}
                  </span>
                </td>
                <td className="px-4 py-3">{row.technician}</td>
                <td className="px-4 py-3 text-gray-500">{row.startTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#88bf47] rounded-full" style={{ width: `${row.progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{row.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      // Store inspection data in session storage to resume
                      sessionStorage.setItem('activeInspection', JSON.stringify(row));
                      if (row.stage === 'Registration') {
                        navigate('/inspection');
                      } else if (row.stage === 'Visual Inspection') {
                        navigate('/inspection');
                      } else if (row.stage === 'Machine Test') {
                        navigate('/machine-test');
                      }
                    }}
                    className="text-xs text-[#88bf47] hover:underline font-medium"
                  >
                    Continue
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveInspectionsPage;

