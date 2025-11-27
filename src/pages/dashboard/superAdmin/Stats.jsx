import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats } from '../../../features/stats/statsSlice';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  CheckCircle,
  Clock,
  Users,
  UserCheck,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee
} from 'lucide-react';
import Snowfall from '../../../components/SnowFall';

const Stats = () => {
  const dispatch = useDispatch();
  const { overview, financial, charts, topClients, recentProjects, loading } = useSelector((s) => s.stats);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800'
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

  // Colors for charts
  const STATUS_COLORS = ['#FCD34D', '#60A5FA', '#34D399', '#FB923C', '#F87171'];
  const PRIORITY_COLORS = ['#9CA3AF', '#60A5FA', '#FB923C', '#EF4444'];

  // Prepare monthly data for charts
  const monthlyData = charts.completedProjectsByMonth.map((item, index) => {
    const monthName = new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' });
    const earnings = charts.earningsByMonth.find(
      e => e._id.year === item._id.year && e._id.month === item._id.month
    );
    return {
      month: monthName,
      projects: item.count,
      earnings: earnings ? earnings.earnings : 0
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
  <Snowfall snowflakeCount={50} duration={12}/>
    
     <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={20} />
          <span className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        <MetricCard
          icon={<Briefcase className="text-blue-600" size={24} />}
          title="Total Projects"
          value={overview.totalProjects}
          subtitle={`${overview.completedProjects} completed`}
          color="blue"
        
        />
        <MetricCard
          icon={<IndianRupee className="text-green-600" size={24} />}
          title="Total Earnings"
          value={formatCurrency(financial.totalEarnings)}
          subtitle={`${formatCurrency(financial.pendingPayments)} pending`}
          color="green"
          trend={financial.netProfit > 0 ? 'up' : 'down'}
        />
        <MetricCard
          icon={<Users className="text-purple-600" size={24} />}
          title="Active Employees"
          value={overview.activeEmployees}
          subtitle={`${overview.totalClients} clients`}
          color="purple"
        />
        <MetricCard
          icon={<TrendingUp className="text-orange-600" size={24} />}
          title="Net Profit"
          value={<p className='animate-bounce'>{formatCurrency(financial.netProfit)}</p>}
          subtitle={`After ${formatCurrency(financial.totalMonthlySalary)} salaries`}
          color="orange"
          trend={financial.netProfit > 0 ? 'up' : 'down'}
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <IndianRupee size={20} />
            Financial Summary
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-blue-100 text-sm">Total Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(financial.totalBudget)}</p>
            </div>
            <div className="border-t border-blue-400 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Received</span>
                <span className="font-semibold">{formatCurrency(financial.totalEarnings)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Pending</span>
                <span className="font-semibold animate-bounce">{formatCurrency(financial.pendingPayments)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Expenses</span>
                <span className="font-semibold text-red-300">{formatCurrency(financial.totalMonthlySalary)}</span>
              </div>
            </div>
            <div className="border-t border-blue-400 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Net Profit</span>
                <span className={`text-xl font-bold ₹{financial.netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(financial.netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Monthly Earnings Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Earnings"
                dot={{ fill: '#3B82F6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Status Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Projects by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.projectsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, count }) => `${label}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {charts.projectsByStatus.map((entry, index) => (
                  <Cell key={`cell-₹{index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {charts.projectsByStatus.map((item, index) => (
              <div key={item.status} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{item.label}: {item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Projects Bar Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Completed Projects (Monthly)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="projects" fill="#10B981" name="Completed Projects" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Clients and Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <UserCheck className="text-blue-600" size={20} />
            Top Clients by Revenue
          </h3>
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div key={client._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.projectCount} projects</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(client.totalPaid)}</p>
                </div>
              </div>
            ))}
            {topClients.length === 0 && (
              <p className="text-center text-gray-500 py-8">No client data available</p>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            Recent Projects
          </h3>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div key={project._id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.client?.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ₹{getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Budget: {formatCurrency(project.budget || 0)}</span>
                  <span className="text-gray-500">{formatDate(project.createdAt)}</span>
                </div>
              </div>
            ))}
            {recentProjects.length === 0 && (
              <p className="text-center text-gray-500 py-8">No recent projects</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
   
  );
};

// Metric Card Component
const MetricCard = ({ icon, title, value, subtitle, color, trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className={`bg-gradient-to-r ₹{colorClasses[color]} p-4`}>
        <div className="flex items-center justify-between">
          <div className="bg-white/20 p-3 rounded-lg">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-white text-sm font-medium`}>
              {trend === 'up' ? (
                <>
                  <ArrowUpRight size={16} />
                  <span>Profit</span>
                </>
              ) : (
                <>
                  <ArrowDownRight size={16} />
                  <span>Loss</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
};

export default Stats;