import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLogs } from '../../../features/activityLog/activityLogSlice';
import { Calendar, Filter, User, Clock } from 'lucide-react';

export default function ActivityLogs() {
  const dispatch = useDispatch();
  const { logs, loading } = useSelector((s) => s.activityLog);
  
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    role: ''
  });

  useEffect(() => {
    dispatch(fetchLogs(filters));
  }, [dispatch, filters]);

  const groupLogsByDate = (logs) => {
    return logs.reduce((acc, log) => {
      const date = new Date(log.loginTime).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {});
  };

  const groupedLogs = groupLogsByDate(logs);

  const formatTime = (date) => {
    return date ? new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : 'N/A';
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Active';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline w-4 h-4 mr-1" />
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="border rounded px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            className="border rounded px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Filter className="inline w-4 h-4 mr-1" />
            Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => setFilters({...filters, role: e.target.value})}
            className="border rounded px-3 py-2"
          >
            <option value="">All Roles</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="sales">Sales</option>
            <option value="client">Client</option>
          </select>
        </div>
      </div>

      {/* Logs by Date */}
      {loading ? (
        <div className="text-center py-8">Loading logs...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
                {date}
              </div>
              
              <div className="divide-y">
                {dateLogs.map((log) => (
                  <div key={log._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 rounded-full p-2">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {log.userName}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {log.userRole.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="text-gray-500 text-xs">Login</div>
                          <div className="font-medium text-green-600">
                            {formatTime(log.loginTime)}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-gray-500 text-xs">Logout</div>
                          <div className="font-medium text-red-600">
                            {formatTime(log.logoutTime)}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-gray-500 text-xs flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Duration
                          </div>
                          <div className="font-medium text-blue-600">
                            {formatDuration(log.sessionDuration)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(groupedLogs).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No activity logs found for the selected period
            </div>
          )}
        </div>
      )}
    </div>
  );
}