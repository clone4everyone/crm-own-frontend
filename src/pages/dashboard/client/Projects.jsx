// pages/client/Projects.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getClientProjects, 
  getProjectDetails, 
  getProjectUpdates,
  clearCurrentProject,
  clearError 
} from '../../../features/client/clientDashboardSlice';
import { 
  FolderOpen, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  Eye,
  ChevronRight,
  X,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Snowfall from '../../../components/SnowFall';

const Projects = () => {
  const dispatch = useDispatch();
  const { projects, currentProject, projectUpdates, projectsLoading, projectDetailsLoading, updatesLoading, error } = useSelector(state => state.clientDashboard);
  
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showUpdates, setShowUpdates] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details' or 'updates'

  useEffect(() => {
    dispatch(getClientProjects());
    
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  const handleProjectClick = async (projectId) => {
    setSelectedProjectId(projectId);
    setViewMode('details');
    await dispatch(getProjectDetails(projectId));
  };

  const handleSeeUpdates = async () => {
    if (selectedProjectId) {
      setViewMode('updates');
      await dispatch(getProjectUpdates(selectedProjectId));
    }
  };
  const doConfetii = () => {
   
    fireConfetti();
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 1600,
      spread: 520,
      origin: { y: 0.4 },
    });
  };
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProjectId(null);
    dispatch(clearCurrentProject());
  };

  const handleBackToDetails = () => {
    setViewMode('details');
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
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
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Project List View
  const ProjectsList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
        <div className="text-sm text-gray-600">
          Total Projects: <span className="font-semibold">{projects.length}</span>
        </div>
      </div>

      {projectsLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have any projects assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => handleProjectClick(project._id)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{project.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description || 'No description'}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Deadline: {formatDate(project.deadline)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Budget: {formatCurrency(project.budget)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Team: {project.designers.length + project.developers.length} members</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-800">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Project Details View
  const ProjectDetails = () => {
    if (!currentProject) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
 if(currentProject.status==='completed'){
      doConfetii()
    }
    const paymentPercentage = currentProject.budget 
      ? ((currentProject.paid || 0) / currentProject.budget * 100).toFixed(1)
      : 0;

    return (
        <>
        
       
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{currentProject.name}</h1>
              <p className="text-gray-600">{currentProject.description}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(currentProject.status)}`}>
                {currentProject.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPriorityColor(currentProject.priority)}`}>
                {currentProject.priority.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Timeline */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-800">Timeline</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{formatDate(currentProject.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline:</span>
                  <span className="font-medium">{formatDate(currentProject.deadline)}</span>
                </div>
                {currentProject.completedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">{formatDate(currentProject.completedDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-800">Financial</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Budget:</span>
                  <span className="font-medium">{formatCurrency(currentProject.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-green-600">{formatCurrency(currentProject.paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency((currentProject.budget || 0) - (currentProject.paid || 0))}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-green-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Payment Progress</span>
                    <span className="text-xs font-semibold">{paymentPercentage}%</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${paymentPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-gray-800">Progress</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion</span>
                  <span className="text-2xl font-bold text-purple-600">{currentProject.progress}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${currentProject.progress}%` }}
                  ></div>
                </div>
                {currentProject.actualCost && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Actual Cost:</span>
                      <span className="font-medium">{formatCurrency(currentProject.actualCost)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

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
       </>
    );
  };

  // Project Updates View
  const ProjectUpdates = () => {
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
    <Snowfall snowflakeCount={800} duration={12}/>
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {viewMode === 'list' && <ProjectsList />}
      {viewMode === 'details' && <ProjectDetails />}
      {viewMode === 'updates' && <ProjectUpdates />}
    </div>
    </>
    
  );
};

export default Projects;