import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchInspections, getInspectionPhotos, migrateMockInspections } from '../db/inspectionDB';

// Mock inspections from dashboard to migrate
const MOCK_INSPECTIONS = [
  { id: 'VIS-2025-0023', dateTime: '2025-11-26 09:45', plate: 'ET 12345A', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', syncStatus: 'Synced' },
  { id: 'VIS-2025-0022', dateTime: '2025-11-26 09:12', plate: 'ET 87923B', vehicleType: 'Mini Bus', center: 'Addis Ababa / Lane 2', technician: 'Sara Tesfaye', result: 'FAIL', syncStatus: 'Synced' },
  { id: 'VIS-2025-0021', dateTime: '2025-11-26 08:55', plate: 'ET 29487C', vehicleType: 'Cargo Truck', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', syncStatus: 'Pending' },
  { id: 'VIS-2025-0020', dateTime: '2025-11-25 16:30', plate: 'ET 85216Z', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 3', technician: 'Dawit Haile', result: 'PASS', syncStatus: 'Synced' },
  { id: 'VIS-2025-0019', dateTime: '2025-11-25 15:20', plate: 'ET 44821D', vehicleType: 'Motorcycle', center: 'Addis Ababa / Lane 2', technician: 'Sara Tesfaye', result: 'PASS', syncStatus: 'Synced' },
  { id: 'VIS-2025-0018', dateTime: '2025-11-25 14:10', plate: 'ET 99123E', vehicleType: 'Mini Bus', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'FAIL', syncStatus: 'Failed' },
  { id: 'VIS-2025-0017', dateTime: '2025-11-24 11:45', plate: 'ET 77654F', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 3', technician: 'Dawit Haile', result: 'PASS', syncStatus: 'Synced' },
  { id: 'VIS-2025-0016', dateTime: '2025-11-24 10:30', plate: 'ET 33987G', vehicleType: 'Cargo Truck', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', syncStatus: 'Synced' },
  { id: 'VIS-2025-0015', dateTime: '2025-11-23 16:20', plate: 'ET 11223H', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 2', technician: 'Sara Tesfaye', result: 'PASS', syncStatus: 'Synced' },
  { id: 'VIS-2025-0014', dateTime: '2025-11-23 15:00', plate: 'ET 44556I', vehicleType: 'Mini Bus', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', syncStatus: 'Synced' },
  { id: 'VIS-2025-0013', dateTime: '2025-11-23 14:30', plate: 'ET 77889J', vehicleType: 'Cargo Truck', center: 'Addis Ababa / Lane 3', technician: 'Dawit Haile', result: 'FAIL', syncStatus: 'Synced' },
  { id: 'VIS-2025-0012', dateTime: '2025-11-22 11:15', plate: 'ET 99001K', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 2', technician: 'Sara Tesfaye', result: 'PASS', syncStatus: 'Synced' },
  { id: 'VIS-2025-0011', dateTime: '2025-11-22 10:00', plate: 'ET 22334L', vehicleType: 'Motorcycle', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', syncStatus: 'Synced' },
  { id: 'VIS-2025-0010', dateTime: '2025-11-21 16:45', plate: 'ET 55667M', vehicleType: 'Passenger Car', center: 'Addis Ababa / Lane 3', technician: 'Dawit Haile', result: 'PASS', syncStatus: 'Synced' },
  { id: 'VIS-2025-0009', dateTime: '2025-11-21 15:30', plate: 'ET 88990N', vehicleType: 'Mini Bus', center: 'Addis Ababa / Lane 2', technician: 'Sara Tesfaye', result: 'FAIL', syncStatus: 'Synced' },
  { id: 'VIS-2025-0008', dateTime: '2025-11-20 14:20', plate: 'ET 11122O', vehicleType: 'Cargo Truck', center: 'Addis Ababa / Lane 1', technician: 'Abebe Kebede', result: 'PASS', syncStatus: 'Synced' },
];

const VehicleHistoryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [viewingPhotos, setViewingPhotos] = useState(null);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Migrate mock inspections on component mount
  useEffect(() => {
    migrateMockInspections(MOCK_INSPECTIONS).catch(console.error);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    setHasSearched(true);
    setShowSuggestions(false);
    try {
      const results = await searchInspections(searchQuery);
      setSearchResults(results);
      setSelectedInspection(null);
      setViewingPhotos(null);
    } catch (error) {
      console.error('Error searching inspections:', error);
      setSearchResults([]);
    }
  };

  const handleSelectSuggestion = (inspection) => {
    setSearchQuery(
      `${inspection.vehicle?.plateNumber || ''} - ${inspection.vehicle?.owner?.name || ''}`
    );
    setShowSuggestions(false);
    setHasSearched(true);
    setSearchResults([inspection]);
    setSelectedInspection(null);
    setViewingPhotos(null);
  };

  // Auto-search as user types (with debounce) - shows suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      setSearchResults([]);
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchInspections(searchQuery);
        setSuggestions(results.slice(0, 10)); // Show max 10 suggestions
        setShowSuggestions(true);
        setIsSearching(false);
      } catch (error) {
        console.error('Error searching inspections:', error);
        setSuggestions([]);
        setIsSearching(false);
      }
    }, 200); // 200ms debounce for faster suggestions

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleViewPhotos = async (inspectionId, inspection) => {
    setLoadingPhotos(true);
    try {
      const photos = await getInspectionPhotos(inspectionId);
      setViewingPhotos({
        inspectionId,
        vehicleData: {
          plateNumber: inspection?.vehicle?.plateNumber,
          ownerName: inspection?.vehicle?.owner?.name,
        },
        photos: {
          registration: photos.registration?.dataUrl || null,
          inspection: photos.inspection.map(p => ({
            id: p.id,
            dataUrl: p.dataUrl,
            category: p.category,
            item: p.item,
            timestamp: p.createdAt,
          })),
          machineTest: photos.machineTest.map(p => ({
            id: p.id,
            dataUrl: p.dataUrl,
            category: p.category,
            test: p.test,
            timestamp: p.createdAt,
          })),
        },
      });
      setSelectedInspection(inspectionId);
    } catch (error) {
      console.error('Error loading photos:', error);
      alert('Failed to load photos');
    } finally {
      setLoadingPhotos(false);
    }
  };


  // Collect all photos as generic evidence
  const getAllEvidencePhotos = useMemo(() => {
    if (!viewingPhotos?.photos) return [];
    
    const evidence = [];
    
    // Add registration photo (now a dataUrl string)
    if (viewingPhotos.photos.registration) {
      evidence.push({
        id: 'registration',
        dataUrl: viewingPhotos.photos.registration,
        category: 'Registration',
        type: 'registration',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Add inspection photos
    if (viewingPhotos.photos.inspection && viewingPhotos.photos.inspection.length > 0) {
      viewingPhotos.photos.inspection.forEach((photo, idx) => {
        evidence.push({
          ...photo,
          category: photo.category || 'Inspection Evidence',
          type: 'inspection',
          index: idx + 1,
        });
      });
    }
    
    // Add machine test photos
    if (viewingPhotos.photos.machineTest && viewingPhotos.photos.machineTest.length > 0) {
      viewingPhotos.photos.machineTest.forEach((photo, idx) => {
        evidence.push({
          ...photo,
          category: 'Machine Test',
          type: 'machineTest',
          index: idx + 1,
        });
      });
    }
    
    return evidence;
  }, [viewingPhotos]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Vehicle History</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-sm text-gray-600 mb-4">
          Search by <strong>Plate Number</strong> or <strong>Chassis Number</strong> (numbers) • 
          Or search by <strong>Owner Name</strong> (text)
        </p>
        <div className="relative flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type plate/chassis (numbers) or owner name (text)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow click events
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                  setShowSuggestions(false);
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false);
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#88bf47]/20"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim() && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-[#88bf47] mr-2"></div>
                    Searching...
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-600">
                        {suggestions.length} {suggestions.length === 1 ? 'inspection' : 'inspections'} found
                      </p>
                    </div>
                    <div className="py-1">
                      {suggestions.map((inspection) => (
                        <div
                          key={inspection.id}
                          onClick={() => handleSelectSuggestion(inspection)}
                          className="px-4 py-3 hover:bg-[#88bf47]/10 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 text-sm">
                                  {inspection.vehicle?.plateNumber || 'No Plate'}
                                </span>
                                <span className="px-2 py-0.5 bg-[#88bf47]/10 text-[#88bf47] rounded text-xs font-medium">
                                  {inspection.status || 'Pending'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 space-y-0.5">
                                {/\d/.test(searchQuery) ? (
                                  <>
                                    <p>
                                      <span className="font-medium">Owner:</span> {inspection.vehicle?.owner?.name || '—'}
                                    </p>
                                    <p>
                                      <span className="font-medium">Chassis:</span> {inspection.vehicle?.vin || '—'}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p>
                                      <span className="font-medium">Plate:</span> {inspection.vehicle?.plateNumber || '—'}
                                    </p>
                                    <p>
                                      <span className="font-medium">Chassis:</span> {inspection.vehicle?.vin || '—'}
                                    </p>
                                  </>
                                )}
                                <p className="text-gray-500">
                                  {new Date(inspection.inspectionDate || inspection.createdAt).toLocaleDateString()} • ID: {inspection.id}
                                </p>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                      {suggestions.length >= 10 && (
                        <div className="px-4 py-2 text-center border-t border-gray-100 bg-gray-50">
                          <button
                            onClick={handleSearch}
                            className="text-xs text-[#88bf47] font-semibold hover:underline"
                          >
                            View all results →
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No inspections found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-[#88bf47] text-white rounded-xl font-medium hover:bg-[#0fa84a] transition whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      {hasSearched && (
        <div className="space-y-4">
          {searchResults.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
              No inspection history found for "{searchQuery}"
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">
                    Inspection History ({searchResults.length} found)
                  </h2>
                  {searchResults[0] && (
                    <p className="text-sm text-gray-500 mt-1">
                      Plate: {searchResults[0].vehicle?.plateNumber} • Owner: {searchResults[0].vehicle?.owner?.name}
                    </p>
                  )}
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Inspection ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plate Number</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Owner</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((inspection) => {
                      return (
                        <tr key={inspection.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(inspection.inspectionDate || inspection.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#88bf47]">{inspection.id}</td>
                          <td className="px-4 py-3 font-semibold">{inspection.vehicle?.plateNumber || '—'}</td>
                          <td className="px-4 py-3">{inspection.vehicle?.owner?.name || '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewPhotos(inspection.id, inspection)}
                                disabled={loadingPhotos}
                                className="text-xs text-[#88bf47] hover:underline font-medium flex items-center gap-1.5 px-2 py-1 rounded bg-[#88bf47]/10 hover:bg-[#88bf47]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                  <circle cx="12" cy="13" r="4" />
                                </svg>
                                {loadingPhotos ? 'Loading...' : 'View Photos'}
                              </button>
                              <button
                                onClick={() => navigate('/result')}
                                className="text-xs text-gray-600 hover:underline font-medium"
                              >
                                View Report
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Photo Gallery Modal */}
              {viewingPhotos && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Inspection Photos</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {viewingPhotos.vehicleData?.plateNumber} • {viewingPhotos.vehicleData?.ownerName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Inspection ID: {viewingPhotos.inspectionId}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {viewingPhotos.photos?.registration && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              1 Registration
                            </span>
                          )}
                          {viewingPhotos.photos?.inspection && viewingPhotos.photos.inspection.length > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              {viewingPhotos.photos.inspection.length} Inspection
                            </span>
                          )}
                          {viewingPhotos.photos?.machineTest && viewingPhotos.photos.machineTest.length > 0 && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                              {viewingPhotos.photos.machineTest.length} Machine Test
                            </span>
                          )}
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                            Total: {[
                              viewingPhotos.photos?.registration ? 1 : 0,
                              viewingPhotos.photos?.inspection?.length || 0,
                              viewingPhotos.photos?.machineTest?.length || 0
                            ].reduce((a, b) => a + b, 0)} Photos
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setViewingPhotos(null);
                          setSelectedInspection(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-gray-900">Inspection Photos</h3>
                          <p className="text-xs text-gray-500 mt-1">All images captured during this inspection</p>
                        </div>

                        {/* Generic Evidence Gallery */}
                        {getAllEvidencePhotos.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getAllEvidencePhotos.map((photo, idx) => {
                              const getCategoryColor = (type) => {
                                if (type === 'registration') return 'border-blue-200 bg-blue-50/50 text-blue-700';
                                if (type === 'machineTest') return 'border-purple-200 bg-purple-50/50 text-purple-700';
                                return 'border-[#88bf47] bg-green-50/50 text-[#0fa84a]';
                              };
                              
                              const categoryColor = getCategoryColor(photo.type);
                              
                              return (
                                <div key={photo.id || idx} className={`border-2 rounded-lg p-3 ${categoryColor.split(' ')[0]} ${categoryColor.split(' ')[1]}`}>
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className={`text-xs font-bold ${categoryColor.split(' ')[2]}`}>
                                      {photo.category} {photo.index ? `#${photo.index}` : ''}
                                      {photo.item && ` - ${photo.item}`}
                                      {photo.test && ` - ${photo.test}`}
                                    </span>
                                  </div>
                                  <img
                                    src={photo.dataUrl}
                                    alt={`Inspection Photo ${idx + 1}`}
                                    className="w-full h-48 object-cover rounded-md border-2 mb-2 cursor-pointer hover:opacity-90 transition"
                                    onClick={() => {
                                      // Open full size image in new window
                                      const newWindow = window.open();
                                      if (newWindow) {
                                        newWindow.document.write(`
                                          <html>
                                            <head><title>Inspection Photo</title></head>
                                            <body style="margin:0;padding:20px;background:#f5f5f5;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                                              <img src="${photo.dataUrl}" style="max-width:100%;max-height:90vh;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />
                                            </body>
                                          </html>
                                        `);
                                      }
                                    }}
                                  />
                                  <div className="text-xs space-y-0.5 text-gray-600">
                                    <p className="font-medium">{new Date(photo.timestamp || photo.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-3 text-gray-300">
                              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                            <p className="text-sm font-medium mb-1">No photos available for this inspection</p>
                            <p className="text-xs">Photos captured during inspection will appear here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleHistoryPage;

