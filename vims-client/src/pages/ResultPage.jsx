import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInspectionSave } from '../hooks/useInspectionSave';
import { getPhotosByInspectionId } from '../utils/photoStorage';

// Print styles for A4 PDF - optimized for certificate and report printing
const printStyles = `
@media print {
  @page { 
    size: A4; 
    margin: 5mm; 
  }
  * {
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important;
  }
  html, body { 
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
  }
  /* Hide all app shell elements */
  body > div:first-child {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  /* Hide sidebar completely */
  aside,
  aside * {
    display: none !important;
  }
  /* Hide navigation, headers, footers */
  nav,
  header,
  footer,
  .app-shell-header,
  .app-shell-footer,
  .print-hide {
    display: none !important;
  }
  /* Remove left margin from main content (sidebar offset) */
  [class*="ml-16"],
  [class*="ml-60"],
  [class^="ml-"]:not([class*="report-page"]):not([class*="certificate"]) {
    margin-left: 0 !important;
  }
  /* Remove outer container padding but keep report page padding */
  main > div:not([class*="report-page"]):not([class*="certificate"]) {
    padding: 0 !important;
    margin: 0 !important;
  }
  /* Full width for main content area */
  main,
  .flex-1,
  [class*="flex-1"] {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
  }
  /* Container adjustments */
  div[class*="container"],
  div[class*="mx-auto"] {
    width: 100% !important;
    max-width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  /* Report and Certificate pages */
  .report-page,
  [class*="certificate"],
  [class*="report"] {
    width: 100% !important;
    max-width: 100% !important;
    min-height: auto !important;
    padding: 4mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: 1px solid #ddd !important;
    background: white !important;
    page-break-inside: avoid;
    font-size: 9px !important;
  }
  .report-page h1 { 
    font-size: 12px !important;
    margin: 0 0 2mm 0 !important;
  }
  .report-page h2 { 
    font-size: 10px !important;
    margin: 0 0 2mm 0 !important;
  }
  .report-page h3,
  .report-page h4 { 
    font-size: 9px !important;
    margin: 0 0 1mm 0 !important;
  }
  .report-page p { 
    font-size: 8px !important;
    margin: 0 0 1mm 0 !important;
  }
  .report-page .text-2xl,
  .report-page .text-3xl { 
    font-size: 14px !important;
  }
  .report-page .text-lg { 
    font-size: 11px !important;
  }
  .report-page .text-xl { 
    font-size: 12px !important;
  }
  /* Tables */
  table {
    width: 100% !important;
    border-collapse: collapse !important;
    font-size: 8px !important;
    margin: 2mm 0 !important;
  }
  th, td {
    padding: 2mm !important;
    border: 0.5px solid #ddd !important;
  }
  /* Buttons and interactive elements */
  button,
  [role="button"],
  .btn {
    display: none !important;
  }
  /* Ensure proper page breaks */
  .page-break {
    page-break-before: always !important;
  }
  .no-break {
    page-break-inside: avoid !important;
  }
}
`;

const generateGUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = (Math.random() * 16) | 0;
  return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});

const generateCertificateNo = () => `AATIC-${new Date().getFullYear()}-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`;

const getSession = (key) => typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;

const getStoredVehicle = () => {
  try { return JSON.parse(getSession('vims.inspection.vehicle')) || null; } catch { return null; }
};

const getStoredVisual = () => {
  try { return JSON.parse(getSession('vims.inspection.visual')) || null; } catch { return null; }
};

const getStoredMachine = () => {
  try { return JSON.parse(getSession('vims.inspection.machineTest')) || null; } catch { return null; }
};

const storedVehicle = getStoredVehicle();
const storedMachine = getStoredMachine();

const VEHICLE = {
  inspectionId: getSession('vims.inspection.id') || 'VIS-2025-DEMO',
  plate: storedVehicle?.plateNumber || 'AA-12345',
  chassis: storedVehicle?.chassisNumber || 'LZYTBTE23F1234567',
  engine: storedVehicle?.engineNumber || 'YC6L310-42',
  owner: storedVehicle?.ownerName || 'Abebe Kebede',
  vehicleType: storedVehicle?.vehicleType || 'Bus',
  brandModel: storedVehicle?.brandModel || 'Toyota Camry',
  titleCertificate: storedVehicle?.titleCertificate || 'TC-2024-78543',
  licensedCapacity: storedVehicle?.licensedCapacity || '50',
  fuelType: storedVehicle?.fuelType || 'Diesel',
  category: storedVehicle?.category || 'HEAVY',
  kilometerReading: storedVehicle?.kilometerReading || '125480',
  testStartTime: storedVehicle?.testStartTime || new Date().toLocaleString(),
};

const FEES = {
  LIGHT: { base: 350, vat: 52.50, total: 402.50 },
  HEAVY: { base: 550, vat: 82.50, total: 632.50 },
};

// Flat SVG Icons
const Icon = {
  car: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17l-1 2h16l-1-2M7 7l1-3h8l1 3"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  truck: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="8" width="15" height="9" rx="1"/><path d="M16 8h4a2 2 0 012 2v5a2 2 0 01-2 2h-4"/><circle cx="5" cy="17" r="2"/><circle cx="12" cy="17" r="2"/><circle cx="19" cy="17" r="2"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  print: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  download: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  certificate: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></svg>,
  payment: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0"/><path d="M6 8h.01M18 8h.01"/></svg>,
  phone: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  forward: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  building: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6"/></svg>,
  gauge: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  eye: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  wrench: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
};

