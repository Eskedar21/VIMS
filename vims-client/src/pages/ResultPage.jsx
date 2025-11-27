import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Print styles for A4 PDF - fits all on one page
const printStyles = `
@media print {
  @page { size: A4; margin: 5mm; }
  html, body { 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important;
    background: white !important;
    font-size: 8px !important;
  }
  body > div { background: white !important; }
  .print-hide { display: none !important; }
  .page-break { page-break-before: auto !important; }
  .report-page { 
    width: 100% !important; 
    min-height: auto !important; 
    padding: 4mm !important; 
    margin: 0 0 2mm 0 !important; 
    box-shadow: none !important; 
    border: 1px solid #ddd !important;
    background: white !important;
    page-break-inside: avoid;
    font-size: 9px !important;
  }
  .report-page h1 { font-size: 12px !important; }
  .report-page h2 { font-size: 10px !important; }
  .report-page h3, .report-page h4 { font-size: 9px !important; }
  .report-page p { font-size: 8px !important; }
  .report-page .text-2xl, .report-page .text-3xl { font-size: 14px !important; }
  .report-page .text-lg { font-size: 11px !important; }
  header, footer, nav, .app-shell-header, .app-shell-footer { display: none !important; }
  main { padding: 0 !important; margin: 0 !important; }
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
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${VEHICLE.category === 'HEAVY' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
              {VEHICLE.category === 'HEAVY' ? Icon.truck : Icon.car}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{VEHICLE.plate}</p>
              <p className="text-xs text-gray-500">{VEHICLE.brandModel} • {VEHICLE.fuelType}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Inspection ID</p>
            <p className="text-sm font-mono font-bold text-[#009639]">{VEHICLE.inspectionId}</p>
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
  if (storedMachine) {
    return Object.entries(storedMachine).map(([key, data]) => ({
      id: key,
      title: key.charAt(0).toUpperCase() + key.slice(1),
      result: data.sectionResult || 'PASS',
      fields: data.fields || {},
    }));
  }
  return [
    { id: 'alignment', title: 'Alignment', result: 'PASS', fields: { deviation: { value: 2.1, result: 'PASS' } } },
    { id: 'suspension', title: 'Suspension', result: 'PASS', fields: { left: { value: 58, result: 'PASS' }, right: { value: 54, result: 'PASS' } } },
    { id: 'brake', title: 'Brakes', result: 'PASS', fields: { efficiency: { value: 62, result: 'PASS' } } },
    { id: 'emissions', title: 'Emissions', result: 'PASS', fields: { hc: { value: 180, result: 'PASS' } } },
    { id: 'headlight', title: 'Headlights', result: 'PASS', fields: { intensity: { value: 15200, result: 'PASS' } } },
  ];
};

const ResultPage = () => {
  const navigate = useNavigate();
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
  const [showPayment, setShowPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [stickerNo, setStickerNo] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [certNo, setCertNo] = useState('');

  const machineResults = useMemo(() => getMachineResults(), []);
  const visualData = getStoredVisual() || { earnedPoints: 95, totalPoints: 100 };
  
  const machinePass = machineResults.every(r => r.result === 'PASS');
  const visualPass = true; // Simplified
  const overallResult = machinePass && visualPass ? 'PASS' : 'FAIL';

  const inspectionDate = new Date().toLocaleDateString('en-GB');
  const expiryDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString('en-GB');
  }, []);

  const handleFinalize = () => {
    setIsFinalizing(true);
    setTimeout(() => {
      const id = generateGUID();
      setReportId(id);
      setIsFinalized(true);
      setIsFinalizing(false);
      window.sessionStorage.setItem('vims.report.id', id);
    }, 800);
  };

  const handlePaymentSuccess = (info) => {
    setPaymentInfo(info);
    setPaymentDone(true);
    setShowPayment(false);
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
      ['Payment', paymentInfo ? `${paymentInfo.transactionId} - ETB ${paymentInfo.amount}` : 'N/A'],
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
            <button onClick={handlePrint} className="px-6 py-2 rounded-lg bg-[#009639] text-white font-semibold hover:bg-[#007c2d] flex items-center gap-2">{Icon.print} Print Report</button>
          </div>
        </div>

        {/* PAGE 1: Machine Test */}
        <div className="report-page bg-white border border-gray-200 rounded-lg shadow-lg mx-auto mb-6 p-8" style={{ maxWidth: '210mm' }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#009639] rounded-lg flex items-center justify-center text-white">{Icon.car}</div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Awash Valley Technical Inspection S.C.</h1>
                <p className="text-xs text-gray-500">Licensed Vehicle Inspection Center • Addis Ababa</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Ref: {VEHICLE.inspectionId}</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleString()}</p>
            </div>
          </div>

          <h2 className="text-center text-sm font-bold text-gray-800 uppercase bg-gray-100 py-2 rounded mb-4">Technical Inspection Report</h2>

          {/* Vehicle Info Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
            {[
              { label: 'Plate', value: VEHICLE.plate, bold: true },
              { label: 'Owner', value: VEHICLE.owner },
              { label: 'Brand/Model', value: VEHICLE.brandModel },
              { label: 'Type', value: VEHICLE.vehicleType },
              { label: 'Chassis', value: VEHICLE.chassis, mono: true, small: true },
              { label: 'Engine', value: VEHICLE.engine, mono: true },
              { label: 'Fuel', value: VEHICLE.fuelType },
              { label: 'Km', value: Number(VEHICLE.kilometerReading).toLocaleString() },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded p-2">
                <p className="text-[10px] text-gray-400 uppercase">{item.label}</p>
                <p className={`font-semibold ${item.bold ? 'text-lg' : ''} ${item.mono ? 'font-mono' : ''} ${item.small ? 'text-xs' : ''}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Machine Test Results */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {machineResults.map(test => (
              <div key={test.id} className={`border rounded-lg p-3 ${test.result === 'PASS' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-900">{test.title}</h4>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${test.result === 'PASS' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-600'}`}>{test.result}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(test.fields).slice(0, 3).map(([key, data]) => (
                    <div key={key} className="text-center">
                      <p className="text-[9px] text-gray-500 uppercase">{key}</p>
                      <p className={`text-sm font-bold ${data.result === 'PASS' ? 'text-green-700' : 'text-red-600'}`}>{typeof data.value === 'number' ? data.value.toFixed(1) : data.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Machine Result Summary */}
          <div className={`text-center p-4 rounded-lg ${machinePass ? 'bg-green-100 border-2 border-green-400' : 'bg-red-100 border-2 border-red-400'}`}>
            <p className="text-xs text-gray-600 uppercase">Machine Test Result</p>
            <p className={`text-2xl font-bold ${machinePass ? 'text-green-700' : 'text-red-600'}`}>{machinePass ? '✓ ALL TESTS PASSED' : '✗ TESTS FAILED'}</p>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t text-xs text-gray-500 print-hide">
            <p>Inspector: Getu Tadesse</p>
            <p>Page 1 of 2</p>
            <p>Chief: Alemayehu Bekele</p>
          </div>
        </div>

        {/* PAGE 2: Visual Inspection */}
        <div className="report-page bg-white border border-gray-200 rounded-lg shadow-lg mx-auto p-8" style={{ maxWidth: '210mm' }}>
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#009639] rounded-lg flex items-center justify-center text-white">{Icon.eye}</div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Awash Valley Technical Inspection S.C.</h1>
                <p className="text-xs text-gray-500">30-Point Visual Inspection Checklist</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Ref: {VEHICLE.inspectionId}</p>
              <p className="text-xs text-gray-400">Form: {VEHICLE.category === 'HEAVY' ? 'HV-FORM-2025' : 'LV-FORM-2025'}</p>
            </div>
          </div>

          <h2 className={`text-center text-sm font-bold uppercase py-2 rounded mb-4 ${VEHICLE.category === 'HEAVY' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
            Visual Inspection Report — Page 2 of 2
          </h2>

          {/* Visual Zones Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {['Identification', 'Lighting', 'Steering', 'Body', 'Safety'].map((zone, i) => (
              <div key={i} className="bg-green-50 border border-green-200 rounded p-3 text-center">
                <p className="text-xs text-gray-600">{zone}</p>
                <p className="text-lg font-bold text-green-700">PASS</p>
              </div>
            ))}
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
              <p className="text-xs text-gray-600">Points</p>
              <p className="text-lg font-bold text-gray-900">{visualData.earnedPoints}/{visualData.totalPoints}</p>
            </div>
          </div>

          {/* Combined Result */}
          <div className={`text-center p-6 rounded-lg mb-4 ${overallResult === 'PASS' ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Combined Inspection Result</p>
            <p className={`text-3xl font-bold ${overallResult === 'PASS' ? 'text-green-700' : 'text-red-600'}`}>
              {overallResult === 'PASS' ? '✓ VEHICLE PASSED' : '✗ VEHICLE FAILED'}
            </p>
            <div className="flex justify-center gap-8 mt-2 text-sm">
              <span>Machine: <strong className={machinePass ? 'text-green-700' : 'text-red-600'}>{machinePass ? 'PASS' : 'FAIL'}</strong></span>
              <span>Visual: <strong className={visualPass ? 'text-green-700' : 'text-red-600'}>{visualPass ? 'PASS' : 'FAIL'}</strong></span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Valid Until: <strong>{expiryDate}</strong></p>
          </div>

          {paymentInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment: <strong className="text-blue-700">{paymentInfo.method || 'TeleBirr'}</strong></span>
                <span className="font-mono">{paymentInfo.transactionId}</span>
                <span className="font-bold text-green-700">ETB {paymentInfo.amount}</span>
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 border-t-2 border-gray-800 pt-4">
            <div className="text-sm">
              <p className="text-gray-500">Inspector:</p>
              <p className="font-semibold">Getu Tadesse</p>
              <p className="text-gray-400 italic mt-4">Signature: ___________</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-gray-400 rounded mx-auto flex items-center justify-center bg-white">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/></svg>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">QR Verification</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-500">Chief Inspector:</p>
              <p className="font-semibold">Alemayehu Bekele</p>
              <p className="text-gray-400 italic mt-4">Signature: ___________</p>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-4 pt-2 border-t">Page 2 of 2 • Powered by VIS • Ethiotelecom</p>
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
            <button onClick={handlePrint} className="px-6 py-2 rounded-lg bg-[#009639] text-white font-semibold hover:bg-[#007c2d] flex items-center gap-2">{Icon.print} Print Certificate</button>
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
            <h3 className="text-xl font-bold text-[#009639] uppercase">Annual Technical Inspection Certificate</h3>
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
                  <td className="border px-3 py-2 text-center font-bold text-[#009639]">{stickerNo}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Result */}
          <div className="border-2 border-[#009639] rounded-lg p-6 mb-6 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Result:</p>
                <p className="text-3xl font-bold text-[#009639]">✓ PASSED</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Registration Sticker:</p>
                <p className="text-3xl font-bold text-[#009639]">{stickerNo}</p>
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
                <p>Valid Until: <strong className="text-[#009639]">{expiryDate}</strong></p>
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
      {showPayment && <TeleBirrModal onSuccess={handlePaymentSuccess} onCancel={() => setShowPayment(false)} />}
      
      {showCertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Issue Certificate</h3>
            <p className="text-sm text-gray-500 mb-4">Enter the Registration Sticker Number</p>
            <input type="text" value={stickerNo} onChange={e => setStickerNo(e.target.value.toUpperCase())} placeholder="STK-2025-00001" className="w-full h-12 px-4 rounded-lg border border-gray-200 text-lg font-mono focus:border-[#009639] focus:ring-2 focus:ring-[#009639]/20 outline-none mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowCertModal(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600">Cancel</button>
              <button onClick={handleCertSubmit} disabled={!stickerNo.trim()} className="flex-1 px-4 py-2.5 rounded-lg bg-[#009639] text-white font-semibold disabled:opacity-50">Preview</button>
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

      {/* Payment Card */}
      <div className={`bg-white rounded-xl border p-5 ${paymentDone ? 'border-green-200 bg-green-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentDone ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              {paymentDone ? Icon.check : Icon.payment}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{paymentDone ? 'Payment Complete' : 'Payment Required'}</h3>
              <p className="text-sm text-gray-500">
                {paymentDone ? `${paymentInfo?.method || 'TeleBirr'} • ${paymentInfo?.transactionId}` : `Fee: ETB ${FEES[VEHICLE.category]?.total.toFixed(2)}`}
              </p>
            </div>
          </div>
          {!paymentDone && (
            <button onClick={() => setShowPayment(true)} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#E31937] to-[#FF6B35] text-white font-semibold hover:opacity-90 flex items-center gap-2">
              {Icon.payment} Pay with TeleBirr
            </button>
          )}
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
            {[
              { zone: 'Identification', items: 4, passed: 4 },
              { zone: 'Lighting', items: 7, passed: 7 },
              { zone: 'Steering & Suspension', items: 6, passed: 6 },
              { zone: 'Body & Interior', items: 8, passed: 8 },
              { zone: 'Safety Equipment', items: 5, passed: 5 },
            ].map((zone, i) => (
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
        <button onClick={handleFinalize} disabled={isFinalized || isFinalizing || !paymentDone} className="px-6 py-2.5 rounded-lg bg-[#009639] text-white font-semibold hover:bg-[#007c2d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              {Icon.certificate} Issue Certificate
            </button>
          </>
        )}

        <button onClick={() => navigate('/machine-test')} className="ml-auto text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          {Icon.back} Back to Tests
        </button>
      </div>

      {!paymentDone && <p className="text-xs text-amber-600 text-center">Complete payment before finalizing</p>}
    </div>
  );
};

export default ResultPage;
