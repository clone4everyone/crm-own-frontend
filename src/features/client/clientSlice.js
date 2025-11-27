import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Fetch all approved clients
export const fetchClients = createAsyncThunk('clients/fetchAll', async (filters = {}, thunkAPI) => {
  try {
    const params = new URLSearchParams(filters);
    const res = await api.get(`/admin/clients?${params}`);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch clients' });
  }
});

// Fetch pending clients
export const fetchPendingClients = createAsyncThunk('clients/fetchPending', async (_, thunkAPI) => {
  try {
    const res = await api.get('/admin/pending-clients');
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch pending clients' });
  }
});

// Approve/Reject client
export const approveClient = createAsyncThunk('clients/approve', async ({ clientId, isApproved }, thunkAPI) => {
  try {
    const res = await api.put(`/admin/clients/${clientId}/approval`, { isApproved });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to update approval' });
  }
});

// Update client
export const updateClient = createAsyncThunk('clients/update', async ({ clientId, clientData }, thunkAPI) => {
  try {
    const res = await api.put(`/admin/clients/${clientId}`, clientData);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to update client' });
  }
});

// Update client status
export const updateClientStatus = createAsyncThunk('clients/updateStatus', async ({ clientId, active }, thunkAPI) => {
  try {
    const res = await api.put(`/admin/clients/${clientId}/status`, { active });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to update status' });
  }
});

// Get single client details
export const fetchClientDetails = createAsyncThunk('clients/fetchDetails', async (clientId, thunkAPI) => {
  try {
    const res = await api.get(`/admin/clients/${clientId}`);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch client details' });
  }
});

const clientSlice = createSlice({
  name: 'clients',
  initialState: {
    list: [],
    pendingClients: [],
    selectedClient: null,
    loading: false,
    pendingLoading: false,
    detailsLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    }
  },
  extraReducers(builder) {
    builder
      // Fetch all clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : action.payload.clients || [];
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch clients';
      })

      // Fetch pending clients
      .addCase(fetchPendingClients.pending, (state) => {
        state.pendingLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingClients.fulfilled, (state, action) => {
        state.pendingLoading = false;
        state.pendingClients = Array.isArray(action.payload) ? action.payload : action.payload.clients || [];
      })
      .addCase(fetchPendingClients.rejected, (state, action) => {
        state.pendingLoading = false;
        state.error = action.payload?.message || 'Failed to fetch pending clients';
      })

      // Approve client
      .addCase(approveClient.fulfilled, (state, action) => {
        state.pendingClients = state.pendingClients.filter(c => c._id !== action.payload.client._id);
        if (action.payload.client.isApproved) {
          state.list.push({ ...action.payload.client, projects: [], projectCount: 0 });
        }
      })

      // Update client
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.list.findIndex(c => c._id === action.payload.client._id);
        if (index !== -1) {
          state.list[index] = { ...state.list[index], ...action.payload.client };
        }
      })

      // Update status
      .addCase(updateClientStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex(c => c._id === action.payload.client._id);
        if (index !== -1) {
          state.list[index] = { ...state.list[index], ...action.payload.client };
        }
      })

      // Fetch client details
      .addCase(fetchClientDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchClientDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedClient = action.payload.client;
      })
      .addCase(fetchClientDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload?.message || 'Failed to fetch client details';
      });
  }
});

export const { clearError, clearSelectedClient } = clientSlice.actions;
export default clientSlice.reducer;