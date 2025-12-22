# Database Integration Guide

## Overview
This guide explains how the inspection database system works, connecting the client module (where inspections are performed) with the admin portal (where inspections are viewed and managed).

## Architecture

### Client Module (vims-client)
- **Database**: IndexedDB (local browser database)
- **Purpose**: Store inspections locally for offline-first operation
- **Location**: `vims-client/src/db/inspectionDB.js`
- **Sync Service**: `vims-client/src/services/syncService.js`

### Admin Portal
- **API**: REST API endpoints to receive and serve inspection data
- **Location**: `admin-portal/src/api/inspectionApi.js`
- **Display**: `admin-portal/src/pages/inspections/InspectionViewer.jsx`

## Database Schema

### Inspections Store
```javascript
{
  id: string (PK),
  vehicle: {
    plateNumber: string,
    vin: string,
    make: string,
    model: string,
    owner: { name, phone, idNumber },
    vehicleType: string,
    category: string,
    kilometerReading: number
  },
  inspectorId: string,
  inspectorName: string,
  centerId: string,
  centerName: string,
  status: 'Passed' | 'Failed' | 'Pending' | 'Conditional',
  overallResult: string,
  paymentStatus: string,
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed',
  type: 'Initial Inspection' | 'Retest' | 'Re-inspection',
  amount: number,
  inspectionDate: ISO string,
  inspectionDateStart: ISO string,
  inspectionDateEnd: ISO string,
  cycleTimeSeconds: number,
  latitude: number,
  longitude: number,
  geoFenceStatus: string,
  certificateNumber: string,
  certificateIssueDate: ISO string,
  certificateExpiryDate: ISO string
}
```

### Machine Results Store
```javascript
{
  id: string (PK),
  inspectionId: string (FK),
  test: string, // 'Brake', 'Emissions', 'Suspension', 'Headlights'
  testType: string,
  value: string, // e.g., '78%', '2.1%'
  unit: string,
  status: 'Pass' | 'Fail',
  threshold: number,
  minValue: number,
  maxValue: number,
  timestamp: ISO string,
  machineId: string,
  machineSerial: string
}
```

### Visual Results Store
```javascript
{
  id: string (PK),
  inspectionId: string (FK),
  item: string, // 'Tires', 'Windshield', 'Mirrors', etc.
  category: string, // 'Exterior', 'Lights', 'Tires', 'Interior', 'Documents'
  status: 'Pass' | 'Fail' | 'Not Applicable',
  severity: 'Info' | 'Minor' | 'Major' | 'Critical',
  notes: string,
  photoId: string,
  timestamp: ISO string
}
```

### Photos Store
```javascript
{
  id: string (PK),
  inspectionId: string (FK),
  type: 'registration' | 'visual' | 'machine',
  category: string,
  item: string,
  test: string,
  filename: string,
  size: number,
  mimeType: string,
  blob: Blob (stored separately)
}
```

## Data Flow

### 1. Inspection Creation (Client)
1. Inspector completes inspection on client
2. Data is saved to IndexedDB using `saveInspection()`
3. Inspection is added to sync queue
4. Background sync service attempts to send to admin

### 2. Sync Process (Client → Admin)
1. `syncService.js` checks for pending inspections
2. Formats data for API using `formatInspectionForAPI()`
3. Sends POST request to `/api/inspections/sync`
4. Updates sync status: `pending` → `syncing` → `synced` or `failed`
5. Retries failed syncs automatically

### 3. Data Display (Admin)
1. Admin portal fetches inspection via `getInspectionById()`
2. Fetches related machine results, visual results, and photos
3. Displays data in `InspectionViewer` component
4. Format matches client report format exactly

## Integration Steps

### Step 1: Update ResultPage to Save to Database

In `vims-client/src/pages/ResultPage.jsx`:

