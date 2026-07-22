import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_BASE_TENANT_URL, API_ENDPOINTS } from "@/utils/apiConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
                className="relative overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl bg-white dark:bg-gray-900"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                <CardHeader className="pt-5 pb-3 px-5">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {plan.is_active && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold mt-3 tracking-tight">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">/{plan.duration_days} days</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-5 pb-5">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      <span>Full access to all features</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      <span>Valid for {plan.duration_days} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      <span>Priority support</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg shadow-md shadow-emerald-600/20 transition-all text-sm py-2"
                    disabled={!plan.is_active}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsDialogOpen(true);
                    }}
                  >
                    {plan.is_active ? "Subscribe Now" : "Unavailable"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-3 pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl">Confirm Subscription</DialogTitle>
            <DialogDescription className="text-base">
              You are about to subscribe to the <span className="font-semibold text-gray-900 dark:text-white">{selectedPlan?.name}</span> plan
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 mb-6 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Plan Price</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${selectedPlan?.price}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-600 dark:text-gray-400">Duration</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedPlan?.duration_days} days
              </span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20"
              disabled={isProcessing}
              onClick={async () => {
                try {
                  setIsProcessing(true);
                  const response = await axiosInstance.post(
                    `${API_ENDPOINTS.TENANT_PAY}/`,
                    { plan: selectedPlan?.id }
                  );
                  const { payment_url } = response.data;
                  window.open(payment_url, '_blank');
                  setIsDialogOpen(false);
                } catch (err) {
                  console.error('Payment initiation failed:', err);
                } finally {
                  setIsProcessing(false);
                }
              }}
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm & Subscribe
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}