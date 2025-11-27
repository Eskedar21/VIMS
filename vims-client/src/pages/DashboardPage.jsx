import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DATE_RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom Range' },
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
  { id: 'VIS-2025-0015', dateTime: '2025-11-23 16:20', plate: 'ET 11223H', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 2', technician: 'Sara Tesfaye', result: 'PASS', amount: 350, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0014', dateTime: '2025-11-23 15:00', plate: 'ET 44556I', vehicleType: 'Mini Bus', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', amount: 350, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0013', dateTime: '2025-11-23 14:30', plate: 'ET 77889J', vehicleType: 'Cargo Truck', center: 'Addis Ababa / Lane 3', technician: 'Dawit Haile', result: 'FAIL', amount: 500, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0012', dateTime: '2025-11-22 11:15', plate: 'ET 99001K', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 2', technician: 'Sara Tesfaye', result: 'PASS', amount: 350, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0011', dateTime: '2025-11-22 10:00', plate: 'ET 22334L', vehicleType: 'Motorcycle', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', amount: 150, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0010', dateTime: '2025-11-21 16:45', plate: 'ET 55667M', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 3', technician: 'Dawit Haile', result: 'PASS', amount: 350, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0009', dateTime: '2025-11-21 15:30', plate: 'ET 88990N', vehicleType: 'Mini Bus', center: 'Addis Ababa / Lane 2', technician: 'Sara Tesfaye', result: 'FAIL', amount: 350, paymentStatus: 'Paid', syncStatus: 'Synced' },
  { id: 'VIS-2025-0008', dateTime: '2025-11-20 14:20', plate: 'ET 11122O', vehicleType: 'Cargo Truck', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', amount: 500, paymentStatus: 'Paid', syncStatus: 'Synced' },
];

const ROWS_PER_PAGE = 5;

// Simple Line Chart Component
const LineChart = ({ data, dataKey, color, height = 140, label }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const maxVal = Math.max(...data.map(d => d[dataKey]));
  const minVal = Math.min(...data.map(d => d[dataKey]));
  const chartHeight = height - 28;

  const getY = (val) => {
    const range = maxVal - minVal || 1;
    return 8 + (1 - (val - minVal) / range) * (chartHeight - 16);
  };

  const getX = (i) => (i / (data.length - 1)) * 100;

  // Simple straight line path
  const linePath = data.map((d, i) => {
    const x = getX(i);
    const y = getY(d[dataKey]);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height={chartHeight} viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none" className="overflow-visible">
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Hover areas */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d[dataKey]);
          const colWidth = 100 / data.length;

          return (
            <rect
              key={i}
              x={x - colWidth / 2}
              y="0"
              width={colWidth}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute z-20 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-xs pointer-events-none whitespace-nowrap"
          style={{
            left: `${getX(hoveredIndex)}%`,
            top: getY(data[hoveredIndex][dataKey]) - 40,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-medium">{data[hoveredIndex].label}</div>
          <div>{label}: {data[hoveredIndex][dataKey].toLocaleString()}</div>
        </div>
      )}

      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <span
            key={i}
            className={`text-xs text-center flex-1 ${hoveredIndex === i ? 'text-gray-700 font-medium' : 'text-gray-400'}`}
          >
            {d.label}
          </span>
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
  const [vehicleSearchModal, setVehicleSearchModal] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Generate chart data based on date range
  const chartData = useMemo(() => {
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      // Generate custom chart data based on filtered inspections
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      const customData = [];
      for (let i = 0; i < Math.min(days, 7); i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayInspections = MOCK_INSPECTIONS.filter(r => r.dateTime.startsWith(dateStr));
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        customData.push({
          label,
          inspections: dayInspections.length || Math.floor(Math.random() * 5) + 1,
          revenue: dayInspections.reduce((sum, r) => sum + r.amount, 0) || (Math.floor(Math.random() * 5) + 1) * 350,
        });
      }
      return customData.length > 0 ? customData : CHART_DATA.today;
    }
    return CHART_DATA[dateRange] || CHART_DATA.today;
  }, [dateRange, customStartDate, customEndDate]);

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

  // Filtered and sorted data (table always shows all data, only search filters it)
  const filteredData = useMemo(() => {
    let data = [...MOCK_INSPECTIONS];
    
    // Filter by search query only
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

  // Vehicle history search results
  const vehicleHistoryResults = useMemo(() => {
    if (!vehicleSearchQuery) return [];
    const q = vehicleSearchQuery.toLowerCase();
    return MOCK_INSPECTIONS.filter(
      (row) =>
        row.plate.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q)
    );
  }, [vehicleSearchQuery]);

  // Pending payments
  const pendingPayments = useMemo(() => {
    return MOCK_INSPECTIONS.filter((row) => row.paymentStatus === 'Pending');
  }, []);

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
          onClick={() => {
            // Clear previous inspection data to start fresh
            sessionStorage.removeItem('vims.inspection.id');
            sessionStorage.removeItem('vims.inspection.category');
            sessionStorage.removeItem('vims.inspection.registration');
            sessionStorage.removeItem('vims.inspection.checklist');
            navigate('/inspection');
          }}
          className="px-5 py-2.5 rounded-lg bg-[#009639] text-white font-semibold hover:bg-[#007c2d] transition flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Inspection
        </button>
        <button 
          type="button" 
          onClick={() => setVehicleSearchModal(true)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          Search Vehicle History
        </button>
        <button 
          type="button" 
          onClick={() => {
            setSearchQuery('');
            const pendingRow = MOCK_INSPECTIONS.find(r => r.paymentStatus === 'Pending' || r.paymentStatus === 'Failed');
            if (pendingRow) {
              setSearchQuery(pendingRow.plate);
            }
          }}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
          Pending Payments
          {pendingPayments.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <div className="ml-auto flex items-center gap-2 relative">
          <span className="text-sm text-gray-500">Period:</span>
          <select
            value={dateRange}
            onChange={(e) => {
              const val = e.target.value;
              setDateRange(val);
              setShowCustomDatePicker(val === 'custom');
              setCurrentPage(1);
            }}
            onClick={(e) => {
              if (dateRange === 'custom' && e.target.value === 'custom') {
                setShowCustomDatePicker(true);
              }
            }}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#009639]/20"
          >
            {DATE_RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.key === 'custom' && customStartDate && customEndDate 
                  ? `${customStartDate} - ${customEndDate}` 
                  : r.label}
              </option>
            ))}
          </select>
          
          {/* Custom Date Range Picker */}
          {showCustomDatePicker && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 w-72">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#009639]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#009639]/20"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomDatePicker(false);
                      if (!customStartDate || !customEndDate) {
                        setDateRange('today');
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomDatePicker(false);
                      setCurrentPage(1);
                    }}
                    disabled={!customStartDate || !customEndDate}
                    className="flex-1 px-3 py-2 text-sm text-white bg-[#009639] rounded-lg hover:bg-[#007c2d] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vehicles Inspected', value: kpis.totalInspections, color: 'text-gray-900', icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-1.5-3.5C16 5.6 15.1 5 14 5H6c-1.1 0-2 .6-2.5 1.5L2 10l-2.5 1.1C-.7 11.3-1 12.1-1 13v3c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          )},
          { label: 'Pass Count', value: kpis.passCount, color: 'text-[#009639]', icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )},
          { label: 'Fail Count', value: kpis.failCount, color: 'text-red-600', icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )},
          { label: 'Revenue (ETB)', value: kpis.totalRevenue.toLocaleString(), color: 'text-[#009639]', icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          )},
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">{kpi.label}</p>
              {kpi.icon}
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
          <LineChart data={chartData} dataKey="inspections" color="#009639" height={160} label="Inspections" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Revenue Trend (ETB)</h3>
            <span className="text-xs text-gray-400">{dateRange === 'today' ? 'Hourly' : dateRange === 'week' ? 'Daily' : 'Weekly'}</span>
          </div>
          <LineChart data={chartData} dataKey="revenue" color="#F59E0B" height={160} label="Revenue" />
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

      {/* Vehicle Search Modal */}
      {vehicleSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Search Vehicle History</h2>
              <button 
                onClick={() => { setVehicleSearchModal(false); setVehicleSearchQuery(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <input
                type="text"
                placeholder="Enter Plate Number, Chassis, or Owner..."
                value={vehicleSearchQuery}
                onChange={(e) => setVehicleSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#009639]/20"
                autoFocus
              />
            </div>
            <div className="max-h-80 overflow-y-auto px-5 pb-5">
              {vehicleSearchQuery && vehicleHistoryResults.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No results found for "{vehicleSearchQuery}"</p>
              )}
              {vehicleHistoryResults.map((row) => (
                <div 
                  key={row.id} 
                  className="p-4 border border-gray-100 rounded-xl mb-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setVehicleSearchModal(false);
                    setVehicleSearchQuery('');
                    navigate('/result');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{row.plate}</p>
                      <p className="text-xs text-gray-500">{row.vehicleType} • {row.dateTime}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(row.result, 'result')}`}>
                      {row.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
