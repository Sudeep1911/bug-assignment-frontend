"use client";

import { createCompany, updateCompany} from "@/api/company.api";
import { useUserAtom } from "@/store/atoms";
import { useCompanyAtom } from "@/store/companyAtom";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Loader2 } from "lucide-react";
import Notification from "@/components/Dashboard/Notfication"; // Assuming this component exists

// Mock updateCompany API function for demonstration purposes

export default function Company() {
  const router = useRouter();
  const { currentUser } = useUserAtom();
  const { companyUser, setCompanyUser } = useCompanyAtom();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    type: "success" as "success" | "error",
    message: "",
    isVisible: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    description: "",
  });
console.log(companyUser, "companyUser");
  // Populate form with existing company data if available
  useEffect(() => {
    if (companyUser) {
      setFormData({
        name: companyUser.name || "",
        industry: companyUser.industry || "",
        description: companyUser.description || "",
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [companyUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let response;
      if (isEditing && companyUser?._id) {
        // Handle update existing company
        response = await updateCompany(companyUser._id, formData);
        setCompanyUser(response?.data);

        setNotification({
          type: "success",
          message: "Company updated successfully!",
          isVisible: true,
        });
      } else {
        // Handle create new company
        const id = currentUser?._id;
        response = await createCompany({ ...formData, ownerId: id });
      
        if (response?.data) {
          router.push("/company/people");
          setNotification({
          type: "success",
          message: "Company created successfully!",
          isVisible: true,
        });
        setCompanyUser(response?.data);
        }
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setNotification({
        type: "error",
        message: "An error occurred. Please try again.",
        isVisible: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Back to Dashboard button, conditionally rendered and centered */}
      {companyUser && (
        <div className="w-full max-w-md mx-auto mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors gap-3"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" /> Back to Dashboard
          </button>
        </div>
      )}
      
      <div className="w-full max-w-md relative">
        {!companyUser && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl mb-6 shadow-2xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
Create Company
          </h1>
          <p className="text-slate-400">

Set up a new company to manage its tasks and projects.
          </p>
        </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 space-y-6"
        >
          {companyUser && (
                  <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Update Company
          </h1>
          <p className="text-slate-400">
            Edit your company's details
          </p>
        </div>
          )}
          {/* Company Name */}
          <div className="relative gap-2">
            Company Name
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter Company Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-4 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
              required
            />
          </div>

          {/* Industry */}
          <div className="relative gap-2">
            Industry Name
            <input
              id="industry"
              name="industry"
              type="text"
              placeholder="Enter Industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full pl-4 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
              required
            />
          </div>

          {/* Description */}
          <div className="relative gap-2">
            Company Description (Optional)
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Optional"
              value={formData.description}
              onChange={handleChange}
              className="w-full pl-4 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
            ></textarea>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-4 rounded-2xl font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{isEditing ? "Update Company" : "Create Company"}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
