import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const registerUser = createAsyncThunk('auth/register', async (data, thunkAPI) => {
  try {
    const res = await api.post('/auth/register', data)
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Register failed' })
  }
})

export const loginUser = createAsyncThunk('auth/login', async (data, thunkAPI) => {
  try {
    const res = await api.post('/auth/login', data)
    // expecting { token, user }
    localStorage.setItem('token', res.data.token)
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Login failed' })
  }
})

export const fetchProfile = createAsyncThunk('auth/profile', async (_, thunkAPI) => {
  try {
    const res = await api.get('/auth/me')
    // console.log(res.data)
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Fetch failed' })
  }
})

const initialState = { user: null, token: localStorage.getItem('token') || null, loading: false, error: null }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    },
  },
  extraReducers(builder) {
    builder
      .addCase(registerUser.pending, (s) => { s.loading = true })
      .addCase(registerUser.fulfilled, (s) => { s.loading = false })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message })

      .addCase(loginUser.pending, (s) => { s.loading = true })
      .addCase(loginUser.fulfilled, (s, a) => { s.loading = false; s.token = a.payload.token; s.user = a.payload.user })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message })

      .addCase(fetchProfile.fulfilled, (s, a) => { s.user = a.payload.user || a.payload })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer