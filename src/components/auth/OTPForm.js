import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/Loading";
import { otpSchema } from "../../lib/validations";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { verifyOTP } from "../../store/slices/authSlice";
import { addToast } from "../../store/slices/uiSlice";

const OTPForm = ({ phone, onBack }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOTPChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6);
      const newOtpInputs = [...otpInputs];

      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtpInputs[i] = pastedData[i];
      }

      setOtpInputs(newOtpInputs);
      setValue("otp", newOtpInputs.join(""));

      // Focus the next empty input or last input
      const nextIndex = Math.min(pastedData.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }

      return;
    }

    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = value;
    setOtpInputs(newOtpInputs);

    const otpString = newOtpInputs.join("");
    setValue("otp", otpString);

    if (value && index < 5) {
      // Move to next input
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data) => {
    try {
      await dispatch(verifyOTP({ phone, otp: data.otp })).unwrap();
      dispatch(
        addToast({
          message: "Login successful!",
          type: "success",
        })
      );
    } catch (error) {
      dispatch(
        addToast({
          message: error || "Invalid OTP",
          type: "error",
        })
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 mx-auto text-primary-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Verify OTP
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          We've sent a 6-digit code to
        </p>
        <p className="text-gray-900 dark:text-white font-medium">{phone}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Use <strong>123456</strong> as OTP for demo
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter OTP
          </label>

          <div className="flex space-x-2 justify-center">
            {otpInputs.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-bold border border-gray-200 rounded-md bg-white dark:bg-gray-950 dark:border-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          {errors.otp && (
            <p className="text-sm text-red-500 text-center">
              {errors.otp.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otpInputs.join("").length < 6}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Phone Number
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OTPForm;
