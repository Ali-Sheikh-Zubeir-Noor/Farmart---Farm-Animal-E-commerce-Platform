import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchAnimals = createAsyncThunk(
  'animals/fetchAnimals',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/animals?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const addAnimal = createAsyncThunk(
  'animals/addAnimal',
  async (animalData, { rejectWithValue }) => {
    try {
      const response = await api.post('/animals', animalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateAnimal = createAsyncThunk(
  'animals/updateAnimal',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/animals/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteAnimal = createAsyncThunk(
  'animals/deleteAnimal',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/animals/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const animalSlice = createSlice({
  name: 'animals',
  initialState: {
    animals: [],
    isLoading: false,
    error: null,
    filters: {
      type: '',
      breed: '',
      minAge: '',
      maxAge: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      search: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        type: '',
        breed: '',
        minAge: '',
        maxAge: '',
        minPrice: '',
        maxPrice: '',
        location: '',
        search: '',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnimals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnimals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.animals = action.payload;
      })
      .addCase(fetchAnimals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addAnimal.fulfilled, (state, action) => {
        state.animals.push(action.payload);
      })
      .addCase(updateAnimal.fulfilled, (state, action) => {
        const index = state.animals.findIndex(animal => animal.id === action.payload.id);
        if (index !== -1) {
          state.animals[index] = action.payload;
        }
      })
      .addCase(deleteAnimal.fulfilled, (state, action) => {
        state.animals = state.animals.filter(animal => animal.id !== action.payload);
      });
  },
});

export const { setFilters, clearFilters, clearError } = animalSlice.actions;
export default animalSlice.reducer;