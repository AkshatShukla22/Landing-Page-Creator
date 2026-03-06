// frontend/src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import landingReducer from './landingSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    landing: landingReducer,
    ui: uiReducer,
  },
});

export default store;