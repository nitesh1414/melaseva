import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qrCodeAPI, assetAPI } from '../../services/api';
import { useAuthStore } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiBox, FiDownload, FiPrinter } from 'react-icons/fi';
import { QRCodeCanvas } from 'qrcode.react';

export default function QRCodeManagement() {
  const user = useAuthStore((state) => state.user);
  const eventId = user?.event?._id || user?.event;
  const queryClient = useQueryClient();
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [previewQR, setPreviewQR] = useState(null);

  const { data: qrData, isLoading: qrLoading } = useQuery({
    queryKey: ['qrCodes', eventId],
    queryFn: () => qrCodeAPI.list({ event: eventId, limit: 100 }).then(res => res.data),
    enabled: !!eventId,
  });

  const { data: assetsData } = useQuery({
    queryKey: ['assetsForQR', eventId],
    queryFn: () => assetAPI.list({ event: eventId, limit: 200 }).then(res => res.data),
    enabled: !!eventId,
  });

  const generateMutation = useMutation({
    mutationFn: (data) => qrCodeAPI.bulkGenerate(data),
    onSuccess: (res) => {
      toast.success(`Generated ${res.data.data.generated.length} QR codes`);
      queryClient.invalidateQueries(['qrCodes', eventId]);
      setSelectedAssets([]);
    },
    onError: () => toast.error('Failed to generate QR codes'),
  });

  const qrCodes = qrData?.data || [];
  const assets = assetsData?.data || [];
  const assetsWithoutQR = assets.filter(a => !a.qrCode?.code);

  const toggleAssetSelection = (assetId) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  const handleBulkGenerate = () => {
    if (selectedAssets.length === 0) {
      toast.error('Please select assets to generate QR codes');
      return;
    }
    generateMutation.mutate({ assetIds: selectedAssets, event: eventId });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">QR Code Management</h2>
        <div className="flex space-x-2">
          <button onClick={handleBulkGenerate} disabled={selectedAssets.length === 0 || generateMutation.isLoading} className="btn-primary flex items-center disabled:opacity-50">
            <FiBox className="mr-2" /> Generate QR ({selectedAssets.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets without QR */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Assets Without QR Codes ({assetsWithoutQR.length})</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {assetsWithoutQR.length === 0 ? (
              <p className="text-gray-500 text-center py-8">All assets have QR codes</p>
            ) : (
              assetsWithoutQR.map(a => (
                <label key={a._id} className="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={selectedAssets.includes(a._id)} onChange={() => toggleAssetSelection(a._id)} className="mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.assetId}</p>
                    <p className="text-xs text-gray-500">{a.assetNumber} - {a.poleNumber}</p>
                  </div>
                  <span className="text-xs text-gray-400">{a.assetType?.replace(/_/g, ' ')}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Generated QR Codes */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Generated QR Codes ({qrCodes.length})</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {qrLoading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : qrCodes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No QR codes generated yet</p>
            ) : (
              qrCodes.map(qr => (
                <div key={qr._id} className="flex items-center p-2 border rounded hover:bg-gray-50">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <FiBox size={24} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-mono font-semibold">{qr.code}</p>
                    <p className="text-xs text-gray-500">{qr.label?.assetNumber} - {qr.label?.poleNumber}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setPreviewQR(qr)} className="text-blue-600 hover:text-blue-800" title="Preview">
                      <FiBox size={18} />
                    </button>
                    <button className="text-green-600 hover:text-green-800" title="Print">
                      <FiPrinter size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QR Preview Modal */}
      {previewQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-center">QR Code Preview</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <QRCodeCanvas value={previewQR.url || `https://melaseva.gov.in/asset/${previewQR.code}`} size={200} />
              </div>
              <div className="text-center">
                <p className="font-mono font-semibold text-lg">{previewQR.code}</p>
                <p className="text-sm text-gray-500 mt-1">{previewQR.label?.assetNumber}</p>
                <p className="text-sm text-gray-500">{previewQR.label?.poleNumber}</p>
                <p className="text-xs text-gray-400 mt-2">{previewQR.label?.roadName}</p>
                <p className="text-xs text-gray-400">{previewQR.label?.sectorName}</p>
              </div>
              <button onClick={() => setPreviewQR(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
