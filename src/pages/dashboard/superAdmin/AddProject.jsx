import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects, createProject } from '../../../features/project/projectSlice';
import { 
  Folder, 
  Plus, 
  X, 
  Save, 
  Edit2, 
  Calendar,
  DollarSign,
  Users,
  Eye,
  AlertCircle,
  ArrowLeft,
   Image as ImageIcon,
FileText
} from 'lucide-react';
import api from '../../../api/axios';
import { 
  getClientProjects, 
  getProjectDetails, 
  getProjectUpdates,
  clearCurrentProject,
  clearError 
} from "../../../features/client/clientDashboardSlice"
import confetti from "canvas-confetti";

const AddProject = () => {

  const dispatch = useDispatch();
  const { list: projects, loading } = useSelector((s) => s.projects);
  const [view, setView] = useState('list'); // 'list', 'details', 'create'
  const [selectedProject, setSelectedProject] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [clients, setClients] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    designers: [],
    developers: [],
    status: 'pending',
    priority: 'medium',
    startDate: '',
    deadline: '',
    budget: '',
    progress: 0,
    paid:0
  });
const [selectedProjectId,setSelectedProjectId]=useState(null);
  useEffect(() => {
    dispatch(fetchProjects());
    fetchUsers();
  }, [dispatch]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users/forProject');
      // console.log(res)
      const users = res.data.users || res.data;
      setClients(users.filter(u => u.role === 'client'));
      setDesigners(users.filter(u => u.role === 'designer'));
      setDevelopers(users.filter(u => u.role === 'developer'));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

const handleViewProjectUpdates = async (e, projectId) => {
  e.stopPropagation();
  setSelectedProjectId(projectId);
  setView('updates');
  await dispatch(getProjectDetails(projectId));
};
  const handleSeeUpdates = async () => {
    if (selectedProjectId) {
      setView('allUpdates');
      await dispatch(getProjectUpdates(selectedProjectId));
    }
  };
  const doConfetii = () => {
   
    fireConfetti();
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 600,
      spread: 350,
      origin: { y: 0.6 },
    });
  };
  
