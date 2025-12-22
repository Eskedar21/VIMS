# Integration Code Examples

## Client Side: Saving Inspection to Database

### Example: Update ResultPage.jsx handleFinalize

```javascript
// Add imports at top
import { useInspectionSave } from '../hooks/useInspectionSave';
import { useAuth } from '../contexts/AuthContext';
import { useKiosk } from '../contexts/KioskContext';

// In component body
const { saveInspectionData, saving, error } = useInspectionSave();
const { user } = useAuth();
const { center } = useKiosk();

// Update handleFinalize function
const handleFinalize = async () => {
  setIsFinalizing(true);
  
  try {
    // Get stored data
    const storedVisual = getStoredVisual();
    const storedMachine = getStoredMachine();
    
    // Prepare machine results
    const machineResults = storedMachine?.results?.map(result => ({
      test: result.test || result.name,
      testType: result.testType,
      value: result.value || result.result,
      unit: result.unit || '%',
      status: result.status === 'PASS' ? 'Pass' : 'Fail',
      threshold: result.threshold,
      minValue: result.minValue,
      maxValue: result.maxValue,
      timestamp: result.timestamp || new Date().toISOString(),
    })) || [];

    // Prepare visual results
    const visualResults = storedVisual?.results?.map(result => ({
      item: result.item || result.name,
      category: result.category,
      status: result.status === 'PASS' ? 'Pass' : 'Fail',
      severity: result.severity || 'Info',
      notes: result.notes,
      photoId: result.photoId,
      timestamp: result.timestamp || new Date().toISOString(),
    })) || [];

    // Calculate cycle time
    const startTime = new Date(VEHICLE.testStartTime);
    const endTime = new Date();
    const cycleTimeSeconds = Math.floor((endTime - startTime) / 1000);

    // Prepare inspection data
    const inspectionData = {
      id: VEHICLE.inspectionId,
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
      inspectorId: user?.id || 'unknown',
      inspectorName: user?.name || 'Unknown Inspector',
      centerId: center?.id || 'unknown',
      centerName: center?.name || 'Unknown Center',
      status: overallResult === 'PASS' ? 'Passed' : overallResult === 'FAIL' ? 'Failed' : 'Pending',
      overallResult: overallResult,
      paymentStatus: paymentDone ? 'Paid' : 'Pending',
      type: 'Initial Inspection',
      amount: FEES[VEHICLE.category]?.total || 0,
      inspectionDate: new Date().toISOString(),
      inspectionDateStart: VEHICLE.testStartTime,
      inspectionDateEnd: new Date().toISOString(),
      cycleTimeSeconds: cycleTimeSeconds,
      machineResults: machineResults,
      visualResults: visualResults,
      photos: {
        registration: storedVehicle?.photo || null,
        inspection: storedVisual?.photos || [],
        machineTest: storedMachine?.photos || [],
      },
      certificateNumber: certNo || null,
      certificateIssueDate: certNo ? new Date().toISOString() : null,
      certificateExpiryDate: certNo ? expiryDate : null,
    };

    // Save to database
    const saved = await saveInspectionData(inspectionData);
    
    if (saved) {
      setIsFinalized(true);
      setReportId(VEHICLE.inspectionId);
      window.sessionStorage.setItem('vims.report.id', VEHICLE.inspectionId);
    }
  } catch (err) {
    console.error('Failed to save inspection:', err);
    alert('Failed to save inspection. Data saved locally and will sync when online.');
    // Still mark as finalized for user experience
    setIsFinalized(true);
    setReportId(VEHICLE.inspectionId);
  } finally {
    setIsFinalizing(false);
  }
};
```

## Admin Side: Fetching and Displaying Real Data

### Example: Update InspectionViewer.jsx

