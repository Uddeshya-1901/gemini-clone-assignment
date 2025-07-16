import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";



// Async thunk for fetching countries
export const fetchCountries = createAsyncThunk(
  "auth/fetchCountries",
  async () => {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,idd,cca2"
    );
    console.log(response);
    const data = await response.json();
    console.log(data);
    return data
      .map((country) => ({
        name: country.name.common,
        code: country.idd.root + (country.idd.suffixes?.[0] || ""),
      }))
      .filter((country) => country.code && country.code !== "+")
      .sort((a, b) => a.name.localeCompare(b.name));
  }
);

// Simulate OTP sending
export const sendOTP = createAsyncThunk(
  "auth/sendOTP",
  async ({ phone }, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate random failure (10% chance)
      if (Math.random() < 0.1) {
        throw new Error("Failed to send OTP");
      }

      return { phone, otp: "123456" }; // Mock OTP
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Simulate OTP verification
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (otp !== "123456") {
        throw new Error("Invalid OTP");
      }

      const user = {
        id: Date.now().toString(),
        phone,
        name: `User ${phone.slice(-4)}`,
        createdAt: new Date().toISOString(),
      };

      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  countries: [],
  isLoading: false,
  error: null,
  otpSent: false,
  otpLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      localStorage.removeItem("gemini-auth");
    },
    clearError: (state) => {
      state.error = null;
    },
    loadUserFromStorage: (state) => {
      const savedAuth = localStorage.getItem("gemini-auth");
      if (savedAuth) {
        const { user } = JSON.parse(savedAuth);
        state.user = user;
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch countries
      .addCase(fetchCountries.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.countries = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.otpLoading = false;
        state.otpSent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.otpSent = false;
        localStorage.setItem(
          "gemini-auth",
          JSON.stringify({ user: action.payload })
        );
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
