import React from "react";

const PaymentReminder = () => {
  const handleRenew = () => {
    window.location.href = "/subscription";
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md" />
      <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4 text-center pointer-events-auto">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Subscription Expired
          </h2>
          <p className="text-gray-600 mb-6">
            Your subscription has expired. Please renew your payment plan to continue using the service.
          </p>
          <button
            onClick={handleRenew}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Renew Subscription
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentReminder;