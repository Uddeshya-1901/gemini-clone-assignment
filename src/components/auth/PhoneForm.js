import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Phone } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { LoadingSpinner } from "../ui/Loading";
import { phoneSchema } from "../../lib/validations";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCountries, sendOTP } from "../../store/slices/authSlice";
import { addToast } from "../../store/slices/uiSlice";

const PhoneForm = ({ onOTPSent }) => {
  const dispatch = useAppDispatch();
  const { countries, isLoading, otpLoading } = useAppSelector(
    (state) => state.auth
  );
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      // Default to US
      const defaultCountry =
        countries.find((c) => c.code === "+1") || countries[0];
      setSelectedCountry(defaultCountry);
      setValue("countryCode", defaultCountry.code);
    }
  }, [countries, selectedCountry, setValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const onSubmit = async (data) => {
    const fullPhone = `${data.countryCode}${data.phoneNumber}`;

    try {
      await dispatch(sendOTP({ phone: fullPhone })).unwrap();
      dispatch(
        addToast({
          message: "OTP sent successfully!",
          type: "success",
        })
      );
      onOTPSent(fullPhone);
    } catch (error) {
      dispatch(
        addToast({
          message: error || "Failed to send OTP",
          type: "error",
        })
      );
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setValue("countryCode", country.code);
    setShowDropdown(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Gemini
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your phone number to get started
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number
          </label>

          <div className="flex space-x-2">
            {/* Country Code Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-md bg-white dark:bg-gray-950 dark:border-gray-800 min-w-[120px] h-10"
                disabled={isLoading}
              >
                {selectedCountry ? (
                  <>
                    <span className="text-sm">{selectedCountry.code}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Select</span>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showDropdown && (
                <div className="absolute z-10 w-80 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                    >
                      <span className="flex-1 truncate">{country.name}</span>
                      <span className="text-gray-500">{country.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Number Input */}
            <div className="flex-1">
              <Input
                {...register("phoneNumber")}
                placeholder="Enter phone number"
                error={errors.phoneNumber}
                className="w-full"
              />
            </div>
          </div>

          {(errors.countryCode || errors.phoneNumber) && (
            <p className="text-sm text-red-500">
              {errors.countryCode?.message || errors.phoneNumber?.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={otpLoading || isLoading}
        >
          {otpLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Sending OTP...
            </>
          ) : (
            <>
              <Phone className="w-4 h-4 mr-2" />
              Send OTP
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default PhoneForm;
