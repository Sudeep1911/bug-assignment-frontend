"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Dashboard from "@/components/Dashboard/Dashboard";
import KanbanBoard from "@/components/Dashboard/KanbanBoard";
import ProjectSelector from "@/components/Dashboard/ProjectSelector";
import { Project } from "@/types/project.types";
import SubmitItemPopup, { SubmitItemData } from "./SubmitItemPopup";
import Notification from "@/components/Dashboard/Notfication"
import { useCompanyAtom } from "@/store/companyAtom";
import { BarChart3, Bug, Kanban, LogOut, Plus, Settings, User, Building2, Users, UserCircle } from "lucide-react"; // Import new icons
import { createItem, getItems, ItemData, updateItem } from "@/api/item.api";
import { useItemsAtom } from "@/store/itemsAtom";
import { getCompanyUser } from "@/api/company.api";
import { useUserAtom } from "@/store/atoms";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "kanban">("dashboard");
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<ItemData[]>([]);
  const { companyUser } = useCompanyAtom();
  const { currentUser } = useUserAtom();

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
  const [editedBug, setEditedBug] = useState<ItemData | undefined>(undefined);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // New state for dropdown
const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedProject?._id && companyUser?._id) {
          const [employees, items] = await Promise.all([
            getCompanyUser(selectedProject._id),
            getItems(selectedProject._id),
          ]);
          
          if (employees) {
            setAvailableEmployees(employees);
          }
          
          if (items) {
            setTasks(items.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    
    fetchData();
  }, [companyUser?._id, selectedProject?._id]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event:any) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };
  
  const handleBugEdit = (bug: ItemData) => {
    setEditedBug(bug);
    setIsSubmitPopupOpen(true);
  };
  
  const handleSubmitItem = async (data: SubmitItemData) => {
    setIsSubmitting(true);
    
    try {
      const todoStageId = selectedProject?.kanbanStages?.find(
        (stage: any) => stage.name.toLowerCase() === "todo"
      )?._id;
      
      const itemData = {
        ...data,
        projectId: selectedProject?._id || "default-project",
        companyId: companyUser?._id || "default-company",
        status: todoStageId || "todo",
      };
      
      const response = await createItem(itemData as any);
      
      if (response.data) {
        setTasks((prevTasks) => [...prevTasks, response.data]);
      }
      
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
      setIsSubmitPopupOpen(false);
    }
  };
  
  const handleItemStatusUpdate = async (itemId: string, newStatus: string) => {
    const originalTasks = [...tasks];
    const taskToUpdate = originalTasks.find((t) => t._id === itemId);
    if (!taskToUpdate || taskToUpdate.status === newStatus) return;
  
    
    try {
      const response = await updateItem(itemId, { status: newStatus, projectId: selectedProject?._id });
      
      if (response && response.data) {
        const updatedItem = response.data;
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === updatedItem._id ? updatedItem : task
          )
        );
        setNotification({
          type: "success",
          message: "Item status updated successfully!",
          isVisible: true,
        });
      }
      else{
        setNotification({
          type: "error",
          message: "Item updated, but no data received. Please refresh.",
          isVisible: true,
        });
      }
    } catch (error) {
      console.error("Failed to update item status:", error);
      setTasks(originalTasks);
      setNotification({
        type: "error",
        message: "Failed to update status. Please try again.",
        isVisible: true,
      });
    }
  };

  const handleUpdateItem = async (data: SubmitItemData) => {
    if (!editedBug) return;

    setIsSubmitting(true);
    try {
      const updatedItem = {
        ...editedBug,
        ...data,
      };
      await updateItem(editedBug._id, updatedItem);

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === editedBug._id ? updatedItem : task
        )
      );

      setNotification({
        type: "success",
        message: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} updated successfully!`,
        isVisible: true,
      });
    } catch (error) {
      console.error("Failed to update item:", error);
      setNotification({
        type: "error",
        message: "Failed to update item. Please try again.",
        isVisible: true,
      });
    } finally {
      setIsSubmitting(false);
      setIsSubmitPopupOpen(false);
      setEditedBug(undefined);
    }
  };
  
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>
      
      {/* Top Navigation Bar */}
      <div className="backdrop-blur-lg bg-white/5 border-b border-white/20 px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <ProjectSelector onSelect={handleProjectSelect} selectedProject={selectedProject} />
            </div>
          </div>
          
          {/* User Profile Dropdown Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <User className="w-6 h-6 text-white" />
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-54 bg-black/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 z-30 overflow-hidden">
                <div className="py-1">
                  {currentUser?.role=== "admin" && (
                    <div>
                  {/* Project Settings */}
                  <button
                    onClick={() => {
                      if (selectedProject?._id) {
                        router.push(`company/project/${selectedProject._id}`);
                        setIsUserMenuOpen(false);
                      } else {
                        setNotification({
                          type: "error",
                          message: "Please select a project to view its settings.",
                          isVisible: true,
                        });
                      }
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/20 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Project Settings</span>
                  </button>

                  {/* Company Settings */}
                  <button
                    onClick={() => {
                      router.push("/company");
                      setIsUserMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/20 transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Company Settings</span>
                  </button>

                  {/* Employee Settings */}
                  <button
                    onClick={() => {
                      // Navigate to employee settings
                      setIsUserMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/20 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Employee Settings</span>
                  </button>
                  </div>
                  )}
                  
                  {/* Profile */}
                  <button
                    onClick={() => {
                      router.push(`/profile?${selectedProject?._id ? `projectId=${selectedProject._id}` : ""}`);
                      setIsUserMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/20 transition-colors"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span>Profile</span>
                  </button>

                  <div className="my-1 border-t border-white/20"></div>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      router.push("/login");
                      setIsUserMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>
        
        {/* Tab Navigation */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-1 p-1 bg-white/5 rounded-2xl">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors duration-300 ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("kanban")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors duration-300 ${
                activeTab === "kanban"
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban Board</span>
            </button>
          </div>
          <button
            onClick={() => setIsSubmitPopupOpen(true)}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-6">
        {activeTab === "dashboard" ? (
          <Dashboard selectedProject={selectedProject} availableEmployees={availableEmployees} tasks={tasks} />
        ) : (
          <KanbanBoard
            selectedProject={selectedProject}
            availableEmployees={availableEmployees}
            tasks={tasks}
            onItemStatusChange={handleItemStatusUpdate}
            onBugClick={handleBugEdit}
          />
        )}
      </div>
      
      {/* Submit Item Popup */}
      <SubmitItemPopup
        isOpen={isSubmitPopupOpen}
        onClose={() => {
          setIsSubmitPopupOpen(false);
          setEditedBug(undefined);
        }}
        onSubmit={handleSubmitItem}
        onUpdate={handleUpdateItem}
        availableEmployees={availableEmployees}
        selectedProject={selectedProject}
        itemToEdit={editedBug}
      />
      
      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}