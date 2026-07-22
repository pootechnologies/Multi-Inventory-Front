import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_BASE_TENANT_URL, API_ENDPOINTS } from "@/utils/apiConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

const iconMap = {
  Basic: Zap,
  Pro: Crown,
  Enterprise: Crown,
};

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_TENANT_URL}${API_ENDPOINTS.TENANT_SUBSCRIPTIONS}`
        );
        setPlans(response.data?.results || []);
      } catch (err) {
        setError(err.message || "Failed to fetch subscription plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your business. Scale up or down anytime.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-muted-foreground">Loading plans...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-center">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = iconMap[plan.name] || Sparkles;
            return (
              <Card
                key={plan.id}
                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl bg-white dark:bg-gray-900"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                <CardHeader className="pt-8 pb-4 px-6">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {plan.is_active && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-bold mt-4 tracking-tight">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">/{plan.duration_days} days</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6 pb-8">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>Full access to all features</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>Valid for {plan.duration_days} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>Priority support</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                    disabled={!plan.is_active}
                  >
                    {plan.is_active ? "Subscribe Now" : "Unavailable"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}