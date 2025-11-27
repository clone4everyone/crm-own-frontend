import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClients,
  fetchPendingClients,
  approveClient,
  updateClient,
  updateClientStatus
} from '../../../features/client/clientSlice';
import {
  Users,
  Bell,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Edit2,
  Save,
  Check,
  X,
  UserCheck,
  FolderOpen,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const Client = () => {
  const dispatch = useDispatch();
  const { list: clients, pendingClients, loading, pendingLoading } = useSelector((s) => s.clients);
  
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewingClient, setViewingClient] = useState(null);

  useEffect(() => {
    dispatch(fetchClients());
    // dispatch(fetchPendingClients());
  }, [dispatch]);

  const handleApprove = async (clientId) => {
    try {
      await dispatch(approveClient({ clientId, isApproved: true })).unwrap();
      alert('Client approved successfully!');
      dispatch(fetchPendingClients());
      dispatch(fetchClients());
    } catch (err) {
      alert('Failed to approve client: ' + (err.message || 'Unknown error'));
    }
  };

  const handleReject = async (clientId) => {
    try {
      await dispatch(approveClient({ clientId, isApproved: false })).unwrap();
      alert('Client rejected successfully!');
      dispatch(fetchPendingClients());
    } catch (err) {
      alert('Failed to reject client: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEditClick = (client) => {
    setEditingClient(client._id);
    setEditForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      active: client.active,
      role: client.role
    });
  };

  const handleSaveEdit = async (clientId) => {
    try {
      await dispatch(updateClient({ clientId, clientData: editForm })).unwrap();
      alert('Client updated successfully!');
      setEditingClient(null);
      dispatch(fetchClients());
    } catch (err) {
      alert('Failed to update client: ' + (err.message || 'Unknown error'));
    }
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setEditForm({});
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };
 const formatRole = (role) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  const handleStatusToggle = async (clientId, currentStatus) => {
    try {
      await dispatch(updateClientStatus({ clientId, active: !currentStatus })).unwrap();
      alert(`Client ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      dispatch(fetchClients());
    } catch (err) {
      alert('Failed to update status: ' + (err.message || 'Unknown error'));
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.phone && client.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && client.active) ||
                          (statusFilter === 'inactive' && !client.active);
    return matchesSearch && matchesStatus;
  });

  // Pending Requests Modal
  // if (showPendingRequests) {
  //   return (
  //     <div className="space-y-6">
  //       <div className="flex items-center justify-between">
  //         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
  //           <Bell className="text-orange-600" />
  //           Pending Client Requests
  //           {pendingClients.length > 0 && (
  //             <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
  //               {pendingClients.length}
  //             </span>
  //           )}
  //         </h2>
  //         <button
  //           onClick={() => setShowPendingRequests(false)}
  //           className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
  //         >
  //           <X size={20} />
  //           Close
  //         </button>
  //       </div>

  //       {pendingLoading ? (
  //         <div className="text-center py-12">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
  //         </div>
  //       ) : pendingClients.length === 0 ? (
  //         <div className="bg-white rounded-lg shadow p-12 text-center">
  //           <UserCheck className="mx-auto text-gray-400 mb-4" size={64} />
  //           <p className="text-gray-600 text-lg">No pending client requests</p>
  //         </div>
  //       ) : (
  //         <div className="grid gap-4">
  //           {pendingClients.map((client) => (
  //             <PendingClientCard 
  //               key={client._id} 
  //               client={client} 
  //               onApprove={handleApprove}
  //               onReject={handleReject}
  //             />
  //           ))}
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // Client Details Modal
  if (viewingClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Client Details</h2>
          <button
            onClick={() => setViewingClient(null)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <X size={20} />
            Close
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {viewingClient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{viewingClient.name}</h3>
                <p className="text-blue-100">{viewingClient.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <DetailItem 
                icon={<Mail size={20} />}
                label="Email"
                value={viewingClient.email}
              />
              <DetailItem 
                icon={<Phone size={20} />}
                label="Phone"
                value={viewingClient.phone || 'Not provided'}
              />
              <DetailItem 
                icon={<MapPin size={20} />}
                label="Address"
                value={viewingClient.address || 'Not provided'}
              />
              <DetailItem 
                icon={<Calendar size={20} />}
                label="Joined"
                value={formatDate(viewingClient.joiningDate)}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FolderOpen className="text-blue-600" />
                Projects ({viewingClient.projectCount})
              </h3>
              {viewingClient.projects && viewingClient.projects.length > 0 ? (
                <div className="grid gap-3">
                  {viewingClient.projects.map((project) => (
                    <div key={project._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Deadline: {formatDate(project.deadline)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {formatStatus(project.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No projects assigned</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 flex gap-3 justify-end">
            <button
              onClick={() => {
                setViewingClient(null);
                handleEditClick(viewingClient);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit2 size={20} />
              Edit Client
            </button>
            <button
              onClick={() => {
                handleStatusToggle(viewingClient._id, viewingClient.active);
                setViewingClient(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                viewingClient.active 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {viewingClient.active ? <ToggleLeft size={20} /> : <ToggleRight size={20} />}
              {viewingClient.active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Clients List
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-blue-600" />
          Clients Management
        </h2>
        {/* <button
          onClick={() => setShowPendingRequests(true)}
          className="relative flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          <Bell size={20} />
          Pending Requests
          {pendingClients.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[24px] text-center">
              {pendingClients.length}
            </span>
          )}
        </button> */}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                   
                  <th  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <React.Fragment key={client._id}>
                    {editingClient === client._id ? (
                      <ClientEditRow 
                        client={client}
                        editForm={editForm}
                        onInputChange={handleInputChange}
                        onSave={() => handleSaveEdit(client._id)}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <ClientViewRow 
                        client={client}
                        onEdit={() => handleEditClick(client)}
                         formatRole={formatRole}
                        onView={() => setViewingClient(client)}
                        formatDate={formatDate}
                      />
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600">No clients found matching your filters</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="text-blue-600" size={24} />
          <div>
            <p className="text-sm font-medium text-gray-700">Total Clients</p>
            <p className="text-2xl font-bold text-blue-600">{filteredClients.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FolderOpen className="text-blue-600" size={24} />
          <div>
            <p className="text-sm font-medium text-gray-700">Total Projects</p>
            <p className="text-2xl font-bold text-blue-600">
              {filteredClients.reduce((sum, client) => sum + (client.projectCount || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Client View Row Component
const ClientViewRow = ({ client, onEdit, onView, formatDate, formatRole }) => (
  <tr className="hover:bg-gray-50 transition">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{client.name}</div>
          <div className="text-sm text-gray-500">{client.email}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      <div className="flex items-center gap-1">
        <Phone size={14} />
        {client.phone || 'N/A'}
      </div>
      <div className="text-xs text-gray-400 truncate max-w-[150px] flex items-center gap-1 mt-1">
        <MapPin size={12} />
        {client.address || 'N/A'}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ₹{getRoleBadgeColor(employee.role)}`}>
        {formatRole(client.role)}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <FolderOpen size={16} className="text-blue-600" />
        <span className="text-sm font-medium text-gray-900">
          {client.projectCount || 0} {client.projectCount === 1 ? 'Project' : 'Projects'}
        </span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {formatDate(client.joiningDate)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        client.active 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {client.active ? 'Active' : 'Inactive'}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm">
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
        >
          <Eye size={16} />
          View
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium"
        >
          <Edit2 size={16} />
          Edit
        </button>
      </div>
    </td>
  </tr>
);

// Client Edit Row Component
const ClientEditRow = ({ client, editForm, onInputChange, onSave, onCancel }) => (
  <tr className="bg-blue-50">
    <td className="px-6 py-4">
      <div className="space-y-2">
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="Name"
        />
        <input
          type="email"
          value={editForm.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="Email"
        />
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-2">
        <input
          type="text"
          value={editForm.phone}
          onChange={(e) => onInputChange('phone', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="Phone"
        />
        <input
          type="text"
          value={editForm.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="Address"
        />
      </div>
    </td>
     <td className="px-6 py-4">
      <select
        value={editForm.role}
        onChange={(e) => onInputChange('role', e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
      >
        <option value="super_admin">Super Admin</option>
        <option value="sales">Sales Person</option>
        <option value="designer">UI/UX Designer</option>
        <option value="developer">Developer</option>
         <option value="client">Client</option>
      </select>
    </td>
    <td className="px-6 py-4 text-sm text-gray-500">
      {client.projectCount || 0} Projects
    </td>
    <td className="px-6 py-4 text-sm text-gray-500">
      -
    </td>
    <td className="px-6 py-4">
      <select
        value={editForm.active}
        onChange={(e) => onInputChange('active', e.target.value === 'true')}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
      >
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </td>
    <td className="px-6 py-4">
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          <Save size={16} />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </td>
  </tr>
);

// Pending Client Card Component
const PendingClientCard = ({ client, onApprove, onReject }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-orange-200">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-600">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
          <p className="text-sm text-gray-600">{client.email}</p>
          {client.phone && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Phone size={14} />
              {client.phone}
            </p>
          )}
          {client.address && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={14} />
              {client.address}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onApprove(client._id)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
        >
          <Check size={16} />
          Approve
        </button>
        <button
          onClick={() => onReject(client._id)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
        >
          <X size={16} />
          Reject
        </button>
      </div>
    </div>
  </div>
);

// Detail Item Component
const DetailItem = ({ icon, label, value, valueColor = 'text-gray-900' }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-400 mt-1">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`font-medium ${valueColor}`}>{value}</p>
    </div>
  </div>
);

export default Client;