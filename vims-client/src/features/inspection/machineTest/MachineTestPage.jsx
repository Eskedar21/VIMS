import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveInspectionPhotos, getPhotosByInspectionId } from '../../../utils/photoStorage';

// Flat SVG Icons
const Icons = {
  alignment: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  ),
  suspension: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h16M4 12c0-2 2-4 4-4h8c2 0 4 2 4 4M4 12v4h16v-4" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M7 8V4M17 8V4" />
    </svg>
  ),
  brake: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      <path d="M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  gas: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18M6 21V10a2 2 0 012-2h8a2 2 0 012 2v11" />
      <path d="M9 8V5a2 2 0 012-2h2a2 2 0 012 2v3" />
      <path d="M10 12h4M10 16h4" />
    </svg>
  ),
  smoke: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 16c0-4 4-6 4-10M12 6c0 4 4 6 4 10" />
      <path d="M4 20h16" />
      <path d="M6 16h12" />
    </svg>
  ),
  headlight: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  play: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  refresh: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L1 21h22L12 2zm0 15a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-1-2V9h2v6h-2z" />
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  signal: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 20h2v-8H2zM7 20h2v-12H7zM12 20h2V4h-2zM17 20h2v-8h-2zM22 20h2v-4h-2z" />
    </svg>
  ),
  car: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17l-1 2h16l-1-2M7 7l1-3h8l1 3" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
};

const SECTION_STATUS = {
  WAITING: 'WAITING',
  RECEIVING: 'RECEIVING',
  COMPLETE: 'COMPLETE',
};

const DATA_SOURCE = 'Machine_Interface';

const randomBetween = (min, max, decimals = 2) =>
  Number((Math.random() * (max - min) + min).toFixed(decimals));

const getSessionValue = (key) => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(key);
};

