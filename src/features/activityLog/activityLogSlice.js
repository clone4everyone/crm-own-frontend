import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios' 


export const recordLogin = createAsyncThunk(
  'activityLog/recordLogin',
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/activity-logs/login`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.logId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record login');
    }
  }
);

export const recordLogout = createAsyncThunk(
  'activityLog/recordLogout',
  async (logId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/activity-logs/logout/${logId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record logout');
    }
  }
);

export const fetchLogs = createAsyncThunk(
  'activityLog/fetchLogs',
  async (filters, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/activity-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.logs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch logs');
    }
  }
);

const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState: {
    currentLogId: null,
    logs: [],
    loading: false,
    error: null
  },
  reducers: {
    clearLogId: (state) => {
      state.currentLogId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(recordLogin.fulfilled, (state, action) => {
        state.currentLogId = action.payload;
      })
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearLogId } = activityLogSlice.actions;
export default activityLogSlice.reducer;