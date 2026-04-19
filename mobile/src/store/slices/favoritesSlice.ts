import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { favoritesService } from '../../services/favorites.service';

interface FavoritesState {
  ids: string[]; // place IDs
  loading: boolean;
  loaded: boolean;
  togglingIds: string[]; // optimistic in-flight toggles
  error: string | null;
}

const initialState: FavoritesState = {
  ids: [],
  loading: false,
  loaded: false,
  togglingIds: [],
  error: null,
};

export const loadFavoriteIds = createAsyncThunk(
  'favorites/loadIds',
  async (_, { rejectWithValue }) => {
    try {
      return await favoritesService.listIds();
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to load favorites');
    }
  }
);

export const toggleFavorite = createAsyncThunk<
  { placeId: string; favorited: boolean },
  string,
  { rejectValue: { placeId: string; message: string } }
>('favorites/toggle', async (placeId, { rejectWithValue }) => {
  try {
    const favorited = await favoritesService.toggle(placeId);
    return { placeId, favorited };
  } catch (e: any) {
    return rejectWithValue({
      placeId,
      message: e?.response?.data?.message || 'Toggle failed',
    });
  }
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.ids = [];
      state.loaded = false;
      state.togglingIds = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFavoriteIds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFavoriteIds.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.loading = false;
        state.loaded = true;
        state.ids = action.payload;
      })
      .addCase(loadFavoriteIds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Optimistic toggle
      .addCase(toggleFavorite.pending, (state, action) => {
        const placeId = action.meta.arg;
        state.togglingIds.push(placeId);
        const idx = state.ids.indexOf(placeId);
        if (idx >= 0) {
          state.ids.splice(idx, 1);
        } else {
          state.ids.push(placeId);
        }
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { placeId, favorited } = action.payload;
        state.togglingIds = state.togglingIds.filter((id) => id !== placeId);
        const idx = state.ids.indexOf(placeId);
        // Reconcile with server truth in case optimistic was wrong
        if (favorited && idx < 0) state.ids.push(placeId);
        if (!favorited && idx >= 0) state.ids.splice(idx, 1);
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        const placeId = action.payload?.placeId || action.meta.arg;
        state.togglingIds = state.togglingIds.filter((id) => id !== placeId);
        // Roll back optimistic update
        const idx = state.ids.indexOf(placeId);
        if (idx >= 0) state.ids.splice(idx, 1);
        else state.ids.push(placeId);
        state.error = action.payload?.message || 'Toggle failed';
      });
  },
});

export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
