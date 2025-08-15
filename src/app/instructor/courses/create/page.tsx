"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiArrowLeft } from "react-icons/fi";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import { instructorAPI } from "@/lib";
import Link from "next/link";

const CreateCourse = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);

    // Client-side validation
    if (!formData.title.trim()) {
      setError("Course title is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Course description is required");
      return;
    }
    if (formData.title.trim().length < 3) {
      setError("Course title must be at least 3 characters long");
      return;
    }
    if (formData.description.trim().length < 10) {
      setError("Course description must be at least 10 characters long");
      return;
    }

    // Image validation
    if (imageFile) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(imageFile.type)) {
        setError("Invalid image format. Please use PNG, JPG, or GIF.");
        return;
      }

      if (imageFile.size > maxSize) {
        setError("Image file is too large. Maximum size is 10MB.");
        return;
      }
    }

    try {
      setIsLoading(true);

      console.log("Submitting course data:", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        hasImage: !!imageFile,
        imageName: imageFile?.name,
        imageSize: imageFile?.size,
      });

      const createdCourse = await instructorAPI.createCourse({
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: imageFile || undefined,
      });

      console.log("Course created successfully:", createdCourse);

      // Show success message briefly before redirecting
      setError(null);

      // Redirect to instructor dashboard
      router.push("/instructor");
    } catch (err: unknown) {
      console.error("Error creating course:", err);

      // Handle different error types
      if (err instanceof Error) {
        setError(err.message);
      } else if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        setError(
          axiosError.response?.data?.message ||
            "Failed to create course. Please try again."
        );
      } else {
        setError("Failed to create course. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleBasedRoute allowedRoles={["instructor"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/instructor"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Course
            </h1>
            <p className="text-gray-600">
              Add a new course to your teaching portfolio
            </p>
          </div>

          {/* Form */}
          <div className="max-w-2xl">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Title */}
              <div className="mb-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Course Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter course title"
                  required
                  maxLength={100}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {formData.title.length}/100 characters
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Course Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                  placeholder="Describe what students will learn in this course..."
                  required
                  maxLength={1000}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/1000 characters
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Image
                </label>
                <div className="space-y-4">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Course preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <input
                      type="file"
                      id="image"
                      key={imageFile ? "has-file" : "no-file"}
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleImageChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <label
                      htmlFor="image"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <FiUpload className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {imageFile ? "Change Image" : "Upload Course Image"}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                        {imageFile && (
                          <p className="text-xs text-green-600 mt-1">
                            {imageFile.name} (
                            {(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Link
                  href="/instructor"
                  className="flex-1 btn-outline text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Course</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
};

export default CreateCourse;
