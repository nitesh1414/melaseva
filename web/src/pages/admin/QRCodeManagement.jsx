import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qrCodeAPI, assetAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiBox, FiPrinter, FiLink, FiCheck, FiEdit2, FiMapPin, FiX, FiCpu } from 'react-icons/fi';
import { QRCodeCanvas } from 'qrcode.react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) { onLocationSelect(e.latlng); },
  });
  return null;
}

export default function QRCodeManagement() {
  const user = useAuthStore((state) => state.user);
  const eventId = user?.event?._id || user?.event;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('generate');
  const [previewQR, setPreviewQR] = useState(null);
  const [search, setSearch] = useState('');
  const [bindFilter, setBindFilter] = useState('');

  // === GENERATE: Just pole number ===
  const [poleNumber, setPoleNumber] = useState('');

  // === UPDATE: Add GPS/info after generation ===
  const [updateModal, setUpdateModal] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    poleNumber: '', latitude: '', longitude: '', gpsAccuracy: '',
    road: '', sector: '', zone: '', address: '',
  });
  const [useManualGPS, setUseManualGPS] = useState(false);
  const [capturingGPS, setCapturingGPS] = useState(false);

  // === BIND ===
  const [bindModal, setBindModal] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState('');

  // Fetch QR codes
  const { data: qrData, isLoading: qrLoading } = useQuery({
    queryKey: ['qrCodes', eventId, bindFilter, search],
    queryFn: () => qrCodeAPI.list({ event: eventId, bindingStatus: bindFilter, limit: 200, search }).then(res => res.data),
    enabled: !!eventId,
  });

  // Fetch assets for binding
  const { data: assetsData } = useQuery({
    queryKey: ['assetsForBind', eventId],
    queryFn: () => assetAPI.list({ event: eventId, limit: 500 }).then(res => res.data),
    enabled: !!eventId && (activeTab === 'bind' || !!bindModal),
  });

  // Mutations
  const generateMutation = useMutation({
    mutationFn: (data) => qrCodeAPI.generate(data),
    onSuccess: (res) => {
      toast.success(`✅ QR generated: Pole #${res.data.data.poleNumber}`);
      setPreviewQR(res.data.data);
      setPoleNumber('');
      queryClient.invalidateQueries(['qrCodes', eventId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to generate QR'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => qrCodeAPI.update(id, data),
    onSuccess: () => {
      toast.success('QR code updated with new information');
      setUpdateModal(null);
      queryClient.invalidateQueries(['qrCodes', eventId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const bindMutation = useMutation({
    mutationFn: ({ id, assetId }) => qrCodeAPI.bind(id, { assetId }),
    onSuccess: () => {
      toast.success('QR bound to asset');
      setBindModal(null);
      setSelectedAssetId('');
      queryClient.invalidateQueries(['qrCodes', eventId]);
      queryClient.invalidateQueries(['assetsForBind', eventId]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to bind'),
  });

  const installMutation = useMutation({
    mutationFn: (id) => qrCodeAPI.markInstalled(id),
    onSuccess: () => {
      toast.success('Marked as installed');
      queryClient.invalidateQueries(['qrCodes', eventId]);
    },
  });

  const qrCodes = qrData?.data || [];
  const assets = assetsData?.data || [];
  const unboundAssets = assets.filter(a => !a.qrCode?.code);
  const unboundQRs = qrCodes.filter(qr => qr.bindingStatus === 'UNBOUND');

  // Generate QR — only pole number needed
  const handleGenerate = () => {
    if (!poleNumber.trim()) { toast.error('Enter pole number'); return; }
    generateMutation.mutate({ poleNumber: poleNumber.trim() });
  };

  // Open update modal
  const openUpdateModal = (qr) => {
    setUpdateModal(qr);
    setUpdateForm({
      poleNumber: qr.poleNumber || '',
      latitude: qr.location?.coordinates?.[1]?.toString() || '',
      longitude: qr.location?.coordinates?.[0]?.toString() || '',
      gpsAccuracy: qr.gpsAccuracy?.toString() || '',
      road: qr.label?.roadName || '',
      sector: qr.label?.sectorName || '',
      zone: qr.label?.zoneName || '',
      address: qr.label?.address || '',
    });
    setUseManualGPS(!!qr.location?.coordinates);
  };

  // Capture GPS
  const captureGPS = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setCapturingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUpdateForm({
          ...updateForm,
          latitude: pos.coords.latitude.toFixed(7),
          longitude: pos.coords.longitude.toFixed(7),
          gpsAccuracy: pos.coords.accuracy?.toFixed(1) || '',
        });
        setCapturingGPS(false);
        toast.success('GPS captured');
      },
      (err) => {
        setCapturingGPS(false);
        toast.error('GPS failed. Enter manually or click on map.');
        setUseManualGPS(true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleMapClick = (latlng) => {
    setUpdateForm({
      ...updateForm,
      latitude: latlng.lat.toFixed(7),
      longitude: latlng.lng.toFixed(7),
    });
  };

  // Print label
  const handlePrint = (qr) => {
    const printWindow = window.open('', '_blank');
    const lat = qr.location?.coordinates?.[1];
    const lng = qr.location?.coordinates?.[0];
    printWindow.document.write(`<!DOCTYPE html><html><head><title>QR - Pole #${qr.poleNumber}</title>
    <style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family:Arial,sans-serif; }
    .label { width:320px; padding:20px; border:3px solid #1e3a5f; text-align:center; margin:20px auto; border-radius:12px; }
    .header { color:#1e3a5f; font-size:16px; font-weight:bold; letter-spacing:2px; }
    .pole { font-size:28px; font-weight:bold; color:#1e3a5f; margin:12px 0; }
    .gps { font-size:10px; color:#666; margin-top:8px; font-family:monospace; }
    .code { font-size:12px; font-family:monospace; color:#333; margin-top:4px; }
    .info { font-size:11px; color:#666; margin-top:4px; }
    @media print { body { margin:0; } .no-print { display:none; } }
    </style></head><body>
    <div class="no-print" style="text-align:center;padding:10px;">
    <button onclick="window.print()" style="padding:10px 30px;font-size:16px;cursor:pointer;background:#1e3a5f;color:#fff;border:none;border-radius:6px;">Print</button>
    <button onclick="window.close()" style="padding:10px 30px;font-size:16px;cursor:pointer;margin-left:8px;">Close</button></div>
    <div class="label">
    <div class="header">MELA SEVA</div>
    <div class="pole">Pole #${qr.poleNumber}</div>
    <div style="margin:12px 0;"><canvas id="qrCanvas" width="180" height="180"></canvas></div>
    <div class="code">${qr.code}</div>
    ${qr.label?.roadName ? `<div class="info">${qr.label.roadName}</div>` : ''}
    ${qr.label?.sectorName ? `<div class="info">${qr.label.sectorName}</div>` : ''}
    ${lat && lng ? `<div class="gps">GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}</div>` : ''}
    <div class="info">${qr.label?.eventName || ''}</div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"><\/script>
    <script>QRCode.toCanvas(document.getElementById('qrCanvas'),'${qr.url}',{width:180,margin:1});<\/script>
    </body></html>`);
    printWindow.document.close();
  };

  const bindingColors = { UNBOUND: 'bg-yellow-100 text-yellow-800', BOUND: 'bg-green-100 text-green-800', VERIFIED: 'bg-blue-100 text-blue-800' };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">QR Code Management</h2>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'generate', label: 'Generate QR', icon: FiPlus, count: null },
          { id: 'list', label: 'All QR Codes', icon: FiBox, count: qrCodes.length },
          { id: 'bind', label: 'Bind to Asset', icon: FiLink, count: unboundQRs.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${activeTab === tab.id ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-800'}`}>
            <tab.icon className="mr-1" size={14} /> {tab.label}
            {tab.count !== null && <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ==================== GENERATE TAB ==================== */}
      {activeTab === 'generate' && (
        <div className="max-w-md mx-auto">
          <div className="card text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
              <FiCpu className="text-primary-600" size={36} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Generate QR Code</h3>
              <p className="text-sm text-gray-500 mt-1">Enter pole number → QR generated → Print & paste on pole</p>
              <p className="text-xs text-gray-400 mt-1">GPS and other info can be added later</p>
            </div>
            <div className="space-y-3">
              <input
                className="input text-center text-2xl font-bold tracking-wider"
                placeholder="P-042"
                value={poleNumber}
                onChange={(e) => setPoleNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                autoFocus
              />
              <button onClick={handleGenerate} disabled={generateMutation.isLoading || !poleNumber.trim()}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 flex items-center justify-center">
                <FiBox className="mr-2" />
                {generateMutation.isLoading ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
            {eventId && (
              <p className="text-xs text-gray-400">Event: {user?.event?.name || user?.event?.code || 'Auto-detected'}</p>
            )}
          </div>
        </div>
      )}

      {/* ==================== LIST TAB ==================== */}
      {activeTab === 'list' && (
        <div>
          <div className="card">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="Search pole # or QR code..." className="input pl-10"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="input w-auto" value={bindFilter} onChange={(e) => setBindFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="UNBOUND">Unbound</option>
                <option value="BOUND">Bound</option>
                <option value="VERIFIED">Verified</option>
              </select>
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pole #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GPS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Road / Sector</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {qrLoading ? <tr><td colSpan={7} className="px-4 py-8 text-center">Loading...</td></tr> :
                  qrCodes.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No QR codes yet. Generate one first!</td></tr> :
                  qrCodes.map(qr => (
                    <tr key={qr._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-2">
                            <QRCodeCanvas value={qr.url || ''} size={32} />
                          </div>
                          <div>
                            <p className="text-xs font-mono font-semibold text-primary-700">{qr.code}</p>
                            <p className="text-xs text-gray-400">Scans: {qr.scanCount}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">#{qr.poleNumber}</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">
                        {qr.location?.coordinates
                          ? `${qr.location.coordinates[1]?.toFixed(5)}, ${qr.location.coordinates[0]?.toFixed(5)}`
                          : <span className="text-gray-400 italic">Not set</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {qr.label?.roadName && <div>{qr.label.roadName}</div>}
                        {qr.label?.sectorName && <div className="text-gray-400">{qr.label.sectorName}</div>}
                        {!qr.label?.roadName && !qr.label?.sectorName && <span className="text-gray-400 italic">Not set</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${bindingColors[qr.bindingStatus]}`}>
                          {qr.bindingStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {qr.asset ? <span className="text-green-700 font-medium">{qr.asset.assetId}</span>
                          : <span className="text-gray-400">Not bound</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-1">
                          <button onClick={() => setPreviewQR(qr)} className="text-blue-600 p-1" title="Preview"><FiBox size={16} /></button>
                          <button onClick={() => openUpdateModal(qr)} className="text-indigo-600 p-1" title="Edit GPS/Info"><FiEdit2 size={16} /></button>
                          <button onClick={() => handlePrint(qr)} className="text-green-600 p-1" title="Print"><FiPrinter size={16} /></button>
                          {qr.bindingStatus === 'UNBOUND' && (
                            <button onClick={() => { setBindModal(qr); }} className="text-purple-600 p-1" title="Bind"><FiLink size={16} /></button>
                          )}
                          {qr.installationStatus === 'GENERATED' && (
                            <button onClick={() => installMutation.mutate(qr._id)} className="text-orange-600 p-1" title="Installed"><FiCheck size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== BIND TAB ==================== */}
      {activeTab === 'bind' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Unbound QR Codes ({unboundQRs.length})</h3>
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {unboundQRs.length === 0
                ? <p className="text-gray-500 text-center py-8">✅ All QR codes bound</p>
                : unboundQRs.map(qr => (
                  <div key={qr._id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                      <QRCodeCanvas value={qr.url || ''} size={32} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary-700">Pole #{qr.poleNumber}</p>
                      <p className="text-xs text-gray-500">{qr.code}</p>
                    </div>
                    <button onClick={() => { setBindModal(qr); }} className="btn-primary text-sm"><FiLink className="mr-1" size={14} /> Bind</button>
                  </div>
                ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Assets without QR ({unboundAssets.length})</h3>
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {unboundAssets.length === 0
                ? <p className="text-gray-500 text-center py-8">All assets have QR codes</p>
                : unboundAssets.map(a => (
                  <div key={a._id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{a.assetId}</p>
                      <p className="text-xs text-gray-500">{a.assetType?.replace(/_/g, ' ')} • #{a.poleNumber || a.assetNumber}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== QR PREVIEW MODAL ==================== */}
      {previewQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-bold mb-3">✅ QR Generated — Pole #{previewQR.poleNumber}</h3>
            <div className="border-2 border-gray-200 rounded-lg p-4 inline-block">
              <QRCodeCanvas value={previewQR.url || ''} size={200} />
            </div>
            <p className="font-mono text-sm mt-3">{previewQR.code}</p>
            <p className="text-xs text-gray-500 mt-1">{previewQR.label?.eventName}</p>
            {!previewQR.location?.coordinates && (
              <p className="text-xs text-yellow-600 mt-2">💡 GPS not set yet — click "Edit" to add GPS later</p>
            )}
            <div className="flex space-x-2 mt-4">
              <button onClick={() => handlePrint(previewQR)} className="btn-primary flex-1 flex items-center justify-center">
                <FiPrinter className="mr-1" /> Print & Paste
              </button>
              <button onClick={() => openUpdateModal(previewQR)} className="btn-secondary flex items-center">
                <FiEdit2 className="mr-1" /> Add GPS
              </button>
              <button onClick={() => setPreviewQR(null)} className="btn-secondary">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== UPDATE QR MODAL (GPS/INFO) ==================== */}
      {updateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Update QR — Pole #{updateModal.poleNumber}</h3>
              <button onClick={() => setUpdateModal(null)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Add GPS location and other details after printing & pasting QR on pole</p>

            <div className="space-y-4">
              {/* GPS */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="label text-blue-800">📍 GPS Location</label>
                <div className="flex space-x-2 mb-2">
                  <button onClick={captureGPS} disabled={capturingGPS}
                    className="btn-primary text-sm flex items-center disabled:opacity-50">
                    <FiMapPin className="mr-1" /> {capturingGPS ? 'Capturing...' : 'Capture GPS'}
                  </button>
                  <button onClick={() => setUseManualGPS(!useManualGPS)} className="btn-secondary text-sm">
                    {useManualGPS ? 'Hide' : 'Manual'}
                  </button>
                </div>
                {updateForm.latitude && updateForm.longitude && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                    <p className="text-sm text-green-800 font-mono">
                      ✓ {updateForm.latitude}, {updateForm.longitude}
                      {updateForm.gpsAccuracy && <span className="text-xs ml-2">(±{updateForm.gpsAccuracy}m)</span>}
                    </p>
                  </div>
                )}
                {useManualGPS && (
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input text-sm" placeholder="Latitude" type="number" step="any"
                      value={updateForm.latitude} onChange={(e) => setUpdateForm({...updateForm, latitude: e.target.value})} />
                    <input className="input text-sm" placeholder="Longitude" type="number" step="any"
                      value={updateForm.longitude} onChange={(e) => setUpdateForm({...updateForm, longitude: e.target.value})} />
                  </div>
                )}
              </div>

              {/* Map for GPS */}
              <div className="rounded-lg overflow-hidden border" style={{ height: '200px' }}>
                <MapContainer
                  center={[parseFloat(updateForm.latitude) || 21.1458, parseFloat(updateForm.longitude) || 79.0882]}
                  zoom={16} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler onLocationSelect={handleMapClick} />
                  {updateForm.latitude && updateForm.longitude && (
                    <Marker position={[parseFloat(updateForm.latitude), parseFloat(updateForm.longitude)]}>
                      <Popup>Pole #{updateForm.poleNumber}</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              {/* Other info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Road Name</label>
                  <input className="input text-sm" value={updateForm.road} onChange={(e) => setUpdateForm({...updateForm, road: e.target.value})} />
                </div>
                <div>
                  <label className="label">Sector</label>
                  <input className="input text-sm" value={updateForm.sector} onChange={(e) => setUpdateForm({...updateForm, sector: e.target.value})} />
                </div>
                <div>
                  <label className="label">Zone</label>
                  <input className="input text-sm" value={updateForm.zone} onChange={(e) => setUpdateForm({...updateForm, zone: e.target.value})} />
                </div>
                <div>
                  <label className="label">Address / Landmark</label>
                  <input className="input text-sm" value={updateForm.address} onChange={(e) => setUpdateForm({...updateForm, address: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setUpdateModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => updateMutation.mutate({ id: updateModal._id, data: updateForm })}
                disabled={updateMutation.isLoading} className="btn-primary disabled:opacity-50">
                {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== BIND MODAL ==================== */}
      {bindModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Bind QR to Asset</h3>
            <div className="bg-blue-50 rounded p-3 mb-4">
              <p className="text-sm font-bold text-primary-700">QR: Pole #{bindModal.poleNumber} — {bindModal.code}</p>
            </div>
            <label className="label">Select Asset</label>
            <select className="input" value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)}>
              <option value="">Select an asset...</option>
              {unboundAssets.map(a => (
                <option key={a._id} value={a._id}>{a.assetId} — {a.assetType?.replace(/_/g, ' ')} — #{a.poleNumber || a.assetNumber}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => { setBindModal(null); setSelectedAssetId(''); }} className="btn-secondary">Cancel</button>
              <button onClick={() => bindMutation.mutate({ id: bindModal._id, assetId: selectedAssetId })}
                disabled={!selectedAssetId || bindMutation.isLoading} className="btn-primary disabled:opacity-50">
                {bindMutation.isLoading ? 'Binding...' : 'Bind QR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
