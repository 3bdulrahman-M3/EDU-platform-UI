"use client";

import Link from "next/link";
import { FiShield, FiHome, FiArrowLeft } from "react-icons/fi";

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiShield className="w-12 h-12 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          You don't have permission to access this page. This area is restricted
          to users with the appropriate role.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/"
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <FiHome className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full btn-outline flex items-center justify-center space-x-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            If you believe this is an error, please contact support or try
            logging in with a different account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