```javascript
import { useInspectionSave } from '../hooks/useInspectionSave';
import { useAuth } from '../contexts/AuthContext';
import { useKiosk } from '../contexts/KioskContext';

// In component:
const { saveInspectionData, saving } = useInspectionSave();
const { user } = useAuth();
const { center } = useKiosk();

const handleFinalize = async () => {
  setIsFinalizing(true);
  
  try {
    // Collect all inspection data
    const inspectionData = {
      id: VEHICLE.inspectionId,
      vehicle: {
        plateNumber: VEHICLE.plate,
        vin: VEHICLE.chassis,
        make: VEHICLE.brandModel.split(' ')[0],
        model: VEHICLE.brandModel.split(' ').slice(1).join(' '),
        owner: { name: VEHICLE.owner },
        vehicleType: VEHICLE.vehicleType,
        category: VEHICLE.category,
        kilometerReading: VEHICLE.kilometerReading,
      },
      inspectorId: user?.id,
      inspectorName: user?.name,
      centerId: center?.id,
      centerName: center?.name,
      status: overallResult === 'PASS' ? 'Passed' : 'Failed',
      overallResult: overallResult,
      paymentStatus: paymentDone ? 'Paid' : 'Pending',
      type: 'Initial Inspection',
      amount: FEES[VEHICLE.category]?.total || 0,
      inspectionDate: new Date().toISOString(),
      inspectionDateStart: VEHICLE.testStartTime,
      inspectionDateEnd: new Date().toISOString(),
      machineResults: getStoredMachine()?.results || [],
      visualResults: getStoredVisual()?.results || [],
      photos: {
        registration: getStoredVehicle()?.photo,
        inspection: getStoredVisual()?.photos || [],
        machineTest: getStoredMachine()?.photos || [],
      },
      certificateNumber: certNo,
      certificateIssueDate: new Date().toISOString(),
      certificateExpiryDate: expiryDate,
    };

    await saveInspectionData(inspectionData);
    
    setIsFinalized(true);
    setReportId(VEHICLE.inspectionId);
  } catch (error) {
    console.error('Failed to save inspection:', error);
    alert('Failed to save inspection. Please try again.');
  } finally {
    setIsFinalizing(false);
  }
};
```

### Step 2: Update Admin InspectionViewer

In `admin-portal/src/pages/inspections/InspectionViewer.jsx`:

```javascript
import { getInspectionById, getMachineResults, getVisualResults, getInspectionPhotos } from '../../api/inspectionApi';

// Replace mock data fetch with real API call:
useEffect(() => {
  const fetchInspection = async () => {
    try {
      const data = await getInspectionById(id);
      setInspection(data);
      
      // Fetch related data
      const [machineResults, visualResults, photos] = await Promise.all([
        getMachineResults(id),
        getVisualResults(id),
        getInspectionPhotos(id),
      ]);
      
      setInspection(prev => ({
        ...prev,
        machineResults,
        visualResults,
        photos,
      }));
    } catch (error) {
      console.error('Failed to fetch inspection:', error);
      // Fallback to mock data for demo
      setInspection(mockInspectionRecord);
    }
  };
  
  fetchInspection();
}, [id]);
```

### Step 3: Backend API Endpoints (To Be Implemented)

The backend should provide these endpoints:

- `POST /api/inspections/sync` - Receive inspection data from client
- `GET /api/inspections/:id` - Get inspection by ID
- `GET /api/inspections` - List inspections with filters
- `GET /api/inspections/:id/machine-results` - Get machine results
- `GET /api/inspections/:id/visual-results` - Get visual results
- `GET /api/inspections/:id/photos` - Get photos
- `GET /api/inspections/:id/photos/:photoId` - Get photo blob

## Matching Client and Admin Reports

To ensure the admin display matches the client report:

1. **Same Data Structure**: Both use the same inspection data model
2. **Same Formatting**: Use shared formatting functions
3. **Same Visual Layout**: Admin viewer mirrors client report layout
4. **Same Calculations**: Certificate expiry, cycle time, etc. use same logic

## Testing

1. **Client Side**:
   - Complete an inspection
   - Verify data is saved to IndexedDB
   - Check sync queue for pending items
   - Verify sync status updates

2. **Admin Side**:
   - Verify inspection appears in list
   - Check all data fields match client
   - Verify machine results display correctly
   - Verify visual results and photos display
   - Check certificate matches client format

## Troubleshooting

### Sync Not Working
- Check network connectivity
- Verify API endpoint is correct
- Check browser console for errors
- Verify sync service is running

### Data Not Appearing in Admin
- Check backend API is receiving data
- Verify database is storing data
- Check API response format matches expected structure

### Photos Not Displaying
- Verify photos are being saved as blobs
- Check photo URLs are correct
- Verify CORS settings allow photo access











