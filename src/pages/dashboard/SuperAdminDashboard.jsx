
import { useState } from 'react';
import { Menu, X, BarChart3, PlusCircle, ClipboardList, Handshake, CalendarCheck2, CalendarCheck, Users2 } from "lucide-react";
import AddProject from './superAdmin/AddProject';
import Employees from './superAdmin/Employees';
import Client from './superAdmin/Client';
import Stats from './superAdmin/Stats';
import Attendace from './superAdmin/Attendace';
import SalesManagement from './superAdmin/SalesManagement';
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'
import ActivityLogs from './superAdmin/ActivityLogs';

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const tabs = [
    { id: "stats", name: "Stats", icon: <BarChart3 size={20} /> },
    { id: "add", name: "Projects", icon: <PlusCircle size={20} /> },
    { id: "sales", name: "Sales Management", icon: <CalendarCheck size={20} /> },
    { id: "Employees", name: "Employees", icon: <Users2 size={20} /> },
    { id: "client", name: "Clients", icon: <Handshake size={20} /> },
    { id: "attendace", name: "Attendance", icon: <CalendarCheck size={20} /> },
    { id: "logs", name: "Logs", icon: <CalendarCheck size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "stats":
        return <Stats />;
      case "add":
        return <AddProject />;
      case "Employees":
        return <Employees />;
      case "client":
        return <Client />
      case "attendace":
        return <Attendace />
      case "sales":
        return <SalesManagement />
      case "logs":
        return <ActivityLogs />
      default:
        return null;
    }
  };
  function doLogout() {
    dispatch(logout())
    navigate('/login')
  }
  return (
    <div>
      <div className="flex h-screen ">
        {/* Sidebar */}
        <div
          className={`fixed md:static top-0  left-0 z-40 h-full w-64 bg-white shadow-md transition-transform transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0`}
        >
          <div className="p-4 flex items-center justify-center border-b">
            {/* <h1 className="text-xl font-bold text-blue-600">Dashboard</h1> */}
            <img src="bd.png" className='w-full  h-full' />
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X />
            </button>
          </div>

          <nav className="mt-6  h-[60%] flex flex-col justify-between items-center">
            <div className='w-full'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition ${activeTab === tab.id ? "bg-blue-100 text-blue-700 font-medium" : ""
                    }`}
                >
                  {tab.icon}
                  <span className="ml-3">{tab.name}</span>
                </button>
              ))}
            </div>

            <button onClick={doLogout} className="
w-28
    relative inline-flex items-center justify-center
    px-5 py-2 
    bg-gradient-to-r from-red-500 to-red-600
    text-white font-semibold
    rounded-full shadow-md
    hover:from-red-600 hover:to-red-700
    transition-all duration-300 ease-out
    hover:shadow-lg hover:scale-105
    focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
  "
            >Logout</button>
          </nav>

        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Bar */}
          <header className="flex items-center justify-between bg-white shadow p-4">
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu />
            </button>
            <h2 className="text-lg font-semibold capitalize">
              {tabs.find((t) => t.id === activeTab)?.name}
            </h2>
            <div className="text-gray-500 text-sm">Welcome, Admin</div>
          </header>

          {/* Page Content */}
          <main className="p-6">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}


export default SuperAdminDashboard;
