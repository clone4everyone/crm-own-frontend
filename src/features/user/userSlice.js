import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Fetch all users (excluding clients)
export const fetchUsers = createAsyncThunk('admin/fetchAll', async (filters = {}, thunkAPI) => {
  try {
    const params = new URLSearchParams(filters);
    const res = await api.get(`/admin/users?${params}`);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch users' });
  }
});

// Fetch pending users
export const fetchPendingUsers = createAsyncThunk('users/fetchPending', async (_, thunkAPI) => {
  try {
    const res = await api.get('/admin/pending-users');
    // console.log(res);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch pending users' });
  }
});

// Approve/Reject user
export const approveUser = createAsyncThunk('users/approve', async ({ userId, isApproved, role }, thunkAPI) => {
  try {
    const res = await api.put(`/admin/users/${userId}/approval`, { isApproved, role });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to update approval' });
  }
});

// Update user (all fields)
export const updateUser = createAsyncThunk('users/update', async ({ userId, userData }, thunkAPI) => {
  try {
    const res = await api.put(`/admin/users/${userId}`, userData);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to update user' });
  }
});

// Update user role (legacy - can be removed if using updateUser)
// export const updateUserRole = createAsyncThunk('users/updateRole', async ({ userId, role }, thunkAPI) => {
//   try {
//     const res = await api.put(`/admin/users/${userId}/role`, { role });
//     return res.data;
//   } catch (err) {
//     return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to update role' });
//   }
// });

// // Update user status (legacy - can be removed if using updateUser)
// export const updateUserStatus = createAsyncThunk('users/updateStatus', async ({ userId, active }, thunkAPI) => {
//   try {
//     const res = await api.put(`/admin/users/${userId}/status`, { active });
//     return res.data;
//   } catch (err) {
//     return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to update status' });
//   }
// });

const userSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    pendingUsers: [],
    loading: false,
    pendingLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers(builder) {
    builder
      // Fetch all users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : action.payload.users || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch users';
      })

      // Fetch pending users
      .addCase(fetchPendingUsers.pending, (state) => {
        state.pendingLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingUsers.fulfilled, (state, action) => {
        state.pendingLoading = false;
        state.pendingUsers = Array.isArray(action.payload) ? action.payload : action.payload.users || [];
      })
      .addCase(fetchPendingUsers.rejected, (state, action) => {
        state.pendingLoading = false;
        state.error = action.payload?.message || 'Failed to fetch pending users';
      })

      // Approve user
      .addCase(approveUser.fulfilled, (state, action) => {
        state.pendingUsers = state.pendingUsers.filter(u => u._id !== action.payload.user._id);
        if (action.payload.user.isApproved) {
          state.list.push(action.payload.user);
        }
      })

      // Update user
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.list.findIndex(u => u._id === action.payload.user._id);
        if (index !== -1) {
          state.list[index] = action.payload.user;
        }
      })

      // Update role (legacy)
    //   .addCase(updateUserRole.fulfilled, (state, action) => {
    //     const index = state.list.findIndex(u => u._id === action.payload.user._id);
    //     if (index !== -1) {
    //       state.list[index] = action.payload.user;
    //     }
    //   })

    //   // Update status (legacy)
    //   .addCase(updateUserStatus.fulfilled, (state, action) => {
    //     const index = state.list.findIndex(u => u._id === action.payload.user._id);
    //     if (index !== -1) {
    //       state.list[index] = action.payload.user;
    //     }
    //   });
  }
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;