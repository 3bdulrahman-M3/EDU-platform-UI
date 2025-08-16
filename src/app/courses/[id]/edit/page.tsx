"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { coursesAPI } from "@/lib/coursesAPI";
import { Course } from "@/types";
import Link from "next/link";

const levels = ["beginner", "intermediate", "advanced"];

const EditCoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    level: "beginner",
    category: "",
    image: undefined as File | undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (courseId) fetchCourse();
    // eslint-disable-next-line
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesAPI.getCourseById(Number(courseId));
      setCourse(data);
      setForm({
        title: data.title || "",
        description: data.description || "",
        price: data.price ? String(data.price) : "",
        duration: data.duration ? String(data.duration) : "",
        level: data.level || "beginner",
        category: data.category || "",
        image: undefined,
      });
    } catch (err) {
      setError("Failed to fetch course data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await coursesAPI.updateCourse(Number(courseId), {
        title: form.title,
        description: form.description,
        price: form.price ? Number(form.price) : undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        level: form.level,
        category: form.category,
        image: form.image,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/courses/${courseId}`), 1200);
    } catch (err) {
      setError("Failed to update course. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-gray-900)" }}>
        <div className="text-gray-200">Loading course data...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "var(--color-gray-900)" }}>
        <div className="text-red-400 text-lg mb-4">{error || "Course not found."}</div>
        <Link href="/courses" className="btn-primary">Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: "var(--color-gray-900)" }}>
      <div className="container-custom max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-100 mb-8">Edit Course</h1>
        <form onSubmit={handleSubmit} className="bg-secondary-900 rounded-xl p-8 shadow-soft space-y-6">
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="price">Price</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="duration">Duration (hours)</label>
              <input
                id="duration"
                name="duration"
                type="number"
                min="0"
                value={form.duration}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="level">Level</label>
              <select
                id="level"
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="image">Course Image (optional)</label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {success && <div className="text-green-400 text-sm">Course updated successfully! Redirecting...</div>}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <Link href={`/courses/${courseId}`} className="btn-outline flex-1 text-center">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCoursePage;
