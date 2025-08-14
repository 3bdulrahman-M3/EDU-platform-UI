"use client";

import { useState } from "react";
import { authAPI } from "@/lib/api";

const RegistrationTest = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    try {
      console.log("Testing registration with role...");

      const testData = {
        email: "testinstructor@example.com",
        password: "password123",
        confirm_password: "password123",
        first_name: "Test",
        last_name: "Instructor",
        username: "testinstructor",
        role: "instructor",
      };

      console.log("Sending test data:", testData);

      const response = await authAPI.register(testData);

      console.log("Registration response:", response);
      setTestResult({
        success: true,
        data: response.data,
        userRole: response.data.user?.role,
      });
    } catch (error: unknown) {
      console.error("Registration test error:", error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseData: (error as any)?.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const testBackendDirectly = async () => {
    setLoading(true);
    try {
      console.log("Testing backend directly...");

      const response = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "directtest@example.com",
          password: "password123",
          confirm_password: "password123",
          first_name: "Direct",
          last_name: "Test",
          username: "directtest",
          role: "instructor",
        }),
      });

      const data = await response.json();

      console.log("Direct backend response:", data);
      setTestResult({
        success: response.ok,
        status: response.status,
        data: data,
        userRole: data.user?.role,
      });
    } catch (error: any) {
      console.error("Direct test error:", error);
      setTestResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">
        🔧 Registration Debug Test
      </h3>

      <div className="space-y-3">
        <button
          onClick={testRegistration}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Registration API"}
        </button>

        <button
          onClick={testBackendDirectly}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {loading ? "Testing..." : "Test Backend Directly"}
        </button>
      </div>

      {testResult && (
        <div className="mt-4">
          <h4 className="font-semibold text-blue-800 mb-2">Test Result:</h4>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>

          {testResult.success && testResult.userRole && (
            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded">
              <strong>✅ Role detected:</strong> {testResult.userRole}
            </div>
          )}

          {testResult.success && !testResult.userRole && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
              <strong>❌ No role detected!</strong> Backend is not saving the
              role field.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegistrationTest;
