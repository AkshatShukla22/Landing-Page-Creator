// frontend/src/store/landingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchLandingPages, fetchStats, createPage,
  updatePage, deletePage, generateSlug, checkSlugAvailable,
} from '../services/landingService';

export const getLandingPages = createAsyncThunk('landing/getAll', async (_, { rejectWithValue }) => {
  try { return await fetchLandingPages(); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load pages'); }
});

export const getStats = createAsyncThunk('landing/getStats', async (_, { rejectWithValue }) => {
  try { return await fetchStats(); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to load stats'); }
});

export const createLandingPage = createAsyncThunk('landing/create', async (data, { rejectWithValue }) => {
  try { return await createPage(data); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to create page'); }
});

export const updateLandingPage = createAsyncThunk('landing/update', async ({ id, data }, { rejectWithValue }) => {
  try { return await updatePage(id, data); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to update page'); }
});

export const deleteLandingPage = createAsyncThunk('landing/delete', async (id, { rejectWithValue }) => {
  try { await deletePage(id); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to delete page'); }
});

export const generateSlugThunk = createAsyncThunk('landing/generateSlug', async (channelName, { rejectWithValue }) => {
  try { return await generateSlug(channelName); }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const landingSlice = createSlice({
  name: 'landing',
  initialState: {
    pages: [],
    stats: { totalPages: 0, totalViews: 0, avgViews: 0 },
    isLoading: false,
    isCreating: false,
    error: null,
    createError: null,
  },
  reducers: {
    clearCreateError: (state) => { state.createError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLandingPages.pending, (state) => { state.isLoading = true; })
      .addCase(getLandingPages.fulfilled, (state, action) => { state.isLoading = false; state.pages = action.payload.pages; })
      .addCase(getLandingPages.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })

      .addCase(getStats.fulfilled, (state, action) => { state.stats = action.payload; })

      .addCase(createLandingPage.pending, (state) => { state.isCreating = true; state.createError = null; })
      .addCase(createLandingPage.fulfilled, (state, action) => {
        state.isCreating = false;
        state.pages.unshift(action.payload.page);
        state.stats.totalPages += 1;
      })
      .addCase(createLandingPage.rejected, (state, action) => { state.isCreating = false; state.createError = action.payload; })

      .addCase(updateLandingPage.fulfilled, (state, action) => {
        const idx = state.pages.findIndex(p => p._id === action.payload.page._id);
        if (idx !== -1) state.pages[idx] = action.payload.page;
      })

      .addCase(deleteLandingPage.fulfilled, (state, action) => {
        state.pages = state.pages.filter(p => p._id !== action.payload);
        state.stats.totalPages = Math.max(0, state.stats.totalPages - 1);
      });
  },
});

export const { clearCreateError } = landingSlice.actions;
export default landingSlice.reducer;