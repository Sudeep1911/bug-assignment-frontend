"use client";
import React, { useState, useEffect } from "react";
import { Mail, UserRound, Briefcase, Code, Building, PenLine, Loader2, Award, ArrowLeft } from "lucide-react";
import { useUserAtom } from "@/store/atoms"; // Import the useUserAtom hook
import { useCompanyAtom } from "@/store/companyAtom";
import { useRouter, useSearchParams } from "next/navigation";
import { getProject, getProjectModules } from "@/api/project.api";


export interface MockModules {
  _id: string;
  name: string;
}
export default function ProfilePage() {
  const { currentUser } = useUserAtom();
  const { companyUser } = useCompanyAtom();
  const [moduleDetails, setModuleDetails] = useState<{ id: string; name: string; proficiency: number; }[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
const projectId = searchParams.get('projectId');  
useEffect(() => {
const fetchData = async () => {
      if (!projectId) return;

      // Simulate fetching project modules
      const projectModules = await getProjectModules(projectId) as MockModules[];

      if (currentUser?.details?.modules) {
        // Map module IDs to their names and proficiency scores
        const modulesWithNames = currentUser.details.modules.map(userModule => {
          const foundModule = projectModules.find(m => m._id === userModule.module);
          return {
            id: userModule.module,
            name: foundModule ? foundModule.name : 'Unknown Module',
            proficiency: userModule.proficiency
          };
        });
        setModuleDetails(modulesWithNames);
      }
    };
    
    fetchData();

  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-900 text-white flex items-center justify-center p-4">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
        <p className="ml-4 text-xl text-slate-400">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-900 text-white flex flex-col items-center justify-center p-4">
      {/* Back to Dashboard button */}
      <div className="w-full max-w-2xl mb-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors gap-3"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" /> Back to Dashboard
        </button>
      </div>

      <div className="w-full max-w-2xl backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {currentUser.name || "User"}
              </h1>
              <span className="text-md text-slate-300 font-medium capitalize mt-1 inline-block">
                {currentUser.role}
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-purple-500/50 border-2 border-purple-400 flex items-center justify-center text-2xl font-bold text-white">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <button
              className="absolute bottom-0 right-0 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full border border-white/30 transition-colors"
              onClick={() => alert("Edit functionality to be implemented.")}
            >
              <PenLine className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-white/90 flex items-center gap-2">
              <Mail className="w-6 h-6 text-cyan-400" />
              Contact
            </h2>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/20">
              <p className="text-slate-300 font-medium">{currentUser.email}</p>
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-white/90 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-purple-400" />
              Professional Details
            </h2>
            <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/20">
              <div className="flex items-center gap-4">
                <Building className="w-5 h-5 text-slate-400" />
                <p className="text-slate-300 font-medium">Company: <span className="text-white">{companyUser?.name || "N/A"}</span></p>
              </div>
              <div className="flex items-center gap-4">
                <UserRound className="w-5 h-5 text-slate-400" />
                <p className="text-slate-300 font-medium">Designation: <span className="text-white">{currentUser.role?.toLocaleUpperCase() || "N/A"}</span></p>
              </div>
            </div>
          </div>

          {/* Modules and Proficiency */}
          {moduleDetails.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white/90 flex items-center gap-2">
                <Code className="w-6 h-6 text-pink-400" />
                Assigned Modules
              </h2>
              <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/20">
                {moduleDetails.map((module, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-slate-400" />
                      <p className="text-slate-300 font-medium">{module.name}</p>
                    </div>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-bold text-slate-300 border border-white/20">
                      Proficiency: {module.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

