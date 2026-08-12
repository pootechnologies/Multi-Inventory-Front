import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";

const PlanContext = createContext(null);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};

export const PlanProvider = ({ children }) => {
  const [planData, setPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentData = async () => {
    // Check if user is authenticated before making API call
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setPlanData({
        status: "not_authenticated",
        planName: null,
        planDetails: null
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.TENANT_PAYMENT_CHECK);
      const paymentsData = response.data?.payments || response.data || [];
      
      // Process the payment data based on status
      if (paymentsData.length > 0) {
        // Check if there's any paid_verified payment
        const paidVerifiedPayment = paymentsData.find(
          payment => payment.status === "paid_verified"
        );
        
        let finalPlanData;
        
        if (paidVerifiedPayment) {
          // If there's a paid_verified payment, return its status and plan name
          finalPlanData = {
            status: "paid_verified",
            planName: paidVerifiedPayment.subscriptionPlan?.name || "Unknown",
            planDetails: paidVerifiedPayment.subscriptionPlan,
            paidAt: paidVerifiedPayment.paid_at,
            expiresAt: paidVerifiedPayment.expires_at,
            reference: paidVerifiedPayment.reference,
            provider: paidVerifiedPayment.provider
          };
        } else {
          // If no paid_verified payments, get the most recent payment (could be pending, failed, etc.)
          const latestPayment = paymentsData.sort((a, b) => b.id - a.id)[0];
          
          finalPlanData = {
            status: latestPayment.status,
            planName: latestPayment.subscriptionPlan?.name || "Basic",
            planDetails: latestPayment.subscriptionPlan,
            paymentUrl: latestPayment.payment_url,
            reference: latestPayment.reference,
            provider: latestPayment.provider
          };
        }
        
        setPlanData(finalPlanData);
        
        // Save to localStorage for debugging
        localStorage.setItem("planData", JSON.stringify(finalPlanData));
      } else {
        // No payment data found - default to Basic plan
        const basicPlanData = {
          status: "basic",
          planName: "Basic",
          planDetails: null
        };
        setPlanData(basicPlanData);
        
        // Save to localStorage for debugging
        localStorage.setItem("planData", JSON.stringify(basicPlanData));
      }
    } catch (err) {
      console.error("Error fetching payment data:", err);
      setError(err.message);
      setPlanData({
        status: "error",
        planName: null,
        planDetails: null,
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const refetchPlanData = () => {
    fetchPaymentData();
  };

  return (
    <PlanContext.Provider value={{ planData, isLoading, error, refetchPlanData }}>
      {children}
    </PlanContext.Provider>
  );
};
