"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMyProfile, updateProfile } from "../../lib/api";
import { useLanguage } from "../LanguageContext";

type UserProfile = {
  name: string;
  email: string;
  contact: string;
  gender: string;
  address: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    email: "",
    contact: "",
    gender: "",
    address: "",
  });
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
  });

  useEffect(() => {
    if (profileQuery.data) {
      setFormData({
        name: profileQuery.data.name || "",
        email: profileQuery.data.email || "",
        contact: profileQuery.data.contact || "",
        gender: profileQuery.data.gender || "",
        address: profileQuery.data.address || "",
      });
    }
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserProfile> & { userId: string }) =>
      updateProfile(data),
    onSuccess: (data) => {
      // Update local storage if needed to reflect changes immediately without refetch
      const raw = localStorage.getItem("qp_user");
      if (raw) {
        const user = JSON.parse(raw);
        const updated = { ...user, ...data?.user }; // Assuming API returns { user: ... }
        localStorage.setItem("qp_user", JSON.stringify(updated));
      }
      router.push("/profile");
    },
    onError: () => {
      setError("Failed to update profile. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!profileQuery.data?._id) return;

    updateMutation.mutate({
      userId: profileQuery.data._id,
      name: formData.name,
      email: formData.email,
      gender: formData.gender,
      address: formData.address,
    });
  };

  if (profileQuery.isLoading) {
    return (
      <div className="px-6 py-10 text-sm text-muted">Loading profile...</div>
    );
  }

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {t("profile.title")}
          </p>
          <h1 className="mt-3 font-display text-3xl">{t("profile.editDetails")}</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold">{t("profile.fullName")}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">{t("profile.email")}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                {t("profile.mobile")}
              </label>
              <input
                type="text"
                value={formData.contact}
                readOnly
                className="mt-2 w-full rounded-2xl border border-border bg-gray-50 px-4 py-3 text-sm text-muted"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">{t("profile.gender")}</label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none"
              >
                <option value="">{t("profile.selectGender")}</option>
                <option value="MALE">{t("profile.male")}</option>
                <option value="FEMALE">{t("profile.female")}</option>
                <option value="OTHER">{t("profile.other")}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">{t("profile.address")}</label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={3}
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none"
                placeholder="Your address"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
            >
              {updateMutation.isPending ? t("profile.saving") : t("profile.saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
