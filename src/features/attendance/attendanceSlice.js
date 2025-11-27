import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios'; // Adjust based on your API base URL

// Async Thunks

// Mark or create attendance
export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async (attendanceData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/attendance`, attendanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get attendance records
export const fetchAttendance = createAsyncThunk(
  'attendance/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/attendance?${queryString}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update attendance
export const updateAttendance = createAsyncThunk(
  'attendance/update',
  async ({ attendanceId, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/attendance/${attendanceId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get today's attendance for all employees
export const fetchTodayAttendance = createAsyncThunk(
  'attendance/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/admin/attendance`, {
        params: {
          startDate: today,
          endDate: today
        }
      });
      // console.log(response.data)
      return response.data;
    } catch (error) {
      console.log(error)
      return rejectWithValue(error.response.data);
    }
  }
);

// Get monthly attendance for a specific user
export const fetchMonthlyAttendance = createAsyncThunk(
  'attendance/fetchMonthly',
  async ({ userId, year, month }, { rejectWithValue }) => {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const response = await api.get(`/admin/attendance`, {
        params: {
          userId,
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get attendance statistics
export const fetchAttendanceStats = createAsyncThunk(
  'attendance/fetchStats',
  async ({ userId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/attendance`, {
        params: { userId, startDate, endDate }
      });
      
      const { attendance } = response.data;
      
      // Calculate statistics
      const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        halfDay: attendance.filter(a => a.status === 'half_day').length,
        leave: attendance.filter(a => a.status === 'leave').length,
        workFromHome: attendance.filter(a => a.status === 'work_from_home').length,
        totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
        averageHours: attendance.length > 0 
          ? attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendance.length 
          : 0
      };
      
      return { userId, stats, attendance };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Bulk mark attendance
export const bulkMarkAttendance = createAsyncThunk(
  'attendance/bulkMark',
  async (attendanceArray, { rejectWithValue }) => {
    try {
      const promises = attendanceArray.map(attendance =>
        api.post(`/admin/attendance`, attendance)
      );
      const responses = await Promise.all(promises);
      return responses.map(res => res.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Bulk operation failed' });
    }
  }
);

const initialState = {
  attendanceRecords: [],
  todayAttendance: [],
  monthlyAttendance: [],
  selectedEmployeeAttendance: null,
  statistics: null,
  loading: false,
  error: null,
  success: false,
  filters: {
    userId: null,
    startDate: null,
    endDate: null
  }
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Clear success message
    clearSuccess: (state) => {
      state.success = false;
    },
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        userId: null,
        startDate: null,
        endDate: null
      };
    },
    // Reset state
    resetAttendance: (state) => {
      return initialState;
    },
    // Update local attendance record
    updateLocalAttendance: (state, action) => {
      const index = state.todayAttendance.findIndex(
        a => a._id === action.payload._id
      );
      if (index !== -1) {
        state.todayAttendance[index] = {
          ...state.todayAttendance[index],
          ...action.payload
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Mark Attendance
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.attendanceRecords.unshift(action.payload.attendance);
        
        // Update today's attendance if applicable
        const today = new Date().toISOString().split('T')[0];
        if (action.payload.attendance.date.startsWith(today)) {
          const index = state.todayAttendance.findIndex(
            a => a.user._id === action.payload.attendance.user._id
          );
          if (index !== -1) {
            state.todayAttendance[index] = action.payload.attendance;
          } else {
            state.todayAttendance.push(action.payload.attendance);
          }
        }
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to mark attendance';
      })
      
      // Fetch Attendance
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceRecords = action.payload.attendance;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch attendance';
      })
      
      // Update Attendance
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // Update in all relevant arrays
        const updateRecord = (records) => {
          const index = records.findIndex(a => a._id === action.payload.attendance._id);
          if (index !== -1) {
            records[index] = action.payload.attendance;
          }
        };
        
        updateRecord(state.attendanceRecords);
        updateRecord(state.todayAttendance);
        updateRecord(state.monthlyAttendance);
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update attendance';
      })
      
      // Fetch Today's Attendance
      .addCase(fetchTodayAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAttendance = action.payload.attendance;
      })
      .addCase(fetchTodayAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch today\'s attendance';
      })
      
      // Fetch Monthly Attendance
      .addCase(fetchMonthlyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyAttendance = action.payload.attendance;
      })
      .addCase(fetchMonthlyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch monthly attendance';
      })
      
      // Fetch Attendance Stats
      .addCase(fetchAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload.stats;
        state.selectedEmployeeAttendance = action.payload.attendance;
      })
      .addCase(fetchAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch statistics';
      })
      
      // Bulk Mark Attendance
      .addCase(bulkMarkAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkMarkAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Add all new attendance records
        action.payload.forEach(result => {
          state.attendanceRecords.unshift(result.attendance);
          state.todayAttendance.push(result.attendance);
        });
      })
      .addCase(bulkMarkAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to mark bulk attendance';
      });
  }
});

export const {
  clearError,
  clearSuccess,
  setFilters,
  clearFilters,
  resetAttendance,
  updateLocalAttendance
} = attendanceSlice.actions;

// Selectors
export const selectAttendanceRecords = (state) => state.attendance.attendanceRecords;
export const selectTodayAttendance = (state) => state.attendance.todayAttendance;
export const selectMonthlyAttendance = (state) => state.attendance.monthlyAttendance;
export const selectAttendanceStats = (state) => state.attendance.statistics;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectAttendanceSuccess = (state) => state.attendance.success;

export default attendanceSlice.reducer;