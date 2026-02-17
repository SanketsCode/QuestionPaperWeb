"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  SubscriptionPlan,
  getExamCategories,
  getMySubscription,
  getPlans,
  getRazorpayKey,
  subscribe,
} from "../../lib/api";

function formatPrice(plan: SubscriptionPlan) {
  if (plan.price === 0) return "Free";
  const currency = plan.currency || "INR";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(plan.price);
}

function featureLabel(plan: SubscriptionPlan) {
  const list: string[] = [];
  if (plan.features?.customPaperPerDay) {
    list.push(`${plan.features.customPaperPerDay} custom papers/day`);
  }
  if (plan.features?.examsPerDay) {
    list.push(`${plan.features.examsPerDay} exams/day`);
  }
  if (plan.features?.maxCustomPapersStorage) {
    list.push(`${plan.features.maxCustomPapersStorage} saved papers`);
  }
  if (plan.features?.noAds) list.push("No ads");
  if (plan.features?.multiLanguageAccess) list.push("Multi-language access");
  return list;
}

export default function SubscriptionPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const categoriesQuery = useQuery({
    queryKey: ["examCategories"],
    queryFn: getExamCategories,
  });

  useEffect(() => {
    if (!selectedCategoryId && categoriesQuery.data?.length) {
      setSelectedCategoryId(categoriesQuery.data[0]._id);
    }
  }, [categoriesQuery.data, selectedCategoryId]);

  const plansQuery = useQuery({
    queryKey: ["plans", selectedCategoryId],
    queryFn: () => getPlans(selectedCategoryId || undefined),
    enabled: !!selectedCategoryId,
  });

  const subscriptionQuery = useQuery({
    queryKey: ["my-subscription"],
    queryFn: getMySubscription,
  });

  const razorpayKeyQuery = useQuery({
    queryKey: ["razorpay-key"],
    queryFn: getRazorpayKey,
  });

  const subscribeMutation = useMutation({
    mutationFn: ({ planId, paymentId }: { planId: string; paymentId: string }) =>
      subscribe(planId, paymentId),
    onSuccess: () => {
      subscriptionQuery.refetch();
    },
  });

  const currentPlans = useMemo(
    () => plansQuery.data || [],
    [plansQuery.data]
  );

  const handlePurchase = (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      subscribeMutation.mutate({ planId: plan._id, paymentId: "FREE_PLAN" });
      return;
    }
    const paymentId = window.prompt(
      "Enter Razorpay payment id to confirm purchase"
    );
    if (!paymentId) return;
    subscribeMutation.mutate({ planId: plan._id, paymentId });
  };

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Subscription
          </p>
          <h1 className="mt-3 font-display text-3xl">Premium plans</h1>
          <p className="mt-2 text-sm text-muted">
            Unlock premium practice and higher daily limits.
          </p>
        </header>

        <div className="rounded-3xl border border-border bg-white/70 p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-muted">
            Category
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(categoriesQuery.data || []).map(category => (
              <button
                key={category._id}
                onClick={() => setSelectedCategoryId(category._id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  selectedCategoryId === category._id
                    ? "bg-brand text-white"
                    : "border border-border bg-white text-muted"
                }`}
              >
                {category.category_name}
              </button>
            ))}
          </div>
        </div>

        {subscriptionQuery.data ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
            Current subscription:{" "}
            {subscriptionQuery.data?.global?.subscriptionId?.name ||
              subscriptionQuery.data?.global?.planName ||
              "None"}
          </div>
        ) : null}

        {plansQuery.isLoading ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
            Loading plans...
          </div>
        ) : currentPlans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
            No active plans found for this category.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {currentPlans.map(plan => (
              <div
                key={plan._id}
                className="rounded-3xl border border-border bg-card p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{plan.name}</div>
                    {plan.description ? (
                      <div className="mt-2 text-xs text-muted">
                        {plan.description}
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
                    {plan.scope}
                  </div>
                </div>
                <div className="mt-4 text-3xl font-semibold">
                  {formatPrice(plan)}
                </div>
                <div className="mt-2 text-xs text-muted">
                  {plan.durationInDays} days · {plan.currency || "INR"}
                </div>

                <ul className="mt-4 space-y-2 text-xs text-muted">
                  {featureLabel(plan).map(feature => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>

                <button
                  className="mt-6 w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                  onClick={() => handlePurchase(plan)}
                  disabled={subscribeMutation.isPending}
                >
                  {plan.price === 0 ? "Activate free plan" : "Continue to pay"}
                </button>
              </div>
            ))}
          </div>
        )}

        {razorpayKeyQuery.data?.key ? (
          <div className="text-xs text-muted">
            Razorpay key loaded.
          </div>
        ) : null}
      </div>
    </div>
  );
}
