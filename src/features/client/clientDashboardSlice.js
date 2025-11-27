// store/slices/clientDashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Helper function to get auth token
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Async Thunks

// Get all projects for client
export const getClientProjects = createAsyncThunk(
  'client/getProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/clientDashboard/projects`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

// Get single project details
export const getProjectDetails = createAsyncThunk(
  'clientDashboard/getProjectDetails',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/clientDashboard/projects/${projectId}`, getAuthConfig());
      // console.log(response)
      return response.data;
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project details');
    }
  }
);

// Get project updates
export const getProjectUpdates = createAsyncThunk(
  'clientDashboard/getProjectUpdates',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/clientDashboard/projects/${projectId}/updates`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project updates');
    }
  }
);

// Get single update details
export const getUpdateDetails = createAsyncThunk(
  'clientDashboard/getUpdateDetails',
  async ({ projectId, updateId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/clientDashboard/projects/${projectId}/updates/${updateId}`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch update details');
    }
  }
);

// Get project statistics
export const getProjectStatistics = createAsyncThunk(
  'clientDashboard/getProjectStatistics',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/clientDashboard/projects/${projectId}/statistics`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project statistics');
    }
  }
);

// Get dashboard summary
export const getDashboardSummary = createAsyncThunk(
  'clientDashboard/getDashboardSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/clientDashboard/dashboard/summary`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard summary');
    }
  }
);

// Initial State
const initialState = {
  projects: [],
  currentProject: null,
  projectUpdates: {
    updatesByEmployee: [],
    allUpdates: [],
    totalUpdates: 0
  },
  currentUpdate: null,
  projectStatistics: null,
  dashboardSummary: null,
  loading: false,
  error: null,
  projectsLoading: false,
  projectDetailsLoading: false,
  updatesLoading: false,
  statisticsLoading: false,
  summaryLoading: false
};

// Slice
const clientDashboardSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.projectUpdates = {
        updatesByEmployee: [],
        allUpdates: [],
        totalUpdates: 0
      };
      state.currentUpdate = null;
      state.projectStatistics = null;
    },
    clearCurrentUpdate: (state) => {
      state.currentUpdate = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Client Projects
      .addCase(getClientProjects.pending, (state) => {
        state.projectsLoading = true;
        state.error = null;
      })
      .addCase(getClientProjects.fulfilled, (state, action) => {
        state.projectsLoading = false;
        state.projects = action.payload.projects;
      })
      .addCase(getClientProjects.rejected, (state, action) => {
        state.projectsLoading = false;
        state.error = action.payload;
      })
      
      // Get Project Details
      .addCase(getProjectDetails.pending, (state) => {
        state.projectDetailsLoading = true;
        state.error = null;
      })
      .addCase(getProjectDetails.fulfilled, (state, action) => {
        state.projectDetailsLoading = false;
        state.currentProject = action.payload.project;
      })
      .addCase(getProjectDetails.rejected, (state, action) => {
        state.projectDetailsLoading = false;
        state.error = action.payload;
      })
      
      // Get Project Updates
      .addCase(getProjectUpdates.pending, (state) => {
        state.updatesLoading = true;
        state.error = null;
      })
      .addCase(getProjectUpdates.fulfilled, (state, action) => {
        state.updatesLoading = false;
        state.projectUpdates = {
          updatesByEmployee: action.payload.updatesByEmployee,
          allUpdates: action.payload.allUpdates,
          totalUpdates: action.payload.totalUpdates
        };
      })
      .addCase(getProjectUpdates.rejected, (state, action) => {
        state.updatesLoading = false;
        state.error = action.payload;
      })
      
      // Get Update Details
      .addCase(getUpdateDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUpdateDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUpdate = action.payload.update;
      })
      .addCase(getUpdateDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Project Statistics
      .addCase(getProjectStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.error = null;
      })
      .addCase(getProjectStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.projectStatistics = action.payload.statistics;
      })
      .addCase(getProjectStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.error = action.payload;
      })
      
      // Get Dashboard Summary
      .addCase(getDashboardSummary.pending, (state) => {
        state.summaryLoading = true;
        state.error = null;
      })
      .addCase(getDashboardSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.dashboardSummary = action.payload.summary;
      })
      .addCase(getDashboardSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentProject, clearCurrentUpdate } = clientDashboardSlice.actions;
export default clientDashboardSlice.reducer;