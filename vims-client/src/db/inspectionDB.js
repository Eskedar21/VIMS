/**
 * Inspection Database Service
 * Uses IndexedDB to store inspection data locally on the client
 * Supports offline-first architecture with sync capability
 */

const DB_NAME = 'VIMS_INSPECTIONS_DB';
const DB_VERSION = 1;

// Store names
const STORES = {
  INSPECTIONS: 'inspections',
  MACHINE_RESULTS: 'machine_results',
  VISUAL_RESULTS: 'visual_results',
  PHOTOS: 'photos',
  SYNC_QUEUE: 'sync_queue',
};

let dbInstance = null;

/**
 * Initialize IndexedDB database
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Inspections store
      if (!db.objectStoreNames.contains(STORES.INSPECTIONS)) {
        const inspectionStore = db.createObjectStore(STORES.INSPECTIONS, {
          keyPath: 'id',
          autoIncrement: false,
        });
        inspectionStore.createIndex('plateNumber', 'vehicle.plateNumber', { unique: false });
        inspectionStore.createIndex('inspectionDate', 'inspectionDate', { unique: false });
        inspectionStore.createIndex('status', 'status', { unique: false });
        inspectionStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        inspectionStore.createIndex('centerId', 'centerId', { unique: false });
      }

      // Machine Results store
      if (!db.objectStoreNames.contains(STORES.MACHINE_RESULTS)) {
        const machineStore = db.createObjectStore(STORES.MACHINE_RESULTS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        machineStore.createIndex('inspectionId', 'inspectionId', { unique: false });
        machineStore.createIndex('test', 'test', { unique: false });
      }

      // Visual Results store
      if (!db.objectStoreNames.contains(STORES.VISUAL_RESULTS)) {
        const visualStore = db.createObjectStore(STORES.VISUAL_RESULTS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        visualStore.createIndex('inspectionId', 'inspectionId', { unique: false });
        visualStore.createIndex('item', 'item', { unique: false });
      }

      // Photos store (stores photo metadata and blob references)
      if (!db.objectStoreNames.contains(STORES.PHOTOS)) {
        const photoStore = db.createObjectStore(STORES.PHOTOS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        photoStore.createIndex('inspectionId', 'inspectionId', { unique: false });
        photoStore.createIndex('type', 'type', { unique: false }); // registration, visual, machine
      }

      // Sync Queue store (for offline sync)
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        syncStore.createIndex('inspectionId', 'inspectionId', { unique: false });
        syncStore.createIndex('status', 'status', { unique: false }); // pending, syncing, synced, failed
        syncStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

/**
 * Get database instance
 */
const getDB = async () => {
  if (!dbInstance) {
    await initDB();
  }
  return dbInstance;
};

/**
 * Save complete inspection with all results and photos
 */