const getStoredVehicle = () => {
  try {
    const stored = getSessionValue('vims.inspection.vehicle');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

const storedVehicle = getStoredVehicle();

const VEHICLE_PROFILE = {
  inspectionId: getSessionValue('vims.inspection.id') || 'VIS-2025-XXXX',
  plate: storedVehicle?.plateNumber || 'AA-12345',
  chassis: storedVehicle?.chassisNumber || 'XXXXXXXXXXXXXXXXX',
  engine: storedVehicle?.engineNumber || 'XXXXXXXX',
  brandModel: storedVehicle?.brandModel || 'Toyota Camry',
  fuelType: storedVehicle?.fuelType || 'Petrol',
  category: storedVehicle?.category || 'LIGHT',
  kilometerReading: storedVehicle?.kilometerReading || '0',
  testStartTime: storedVehicle?.testStartTime || new Date().toLocaleString(),
};

const SECTION_DEFINITIONS = {
  alignment: {
    title: 'Wheel Alignment',
    icon: 'alignment',
    description: 'Side slip deviation measurement',
    fields: [
      { key: 'alignmentDeviation', label: 'Deviation', unit: 'm/km', decimals: 2, threshold: { comparison: '<=', limit: 3.0 } },
    ],
    generator: () => ({ alignmentDeviation: randomBetween(0.2, 3.6) }),
  },
  suspension: {
    title: 'Suspension Test',
    icon: 'suspension',
    description: 'Left/Right efficiency measurement',
    fields: [
      { key: 'suspensionLeft', label: 'Left Efficiency', unit: '%', decimals: 1, threshold: { comparison: '>=', limit: 40 } },
      { key: 'suspensionRight', label: 'Right Efficiency', unit: '%', decimals: 1, threshold: { comparison: '>=', limit: 40 } },
      { key: 'suspensionDiff', label: 'Difference', unit: '%', decimals: 1, threshold: { comparison: '<=', limit: 25 } },
    ],
    generator: () => {
      const left = randomBetween(38, 75);
      const right = randomBetween(38, 75);
      return { suspensionLeft: left, suspensionRight: right, suspensionDiff: Math.abs(left - right) };
    },
  },
  brake: {
    title: 'Brake Test',
    icon: 'brake',
    description: 'Service and parking brake force',
    fields: [
      { key: 'serviceForceLeft', label: 'Service L', unit: 'kN', decimals: 2, threshold: { comparison: '>=', limit: 1.5 } },
      { key: 'serviceForceRight', label: 'Service R', unit: 'kN', decimals: 2, threshold: { comparison: '>=', limit: 1.5 } },
      { key: 'axleDiff', label: 'Axle Diff', unit: '%', decimals: 1, threshold: { comparison: '<=', limit: 25 } },
      { key: 'totalEfficiency', label: 'Total Eff.', unit: '%', decimals: 1, threshold: { comparison: '>=', limit: 50 } },
      { key: 'parkingForce', label: 'Parking', unit: 'kN', decimals: 2, threshold: { comparison: '>=', limit: 1.0 } },
    ],
    generator: () => {
      const left = randomBetween(1.2, 3.8);
      const right = randomBetween(1.2, 3.8);
      return {
        serviceForceLeft: left,
        serviceForceRight: right,
        axleDiff: Math.abs(left - right) * 10,
        totalEfficiency: randomBetween(40, 70),
        parkingForce: randomBetween(0.8, 2.2),
      };
    },
  },
  gas: {
    title: 'Gas Analyzer',
    icon: 'gas',
    description: 'Petrol emissions analysis',
    fields: [
      { key: 'hc', label: 'HC', unit: 'ppm', decimals: 0, threshold: { comparison: '<=', limit: 300 } },
      { key: 'co', label: 'CO', unit: '%', decimals: 2, threshold: { comparison: '<=', limit: 0.5 } },
      { key: 'co2', label: 'CO₂', unit: '%', decimals: 2, threshold: { comparison: '>=', limit: 12 } },
      { key: 'o2', label: 'O₂', unit: '%', decimals: 2, threshold: { comparison: '<=', limit: 3 } },
      { key: 'lambda', label: 'Lambda', unit: '', decimals: 2, threshold: { comparison: 'between', limit: [0.97, 1.03] } },
    ],
    generator: () => ({
      hc: randomBetween(80, 420, 0),
      co: randomBetween(0.1, 0.8),
      co2: randomBetween(10, 15),
      o2: randomBetween(0.1, 4),
      lambda: randomBetween(0.95, 1.05),
    }),
  },
  smoke: {
    title: 'Smoke Meter',
    icon: 'smoke',
    description: 'Diesel opacity measurement',
    fields: [
      { key: 'opacity', label: 'Opacity (K)', unit: 'm⁻¹', decimals: 2, threshold: { comparison: '<=', limit: 1.5 } },
      { key: 'maxRpm', label: 'Max RPM', unit: 'rpm', decimals: 0, threshold: { comparison: 'between', limit: [2000, 4000] } },
    ],
    generator: () => ({ opacity: randomBetween(0.5, 2.2), maxRpm: randomBetween(2100, 3800, 0) }),
  },
  headlight: {
    title: 'Headlight Test',
    icon: 'headlight',
    description: 'Intensity and beam alignment',
    fields: [
      { key: 'intensity', label: 'Intensity', unit: 'cd', decimals: 0, threshold: { comparison: '>=', limit: 12000 } },
      { key: 'beamStatus', label: 'Beam Align', unit: '', customEvaluator: (v) => v === 'PASS' ? 'PASS' : 'FAIL' },
    ],
    generator: () => ({ intensity: randomBetween(9000, 20000, 0), beamStatus: Math.random() > 0.15 ? 'PASS' : 'FAIL' }),
  },
};

const getInitialSectionState = (sectionKey) => {
  const definition = SECTION_DEFINITIONS[sectionKey];
  const fields = definition.fields.reduce((acc, field) => ({
    ...acc,
    [field.key]: { value: null, result: null, source: DATA_SOURCE },
  }), {});
  return { status: SECTION_STATUS.WAITING, fields, reTestCount: 0, sectionResult: null, lastUpdated: null };
};

const evaluateFieldResult = (value, fieldDefinition) => {
  if (value === null || value === undefined) return null;
  if (fieldDefinition.customEvaluator) return fieldDefinition.customEvaluator(value);
  const { threshold } = fieldDefinition;
  if (!threshold) return 'PASS';
  const { comparison, limit } = threshold;
  if (comparison === '>=') return value >= limit ? 'PASS' : 'FAIL';
  if (comparison === '<=') return value <= limit ? 'PASS' : 'FAIL';
  if (comparison === 'between' && Array.isArray(limit)) return value >= limit[0] && value <= limit[1] ? 'PASS' : 'FAIL';
  return 'PASS';
};

// Vehicle Info Header Bar
const VehicleInfoBar = () => {
  const formatChassis = (c) => c && c.length > 10 ? `${c.slice(0, 5)}...${c.slice(-5)}` : c;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
      <div className="grid grid-cols-6 divide-x divide-gray-100">
        <div className="p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Licence Plate</p>
          <p className="text-sm font-bold text-gray-900">{VEHICLE_PROFILE.plate}</p>
        </div>
        <div className="p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Km</p>
          <p className="text-sm font-bold text-gray-900">{Number(VEHICLE_PROFILE.kilometerReading).toLocaleString()}</p>
        </div>
        <div className="p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Brand / Model</p>
          <p className="text-sm font-bold text-gray-900">{VEHICLE_PROFILE.brandModel}</p>
        </div>
        <div className="p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Chassis</p>
          <p className="text-sm font-bold text-gray-900 font-mono">{formatChassis(VEHICLE_PROFILE.chassis)}</p>
        </div>
        <div className="p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Motor No</p>
          <p className="text-sm font-bold text-gray-900 font-mono">{VEHICLE_PROFILE.engine}</p>
        </div>
        <div className="p-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Test Start</p>
          <p className="text-sm font-bold text-gray-900">{VEHICLE_PROFILE.testStartTime}</p>
        </div>
      </div>
    </div>
  );
};

const MachineTestPage = () => {
  const navigate = useNavigate();
  
  // Read fuel type dynamically from session storage
  const currentVehicle = getStoredVehicle();
  const fuelType = currentVehicle?.fuelType || VEHICLE_PROFILE.fuelType || 'Petrol';
  const isDiesel = fuelType.toLowerCase() === 'diesel';
  const emissionSectionKey = isDiesel ? 'smoke' : 'gas';

  const orderedSections = useMemo(() => ['alignment', 'suspension', 'brake', emissionSectionKey, 'headlight'], [emissionSectionKey]);

  const [sections, setSections] = useState(() => {
    const initial = {};
    orderedSections.forEach((key) => { initial[key] = getInitialSectionState(key); });
    return initial;
  });

  const [activeSection, setActiveSection] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [machinePhotos, setMachinePhotos] = useState([]);
  const [isMachineCapturing, setIsMachineCapturing] = useState(false);
  const MAX_MACHINE_PHOTOS = 7;

  useEffect(() => {
    setSections((prev) => {
      const next = { ...prev };
      orderedSections.forEach((key) => { if (!next[key]) next[key] = getInitialSectionState(key); });
      return next;
    });
  }, [orderedSections]);

  const anyReceiving = useMemo(() => orderedSections.some((key) => sections[key]?.status === SECTION_STATUS.RECEIVING), [orderedSections, sections]);
  const allComplete = useMemo(() => orderedSections.every((key) => sections[key]?.status === SECTION_STATUS.COMPLETE), [orderedSections, sections]);
  const completedCount = useMemo(() => orderedSections.filter((key) => sections[key]?.status === SECTION_STATUS.COMPLETE).length, [orderedSections, sections]);

  const stopCameraStream = () => {
    cameraStream?.getTracks()?.forEach((t) => t.stop());
    setCameraStream(null);
  };

  const stopMachineInterval = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopMachineInterval();
      stopCameraStream();
    };
  }, []);

  const ensureCameraStream = async () => {
    if (cameraStream) return cameraStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to start playing
        await new Promise((resolve, reject) => {
          if (videoRef.current) {
            const onPlaying = () => {
              videoRef.current.removeEventListener('playing', onPlaying);
              resolve();
            };
            videoRef.current.addEventListener('playing', onPlaying);
            videoRef.current.play().catch(reject);
            // Fallback timeout
            setTimeout(() => {
              videoRef.current?.removeEventListener('playing', onPlaying);
              resolve();
            }, 3000);
          } else {
            resolve();
          }
        });
      }
      setCameraStream(stream);
      setCameraError('');
      return stream;
    } catch (err) {
      setCameraError('Unable to access camera. Check permissions/device.');
      console.error('Camera error:', err);
      return null;
    }
  };

  const getCoordinates = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });

  const capturePhotoWithMetadata = async () => {
    const stream = await ensureCameraStream();
    if (!stream || !videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Wait for video to be ready and have valid dimensions
    await new Promise((resolve) => {
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        resolve();
      } else {
        const checkReady = () => {
          if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
            video.removeEventListener('loadedmetadata', checkReady);
            video.removeEventListener('loadeddata', checkReady);
            resolve();
          }
        };
        video.addEventListener('loadedmetadata', checkReady);
        video.addEventListener('loadeddata', checkReady);
        // Fallback timeout
        setTimeout(() => {
          video.removeEventListener('loadedmetadata', checkReady);
          video.removeEventListener('loadeddata', checkReady);
          resolve();
        }, 2000);
      }
    });

    // Additional small delay to ensure frame is ready
    await new Promise(resolve => setTimeout(resolve, 100));

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    
    if (width === 0 || height === 0) {
      console.error('Video dimensions are invalid');
      return null;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    // Clear canvas first
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw video frame
    ctx.drawImage(video, 0, 0, width, height);

    const timestamp = new Date();
    const coords = await getCoordinates();
    const overlayText = `${timestamp.toISOString()}${coords ? ` | ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : ' | No GPS'}`;
    
    // Draw overlay background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    const textWidth = ctx.measureText(overlayText).width;
    ctx.fillRect(10, height - 40, textWidth + 20, 30);
    
    // Draw overlay text
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText(overlayText, 20, height - 20);

    return {
      id: `machine-${Date.now()}`,
      timestamp: timestamp.toISOString(),
      coords,
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
    };
  };

  const captureMachineFrame = async () => {
    const photo = await capturePhotoWithMetadata();
    if (!photo) return;
    setMachinePhotos((prev) => {
      const next = [...prev, photo].slice(-MAX_MACHINE_PHOTOS);
      if (next.length >= MAX_MACHINE_PHOTOS) {
        stopMachineInterval();
        setIsMachineCapturing(false);
      }
      return next;
    });
  };

  const startMachineCapture = async () => {
    if (isMachineCapturing) return;
    
    // Ensure camera is started first
    const stream = await ensureCameraStream();
    if (!stream) {
      setCameraError('Please start camera first');
      return;
    }
    
    // Wait for video to be ready
    if (videoRef.current) {
      await new Promise((resolve) => {
        if (videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
          resolve();
        } else {
          const checkReady = () => {
            if (videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
              videoRef.current.removeEventListener('loadedmetadata', checkReady);
              videoRef.current.removeEventListener('playing', checkReady);
              resolve();
            }
          };
          videoRef.current.addEventListener('loadedmetadata', checkReady);
          videoRef.current.addEventListener('playing', checkReady);
          setTimeout(() => resolve(), 2000); // Fallback
        }
      });
    }
    
    setMachinePhotos([]);
    setIsMachineCapturing(true);
    await captureMachineFrame();
    captureIntervalRef.current = setInterval(() => {
      captureMachineFrame();
    }, 5000);
  };

  const stopMachineCapture = () => {
    stopMachineInterval();
    setIsMachineCapturing(false);
  };

  const startCapture = (sectionKey) => {
    if (anyReceiving) return;
    setActiveSection(sectionKey);
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], status: SECTION_STATUS.RECEIVING, lastUpdated: new Date().toISOString() },
    }));

    setTimeout(() => {
      const definition = SECTION_DEFINITIONS[sectionKey];
      const generated = definition.generator();
      const updatedFields = {};
      definition.fields.forEach((field) => {
        const value = generated[field.key];
        updatedFields[field.key] = { value, result: evaluateFieldResult(value, field), source: DATA_SOURCE };
      });
      const sectionResult = Object.values(updatedFields).every((f) => f.result === 'PASS') ? 'PASS' : 'FAIL';

      setSections((prev) => ({
        ...prev,
        [sectionKey]: { ...prev[sectionKey], status: SECTION_STATUS.COMPLETE, fields: updatedFields, sectionResult, lastUpdated: new Date().toISOString() },
      }));
      setActiveSection(null);
    }, 2000);
  };

  const handleRetest = (sectionKey) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...getInitialSectionState(sectionKey), reTestCount: prev[sectionKey].reTestCount + 1 },
    }));
  };

  const handleProceed = () => {
    const machineData = {};
    orderedSections.forEach((key) => {
      machineData[key] = sections[key];
    });
    window.sessionStorage.setItem('vims.inspection.machineTest', JSON.stringify(machineData));
    
    // Save all photos (registration, inspection, and machine test) to persistent storage
    const inspectionId = getSessionValue('vims.inspection.id');
    const vehicleData = getStoredVehicle();
    
    if (inspectionId && vehicleData?.plateNumber) {
      // Get existing photos if any
      const existing = getPhotosByInspectionId(inspectionId);
      saveInspectionPhotos(inspectionId, vehicleData, {
        registration: existing?.photos?.registration || null,
        inspection: existing?.photos?.inspection || [],
        machineTest: machinePhotos,
      });
    }
    
    navigate('/result');
  };

  const getStatusColor = (status, result) => {
    if (status === SECTION_STATUS.RECEIVING) return 'border-blue-400 bg-blue-50';
    if (status === SECTION_STATUS.COMPLETE) return result === 'PASS' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50';
    return 'border-gray-200 bg-white';
  };

  const getStatusBadge = (status, result) => {
    if (status === SECTION_STATUS.RECEIVING) return <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">{Icons.signal} Receiving...</span>;
    if (status === SECTION_STATUS.COMPLETE) {
      return result === 'PASS' 
        ? <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full flex items-center gap-1">{Icons.check} PASS</span>
        : <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-600 rounded-full flex items-center gap-1">{Icons.warning} FAIL</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full flex items-center gap-1">{Icons.clock} Waiting</span>;
  };

  return (
    <div className="flex gap-4">
      {/* Main Content Area */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Vehicle Info Header */}
        <VehicleInfoBar />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Machine Test Station</h1>
            <p className="text-sm text-gray-500">Automated equipment data capture • {fuelType} vehicle</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400">Progress</p>
              <p className="text-lg font-bold text-gray-900">{completedCount}/{orderedSections.length}</p>
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#88bf47] transition-all duration-300" style={{ width: `${(completedCount / orderedSections.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Machine Test Photo Capture Controls */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Machine Testing Photos</p>
              <p className="text-xs text-gray-500">Capture up to 7 frames every 5s with timestamp & GPS</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startMachineCapture}
                disabled={isMachineCapturing}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#88bf47] text-white hover:bg-[#0fa84a] disabled:opacity-60"
              >
                {isMachineCapturing ? 'Capturing…' : 'Start Capture'}
              </button>
              <button
                type="button"
                onClick={stopMachineCapture}
                disabled={!isMachineCapturing}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60"
              >
                Stop
              </button>
            </div>
          </div>
          {cameraError && <p className="text-xs text-red-600 mb-2">{cameraError}</p>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-700 mb-2">Capture Info</p>
              <div className="space-y-2 text-xs text-gray-600">
                <p>• Photos are automatically captured every 5 seconds</p>
                <p>• Maximum of 7 photos per session</p>
                <p>• Each photo includes timestamp and GPS coordinates</p>
                <p>• View captured photos in the sidebar →</p>
              </div>
            </div>
          </div>
        </div>

        {/* Receiving Banner */}
        {anyReceiving && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Receiving data from equipment...</p>
              <p className="text-xs text-blue-600">Please wait for the test to complete</p>
            </div>
          </div>
        )}

        {/* Test Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {orderedSections.map((sectionKey) => {
          const section = sections[sectionKey];
          const definition = SECTION_DEFINITIONS[sectionKey];
          if (!section || !definition) return null;

          return (
            <div key={sectionKey} className={`rounded-xl border-2 overflow-hidden transition-all ${getStatusColor(section.status, section.sectionResult)}`}>
              {/* Section Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-white/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    section.status === SECTION_STATUS.COMPLETE 
                      ? section.sectionResult === 'PASS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      : section.status === SECTION_STATUS.RECEIVING ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {Icons[definition.icon]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{definition.title}</h3>
                    <p className="text-xs text-gray-500">{definition.description}</p>
                  </div>
                </div>
                {getStatusBadge(section.status, section.sectionResult)}
              </div>

              {/* Section Content */}
              <div className="p-4">
                {section.status === SECTION_STATUS.WAITING && (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 mb-4">Ready to capture data from equipment</p>
                    <button
                      onClick={() => startCapture(sectionKey)}
                      disabled={anyReceiving}
                      className="px-6 py-2.5 bg-[#88bf47] text-white text-sm font-semibold rounded-lg hover:bg-[#0fa84a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      {Icons.play} Start Capture
                    </button>
                  </div>
                )}

                {section.status === SECTION_STATUS.RECEIVING && (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium text-blue-700">Receiving data...</p>
                  </div>
                )}

                {section.status === SECTION_STATUS.COMPLETE && (
                  <div className="space-y-3">
                    {/* Results Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {definition.fields.map((field) => {
                        const fieldData = section.fields[field.key];
                        const isPassing = fieldData?.result === 'PASS';
                        return (
                          <div key={field.key} className={`rounded-lg p-3 ${isPassing ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{field.label}</p>
                            <div className="flex items-baseline gap-1">
                              <span className={`text-lg font-bold ${isPassing ? 'text-green-700' : 'text-red-600'}`}>
                                {typeof fieldData?.value === 'number' ? fieldData.value.toFixed(field.decimals || 0) : fieldData?.value || '—'}
                              </span>
                              {field.unit && <span className="text-xs text-gray-500">{field.unit}</span>}
                            </div>
                            {field.threshold && (
                              <p className="text-[9px] text-gray-400 mt-0.5">
                                Limit: {field.threshold.comparison === 'between' ? `${field.threshold.limit[0]}-${field.threshold.limit[1]}` : `${field.threshold.comparison} ${field.threshold.limit}`}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Re-test Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        {section.reTestCount > 0 && `Re-tested ${section.reTestCount}x`}
                      </p>
                      <button
                        onClick={() => handleRetest(sectionKey)}
                        disabled={anyReceiving}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <span className="flex-shrink-0">{Icons.refresh}</span>
                        <span>Re-test</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>

        {/* Summary & Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {orderedSections.map((key) => {
              const s = sections[key];
              const d = SECTION_DEFINITIONS[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    s?.status === SECTION_STATUS.COMPLETE 
                      ? s.sectionResult === 'PASS' ? 'bg-green-500' : 'bg-red-500'
                      : s?.status === SECTION_STATUS.RECEIVING ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                  }`} />
                  <span className="text-xs text-gray-600">{d?.title}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/inspection?tab=visual')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Visual
            </button>
            <button
              onClick={handleProceed}
              disabled={!allComplete}
              className="px-6 py-2.5 bg-[#88bf47] text-white text-sm font-semibold rounded-lg hover:bg-[#0fa84a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Proceed to Results
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Photo Gallery */}
      <div className="w-80 flex-shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col max-h-[calc(100vh-8rem)] sticky top-4">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-900">Captured Photos</h3>
            {machinePhotos.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-[#88bf47]/10 text-[#88bf47] rounded">
                {machinePhotos.length}/{MAX_MACHINE_PHOTOS}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">Machine test photos with GPS</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {machinePhotos.length === 0 ? (
            <div className="text-center py-8">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 mx-auto mb-2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p className="text-xs text-gray-400">No photos yet</p>
              <p className="text-xs text-gray-400">Start capture to begin</p>
            </div>
          ) : (
            machinePhotos.map((photo, idx) => {
              const date = new Date(photo.timestamp);
              const formattedDate = date.toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              return (
                <div key={photo.id} className="border border-gray-200 rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex items-start gap-2 mb-2">
                    <img 
                      src={photo.dataUrl} 
                      alt={`Photo ${idx + 1}`} 
                      className="w-20 h-20 object-cover rounded border flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-gray-700">#{idx + 1}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-600 truncate">{formattedDate}</span>
                      </div>
                      {photo.coords ? (
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-600 font-mono truncate">
                            {photo.coords.lat.toFixed(5)}, {photo.coords.lng.toFixed(5)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-amber-600">No GPS</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default MachineTestPage;
