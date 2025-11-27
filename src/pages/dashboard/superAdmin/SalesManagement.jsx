import React, { useState, useEffect } from 'react';
import {
  Users, Target, TrendingUp, Award, UserCheck, 
  Search, Filter, Plus, Edit2, RefreshCw, Calendar,
  DollarSign, Activity, BarChart3, Clock, Zap,
  X
} from 'lucide-react';
import api from '../../../api/axios';

const SalesManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [salesPeople, setSalesPeople] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [allLeads, setAllLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedSalesPerson, setSelectedSalesPerson] = useState(null);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesRes, perfRes, leadsRes] = await Promise.all([
        api.get('/admin/users?role=sales'),
        api.get('/sales/admin/performance'),
        api.get('/sales/leads')
      ]);

      setSalesPeople(salesRes.data.users);
    
      setPerformance(perfRes.data.performance);
      setAllLeads(leadsRes.data.leads);
      // console.log(leadsRes.data.leads)
    } catch (error) {
        console.log("error")
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLead = async (leadId, salesPersonId) => {
    try {
      await api.put(`/sales/leads/${leadId}/assign`, { salesPersonId });
      loadData();
      setShowAssignModal(false);
    } catch (error) {
      alert('Failed to assign lead');
    }
  };

  const handleSetTarget = async (targetData) => {
    try {
      await api.post('/sales/targets', targetData);
      loadData();
      setShowTargetModal(false);
    } catch (error) {
      alert('Failed to set target');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sales Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your sales team</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTargetModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Target size={20} />
            Set Targets
          </button>
          <button
            onClick={() => {
              setSelectedLead(null);
              setShowAssignModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Assign Lead
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          icon={<BarChart3 size={18} />}
          text="Overview"
        />
        <TabButton
          active={activeTab === 'performance'}
          onClick={() => setActiveTab('performance')}
          icon={<Award size={18} />}
          text="Performance"
        />
        <TabButton
          active={activeTab === 'leads'}
          onClick={() => setActiveTab('leads')}
          icon={<Users size={18} />}
          text="All Leads"
        />
        <TabButton
          active={activeTab === 'targets'}
          onClick={() => setActiveTab('targets')}
          icon={<Target size={18} />}
          text="Targets"
        />
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <OverviewTab 
          performance={performance}
          salesPeople={salesPeople}
          allLeads={allLeads}
          formatCurrency={formatCurrency}
        />
      )}

      {activeTab === 'performance' && (
        <PerformanceTab
          performance={performance}
          formatCurrency={formatCurrency}
          onSelectSalesPerson={setSelectedSalesPerson}
        />
      )}

      {activeTab === 'leads' && (
        <LeadsTab
          leads={allLeads}
          salesPeople={salesPeople}
          onAssign={(lead) => {
            setSelectedLead(lead);
            setShowAssignModal(true);
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {activeTab === 'targets' && (
        <TargetsTab
          salesPeople={salesPeople}
          onSetTarget={() => setShowTargetModal(true)}
        />
      )}

      {/* Modals */}
      {showAssignModal && (
        <AssignLeadModal
          lead={selectedLead}
          salesPeople={salesPeople}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedLead(null);
          }}
          onAssign={handleAssignLead}
        />
      )}

      {showTargetModal && (
        <SetTargetModal
          salesPeople={salesPeople}
          onClose={() => setShowTargetModal(false)}
          onSave={handleSetTarget}
        />
      )}
    </div>
  );
};

// Tab Button
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

// Overview Tab
const OverviewTab = ({ performance, salesPeople, allLeads, formatCurrency }) => {
  const totalLeads = allLeads.length;
  const totalConverted = allLeads.filter(l => l.status === 'converted').length;
  const totalRevenue = allLeads
    .filter(l => l.status === 'converted')
    .reduce((sum, l) => sum + (l.actualValue || 0), 0);
  const avgConversionRate = performance.length > 0
    ? (performance.reduce((sum, p) => sum + parseFloat(p.conversionRate), 0) / performance.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="text-blue-600" size={24} />}
          title="Total Leads"
          value={totalLeads}
          subtitle={`${allLeads.filter(l => l.status === 'new').length} new`}
          color="blue"
        />
        <StatCard
          icon={<UserCheck className="text-green-600" size={24} />}
          title="Sales Team"
          value={salesPeople.length}
          subtitle={`${salesPeople.filter(s => s.active).length} active`}
          color="green"
        />
        {/* <StatCard
          icon={<DollarSign className="text-purple-600" size={24} />}
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={`${totalConverted} conversions`}
          color="purple"
        /> */}
        <StatCard
          icon={<TrendingUp className="text-orange-600" size={24} />}
          title="Avg Conversion"
          value={`${avgConversionRate}%`}
          subtitle="Team average"
          color="orange"
        />
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="text-yellow-500" size={20} />
          Top Performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performance
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3)
            .map((person, idx) => (
              <div key={person.salesPerson._id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{person.salesPerson.name}</p>
                    <p className="text-sm text-gray-500">{person.totalLeads} leads</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Converted:</span>
                    <span className="font-medium">{person.converted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium text-green-600">{person.conversionRate}%</span>
                  </div>
                  {/* <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(person.revenue)}</span>
                  </div> */}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="text-blue-600" size={20} />
          Recent Leads
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Person</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allLeads.slice(0, 5).map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{lead.clientName}</p>
                      <p className="text-sm text-gray-500">{lead.company}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{lead.salesPerson?.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{formatCurrency(lead.estimatedValue || 0)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Performance Tab
const PerformanceTab = ({ performance, formatCurrency, onSelectSalesPerson }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Leads</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Converted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversion Rate</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {performance.map((person) => (
                <tr key={person.salesPerson._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {person.salesPerson.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{person.salesPerson.name}</p>
                        <p className="text-sm text-gray-500">{person.salesPerson.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{person.totalLeads}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-green-600">{person.converted}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(person.conversionRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{person.conversionRate}%</span>
                    </div>
                  </td>
                  {/* <td className="px-6 py-4">
                    <p className="text-sm font-medium text-purple-600">{formatCurrency(person.revenue)}</p>
                  </td> */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onSelectSalesPerson(person.salesPerson)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Leads Tab
const LeadsTab = ({ leads, salesPeople, onAssign, formatCurrency }) => {
  const [filters, setFilters] = useState({
    salesPerson: 'all',
    status: 'all',
    search: ''
  });
const [selectedActivity, setSelectedActivity] = useState(null);
  const filteredLeads = leads.filter(lead => {
    if (filters.salesPerson !== 'all' && lead.salesPerson?._id !== filters.salesPerson) return false;
    if (filters.status !== 'all' && lead.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        lead.clientName.toLowerCase().includes(search) ||
        lead.clientEmail.toLowerCase().includes(search) ||
        (lead.company && lead.company.toLowerCase().includes(search))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            value={filters.salesPerson}
            onChange={(e) => setFilters({ ...filters, salesPerson: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sales People</option>
            {salesPeople.map(person => (
              <option key={person._id} value={person._id}>{person.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="negotiation">Negotiation</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
    <div className="bg-white rounded-lg shadow overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Follow-up</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activities</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200">
        {filteredLeads.map((lead) => {
          const latestActivity = lead.activities?.[lead.activities.length - 1];

          return (
            <tr key={lead._id} className="hover:bg-gray-50">

              {/* Client */}
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-gray-900">{lead.clientName}</p>
                  <p className="text-sm text-gray-500">{lead.clientEmail}</p>
                  {lead.company && (
                    <p className="text-xs text-gray-400">{lead.company}</p>
                  )}
                </div>
              </td>

              {/* Category */}
              <td className="px-6 py-4">
                <p className="text-sm text-gray-900 capitalize">{lead.category}</p>
              </td>

              {/* Assigned To */}
              <td className="px-6 py-4">
                <p className="text-sm text-gray-900">{lead.salesPerson?.name || "Unassigned"}</p>
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                  {lead.status.replace("_", " ")}
                </span>
              </td>

              {/* Next Follow-up */}
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600">
                  {latestActivity?.nextAction || "No Follow-up"}
                </p>
              </td>

              {/* Created */}
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </td>
{/* the Activities column in the table: */}
            <td className="px-6 py-4">
  {latestActivity ? (
    <button
      onClick={() => setSelectedActivity({ lead, activity: latestActivity })}
      className="text-left hover:bg-blue-50 rounded p-2 transition-colors w-full"
    >
      <div className="text-sm">
        <p className="font-medium text-gray-900 capitalize">
          {latestActivity.type}
        </p>
        <p className="text-gray-600 truncate max-w-[180px]">
          {latestActivity.outcome || latestActivity.description}
        </p>
        {latestActivity.nextAction && (
          <p className="text-xs text-blue-600">
            Next: {latestActivity.nextAction}
          </p>
        )}
      </div>
    </button>
  ) : (
    <p className="text-gray-400 text-sm">No Activity</p>
  )}
</td>

              {/* Actions */}
              <td className="px-6 py-4">
                <button
                  onClick={() => onAssign(lead)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <RefreshCw size={14} />
                  Reassign
                </button>
              </td>

            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>
{selectedActivity && (
  <ActivityDetailModal
    lead={selectedActivity.lead}
    activity={selectedActivity.activity}
    onClose={() => setSelectedActivity(null)}
  />
)}
    </div>
  );
};
// Activity Detail Modal
const ActivityDetailModal = ({ lead, activity, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold">Activity Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Lead: {lead.clientName} ({lead.company})
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Activity Type
            </label>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {activity.type}
            </p>
          </div>

          {/* Description */}
          {activity.description && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Description
              </label>
              <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {activity.description}
              </p>
            </div>
          )}

          {/* Outcome */}
          {activity.outcome && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Outcome
              </label>
              <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {activity.outcome}
              </p>
            </div>
          )}

          {/* Next Action */}
          {activity.nextAction && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Next Action
              </label>
              <p className="text-gray-900 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                {activity.nextAction}
              </p>
            </div>
          )}

          {/* Follow-up Date */}
          {activity.followUpDate && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Follow-up Date
              </label>
              <p className="text-gray-900 flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                {new Date(activity.followUpDate).toLocaleString()}
              </p>
            </div>
          )}

          {/* Duration */}
          {activity.duration && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Duration
              </label>
              <p className="text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-gray-600" />
                {activity.duration} minutes
              </p>
            </div>
          )}

          {/* Created At */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Created At
            </label>
            <p className="text-sm text-gray-600">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
// Targets Tab
const TargetsTab = ({ salesPeople, onSetTarget }) => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTargets();
  }, []);

  const loadTargets = async () => {
    try {
      const promises = salesPeople.map(person =>
        api.get(`/sales/my-targets?salesPersonId=${person._id}`)
      );
      const results = await Promise.all(promises);
      const allTargets = results.map((res, idx) => ({
        salesPerson: salesPeople[idx],
        targets: res.data.targets
      }));
      setTargets(allTargets);
    } catch (error) {
      console.error('Failed to load targets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading targets...</div>;
  }

  return (
    <div className="space-y-6">
      {targets.map(({ salesPerson, targets: personTargets }) => (
        <div key={salesPerson._id} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {salesPerson.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{salesPerson.name}</h3>
                <p className="text-sm text-gray-500">{salesPerson.email}</p>
              </div>
            </div>
          </div>

          {personTargets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No targets set</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personTargets[0] && (
                <>
                  <TargetProgressCard
                    title="Leads Target"
                    achieved={personTargets[0].leadsAchieved}
                    target={personTargets[0].leadsTarget}
                  />
                  <TargetProgressCard
                    title="Conversions Target"
                    achieved={personTargets[0].conversionsAchieved}
                    target={personTargets[0].conversionsTarget}
                  />
                  {/* <TargetProgressCard
                    title="Revenue Target"
                    achieved={personTargets[0].revenueAchieved}
                    target={personTargets[0].revenueTarget}
                    isCurrency
                  /> */}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
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

// Target Progress Card
const TargetProgressCard = ({ title, achieved, target, isCurrency = false }) => {
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
        <span className="text-sm font-medium text-gray-700">{title}</span>
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

// Assign Lead Modal
const AssignLeadModal = ({ lead, salesPeople, onClose, onAssign }) => {
    // console.log(salesPeople)
  const [selectedSalesPerson, setSelectedSalesPerson] = useState('');
  const [formData, setFormData] = useState({
    clientName: lead?.clientName || '',
    clientEmail: lead?.clientEmail || '',
    clientPhone: lead?.clientPhone || '',
    company: lead?.company || '',
    estimatedValue: lead?.estimatedValue || '',
    description: lead?.description || ''
  });

  const handleAssign = () => {
    if (lead) {
      // Reassigning existing lead
      onAssign(lead._id, selectedSalesPerson);
    } else {
      // Creating new lead with assignment
      api.post('/sales/leads', {
        ...formData,
        salesPerson: selectedSalesPerson
      }).then(() => {
        onClose();
        window.location.reload();
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {lead ? 'Reassign Lead' : 'Create & Assign Lead'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {lead ? (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-gray-900">{lead.clientName}</p>
              <p className="text-sm text-gray-600">{lead.clientEmail}</p>
              <p className="text-sm text-gray-600">{lead.clientPhone}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Client Name *"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Estimated Value (₹)"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Sales Person *
            </label>
            <select
              value={selectedSalesPerson}
              onChange={(e) => setSelectedSalesPerson(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Sales Person</option>
              {salesPeople.map(person => (
                <option key={person._id} value={person._id}>
                  {person.name} - {person.email}
                </option>
              ))}
            </select>
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
            onClick={handleAssign}
            disabled={!selectedSalesPerson || (!lead && (!formData.clientName || !formData.clientEmail || !formData.clientPhone))}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <UserCheck size={18} />
            {lead ? 'Reassign' : 'Create & Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Set Target Modal
const SetTargetModal = ({ salesPeople, onClose, onSave }) => {
  const [targetData, setTargetData] = useState({
    salesPersonId: '',
    targetType: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    leadsTarget: '',
    conversionsTarget: '',
    revenueTarget: '',
    notes: ''
  });

  const handleSave = () => {
    onSave(targetData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Set Sales Target</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sales Person *
            </label>
            <select
              value={targetData.salesPersonId}
              onChange={(e) => setTargetData({ ...targetData, salesPersonId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Sales Person</option>
              {salesPeople.map(person => (
                <option key={person._id} value={person._id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Type
              </label>
              <select
                value={targetData.targetType}
                onChange={(e) => setTargetData({ ...targetData, targetType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                value={targetData.year}
                onChange={(e) => setTargetData({ ...targetData, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {targetData.targetType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={targetData.month}
                onChange={(e) => setTargetData({ ...targetData, month: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leads Target
            </label>
            <input
              type="number"
              value={targetData.leadsTarget}
              onChange={(e) => setTargetData({ ...targetData, leadsTarget: parseInt(e.target.value) || 0 })}
              placeholder="Number of leads"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conversions Target
            </label>
            <input
              type="number"
              value={targetData.conversionsTarget}
              onChange={(e) => setTargetData({ ...targetData, conversionsTarget: parseInt(e.target.value) || 0 })}
              placeholder="Number of conversions"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revenue Target (₹)
            </label>
            <input
              type="number"
              value={targetData.revenueTarget}
              onChange={(e) => setTargetData({ ...targetData, revenueTarget: parseInt(e.target.value) || 0 })}
              placeholder="Target revenue"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={targetData.notes}
              onChange={(e) => setTargetData({ ...targetData, notes: e.target.value })}
              rows="2"
              placeholder="Additional notes..."
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
            disabled={!targetData.salesPersonId}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Target size={18} />
            Set Target
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function for status colors
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

export default SalesManagement;