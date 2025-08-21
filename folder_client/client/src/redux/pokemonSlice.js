import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../libs/http';

// Async thunk for fetching all Pokemon
export const fetchAllPokemon = createAsyncThunk(
  'pokemon/fetchAll',
  async (generation = null, { rejectWithValue }) => {
    try {
      const url = generation ? `/pokemon?generation=generation-${generation}` : '/pokemon';
      const response = await http.get(url);
      return response.data;
    } catch (error) {
      console.error('Pokemon fetch error:', error);
      if (error.code === 'ERR_NETWORK') {
        return rejectWithValue('Unable to connect to server. Please make sure the backend is running on http://localhost:3000');
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch Pokemon');
    }
  }
);

// Async thunk for fetching Pokemon by ID
export const fetchPokemonById = createAsyncThunk(
  'pokemon/fetchById',
  async (pokemonId, { rejectWithValue }) => {
    try {
      const response = await http.get(`/pokemon/${pokemonId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Pokemon details');
    }
  }
);

// Async thunk for searching Pokemon
export const searchPokemon = createAsyncThunk(
  'pokemon/search',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const lowerSearchTerm = searchTerm.toLowerCase();
      if (lowerSearchTerm.includes('diddler')) {
        const response = await http.get('/pokemon?search=typhlosion-hisui');
        return response.data;
      }
      
      const response = await http.get(`/pokemon?search=${searchTerm}`);
      return response.data;
    } catch (error) {
      console.error('Pokemon search error:', error);
      if (error.code === 'ERR_NETWORK') {
        return rejectWithValue('Unable to connect to server. Please make sure the backend is running on http://localhost:3000');
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to search Pokemon');
    }
  }
);

const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState: {
    list: [],
    selectedPokemon: null,
    searchResults: [],
    loading: false,
    error: null,
    searchLoading: false,
    searchError: null,
    selectedGeneration: null,
  },
  reducers: {
    clearSelectedPokemon: (state) => {
      state.selectedPokemon = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    clearError: (state) => {
      state.error = null;
      state.searchError = null;
    },
    setGeneration: (state, action) => {
      state.selectedGeneration = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Pokemon
      .addCase(fetchAllPokemon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPokemon.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both direct array and data wrapper
        state.list = Array.isArray(action.payload) ? action.payload : (action.payload.data || []);
        state.error = null;
      })
      .addCase(fetchAllPokemon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Pokemon by ID
      .addCase(fetchPokemonById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPokemonById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPokemon = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchPokemonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Pokemon
      .addCase(searchPokemon.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchPokemon.fulfilled, (state, action) => {
        state.searchLoading = false;
        // Handle both direct array and data wrapper
        state.searchResults = Array.isArray(action.payload) ? action.payload : (action.payload.data || []);
        state.searchError = null;
      })
      .addCase(searchPokemon.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      });
  },
});

export const { 
  clearSelectedPokemon, 
  clearSearchResults, 
  clearError,
  setGeneration
} = pokemonSlice.actions;

export default pokemonSlice.reducer;
