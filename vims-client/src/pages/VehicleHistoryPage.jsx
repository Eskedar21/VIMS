import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchInspections, getPhotosByInspectionId } from '../utils/photoStorage';

const VehicleHistoryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [viewingPhotos, setViewingPhotos] = useState(null);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    const results = searchInspections(searchQuery);
    setSearchResults(results);
    setSelectedInspection(null);
    setViewingPhotos(null);
  };

  const handleViewPhotos = (inspectionId) => {
    const photos = getPhotosByInspectionId(inspectionId);
    console.log('Loading photos for inspection:', inspectionId, photos);
    if (photos) {
      console.log('Photo counts:', {
        registration: photos.photos?.registration ? 1 : 0,
        inspection: photos.photos?.inspection?.length || 0,
        machineTest: photos.photos?.machineTest?.length || 0
      });
    }
    setViewingPhotos(photos);
    setSelectedInspection(inspectionId);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Vehicle History</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-sm text-gray-600 mb-4">Search by Plate Number, Chassis Number, or Owner Name</p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Plate, Chassis, or Owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#009639]/20"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-[#009639] text-white rounded-xl font-medium hover:bg-[#007c2d] transition"
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
                      Plate: {searchResults[0].plateNumber} • Owner: {searchResults[0].ownerName}
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
                    {searchResults.map((row) => {
                      const photos = getPhotosByInspectionId(row.inspectionId);
                      const hasPhotos = photos && (
                        photos.photos?.registration ||
                        (photos.photos?.inspection && photos.photos.inspection.length > 0) ||
                        (photos.photos?.machineTest && photos.photos.machineTest.length > 0)
                      );
                      
                      // Count total photos
                      let photoCount = 0;
                      if (photos?.photos) {
                        if (photos.photos.registration) photoCount += 1;
                        if (photos.photos.inspection) photoCount += photos.photos.inspection.length;
                        if (photos.photos.machineTest) photoCount += photos.photos.machineTest.length;
                      }
                      
                      return (
                        <tr key={row.inspectionId} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(row.testStartTime || row.savedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#009639]">{row.inspectionId}</td>
                          <td className="px-4 py-3 font-semibold">{row.plateNumber || '—'}</td>
                          <td className="px-4 py-3">{row.ownerName || '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {hasPhotos && (
                                <button
                                  onClick={() => handleViewPhotos(row.inspectionId)}
                                  className="text-xs text-[#009639] hover:underline font-medium flex items-center gap-1.5 px-2 py-1 rounded bg-[#009639]/10 hover:bg-[#009639]/20"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                  </svg>
                                  View {photoCount} Photo{photoCount !== 1 ? 's' : ''}
                                </button>
                              )}
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
                      <div className="space-y-6">
                        {/* Registration Photo */}
                        {viewingPhotos.photos?.registration && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">1</span>
                              Registration Photo
                            </h3>
                            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/50">
                              <img
                                src={viewingPhotos.photos.registration.dataUrl}
                                alt="Registration"
                                className="w-full max-w-2xl mx-auto rounded-md border-2 border-blue-200 mb-3"
                              />
                              <div className="text-xs space-y-1 text-gray-600">
                                <p>
                                  <span className="font-semibold">Time:</span>{' '}
                                  {new Date(viewingPhotos.photos.registration.timestamp).toLocaleString()}
                                </p>
                                {viewingPhotos.photos.registration.coords && (
                                  <p>
                                    <span className="font-semibold">Location:</span>{' '}
                                    {viewingPhotos.photos.registration.coords.lat.toFixed(6)}, {viewingPhotos.photos.registration.coords.lng.toFixed(6)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Inspection Photos */}
                        {viewingPhotos.photos?.inspection && viewingPhotos.photos.inspection.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                                {viewingPhotos.photos.inspection.length}
                              </span>
                              Inspection Photos
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {viewingPhotos.photos.inspection.map((photo, idx) => (
                                <div key={photo.id} className="border-2 border-green-200 rounded-lg p-3 bg-green-50/50">
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-bold text-green-700">Photo #{idx + 1}</span>
                                  </div>
                                  <img
                                    src={photo.dataUrl}
                                    alt={`Inspection ${idx + 1}`}
                                    className="w-full h-48 object-cover rounded-md border-2 border-green-200 mb-2"
                                  />
                                  <div className="text-xs space-y-0.5 text-gray-600">
                                    <p>{new Date(photo.timestamp).toLocaleString()}</p>
                                    {photo.coords && (
                                      <p className="font-mono text-[10px]">
                                        {photo.coords.lat.toFixed(6)}, {photo.coords.lng.toFixed(6)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Machine Test Photos */}
                        {viewingPhotos.photos?.machineTest && viewingPhotos.photos.machineTest.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                                {viewingPhotos.photos.machineTest.length}
                              </span>
                              Machine Test Photos
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {viewingPhotos.photos.machineTest.map((photo, idx) => (
                                <div key={photo.id} className="border-2 border-purple-200 rounded-lg p-3 bg-purple-50/50">
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-bold text-purple-700">Photo #{idx + 1}</span>
                                  </div>
                                  <img
                                    src={photo.dataUrl}
                                    alt={`Machine test ${idx + 1}`}
                                    className="w-full h-48 object-cover rounded-md border-2 border-purple-200 mb-2"
                                  />
                                  <div className="text-xs space-y-0.5 text-gray-600">
                                    <p>{new Date(photo.timestamp).toLocaleString()}</p>
                                    {photo.coords && (
                                      <p className="font-mono text-[10px]">
                                        {photo.coords.lat.toFixed(6)}, {photo.coords.lng.toFixed(6)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(!viewingPhotos.photos?.registration &&
                          (!viewingPhotos.photos?.inspection || viewingPhotos.photos.inspection.length === 0) &&
                          (!viewingPhotos.photos?.machineTest || viewingPhotos.photos.machineTest.length === 0)) && (
                          <div className="text-center py-8 text-gray-500">
                            No photos available for this inspection
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

