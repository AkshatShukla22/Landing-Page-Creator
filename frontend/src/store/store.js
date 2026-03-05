// frontend/src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import landingReducer from './landingSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    landing: landingReducer,
  },
});

export default store;