"use client";
import { useState } from "react";
import Dashboard from "@/components/Dashboard/Dashboard";
import KanbanBoard from "@/components/Dashboard/KanbanBoard";
import ProjectSelector from "@/components/Dashboard/ProjectSelector";
import SubmitItemPopup from "@/components/Dashboard/SubmitItemPopup";
import { SubmitItemData } from "@/components/Dashboard/SubmitItemPopup";
import { BarChart3, Bug, Kanban } from "lucide-react";
import { createItem } from "@/api/items.api";
import { useCompanyAtom } from "@/store/companyAtom";
import { useItemsAtom } from "@/store/itemsAtom";
import Notification from "@/components/Common/Notification";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "on-hold";
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "kanban">("dashboard");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    isVisible: boolean;
  }>({
    type: "success",
    message: "",
    isVisible: false,
  });
  const { companyUser } = useCompanyAtom();
  const { addItem } = useItemsAtom();

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project.name);
  };

  const handleSubmitItem = async (data: SubmitItemData) => {
    setIsSubmitting(true);
    try {
      const itemData = {
        ...data,
        projectId: selectedProject || "default-project",
        companyId: companyUser?._id || "default-company",
        status: "todo" as const,
      };
      
      const response = await createItem(itemData);
      console.log("Item created successfully:", response.data);
      
      // Add to local state
      addItem(response.data);
      
      // Show success notification
      setNotification({
        type: "success",
        message: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} submitted successfully!`,
        isVisible: true,
      });
    } catch (error) {
      console.error("Failed to submit item:", error);
      setNotification({
        type: "error",
        message: "Failed to submit item. Please try again.",
        isVisible: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-800 transition-colors">
              ← Back to Projects
            </button>
            <div className="flex items-center space-x-3">
              <ProjectSelector onSelect={handleProjectSelect} selectedProject={selectedProject} />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSubmitPopupOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Bug className="w-4 h-4" />
              <span>Create New</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>Project Settings</span>
            </button>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("kanban")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "kanban"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Kanban Board</span>
          </button>
        </div>
      </div>
      {/* Content Area */}
      <div className="p-6">
        {activeTab === "dashboard" ? (
          <Dashboard selectedProject={selectedProject} />
        ) : (
          <KanbanBoard selectedProject={selectedProject} />
        )}
      </div>

      {/* Submit Item Popup */}
      <SubmitItemPopup
        isOpen={isSubmitPopupOpen}
        onClose={() => setIsSubmitPopupOpen(false)}
        onSubmit={handleSubmitItem}
      />

      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
} 