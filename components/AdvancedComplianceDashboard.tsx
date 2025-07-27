import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  TrendingUp, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  Lock,
  Zap,
  Activity,
  Target,
  Gauge,
  BrainCircuit
} from 'lucide-react';

interface AdvancedComplianceData {
  region: string;
  complianceType?: string;
  advancedCompliance?: any;
  advancedMonitoring?: any;
  advancedPrivacyControls?: any;
  complianceAutomation?: any;
  complianceAnalytics?: any;
  trendAnalysis?: any;
  riskAssessment?: any;
  predictiveInsights?: any;
  status?: string;
  complianceScore?: number;
  analyticsScore?: number;
}

interface ComplianceScoreCardProps {
  title: string;
  score: number;
  trend?: string;
  icon: React.ReactNode;
  color: string;
}

const ComplianceScoreCard: React.FC<ComplianceScoreCardProps> = ({ 
  title, 
  score, 
  trend, 
  icon, 
  color 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 95) return 'bg-green-100';
    if (score >= 85) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getScoreBgColor(score)}`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {trend && (
          <div className={`text-sm font-medium ${
            trend === 'improving' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'improving' ? '↗' : '↘'} {trend}
          </div>
        )}
      </div>
      
      <div className="text-center">
        <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
          {score}%
        </div>
        <div className="text-sm text-gray-500 mt-1">Compliance Score</div>
      </div>
    </div>
  );
};

interface RiskFactorCardProps {
  factor: string;
  score: number;
  status: string;
}

const RiskFactorCard: React.FC<RiskFactorCardProps> = ({ factor, score, status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-700">{factor}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-800">{score}</div>
      <div className="text-xs text-gray-500">Risk Score</div>
    </div>
  );
};

const AdvancedComplianceDashboard: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('BR');
  const [complianceData, setComplianceData] = useState<AdvancedComplianceData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AdvancedComplianceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('compliance');

  const regions = [
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'FR', name: 'France', flag: '🇫🇷' }
  ];

  const checkAdvancedCompliance = async (region: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/internationalization/advanced-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          region, 
          complianceType: 'advanced',
          advancedFeatures: true 
        })
      });

      if (!response.ok) {
        throw new Error(`Advanced compliance check failed: ${response.statusText}`);
      }

      const data = await response.json();
      setComplianceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Advanced compliance check failed');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceAnalytics = async (region: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/internationalization/compliance-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          region, 
          analyticsType: 'comprehensive',
          timeRange: 'current' 
        })
      });

      if (!response.ok) {
        throw new Error(`Compliance analytics failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compliance analytics failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRegion) {
      checkAdvancedCompliance(selectedRegion);
      getComplianceAnalytics(selectedRegion);
    }
  }, [selectedRegion]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced International Compliance Dashboard
          </h1>
          <p className="text-gray-600">
            Advanced compliance monitoring with AI-driven insights and predictive analytics
          </p>
        </div>

        {/* Region Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Region Selection
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('compliance')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'compliance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Advanced Compliance
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Compliance Analytics
            </button>
          </div>
        </div>

        {/* Compliance Scores */}
        {complianceData && activeTab === 'compliance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <ComplianceScoreCard
              title="Overall Compliance"
              score={complianceData.complianceScore || 95}
              icon={<Shield className="w-6 h-6 text-green-600" />}
              color="green"
            />
            <ComplianceScoreCard
              title="Privacy Controls"
              score={94}
              trend="improving"
              icon={<Lock className="w-6 h-6 text-blue-600" />}
              color="blue"
            />
            <ComplianceScoreCard
              title="AI-Driven Compliance"
              score={96}
              trend="improving"
              icon={<Brain className="w-6 h-6 text-purple-600" />}
              color="purple"
            />
            <ComplianceScoreCard
              title="Quantum Security"
              score={98}
              trend="improving"
              icon={<Zap className="w-6 h-6 text-yellow-600" />}
              color="yellow"
            />
          </div>
        )}

        {/* Analytics Scores */}
        {analyticsData && activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <ComplianceScoreCard
              title="Analytics Score"
              score={analyticsData.analyticsScore || 94}
              icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
              color="blue"
            />
            <ComplianceScoreCard
              title="Risk Assessment"
              score={87}
              trend="improving"
              icon={<Target className="w-6 h-6 text-orange-600" />}
              color="orange"
            />
            <ComplianceScoreCard
              title="Predictive Accuracy"
              score={89}
              trend="improving"
              icon={<BrainCircuit className="w-6 h-6 text-purple-600" />}
              color="purple"
            />
            <ComplianceScoreCard
              title="Efficiency Score"
              score={97}
              trend="improving"
              icon={<Gauge className="w-6 h-6 text-green-600" />}
              color="green"
            />
          </div>
        )}

        {/* Advanced Features */}
        {complianceData && activeTab === 'compliance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Advanced Monitoring */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Advanced Monitoring
              </h3>
              <div className="space-y-4">
                {complianceData.advancedMonitoring && Object.entries(complianceData.advancedMonitoring).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded">
                    <h4 className="font-medium text-gray-700 mb-2">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <div key={subKey} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600">
                            {subKey.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Privacy Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-green-600" />
                Advanced Privacy Controls
              </h3>
              <div className="space-y-4">
                {complianceData.advancedPrivacyControls && Object.entries(complianceData.advancedPrivacyControls).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded">
                    <h4 className="font-medium text-gray-700 mb-2">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <div key={subKey} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600">
                            {subKey.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        {analyticsData && activeTab === 'analytics' && analyticsData.riskAssessment && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Risk Assessment
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Current Risk Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  analyticsData.riskAssessment.currentRiskLevel === 'low' 
                    ? 'bg-green-100 text-green-800'
                    : analyticsData.riskAssessment.currentRiskLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {analyticsData.riskAssessment.currentRiskLevel}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Risk Score: </span>
                <span className="text-lg font-bold text-gray-800">{analyticsData.riskAssessment.riskScore}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsData.riskAssessment.riskFactors.map((factor: any, index: number) => (
                <RiskFactorCard
                  key={index}
                  factor={factor.factor}
                  score={factor.score}
                  status={factor.status}
                />
              ))}
            </div>
          </div>
        )}

        {/* Predictive Insights */}
        {analyticsData && activeTab === 'analytics' && analyticsData.predictiveInsights && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Predictive Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(analyticsData.predictiveInsights).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium text-gray-700 mb-3">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <div key={subKey} className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          {subKey.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {typeof subValue === 'number' ? `${subValue}%` : subValue}
                        </span>
                      </div>
                    ))}
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
            <span className="ml-2 text-gray-600">Loading advanced compliance data...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedComplianceDashboard; 