export const saveInspection = async (inspectionData) => {
  const db = await getDB();
  const transaction = db.transaction([STORES.INSPECTIONS, STORES.MACHINE_RESULTS, STORES.VISUAL_RESULTS, STORES.PHOTOS, STORES.SYNC_QUEUE], 'readwrite');

  try {
    // Prepare inspection record
    const inspection = {
      id: inspectionData.id || `VIS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      vehicle: {
        plateNumber: inspectionData.vehicle?.plateNumber || inspectionData.vehicle?.plate,
        vin: inspectionData.vehicle?.vin || inspectionData.vehicle?.chassisNumber,
        make: inspectionData.vehicle?.make || inspectionData.vehicle?.brandModel?.split(' ')[0],
        model: inspectionData.vehicle?.model || inspectionData.vehicle?.brandModel?.split(' ').slice(1).join(' '),
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
      status: inspectionData.status || 'Pending', // Passed, Failed, Pending, Conditional
      overallResult: inspectionData.overallResult || inspectionData.status,
      syncStatus: 'pending', // pending, syncing, synced, failed
      type: inspectionData.type || 'Initial Inspection', // Initial, Retest, Re-inspection
      amount: inspectionData.amount || 0,
      inspectionDate: inspectionData.inspectionDate || new Date().toISOString(),
      inspectionDateStart: inspectionData.inspectionDateStart,
      inspectionDateEnd: inspectionData.inspectionDateEnd,
      cycleTimeSeconds: inspectionData.cycleTimeSeconds,
      latitude: inspectionData.latitude,
      longitude: inspectionData.longitude,
      geoFenceStatus: inspectionData.geoFenceStatus || 'Unknown',
      distanceMeters: inspectionData.distanceMeters,
      locationSource: inspectionData.locationSource,
      locationConfidence: inspectionData.locationConfidence,
      certificateNumber: inspectionData.certificateNumber,
      certificateIssueDate: inspectionData.certificateIssueDate,
      certificateExpiryDate: inspectionData.certificateExpiryDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save inspection
    await transaction.objectStore(STORES.INSPECTIONS).put(inspection);

    // Save machine results
    if (inspectionData.machineResults && Array.isArray(inspectionData.machineResults)) {
      for (const result of inspectionData.machineResults) {
        const machineResult = {
          id: result.id || `MR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          inspectionId: inspection.id,
          test: result.test || result.name,
          testType: result.testType, // Brake, Emissions, Suspension, Headlights, Alignment
          value: result.value || result.val,
          unit: result.unit || '%',
          status: result.status, // Pass, Fail
          threshold: result.threshold,
          minValue: result.minValue,
          maxValue: result.maxValue,
          timestamp: result.timestamp || new Date().toISOString(),
          machineId: result.machineId,
          machineSerial: result.machineSerial,
          createdAt: new Date().toISOString(),
        };
        await transaction.objectStore(STORES.MACHINE_RESULTS).put(machineResult);
      }
    }

    // Save visual results
    if (inspectionData.visualResults && Array.isArray(inspectionData.visualResults)) {
      for (const result of inspectionData.visualResults) {
        const visualResult = {
          id: result.id || `VR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          inspectionId: inspection.id,
          item: result.item || result.name,
          category: result.category, // Exterior, Lights, Tires, Interior, Documents
          status: result.status, // Pass, Fail, Not Applicable
          severity: result.severity, // Info, Minor, Major, Critical
          notes: result.notes,
          photoId: result.photoId,
          timestamp: result.timestamp || new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        await transaction.objectStore(STORES.VISUAL_RESULTS).put(visualResult);
      }
    }

    // Save photos
    if (inspectionData.photos && typeof inspectionData.photos === 'object') {
      // Handle registration photos
      if (inspectionData.photos.registration) {
        const dataUrl = await convertToDataUrl(inspectionData.photos.registration);
        const photoId = `PHOTO-${inspection.id}-registration-${Date.now()}`;
        // Store photo with data URL
        await transaction.objectStore(STORES.PHOTOS).put({
          id: photoId,
          inspectionId: inspection.id,
          type: 'registration',
          category: 'registration',
          filename: `registration-${inspection.id}.jpg`,
          dataUrl: dataUrl,
          mimeType: 'image/jpeg',
          createdAt: new Date().toISOString(),
        });
      }

      // Handle visual inspection photos (array)
      if (Array.isArray(inspectionData.photos.inspection)) {
        for (let i = 0; i < inspectionData.photos.inspection.length; i++) {
          const photo = inspectionData.photos.inspection[i];
          const dataUrl = await convertToDataUrl(photo);
          const photoId = `PHOTO-${inspection.id}-visual-${i}-${Date.now()}`;
          await transaction.objectStore(STORES.PHOTOS).put({
            id: photoId,
            inspectionId: inspection.id,
            type: 'visual',
            category: photo.category || 'inspection',
            item: photo.item,
            filename: `visual-${inspection.id}-${i}.jpg`,
            dataUrl: dataUrl,
            mimeType: 'image/jpeg',
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Handle machine test photos (array)
      if (Array.isArray(inspectionData.photos.machineTest)) {
        for (let i = 0; i < inspectionData.photos.machineTest.length; i++) {
          const photo = inspectionData.photos.machineTest[i];
          const dataUrl = await convertToDataUrl(photo);
          const photoId = `PHOTO-${inspection.id}-machine-${i}-${Date.now()}`;
          await transaction.objectStore(STORES.PHOTOS).put({
            id: photoId,
            inspectionId: inspection.id,
            type: 'machine',
            category: photo.category || 'machine_test',
            test: photo.test,
            filename: `machine-${inspection.id}-${i}.jpg`,
            dataUrl: dataUrl,
            mimeType: 'image/jpeg',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // Add to sync queue
    await transaction.objectStore(STORES.SYNC_QUEUE).put({
      id: `SYNC-${inspection.id}`,
      inspectionId: inspection.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });

    await transaction.complete;
    return inspection;
  } catch (error) {
    console.error('Error saving inspection:', error);
    throw error;
  }
};

/**
 * Convert various photo formats to Data URL
 */
const convertToDataUrl = async (photo) => {
  if (typeof photo === 'string') {
    // Already a data URL
    if (photo.startsWith('data:')) {
      return photo;
    }
    // URL - fetch and convert
    const response = await fetch(photo);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  if (photo instanceof Blob || photo instanceof File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(photo);
    });
  }
  throw new Error('Unsupported photo format');
};

/**
 * Get inspection by ID with all related data
 */
export const getInspection = async (inspectionId) => {
  const db = await getDB();
  const transaction = db.transaction([STORES.INSPECTIONS, STORES.MACHINE_RESULTS, STORES.VISUAL_RESULTS, STORES.PHOTOS], 'readonly');

  const inspection = await transaction.objectStore(STORES.INSPECTIONS).get(inspectionId);
  if (!inspection) {
    return null;
  }

  // Get machine results
  const machineIndex = transaction.objectStore(STORES.MACHINE_RESULTS).index('inspectionId');
  const machineResults = await getAllFromIndex(machineIndex, inspectionId);

  // Get visual results
  const visualIndex = transaction.objectStore(STORES.VISUAL_RESULTS).index('inspectionId');
  const visualResults = await getAllFromIndex(visualIndex, inspectionId);

  // Get photos
  const photoIndex = transaction.objectStore(STORES.PHOTOS).index('inspectionId');
  const photos = await getAllFromIndex(photoIndex, inspectionId);

  return {
    ...inspection,
    machineResults,
    visualResults,
    photos,
  };
};

/**
 * Get all inspections with filters
 */
export const getInspections = async (filters = {}) => {
  const db = await getDB();
  const transaction = db.transaction([STORES.INSPECTIONS], 'readonly');
  const store = transaction.objectStore(STORES.INSPECTIONS);
  
  let index = store;
  if (filters.plateNumber) {
    index = store.index('plateNumber');
  } else if (filters.status) {
    index = store.index('status');
  } else if (filters.inspectionDate) {
    index = store.index('inspectionDate');
  }

  const inspections = await getAllFromStore(index, filters);
  return inspections;
};

/**
 * Get photos for an inspection ID
 */
export const getInspectionPhotos = async (inspectionId) => {
  const db = await getDB();
  const transaction = db.transaction([STORES.PHOTOS], 'readonly');
  const photoIndex = transaction.objectStore(STORES.PHOTOS).index('inspectionId');
  const photos = await getAllFromIndex(photoIndex, inspectionId);
  
  // Organize photos by type
  const organized = {
    registration: null,
    inspection: [],
    machineTest: [],
  };
  
  photos.forEach((photo) => {
    if (photo.type === 'registration') {
      organized.registration = photo;
    } else if (photo.type === 'visual') {
      organized.inspection.push(photo);
    } else if (photo.type === 'machine') {
      organized.machineTest.push(photo);
    }
  });
  
  return organized;
};

/**
 * Search inspections by query (plate, chassis, owner, etc.)
 * Refined logic: 
 * - If query looks like plate/chassis (contains numbers), search by plate and chassis
 * - If query looks like owner name (text only), search by owner name
 */
export const searchInspections = async (query) => {
  if (!query || !query.trim()) return [];
  
  try {
    const db = await getDB();
    if (!db) {
      console.error('Database not initialized');
      return [];
    }
    
    const transaction = db.transaction([STORES.INSPECTIONS], 'readonly');
    const store = transaction.objectStore(STORES.INSPECTIONS);
    
    const q = query.toLowerCase().trim();
    const hasNumbers = /\d/.test(q); // Check if query contains numbers
    
    const inspections = await getAllFromStore(store, {});
    
    if (!inspections || inspections.length === 0) {
      console.log('No inspections found in database');
      return [];
    }
    
    const filtered = inspections.filter((inspection) => {
      if (!inspection || !inspection.vehicle) {
        return false;
      }
      
      const plate = (inspection.vehicle?.plateNumber || '').toLowerCase();
      const chassis = (inspection.vehicle?.vin || '').toLowerCase();
      const owner = (inspection.vehicle?.owner?.name || '').toLowerCase();
      
      // If query contains numbers, search by plate and chassis only
      if (hasNumbers) {
        return plate.includes(q) || chassis.includes(q);
      }
      // If query is text only, search by owner name
      else {
        return owner.includes(q);
      }
    });
    
    return filtered;
  } catch (error) {
    console.error('Error in searchInspections:', error);
    return [];
  }
};

/**
 * Helper to get all records from an index
 */
const getAllFromIndex = (index, key) => {
  return new Promise((resolve, reject) => {
    const request = index.getAll(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Helper to get all records from a store with filters
 */
const getAllFromStore = (store, filters) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const record = cursor.value;
        let matches = true;

        if (filters.plateNumber && record.vehicle?.plateNumber !== filters.plateNumber) {
          matches = false;
        }
        if (filters.status && record.status !== filters.status) {
          matches = false;
        }
        if (filters.centerId && record.centerId !== filters.centerId) {
          matches = false;
        }
        if (filters.dateFrom && new Date(record.inspectionDate) < new Date(filters.dateFrom)) {
          matches = false;
        }
        if (filters.dateTo && new Date(record.inspectionDate) > new Date(filters.dateTo)) {
          matches = false;
        }

        if (matches) {
          results.push(record);
        }

        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
};

/**
 * Update inspection sync status
 */
export const updateSyncStatus = async (inspectionId, status, error = null) => {
  const db = await getDB();
  const transaction = db.transaction([STORES.INSPECTIONS, STORES.SYNC_QUEUE], 'readwrite');

  // Update inspection
  const inspection = await transaction.objectStore(STORES.INSPECTIONS).get(inspectionId);
  if (inspection) {
    inspection.syncStatus = status;
    inspection.updatedAt = new Date().toISOString();
    await transaction.objectStore(STORES.INSPECTIONS).put(inspection);
  }

  // Update sync queue
  const syncRecord = await transaction.objectStore(STORES.SYNC_QUEUE).get(`SYNC-${inspectionId}`);
  if (syncRecord) {
    syncRecord.status = status;
    syncRecord.updatedAt = new Date().toISOString();
    if (error) {
      syncRecord.error = error.message;
      syncRecord.retryCount = (syncRecord.retryCount || 0) + 1;
    }
    await transaction.objectStore(STORES.SYNC_QUEUE).put(syncRecord);
  }

  await transaction.complete;
};

/**
 * Get pending sync items
 */
export const getPendingSyncItems = async () => {
  const db = await getDB();
  const transaction = db.transaction([STORES.SYNC_QUEUE, STORES.INSPECTIONS], 'readonly');
  
  const syncIndex = transaction.objectStore(STORES.SYNC_QUEUE).index('status');
  const pendingItems = await getAllFromIndex(syncIndex, 'pending');

  // Get full inspection data for each pending item
  const inspections = [];
  for (const item of pendingItems) {
    const inspection = await getInspection(item.inspectionId);
    if (inspection) {
      inspections.push(inspection);
    }
  }

  return inspections;
};

/**
 * Delete inspection (soft delete by updating status)
 */
export const deleteInspection = async (inspectionId) => {
  const db = await getDB();
  const transaction = db.transaction([STORES.INSPECTIONS], 'readwrite');
  
  const inspection = await transaction.objectStore(STORES.INSPECTIONS).get(inspectionId);
  if (inspection) {
    inspection.status = 'Deleted';
    inspection.deletedAt = new Date().toISOString();
    await transaction.objectStore(STORES.INSPECTIONS).put(inspection);
  }
  
  await transaction.complete;
};

/**
 * Migrate mock inspections from dashboard to database
 * This function converts mock inspection data to the database format
 */
export const migrateMockInspections = async (mockInspections) => {
  try {
    const db = await getDB();
    if (!db) {
      console.error('Database not initialized');
      return;
    }

    const transaction = db.transaction([STORES.INSPECTIONS], 'readwrite');
    const store = transaction.objectStore(STORES.INSPECTIONS);

    // Generate owner names based on plate numbers for demo
    const generateOwnerName = (plate) => {
      const names = [
        'Kebede Alemu', 'Sara Bekele', 'Dawit Haile', 'Abebe Kebede', 
        'Sara Tesfaye', 'Tewodros Mekonnen', 'Meron Assefa', 'Yonas Tadesse',
        'Hanna Girma', 'Solomon Getachew', 'Marta Yohannes', 'Daniel Fikru'
      ];
      const index = parseInt(plate.replace(/\D/g, '')) % names.length;
      return names[index];
    };

    // Generate chassis numbers for demo
    const generateChassis = (plate) => {
      const num = plate.replace(/\D/g, '').padStart(12, '0');
      return `WDB${num}${plate.slice(-1).charCodeAt(0)}`;
    };

    for (const mock of mockInspections) {
      // Check if inspection already exists
      const existing = await new Promise((resolve) => {
        const request = store.get(mock.id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });

      if (existing) {
        continue; // Skip if already exists
      }

      const inspection = {
        id: mock.id,
        vehicle: {
          plateNumber: mock.plate,
          vin: generateChassis(mock.plate),
          make: mock.vehicleType.split(' ')[0] || 'Unknown',
          model: mock.vehicleType.split(' ').slice(1).join(' ') || 'Unknown',
          year: new Date().getFullYear() - Math.floor(Math.random() * 10),
          owner: {
            name: generateOwnerName(mock.plate),
            phone: `09${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
            idNumber: `ID${Math.floor(Math.random() * 1000000)}`,
          },
          vehicleType: mock.vehicleType,
          category: mock.vehicleType,
        },
        inspectorId: mock.technician,
        inspectorName: mock.technician,
        centerId: mock.center?.split(' / ')[0] || 'Addis Ababa',
        centerName: mock.center || 'Addis Ababa / Lane 1',
        status: mock.result === 'PASS' ? 'Passed' : 'Failed',
        overallResult: mock.result,
        syncStatus: mock.syncStatus?.toLowerCase() || 'synced',
        type: 'Initial Inspection',
        amount: 0,
        inspectionDate: new Date(mock.dateTime).toISOString(),
        inspectionDateStart: new Date(mock.dateTime).toISOString(),
        inspectionDateEnd: new Date(new Date(mock.dateTime).getTime() + 30 * 60000).toISOString(),
        cycleTimeSeconds: 30 * 60,
        createdAt: new Date(mock.dateTime).toISOString(),
        updatedAt: new Date(mock.dateTime).toISOString(),
      };

      await store.put(inspection);
    }

    await transaction.complete;
    console.log(`Migrated ${mockInspections.length} mock inspections to database`);
  } catch (error) {
    console.error('Error migrating mock inspections:', error);
  }
};

// Initialize database on module load
initDB().catch(console.error);











