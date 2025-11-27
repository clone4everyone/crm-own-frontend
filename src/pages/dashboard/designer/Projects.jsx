import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Folder,
  Filter,
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  Upload,
  Send
} from 'lucide-react';
import {
  fetchDesignerProjects,
  fetchProjectDetails,
  createProjectUpdate,
  clearSelectedProject,
  setFilters,
  clearError,
  clearSuccess,
  selectFilteredProjects,
  selectSelectedProject,
  selectProjectUpdates,
  selectLoading,
  selectUpdateLoading,
  selectError,
  selectSuccess,
  selectFilters
} from '../../../features/designerProjects/designerProjectSlice';

const Projects = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const projects = useSelector(selectFilteredProjects);
  const selectedProject = useSelector(selectSelectedProject);
  const projectUpdates = useSelector(selectProjectUpdates);
  const loading = useSelector(selectLoading);
  const updateLoading = useSelector(selectUpdateLoading);
  const error = useSelector(selectError);
  const success = useSelector(selectSuccess);
  const filters = useSelector(selectFilters);

  // Local state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    links: [''],
    images: [],
    status: ''
  });
  const [imagePreview, setImagePreview] = useState([]);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
    review: 'bg-purple-100 text-purple-800 border-purple-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    on_hold: 'bg-gray-100 text-gray-800 border-gray-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    dispatch(fetchDesignerProjects());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        if (showUpdateModal) {
          setShowUpdateModal(false);
          resetUpdateForm();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, showUpdateModal]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleProjectClick = (projectId) => {
    dispatch(fetchProjectDetails(projectId));
  };

  const handleBackToList = () => {
    dispatch(clearSelectedProject());
  };

  const resetUpdateForm = () => {
    setUpdateForm({
      title: '',
      description: '',
      links: [''],
      images: [],
      status: ''
    });
    setImagePreview([]);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...previews]);
    
    // Store actual files
    setUpdateForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setUpdateForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addLinkField = () => {
    setUpdateForm(prev => ({
      ...prev,
      links: [...prev.links, '']
    }));
  };

  const updateLink = (index, value) => {
    setUpdateForm(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? value : link)
    }));
  };

  const removeLink = (index) => {
    setUpdateForm(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitUpdate = async (e) => {
    try{
        e.preventDefault();
    
    if (!updateForm.description.trim()) {
      return;
    }
// console.log(updateForm)
    // Filter out empty links
    const validLinks = updateForm.links.filter(link => link.trim());
    
    const updateData = {
      title: updateForm.title || 'Development Update',
      description: updateForm.description,
      status: updateForm.status || undefined,
      remarks: validLinks.length > 0 ? `Links: ${validLinks.join(', ')}` : undefined
    };

    await dispatch(createProjectUpdate({
      projectId: selectedProject._id,
      updateData,
      images: updateForm.images
    }));
}catch(err){
        console.log(err)
    }
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupUpdatesByDate = (updates) => {
    const grouped = {};
    
    updates.forEach(update => {
      const date = new Date(update.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(update);
    });
    
    return grouped;
  };

  if (selectedProject) {
    const groupedUpdates = groupUpdatesByDate(projectUpdates);
    const dates = Object.keys(groupedUpdates).sort((a, b) => new Date(b) - new Date(a));

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Projects
            </button>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{selectedProject.name}</h1>
                  <p className="text-gray-600 mt-2">{selectedProject.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-600 mr-2">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[selectedProject.status]}`}>
                        {selectedProject.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-600 mr-2">Priority:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[selectedProject.priority]}`}>
                        {selectedProject.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Deadline: {formatDate(selectedProject.deadline)}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Started: {formatDate(selectedProject.createdAt)}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Update
                </button>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Update added successfully!
            </div>
          )}

          {/* Updates Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Project Updates</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading updates...</p>
              </div>
            ) : dates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Folder className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No updates yet. Be the first to add one!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {dates.map(date => (
                  <div key={date}>
                    <div className="flex items-center mb-4">
                      <div className="flex-1 border-t border-gray-200"></div>
                      <span className="px-4 text-sm font-medium text-gray-600">{date}</span>
                      <div className="flex-1 border-t border-gray-200"></div>
                    </div>
                    
                    <div className="space-y-4">
                      {groupedUpdates[date].map(update => (
                        <div key={update._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-800">{update.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(update.createdAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} by {update.user?.name}
                              </p>
                            </div>
                            {update.status && (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[update.status]}`}>
                                {update.status.replace('_', ' ').toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{update.description}</p>
                          
                          {update.files && update.files.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
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
                          )}
                          
                          {update.remarks && (
                            <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                              {update.remarks}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Update Modal */}
          {showUpdateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                  <h2 className="text-xl font-semibold text-gray-800">Add Project Update</h2>
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      resetUpdateForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitUpdate} className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={updateForm.title}
                      onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                      placeholder="E.g., Completed user authentication module"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={updateForm.description}
                      onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                      placeholder="Describe what you've worked on..."
                      rows={6}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Links */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <LinkIcon className="w-4 h-4 inline mr-1" />
                      Links (Optional)
                    </label>
                    <div className="space-y-2">
                      {updateForm.links.map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => updateLink(index, e.target.value)}
                            placeholder="https://example.com"
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {updateForm.links.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLink(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addLinkField}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add another link
                      </button>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      Images (Optional)
                    </label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        id="image-upload"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload images or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </label>
                    </div>
                    
                    {imagePreview.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Update */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Project Status (Optional)
                    </label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Keep current status</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Ready for Review</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpdateModal(false);
                        resetUpdateForm();
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateLoading || !updateForm.description.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {updateLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Update
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Projects List View
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
          <p className="text-gray-600 mt-1">Manage and track your assigned development projects</p>
        </div>

        {/* Filters */}
        {/* <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => dispatch(setFilters({ status: e.target.value || null }))}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => dispatch(setFilters({ priority: e.target.value || null }))}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => dispatch(setFilters({ sortBy: e.target.value }))}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="deadline">Deadline</option>
                <option value="priority">Priority</option>
                <option value="createdAt">Newest First</option>
              </select>
            </div>
          </div>
        </div> */}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Folder className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
              const daysRemaining = getDaysRemaining(project.deadline);
              const isOverdue = daysRemaining !== null && daysRemaining < 0;
              const isUrgent = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0;

              return (
                <div
                  key={project._id}
                  onClick={() => handleProjectClick(project._id)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                        {project.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[project.priority]}`}>
                        {project.priority.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description || 'No description'}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[project.status]}`}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Assigned: {formatDate(project.createdAt)}</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className={`${isOverdue ? 'text-red-600 font-medium' : isUrgent ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                          {project.deadline ? (
                            <>
                              Due: {formatDate(project.deadline)}
                              {daysRemaining !== null && (
                                <span className="ml-1">
                                  ({isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`})
                                </span>
                              )}
                            </>
                          ) : (
                            'No deadline set'
                          )}
                        </span>
                      </div>
                    </div>

                    {project.progress !== undefined && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;