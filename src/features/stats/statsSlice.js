import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Fetch dashboard statistics
export const fetchStats = createAsyncThunk('stats/fetch', async (_, thunkAPI) => {
  try {
    const res = await api.get('/admin/stats');
    // console.log(res.data)
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch stats' });
  }
});

// Fetch detailed financial report
export const fetchFinancialDetails = createAsyncThunk(
  'stats/fetchFinancialDetails',
  async (filters = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/admin/stats/financial-details?${params}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch financial details' });
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState: {
    overview: {
      totalProjects: 0,
      completedProjects: 0,
      pendingProjects: 0,
      inProgressProjects: 0,
      activeEmployees: 0,
      totalClients: 0
    },
    financial: {
      totalEarnings: 0,
      totalBudget: 0,
      pendingPayments: 0,
      totalMonthlySalary: 0,
      netProfit: 0
    },
    charts: {
      projectsByStatus: [],
      projectsByPriority: [],
      completedProjectsByMonth: [],
      earningsByMonth: []
    },
    topClients: [],
    recentProjects: [],
    financialDetails: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers(builder) {
    builder
      // Fetch stats
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        const { overview, financial, charts, topClients, recentProjects } = action.payload.stats;
        state.overview = overview;
        state.financial = financial;
        state.charts = charts;
        state.topClients = topClients;
        state.recentProjects = recentProjects;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch stats';
      })

      // Fetch financial details
      .addCase(fetchFinancialDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.financialDetails = action.payload.financialDetails;
      })
      .addCase(fetchFinancialDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch financial details';
      });
  }
});

export const { clearError } = statsSlice.actions;
export default statsSlice.reducer;