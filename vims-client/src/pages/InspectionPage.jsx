import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveInspectionPhotos, getPhotosByInspectionId } from '../utils/photoStorage';

// Vehicle Category Configuration (US-038)
const VEHICLE_CATEGORIES = {
  LIGHT: {
    code: 'Light_Vehicle',
    formId: 'LV-FORM-2025',
    label: 'Regular / Light Vehicle',
    labelAm: 'መደበኛ / ቀላል ተሽከርካሪ',
    description: 'Sedans, SUVs, Pickups, Motorcycles',
    theme: {
      headerBg: 'bg-white',
      headerText: 'text-gray-900',
      accentBg: 'bg-blue-50',
      accentBorder: 'border-blue-200',
      accentText: 'text-blue-700',
      badgeBg: 'bg-blue-100',
    },
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17l-1 2h16l-1-2M7 7l1-3h8l1 3" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  HEAVY: {
    code: 'Heavy_Vehicle',
    formId: 'HV-FORM-2025',
    label: 'Heavy Vehicle',
    labelAm: 'ከባድ ተሽከርካሪ',
    description: 'Buses, Trucks, Trailers, Heavy Equipment',
    theme: {
      headerBg: 'bg-amber-50',
      headerText: 'text-amber-900',
      accentBg: 'bg-amber-50',
      accentBorder: 'border-amber-300',
      accentText: 'text-amber-700',
      badgeBg: 'bg-amber-100',
    },
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="8" width="15" height="9" rx="1" />
        <path d="M16 8h4a2 2 0 012 2v5a2 2 0 01-2 2h-4" />
        <circle cx="5" cy="17" r="2" />
        <circle cx="12" cy="17" r="2" />
        <circle cx="19" cy="17" r="2" />
        <path d="M16 11h4M1 11h15" />
      </svg>
    ),
  },
};

const VEHICLE_TYPES_BY_CATEGORY = {
  LIGHT: ['Passenger Car', 'SUV', 'Pickup', 'Mini Van', 'Motorcycle', 'Three-Wheeler'],
  HEAVY: ['Bus', 'Mini Bus', 'Cargo Truck', 'Trailer', 'Tanker', 'Heavy Equipment'],
};

// 30-Point Visual Inspection Checklist for LIGHT Vehicles (US-036)
const LIGHT_INSPECTION_ZONES = [
  {
    id: 'zone1',
    titleAm: 'ማንነት እና ሰነዶች',
    titleEn: 'Zone 1: Identification & Documentation',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    items: [
      { id: 1, am: 'የሰሌዳ ቁጥር ትክክለኛነት', en: 'Registration Plate Validity', points: 5 },
      { id: 2, am: 'የቻሲስ ቁጥር ማዛመድ', en: 'Chassis Number Match', points: 5 },
      { id: 3, am: 'የሞተር ቁጥር ማዛመድ', en: 'Engine Number Match', points: 5 },
      { id: 4, am: 'የባለቤትነት ማረጋገጫ', en: 'Title Certificate Check', points: 5 },
    ],
  },
  {
    id: 'zone2',
    titleAm: 'ብርሃን እና እይታ',
    titleEn: 'Zone 2: Visibility & Lighting',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
      </svg>
    ),
    items: [
      { id: 5, am: 'የፊት መብራቶች (ከፍተኛ/ዝቅተኛ)', en: 'Headlights (High/Low)', points: 4 },
      { id: 6, am: 'የምልክት መብራቶች', en: 'Signal Lights', points: 3 },
      { id: 7, am: 'የብሬክ መብራቶች', en: 'Brake Lights', points: 4 },
      { id: 8, am: 'የኋላ መብራቶች', en: 'Reverse Lights', points: 2 },
      { id: 9, am: 'ዋይፐር እና ማጠቢያ', en: 'Wipers & Washers', points: 3 },
      { id: 10, am: 'የንፋስ መከላከያ ሁኔታ', en: 'Windshield Condition', points: 4 },
      { id: 11, am: 'የጎን/ኋላ መስተዋቶች', en: 'Side/Rear Mirrors', points: 3 },
    ],
  },
  {
    id: 'zone3',
    titleAm: 'መሪ እና ሳስፔንሽን',
    titleEn: 'Zone 3: Steering & Suspension',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 4v6M4 12h6M12 20v-6M20 12h-6" />
      </svg>
    ),
    items: [
      { id: 12, am: 'የመሪ ጨዋታ', en: 'Steering Play', points: 5 },
      { id: 13, am: 'የደወል ተግባር', en: 'Horn Function', points: 2 },
      { id: 14, am: 'ሾክ አብሶርበሮች', en: 'Shock Absorbers', points: 4 },
      { id: 15, am: 'ሊፍ ስፕሪንግስ/ሳስፔንሽን', en: 'Leaf Springs/Suspension', points: 4 },
      { id: 16, am: 'የጎማ ሁኔታ', en: 'Tire Tread/Condition', points: 5 },
      { id: 17, am: 'የዊል ነትስ/ስታድስ', en: 'Wheel Nuts/Studs', points: 3 },
    ],
  },
  {
    id: 'zone4',
    titleAm: 'ሰውነት እና ውስጥ',
    titleEn: 'Zone 4: Body & Interior',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17l-1 2h16l-1-2M7 7l1-3h8l1 3" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
    items: [
      { id: 18, am: 'የበር ሜካኒዝም', en: 'Door Mechanisms', points: 3 },
      { id: 19, am: 'የመስኮት ስራዎች', en: 'Window Operations', points: 2 },
      { id: 20, am: 'የመቀመጫ ሁኔታዎች', en: 'Seat Conditions', points: 3 },
      { id: 21, am: 'የደህንነት ቀበቶዎች', en: 'Seat Belts', points: 4 },
      { id: 22, am: 'የወለል/ሰውነት ዝገት', en: 'Floor/Body Corrosion', points: 3 },
      { id: 23, am: 'የጭስ ማስወጫ ስርዓት', en: 'Exhaust System', points: 3 },
      { id: 24, am: 'የነዳጅ ታንክ ክዳን/ፍሳሽ', en: 'Fuel Tank Cap/Leak', points: 4 },
      { id: 25, am: 'የባምፐር ሁኔታ', en: 'Bumper Condition', points: 2 },
    ],
  },
  {
    id: 'zone5',
    titleAm: 'የደህንነት መሳሪያዎች',
    titleEn: 'Zone 5: Safety Equipment',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    items: [
      { id: 26, am: 'የእሳት ማጥፊያ', en: 'Fire Extinguisher', points: 3 },
      { id: 27, am: 'የመጀመሪያ እርዳታ ኪት', en: 'First Aid Kit', points: 2 },
      { id: 28, am: 'የማስጠንቀቂያ ትሪያንግል', en: 'Warning Triangle', points: 2 },
      { id: 29, am: 'ተጠባባቂ ጎማ', en: 'Spare Wheel', points: 3 },
      { id: 30, am: 'ጭቃ መከላከያዎች', en: 'Mudguards', points: 2 },
    ],
  },
];

