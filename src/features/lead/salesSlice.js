// crm-frontend/src/features/sales/salesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async thunks
export const fetchMyLeads = createAsyncThunk(
  'sales/fetchMyLeads',
  async (filters = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      
      const res = await api.get(`/sales/my-leads?${params.toString()}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch leads' });
    }
  }
);

export const fetchTodayPipeline = createAsyncThunk(
  'sales/fetchTodayPipeline',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/sales/today-pipeline');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch pipeline' });
    }
  }
);

export const fetchSalesStats = createAsyncThunk(
  'sales/fetchStats',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/sales/stats');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch stats' });
    }
  }
);

export const fetchMyTargets = createAsyncThunk(
  'sales/fetchMyTargets',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/sales/my-targets');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch targets' });
    }
  }
);

export const createLead = createAsyncThunk(
  'sales/createLead',
  async (leadData, thunkAPI) => {
    try {
      const res = await api.post('/sales/leads', leadData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to create lead' });
    }
  }
);

export const updateLead = createAsyncThunk(
  'sales/updateLead',
  async ({ leadId, updates }, thunkAPI) => {
    try {
      const res = await api.put(`/sales/leads/${leadId}`, updates);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to update lead' });
    }
  }
);

export const addActivity = createAsyncThunk(
  'sales/addActivity',
  async ({ leadId, activityData }, thunkAPI) => {
    try {
      const res = await api.post(`/sales/leads/${leadId}/activity`, activityData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to add activity' });
    }
  }
);

export const fetchLeadDetails = createAsyncThunk(
  'sales/fetchLeadDetails',
  async (leadId, thunkAPI) => {
    try {
      const res = await api.get(`/sales/leads/${leadId}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch lead details' });
    }
  }
);

// Admin actions
export const fetchAllLeads = createAsyncThunk(
  'sales/fetchAllLeads',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/sales/leads');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch all leads' });
    }
  }
);

export const assignLead = createAsyncThunk(
  'sales/assignLead',
  async ({ leadId, salesPersonId }, thunkAPI) => {
    try {
      const res = await api.put(`/sales/leads/${leadId}/assign`, { salesPersonId });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to assign lead' });
    }
  }
);

export const fetchTeamPerformance = createAsyncThunk(
  'sales/fetchTeamPerformance',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/sales/admin/performance');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch performance' });
    }
  }
);

