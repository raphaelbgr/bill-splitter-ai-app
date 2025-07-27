import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Globe, 
  FileText, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Download,
  Trash2,
  Eye,
  Edit,
  Lock
} from 'lucide-react';

interface ComplianceData {
  region: string;
  gdprCompliant?: boolean;
  compliance?: any;
  userRights?: any;
  processingRecords?: any;
  consentManagement?: any;
  regionalCompliance?: any;
  complianceMonitoring?: any;
  legalFramework?: any;
  rightsManagement?: any;
  requestResult?: any;
}

interface RegionalComplianceProps {
  region: string;
  complianceData: any;
}

const RegionalCompliance: React.FC<RegionalComplianceProps> = ({ region, complianceData }) => {
  const getRegionFlag = (region: string) => {
    const flags: { [key: string]: string } = {
      'BR': '🇧🇷',
      'ES': '🇪🇸',
      'US': '🇺🇸',
      'FR': '🇫🇷',
      'MX': '🇲🇽',
      'AR': '🇦🇷'
    };
    return flags[region] || '🌍';
  };

  const getComplianceStatus = (data: any) => {
    if (data.gdprCompliant !== undefined) return data.gdprCompliant;
    if (data.status) return data.status === 'compliant';
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getRegionFlag(region)}</span>
          <h3 className="text-lg font-semibold text-gray-800">
            {region} Compliance
          </h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          getComplianceStatus(complianceData) 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {getComplianceStatus(complianceData) ? 'Compliant' : 'Non-Compliant'}
        </div>
      </div>

      <div className="space-y-4">
        {complianceData.compliance && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">GDPR Compliance</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(complianceData.compliance).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {complianceData.userRights && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">User Rights</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(complianceData.userRights).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {complianceData.regionalCompliance && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Regional Compliance</h4>
            <div className="space-y-2">
              {Object.entries(complianceData.regionalCompliance).map(([framework, details]: [string, any]) => (
                <div key={framework} className="bg-gray-50 p-3 rounded">
                  <h5 className="font-medium text-gray-700 mb-1">{framework.toUpperCase()}</h5>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {Object.entries(details).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InternationalComplianceDashboard: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('BR');
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rightsRequest, setRightsRequest] = useState({
    type: 'access',
    userId: 'user_123'
  });

  const regions = [
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' }
  ];

  const gdprRegions = ['ES', 'FR', 'DE', 'IT', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'SE', 'DK', 'NO'];

  const checkCompliance = async (region: string) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      // Check if it's a GDPR region
      if (gdprRegions.includes(region)) {
        response = await fetch('/api/internationalization/gdpr-compliance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region })
        });
      } else {
        response = await fetch('/api/internationalization/regional-compliance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region, complianceType: 'regional' })
        });
      }

      if (!response.ok) {
        throw new Error(`Compliance check failed: ${response.statusText}`);
      }

      const data = await response.json();
      setComplianceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compliance check failed');
    } finally {
      setLoading(false);
    }
  };

  const requestUserRights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/internationalization/user-rights-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: selectedRegion,
          userId: rightsRequest.userId,
          rightsRequest
        })
      });

      if (!response.ok) {
        throw new Error(`User rights request failed: ${response.statusText}`);
      }

      const data = await response.json();
      setComplianceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'User rights request failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRegion) {
      checkCompliance(selectedRegion);
    }
  }, [selectedRegion]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            International Compliance Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and manage international compliance across all regions
          </p>
        </div>

        {/* Region Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Region Selection
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {regions.map((region) => (
              <button
                key={region.code}
                onClick={() => setSelectedRegion(region.code)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRegion === region.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{region.flag}</div>
                <div className="text-sm font-medium text-gray-700">{region.name}</div>
                <div className="text-xs text-gray-500">{region.code}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Compliance Status */}
        {complianceData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RegionalCompliance 
              region={selectedRegion} 
              complianceData={complianceData} 
            />
            
            {/* User Rights Management */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                User Rights Management
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rights Request Type
                  </label>
                  <select
                    value={rightsRequest.type}
                    onChange={(e) => setRightsRequest({...rightsRequest, type: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="access">Right to Access</option>
                    <option value="rectification">Right to Rectification</option>
                    <option value="deletion">Right to Deletion</option>
                    <option value="portability">Right to Portability</option>
                    <option value="restriction">Right to Restriction</option>
                    <option value="objection">Right to Objection</option>
                    <option value="withdrawal">Right to Withdraw Consent</option>
                  </select>
                </div>

                <button
                  onClick={requestUserRights}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Request User Rights'}
                </button>

                {complianceData.requestResult && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <h4 className="font-medium text-green-800 mb-2">Request Submitted</h4>
                    <div className="text-sm text-green-700">
                      <p><strong>Request ID:</strong> {complianceData.requestResult.requestId}</p>
                      <p><strong>Type:</strong> {complianceData.requestResult.requestType}</p>
                      <p><strong>Status:</strong> {complianceData.requestResult.status}</p>
                      <p><strong>Estimated Completion:</strong> {new Date(complianceData.requestResult.estimatedCompletion).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Compliance Monitoring */}
        {complianceData && complianceData.complianceMonitoring && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Compliance Monitoring
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(complianceData.complianceMonitoring).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <div className="text-red-800">{error}</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Checking compliance...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternationalComplianceDashboard; 