// 30-Point Visual Inspection Checklist for HEAVY Vehicles (US-038)
const HEAVY_INSPECTION_ZONES = [
  {
    id: 'zone1',
    titleAm: 'ማንነት እና ሰነዶች',
    titleEn: 'Zone 1: Identification & Documentation',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    items: [
      { id: 1, am: 'የሰሌዳ ቁጥር ትክክለኛነት', en: 'Registration Plate Validity', points: 8 },
      { id: 2, am: 'የቻሲስ ቁጥር ማዛመድ', en: 'Chassis Number Match', points: 8 },
      { id: 3, am: 'የሞተር ቁጥር ማዛመድ', en: 'Engine Number Match', points: 8 },
      { id: 4, am: 'የባለቤትነት ማረጋገጫ', en: 'Title Certificate Check', points: 10 },
    ],
  },
  {
    id: 'zone2',
    titleAm: 'ብርሃን እና እይታ',
    titleEn: 'Zone 2: Visibility & Lighting',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
      </svg>
    ),
    items: [
      { id: 5, am: 'የፊት መብራቶች (ከፍተኛ/ዝቅተኛ)', en: 'Headlights (High/Low)', points: 6 },
      { id: 6, am: 'የምልክት መብራቶች', en: 'Signal Lights', points: 4 },
      { id: 7, am: 'የብሬክ መብራቶች', en: 'Brake Lights', points: 6 },
      { id: 8, am: 'የኋላ መብራቶች', en: 'Reverse Lights', points: 4 },
      { id: 9, am: 'ዋይፐር እና ማጠቢያ', en: 'Wipers & Washers', points: 4 },
      { id: 10, am: 'የንፋስ መከላከያ ሁኔታ', en: 'Windshield Condition', points: 5 },
      { id: 11, am: 'የጎን/ኋላ መስተዋቶች', en: 'Side/Rear Mirrors', points: 5 },
    ],
  },
  {
    id: 'zone3',
    titleAm: 'መሪ እና ሳስፔንሽን',
    titleEn: 'Zone 3: Steering & Suspension',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 4v6M4 12h6M12 20v-6M20 12h-6" />
      </svg>
    ),
    items: [
      { id: 12, am: 'የመሪ ጨዋታ', en: 'Steering Play', points: 8 },
      { id: 13, am: 'የደወል ተግባር', en: 'Horn Function', points: 3 },
      { id: 14, am: 'ሾክ አብሶርበሮች', en: 'Shock Absorbers', points: 6 },
      { id: 15, am: 'ሊፍ ስፕሪንግስ/ሳስፔንሽን', en: 'Leaf Springs/Suspension', points: 6 },
      { id: 16, am: 'የጎማ ሁኔታ', en: 'Tire Tread/Condition', points: 8 },
      { id: 17, am: 'የዊል ነትስ/ስታድስ', en: 'Wheel Nuts/Studs', points: 5 },
    ],
  },
  {
    id: 'zone4',
    titleAm: 'ሰውነት፣ ውስጥ እና ልዩ መሳሪያዎች',
    titleEn: 'Zone 4: Body, Interior & Special Equipment',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="8" width="15" height="9" rx="1" />
        <path d="M16 8h4a2 2 0 012 2v5a2 2 0 01-2 2h-4" />
        <circle cx="5" cy="17" r="2" />
        <circle cx="12" cy="17" r="2" />
      </svg>
    ),
    items: [
      { id: 18, am: 'የበር ሜካኒዝም', en: 'Door Mechanisms', points: 4 },
      { id: 19, am: 'የመስኮት ስራዎች', en: 'Window Operations', points: 3 },
      { id: 20, am: 'የመቀመጫ ሁኔታዎች', en: 'Seat Conditions', points: 4 },
      { id: 21, am: 'ስፒድ ሊሚተር እና GPS', en: 'Speed Limiter & GPS', points: 10, critical: true, mandatory: true },
      { id: 22, am: 'የወለል/ሰውነት ዝገት', en: 'Floor/Body Corrosion', points: 4 },
      { id: 23, am: 'የተሳፋሪ መቀመጫ ማያያዣ', en: 'Passenger Seat Fixation', points: 8, critical: true },
      { id: 24, am: 'የጭስ ማስወጫ ስርዓት', en: 'Exhaust System', points: 5 },
      { id: 25, am: 'የባምፐር ሁኔታ', en: 'Bumper Condition', points: 3 },
    ],
  },
  {
    id: 'zone5',
    titleAm: 'የደህንነት መሳሪያዎች',
    titleEn: 'Zone 5: Safety Equipment',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    items: [
      { id: 26, am: 'የእሳት ማጥፊያ', en: 'Fire Extinguisher', points: 5 },
      { id: 27, am: 'የመጀመሪያ እርዳታ ኪት', en: 'First Aid Kit', points: 4 },
      { id: 28, am: 'የማስጠንቀቂያ ትሪያንግል', en: 'Warning Triangle', points: 4 },
      { id: 29, am: 'የነዳጅ ታንክ ፍሳሽ', en: 'Fuel Tank Leakage', points: 8, critical: true },
      { id: 30, am: 'ጭቃ መከላከያዎች', en: 'Mudguards', points: 4 },
    ],
  },
];

