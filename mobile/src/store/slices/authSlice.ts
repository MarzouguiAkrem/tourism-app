import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/client';
import { tokenStorage } from '../../utils/tokenStorage';
import { User } from '../../types/user';

const extractErrorMessage = (error: any, fallback: string): string => {
  if (error?.response?.data?.message) {
    const { message, errors } = error.response.data;
    if (Array.isArray(errors) && errors.length > 0) {
      return `${message}: ${errors.join(', ')}`;
    }
    return message;
  }
  if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
    return `Impossible de joindre le serveur (${api.defaults.baseURL}). Vérifiez le réseau.`;
  }
  if (error?.code === 'ECONNABORTED') {
    return 'La requête a expiré. Le serveur est-il démarré ?';
  }
  return error?.message || fallback;
};

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  hasOnboarded: false,
  error: null,
};

// Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data.data;

      await tokenStorage.setItem('accessToken', accessToken);
      await tokenStorage.setItem('refreshToken', refreshToken);

      return { user, token: accessToken };
    } catch (error: any) {
      console.log('[auth/login] error:', error?.message, error?.response?.status, error?.response?.data);
      return rejectWithValue(extractErrorMessage(error, 'Login failed'));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data.data;

      await tokenStorage.setItem('accessToken', accessToken);
      await tokenStorage.setItem('refreshToken', refreshToken);

      return { user, token: accessToken };
    } catch (error: any) {
      console.log('[auth/register] error:', error?.message, error?.response?.status, error?.response?.data);
      return rejectWithValue(extractErrorMessage(error, 'Registration failed'));
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = await tokenStorage.getItem('accessToken');
      if (!token) return rejectWithValue('No token');

      const response = await api.get('/auth/me');
      return { user: response.data.data, token };
    } catch (error: any) {
      await tokenStorage.deleteItem('accessToken');
      await tokenStorage.deleteItem('refreshToken');
      return rejectWithValue('Session expired');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Continue logout even if API call fails
  }
  await tokenStorage.deleteItem('accessToken');
  await tokenStorage.deleteItem('refreshToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setOnboarded: (state) => {
      state.hasOnboarded = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.hasOnboarded = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.hasOnboarded = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load user
    builder
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    });
  },
});

export const { setOnboarded, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
