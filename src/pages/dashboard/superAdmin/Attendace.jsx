import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Calendar, 
  Clock, 
  Users, 
  Edit2, 
  Save, 
  X, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  AlertCircle,
  Download
} from 'lucide-react';
import {
  fetchTodayAttendance,
  fetchMonthlyAttendance,
  markAttendance,
  updateAttendance,
  fetchAttendanceStats,
  updateLocalAttendance,
  clearError,
  clearSuccess,
  selectTodayAttendance,
  selectMonthlyAttendance,
  selectAttendanceStats,
  selectAttendanceLoading,
  selectAttendanceError,
  selectAttendanceSuccess
} from '../../../features/attendance/attendanceSlice';
import api from '../../../api/axios';

const Attendace = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const todayAttendance = useSelector(selectTodayAttendance);
  const monthlyAttendance = useSelector(selectMonthlyAttendance);
  const statistics = useSelector(selectAttendanceStats);
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);
  const success = useSelector(selectAttendanceSuccess);

  // Local state
  const [activeTab, setActiveTab] = useState('today');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const statusOptions = ['present', 'absent', 'half_day', 'leave', 'work_from_home'];
  const statusColors = {
    present: 'bg-green-100 text-green-800 border-green-300',
    absent: 'bg-red-100 text-red-800 border-red-300',
    half_day: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    leave: 'bg-blue-100 text-blue-800 border-blue-300',
    work_from_home: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  // Load employees on mount
  useEffect(() => {
    loadEmployees();
    dispatch(fetchTodayAttendance());
  }, [dispatch]);

  // Load monthly attendance when employee or month changes
  useEffect(() => {
    if (selectedEmployee && activeTab === 'monthly') {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1;
      dispatch(fetchMonthlyAttendance({ 
        userId: selectedEmployee._id, 
        year, 
        month 
      }));
      
      // Also fetch statistics
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      dispatch(fetchAttendanceStats({ 
        userId: selectedEmployee._id, 
        startDate, 
        endDate 
      }));
    }
  }, [selectedEmployee, selectedMonth, activeTab, dispatch]);

  // Clear messages after delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const loadEmployees = async () => {
    // Replace with actual API call
    const response = await api.get('/admin/users/attendance');
    const mockEmployees = [
      { _id: '1', name: 'John Designer', role: 'designer', email: 'john@example.com' },
      { _id: '2', name: 'Sarah Developer', role: 'developer', email: 'sarah@example.com' },
      { _id: '3', name: 'Mike Sales', role: 'sales', email: 'mike@example.com' },
      { _id: '4', name: 'Emma Designer', role: 'designer', email: 'emma@example.com' },
    ];
    // console.log(response)
    setEmployees(response.data.users);
  };

  const handleStartEdit = (attendance) => {
    setEditingId(attendance._id);
    setEditFormData({
      status: attendance.status,
      checkIn: attendance.checkIn ? new Date(attendance.checkIn).toTimeString().slice(0, 5) : '',
      checkOut: attendance.checkOut ? new Date(attendance.checkOut).toTimeString().slice(0, 5) : '',
      remarks: attendance.remarks || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleFieldChange = (field, value) => {
    setEditFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total hours
      if ((field === 'checkIn' || field === 'checkOut') && updated.checkIn && updated.checkOut) {
        const start = new Date(`2000-01-01T${updated.checkIn}`);
        const end = new Date(`2000-01-01T${updated.checkOut}`);
        const hours = (end - start) / (1000 * 60 * 60);
        updated.totalHours = Math.max(0, parseFloat(hours.toFixed(2)));
      }
      
      return updated;
    });
  };

  const handleSaveAttendance = async (attendance) => {
    const today = new Date().toISOString().split('T')[0];
    
    const attendanceData = {
      userId: attendance.user._id,
      date: today,
      status: editFormData.status,
      checkIn: editFormData.checkIn ? `${today}T${editFormData.checkIn}:00` : null,
      checkOut: editFormData.checkOut ? `${today}T${editFormData.checkOut}:00` : null,
      totalHours: editFormData.totalHours || 0,
      remarks: editFormData.remarks
    };

    if (attendance._id && !attendance._id.startsWith('temp-')) {
      // Update existing
      await dispatch(updateAttendance({ 
        attendanceId: attendance._id, 
        updates: attendanceData 
      }));
    } else {
      // Create new
      await dispatch(markAttendance(attendanceData));
    }
    
    handleCancelEdit();
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getAttendanceForDate = (day) => {
    const dateStr = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day)
      .toISOString().split('T')[0];
    return monthlyAttendance.find(a => a.date.startsWith(dateStr));
  };

  const changeMonth = (direction) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedMonth(newDate);
  };

  const exportToCSV = () => {
    if (!monthlyAttendance.length) return;
    
    const headers = ['Date', 'Status', 'Check In', 'Check Out', 'Total Hours', 'Remarks'];
    const rows = monthlyAttendance.map(a => [
      new Date(a.date).toLocaleDateString(),
      a.status,
      a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '',
      a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '',
      a.totalHours || 0,
      a.remarks || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedEmployee.name}-${selectedMonth.getFullYear()}-${selectedMonth.getMonth() + 1}.csv`;
    a.click();
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedMonth);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    weekDays.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="text-center font-semibold text-gray-600 py-2 text-sm">
          {day}
        </div>
      );
    });

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const attendance = getAttendanceForDate(day);
      const isToday = new Date().getDate() === day && 
                      new Date().getMonth() === selectedMonth.getMonth() &&
                      new Date().getFullYear() === selectedMonth.getFullYear();

      days.push(
        <div
          key={day}
          className={`p-2 border rounded-lg min-h-[90px] transition-all hover:shadow-md ${
            isToday ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
          }`}
        >
          <div className="font-semibold text-sm mb-1">{day}</div>
          {attendance ? (
            <div>
              <div className={`text-xs px-2 py-1 rounded border ${statusColors[attendance.status]}`}>
                {attendance.status.replace('_', ' ').toUpperCase()}
              </div>
              {attendance.totalHours > 0 && (
                <div className="text-xs mt-1 text-gray-600 font-medium">
                  {attendance.totalHours}h
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">No record</div>
          )}
        </div>
      );
    }

    return days;
  };

  const renderTodayAttendance = () => {
    // Merge employees with their attendance records
    // console.log(todayAttendance)
    const attendanceMap = new Map(todayAttendance.map(a => [a.user._id || a.user, a]));
  
    const displayData = employees.map(emp => {
      const existingAttendance = attendanceMap.get(emp._id);
      if (existingAttendance) {
        return existingAttendance;
      }
      
      // Create temporary record for employees without attendance
      return {
        _id: `temp-${emp._id}`,
        user: emp,
        date: new Date().toISOString(),
        status: 'absent',
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        remarks: ''
      };
    });
// console.log(displayData)
    return displayData.map(attendance => {
      const isEditing = editingId === attendance._id;
      const displayData = isEditing ? editFormData : {
        status: attendance.status,
        checkIn: attendance.checkIn ? new Date(attendance.checkIn).toTimeString().slice(0, 5) : '',
        checkOut: attendance.checkOut ? new Date(attendance.checkOut).toTimeString().slice(0, 5) : '',
        remarks: attendance.remarks || '',
        totalHours: attendance.totalHours || 0
      };

      return (
        <tr key={attendance._id} className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4">
            <div className="font-medium text-gray-900">{attendance.user.name}</div>
            <div className="text-sm text-gray-500">{attendance.user.email}</div>
          </td>
          <td className="px-6 py-4">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
              {attendance.user.role}
            </span>
          </td>
          <td className="px-6 py-4">
            <select
              value={displayData.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              disabled={!isEditing}
              className={`px-3 py-1 rounded-md text-sm font-medium border ${
                statusColors[displayData.status]
              } ${!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </td>
          <td className="px-6 py-4">
            <input
              type="time"
              value={displayData.checkIn}
              onChange={(e) => handleFieldChange('checkIn', e.target.value)}
              disabled={!isEditing}
              className="border rounded px-2 py-1 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </td>
          <td className="px-6 py-4">
            <input
              type="time"
              value={displayData.checkOut}
              onChange={(e) => handleFieldChange('checkOut', e.target.value)}
              disabled={!isEditing}
              className="border rounded px-2 py-1 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </td>
          <td className="px-6 py-4">
            <span className="font-medium">{displayData.totalHours || 0} hrs</span>
          </td>
          <td className="px-6 py-4">
            <input
              type="text"
              value={displayData.remarks}
              onChange={(e) => handleFieldChange('remarks', e.target.value)}
              disabled={!isEditing}
              placeholder="Add remarks..."
              className="border rounded px-2 py-1 text-sm w-full disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </td>
          <td className="px-6 py-4">
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSaveAttendance(attendance)}
                  disabled={loading}
                  className="text-green-600 hover:text-green-800 disabled:text-gray-400 transition-colors"
                  title="Save"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="text-red-600 hover:text-red-800 disabled:text-gray-400 transition-colors"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleStartEdit(attendance)}
                disabled={editingId !== null}
                className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage employee attendance</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Attendance updated successfully!
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'today'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Clock className="w-5 h-5 inline mr-2" />
            Today's Attendance
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'monthly'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Monthly View
          </button>
        </div>

        {/* Today's Attendance Tab */}
        {activeTab === 'today' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Today's Attendance - {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
            </div>
            <div className="overflow-x-auto">
              {loading && activeTab === 'today' ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading attendance...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {renderTodayAttendance()}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Monthly View Tab */}
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            {/* Employee Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee
              </label>
              <select
                value={selectedEmployee?._id || ''}
                onChange={(e) => {
                  const emp = employees.find(emp => emp._id === e.target.value);
                  setSelectedEmployee(emp);
                }}
                className="w-full md:w-96 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose an employee...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} - {emp.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Statistics Cards */}
            {selectedEmployee && statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Present</p>
                      <p className="text-2xl font-bold text-green-600">{statistics.present}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-red-600">{statistics.absent}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Hours</p>
                      <p className="text-2xl font-bold text-blue-600">{statistics.totalHours.toFixed(1)}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Hours/Day</p>
                      <p className="text-2xl font-bold text-purple-600">{statistics.averageHours.toFixed(1)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Calendar View */}
            {selectedEmployee && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {selectedEmployee.name}'s Attendance
                    </h3>
                    <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                    <button
                      onClick={() => changeMonth(-1)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      ← Prev
                    </button>
                    <span className="font-semibold text-lg min-w-[180px] text-center">
                      {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => changeMonth(1)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading calendar...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-7 gap-2">
                      {renderCalendar()}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-6 border-t flex flex-wrap gap-4">
                      <h4 className="w-full font-semibold text-gray-700 mb-2">Legend:</h4>
                      {statusOptions.map(status => (
                        <div key={status} className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded border ${statusColors[status]}`}></div>
                          <span className="text-sm text-gray-600 capitalize">
                            {status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendace;