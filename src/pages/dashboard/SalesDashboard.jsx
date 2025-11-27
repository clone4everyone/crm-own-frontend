import { useState } from 'react';
import { Menu, X, BarChart3, PlusCircle, ClipboardList } from "lucide-react";
import Leads from './sales/Leads';
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'
const SalesDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("leads");
const dispatch = useDispatch()
const navigate = useNavigate()
  const tabs = [
    { id: "leads", name: "Leads", icon: <BarChart3 size={20} /> },
    
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "leads":
        return <Leads />;
      default:
        return null;
    }
  };
    function doLogout(){
    dispatch(logout())
    navigate('/login')
    }
  return (
    <div>
       <div className="flex h-screen bg-gray-100">
     {/* Sidebar */}
<div className="relative">
  {/* Backdrop for Mobile */}
  {sidebarOpen && (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
      onClick={() => setSidebarOpen(false)}
    ></div>
  )}

  {/* Sidebar Panel */}
  <div
    className={`fixed md:static top-0 left-0 z-40 h-full w-64 bg-white shadow-lg
      transition-transform duration-300 transform
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0 flex flex-col`}
  >
    {/* Header */}
    <div className="p-4 flex items-center justify-between border-b">
      <h1 className="text-xl font-bold text-blue-600">Dashboard</h1>
      <button
        className="md:hidden text-gray-600 hover:text-gray-900"
        onClick={() => setSidebarOpen(false)}
      >
        <X size={24} />
      </button>
    </div>

    {/* Menu */}
    <nav className="flex-1 overflow-y-auto py-4 px-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            setSidebarOpen(false);
          }}
          className={`w-full flex items-center px-5 py-3 rounded-lg text-gray-700 
            hover:bg-blue-50 hover:text-blue-600 transition
            ${
              activeTab === tab.id
                ? "bg-blue-100 text-blue-700 font-semibold"
                : ""
            }`}
        >
          {tab.icon}
          <span className="ml-3">{tab.name}</span>
        </button>
      ))}
    </nav>

    {/* Logout - sticks bottom */}
    <div className="p-4 border-t">
      <button
        onClick={doLogout}
        className="
          w-full py-2 text-center
          bg-gradient-to-r from-red-500 to-red-600
          text-white font-semibold rounded-full shadow-md
          hover:from-red-600 hover:to-red-700
          transition-all duration-300
          hover:shadow-lg hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-red-400
        "
      >
        Logout
      </button>
    </div>
  </div>
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
          <div className="text-gray-500 text-sm"></div>
        </header>

        {/* Page Content */}
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
    </div>
  );
}
const StatsPage = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card title="Total Projects" value="24" />
    <Card title="Pending Requests" value="8" />
    <Card title="Completed Tasks" value="132" />
  </div>
);


const RequestsPage = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
    <ul className="divide-y">
      {["Request from John", "Request from Sarah", "Request from Raj"].map(
        (req, i) => (
          <li key={i} className="py-3 flex justify-between">
            <span>{req}</span>
            <button className="text-blue-600 hover:underline">View</button>
          </li>
        )
      )}
    </ul>
  </div>
);

const Card = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
    <h4 className="text-gray-600">{title}</h4>
    <p className="text-2xl font-bold text-blue-600 mt-2">{value}</p>
  </div>
);
export default SalesDashboard;
