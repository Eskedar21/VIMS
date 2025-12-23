/**
 * Photo Storage Utility
 * Stores and retrieves inspection photos per vehicle using localStorage
 */

const STORAGE_KEY = 'vims.vehicle.photos';
const INSPECTION_INDEX_KEY = 'vims.inspection.index';

/**
 * Get all stored inspections
 */
export const getAllInspections = () => {
  try {
    const stored = localStorage.getItem(INSPECTION_INDEX_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Get photos for a specific inspection ID
 */
export const getPhotosByInspectionId = (inspectionId) => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}.${inspectionId}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Save photos for an inspection
 */
export const saveInspectionPhotos = (inspectionId, vehicleData, photos) => {
  try {
    const photoData = {
      inspectionId,
      vehicleData: {
        plateNumber: vehicleData.plateNumber,
        chassisNumber: vehicleData.chassisNumber,
        engineNumber: vehicleData.engineNumber,
        ownerName: vehicleData.ownerName,
        vehicleType: vehicleData.vehicleType,
        brandModel: vehicleData.brandModel,
        category: vehicleData.category,
        testStartTime: vehicleData.testStartTime,
        kilometerReading: vehicleData.kilometerReading,
      },
      photos: {
        registration: photos.registration || null,
        inspection: Array.isArray(photos.inspection) ? photos.inspection : [],
        machineTest: Array.isArray(photos.machineTest) ? photos.machineTest : [],
      },
      savedAt: new Date().toISOString(),
    };

    // Save photos
    localStorage.setItem(`${STORAGE_KEY}.${inspectionId}`, JSON.stringify(photoData));

    // Update inspection index
    const index = getAllInspections();
    const existingIndex = index.findIndex((item) => item.inspectionId === inspectionId);
    
    const indexEntry = {
      inspectionId,
      plateNumber: vehicleData.plateNumber,
      chassisNumber: vehicleData.chassisNumber,
      ownerName: vehicleData.ownerName,
      testStartTime: vehicleData.testStartTime,
      savedAt: photoData.savedAt,
    };

    if (existingIndex >= 0) {
      index[existingIndex] = indexEntry;
    } else {
      index.unshift(indexEntry); // Add to beginning
    }

    // Keep only last 1000 inspections to prevent storage bloat
    const trimmedIndex = index.slice(0, 1000);
    localStorage.setItem(INSPECTION_INDEX_KEY, JSON.stringify(trimmedIndex));

    return true;
  } catch (error) {
    console.error('Error saving photos:', error);
    return false;
  }
};

/**
 * Search inspections by plate, chassis, owner, or inspection ID
 * Also searches for numeric patterns within these fields
 */
export const searchInspections = (query) => {
  if (!query || !query.trim()) return [];
  
  const index = getAllInspections();
  const q = query.toLowerCase().trim();
  
  // Extract numbers from query for numeric search
  const numericPattern = q.replace(/\D/g, ''); // Extract only digits
  
  return index.filter((item) => {
    const plate = (item.plateNumber || '').toLowerCase();
    const chassis = (item.chassisNumber || '').toLowerCase();
    const owner = (item.ownerName || '').toLowerCase();
    const inspectionId = (item.inspectionId || '').toLowerCase();
    
    // Extract numbers from each field for numeric matching
    const plateNumbers = (item.plateNumber || '').replace(/\D/g, '');
    const chassisNumbers = (item.chassisNumber || '').replace(/\D/g, '');
    const inspectionIdNumbers = (item.inspectionId || '').replace(/\D/g, '');
    
    // Text-based search
    const textMatch = (
      plate.includes(q) ||
      chassis.includes(q) ||
      owner.includes(q) ||
      inspectionId.includes(q)
    );
    
    // Numeric search - if query contains numbers, also search by numbers
    const numericMatch = numericPattern.length > 0 && (
      plateNumbers.includes(numericPattern) ||
      chassisNumbers.includes(numericPattern) ||
      inspectionIdNumbers.includes(numericPattern)
    );
    
    return textMatch || numericMatch;
  });
};

/**
 * Get all photos for a vehicle (by plate number)
 */
export const getPhotosByPlate = (plateNumber) => {
  const index = getAllInspections();
  const normalizedPlate = plateNumber?.toUpperCase().trim();
  
  const matchingInspections = index.filter(
    (item) => (item.plateNumber || '').toUpperCase().trim() === normalizedPlate
  );
  
  return matchingInspections.map((item) => {
    const photos = getPhotosByInspectionId(item.inspectionId);
    return {
      ...item,
      photos: photos?.photos || null,
    };
  });
};

/**
 * Delete photos for an inspection (cleanup)
 */
export const deleteInspectionPhotos = (inspectionId) => {
  try {
    localStorage.removeItem(`${STORAGE_KEY}.${inspectionId}`);
    
    const index = getAllInspections();
    const filtered = index.filter((item) => item.inspectionId !== inspectionId);
    localStorage.setItem(INSPECTION_INDEX_KEY, JSON.stringify(filtered));
    
    return true;
  } catch {
    return false;
  }
};

