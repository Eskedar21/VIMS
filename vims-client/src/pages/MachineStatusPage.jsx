import { useState, useEffect } from 'react';

// Flat SVG Icons
const Icon = {
  online: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  offline: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  warning: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  maintenance: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
  refresh: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  alignment: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>,
  suspension: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12h16M4 12c0-2 2-4 4-4h8c2 0 4 2 4 4M4 12v4h16v-4"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M7 8V4M17 8V4"/></svg>,
  brake: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>,
  gas: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M6 21V10a2 2 0 012-2h8a2 2 0 012 2v11"/><path d="M9 8V5a2 2 0 012-2h2a2 2 0 012 2v3"/><path d="M10 12h4M10 16h4"/></svg>,
  smoke: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 16c0-4 4-6 4-10M12 6c0 4 4 6 4 10"/><path d="M4 20h16M6 16h12"/></svg>,
  headlight: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  signal: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0114 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>,
  activity: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
};

// Machine definitions
const MACHINES = [
  {
    id: 'side-slip',
    name: 'Side Slip Tester',
    model: 'MAHA SST-300',
    icon: 'alignment',
    description: 'Wheel alignment measurement',
    location: 'Lane 1 - Entry',
    serialNo: 'SST-2024-001',
    lastCalibration: '2024-10-15',
    nextCalibration: '2025-04-15',
  },
  {
    id: 'suspension',
    name: 'Suspension Tester',
    model: 'MAHA LPS 3000',
    icon: 'suspension',
    description: 'Shock absorber efficiency test',
    location: 'Lane 1 - Position 2',
    serialNo: 'SUS-2024-002',
    lastCalibration: '2024-09-20',
    nextCalibration: '2025-03-20',
  },
  {
    id: 'brake-roller',
    name: 'Brake Roller Tester',
    model: 'MAHA IW7 EUROSYSTEM',
    icon: 'brake',
    description: 'Service & parking brake force measurement',
    location: 'Lane 1 - Position 3',
    serialNo: 'BRT-2024-003',
    lastCalibration: '2024-11-01',
    nextCalibration: '2025-05-01',
  },
  {
    id: 'gas-analyzer',
    name: 'Gas Analyzer',
    model: 'MAHA MGT 5',
    icon: 'gas',
    description: 'Petrol emissions (HC, CO, CO₂, O₂, Lambda)',
    location: 'Lane 2 - Emissions Bay',
    serialNo: 'GAS-2024-004',
    lastCalibration: '2024-10-28',
    nextCalibration: '2025-04-28',
  },
  {
    id: 'smoke-meter',
    name: 'Smoke Opacity Meter',
    model: 'MAHA MDO 2 LON',
    icon: 'smoke',
    description: 'Diesel opacity measurement',
    location: 'Lane 2 - Emissions Bay',
    serialNo: 'SMK-2024-005',
    lastCalibration: '2024-10-28',
    nextCalibration: '2025-04-28',
  },
  {
    id: 'headlight',
    name: 'Headlight Tester',
    model: 'MAHA MLT 3000',
    icon: 'headlight',
    description: 'Beam alignment & intensity check',
    location: 'Lane 1 - Exit',
    serialNo: 'HLT-2024-006',
    lastCalibration: '2024-08-15',
    nextCalibration: '2025-02-15',
  },
];

// Simulate machine statuses
const generateMachineStatus = (machine) => {
  const rand = Math.random();
  let status, uptime, lastPing, temperature, testsToday;

  if (rand > 0.85) {
    status = 'offline';
    uptime = 0;
    lastPing = new Date(Date.now() - Math.random() * 3600000 * 24).toISOString();
  } else if (rand > 0.75) {
    status = 'maintenance';
    uptime = 0;
    lastPing = new Date().toISOString();
  } else if (rand > 0.65) {
    status = 'warning';
    uptime = Math.floor(Math.random() * 100);
    lastPing = new Date().toISOString();
  } else {
    status = 'online';
    uptime = 95 + Math.floor(Math.random() * 5);
    lastPing = new Date().toISOString();
  }

  temperature = 35 + Math.floor(Math.random() * 20);
  testsToday = Math.floor(Math.random() * 50);

  return {
    ...machine,
    status,
    uptime,
    lastPing,
    temperature,
    testsToday,
    responseTime: status === 'online' ? Math.floor(Math.random() * 50) + 10 : null,
  };
};

const StatusBadge = ({ status }) => {
  const config = {
    online: { bg: 'bg-green-100', text: 'text-green-700', icon: Icon.online, label: 'Online' },
    offline: { bg: 'bg-red-100', text: 'text-red-600', icon: Icon.offline, label: 'Offline' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Icon.warning, label: 'Warning' },
    maintenance: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Icon.maintenance, label: 'Maintenance' },
  };
  const c = config[status] || config.offline;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      {c.icon} {c.label}
    </span>
  );
};

const StatusDot = ({ status }) => {
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    warning: 'bg-amber-500',
    maintenance: 'bg-blue-500',
  };
  return (
    <span className={`relative flex h-3 w-3`}>
      {status === 'online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${colors[status] || colors.offline}`} />
    </span>
  );
};