// Vehicle Info Header Bar Component
const VehicleInfoBar = ({ compact = false }) => {
  const formatChassis = (c) => c?.length > 12 ? `${c.slice(0, 6)}...${c.slice(-4)}` : c;
  
  if (compact) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${VEHICLE.category === 'HEAVY' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-[#1d8dcc]'}`}>
              {VEHICLE.category === 'HEAVY' ? Icon.truck : Icon.car}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{VEHICLE.plate}</p>
              <p className="text-xs text-gray-500">{VEHICLE.brandModel} • {VEHICLE.fuelType}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Inspection ID</p>
            <p className="text-sm font-mono font-bold text-[#88bf47]">{VEHICLE.inspectionId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="grid grid-cols-6 divide-x divide-gray-100">
        {[
          { label: 'Licence Plate', value: VEHICLE.plate, bold: true },
          { label: 'Km', value: Number(VEHICLE.kilometerReading).toLocaleString() },
          { label: 'Brand / Model', value: VEHICLE.brandModel },
          { label: 'Chassis', value: formatChassis(VEHICLE.chassis), mono: true },
          { label: 'Motor No', value: VEHICLE.engine, mono: true },
          { label: 'Test Start', value: VEHICLE.testStartTime },
        ].map((item, i) => (
          <div key={i} className="p-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{item.label}</p>
            <p className={`text-sm font-bold text-gray-900 ${item.mono ? 'font-mono' : ''}`}>{item.value || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// TeleBirr Payment Modal
const TeleBirrModal = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fee = FEES[VEHICLE.category] || FEES.LIGHT;

  const sendOtp = () => {
    if (!/^09\d{8}$/.test(phone)) { setError('Enter valid phone (09XXXXXXXX)'); return; }
    setError(''); setLoading(true);
    setTimeout(() => { setLoading(false); setStep('otp'); }, 1500);
  };

  const verifyOtp = () => {
    if (otp.length !== 6) { setError('Enter 6-digit OTP'); return; }
    setError(''); setLoading(true); setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => onSuccess({ transactionId: `TB${Date.now()}`, phone, amount: fee.total }), 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#E31937] to-[#FF6B35] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">{Icon.payment}</div>
            <div>
              <h3 className="text-lg font-bold">TeleBirr Payment</h3>
              <p className="text-sm text-white/80">Powered by Ethiotelecom</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 uppercase mb-1">Inspection Fee ({VEHICLE.category})</p>
            <div className="flex justify-between items-end">
              <div className="text-sm text-gray-600">
                <p>Base: ETB {fee.base.toFixed(2)}</p>
                <p>VAT: ETB {fee.vat.toFixed(2)}</p>
              </div>
              <p className="text-2xl font-bold text-[#E31937]">ETB {fee.total.toFixed(2)}</p>
            </div>
          </div>

          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Customer Phone</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{Icon.phone}</span>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="09XXXXXXXX" className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-200 text-lg font-mono focus:border-[#E31937] focus:ring-2 focus:ring-[#E31937]/20 outline-none" autoFocus />
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">{Icon.check}</div>
              <p className="text-sm text-gray-600">OTP sent to <strong>{phone}</strong></p>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="• • • • • •" className="w-full h-14 px-4 rounded-lg border border-gray-200 text-2xl font-mono text-center tracking-[0.5em] focus:border-[#E31937] focus:ring-2 focus:ring-[#E31937]/20 outline-none" autoFocus />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button onClick={() => setStep('phone')} className="text-xs text-[#E31937] hover:underline">Change number</button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-[#E31937] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900">Processing...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-xl font-bold text-green-700">Payment Successful!</p>
              <p className="text-sm text-gray-500">ETB {fee.total.toFixed(2)}</p>
            </div>
          )}
        </div>

        {(step === 'phone' || step === 'otp') && (
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onCancel} className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={step === 'phone' ? sendOtp : verifyOtp} disabled={loading} className="flex-1 px-4 py-3 rounded-lg bg-[#E31937] text-white font-semibold hover:bg-[#C41530] disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : step === 'phone' ? 'Send OTP' : 'Verify & Pay'}
            </button>
          </div>
        )}

        {step === 'phone' && (
          <div className="px-6 pb-4 text-center">
            <button onClick={() => onSuccess({ transactionId: 'CASH-' + Date.now(), phone: 'N/A', amount: fee.total, method: 'Cash' })} className="text-xs text-gray-400 hover:text-gray-600">
              Pay with Cash instead →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Machine Test Results Data
const getMachineResults = () => {
  const titleMap = {
    alignment: 'Alignment',
    suspension: 'Suspension',
    brake: 'Brakes',
    gas: 'Emissions',
    smoke: 'Emissions',
    headlight: 'Headlights',
  };

  if (storedMachine) {
    return Object.entries(storedMachine).map(([key, data]) => ({
      id: key,
      title: titleMap[key] || key.charAt(0).toUpperCase() + key.slice(1),
      result: data.sectionResult || 'PASS',
      fields: data.fields || {},
    }));
  }
  return [
    { id: 'alignment', title: 'Alignment', result: 'PASS', fields: { deviation: { value: 2.1, result: 'PASS' } } },
    { id: 'suspension', title: 'Suspension', result: 'PASS', fields: { left: { value: 58, result: 'PASS' }, right: { value: 54, result: 'PASS' } } },
    { id: 'brake', title: 'Brakes', result: 'PASS', fields: { efficiency: { value: 62, result: 'PASS' } } },
    { id: 'gas', title: 'Emissions', result: 'PASS', fields: { hc: { value: 180, result: 'PASS' } } },
    { id: 'headlight', title: 'Headlights', result: 'PASS', fields: { intensity: { value: 15200, result: 'PASS' } } },
  ];
};

const ResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const printRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.textContent = printStyles;
    document.head.appendChild(style);
    return () => document.getElementById('print-styles')?.remove();
  }, []);

  const [isFinalized, setIsFinalized] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [stickerNo, setStickerNo] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [certNo, setCertNo] = useState('');
  
  const { saveInspectionData, saving } = useInspectionSave();

  // Check if inspection is already finalized
  useEffect(() => {
    const hasInspectionId = getSession('vims.inspection.id');
    if (hasInspectionId) {
      setIsFinalized(true);
      setReportId(getSession('vims.inspection.id') || generateGUID());
    }
  }, []);

  // Auto-show report and print if print parameter is present
  useEffect(() => {
    if (searchParams.get('print') === 'true') {
      // Mark as finalized and show report
      setIsFinalized(true);
      setReportId(getSession('vims.inspection.id') || generateGUID());
      setShowReport(true);
      
      // Trigger print after a short delay to ensure DOM is ready
      setTimeout(() => {
        window.print();
        // Remove print parameter from URL after printing
        navigate('/result', { replace: true });
      }, 500);
    }
  }, [searchParams, navigate]);

  const machineResults = useMemo(() => getMachineResults(), []);
  const visualData = getStoredVisual() || { earnedPoints: 95, totalPoints: 100 };
  
  // Calculate visual inspection zones from stored checklist
  const calculateVisualZones = useMemo(() => {
    if (!visualData?.checklist) {
      // Default zones if no checklist data
      return [
        { zone: 'Identification', items: 4, passed: 4 },
        { zone: 'Lighting', items: 7, passed: 7 },
        { zone: 'Steering & Suspension', items: 6, passed: 6 },
        { zone: 'Body & Interior', items: 8, passed: 8 },
        { zone: 'Safety Equipment', items: 5, passed: 5 },
      ];
    }

    const checklist = visualData.checklist;
    const category = visualData.category || VEHICLE.category || 'LIGHT';
    
    // Zone definitions (matching InspectionPage structure)
    const zoneDefinitions = category === 'HEAVY' ? [
      { id: 'zone1', name: 'Identification', itemIds: [1, 2, 3, 4] },
      { id: 'zone2', name: 'Lighting', itemIds: [5, 6, 7, 8, 9, 10, 11] },
      { id: 'zone3', name: 'Steering & Suspension', itemIds: [12, 13, 14, 15, 16, 17] },
      { id: 'zone4', name: 'Body & Interior', itemIds: [18, 19, 20, 21, 22, 23, 24, 25] },
      { id: 'zone5', name: 'Safety Equipment', itemIds: [26, 27, 28, 29, 30] },
    ] : [
      { id: 'zone1', name: 'Identification', itemIds: [1, 2, 3, 4] },
      { id: 'zone2', name: 'Lighting', itemIds: [5, 6, 7, 8, 9, 10, 11] },
      { id: 'zone3', name: 'Steering & Suspension', itemIds: [12, 13, 14, 15, 16, 17] },
      { id: 'zone4', name: 'Body & Interior', itemIds: [18, 19, 20, 21, 22, 23, 24, 25] },
      { id: 'zone5', name: 'Safety Equipment', itemIds: [26, 27, 28, 29, 30] },
    ];

    return zoneDefinitions.map(zone => {
      const zoneItems = zone.itemIds;
      const passed = zoneItems.filter(id => checklist[id]?.status === 'PASS').length;
      return {
        zone: zone.name,
        items: zoneItems.length,
        passed: passed,
      };
    });
  }, [visualData]);

  const machinePass = machineResults.every(r => r.result === 'PASS');
  const visualPass = useMemo(() => {
    if (!visualData || !visualData.totalPoints) return true;
    const percentage = (visualData.earnedPoints / visualData.totalPoints) * 100;
    return percentage >= 80; // Pass if 80% or more
  }, [visualData]);
  const overallResult = machinePass && visualPass ? 'PASS' : 'FAIL';

  const inspectionDate = new Date().toLocaleDateString('en-GB');
  const expiryDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString('en-GB');
  }, []);

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      const inspectionId = getSession('vims.inspection.id') || `VIS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const storedVehicle = getStoredVehicle();
      const storedVisual = getStoredVisual();
      const storedMachine = getStoredMachine();
      
      // Get photos from storage
      const photosData = getPhotosByInspectionId(inspectionId);
      const photos = photosData?.photos || {
        registration: storedVehicle?.photo || null,
        inspection: storedVisual?.photos || [],
        machineTest: storedMachine?.photos || [],
      };
      
      // Prepare machine results
      const allMachineResults = storedMachine?.results || getMachineResults() || [];
      const formattedMachineResults = allMachineResults.map(result => ({
        test: result.test || result.name,
        testType: result.testType,
        value: result.value || result.result,
        unit: result.unit || '%',
        status: result.status === 'PASS' ? 'Pass' : 'Fail',
        threshold: result.threshold,
        minValue: result.minValue,
        maxValue: result.maxValue,
        timestamp: result.timestamp || new Date().toISOString(),
      }));
      
      // Prepare visual results
      const visualResults = (storedVisual?.results || []).map(result => ({
        item: result.item || result.name,
        category: result.category,
        status: result.status === 'PASS' ? 'Pass' : 'Fail',
        severity: result.severity || 'Info',
        notes: result.notes,
        photoId: result.photoId,
        timestamp: result.timestamp || new Date().toISOString(),
      }));
      
      // Calculate cycle time
      const startTime = new Date(VEHICLE.testStartTime);
      const endTime = new Date();
      const cycleTimeSeconds = Math.floor((endTime - startTime) / 1000);
      
      // Prepare inspection data
      const inspectionData = {
        id: inspectionId,
        vehicle: {
          plateNumber: VEHICLE.plate,
          vin: VEHICLE.chassis,
          make: VEHICLE.brandModel?.split(' ')[0] || '',
          model: VEHICLE.brandModel?.split(' ').slice(1).join(' ') || '',
          owner: {
            name: VEHICLE.owner,
          },
          vehicleType: VEHICLE.vehicleType,
          category: VEHICLE.category,
          kilometerReading: parseInt(VEHICLE.kilometerReading) || 0,
        },
        inspectorId: 'inspector-1',
        inspectorName: 'Inspector',
        centerId: 'center-1',
        centerName: 'Addis Ababa / Lane 1',
        status: overallResult === 'PASS' ? 'Passed' : 'Failed',
        overallResult: overallResult,
        type: 'Initial Inspection',
        amount: FEES[VEHICLE.category]?.total || 0,
        inspectionDate: new Date().toISOString(),
        inspectionDateStart: VEHICLE.testStartTime,
        inspectionDateEnd: new Date().toISOString(),
        cycleTimeSeconds: cycleTimeSeconds,
        machineResults: formattedMachineResults,
        visualResults: visualResults,
        photos: photos,
        certificateNumber: certNo || null,
        certificateIssueDate: certNo ? new Date().toISOString() : null,
        certificateExpiryDate: certNo ? expiryDate : null,
      };
      
      // Save to database
      await saveInspectionData(inspectionData);
      
      setReportId(inspectionId);
      setIsFinalized(true);
      window.sessionStorage.setItem('vims.report.id', inspectionId);
    } catch (error) {
      console.error('Failed to save inspection:', error);
      alert('Failed to save inspection. Please try again.');
    } finally {
      setIsFinalizing(false);
    }
  };


  const handleIssueCert = () => {
    setCertNo(generateCertificateNo());
    setShowCertModal(true);
  };

  const handleCertSubmit = () => {
    if (!stickerNo.trim()) return;
    setShowCertModal(false);
    setShowCert(true);
  };

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    const rows = [
      ['Report ID', reportId],
      ['Plate', VEHICLE.plate],
      ['Owner', VEHICLE.owner],
      ['Result', overallResult],
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `inspection_${reportId}.csv`;
    a.click();
  };

  // Full Report View (2 pages: Machine + Visual)
  if (showReport) {
    return (
      <div ref={printRef}>
        <div className="print-hide mb-4 flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Complete Inspection Report</h2>
            <p className="text-sm text-gray-500">Machine Test + Visual Inspection (2 Pages)</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowReport(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2">{Icon.back} Back</button>
            <button onClick={handlePrint} className="px-6 py-2 rounded-lg bg-[#88bf47] text-white font-semibold hover:bg-[#0fa84a] flex items-center gap-2">{Icon.print} Print Report</button>
          </div>
        </div>

        {/* PAGE 1: Machine Test - Lideta Style */}
        <div className="report-page bg-white border border-gray-300 rounded-lg shadow-lg mx-auto mb-6 p-6" style={{ maxWidth: '210mm', fontSize: '11px' }}>
          {/* Header - Lideta Style */}
          <div className="border-b-2 border-gray-800 pb-3 mb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 border-2 border-gray-400 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-center leading-tight">PSTS<br/>LOGO</span>
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900 uppercase">Awash Valley Technical Inspection S.C.</h1>
                  <p className="text-[10px] text-gray-600">LIDETA INFRONT OF POLICE HOSPITAL - ADDIS ABABA</p>
                </div>
              </div>
              <div className="text-right text-[10px]">
                <p>Phone 1: <strong>+251-11-153639</strong></p>
                <p>Fax: <strong>000000000</strong></p>
              </div>
            </div>
          </div>

          {/* Client & Vehicle Data Table */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="border border-gray-300">
              <div className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1">CLIENT DATA</div>
              <table className="w-full text-[10px]">
                <tbody>
                  <tr><td className="px-2 py-1 border-b">Name:</td><td className="px-2 py-1 border-b font-semibold">{VEHICLE.owner}</td></tr>
                  <tr><td className="px-2 py-1 border-b">Address:</td><td className="px-2 py-1 border-b">Addis Ababa</td></tr>
                  <tr><td className="px-2 py-1 border-b">Province:</td><td className="px-2 py-1 border-b">-</td></tr>
                  <tr><td className="px-2 py-1">Phone:</td><td className="px-2 py-1">-</td></tr>
                </tbody>
              </table>
            </div>
            <div className="border border-gray-300">
              <div className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1">VEHICLE INFORMATION</div>
              <table className="w-full text-[10px]">
                <tbody>
                  <tr><td className="px-2 py-1 border-b w-32">Licence plate number:</td><td className="px-2 py-1 border-b font-bold">{VEHICLE.plate}</td><td className="px-2 py-1 border-b w-12">Km.:</td><td className="px-2 py-1 border-b font-semibold">{VEHICLE.kilometerReading}</td></tr>
                  <tr><td className="px-2 py-1 border-b">Brand / Model:</td><td colSpan="3" className="px-2 py-1 border-b font-semibold">{VEHICLE.brandModel}</td></tr>
                  <tr><td className="px-2 py-1 border-b">Chassis:</td><td className="px-2 py-1 border-b font-mono text-[9px]">{VEHICLE.chassis}</td><td className="px-2 py-1 border-b">Motor Nº:</td><td className="px-2 py-1 border-b font-mono text-[9px]">{VEHICLE.engine}</td></tr>
                  <tr><td className="px-2 py-1">Test start:</td><td colSpan="3" className="px-2 py-1 font-semibold">{VEHICLE.testStartTime}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[10px] mb-2 flex gap-4">
            <span>Technician: <strong>GETU</strong></span>
            <span>Lane Nº: <strong>1</strong></span>
            <span>Lane type: <strong>-</strong></span>
            <span>Inspection Nº: <strong>{VEHICLE.inspectionId.slice(-2)}</strong></span>
          </div>

          {/* ALIGNMENT Section */}
          <table className="w-full border border-gray-400 text-[10px] mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left w-24"></th>
                <th className="border px-2 py-1">MEASUREMENT</th>
                <th className="border px-2 py-1">AXLE Nº1</th>
                <th className="border px-2 py-1">AXLE Nº2</th>
                <th className="border px-2 py-1">AXLE Nº3</th>
                <th className="border px-2 py-1">AXLE Nº4</th>
                <th className="border px-2 py-1 w-20">Limits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan="5" className="border px-2 py-1 font-bold bg-gray-50 align-top">ALIGNMENT<br/>SUSPENSION</td>
                <td className="border px-2 py-1">Deviation (m/km)</td>
                <td className="border px-2 py-1 text-center font-semibold">-2.0</td>
                <td className="border px-2 py-1 text-center">0.0</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center text-[9px]">m/Km &lt;= 7</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Left Efficiency (%)</td>
                <td className="border px-2 py-1 text-center font-semibold">58</td>
                <td className="border px-2 py-1 text-center">52</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td rowSpan="4" className="border px-2 py-1 text-[9px] align-top">
                  <div className="text-right">
                    <p>% Sport Comfort</p>
                    <p>Defect &gt;= 41 &gt;= 41</p>
                    <p>Weak &gt;= 41 &gt;= 41</p>
                    <p>Diff. &lt;= 30 &lt;= 30</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Right Efficiency (%)</td>
                <td className="border px-2 py-1 text-center font-semibold">54</td>
                <td className="border px-2 py-1 text-center">48</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Difference (%)</td>
                <td className="border px-2 py-1 text-center">7</td>
                <td className="border px-2 py-1 text-center">8</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Suspension type:</td>
                <td colSpan="4" className="border px-2 py-1">Sport</td>
              </tr>
            </tbody>
          </table>

          {/* BRAKES Section */}
          <table className="w-full border border-gray-400 text-[10px] mb-2">
            <tbody>
              <tr>
                <td rowSpan="12" className="border px-2 py-1 font-bold bg-gray-50 align-top w-24">BRAKES</td>
                <td colSpan="5" className="border px-2 py-1 font-semibold bg-gray-100">SERVICE BRAKE</td>
                <td rowSpan="5" className="border px-2 py-1 text-[9px] align-top w-20">
                  <p className="text-center font-semibold">%</p>
                  <p>Diff. &lt;= 30</p>
                  <p>Serv. &gt;= 50</p>
                  <p>Hand &gt;= 25</p>
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Left Force (KN)</td>
                <td className="border px-2 py-1 text-center font-semibold">17.53</td>
                <td className="border px-2 py-1 text-center">11.00</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Right Force (KN)</td>
                <td className="border px-2 py-1 text-center font-semibold">14.90</td>
                <td className="border px-2 py-1 text-center">9.46</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Axle Difference (%)</td>
                <td className="border px-2 py-1 text-center">15</td>
                <td className="border px-2 py-1 text-center">14</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Efficiency axle (%)</td>
                <td className="border px-2 py-1 text-center font-semibold">77</td>
                <td className="border px-2 py-1 text-center">57</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Total Efficiency(%):</td>
                <td colSpan="4" className="border px-2 py-1 text-center font-bold text-green-700">69</td>
                <td className="border px-2 py-1"></td>
              </tr>
              <tr>
                <td colSpan="5" className="border px-2 py-1 font-semibold bg-gray-100">PARKING BRAKE</td>
                <td className="border px-2 py-1"></td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Left Force (KN)</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center font-semibold">12.57</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1"></td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Right Force (KN)</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center font-semibold">10.05</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1"></td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Axle Difference (%)</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">20</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1"></td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Total Efficiency(%):</td>
                <td colSpan="4" className="border px-2 py-1 text-center font-bold text-green-700">30</td>
                <td className="border px-2 py-1"></td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Axle Weight (Kg)</td>
                <td className="border px-2 py-1 text-center font-semibold">4212</td>
                <td className="border px-2 py-1 text-center">3588</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1 text-center">-</td>
                <td className="border px-2 py-1"></td>
              </tr>
            </tbody>
          </table>

          {/* TOTAL Row */}
          <div className="border border-gray-400 p-2 mb-2 flex justify-between items-center bg-gray-50">
            <span className="font-bold">TOTAL</span>
            <span>Vehicle efficiency: <strong className={`text-lg ${69 >= 50 ? 'text-green-700' : 'text-red-600'}`}>69</strong></span>
            <span>Peso Vehiculo (Kg): <strong>7800</strong></span>
          </div>

          {/* GAS ANALYZER */}
          <table className="w-full border border-gray-400 text-[10px] mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left w-28">GAS ANALYZER</th>
                <th className="border px-1 py-1">HC (ppm)</th>
                <th className="border px-1 py-1">CO (%)</th>
                <th className="border px-1 py-1">CO2 (%)</th>
                <th className="border px-1 py-1">COcorr (%)</th>
                <th className="border px-1 py-1">O2 (%)</th>
                <th className="border px-1 py-1">Lambda</th>
                <th className="border px-1 py-1">Temp.</th>
                <th className="border px-1 py-1">RPM</th>
                <th className="border px-2 py-1 w-24 text-[9px]">Limits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1 font-bold bg-gray-50">SMOKE METER</td>
                <td className="border px-1 py-1 text-center">55.25</td>
                <td className="border px-1 py-1 text-center">56.20</td>
                <td className="border px-1 py-1 text-center">0.00</td>
                <td className="border px-1 py-1 text-center">0.00</td>
                <td className="border px-1 py-1 text-center">0.00</td>
                <td className="border px-1 py-1 text-center">0.00</td>
                <td className="border px-1 py-1 text-center">0.00</td>
                <td className="border px-1 py-1 text-center">0.00</td>
                <td rowSpan="2" className="border px-2 py-1 text-[8px]">
                  HC: 0-600<br/>CO2: 12-16<br/>Lamb: 0.97-1.03
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1 text-[9px]">(K)</td>
                <td className="border px-1 py-1 text-center">1.87</td>
                <td className="border px-1 py-1 text-center">1.92</td>
                <td className="border px-1 py-1 text-center">0.00</td>
                <td className="border px-1 py-1 text-center">0.00</td>
                <td className="border px-1 py-1 text-center">0.00</td>
                <td className="border px-1 py-1 text-center">0.00</td>
                <td className="border px-1 py-1 text-center">0.00</td>
                <td className="border px-1 py-1 text-center">0.00</td>
              </tr>
            </tbody>
          </table>

          {/* HEADLIGHT */}
          <table className="w-full border border-gray-400 text-[10px] mb-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left w-28">HEADLIGHT</th>
                <th className="border px-2 py-1">Dipped Lf.</th>
                <th className="border px-2 py-1">Dipped Rg.</th>
                <th className="border px-2 py-1">Full Lf.</th>
                <th className="border px-2 py-1">Full Rg.</th>
                <th className="border px-2 py-1">Fog Lf.</th>
                <th className="border px-2 py-1">Fog Rg.</th>
                <th className="border px-2 py-1 w-24 text-[9px]">Limits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">Intensity (cd)</td>
                <td className="border px-2 py-1 text-center font-semibold">9451</td>
                <td className="border px-2 py-1 text-center font-semibold">25657</td>
                <td className="border px-2 py-1 text-center">3490</td>
                <td className="border px-2 py-1 text-center">2040</td>
                <td className="border px-2 py-1 text-center">9251</td>
                <td className="border px-2 py-1 text-center">5541</td>
                <td className="border px-2 py-1 text-[8px]">
                  Dipped: 7000-1000000<br/>Full: 10000-1000000<br/>Fog: 800-1000000
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Signatures */}
          <div className="grid grid-cols-3 border-t-2 border-gray-800 pt-3 text-[10px]">
            <div className="text-center">
              <p className="font-bold uppercase">Inspector</p>
              <p className="mt-4 pt-4 border-t border-gray-400 mx-4">Getu Tadesse</p>
            </div>
            <div className="text-center">
              <p className="font-bold uppercase">Result</p>
              <p className={`text-2xl font-bold mt-2 ${machinePass ? 'text-green-700' : 'text-red-600'}`}>
                {machinePass ? 'PASS' : 'FAIL'}
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold uppercase">Chief</p>
              <p className="mt-4 pt-4 border-t border-gray-400 mx-4">Alemayehu Bekele</p>
            </div>
          </div>
        </div>

        {/* PAGE 2: Visual Inspection - Heavy/Regular Vehicle Form Style */}
        <div className={`report-page border rounded-lg shadow-lg mx-auto p-6 bg-white ${VEHICLE.category === 'HEAVY' ? 'border-amber-300' : 'border-gray-300'}`} style={{ maxWidth: '210mm', fontSize: '10px' }}>
          {/* Header - Official Form Style */}
          <div className="border-b-2 border-gray-800 pb-3 mb-3">
            <div className="text-center">
              <p className="text-[9px] text-gray-600">በአዲስ አበባ ከተማ አስተዳደር የሾፌሮችና ተሽከርካሪዎች ፈቃድና ቁጥጥር ባለስልጣን</p>
              <p className="text-xs font-semibold">City Government of A.A Driver And Vehicles Licensing And Control Authority</p>
              <p className="text-[9px] text-gray-600 mt-1">{VEHICLE.category === 'HEAVY' ? 'የከባድ ተሽከርካሪዎች ዓመታዊ የቴክኒክ ምርመራ ቅጽ' : 'የህዝብ አገልግሎት ተሽከርካሪ የእይታ ምርመራ ቅጽ'}</p>
              <h1 className={`text-sm font-bold mt-1 ${VEHICLE.category === 'HEAVY' ? 'text-amber-800' : 'text-blue-800'}`}>
                {VEHICLE.category === 'HEAVY' ? 'Heavy Vehicles Annual Technical Inspection Form' : 'Public Service Transport Service - Visual Inspection Form'}
              </h1>
            </div>
            <div className="flex justify-end text-[9px] mt-1">
              <span>ቁጥር / No. <strong className="border-b border-gray-400 px-2">{VEHICLE.inspectionId.slice(-4)}</strong></span>
            </div>
          </div>

          {/* Vehicle Info Header */}
          <div className="grid grid-cols-3 gap-2 mb-3 text-[10px]">
            <div className="flex"><span className="w-24">የምርመራ ቁጥር:</span><span className="border-b border-gray-400 flex-1 font-semibold px-1">{VEHICLE.inspectionId}</span></div>
            <div className="flex"><span className="w-20">የሰሌዳ ቁጥር:</span><span className="border-b border-gray-400 flex-1 font-semibold px-1">{VEHICLE.plate}</span></div>
            <div className="flex"><span className="w-24">የባለቤት ስም:</span><span className="border-b border-gray-400 flex-1 font-semibold px-1">{VEHICLE.owner}</span></div>
            <div className="flex"><span className="w-24">የባለቤትነት ደብተር:</span><span className="border-b border-gray-400 flex-1 px-1">-</span></div>
            <div className="flex"><span className="w-20">የሻሲ ቁጥር:</span><span className="border-b border-gray-400 flex-1 font-mono text-[9px] px-1">{VEHICLE.chassis}</span></div>
            <div className="flex"><span className="w-20">የሞተር ቁጥር:</span><span className="border-b border-gray-400 flex-1 font-mono text-[9px] px-1">{VEHICLE.engine}</span></div>
          </div>

          {/* 30-Point Visual Inspection Table */}
          <table className="w-full border border-gray-500 text-[9px] mb-3">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-1 py-1 w-6 text-center">ተ.ቁ</th>
                <th className="border border-gray-400 px-1 py-1 text-left">ዝርዝር መስፈርት / Inspection Criteria</th>
                <th className="border border-gray-400 px-1 py-1 w-12 text-center">የተሰጠዉ<br/>ነጥብ</th>
                <th className="border border-gray-400 px-1 py-1 w-12 text-center">ትክክል<br/>Correct</th>
                <th className="border border-gray-400 px-1 py-1 w-14 text-center">ትክክልያልሆነ<br/>Not Correct</th>
                <th className="border border-gray-400 px-1 py-1 w-16 text-center">ምመሪ<br/>Remark</th>
              </tr>
            </thead>
            <tbody>
              {[
                { no: 1, am: 'የምዝገባ ሰሌዳና የባለቤትነት', en: 'Reg Plate & Ownership', pts: 8, pass: true },
                { no: 2, am: 'የፊት ማቆሚያ መብራቶች', en: 'Front Position Lights', pts: null, pass: true },
                { no: 3, am: 'የኋላ ማቆሚያ መብራቶች', en: 'Rear Position Lights', pts: null, pass: true },
                { no: 4, am: 'የፍሬን መብራቶች', en: 'Brake Lights', pts: 10, pass: true },
                { no: 5, am: 'የኋላ መብራቶች', en: 'Reverse Lights', pts: null, pass: true },
                { no: 6, am: 'የማዞሪያ መብራቶች', en: 'Turn Signal Lights', pts: null, pass: true },
                { no: 7, am: 'የማቆሚያ መብራቶች', en: 'Parking Lights', pts: null, pass: true },
                { no: 8, am: 'የፍሬን መብራቶች (ተሳቢን ጨምሮ)', en: 'Brake Lights (incl. trailer)', pts: 14, pass: true },
                { no: 9, am: 'የሰሌዳ መብራት', en: 'Plate Light', pts: 8, pass: true },
                { no: 10, am: 'ጥሩምባ (ሆርን)', en: 'Horn Function', pts: null, pass: true },
                { no: 11, am: 'የዝናብ መጥረጊያ', en: 'Windshield Wipers', pts: null, pass: true },
                { no: 12, am: 'የመሪ ክፍሎች ሁኔታ', en: 'Steering Components', pts: null, pass: true },
                { no: 13, am: 'የኤሌክትሪክ ክፍሎች', en: 'Electrical Components', pts: 12, pass: true },
                { no: 14, am: 'የኃይል ማስተላለፊያ ክፍሎች', en: 'Transmission Components', pts: null, pass: true },
                { no: 15, am: 'ጎማዎች፣ ፍሬን፣ ማርሽ', en: 'Tires, Brakes, Transmission', pts: null, pass: true },
                { no: 16, am: 'የጎማ ናቶች', en: 'Wheel Nuts & Tires', pts: null, pass: true },
                { no: 17, am: 'የመንቀጥቀጫ ማስወገጃ', en: 'Shock Absorbers', pts: null, pass: true },
                { no: 18, am: 'የጭስ ማስወጫ', en: 'Exhaust System', pts: null, pass: true },
                { no: 19, am: 'የነዳጅ ስርዓት', en: 'Fuel System', pts: null, pass: true },
                { no: 20, am: 'ጎማዎች', en: 'Tires', pts: null, pass: true },
                { no: 21, am: 'የፍጥነት ገደብና GPS', en: 'Speed Limiter & GPS (Heavy)', pts: null, pass: VEHICLE.category !== 'HEAVY' || true },
                { no: 22, am: 'የሰውነትና መስታወቶች', en: 'Body & Mirrors', pts: null, pass: true },
                { no: 23, am: 'የተሳፋሪ መቀመጫዎች', en: 'Passenger Seats (Heavy)', pts: null, pass: true },
                { no: 24, am: 'የእሳት ማጥፊያ', en: 'Fire Extinguisher', pts: null, pass: true },
                { no: 25, am: 'የመጀመሪያ ህክምና ሳጥን', en: 'First Aid Kit', pts: null, pass: true },
                { no: 26, am: 'የማስጠንቀቂያ ሶስት ማዕዘን', en: 'Warning Triangle', pts: null, pass: true },
                { no: 27, am: 'የተሽከርካሪ መስታወቶች', en: 'Vehicle Mirrors', pts: null, pass: true },
                { no: 28, am: 'የጎን መስታወቶች', en: 'Side Mirrors', pts: null, pass: true },
                { no: 29, am: 'መጠባበቂያ ጎማ', en: 'Spare Wheel', pts: null, pass: true },
                { no: 30, am: 'ጭቃ መከላከያ', en: 'Mudguards', pts: null, pass: true },
              ].map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="border border-gray-400 px-1 py-0.5 text-center">{item.no}.</td>
                  <td className="border border-gray-400 px-1 py-0.5">
                    <span className="text-[8px] text-gray-600">{item.am}</span><br/>
                    <span className="font-medium">{item.en}</span>
                  </td>
                  <td className="border border-gray-400 px-1 py-0.5 text-center font-semibold">{item.pts || '-'}</td>
                  <td className="border border-gray-400 px-1 py-0.5 text-center">
                    {item.pass && <span className="text-green-700 font-bold">✓</span>}
                  </td>
                  <td className="border border-gray-400 px-1 py-0.5 text-center">
                    {!item.pass && <span className="text-red-600 font-bold">✗</span>}
                  </td>
                  <td className="border border-gray-400 px-1 py-0.5 text-center text-gray-400">-</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary & Signatures */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="border border-gray-400 p-2">
              <p className="text-[9px] text-gray-600">የመርማሪ ፊርማ / Inspector Signature</p>
              <div className="flex justify-between mt-2">
                <div><p className="text-[9px]">ስም:</p><p className="font-semibold">Getu Tadesse</p></div>
                <div><p className="text-[9px]">ፊርማ:</p><p className="italic border-b border-gray-400 w-20">_________</p></div>
              </div>
            </div>
            <div className="border border-gray-400 p-2">
              <p className="text-[9px] text-gray-600">የኃላፊ ፊርማ / Chief Signature</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px]">ቀን / Date:</p>
                  <p className="font-semibold">{inspectionDate}</p>
                </div>
                <div className={`text-xl font-bold ${overallResult === 'PASS' ? 'text-green-700' : 'text-red-600'}`}>
                  {overallResult === 'PASS' ? 'አልፏል' : 'አላለፈም'}
                </div>
              </div>
            </div>
          </div>

          {/* Overall Combined Result */}
          <div className={`border-2 p-3 text-center ${overallResult === 'PASS' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <p className="text-[9px] text-gray-600">የጠቅላላ ውጤት / Overall Result</p>
            <p className="text-xs">የተሽከርካሪው የምርመራ ውጤት ከ 80% በታች ከሆነ ብቁ አይደለም ተብሎ ይቆጠራል</p>
            <div className="flex justify-center items-center gap-8 mt-2">
              <div>
                <p className="text-[9px]">Machine Test:</p>
                <p className={`font-bold ${machinePass ? 'text-green-700' : 'text-red-600'}`}>{machinePass ? 'PASS' : 'FAIL'}</p>
              </div>
              <div className={`text-2xl font-bold px-6 py-2 rounded ${overallResult === 'PASS' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-700'}`}>
                {overallResult}
              </div>
              <div>
                <p className="text-[9px]">Visual Test:</p>
                <p className={`font-bold ${visualPass ? 'text-green-700' : 'text-red-600'}`}>{visualPass ? 'PASS' : 'FAIL'}</p>
              </div>
            </div>
            <p className="text-[9px] text-gray-500 mt-2">Valid Until: <strong>{expiryDate}</strong></p>
          </div>


          <p className="text-center text-[8px] text-gray-400 mt-2 pt-1 border-t">(እባክዎ ከመጠቀምዎ በፊት ትክክለኛ መሆኑን ያረጋግጡ / PLEASE MAKE SURE THAT THIS IS THE CORRECT ISSUE BEFORE USE) • ገጽ 2 ከ 2</p>
        </div>
      </div>
    );
  }

  // Certificate View
  if (showCert) {
    return (
      <div ref={printRef}>
        <div className="print-hide mb-4 flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Certificate Preview</h2>
            <p className="text-sm text-gray-500">Annual Technical Inspection Certificate</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCert(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2">{Icon.back} Back</button>
            <button onClick={handlePrint} className="px-6 py-2 rounded-lg bg-[#88bf47] text-white font-semibold hover:bg-[#0fa84a] flex items-center gap-2">{Icon.print} Print Certificate</button>
          </div>
        </div>

        <div className="report-page bg-white border-2 border-gray-300 rounded-lg shadow-lg mx-auto p-8" style={{ maxWidth: '210mm' }}>
          {/* Certificate Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">{Icon.building}</div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 uppercase">Addis Ababa City Administration</h1>
                <h2 className="text-sm font-semibold text-gray-700">Driver and Vehicles Licensing and Control Authority</h2>
                <p className="text-xs text-gray-500">አዲስ አበባ ከተማ አስተዳደር የሾፌሮችና ተሽከርካሪዎች ፍቃድና ቁጥጥር ባለስልጣን</p>
              </div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">{Icon.shield}</div>
            </div>
            <h3 className="text-xl font-bold text-[#88bf47] uppercase">Annual Technical Inspection Certificate</h3>
            <p className="text-sm text-gray-600">የዓመታዊ ቴክኒካል ምርመራ የምስክር ወረቀት</p>
            <p className="text-xs text-gray-500 mt-1">Certificate No: <strong>{certNo}</strong></p>
          </div>

          {/* Vehicle Info */}
          <div className="border border-gray-300 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase border-b pb-2">Vehicle Information / የተሽከርካሪ መረጃ</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Owner's Name", value: VEHICLE.owner },
                { label: 'Plate Number', value: VEHICLE.plate },
                { label: 'Chassis Number', value: VEHICLE.chassis },
                { label: 'Engine Number', value: VEHICLE.engine },
                { label: 'Vehicle Type', value: VEHICLE.vehicleType },
                { label: 'Brand / Model', value: VEHICLE.brandModel },
                { label: 'Title Cert. Book', value: VEHICLE.titleCertificate },
                { label: 'Licensed Capacity', value: VEHICLE.licensedCapacity },
              ].map((item, i) => (
                <div key={i} className="flex">
                  <span className="text-gray-500 w-36">{item.label}:</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Log */}
          <div className="border border-gray-300 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-bold text-gray-800 mb-3 uppercase border-b pb-2">Inspection Log / የምርመራ መዝገብ</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">Date</th>
                  <th className="border px-3 py-2 text-left">Technician</th>
                  <th className="border px-3 py-2 text-center">Signature</th>
                  <th className="border px-3 py-2 text-left">Head</th>
                  <th className="border px-3 py-2 text-center">Signature</th>
                  <th className="border px-3 py-2 text-center">Sticker No.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2 font-semibold">{inspectionDate}</td>
                  <td className="border px-3 py-2">Getu Tadesse</td>
                  <td className="border px-3 py-2 text-center italic text-gray-500">Getu T.</td>
                  <td className="border px-3 py-2">Alemayehu Bekele</td>
                  <td className="border px-3 py-2 text-center italic text-gray-500">A. Bekele</td>
                  <td className="border px-3 py-2 text-center font-bold text-[#88bf47]">{stickerNo}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Result */}
          <div className={`border-2 rounded-lg p-6 mb-6 ${overallResult === 'PASS' ? 'border-[#88bf47] bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Result / የጠቅላላ ውጤት:</p>
                <p className={`text-3xl font-bold ${overallResult === 'PASS' ? 'text-[#88bf47]' : 'text-red-600'}`}>
                  {overallResult === 'PASS' ? '✓ PASSED / አልፏል' : '✗ FAILED / አላለፈም'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Registration Sticker:</p>
                <p className={`text-3xl font-bold ${overallResult === 'PASS' ? 'text-[#88bf47]' : 'text-red-600'}`}>{stickerNo}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Machine Test:</span>
                <span className={`ml-2 font-bold ${machinePass ? 'text-green-700' : 'text-red-600'}`}>{machinePass ? 'PASS' : 'FAIL'}</span>
              </div>
              <div>
                <span className="text-gray-500">Visual Test:</span>
                <span className={`ml-2 font-bold ${visualPass ? 'text-green-700' : 'text-red-600'}`}>{visualPass ? 'PASS' : 'FAIL'}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                <p>Receipt: RCP-{Date.now().toString().slice(-8)}</p>
                <p>Inspection Date: {inspectionDate}</p>
              </div>
              <div className="text-right">
                <p>Valid Until: <strong className="text-[#88bf47]">{expiryDate}</strong></p>
                <p className="text-xs mt-1">Valid for 1 year from inspection date</p>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4 pt-2 border-t">Powered by Vehicle Inspection System (VIS) • Ethiotelecom</p>
          </div>
        </div>
      </div>
    );
  }

  // Main Result Page
  return (
    <div className="space-y-4" ref={printRef}>
      {showCertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Issue Certificate</h3>
            <p className="text-sm text-gray-500 mb-4">Enter the Registration Sticker Number</p>
            <input type="text" value={stickerNo} onChange={e => setStickerNo(e.target.value.toUpperCase())} placeholder="STK-2025-00001" className="w-full h-12 px-4 rounded-lg border border-gray-200 text-lg font-mono focus:border-[#88bf47] focus:ring-2 focus:ring-[#88bf47]/20 outline-none mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowCertModal(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600">Cancel</button>
              <button onClick={handleCertSubmit} disabled={!stickerNo.trim()} className="flex-1 px-4 py-2.5 rounded-lg bg-[#88bf47] text-white font-semibold disabled:opacity-50">Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Info Header */}
      <VehicleInfoBar />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspection Report</h1>
          <p className="text-sm text-gray-500">Review, pay, and finalize results</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${overallResult === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {overallResult === 'PASS' ? Icon.check : Icon.x}
          {overallResult}
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mx-auto mb-2">{Icon.wrench}</div>
          <p className="text-3xl font-bold text-gray-900">{machineResults.filter(r => r.result === 'PASS').length}/{machineResults.length}</p>
          <p className="text-xs text-gray-500">Machine Tests</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mx-auto mb-2">{Icon.eye}</div>
          <p className="text-3xl font-bold text-gray-900">{visualData.earnedPoints}/{visualData.totalPoints}</p>
          <p className="text-xs text-gray-500">Visual Points</p>
        </div>
        <div className={`rounded-xl border p-5 text-center ${overallResult === 'PASS' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${overallResult === 'PASS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{Icon.shield}</div>
          <p className={`text-3xl font-bold ${overallResult === 'PASS' ? 'text-green-700' : 'text-red-600'}`}>{overallResult}</p>
          <p className="text-xs text-gray-500">Overall</p>
        </div>
      </div>

      {/* Machine Test Results Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden print-hide">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Machine Test Results</h3>
        </div>
        <div className="grid grid-cols-5 divide-x divide-gray-100">
          {machineResults.map(test => (
            <div key={test.id} className={`p-4 text-center ${test.result === 'PASS' ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
              <p className="text-xs text-gray-500 mb-1">{test.title}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${test.result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {test.result === 'PASS' ? Icon.check : Icon.x} {test.result}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Inspection Results */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden print-hide">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Visual Inspection Results</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-5 gap-3">
            {calculateVisualZones.map((zone, i) => (
              <div key={i} className={`p-3 rounded-lg text-center ${zone.passed === zone.items ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className="text-xs text-gray-600 font-medium mb-1">{zone.zone}</p>
                <p className={`text-lg font-bold ${zone.passed === zone.items ? 'text-green-700' : 'text-red-600'}`}>
                  {zone.passed}/{zone.items}
                </p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${zone.passed === zone.items ? 'text-green-600' : 'text-red-500'}`}>
                  {zone.passed === zone.items ? <>{Icon.check} PASS</> : <>{Icon.x} FAIL</>}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Points:</span> {visualData.earnedPoints}/{visualData.totalPoints} ({Math.round((visualData.earnedPoints / visualData.totalPoints) * 100)}%)
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${visualPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {visualPass ? 'Visual Inspection PASSED' : 'Visual Inspection FAILED'}
            </span>
          </div>
        </div>
      </div>

      {/* Finalized Info */}
      {isFinalized && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">{Icon.check}</div>
            <div>
              <p className="text-sm font-semibold text-green-800">Report Finalized</p>
              <p className="text-xs text-green-600 font-mono">{reportId}</p>
            </div>
          </div>
          <p className="text-xs text-green-600">Valid until: {expiryDate}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
        <button onClick={handleFinalize} disabled={isFinalized || isFinalizing} className="px-6 py-2.5 rounded-lg bg-[#88bf47] text-white font-semibold hover:bg-[#0fa84a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {isFinalizing ? 'Finalizing...' : isFinalized ? <>{Icon.check} Finalized</> : 'Finalize Report'}
        </button>

        {isFinalized && (
          <>
            <button onClick={() => setShowReport(true)} className="px-5 py-2.5 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-700 flex items-center gap-2">
              {Icon.print} Full Report
            </button>
            <button onClick={handleExportCSV} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2">
              {Icon.download} Export CSV
            </button>
            <button 
              onClick={handleIssueCert} 
              className="px-5 py-2.5 rounded-lg bg-[#1d8dcc] text-white font-semibold hover:bg-[#1a7bb8] flex items-center gap-2"
            >
              {Icon.certificate} Issue Certificate
            </button>
          </>
        )}

        <button onClick={() => navigate('/machine-test')} className="ml-auto text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          {Icon.back} Back to Tests
        </button>
      </div>

    </div>
  );
};

export default ResultPage;
