"use client";

import { createCompany } from "@/api/company.api";
import { useUserAtom } from "@/store/atoms";
import { useCompanyAtom } from "@/store/companyAtom";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Company() {
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    description: "",
  });
  const router = useRouter();
  const { currentUser } = useUserAtom();
  const { companyUser, setCompanyUser } = useCompanyAtom();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = currentUser?._id;
    const response = await createCompany({ ...formData, ownerId: id });
    console.log(response, "response");
    setCompanyUser(response?.data);
    if (response?.data) {
      router.push("/company/people");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-glass border border-border rounded-xl p-8 w-full max-w-xl shadow-xl backdrop-blur-sm"
      >
        <h2 className="text-3xl font-bold text-primary mb-6">Create Company</h2>

        <div className="mb-4">
          <label className="block text-sm mb-1" htmlFor="name">
            Company Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1" htmlFor="industry">
            Industry
          </label>
          <input
            id="industry"
            name="industry"
            type="text"
            value={formData.industry}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary hover:bg-primary-dark rounded-lg text-white font-semibold transition"
        >
          Create Company
        </button>
      </form>
    </div>
  );
}