const MachineStatusPage = () => {
  const [machines, setMachines] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedMachine, setSelectedMachine] = useState(null);

  const refreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMachines(MACHINES.map(generateMachineStatus));
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const stats = {
    online: machines.filter(m => m.status === 'online').length,
    offline: machines.filter(m => m.status === 'offline').length,
    warning: machines.filter(m => m.status === 'warning').length,
    maintenance: machines.filter(m => m.status === 'maintenance').length,
  };

  const totalTests = machines.reduce((sum, m) => sum + (m.testsToday || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Machine Status</h1>
          <p className="text-sm text-gray-500">Real-time inspection equipment monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
          <button
            onClick={refreshStatus}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-lg bg-[#009639] text-white text-sm font-semibold hover:bg-[#007c2d] disabled:opacity-50 flex items-center gap-2"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>{Icon.refresh}</span>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">{Icon.activity}</span>
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{machines.length}</p>
          <p className="text-xs text-gray-500">Machines</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-600">{Icon.online}</span>
            <StatusDot status="online" />
          </div>
          <p className="text-3xl font-bold text-green-700">{stats.online}</p>
          <p className="text-xs text-green-600">Online</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-600">{Icon.offline}</span>
            <StatusDot status="offline" />
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.offline}</p>
          <p className="text-xs text-red-500">Offline</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-600">{Icon.warning}</span>
            <StatusDot status="warning" />
          </div>
          <p className="text-3xl font-bold text-amber-700">{stats.warning}</p>
          <p className="text-xs text-amber-600">Warning</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-600">{Icon.maintenance}</span>
            <StatusDot status="maintenance" />
          </div>
          <p className="text-3xl font-bold text-blue-700">{stats.maintenance}</p>
          <p className="text-xs text-blue-600">Maintenance</p>
        </div>
      </div>

      {/* Tests Today */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
              {Icon.activity}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Tests Performed Today</p>
              <p className="text-xs text-gray-500">Across all machines</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-700">{totalTests}</p>
        </div>
      </div>

      {/* Machine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map(machine => (
          <div
            key={machine.id}
            onClick={() => setSelectedMachine(machine)}
            className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg ${
              machine.status === 'online' ? 'border-green-200 hover:border-green-400' :
              machine.status === 'offline' ? 'border-red-200 hover:border-red-400' :
              machine.status === 'warning' ? 'border-amber-200 hover:border-amber-400' :
              'border-blue-200 hover:border-blue-400'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                machine.status === 'online' ? 'bg-green-100 text-green-600' :
                machine.status === 'offline' ? 'bg-red-100 text-red-500' :
                machine.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {Icon[machine.icon]}
              </div>
              <StatusBadge status={machine.status} />
            </div>

            {/* Info */}
            <h3 className="text-lg font-bold text-gray-900 mb-1">{machine.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{machine.model}</p>
            <p className="text-sm text-gray-600 mb-4">{machine.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase">Uptime</p>
                <p className={`text-sm font-bold ${machine.uptime >= 95 ? 'text-green-600' : machine.uptime > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                  {machine.uptime > 0 ? `${machine.uptime}%` : '—'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase">Tests</p>
                <p className="text-sm font-bold text-gray-900">{machine.testsToday}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase">Temp</p>
                <p className={`text-sm font-bold ${machine.temperature > 50 ? 'text-red-600' : 'text-gray-900'}`}>
                  {machine.temperature}°C
                </p>
              </div>
            </div>

            {/* Last Ping */}
            <div className="flex items-center gap-1 mt-3 text-[10px] text-gray-400">
              {Icon.clock}
              <span>Last ping: {machine.status === 'online' ? 'Just now' : new Date(machine.lastPing).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Machine Detail Modal */}
      {selectedMachine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSelectedMachine(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`px-6 py-4 ${
              selectedMachine.status === 'online' ? 'bg-green-500' :
              selectedMachine.status === 'offline' ? 'bg-red-500' :
              selectedMachine.status === 'warning' ? 'bg-amber-500' :
              'bg-blue-500'
            } text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    {Icon[selectedMachine.icon]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{selectedMachine.name}</h3>
                    <p className="text-sm text-white/80">{selectedMachine.model}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMachine(null)} className="p-2 hover:bg-white/20 rounded-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Current Status</span>
                <StatusBadge status={selectedMachine.status} />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase mb-1">Serial Number</p>
                  <p className="text-sm font-mono font-semibold">{selectedMachine.serialNo}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase mb-1">Location</p>
                  <p className="text-sm font-semibold">{selectedMachine.location}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase mb-1">Last Calibration</p>
                  <p className="text-sm font-semibold">{selectedMachine.lastCalibration}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase mb-1">Next Calibration</p>
                  <p className="text-sm font-semibold text-amber-600">{selectedMachine.nextCalibration}</p>
                </div>
              </div>

              {/* Performance */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{selectedMachine.uptime || 0}%</p>
                    <p className="text-[10px] text-gray-500">Uptime</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{selectedMachine.testsToday}</p>
                    <p className="text-[10px] text-gray-500">Tests Today</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{selectedMachine.responseTime || '—'}</p>
                    <p className="text-[10px] text-gray-500">Response (ms)</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${selectedMachine.temperature > 50 ? 'text-red-600' : 'text-gray-900'}`}>
                      {selectedMachine.temperature}°
                    </p>
                    <p className="text-[10px] text-gray-500">Temperature</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {selectedMachine.status === 'offline' && (
                  <button className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 flex items-center justify-center gap-2">
                    {Icon.refresh} Reconnect
                  </button>
                )}
                <button className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                  {Icon.settings} Configure
                </button>
                <button className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                  {Icon.maintenance} Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineStatusPage;

