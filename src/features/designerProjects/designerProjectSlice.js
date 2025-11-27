import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
// Fetch all projects for the designer
export const fetchDesignerProjects = createAsyncThunk(
  'designerProjects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/updateProjects');
      // console.log(response.data)
      return response.data;
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch projects' });
    }
  }
);

// Fetch single project with updates
export const fetchProjectDetails = createAsyncThunk(
  'designerProjects/fetchDetails',
  async (projectId, { rejectWithValue }) => {
    try {
      const [projectRes, updatesRes] = await Promise.all([
        api.get(`/updateProjects/${projectId}`),
        api.get(`/updateProjects/${projectId}/updates`)
      ]);
      
      return {
        project: projectRes.data.project,
        updates: updatesRes.data.updates
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch project details' });
    }
  }
);

// Create project update with Cloudinary upload
export const createProjectUpdate = createAsyncThunk(
  'designerProjects/createUpdate',
  async ({ projectId, updateData, images }, { rejectWithValue }) => {
    try {
      let uploadedFiles = [];
// console.log(images)
      // Upload images to Cloudinary if provided
      if (images && images.length > 0) {
        const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        const uploadPromises = images.map(async (image) => {
          const formData = new FormData();
          formData.append('file', image);
          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
          formData.append('folder', 'project-updates');
          
          const cloudinaryRes = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: formData
            }
          );
          
          if (!cloudinaryRes.ok) {
            throw new Error(`Failed to upload ${image.name}`);
          }
          
          const data = await cloudinaryRes.json();
          
          return {
            name: image.name,
            url: data.secure_url,
            publicId: data.public_id
          };
        });

        uploadedFiles = await Promise.all(uploadPromises);
      }
    // console.log(uploadedFiles)
      // Create the update with uploaded files
      const response = await api.post(`/updateProjects/${projectId}/updates`, {
        ...updateData,
        updateType: 'development_update',
        files: uploadedFiles
      });

      return response.data;
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.response?.data || { message: 'Failed to create update' });
    }
  }
);

// Update project status
export const updateProjectStatus = createAsyncThunk(
  'designerProjects/updateStatus',
  async ({ projectId, status, progress }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/updateProjects/${projectId}/status`, {
        status,
        progress
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update status' });
    }
  }
);

const initialState = {
  projects: [],
  selectedProject: null,
  projectUpdates: [],
  loading: false,
  updateLoading: false,
  error: null,
  success: false,
  filters: {
    status: null,
    priority: null,
    sortBy: 'deadline' // deadline, priority, createdAt
  }
};

const designerProjectSlice = createSlice({
  name: 'designerProjects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
      state.projectUpdates = [];
    },
    resetProjects: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch designer Projects
      .addCase(fetchDesignerProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesignerProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects;
      })
      .addCase(fetchDesignerProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch projects';
      })
      
      // Fetch Project Details
      .addCase(fetchProjectDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload.project;
        state.projectUpdates = action.payload.updates;
      })
      .addCase(fetchProjectDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch project details';
      })
      
      // Create Project Update
      .addCase(createProjectUpdate.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(createProjectUpdate.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        state.projectUpdates.unshift(action.payload.update);
      })
      .addCase(createProjectUpdate.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload?.message || 'Failed to create update';
      })
      
      // Update Project Status
      .addCase(updateProjectStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.success = true;
        
        // Update in projects list
        const projectIndex = state.projects.findIndex(
          p => p._id === action.payload.project._id
        );
        if (projectIndex !== -1) {
          state.projects[projectIndex] = action.payload.project;
        }
        
        // Update selected project
        if (state.selectedProject?._id === action.payload.project._id) {
          state.selectedProject = action.payload.project;
        }
      })
      .addCase(updateProjectStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload?.message || 'Failed to update status';
      });
  }
});

export const {
  clearError,
  clearSuccess,
  setFilters,
  clearSelectedProject,
  resetProjects
} = designerProjectSlice.actions;

// Selectors
export const selectProjects = (state) => state.designerProjects?.projects || [];
export const selectSelectedProject = (state) => state.designerProjects?.selectedProject;
export const selectProjectUpdates = (state) => state.designerProjects?.projectUpdates || [];
export const selectLoading = (state) => state.designerProjects?.loading || false;
export const selectUpdateLoading = (state) => state.designerProjects?.updateLoading || false;
export const selectError = (state) => state.designerProjects?.error;
export const selectSuccess = (state) => state.designerProjects?.success || false;
export const selectFilters = (state) => state.designerProjects?.filters;

// Filtered projects selector
export const selectFilteredProjects = (state) => {
  
  const projects = selectProjects(state);
  const filters = selectFilters(state);
  
  let filtered = [...projects];
  
  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status);
  }
  
  if (filters.priority) {
    filtered = filtered.filter(p => p.priority === filters.priority);
  }
  
  // Sort
  if (filters.sortBy === 'deadline') {
    filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  } else if (filters.sortBy === 'priority') {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (filters.sortBy === 'createdAt') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  return filtered;
};

export default designerProjectSlice.reducer;