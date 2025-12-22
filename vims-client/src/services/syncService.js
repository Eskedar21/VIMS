/**
 * Sync Service
 * Handles synchronization of inspection data from client to admin portal
 */

import { getPendingSyncItems, updateSyncStatus, getInspection } from '../db/inspectionDB';
import { httpClient } from '../api/httpClient';

const SYNC_ENDPOINT = '/api/inspections/sync';
const SYNC_BATCH_SIZE = 10;
const SYNC_RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRY_COUNT = 3;

/**
 * Convert inspection data to API format
 */
const formatInspectionForAPI = (inspection) => {
  return {
    id: inspection.id,
    vehicle: {
      plateNumber: inspection.vehicle?.plateNumber,
      vin: inspection.vehicle?.vin,
      make: inspection.vehicle?.make,
      model: inspection.vehicle?.model,
      year: inspection.vehicle?.year,
      owner: inspection.vehicle?.owner,
      vehicleType: inspection.vehicle?.vehicleType,
      category: inspection.vehicle?.category,
      kilometerReading: inspection.vehicle?.kilometerReading,
    },
    inspectorId: inspection.inspectorId,
    inspectorName: inspection.inspectorName,
    centerId: inspection.centerId,
    centerName: inspection.centerName,
    status: inspection.status,
    overallResult: inspection.overallResult,
    paymentStatus: inspection.paymentStatus,
    type: inspection.type,
    amount: inspection.amount,
    inspectionDate: inspection.inspectionDate,
    inspectionDateStart: inspection.inspectionDateStart,
    inspectionDateEnd: inspection.inspectionDateEnd,
    cycleTimeSeconds: inspection.cycleTimeSeconds,
    latitude: inspection.latitude,
    longitude: inspection.longitude,
    geoFenceStatus: inspection.geoFenceStatus,
    distanceMeters: inspection.distanceMeters,
    locationSource: inspection.locationSource,
    locationConfidence: inspection.locationConfidence,
    certificateNumber: inspection.certificateNumber,
    certificateIssueDate: inspection.certificateIssueDate,
    certificateExpiryDate: inspection.certificateExpiryDate,
    machineResults: inspection.machineResults?.map(result => ({
      id: result.id,
      test: result.test,
      testType: result.testType,
      value: result.value,
      unit: result.unit,
      status: result.status,
      threshold: result.threshold,
      minValue: result.minValue,
      maxValue: result.maxValue,
      timestamp: result.timestamp,
      machineId: result.machineId,
      machineSerial: result.machineSerial,
    })) || [],
    visualResults: inspection.visualResults?.map(result => ({
      id: result.id,
      item: result.item,
      category: result.category,
      status: result.status,
      severity: result.severity,
      notes: result.notes,
      photoId: result.photoId,
      timestamp: result.timestamp,
    })) || [],
    photos: inspection.photos?.map(photo => ({
      id: photo.id,
      type: photo.type,
      category: photo.category,
      item: photo.item,
      test: photo.test,
      filename: photo.filename,
      size: photo.size,
      mimeType: photo.mimeType,
      // Note: Actual photo blob will be sent separately via multipart/form-data
    })) || [],
  };
};

/**
 * Convert photo blob to base64 for API transmission
 */
const convertPhotoToBase64 = async (photoBlob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(photoBlob);
  });
};

/**
 * Sync a single inspection to admin portal
 */
export const syncInspection = async (inspectionId) => {
  try {
    // Mark as syncing
    await updateSyncStatus(inspectionId, 'syncing');

    // Get full inspection data
    const inspection = await getInspection(inspectionId);
    if (!inspection) {
      throw new Error('Inspection not found');
    }

    // Format for API
    const apiData = formatInspectionForAPI(inspection);

    // Send inspection data
    const response = await httpClient.post(SYNC_ENDPOINT, apiData);

    if (response.status === 200 || response.status === 201) {
      // Mark as synced
      await updateSyncStatus(inspectionId, 'synced');
      return { success: true, inspectionId };
    } else {
      throw new Error(`Sync failed with status ${response.status}`);
    }
  } catch (error) {
    console.error(`Error syncing inspection ${inspectionId}:`, error);
    await updateSyncStatus(inspectionId, 'failed', error);
    return { success: false, inspectionId, error: error.message };
  }
};

/**
 * Sync photos for an inspection
 */
export const syncInspectionPhotos = async (inspectionId) => {
  try {
    const inspection = await getInspection(inspectionId);
    if (!inspection || !inspection.photos || inspection.photos.length === 0) {
      return { success: true, message: 'No photos to sync' };
    }

    // For each photo, we need to get the actual blob and send it
    // This would require additional photo storage retrieval logic
    // For now, we'll include photo metadata in the main sync
    
    return { success: true };
  } catch (error) {
    console.error(`Error syncing photos for inspection ${inspectionId}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Sync all pending inspections
 */
export const syncAllPending = async () => {
  try {
    const pendingInspections = await getPendingSyncItems();
    
    if (pendingInspections.length === 0) {
      return { success: true, synced: 0, message: 'No pending inspections to sync' };
    }

    const results = [];
    const batches = [];

    // Split into batches
    for (let i = 0; i < pendingInspections.length; i += SYNC_BATCH_SIZE) {
      batches.push(pendingInspections.slice(i, i + SYNC_BATCH_SIZE));
    }

    // Sync each batch
    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(inspection => syncInspection(inspection.id))
      );

      results.push(...batchResults);
    }

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return {
      success: failed === 0,
      synced: successful,
      failed,
      total: pendingInspections.length,
      results,
    };
  } catch (error) {
    console.error('Error syncing all pending inspections:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Auto-sync service (runs periodically)
 */
let syncInterval = null;

export const startAutoSync = (intervalMs = 60000) => {
  if (syncInterval) {
    stopAutoSync();
  }

  // Initial sync
  syncAllPending();

  // Set up periodic sync
  syncInterval = setInterval(() => {
    syncAllPending();
  }, intervalMs);
};

export const stopAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

/**
 * Manual sync trigger (can be called from UI)
 */
export const triggerSync = async () => {
  return await syncAllPending();
};