export const setTarget = createAsyncThunk(
  'sales/setTarget',
  async (targetData, thunkAPI) => {
    try {
      const res = await api.post('/sales/targets', targetData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to set target' });
    }
  }
);

const initialState = {
  // My leads (for sales person)
  myLeads: [],
  
  // Today's pipeline
  pipeline: {
    followUpsToday: [],
    overdueFollowUps: [],
    newLeads: [],
    hotDeals: []
  },
  
  // Stats
  stats: {
    overview: {
      totalLeads: 0,
      newLeads: 0,
      contacted: 0,
      negotiation: 0,
      converted: 0,
      conversionRate: 0
    },
    thisMonth: {
      leads: 0,
      converted: 0,
      revenue: 0
    },
    thisWeek: {
      leads: 0,
      converted: 0
    },
    revenue: {
      total: 0,
      thisMonth: 0
    }
  },
  
  // Targets
  targets: [],
  
  // Current lead details
  currentLead: null,
  
  // Admin - all leads
  allLeads: [],
  
  // Admin - team performance
  teamPerformance: [],
  
  // Loading states
  loading: false,
  pipelineLoading: false,
  statsLoading: false,
  targetsLoading: false,
  leadsLoading: false,
  performanceLoading: false,
  
  // Error states
  error: null,
  success: null
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSuccess(state) {
      state.success = null;
    },
    clearCurrentLead(state) {
      state.currentLead = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Leads
      .addCase(fetchMyLeads.pending, (state) => {
        state.leadsLoading = true;
        state.error = null;
      })
      .addCase(fetchMyLeads.fulfilled, (state, action) => {
        state.leadsLoading = false;
        state.myLeads = action.payload.leads;
      })
      .addCase(fetchMyLeads.rejected, (state, action) => {
        state.leadsLoading = false;
        state.error = action.payload?.message;
      })
      
      // Fetch Today Pipeline
      .addCase(fetchTodayPipeline.pending, (state) => {
        state.pipelineLoading = true;
      })
      .addCase(fetchTodayPipeline.fulfilled, (state, action) => {
        state.pipelineLoading = false;
        state.pipeline = action.payload.pipeline;
      })
      .addCase(fetchTodayPipeline.rejected, (state, action) => {
        state.pipelineLoading = false;
        state.error = action.payload?.message;
      })
      
      // Fetch Stats
      .addCase(fetchSalesStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchSalesStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.stats;
      })
      .addCase(fetchSalesStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload?.message;
      })
      
      // Fetch Targets
      .addCase(fetchMyTargets.pending, (state) => {
        state.targetsLoading = true;
      })
      .addCase(fetchMyTargets.fulfilled, (state, action) => {
        state.targetsLoading = false;
        state.targets = action.payload.targets;
      })
      .addCase(fetchMyTargets.rejected, (state, action) => {
        state.targetsLoading = false;
        state.error = action.payload?.message;
      })
      
      // Create Lead
      .addCase(createLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeads.unshift(action.payload.lead);
        state.success = 'Lead created successfully';
      })
      .addCase(createLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      
      // Update Lead
      .addCase(updateLead.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.myLeads.findIndex(l => l._id === action.payload.lead._id);
        if (index !== -1) {
          state.myLeads[index] = action.payload.lead;
        }
        state.currentLead = action.payload.lead;
        state.success = 'Lead updated successfully';
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      
      // Add Activity
      .addCase(addActivity.pending, (state) => {
        state.loading = true;
      })
      .addCase(addActivity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.myLeads.findIndex(l => l._id === action.payload.lead._id);
        if (index !== -1) {
          state.myLeads[index] = action.payload.lead;
        }
        state.success = 'Activity added successfully';
      })
      .addCase(addActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      
      // Fetch Lead Details
      .addCase(fetchLeadDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeadDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLead = action.payload.lead;
      })
      .addCase(fetchLeadDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      
      // Admin - Fetch All Leads
      .addCase(fetchAllLeads.pending, (state) => {
        state.leadsLoading = true;
      })
      .addCase(fetchAllLeads.fulfilled, (state, action) => {
        state.leadsLoading = false;
        state.allLeads = action.payload.leads;
      })
      .addCase(fetchAllLeads.rejected, (state, action) => {
        state.leadsLoading = false;
        state.error = action.payload?.message;
      })
      
      // Admin - Assign Lead
      .addCase(assignLead.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignLead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.allLeads.findIndex(l => l._id === action.payload.lead._id);
        if (index !== -1) {
          state.allLeads[index] = action.payload.lead;
        }
        state.success = 'Lead assigned successfully';
      })
      .addCase(assignLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      
      // Admin - Fetch Team Performance
      .addCase(fetchTeamPerformance.pending, (state) => {
        state.performanceLoading = true;
      })
      .addCase(fetchTeamPerformance.fulfilled, (state, action) => {
        state.performanceLoading = false;
        state.teamPerformance = action.payload.performance;
      })
      .addCase(fetchTeamPerformance.rejected, (state, action) => {
        state.performanceLoading = false;
        state.error = action.payload?.message;
      })
      
      // Admin - Set Target
      .addCase(setTarget.pending, (state) => {
        state.loading = true;
      })
      .addCase(setTarget.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Target set successfully';
      })
      .addCase(setTarget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  }
});

export const { clearError, clearSuccess, clearCurrentLead } = salesSlice.actions;

// Selectors
export const selectMyLeads = (state) => state.sales.myLeads;
export const selectPipeline = (state) => state.sales.pipeline;
export const selectStats = (state) => state.sales.stats;
export const selectTargets = (state) => state.sales.targets;
export const selectCurrentLead = (state) => state.sales.currentLead;
export const selectAllLeads = (state) => state.sales.allLeads;
export const selectTeamPerformance = (state) => state.sales.teamPerformance;
export const selectSalesLoading = (state) => state.sales.loading;
export const selectSalesError = (state) => state.sales.error;
export const selectSalesSuccess = (state) => state.sales.success;

export default salesSlice.reducer;