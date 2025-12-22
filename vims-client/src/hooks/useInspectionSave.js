/**
 * Hook for saving inspection data to database
 */

import { useState } from 'react';
import { saveInspection } from '../db/inspectionDB';
import { triggerSync } from '../services/syncService';

export const useInspectionSave = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedInspection, setSavedInspection] = useState(null);

  const saveInspectionData = async (inspectionData) => {
    setSaving(true);
    setError(null);

    try {
      // Prepare complete inspection data
      const completeData = {
        id: inspectionData.id || `VIS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        vehicle: {
          plateNumber: inspectionData.vehicle?.plateNumber || inspectionData.vehicle?.plate,
          vin: inspectionData.vehicle?.vin || inspectionData.vehicle?.chassisNumber,
          make: inspectionData.vehicle?.make,
          model: inspectionData.vehicle?.model,
          year: inspectionData.vehicle?.year,
          owner: {
            name: inspectionData.vehicle?.owner?.name || inspectionData.vehicle?.ownerName,
            phone: inspectionData.vehicle?.owner?.phone,
            idNumber: inspectionData.vehicle?.owner?.idNumber,
          },
          vehicleType: inspectionData.vehicle?.vehicleType || inspectionData.vehicle?.type,
          category: inspectionData.vehicle?.category,
          kilometerReading: inspectionData.vehicle?.kilometerReading,
        },
        inspectorId: inspectionData.inspectorId,
        inspectorName: inspectionData.inspectorName,
        centerId: inspectionData.centerId,
        centerName: inspectionData.centerName,
        status: inspectionData.status || 'Pending',
        overallResult: inspectionData.overallResult || inspectionData.status,
        paymentStatus: inspectionData.paymentStatus || 'Pending',
        type: inspectionData.type || 'Initial Inspection',
        amount: inspectionData.amount || 0,
        inspectionDate: inspectionData.inspectionDate || new Date().toISOString(),
        inspectionDateStart: inspectionData.inspectionDateStart,
        inspectionDateEnd: inspectionData.inspectionDateEnd,
        cycleTimeSeconds: inspectionData.cycleTimeSeconds,
        latitude: inspectionData.latitude,
        longitude: inspectionData.longitude,
        geoFenceStatus: inspectionData.geoFenceStatus,
        distanceMeters: inspectionData.distanceMeters,
        locationSource: inspectionData.locationSource,
        locationConfidence: inspectionData.locationConfidence,
        certificateNumber: inspectionData.certificateNumber,
        certificateIssueDate: inspectionData.certificateIssueDate,
        certificateExpiryDate: inspectionData.certificateExpiryDate,
        machineResults: inspectionData.machineResults || [],
        visualResults: inspectionData.visualResults || [],
        photos: inspectionData.photos || {},
      };

      // Save to database
      const saved = await saveInspection(completeData);
      setSavedInspection(saved);

      // Trigger sync (will happen in background)
      triggerSync().catch(err => {
        console.warn('Background sync failed, will retry later:', err);
      });

      return saved;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    saveInspectionData,
    saving,
    error,
    savedInspection,
  };
};











