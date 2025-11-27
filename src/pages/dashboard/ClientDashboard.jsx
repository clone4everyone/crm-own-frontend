
import { useState } from 'react';
import { Menu, X, BarChart3, PlusCircle, ClipboardList } from "lucide-react";
import Projects from './client/Projects';
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import { useNavigate } from 'react-router-dom'
const ClientDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
const dispatch = useDispatch()
const navigate = useNavigate()
  const tabs = [
    { id: "projects", name: "Projects", icon: <BarChart3 size={20} /> },
    
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "projects":
        return <Projects />;
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
       <div className="flex h-screen ">
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 z-40 h-full w-64 bg-white shadow-md transition-transform transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h1 className="text-xl font-bold text-blue-600">Dashboard</h1>
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
              className={`w-full flex items-center px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition ${
                activeTab === tab.id ? "bg-blue-100 text-blue-700 font-medium" : ""
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
          <div className="text-gray-500 text-sm">Welcome, Client</div>
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
export default ClientDashboard;
