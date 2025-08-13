"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { authAPI } from "@/lib/api";

const DebugUserInfo = () => {
  const { user, updateUser } = useAuth();
  const [localStorageUser, setLocalStorageUser] = useState<any>(null);
  const [backendUser, setBackendUser] = useState<any>(null);
  const [testingBackend, setTestingBackend] = useState(false);
  const [loginTest, setLoginTest] = useState<any>(null);
  const [backendTest, setBackendTest] = useState<any>(null);

  useEffect(() => {
    // Get raw localStorage data
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setLocalStorageUser(JSON.parse(userStr));
      } catch (error) {
        console.error("Error parsing localStorage user:", error);
      }
    }
  }, [user]);

  const overrideRole = (newRole: "instructor" | "student") => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      updateUser(updatedUser);
      // Also update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log(`Role overridden to: ${newRole}`);
      // Force page reload to see changes
      window.location.reload();
    }
  };

  const testBackendUser = async () => {
    setTestingBackend(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/user/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      setBackendUser(data);
    } catch (error) {
      console.error("Backend user test error:", error);
      setBackendUser({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setTestingBackend(false);
    }
  };

  const testLoginResponse = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
      const data = await response.json();
      setLoginTest({ status: response.status, data });
    } catch (error) {
      setLoginTest({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const testBackendConnectivity = async () => {
    try {
      console.log("Testing backend connectivity...");
      const response = await fetch("http://localhost:8000/api/courses/");
      const data = await response.json();
      setBackendTest({
        status: response.status,
        success: response.ok,
        data: data,
        error: !response.ok ? `HTTP ${response.status}` : null,
      });
    } catch (error) {
      console.error("Backend connectivity test error:", error);
      setBackendTest({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const clearAndReload = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">
          <strong>Debug:</strong> No user data found
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800">
        <strong>🔍 User Debug Info:</strong>
        <br />
        <strong>Context User:</strong>
        <br />- ID: {user.id}
        <br />- Email: {user.email}
        <br />- Role:{" "}
        <span className="font-bold">{user.role || "MISSING"}</span>
        <br />- First Name: {user.first_name}
        <br />- Last Name: {user.last_name}
        <br />- Username: {user.username}
        <br />- Date Joined: {user.date_joined}
        <br />
        <br />
        <strong>Raw localStorage User:</strong>
        <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(localStorageUser, null, 2)}
        </pre>
        <br />
        <strong>Backend User Data:</strong>
        <br />
        <button
          onClick={testBackendUser}
          disabled={testingBackend}
          className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {testingBackend ? "Testing..." : "Test Backend User"}
        </button>
        {backendUser && (
          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(backendUser, null, 2)}
          </pre>
        )}
        <br />
        <strong>Login Response Test:</strong>
        <br />
        <button
          onClick={testLoginResponse}
          className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
        >
          Test Login Response
        </button>
        {loginTest && (
          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(loginTest, null, 2)}
          </pre>
        )}
        <br />
        <strong>Backend Connectivity Test:</strong>
        <br />
        <button
          onClick={testBackendConnectivity}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Test Backend Connectivity
        </button>
        {backendTest && (
          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(backendTest, null, 2)}
          </pre>
        )}
        <br />
        <strong>Role Detection Analysis:</strong>
        <br />- Context role: {user.role || "undefined"}
        <br />- localStorage role: {localStorageUser?.role || "undefined"}
        <br />- Backend role: {backendUser?.role || "not tested"}
        <br />- Role type: {typeof user.role}
        <br />- Is instructor: {user.role === "instructor" ? "YES" : "NO"}
        <br />- Is student: {user.role === "student" ? "YES" : "NO"}
        <br />- Role mismatch:{" "}
        {user.role !== localStorageUser?.role ? "YES" : "NO"}
        <br />
        <br />
        <strong>Quick Actions:</strong>
        <br />
        <div className="flex gap-2 mt-2 flex-wrap">
          <button
            onClick={() => overrideRole("instructor")}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Set as Instructor
          </button>
          <button
            onClick={() => overrideRole("student")}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Set as Student
          </button>
          <button
            onClick={clearAndReload}
            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Clear & Reload
          </button>
        </div>
        <br />
        <strong>Backend Fix Required:</strong>
        <br />
        <div className="text-xs bg-red-100 p-2 rounded mt-2">
          <strong>Issue:</strong> Your backend UserRegistrationSerializer is
          missing the 'role' field in its fields list.
          <br />
          <strong>Fix:</strong> Update authentication/serializers.py:
          <br />
          <code className="bg-gray-200 p-1 rounded">
            fields = ('id', 'email', 'username', 'first_name', 'last_name',
            'password', 'confirm_password', 'role')
          </code>
        </div>
      </p>
    </div>
  );
};

export default DebugUserInfo;
