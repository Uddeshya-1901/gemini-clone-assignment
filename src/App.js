import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { loadUserFromStorage } from "./store/slices/authSlice";
import { loadChatroomsFromStorage } from "./store/slices/chatSlice";
import { ToastContainer } from "./components/ui/Toast";
import PhoneForm from "./components/auth/PhoneForm";
import OTPForm from "./components/auth/OTPForm";
import GeminiLayout from "./components/layout/GeminiLayout";
import "./App.css";

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, otpSent } = useAppSelector((state) => state.auth);
  const { toasts } = useAppSelector((state) => state.ui);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    // Load saved data on app initialization
    dispatch(loadUserFromStorage());
    dispatch(loadChatroomsFromStorage());
  }, [dispatch]);

  const handleOTPSent = (phoneNumber) => {
    setPhone(phoneNumber);
  };

  const handleBackToOTP = () => {
    // Reset to phone form
    setPhone("");
  };

  // Authentication flow
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        {!otpSent ? (
          <PhoneForm onOTPSent={handleOTPSent} />
        ) : (
          <OTPForm phone={phone} onBack={handleBackToOTP} />
        )}
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // Main application - Gemini-style layout
  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      <GeminiLayout />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
