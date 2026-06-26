import { motion } from "framer-motion";
import type { User } from "@myfitness/shared";
import { useState, useEffect } from "react";
import { User as UserIcon, Weight, Ruler, Target, Save } from "lucide-react";

interface UserProfileCardProps {
  profile: User;
  onUpdateProfile: (updates: Partial<User>) => void;
  isUpdating: boolean;
}

export function UserProfileCard({
  profile,
  onUpdateProfile,
  isUpdating,
}: UserProfileCardProps) {
  const [formData, setFormData] = useState({
    age: profile.age || 0,
    weightKg: profile.weightKg || 0,
    heightCm: profile.heightCm || 0,
    fitnessGoal: profile.fitnessGoal || "",
  });

  // Update formData when profile changes (after successful save)
  useEffect(() => {
    setFormData({
      age: profile.age || 0,
      weightKg: profile.weightKg || 0,
      heightCm: profile.heightCm || 0,
      fitnessGoal: profile.fitnessGoal || "",
    });
  }, [profile]);

  const [errors, setErrors] = useState<{
    age?: string;
    weightKg?: string;
    heightCm?: string;
    fitnessGoal?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Temporarily make validation more lenient for testing
    if (formData.age < 1 || formData.age > 150) {
      newErrors.age = "Please enter a valid age between 1 and 150";
    }

    if (formData.weightKg < 1 || formData.weightKg > 500) {
      newErrors.weightKg = "Please enter a valid weight between 1 and 500 kg";
    }

    if (formData.heightCm < 1 || formData.heightCm > 300) {
      newErrors.heightCm = "Please enter a valid height between 1 and 300 cm";
    }

    if (formData.fitnessGoal && formData.fitnessGoal.length > 200) {
      newErrors.fitnessGoal = "Fitness goal must be less than 200 characters";
    }

    console.log('UserProfileCard - Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('UserProfileCard - Form is valid:', isValid);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('UserProfileCard - Form submitted with data:', formData);
    if (validateForm()) {
      console.log('UserProfileCard - Form validation passed, calling onUpdateProfile');
      onUpdateProfile(formData);
    } else {
      console.log('UserProfileCard - Form validation failed');
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "fitnessGoal" ? e.target.value : Number(e.target.value);
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const calculateBMI = () => {
    if (formData.weightKg > 0 && formData.heightCm > 0) {
      const heightInMeters = formData.heightCm / 100;
      const bmi = formData.weightKg / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return { category: "Underweight", color: "text-blue-600 dark:text-blue-400" };
    if (bmi < 25)
      return { category: "Normal", color: "text-green-600 dark:text-green-400" };
    if (bmi < 30)
      return { category: "Overweight", color: "text-yellow-600 dark:text-yellow-400" };
    return { category: "Obese", color: "text-red-600 dark:text-red-400" };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(Number(bmi)) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800  shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16  bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {profile.name?.charAt(0) ?? "U"}
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fitness Profile
            </p>
        </div>
      </div>

        {/* BMI Display */}
        {bmi && bmiCategory && (
          <div className="bg-gray-50 dark:bg-gray-800  p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Body Mass Index
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bmi}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${bmiCategory.color}`}>
                  {bmiCategory.category}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  BMI Category
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Update Form */}
      <div className="bg-white dark:bg-gray-800  shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Update Profile
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Age and Weight Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UserIcon className="w-4 h-4 inline mr-2" />
                Age
              </label>
              <input
                type="number"
                min="13"
                max="120"
                className={`w-full px-4 py-3  border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.age
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
                value={formData.age}
                onChange={handleInputChange("age")}
                placeholder="Enter your age"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.age}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Weight className="w-4 h-4 inline mr-2" />
                Weight (kg)
              </label>
              <input
                type="number"
                min="30"
                max="300"
                step="0.1"
                className={`w-full px-4 py-3  border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.weightKg
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
                value={formData.weightKg}
                onChange={handleInputChange("weightKg")}
                placeholder="Enter your weight"
              />
              {errors.weightKg && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.weightKg}
                </p>
              )}
            </div>
        </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Ruler className="w-4 h-4 inline mr-2" />
              Height (cm)
          </label>
            <input
              type="number"
              min="100"
              max="250"
              className={`w-full px-4 py-3  border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.heightCm
                  ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
              value={formData.heightCm}
              onChange={handleInputChange("heightCm")}
              placeholder="Enter your height"
            />
            {errors.heightCm && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.heightCm}
              </p>
            )}
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              Fitness Goal
            </label>
            <textarea
              rows={3}
              maxLength={200}
              className={`w-full px-4 py-3  border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.fitnessGoal
                  ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
              value={formData.fitnessGoal}
              onChange={handleInputChange("fitnessGoal")}
              placeholder="Describe your fitness goals..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.fitnessGoal ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.fitnessGoal}
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  What do you want to achieve?
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.fitnessGoal.length}/200
              </p>
            </div>
          </div>

          {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
            disabled={isUpdating}
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium  transition-all duration-200 shadow-lg hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <Save className="w-5 h-5 mr-2" />
            {isUpdating ? "Saving..." : "Save Changes"}
            </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