const handleBackToList=()=>{
  setView('list')
}
const handleBackToDetails=()=>{
  setView('updates')
}
  const handleProjectClick = async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setSelectedProject(res.data.project);
      setFormData({
        name: res.data.project.name || '',
        description: res.data.project.description || '',
        client: res.data.project.client?._id || '',
        designers: res.data.project.designers?.map(d => d._id) || [],
        developers: res.data.project.developers?.map(d => d._id) || [],
        status: res.data.project.status || 'pending',
        priority: res.data.project.priority || 'medium',
        startDate: res.data.project.startDate ? res.data.project.startDate.split('T')[0] : '',
        deadline: res.data.project.deadline ? res.data.project.deadline.split('T')[0] : '',
        budget: res.data.project.budget || '',
        progress: res.data.project.progress || 0,
        paid:res.data.project.paid || 0
      });
      setView('details');
      setEditMode(false);
    } catch (err) {
      console.error('Failed to fetch project:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const current = prev[name];
      if (current.includes(value)) {
        return { ...prev, [name]: current.filter(id => id !== value) };
      } else {
        return { ...prev, [name]: [...current, value] };
      }
    });
  };

  const handleSave = async () => {
    try {
      if (view === 'create') {
        await dispatch(createProject(formData)).unwrap();
        alert('Project created successfully!');
        resetForm();
        setView('list');
      } else {
        await api.put(`/admin/projects/${selectedProject._id}`, formData);
        alert('Project updated successfully!');
        setEditMode(false);
        handleProjectClick(selectedProject._id);
      }
      dispatch(fetchProjects());
    } catch (err) {
      alert('Failed to save project: ' + (err.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      client: '',
      designers: [],
      developers: [],
      status: 'pending',
      priority: 'medium',
      startDate: '',
      deadline: '',
      budget: '',
      progress: 0
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };
 const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  // List View
  if (view === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">All Projects</h2>
          <button
            onClick={() => { setView('create'); resetForm(); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Create New Project
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => handleProjectClick(project._id)}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-gray-200 hover:border-blue-400"
              >
                <div className="flex items-start gap-3">
                  <Folder className="text-blue-600 flex-shrink-0" size={40} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {project.client?.company || project.client?.name || 'No client'}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                     
                    </div>
                     <button className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mt-4' onClick={(e)=>handleViewProjectUpdates(e,project._id)}>View Project Updates</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Folder className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600">No projects found. Create your first project!</p>
          </div>
        )}
      </div>
    );
  }

  // Details/Edit View
  if (view === 'details' && selectedProject) {
    if(formData.status==='completed'){
      doConfetii()
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Projects
          </button>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X size={20} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Save size={20} />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Edit2 size={20} />
                Edit Project
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.name} {client.company ? `(${client.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!editMode}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress (%)
              </label>
              <input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleInputChange}
                disabled={!editMode}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid by client
              </label>
              <input
                type="number"
                name="paid"
                value={formData.paid}
                onChange={handleInputChange}
                disabled={!editMode}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designers
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                {designers.map(designer => (
                  <label key={designer._id} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.designers.includes(designer._id)}
                      onChange={() => handleMultiSelect('designers', designer._id)}
                      disabled={!editMode}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{designer.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developers
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                {developers.map(developer => (
                  <label key={developer._id} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.developers.includes(developer._id)}
                      onChange={() => handleMultiSelect('developers', developer._id)}
                      disabled={!editMode}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{developer.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create View
  if (view === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Create New Project</h2>
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <X size={20} />
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.name} {client.company ? `(${client.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designers
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                {designers.map(designer => (
                  <label key={designer._id} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.designers.includes(designer._id)}
                      onChange={() => handleMultiSelect('designers', designer._id)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{designer.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developers
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                {developers.map(developer => (
                  <label key={developer._id} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.developers.includes(developer._id)}
                      onChange={() => handleMultiSelect('developers', developer._id)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{developer.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setView('list')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Create Project
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if( view === 'updates'){

  }
    const ProjectDetails = () => {
        const { projects, currentProject, projectUpdates, projectsLoading, projectDetailsLoading, updatesLoading, error } = useSelector(state => state.clientDashboard);
    if (!currentProject) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const paymentPercentage = currentProject.budget 
      ? ((currentProject.paid || 0) / currentProject.budget * 100).toFixed(1)
      : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <X className="h-5 w-5 mr-2" />
            Back to Projects
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
       

          {/* Team Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Project Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Designers */}
              {currentProject.designers.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Designers ({currentProject.designers.length})</h4>
                  <div className="space-y-2">
                    {currentProject.designers.map((designer) => (
                      <div key={designer._id} className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {designer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{designer.name}</p>
                          <p className="text-xs text-gray-500">{designer.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Developers */}
              {currentProject.developers.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Developers ({currentProject.developers.length})</h4>
                  <div className="space-y-2">
                    {currentProject.developers.map((developer) => (
                      <div key={developer._id} className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                          {developer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{developer.name}</p>
                          <p className="text-xs text-gray-500">{developer.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* See Updates Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSeeUpdates}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <Eye className="h-5 w-5 mr-2" />
              See Project Updates
            </button>
          </div>
        </div>
      </div>
    );
  };
    const ProjectUpdates = () => {
        const { projects, currentProject, projectUpdates, projectsLoading, projectDetailsLoading, updatesLoading, error } = useSelector(state => state.clientDashboard);
    if (updatesLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToDetails}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <X className="h-5 w-5 mr-2" />
            Back to Project Details
          </button>
          <div className="text-sm text-gray-600">
            Total Updates: <span className="font-semibold">{projectUpdates.totalUpdates}</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Updates</h2>

        {projectUpdates.updatesByEmployee.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No updates yet</h3>
            <p className="mt-1 text-sm text-gray-500">Updates from the team will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {projectUpdates.updatesByEmployee.map((employeeData) => (
              <div key={employeeData.employee._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Employee Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-lg">
                      {employeeData.employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-white">
                      <h3 className="font-semibold text-lg">{employeeData.employee.name}</h3>
                      <p className="text-sm opacity-90">
                        {employeeData.employee.role.charAt(0).toUpperCase() + employeeData.employee.role.slice(1)} • 
                        {employeeData.updates.length} update{employeeData.updates.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Updates */}
                <div className="p-4 space-y-4">
                  {employeeData.updates.map((update) => (
                    <div key={update._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-semibold text-gray-800">{update.title}</h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(update.createdAt)}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 whitespace-pre-wrap">{update.description}</p>

                      {/* Files/Images */}
                      {update.files && update.files.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700 flex items-center">
                            <ImageIcon className="h-4 w-4 mr-1" />
                            Attachments ({update.files.length})
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {update.files.map((file, idx) => (
                              <a
                                  key={idx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-24 object-cover rounded border hover:opacity-75 transition-opacity"
                                  />
                                </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Remarks */}
                      {update.remarks && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Remarks:</span> {update.remarks}
                          </p>
                        </div>
                      )}

                      {/* Update Type Badge */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          update.updateType === 'design_update' ? 'bg-purple-100 text-purple-700' :
                          update.updateType === 'development_update' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {update.updateType.replace('_', ' ').toUpperCase()}
                        </span>
                        {update.status && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>
                            {update.status.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  return (
    <>
    {
      view === 'updates' ?<ProjectDetails/>:view === 'allUpdates' ? <ProjectUpdates/>:null
    }
    </>
  );
};

export default AddProject;