import React, { useState, useEffect } from 'react';
import { 
  Phone, Mail, Calendar, Clock, TrendingUp, Target, 
  DollarSign, Users, Activity, AlertCircle, CheckCircle,
  XCircle, Plus, Edit2, Save, X, Search, Filter,
  PhoneCall, MessageSquare, CalendarCheck, FileText,
  Award, Zap, BarChart3
} from 'lucide-react';
import api from '../../../api/axios';

const Leads = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [stats, setStats] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [leads, setLeads] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pipelineRes, leadsRes, targetsRes] = await Promise.all([
        api.get('/sales/stats'),
        api.get('/sales/today-pipeline'),
        api.get('/sales/my-leads'),
        api.get('/sales/my-targets')
      ]);

      setStats(statsRes.data.stats);
      setPipeline(pipelineRes.data.pipeline);
      setLeads(leadsRes.data.leads);
      setTargets(targetsRes.data.targets);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      await api.put(`/sales/leads/${leadId}`, { 
        status: newStatus,
        lastContactedDate: new Date()
      });
      loadDashboardData();
    } catch (error) {
      alert('Failed to update lead status');
    }
  };

  const handleAddActivity = async (leadId, activityData) => {
    try {
      await api.post(`/sales/leads/${leadId}/activity`, activityData);
      loadDashboardData();
      setShowActivityModal(false);
    } catch (error) {
      alert('Failed to add activity');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-yellow-100 text-yellow-800',
      proposal_sent: 'bg-orange-100 text-orange-800',
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      converted: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      hot_deal: <Zap className="text-red-500" size={16} />,
      warm: <TrendingUp className="text-orange-500" size={16} />,
      cold: <Activity className="text-blue-500" size={16} />,
      follow_up: <Clock className="text-purple-500" size={16} />
    };
    return icons[category] || <Activity size={16} />;
  };

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sales Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your leads and performance</p>
          </div>
          <button
            onClick={() => {
              setSelectedLead(null);
              setShowLeadModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add New Lead
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="text-blue-600" size={24} />}
            title="Total Leads"
            value={stats?.overview.totalLeads || 0}
            subtitle={`${stats?.overview.newLeads || 0} new`}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle className="text-green-600" size={24} />}
            title="Converted"
            value={stats?.overview.converted || 0}
            subtitle={`${stats?.overview.conversionRate || 0}% rate`}
            color="green"
          />
          <StatCard
            icon={<Activity className="text-orange-600" size={24} />}
            title="In Progress"
            value={(stats?.overview.contacted || 0) + (stats?.overview.negotiation || 0)}
            subtitle={`${stats?.overview.negotiation || 0} in negotiation`}
            color="orange"
          />
          {/* <StatCard
            icon={<DollarSign className="text-purple-600" size={24} />}
            title="Revenue"
            value={formatCurrency(stats?.revenue.total || 0)}
            subtitle={`${formatCurrency(stats?.revenue.thisMonth || 0)} this month`}
            color="purple"
          /> */}
        </div>

        {/* Targets */}
        {targets.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="text-blue-600" size={20} />
              Current Targets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {targets[0] && (
                <>
                  <TargetCard
                    title="Leads Target"
                    achieved={targets[0].leadsAchieved}
                    target={targets[0].leadsTarget}
                    icon={<Users size={16} />}
                  />
                  <TargetCard
                    title="Conversions Target"
                    achieved={targets[0].conversionsAchieved}
                    target={targets[0].conversionsTarget}
                    icon={<CheckCircle size={16} />}
                  />
                  {/* <TargetCard
                    title="Revenue Target"
                    achieved={targets[0].revenueAchieved}
                    target={targets[0].revenueTarget}
                    icon={<DollarSign size={16} />}
                    isCurrency
                  /> */}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <TabButton
            active={activeTab === 'today'}
            onClick={() => setActiveTab('today')}
            icon={<Calendar size={18} />}
            text="Today's Pipeline"
          />
          <TabButton
            active={activeTab === 'leads'}
            onClick={() => setActiveTab('leads')}
            icon={<Users size={18} />}
            text="All Leads"
          />
        </div>

        {/* Content */}
        {activeTab === 'today' && (
          <TodayPipeline 
            pipeline={pipeline}
            onUpdateStatus={handleUpdateLeadStatus}
            onSelectLead={(lead) => {
              setSelectedLead(lead);
              setShowLeadModal(true);
            }}
            onAddActivity={(lead) => {
              setSelectedLead(lead);
              setShowActivityModal(true);
            }}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            getCategoryIcon={getCategoryIcon}
            isOverdue={isOverdue}
          />
        )}

        {activeTab === 'leads' && (
          <AllLeads
            leads={leads}
            filters={filters}
            setFilters={setFilters}
            onUpdateStatus={handleUpdateLeadStatus}
            onSelectLead={(lead) => {
              setSelectedLead(lead);
              setShowLeadModal(true);
            }}
            onAddActivity={(lead) => {
              setSelectedLead(lead);
              setShowActivityModal(true);
            }}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            getCategoryIcon={getCategoryIcon}
            isOverdue={isOverdue}
          />
        )}

        {/* Modals */}
        {showLeadModal && (
          <LeadModal
            lead={selectedLead}
            onClose={() => {
              setShowLeadModal(false);
              setSelectedLead(null);
            }}
            onSave={() => {
              loadDashboardData();
              setShowLeadModal(false);
            }}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
          />
        )}

        {showActivityModal && selectedLead && (
          <ActivityModal
            lead={selectedLead}
            onClose={() => {
              setShowActivityModal(false);
              setSelectedLead(null);
            }}
            onSave={(activityData) => handleAddActivity(selectedLead._id, activityData)}
          />
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-4`}>
        <div className="bg-white/20 p-3 rounded-lg inline-block">
          {icon}
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
};

// Target Card Component
const TargetCard = ({ title, achieved, target, icon, isCurrency = false }) => {
  const percentage = target > 0 ? ((achieved / target) * 100).toFixed(1) : 0;
  const isAchieved = percentage >= 100;

  const formatValue = (val) => {
    if (isCurrency) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(val);
    }
    return val;
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon}
          {title}
        </span>
        <span className={`text-xs font-semibold ${isAchieved ? 'text-green-600' : 'text-gray-600'}`}>
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isAchieved ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{formatValue(achieved)} achieved</span>
        <span>{formatValue(target)} target</span>
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon, text }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
      active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    }`}
  >
    {icon}
    {text}
  </button>
);

// Today's Pipeline Component
const TodayPipeline = ({ 
  pipeline, onUpdateStatus, onSelectLead, onAddActivity,
  formatDate, getStatusColor, getPriorityColor, getCategoryIcon, isOverdue 
}) => {
  if (!pipeline) return null;

  const sections = [
    { 
      title: 'Follow-ups Today', 
      data: pipeline.followUpsToday, 
      icon: <CalendarCheck className="text-blue-600" size={20} />,
      color: 'blue'
    },
    { 
      title: 'Overdue Follow-ups', 
      data: pipeline.overdueFollowUps, 
      icon: <AlertCircle className="text-red-600" size={20} />,
      color: 'red'
    },
    { 
      title: 'New Leads', 
      data: pipeline.newLeads, 
      icon: <Users className="text-green-600" size={20} />,
      color: 'green'
    },
    { 
      title: 'Hot Deals', 
      data: pipeline.hotDeals, 
      icon: <Zap className="text-orange-600" size={20} />,
      color: 'orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {sections.map((section) => (
        <div key={section.title} className="bg-white rounded-lg shadow">
          <div className={`p-4 border-b border-${section.color}-100 bg-${section.color}-50`}>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              {section.icon}
              {section.title}
              <span className="ml-auto bg-white px-2 py-1 rounded-full text-sm">
                {section.data.length}
              </span>
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {section.data.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items</p>
            ) : (
              section.data.map((lead) => (
                <LeadCard
                  key={lead._id}
                  lead={lead}
                  onUpdateStatus={onUpdateStatus}
                  onSelectLead={onSelectLead}
                  onAddActivity={onAddActivity}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  getCategoryIcon={getCategoryIcon}
                  isOverdue={isOverdue}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// All Leads Component
const AllLeads = ({ 
  leads, filters, setFilters, onUpdateStatus, onSelectLead, onAddActivity,
  formatDate, formatCurrency, getStatusColor, getPriorityColor, getCategoryIcon, isOverdue 
}) => {
  const filteredLeads = leads.filter(lead => {
    if (filters.status !== 'all' && lead.status !== filters.status) return false;
    if (filters.category !== 'all' && lead.category !== filters.category) return false;
    if (filters.priority !== 'all' && lead.priority !== filters.priority) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        lead.clientName.toLowerCase().includes(search) ||
        lead.clientEmail.toLowerCase().includes(search) ||
        lead.clientPhone.includes(search) ||
        (lead.company && lead.company.toLowerCase().includes(search))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="negotiation">Negotiation</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="confirmed">Confirmed</option>
            <option value="converted">Converted</option>
            <option value="rejected">Rejected</option>
            <option value="lost">Lost</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="hot_deal">Hot Deal</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
            <option value="follow_up">Follow Up</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Follow-up</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{lead.clientName}</p>
                      <p className="text-sm text-gray-500">{lead.clientEmail}</p>
                      <p className="text-xs text-gray-400">{lead.clientPhone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(lead.category)}
                      <span className="text-sm capitalize">{lead.category.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{formatCurrency(lead.estimatedValue || 0)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm ${isOverdue(lead.nextFollowUpDate) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {formatDate(lead.nextFollowUpDate)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onAddActivity(lead)}
                        className="text-green-600 hover:text-green-800"
                        title="Add Activity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No leads found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Lead Card Component (for pipeline view)
const LeadCard = ({ 
  lead, onUpdateStatus, onSelectLead, onAddActivity,
  formatDate, getStatusColor, getPriorityColor, getCategoryIcon, isOverdue 
}) => (
  <div className="border rounded-lg p-4 hover:shadow-md transition">
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{lead.clientName}</h4>
        <p className="text-sm text-gray-600">{lead.company}</p>
        <div className="flex items-center gap-2 mt-2">
          <Phone size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{lead.clientPhone}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {getCategoryIcon(lead.category)}
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
          {lead.priority}
        </span>
      </div>
    </div>
    
    <div className="flex items-center gap-2 mt-3">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
        {lead.status.replace('_', ' ')}
      </span>
      {lead.nextFollowUpDate && (
        <span className={`text-xs ${isOverdue(lead.nextFollowUpDate) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          Follow-up: {formatDate(lead.nextFollowUpDate)}
        </span>
      )}
    </div>

    <div className="flex gap-2 mt-3 pt-3 border-t">
      <button
        onClick={() => onSelectLead(lead)}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
      >
        <Edit2 size={14} />
        View
      </button>
      <button
        onClick={() => onAddActivity(lead)}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm"
      >
        <Plus size={14} />
        Activity
      </button>
    </div>
  </div>
);

// Lead Modal Component (simplified - you should expand this)
const LeadModal = ({ lead, onClose, onSave, formatDate, getStatusColor }) => {
  const [formData, setFormData] = useState({
    clientName: lead?.clientName || '',
    clientEmail: lead?.clientEmail || '',
    clientPhone: lead?.clientPhone || '',
    company: lead?.company || '',
    category: lead?.category || 'warm',
    status: lead?.status || 'new',
    priority: lead?.priority || 'medium',
    estimatedValue: lead?.estimatedValue || '',
    description: lead?.description || '',
    nextFollowUpDate: lead?.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0] : ''
  });

  const handleSave = async () => {
    try {
      if (lead) {
        await api.put(`/sales/leads/${lead._id}`, formData);
      } else {
        await api.post('/sales/leads', formData);
      }
      onSave();
    } catch (error) {
      alert('Failed to save lead');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="hot_deal">Hot Deal</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
                <option value="follow_up">Follow Up</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="negotiation">Negotiation</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="confirmed">Confirmed</option>
                <option value="converted">Converted</option>
                <option value="rejected">Rejected</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value (₹)</label>
              <input
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up Date</label>
              <input
                type="date"
                value={formData.nextFollowUpDate}
                onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Activities Section (if editing) */}
          {lead && lead.activities && lead.activities.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Recent Activities</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {lead.activities.slice(0, 5).map((activity, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity size={14} className="text-gray-500" />
                      <span className="text-sm font-medium capitalize">{activity.type.replace('_', ' ')}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.notes && (
                      <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Save size={18} />
            Save Lead
          </button>
        </div>
      </div>
    </div>
  );
};

// Activity Modal Component
const ActivityModal = ({ lead, onClose, onSave }) => {
  const [activityData, setActivityData] = useState({
    type: 'call',
    description: '',
    notes: '',
    outcome: '',
    nextAction: ''
  });

  const handleSave = () => {
    onSave(activityData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="font-medium text-gray-800 mb-1">{lead.clientName}</p>
            <p className="text-sm text-gray-600">{lead.company}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type *</label>
            <select
              value={activityData.type}
              onChange={(e) => setActivityData({ ...activityData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="call">Phone Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="note">Note</option>
              <option value="follow_up">Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input
              type="text"
              value={activityData.description}
              onChange={(e) => setActivityData({ ...activityData, description: e.target.value })}
              placeholder="Brief description of the activity"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Notes</label>
            <textarea
              value={activityData.notes}
              onChange={(e) => setActivityData({ ...activityData, notes: e.target.value })}
              rows="3"
              placeholder="Add detailed notes about this activity..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
            <input
              type="text"
              value={activityData.outcome}
              onChange={(e) => setActivityData({ ...activityData, outcome: e.target.value })}
              placeholder="What was the result?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Action</label>
            <input
              type="text"
              value={activityData.nextAction}
              onChange={(e) => setActivityData({ ...activityData, nextAction: e.target.value })}
              placeholder="What needs to be done next?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-6 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Save size={18} />
            Add Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leads;