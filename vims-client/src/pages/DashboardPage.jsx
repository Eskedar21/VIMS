import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DATE_RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

// Sample data for charts
const CHART_DATA = {
  today: [
    { label: '8AM', inspections: 3, revenue: 1050 },
    { label: '9AM', inspections: 5, revenue: 1750 },
    { label: '10AM', inspections: 4, revenue: 1400 },
    { label: '11AM', inspections: 6, revenue: 2100 },
    { label: '12PM', inspections: 2, revenue: 700 },
    { label: '1PM', inspections: 4, revenue: 1400 },
    { label: '2PM', inspections: 5, revenue: 1750 },
  ],
  week: [
    { label: 'Mon', inspections: 24, revenue: 8400 },
    { label: 'Tue', inspections: 28, revenue: 9800 },
    { label: 'Wed', inspections: 22, revenue: 7700 },
    { label: 'Thu', inspections: 31, revenue: 10850 },
    { label: 'Fri', inspections: 26, revenue: 9100 },
    { label: 'Sat', inspections: 18, revenue: 6300 },
    { label: 'Sun', inspections: 8, revenue: 2800 },
  ],
  month: [
    { label: 'Week 1', inspections: 142, revenue: 49700 },
    { label: 'Week 2', inspections: 168, revenue: 58800 },
    { label: 'Week 3', inspections: 155, revenue: 54250 },
    { label: 'Week 4', inspections: 178, revenue: 62300 },
  ],
};

const MOCK_INSPECTIONS = [
  { id: 'VIS-2025-0023', dateTime: '2025-11-26 09:45', plate: 'ET 12345A', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', amount: 350, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0022', dateTime: '2025-11-26 09:12', plate: 'ET 87923B', vehicleType: 'Mini Bus', center: 'Addis Ababa / Lane 2', technician: 'Sara Tesfaye', result: 'FAIL', amount: 350, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0021', dateTime: '2025-11-26 08:55', plate: 'ET 29487C', vehicleType: 'Cargo Truck', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', amount: 500, paymentStatus: 'Pending', syncStatus: 'Pending' },
  { id: 'VIS-2025-0020', dateTime: '2025-11-25 16:30', plate: 'ET 85216Z', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 3', technician: 'Dawit Haile', result: 'PASS', amount: 350, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0019', dateTime: '2025-11-25 15:20', plate: 'ET 44821D', vehicleType: 'Motorcycle', center: 'Addis Ababa / Lane 2', technician: 'Sara Tesfaye', result: 'PASS', amount: 150, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0018', dateTime: '2025-11-25 14:10', plate: 'ET 99123E', vehicleType: 'Mini Bus', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'FAIL', amount: 350, paymentStatus: 'Failed', syncStatus: 'Failed' },
  { id: 'VIS-2025-0017', dateTime: '2025-11-24 11:45', plate: 'ET 77654F', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 3', technician: 'Dawit Haile', result: 'PASS', amount: 350, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0016', dateTime: '2025-11-24 10:30', plate: 'ET 33987G', vehicleType: 'Cargo Truck', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', amount: 500, paymentStatus: 'Paid', syncStatus: 'Synced' },
];

const ROWS_PER_PAGE = 25;

// Simple Line Chart Component
const LineChart = ({ data, dataKey, color, height = 120 }) => {
  const maxVal = Math.max(...data.map(d => d[dataKey]));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d[dataKey] / maxVal) * 85;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.3" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.3" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.3" />
        
        {/* Area fill */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`${color}15`}
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d[dataKey] / maxVal) * 85;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#fff"
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-gray-400">{d.label}</span>
        ))}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'dateTime', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

  const chartData = CHART_DATA[dateRange] || CHART_DATA.today;

  // KPI calculations
  const kpis = useMemo(() => {
    const totalInspections = chartData.reduce((sum, d) => sum + d.inspections, 0);
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    return {
      totalInspections,
      passCount: Math.round(totalInspections * 0.83),
      failCount: Math.round(totalInspections * 0.17),
      totalRevenue,
    };
  }, [chartData]);

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let data = [...MOCK_INSPECTIONS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (row) =>
          row.plate.toLowerCase().includes(q) ||
          row.id.toLowerCase().includes(q) ||
          row.technician.toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [searchQuery, sortConfig]);

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/inspection');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const statusBadge = (status, type) => {
    const styles = {
      result: { PASS: 'bg-green-100 text-green-700', FAIL: 'bg-red-100 text-red-600' },
      payment: { Paid: 'bg-green-100 text-green-700', Pending: 'bg-amber-100 text-amber-700', Failed: 'bg-red-100 text-red-600' },
      sync: { Synced: 'bg-green-100 text-green-700', Pending: 'bg-amber-100 text-amber-700', Failed: 'bg-red-100 text-red-600' },
    };
    return styles[type]?.[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions + Date Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/inspection')}
          className="px-5 py-2.5 rounded-lg bg-[#009639] text-white font-semibold hover:bg-[#007c2d] transition flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Inspection
        </button>
        <button type="button" className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition">
          Search Vehicle History
        </button>
        <button type="button" className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition">
          Pending Payments
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500">Period:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#009639]/20"
          >
            {DATE_RANGES.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vehicles Inspected', value: kpis.totalInspections, color: 'text-gray-900', icon: '🚗' },
          { label: 'Pass Count', value: kpis.passCount, color: 'text-[#009639]', icon: '✓' },
          { label: 'Fail Count', value: kpis.failCount, color: 'text-red-600', icon: '✗' },
          { label: 'Revenue (ETB)', value: kpis.totalRevenue.toLocaleString(), color: 'text-[#009639]', icon: '💰' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">{kpi.label}</p>
              <span className="text-lg">{kpi.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Inspections Over Time</h3>
            <span className="text-xs text-gray-400">{dateRange === 'today' ? 'Hourly' : dateRange === 'week' ? 'Daily' : 'Weekly'}</span>
          </div>
          <LineChart data={chartData} dataKey="inspections" color="#009639" height={140} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Revenue Trend (ETB)</h3>
            <span className="text-xs text-gray-400">{dateRange === 'today' ? 'Hourly' : dateRange === 'week' ? 'Daily' : 'Weekly'}</span>
          </div>
          <LineChart data={chartData} dataKey="revenue" color="#F59E0B" height={140} />
        </div>
      </div>

      {/* Historical Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Inspections</h2>
          <input
            type="text"
            placeholder="Search by Plate, ID, or Technician..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#009639]/20"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  { key: 'dateTime', label: 'Date & Time' },
                  { key: 'id', label: 'ID' },
                  { key: 'plate', label: 'Plate' },
                  { key: 'vehicleType', label: 'Type' },
                  { key: 'technician', label: 'Technician' },
                  { key: 'result', label: 'Result' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'paymentStatus', label: 'Payment' },
                  { key: 'syncStatus', label: 'Sync' },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none text-left"
                  >
                    {col.label}
                    {sortConfig.key === col.key && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-600">{row.dateTime}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#009639]">{row.id}</td>
                  <td className="px-4 py-3 font-semibold">{row.plate}</td>
                  <td className="px-4 py-3 text-gray-600">{row.vehicleType}</td>
                  <td className="px-4 py-3">{row.technician}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(row.result, 'result')}`}>
                      {row.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{row.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(row.paymentStatus, 'payment')}`}>
                      {row.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(row.syncStatus, 'sync')}`}>
                      {row.syncStatus}
                    </span>
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

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filteredData.length)} of {filteredData.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 px-2">Page {currentPage} of {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
