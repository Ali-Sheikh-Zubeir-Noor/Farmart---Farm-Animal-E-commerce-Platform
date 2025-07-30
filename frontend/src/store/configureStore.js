import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import animalSlice from './slices/animalSlice';
import cartSlice from './slices/cartSlice';
import orderSlice from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    animals: animalSlice,
    cart: cartSlice,
    orders: orderSlice,
  },
});

export default store;