```javascript
// Add import
import { getInspectionById, getMachineResults, getVisualResults, getInspectionPhotos, getPhotoUrl } from '../../api/inspectionApi';

// Update useEffect
useEffect(() => {
  const fetchInspection = async () => {
    try {
      // Try to fetch real data
      const data = await getInspectionById(id);
      
      if (data) {
        // Fetch related data
        const [machineResults, visualResults, photos] = await Promise.all([
          getMachineResults(id).catch(() => []),
          getVisualResults(id).catch(() => []),
          getInspectionPhotos(id).catch(() => []),
        ]);
        
        // Format data to match expected structure
        setInspection({
          inspection_id: data.id,
          inspection_type: data.type,
          inspection_status: data.status,
          inspection_date_time_start: data.inspectionDateStart,
          inspection_date_time_end: data.inspectionDateEnd,
          cycle_time_seconds: data.cycleTimeSeconds,
          vehicle: {
            plate_number: data.vehicle.plateNumber,
            vin: data.vehicle.vin,
            make: data.vehicle.make,
            model: data.vehicle.model,
            year: data.vehicle.year,
            vehicle_class: data.vehicle.vehicleType,
            owner: data.vehicle.owner,
          },
          center: {
            center_id: data.centerId,
            center_name: data.centerName,
          },
          inspector: {
            inspector_user_id: data.inspectorId,
            inspector_name: data.inspectorName,
          },
          overall_result: data.overallResult,
          machine_results: machineResults.map(r => ({
            test: r.test,
            test_type: r.testType,
            value: r.value,
            unit: r.unit,
            status: r.status,
            threshold: r.threshold,
            timestamp: r.timestamp,
          })),
          visual_results: visualResults.map(r => ({
            item: r.item,
            category: r.category,
            status: r.status,
            severity: r.severity,
            notes: r.notes,
            photo_url: r.photoId ? getPhotoUrl(id, r.photoId) : null,
            timestamp: r.timestamp,
          })),
          certificate: {
            certificate_id: data.certificateNumber,
            certificate_number: data.certificateNumber,
            certificate_issue_date: data.certificateIssueDate,
            certificate_expiry_date: data.certificateExpiryDate,
          },
          payment: {
            payment_status: data.paymentStatus,
            amount: data.amount,
          },
          location: {
            latitude: data.latitude,
            longitude: data.longitude,
            geoFenceStatus: data.geoFenceStatus,
          },
        });
      } else {
        // Fallback to mock data
        setInspection(mockInspectionRecord);
      }
    } catch (error) {
      console.error('Failed to fetch inspection:', error);
      // Fallback to mock data for demo
      setInspection(mockInspectionRecord);
    }
  };
  
  fetchInspection();
}, [id]);
```

## Starting Auto-Sync on Client

### Example: Initialize sync service in App.jsx or main component

```javascript
import { startAutoSync, stopAutoSync } from './services/syncService';
import { useEffect } from 'react';

// In your main App component or KioskContext
useEffect(() => {
  // Start auto-sync every 60 seconds
  startAutoSync(60000);
  
  // Cleanup on unmount
  return () => {
    stopAutoSync();
  };
}, []);
```

## Backend API Endpoint Example (Node.js/Express)

```javascript
// POST /api/inspections/sync
app.post('/api/inspections/sync', async (req, res) => {
  try {
    const inspectionData = req.body;
    
    // Validate data
    if (!inspectionData.id || !inspectionData.vehicle) {
      return res.status(400).json({ error: 'Invalid inspection data' });
    }
    
    // Save to database
    const inspection = await db.inspections.create({
      id: inspectionData.id,
      vehicle_plate: inspectionData.vehicle.plateNumber,
      vehicle_vin: inspectionData.vehicle.vin,
      inspector_id: inspectionData.inspectorId,
      center_id: inspectionData.centerId,
      status: inspectionData.status,
      overall_result: inspectionData.overallResult,
      inspection_date: inspectionData.inspectionDate,
      // ... other fields
    });
    
    // Save machine results
    for (const result of inspectionData.machineResults || []) {
      await db.machine_results.create({
        inspection_id: inspection.id,
        test: result.test,
        value: result.value,
        status: result.status,
        // ... other fields
      });
    }
    
    // Save visual results
    for (const result of inspectionData.visualResults || []) {
      await db.visual_results.create({
        inspection_id: inspection.id,
        item: result.item,
        status: result.status,
        // ... other fields
      });
    }
    
    // Handle photos (save to file storage or blob storage)
    // ...
    
    res.status(201).json({ 
      success: true, 
      inspectionId: inspection.id 
    });
  } catch (error) {
    console.error('Error syncing inspection:', error);
    res.status(500).json({ error: 'Failed to sync inspection' });
  }
});
```











