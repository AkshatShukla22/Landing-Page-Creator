// frontend/src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, fetchMe } from '../services/authService';

const token = localStorage.getItem('mb_token');
const user = JSON.parse(localStorage.getItem('mb_user') || 'null');

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await loginUser(credentials);
    localStorage.setItem('mb_token', data.token);
    localStorage.setItem('mb_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await registerUser(userData);
    localStorage.setItem('mb_token', data.token);
    localStorage.setItem('mb_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const data = await fetchMe();
    localStorage.setItem('mb_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || 'Session expired';
    return rejectWithValue({ message, status });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    user: user || null,
    isLoading: false,
    error: null,
    isAuthenticated: !!token,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('mb_token');
      localStorage.removeItem('mb_user');
    },
    clearError: (state) => { state.error = null; },
    setApprovalStatus: (state, action) => {
      if (state.user) {
        state.user.isApproved = action.payload.isApproved;
        state.user.approvalStatus = action.payload.approvalStatus;
        localStorage.setItem('mb_user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending,  (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(register.pending,  (state) => { state.isLoading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state, action) => {
        // Clear session on 401 (invalid/expired token), keep on network errors
        if (action.payload?.status === 401) {
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem('mb_token');
          localStorage.removeItem('mb_user');
        }
        // For 500s or network failures, silently keep existing session
      });
  },
});

export const { logout, clearError, setApprovalStatus } = authSlice.actions;
export default authSlice.reducer;