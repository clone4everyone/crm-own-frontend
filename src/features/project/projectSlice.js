import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await api.get('/projects')
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed' })
  }
})

export const createProject = createAsyncThunk('projects/create', async (payload, thunkAPI) => {
  try {
    const res = await api.post('/projects/create', payload)
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed' })
  }
})

const projectSlice = createSlice({
  name: 'projects',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchProjects.pending, (s) => { s.loading = true })
      .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.list = Array.isArray(a.payload) ? a.payload : a.payload.projects || [];})
      .addCase(fetchProjects.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message })

      .addCase(createProject.fulfilled, (s, a) => { s.list.push(a.payload) })
  }
})

export default projectSlice.reducer