const DEFECT_OPTIONS = [
  { value: 'broken', label: 'Broken / የተሰበረ' },
  { value: 'missing', label: 'Missing / የጠፋ' },
  { value: 'damaged', label: 'Damaged / የተበላሸ' },
  { value: 'worn', label: 'Worn Out / የተሸረሸረ' },
  { value: 'cracked', label: 'Cracked / የተሰነጠቀ' },
  { value: 'malfunctioning', label: 'Malfunctioning / አይሰራም' },
  { value: 'expired', label: 'Expired / ጊዜው ያለፈ' },
  { value: 'other', label: 'Other / ሌላ' },
];

const initialRegistration = {
  plateNumber: '',
  chassisNumber: '',
  engineNumber: '',
  vehicleType: '',
  vehicleModel: '',
  brandModel: '', // Brand / Model combined
  titleCertificate: '',
  licensedCapacity: '',
  ownerName: '',
  fuelType: 'Petrol',
  kilometerReading: '',
};

// Vehicle Info Header Bar Component (matching the screenshot UI)
const VehicleInfoBar = ({ registration, testStartTime }) => {
  if (!registration.plateNumber) return null;
  
  const formatChassis = (chassis) => {
    if (!chassis || chassis.length <= 10) return chassis;
    return `${chassis.slice(0, 5)}...${chassis.slice(-5)}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
      <div className="grid grid-cols-6 divide-x divide-gray-100">
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">Licence plate number</p>
          <p className="text-sm font-bold text-gray-900 tracking-wide">{registration.plateNumber || '—'}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">Km.</p>
          <p className="text-sm font-bold text-gray-900">{registration.kilometerReading ? Number(registration.kilometerReading).toLocaleString() : '—'}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">Brand / Model</p>
          <p className="text-sm font-bold text-gray-900">{registration.brandModel || registration.vehicleModel || '—'}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">Chassis</p>
          <p className="text-sm font-bold text-gray-900 font-mono">{formatChassis(registration.chassisNumber) || '—'}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">Motor No</p>
          <p className="text-sm font-bold text-gray-900 font-mono">{registration.engineNumber || '—'}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">Test start (date & time)</p>
          <p className="text-sm font-bold text-gray-900">{testStartTime || '—'}</p>
        </div>
      </div>
    </div>
  );
};

const FormInput = ({ label, error, children, required = true }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

// Category Selection Modal Component
const CategorySelectionModal = ({ onSelect, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900">Select Vehicle Category</h2>
        <p className="text-sm text-gray-500 mt-1">Choose the appropriate form based on vehicle type</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Light Vehicle Option */}
          <button
            type="button"
            onClick={() => onSelect('LIGHT')}
            className="group relative flex flex-col items-center p-8 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200"
          >
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              {VEHICLE_CATEGORIES.LIGHT.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{VEHICLE_CATEGORIES.LIGHT.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{VEHICLE_CATEGORIES.LIGHT.labelAm}</p>
            <p className="text-sm text-gray-500 mt-3 text-center">{VEHICLE_CATEGORIES.LIGHT.description}</p>
            <span className="absolute top-3 right-3 px-2 py-1 text-[10px] font-bold uppercase bg-blue-100 text-blue-700 rounded">
              Code 01
            </span>
          </button>

          {/* Heavy Vehicle Option */}
          <button
            type="button"
            onClick={() => onSelect('HEAVY')}
            className="group relative flex flex-col items-center p-8 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-200"
          >
            <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
              {VEHICLE_CATEGORIES.HEAVY.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{VEHICLE_CATEGORIES.HEAVY.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{VEHICLE_CATEGORIES.HEAVY.labelAm}</p>
            <p className="text-sm text-gray-500 mt-3 text-center">{VEHICLE_CATEGORIES.HEAVY.description}</p>
            <span className="absolute top-3 right-3 px-2 py-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 rounded">
              Code 03
            </span>
          </button>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// Category Switch Warning Modal
const CategorySwitchWarning = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Change Vehicle Category?</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Switching categories will <span className="font-semibold text-red-600">clear all current inspection data</span>. 
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Keep Current
        </button>
        <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700">
          Change Category
        </button>
      </div>
    </div>
  </div>
);

const InspectionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Vehicle Category State (US-038)
  const [vehicleCategory, setVehicleCategory] = useState(() => {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage.getItem('vims.inspection.category') || null;
  });
  const [showCategoryModal, setShowCategoryModal] = useState(() => {
    if (typeof window === 'undefined') return true;
    // Always show modal if no inspection ID exists (new inspection)
    const hasInspectionId = window.sessionStorage.getItem('vims.inspection.id');
    const hasCategory = window.sessionStorage.getItem('vims.inspection.category');
    return !hasInspectionId || !hasCategory;
  });
  const [showSwitchWarning, setShowSwitchWarning] = useState(false);
  const [pendingCategory, setPendingCategory] = useState(null);

  const [inspectionId, setInspectionId] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.sessionStorage.getItem('vims.inspection.id') || '';
  });
  const [activeTab, setActiveTab] = useState(() => {
    const wantsVisual = searchParams.get('tab') === 'visual';
    if (!wantsVisual) return 'registration';
    if (typeof window === 'undefined') return 'registration';
    const stored = window.sessionStorage.getItem('vims.inspection.id');
    return stored ? 'visual' : 'registration';
  });
  const [registration, setRegistration] = useState(initialRegistration);
  const [regErrors, setRegErrors] = useState({});
  const [isSavingRegistration, setIsSavingRegistration] = useState(false);
  const [visualNotes, setVisualNotes] = useState('');
  const [isSavingVisual, setIsSavingVisual] = useState(false);
  const [expandedZone, setExpandedZone] = useState('zone1');
  const [defectModal, setDefectModal] = useState(null);
  const [selectedDefect, setSelectedDefect] = useState('');
  const [testStartTime, setTestStartTime] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [registrationPhoto, setRegistrationPhoto] = useState(null);

  // Get current category config and zones
  const categoryConfig = vehicleCategory ? VEHICLE_CATEGORIES[vehicleCategory] : null;
  const inspectionZones = vehicleCategory === 'HEAVY' ? HEAVY_INSPECTION_ZONES : LIGHT_INSPECTION_ZONES;
  const vehicleTypes = vehicleCategory ? VEHICLE_TYPES_BY_CATEGORY[vehicleCategory] : [];

  // Initialize checklist based on category
  const initializeChecklist = (zones) => {
    const state = {};
    zones.forEach(zone => {
      zone.items.forEach(item => {
        state[item.id] = { status: null, defect: null, photo: null, timestamp: null };
      });
    });
    return state;
  };

  const [checklist, setChecklist] = useState(() => initializeChecklist(inspectionZones));

  // Reset checklist when category changes
  useEffect(() => {
    if (vehicleCategory) {
      const zones = vehicleCategory === 'HEAVY' ? HEAVY_INSPECTION_ZONES : LIGHT_INSPECTION_ZONES;
      setChecklist(initializeChecklist(zones));
      window.sessionStorage.setItem('vims.inspection.category', vehicleCategory);
    }
  }, [vehicleCategory]);

  const stopCameraStream = () => {
    cameraStream?.getTracks()?.forEach((t) => t.stop());
    setCameraStream(null);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const formattedInspectionId = useMemo(() => inspectionId || '— Pending —', [inspectionId]);

  const totalItems = useMemo(() => inspectionZones.reduce((sum, z) => sum + z.items.length, 0), [inspectionZones]);
  
  const totalPoints = useMemo(() => 
    inspectionZones.reduce((sum, z) => sum + z.items.reduce((s, i) => s + i.points, 0), 0), 
    [inspectionZones]
  );

  const earnedPoints = useMemo(() => {
    let points = 0;
    inspectionZones.forEach(zone => {
      zone.items.forEach(item => {
        if (checklist[item.id]?.status === 'PASS') {
          points += item.points;
        }
      });
    });
    return points;
  }, [checklist, inspectionZones]);

  const checkedCount = useMemo(
    () => Object.values(checklist).filter(c => c.status !== null).length,
    [checklist]
  );

  const passCount = useMemo(
    () => Object.values(checklist).filter(c => c.status === 'PASS').length,
    [checklist]
  );

  const failCount = useMemo(
    () => Object.values(checklist).filter(c => c.status === 'FAIL').length,
    [checklist]
  );

  const allComplete = checkedCount === totalItems;

  const getZoneStats = (zone) => {
    const items = zone.items;
    const checked = items.filter(i => checklist[i.id]?.status !== null).length;
    const passed = items.filter(i => checklist[i.id]?.status === 'PASS').length;
    const failed = items.filter(i => checklist[i.id]?.status === 'FAIL').length;
    const zonePoints = items.reduce((s, i) => s + i.points, 0);
    const earnedZonePoints = items.filter(i => checklist[i.id]?.status === 'PASS').reduce((s, i) => s + i.points, 0);
    return { total: items.length, checked, passed, failed, zonePoints, earnedZonePoints };
  };

  const validateRegistration = () => {
    const errors = {};
    // Updated regex to accept dashes: AA-12345 or AA12345
    if (!/^[A-Z]{2}-?\d{4,5}[A-Z]?$/.test(registration.plateNumber.trim())) {
      errors.plateNumber = 'Format: AA-12345';
    }
    if (!registration.ownerName.trim()) errors.ownerName = 'Required';
    if (!registration.chassisNumber.trim()) errors.chassisNumber = 'Required';
    if (!registration.engineNumber.trim()) errors.engineNumber = 'Required';
    if (!registration.vehicleType) errors.vehicleType = 'Required';
    if (!registration.brandModel.trim()) errors.brandModel = 'Required';
    if (!registration.kilometerReading || registration.kilometerReading.trim() === '') {
      errors.kilometerReading = 'Required';
    } else if (Number(registration.kilometerReading) < 0) {
      errors.kilometerReading = 'Must be 0 or greater';
    }
    if (!registration.titleCertificate.trim()) errors.titleCertificate = 'Required';
    if (!registration.licensedCapacity) {
      errors.licensedCapacity = 'Required';
    } else if (Number(registration.licensedCapacity) <= 0) {
      errors.licensedCapacity = 'Must be positive';
    }
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegistrationChange = (field, value) => {
    setRegistration((prev) => ({ ...prev, [field]: value }));
    if (regErrors[field]) setRegErrors((prev) => ({ ...prev, [field]: null }));
  };

  useEffect(() => {
    if (inspectionId && typeof window !== 'undefined') {
      window.sessionStorage.setItem('vims.inspection.id', inspectionId);
    }
  }, [inspectionId]);

  useEffect(() => {
    if (inspectionId && searchParams.get('tab') === 'visual' && activeTab !== 'visual') {
      setActiveTab('visual');
    }
  }, [inspectionId, searchParams, activeTab]);

  const generateInspectionId = () => {
    const prefix = vehicleCategory === 'HEAVY' ? 'HV' : 'LV';
    const randomSegment = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `VIMS-${prefix}-${new Date().getFullYear()}-${randomSegment}`;
  };

  const handleCategorySelect = (category) => {
    setVehicleCategory(category);
    setShowCategoryModal(false);
  };

  const handleCategorySwitch = () => {
    if (inspectionId || checkedCount > 0) {
      setPendingCategory(vehicleCategory === 'HEAVY' ? 'LIGHT' : 'HEAVY');
      setShowSwitchWarning(true);
    } else {
      setShowCategoryModal(true);
    }
  };

  const confirmCategorySwitch = () => {
    setVehicleCategory(pendingCategory);
    setInspectionId('');
    setRegistration(initialRegistration);
    setActiveTab('registration');
    setExpandedZone('zone1');
    window.sessionStorage.removeItem('vims.inspection.id');
    setShowSwitchWarning(false);
    setPendingCategory(null);
  };

  const handleRegistrationSave = () => {
    if (!validateRegistration()) return;
    setIsSavingRegistration(true);
    setTimeout(() => {
      const newId = generateInspectionId();
      const startTime = new Date().toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      setInspectionId(newId);
      setTestStartTime(startTime);
      // Store vehicle profile in session
      window.sessionStorage.setItem('vims.inspection.vehicle', JSON.stringify({
        ...registration,
        category: vehicleCategory,
        formId: categoryConfig?.formId,
        testStartTime: startTime,
      }));
      setIsSavingRegistration(false);
      setActiveTab('visual');
    }, 600);
  };

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
      setCameraError('Unable to access camera. Please check permissions or device.');
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

  const capturePhotoWithMetadata = async (purpose) => {
    const stream = await ensureCameraStream();
    if (!stream || !videoRef.current || !canvasRef.current) {
      console.error('Missing stream, video, or canvas', { stream: !!stream, video: !!videoRef.current, canvas: !!canvasRef.current });
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Ensure video is playing
    if (video.paused) {
      try {
        await video.play();
      } catch (err) {
        console.error('Error playing video:', err);
      }
    }

    // Wait for video to be ready and have valid dimensions (simpler check like machine test)
    await new Promise((resolve) => {
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        resolve();
      } else {
        const checkReady = () => {
          if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
            video.removeEventListener('loadedmetadata', checkReady);
            video.removeEventListener('loadeddata', checkReady);
            video.removeEventListener('playing', checkReady);
            resolve();
          }
        };
        video.addEventListener('loadedmetadata', checkReady);
        video.addEventListener('loadeddata', checkReady);
        video.addEventListener('playing', checkReady);
        // Fallback timeout
        setTimeout(() => {
          video.removeEventListener('loadedmetadata', checkReady);
          video.removeEventListener('loadeddata', checkReady);
          video.removeEventListener('playing', checkReady);
          resolve();
        }, 2000);
      }
    });

    // Additional delay to ensure frame is ready (matching machine test timing)
    await new Promise(resolve => setTimeout(resolve, 150));

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    
    if (width === 0 || height === 0) {
      console.error('Video dimensions are invalid', { width, height, readyState: video.readyState, paused: video.paused });
      return null;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    
    // Draw video frame directly (like machine test - don't clear with black first)
    try {
      ctx.drawImage(video, 0, 0, width, height);
    } catch (err) {
      console.error('Error drawing video to canvas:', err);
      return null;
    }

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

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    return {
      id: `${purpose}-${Date.now()}`,
      purpose,
      timestamp: timestamp.toISOString(),
      coords,
      dataUrl,
    };
  };

  const handleRegistrationPhotoCapture = async () => {
    const photo = await capturePhotoWithMetadata('registration');
    if (photo) {
      setRegistrationPhoto(photo);
      // Save photo immediately if we have inspection ID and vehicle data
      if (inspectionId) {
        const vehicleData = JSON.parse(window.sessionStorage.getItem('vims.inspection.vehicle') || '{}');
        if (vehicleData.plateNumber) {
          const existing = getPhotosByInspectionId(inspectionId);
          saveInspectionPhotos(inspectionId, vehicleData, {
            registration: photo,
            inspection: existing?.photos?.inspection || [],
            machineTest: existing?.photos?.machineTest || [],
          });
        }
      }
    }
  };


  const handleItemStatus = (itemId, status) => {
    if (status === 'FAIL') {
      setDefectModal({ itemId });
      setSelectedDefect('');
    } else {
      setChecklist(prev => ({
        ...prev,
        [itemId]: { status, defect: null, photo: null, timestamp: new Date().toISOString() }
      }));
    }
  };

  const handleDefectSubmit = () => {
    if (!selectedDefect) return;
    setChecklist(prev => ({
      ...prev,
      [defectModal.itemId]: {
        status: 'FAIL',
        defect: selectedDefect,
        photo: null,
        timestamp: new Date().toISOString()
      }
    }));
    setDefectModal(null);
    setSelectedDefect('');
  };

  const handleMarkZoneCorrect = (zone) => {
    const updates = {};
    zone.items.forEach(item => {
      if (checklist[item.id]?.status === null) {
        updates[item.id] = { status: 'PASS', defect: null, photo: null, timestamp: new Date().toISOString() };
      }
    });
    setChecklist(prev => ({ ...prev, ...updates }));
  };

  const handleSaveVisual = () => {
    if (!allComplete) return;
    setIsSavingVisual(true);
    // Store checklist in session
    window.sessionStorage.setItem('vims.inspection.visual', JSON.stringify({
      checklist,
      notes: visualNotes,
      earnedPoints,
      totalPoints,
      category: vehicleCategory,
    }));
    
    // Save photos to persistent storage
    const vehicleData = JSON.parse(window.sessionStorage.getItem('vims.inspection.vehicle') || '{}');
    if (inspectionId && vehicleData.plateNumber) {
      // Get existing photos to preserve registration and any machine test photos
      const existing = getPhotosByInspectionId(inspectionId);
      const photosToSave = {
        registration: registrationPhoto || existing?.photos?.registration || null,
        inspection: existing?.photos?.inspection || [],
        machineTest: existing?.photos?.machineTest || [],
      };
      console.log('Saving visual inspection photos:', {
        inspectionId,
        registration: !!photosToSave.registration,
        inspectionCount: photosToSave.inspection.length,
        machineTestCount: photosToSave.machineTest.length
      });
      saveInspectionPhotos(inspectionId, vehicleData, photosToSave);
    }
    
    setTimeout(() => {
      setIsSavingVisual(false);
      navigate('/machine-test');
    }, 600);
  };

  const inputClass = "w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:border-[#88bf47] focus:ring-2 focus:ring-[#88bf47]/20 focus:outline-none transition";

  // Show category selection modal if no category selected
  if (showCategoryModal) {
    return (
      <CategorySelectionModal
        onSelect={handleCategorySelect}
        onClose={() => navigate('/dashboard')}
      />
    );
  }

  const theme = categoryConfig?.theme || VEHICLE_CATEGORIES.LIGHT.theme;

  return (
    <div className="space-y-6">
      {/* Category Switch Warning Modal */}
      {showSwitchWarning && (
        <CategorySwitchWarning
          onConfirm={confirmCategorySwitch}
          onCancel={() => {
            setShowSwitchWarning(false);
            setPendingCategory(null);
          }}
        />
      )}

      {/* Defect Modal */}
      {defectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-red-50">
              <h3 className="text-lg font-bold text-red-800">Document Defect</h3>
              <p className="text-sm text-red-600">Select the type of defect found</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Select Defect Type</label>
                <select
                  value={selectedDefect}
                  onChange={(e) => setSelectedDefect(e.target.value)}
                  className={inputClass}
                >
                  <option value="">-- Select --</option>
                  {DEFECT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setDefectModal(null);
                  setSelectedDefect('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedDefect}
                onClick={() => handleDefectSubmit()}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Category Badge */}
      <div className={`flex items-center justify-between p-4 rounded-xl ${theme.accentBg} ${theme.accentBorder} border`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg ${theme.badgeBg} flex items-center justify-center ${theme.accentText}`}>
            {vehicleCategory === 'HEAVY' ? VEHICLE_CATEGORIES.HEAVY.icon : VEHICLE_CATEGORIES.LIGHT.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {vehicleCategory === 'HEAVY' ? 'Heavy Vehicles Annual Technical Inspection Form' : 'Light Vehicle Inspection Form'}
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${theme.badgeBg} ${theme.accentText}`}>
                {categoryConfig?.formId}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {vehicleCategory === 'HEAVY' ? 'Buses, Trucks, Trailers' : 'Sedans, SUVs, Pickups'} • 30-Point Checklist
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCategorySwitch}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Switch Category
          </button>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Inspection ID</p>
            <p className="text-sm font-mono font-semibold text-[#88bf47]">{formattedInspectionId}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('registration')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'registration' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            activeTab === 'registration' ? 'bg-[#88bf47] text-white' : inspectionId ? 'bg-[#88bf47] text-white' : 'bg-gray-300 text-white'
          }`}>
            {inspectionId ? '✓' : '1'}
          </span>
          Registration
        </button>
        <button
          type="button"
          onClick={() => inspectionId && setActiveTab('visual')}
          disabled={!inspectionId}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'visual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 disabled:opacity-50'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            activeTab === 'visual' ? 'bg-[#88bf47] text-white' : allComplete ? 'bg-[#88bf47] text-white' : 'bg-gray-300 text-white'
          }`}>
            {allComplete ? '✓' : '2'}
          </span>
          Visual (30-Point)
        </button>
        <div className="flex items-center gap-2 px-4 py-2.5 text-gray-400 text-sm">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-400">3</span>
          Machine Tests
        </div>
      </div>

      {/* Registration Form */}
      {activeTab === 'registration' && (
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${vehicleCategory === 'HEAVY' ? 'border-amber-200' : 'border-gray-200'}`}>
          <div className={`px-6 py-4 border-b ${vehicleCategory === 'HEAVY' ? 'bg-amber-50 border-amber-100' : 'bg-gray-50/50 border-gray-100'}`}>
            <h2 className="text-lg font-semibold text-gray-900">Vehicle Registration</h2>
            <p className="text-sm text-gray-500">Enter vehicle details as per the {vehicleCategory === 'HEAVY' ? 'Heavy Vehicle' : 'Light Vehicle'} Technical Inspection Certificate</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput label="Owner Name" error={regErrors.ownerName}>
                <input type="text" value={registration.ownerName} onChange={(e) => handleRegistrationChange('ownerName', e.target.value)} placeholder="Full name" className={inputClass} />
              </FormInput>
              <FormInput label="Plate Number" error={regErrors.plateNumber}>
                <input type="text" value={registration.plateNumber} onChange={(e) => {
                  // Allow letters, numbers, and dashes, convert to uppercase
                  const value = e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
                  handleRegistrationChange('plateNumber', value);
                }} placeholder="AA-12345" className={inputClass} />
              </FormInput>
              <FormInput label="Chassis Number" error={regErrors.chassisNumber}>
                <input type="text" value={registration.chassisNumber} onChange={(e) => handleRegistrationChange('chassisNumber', e.target.value)} placeholder="VIN / Chassis" className={`${inputClass} font-mono uppercase tracking-wider`} />
              </FormInput>
              <FormInput label="Engine Number" error={regErrors.engineNumber}>
                <input type="text" value={registration.engineNumber} onChange={(e) => handleRegistrationChange('engineNumber', e.target.value)} placeholder="Engine ID" className={`${inputClass} font-mono uppercase`} />
              </FormInput>
              <FormInput label="Vehicle Type" error={regErrors.vehicleType}>
                <select value={registration.vehicleType} onChange={(e) => handleRegistrationChange('vehicleType', e.target.value)} className={inputClass}>
                  <option value="">Select type</option>
                  {vehicleTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                </select>
              </FormInput>
              <FormInput label="Brand / Model" error={regErrors.brandModel}>
                <input type="text" value={registration.brandModel} onChange={(e) => handleRegistrationChange('brandModel', e.target.value)} placeholder="e.g., Toyota Camry" className={inputClass} />
              </FormInput>
              <FormInput label="Kilometer Reading" error={regErrors.kilometerReading}>
                <input type="number" min="0" value={registration.kilometerReading} onChange={(e) => handleRegistrationChange('kilometerReading', e.target.value)} placeholder="e.g., 125480" className={inputClass} />
              </FormInput>
              <FormInput label="Title Certificate Book #" error={regErrors.titleCertificate}>
                <input type="text" value={registration.titleCertificate} onChange={(e) => handleRegistrationChange('titleCertificate', e.target.value.toUpperCase())} placeholder="Book number" className={`${inputClass} font-mono uppercase tracking-wider`} />
              </FormInput>
              <FormInput label={vehicleCategory === 'HEAVY' ? 'Licensed Capacity (Seat / KG)' : 'Licensed Capacity (Seats)'} error={regErrors.licensedCapacity}>
                <input type="number" min="1" value={registration.licensedCapacity} onChange={(e) => handleRegistrationChange('licensedCapacity', e.target.value)} placeholder="Enter capacity" className={inputClass} />
              </FormInput>
              <FormInput label="Fuel Type" required={false}>
                <select value={registration.fuelType} onChange={(e) => handleRegistrationChange('fuelType', e.target.value)} className={inputClass}>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </FormInput>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Capture Vehicle Photo</p>
                  <p className="text-xs text-gray-500">Required at registration. Photos include timestamp and coordinates.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={ensureCameraStream}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    {cameraStream ? 'Camera Ready' : 'Start Camera'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegistrationPhotoCapture}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#88bf47] text-white hover:bg-[#0fa84a]"
                  >
                    Capture Photo
                  </button>
                </div>
              </div>
              {cameraError && <p className="text-xs text-red-600 mb-2">{cameraError}</p>}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Captured Photo</p>
                  {registrationPhoto ? (
                    <div className="space-y-3">
                      <img src={registrationPhoto.dataUrl} alt="Registration capture" className="w-full rounded-md border" />
                      <div className="space-y-2 border-t pt-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-700">Timestamp:</span>
                          </div>
                          <p className="text-xs text-gray-600 pl-6">
                            {new Date(registrationPhoto.timestamp).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </p>
                        </div>
                        {registrationPhoto.coords ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <span className="text-xs font-semibold text-gray-700">Coordinates:</span>
                            </div>
                            <div className="pl-6 space-y-0.5">
                              <p className="text-xs text-gray-600 font-mono">
                                Lat: {registrationPhoto.coords.lat.toFixed(6)}
                              </p>
                              <p className="text-xs text-gray-600 font-mono">
                                Lng: {registrationPhoto.coords.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-amber-600">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                            </svg>
                            <span>GPS not available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No photo captured yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={`px-6 py-4 border-t flex items-center justify-end ${vehicleCategory === 'HEAVY' ? 'bg-amber-50/50 border-amber-100' : 'bg-gray-50/50 border-gray-100'}`}>
            <button type="button" onClick={handleRegistrationSave} disabled={isSavingRegistration} className="px-6 py-2.5 rounded-lg bg-[#88bf47] text-white text-sm font-semibold hover:bg-[#0fa84a] disabled:opacity-60 transition flex items-center gap-2">
              {isSavingRegistration ? 'Saving...' : 'Save & Continue'}
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* 30-Point Visual Inspection */}
      {activeTab === 'visual' && (
        <div className="space-y-4">
          {/* Registration Photo Display (if available) */}
          {registrationPhoto && (
            <div className="bg-white border-2 border-[#88bf47] rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#88bf47]/10 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#88bf47]">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Registration Photo</h3>
                    <p className="text-xs text-gray-500">Vehicle registration photo captured during registration</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50/50">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700">Registration Photo</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">#1</span>
                    </div>
                    <img src={registrationPhoto.dataUrl} alt="Registration" className="w-full h-48 object-cover rounded-md border-2 border-blue-200 mb-2" />
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span className="font-semibold text-gray-700">Time:</span>
                        <span className="text-gray-600">
                          {new Date(registrationPhoto.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                      {registrationPhoto.coords ? (
                        <div className="space-y-0.5 pl-4">
                          <p className="text-gray-600 font-mono text-[10px]">
                            Lat: {registrationPhoto.coords.lat.toFixed(6)}
                          </p>
                          <p className="text-gray-600 font-mono text-[10px]">
                            Lng: {registrationPhoto.coords.lng.toFixed(6)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-amber-600 text-[10px] pl-4">GPS not available</p>
                      )}
                    </div>
                  </div>
                      </div>
            </div>
          )}

          {/* Vehicle Info Header Bar */}
          <VehicleInfoBar registration={registration} testStartTime={testStartTime} />

          {/* Progress Summary with Points */}
          <div className={`bg-white rounded-xl border p-4 ${vehicleCategory === 'HEAVY' ? 'border-amber-200' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${vehicleCategory === 'HEAVY' ? 'bg-amber-100' : 'bg-[#88bf47]/10'}`}>
                  <span className={`text-xl font-bold ${vehicleCategory === 'HEAVY' ? 'text-amber-700' : 'text-[#88bf47]'}`}>{checkedCount}/{totalItems}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">30-Point Visual Inspection</p>
                  <p className="text-xs text-gray-500">
                    <span className="text-green-600 font-medium">{passCount} Correct</span>
                    {failCount > 0 && <span className="text-red-600 font-medium ml-2">{failCount} Not Correct</span>}
                    <span className="ml-3 text-gray-400">|</span>
                    <span className="ml-3 font-medium">{earnedPoints}/{totalPoints} pts</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${vehicleCategory === 'HEAVY' ? 'bg-amber-500' : 'bg-[#88bf47]'}`} style={{ width: `${(checkedCount / totalItems) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold text-gray-700">{Math.round((checkedCount / totalItems) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Accordion Zones */}
          <div className="space-y-2">
            {inspectionZones.map((zone) => {
              const stats = getZoneStats(zone);
              const isExpanded = expandedZone === zone.id;
              const isComplete = stats.checked === stats.total;

              return (
                <div key={zone.id} className={`bg-white rounded-xl border overflow-hidden ${vehicleCategory === 'HEAVY' ? 'border-amber-200' : 'border-gray-200'}`}>
                  {/* Zone Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedZone(isExpanded ? null : zone.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 text-left transition ${
                      isExpanded 
                        ? vehicleCategory === 'HEAVY' ? 'bg-amber-50' : 'bg-gray-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isComplete ? 'bg-green-100 text-green-600' : vehicleCategory === 'HEAVY' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {zone.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{zone.titleAm}</p>
                        <p className="text-sm font-semibold text-gray-900">{zone.titleEn}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{stats.checked}/{stats.total} items</p>
                        <p className="text-xs font-medium text-gray-600">{stats.earnedZonePoints}/{stats.zonePoints} pts</p>
                      </div>
                      {isComplete && (
                        <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded">
                          Complete
                        </span>
                      )}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>

                  {/* Zone Items */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {/* Quick Action */}
                      <div className={`px-5 py-3 flex items-center justify-between ${vehicleCategory === 'HEAVY' ? 'bg-amber-50/50' : 'bg-gray-50/50'}`}>
                        <p className="text-xs text-gray-500">{zone.items.length} inspection items</p>
                        <button
                          type="button"
                          onClick={() => handleMarkZoneCorrect(zone)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition"
                        >
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Mark All Correct
                        </button>
                      </div>

                      {/* Items List */}
                      <div className="divide-y divide-gray-100">
                        {zone.items.map((item) => {
                          const itemState = checklist[item.id] || { status: null };
                          return (
                            <div
                              key={item.id}
                              className={`px-5 py-3 flex items-center justify-between ${
                                itemState.status === 'FAIL' ? 'bg-red-50' : itemState.status === 'PASS' ? 'bg-green-50/30' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  itemState.status === 'PASS' ? 'bg-green-500 text-white' :
                                  itemState.status === 'FAIL' ? 'bg-red-500 text-white' :
                                  'bg-gray-200 text-gray-600'
                                }`}>
                                  {item.id}
                                </span>
                                <div>
                                  <p className="text-xs text-gray-500">{item.am}</p>
                                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    {item.en}
                                    {item.critical && (
                                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-red-100 text-red-700 rounded">Critical</span>
                                    )}
                                    {item.mandatory && (
                                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-amber-100 text-amber-700 rounded">Mandatory</span>
                                    )}
                                  </p>
                                  {itemState.status === 'FAIL' && itemState.defect && (
                                    <p className="text-xs text-red-600 mt-0.5 flex items-center gap-1">
                                      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                      {DEFECT_OPTIONS.find(d => d.value === itemState.defect)?.label || itemState.defect}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 mr-2">{item.points} pts</span>
                                <button
                                  type="button"
                                  onClick={() => handleItemStatus(item.id, 'PASS')}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                                    itemState.status === 'PASS'
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                                  }`}
                                >
                                  Correct
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleItemStatus(item.id, 'FAIL')}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                                    itemState.status === 'FAIL'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                                  }`}
                                >
                                  Not Correct
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleItemStatus(item.id, 'NA')}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                                    itemState.status === 'NA'
                                      ? 'bg-gray-500 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  N/A
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Notes & Submit */}
          <div className={`bg-white rounded-xl border p-5 ${vehicleCategory === 'HEAVY' ? 'border-amber-200' : 'border-gray-200'}`}>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Additional Notes (Optional)</label>
            <textarea
              value={visualNotes}
              onChange={(e) => setVisualNotes(e.target.value)}
              rows={3}
              placeholder="Any additional observations..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm resize-none focus:border-[#88bf47] focus:ring-2 focus:ring-[#88bf47]/20 focus:outline-none"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {allComplete ? (
                  <span className="text-green-600 font-medium">All items checked. Ready to proceed.</span>
                ) : (
                  <span>{totalItems - checkedCount} items remaining</span>
                )}
              </p>
              <button
                type="button"
                onClick={handleSaveVisual}
                disabled={!allComplete || isSavingVisual}
                className={`px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition flex items-center gap-2 ${
                  allComplete
                    ? vehicleCategory === 'HEAVY' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#88bf47] hover:bg-[#0fa84a]'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isSavingVisual ? 'Saving...' : 'Submit & Continue to Machine Tests'}
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default InspectionPage;
