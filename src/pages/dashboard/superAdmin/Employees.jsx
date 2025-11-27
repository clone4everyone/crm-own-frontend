import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  fetchPendingUsers,
  approveUser,
  updateUser
} from '../../../features/user/userSlice';
import {
  Users,
  Bell,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Edit2,
  Save,
  Check,
  X,
  UserCheck,
  Briefcase,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const Employees = () => {
  const dispatch = useDispatch();
  const { list: employees, pendingUsers, loading, pendingLoading } = useSelector((s) => s.users);
  
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchPendingUsers());
  }, [dispatch]);

  const handleApprove = async (userId, role) => {
    try {
      await dispatch(approveUser({ userId, isApproved: true, role })).unwrap();
      alert('User approved successfully!');
      dispatch(fetchPendingUsers());
      dispatch(fetchUsers());
    } catch (err) {
      alert('Failed to approve user: ' + (err.message || 'Unknown error'));
    }
  };

  const handleReject = async (userId) => {
    try {
      await dispatch(approveUser({ userId, isApproved: false })).unwrap();
      alert('User rejected successfully!');
      dispatch(fetchPendingUsers());
    } catch (err) {
      alert('Failed to reject user: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee._id);
    setEditForm({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      address: employee.address || '',
      role: employee.role || 'developer',
      salary: employee.salary || 0,
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '',
      active: employee.active
    });
  };

  const handleSaveEdit = async (userId) => {
    try {
      await dispatch(updateUser({ userId, userData: editForm })).unwrap();
      alert('Employee updated successfully!');
      setEditingEmployee(null);
      dispatch(fetchUsers());
    } catch (err) {
      alert('Failed to update employee: ' + (err.message || 'Unknown error'));
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setEditForm({});
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      sales: 'bg-blue-100 text-blue-800',
      designer: 'bg-pink-100 text-pink-800',
      developer: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const formatRole = (role) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && emp.active) ||
                          (statusFilter === 'inactive' && !emp.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pending Requests Modal
  if (showPendingRequests) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-orange-600" />
            Pending Approval Requests
            {pendingUsers.length > 0 && (
              <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </h2>
          <button
            onClick={() => setShowPendingRequests(false)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <X size={20} />
            Close
          </button>
        </div>

        {pendingLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <UserCheck className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-lg">No pending approval requests</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((user) => (
              <PendingUserCard 
                key={user._id} 
                user={user} 
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Main Employees List
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-blue-600" />
          Employees Management
        </h2>
        <button
          onClick={() => setShowPendingRequests(true)}
          className="relative flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          <Bell size={20} />
          Pending Requests
          {pendingUsers.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[24px] text-center">
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="sales">Sales Person</option>
            <option value="designer">UI/UX Designer</option>
            <option value="developer">Developer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-600">Total Employees:</span>
            <span className="font-bold text-blue-600">{filteredEmployees.length}</span>
          </div>
        </div>
      </div>

      {/* Employees Table */}
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
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joining Date
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
                {filteredEmployees.map((employee) => (
                  <React.Fragment key={employee._id}>
                    {editingEmployee === employee._id ? (
                      <EmployeeEditRow 
                        employee={employee}
                        editForm={editForm}
                        onInputChange={handleInputChange}
                        onSave={() => handleSaveEdit(employee._id)}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <EmployeeViewRow 
                        employee={employee}
                        onEdit={() => handleEditClick(employee)}
                        formatRole={formatRole}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        getRoleBadgeColor={getRoleBadgeColor}
                      />
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600">No employees found matching your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Employee View Row Component
const EmployeeViewRow = ({ employee, onEdit, formatRole, formatCurrency, formatDate, getRoleBadgeColor }) => (
  <tr className="hover:bg-gray-50 transition">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
          {employee.name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
          <div className="text-sm text-gray-500">{employee.email}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      <div className="flex items-center gap-1">
        <Phone size={14} />
        {employee.phone || 'N/A'}
      </div>
      <div className="text-xs text-gray-400 truncate max-w-[150px] flex items-center gap-1 mt-1">
        <MapPin size={12} />
        {employee.address || 'N/A'}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ₹{getRoleBadgeColor(employee.role)}`}>
        {formatRole(employee.role)}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      {formatCurrency(employee.salary)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {formatDate(employee.joiningDate)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ₹{
        employee.active 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {employee.active ? 'Active' : 'Inactive'}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm">
      <button
        onClick={onEdit}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
      >
        <Edit2 size={16} />
        Edit
      </button>
    </td>
  </tr>
);

// Employee Edit Row Component
const EmployeeEditRow = ({ employee, editForm, onInputChange, onSave, onCancel }) => (
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
    <td className="px-6 py-4">
      <input
        type="number"
        value={editForm.salary}
        onChange={(e) => onInputChange('salary', parseFloat(e.target.value) || 0)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
        placeholder="Salary"
      />
    </td>
    <td className="px-6 py-4">
      <input
        type="date"
        value={editForm.joiningDate}
        onChange={(e) => onInputChange('joiningDate', e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
      />
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

// Pending User Card Component
const PendingUserCard = ({ user, onApprove, onReject }) => {
  const [selectedRole, setSelectedRole] = useState('client');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-orange-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            {user.phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Phone size={14} />
                {user.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="sales">Sales Person</option>
            <option value="designer">UI/UX Designer</option>
            <option value="developer">Developer</option>
            <option value="client">Client</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => onApprove(user._id, selectedRole)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
              <Check size={16} />
              Approve
            </button>
            <button
              onClick={() => onReject(user._id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              <X size={16} />
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;