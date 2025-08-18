"use client";
import React, { useState, useEffect } from "react";
import { X, Calendar, User, Bug, CheckSquare, Star, LoaderCircle, ChevronDown } from "lucide-react";
import { Project } from "@/types/project.types";
import { createGPT } from "@/api/gpt.api";
import { useUserAtom } from "@/store/atoms";
import { ItemData } from "@/api/item.api";

interface SubmitItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitItemData) => void;
  onUpdate: (data: SubmitItemData) => void;
  availableEmployees: Employee[];
  selectedProject: Project | undefined;
    itemToEdit?: ItemData;

}

export interface SubmitItemData {
  type: string;
  title: string;
  description: string;
  modules: string;
  priority: string;
  assignedTo: string;
  raisedBy: string;
  monitoredBy: string;
  dueDate: string;
}

const SubmitItemPopup: React.FC<SubmitItemPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  availableEmployees,
  selectedProject,
    itemToEdit,

}) => {
  const [formData, setFormData] = useState<SubmitItemData>({
    type: "",
    title: "",
    description: "",
    modules: "",
    priority: "",
    assignedTo: "",
    raisedBy: "",
    monitoredBy: "",
    dueDate: "",
  });
  const { currentUser } = useUserAtom();
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set defaults for raisedBy and monitoredBy when popup opens or employees change
  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setFormData({
          ...itemToEdit,
          dueDate: itemToEdit.dueDate ? new Date(itemToEdit.dueDate).toISOString().split('T')[0] : "",
        });
      } else {
        setFormData({
          type: "",
          title: "",
          description: "",
          modules: "",
          priority: "",
          assignedTo: "",
          raisedBy: currentUser?._id || "",
          monitoredBy: availableEmployees.find(emp => emp.role?.toLowerCase() === "admin")?._id || "",
          dueDate: "",
        });
      }
    }
  }, [isOpen, itemToEdit, availableEmployees, currentUser?._id]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableModules = selectedProject?.modules
    ? selectedProject.modules
    : [
        { _id: "frontend", name: "Frontend" },
        { _id: "backend", name: "Backend" },
        { _id: "database", name: "Database" },
        { _id: "api", name: "API" },
        { _id: "uiux", name: "UI/UX" },
        { _id: "testing", name: "Testing" },
        { _id: "devops", name: "DevOps" },
      ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTypeChange = (type: 'Bug' | 'Feature' | 'Task') => {
    setFormData(prev => ({
      ...prev,
      type,
    }));
  };

  const handleModuleChange = (moduleId: string) => {
    setFormData(prev => ({
      ...prev,
      modules: moduleId, // Store selected module _id
    }));
  };

  const handleAutoFill = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }
    
    setIsAutoFilling(true); // Start loading

    try {
      const payload = { 
        projectId: selectedProject?._id, 
        desc: `${formData.title},${formData.description}`, 
        type: "dev" 
      };

      const result = await createGPT(payload);
      
      if (result?.data) {
        setFormData(prev => ({
          ...prev,
          priority: result.data.priority,
          modules: result.data.moduleId,
          assignedTo: result.data.assignedDeveloper.employeeId, // Assign developer from GPT response
        }));
      }
    } catch (error) {
      console.error("Auto-fill failed:", error);
      // You could also set an error state here to show a message to the user
    } finally {
      setIsAutoFilling(false); // End loading
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.modules) newErrors.modules = "Module is required";
    if (!formData.priority) newErrors.priority = "Priority is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.assignedTo) newErrors.assignedTo = "Assignee is required";
    if (!formData.raisedBy) newErrors.raisedBy = "Raised by is required";
    if (!formData.monitoredBy) newErrors.monitoredBy = "Monitored by is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true); // Start loading
      
      try {
        if (itemToEdit) {
          await onUpdate(formData);
        } else {
          await onSubmit(formData);
        }// Use await if onSubmit is async
        
        // Reset form
        setFormData({
          type: "",
          title: "",
          description: "",
          modules: "",
          priority: "",
          assignedTo: "",
          raisedBy: "",
          monitoredBy: "",
          dueDate: "",
        });
        
        onClose();
      } catch (error) {
        console.error("Submission failed:", error);
        // Handle submission error
      } finally {
        setIsSubmitting(false); // End loading
      }
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug": return <Bug className="w-5 h-5" />;
      case "task": return <CheckSquare className="w-5 h-5" />;
      case "feature": return <Star className="w-5 h-5" />;
      default: return <Bug className="w-5 h-5" />;
    }
  };

  return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[100vh] border border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
            <div className="relative">
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-48 px-4 py-2 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white transition-all duration-300 appearance-none"
              >
                <option value="" className="bg-slate-900 text-slate-400">Select Type</option>
                <option value="Bug" className="bg-slate-900 text-white">Bug</option>
                <option value="Task" className="bg-slate-900 text-white">Task</option>
                <option value="Feature" className="bg-slate-900 text-white">Feature</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
             {errors.type && (<p className="text-red-400 text-sm mt-1">{errors.type}</p>)}
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-48 pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white transition-all duration-300"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
               {errors.dueDate && (<p className="text-red-400 text-sm mt-1">{errors.dueDate}</p>)}
            </div>
            <button
              onClick={() => {
                setFormData({
                  type: "",
                  title: "",
                  description: "",
                  modules: "",
                  priority: "",
                  assignedTo: "",
                  raisedBy: "",
                  monitoredBy: "",
                  dueDate: "",
                });
                onClose();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the issue"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-slate-400 transition-all duration-300"
              />
              {errors.title && (<p className="text-red-400 text-sm mt-1">{errors.title}</p>)}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Detailed description of the bug, steps to reproduce, expected vs actual behavior"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-vertical text-white placeholder-slate-400 transition-all duration-300"
              />
              {errors.description && (<p className="text-red-400 text-sm mt-1">{errors.description}</p>)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Module</label>
              <div className="relative">
                <select
                  name="modules"
                  value={formData.modules}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white transition-all duration-300 appearance-none"
                >
                  <option value="" className="bg-slate-900 text-slate-400">Select module</option>
                  {selectedProject?.modules?.map((module) => (
                    <option key={module._id} value={module._id} className="bg-slate-900 text-white">{module.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.modules && (<p className="text-red-400 text-sm mt-1">{errors.modules}</p>)}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
              <div className="relative">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white transition-all duration-300 appearance-none"
                >
                  <option value="" className="bg-slate-900 text-slate-400">Select Priority</option>
                  <option value="High" className="bg-slate-900 text-red-400">High</option>
                  <option value="Medium" className="bg-slate-900 text-yellow-400">Medium</option>
                  <option value="Low" className="bg-slate-900 text-green-400">Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
               {errors.priority && (<p className="text-red-400 text-sm mt-1">{errors.priority}</p>)}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Assigned To</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white transition-all duration-300 appearance-none"
                >
                  <option value="" className="bg-slate-900 text-slate-400">Select assignee</option>
                  {availableEmployees.map((user) => (
                    <option key={user._id} value={user._id} className="bg-slate-900 text-white">
                      {user.name || user.email} ({user.role})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.assignedTo && (<p className="text-red-400 text-sm mt-1">{errors.assignedTo}</p>)}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={!formData.title.trim() || !formData.description.trim() || isAutoFilling}
              className={`px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 shadow-lg flex items-center space-x-2 disabled:from-white/5 disabled:to-white/5 disabled:text-slate-400 disabled:border-white/20 disabled:cursor-not-allowed`}
              title={
                formData.title.trim() && formData.description.trim()
                  ? "Auto-fill based on title and description"
                  : "Please fill both title and description first"
              }
            >
              {isAutoFilling && <LoaderCircle className="h-5 w-5 animate-spin" />}
              <span>Auto Fill</span>
            </button>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Raised By</label>
                <div className="relative">
                  <select
                    name="raisedBy"
                    value={formData.raisedBy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white transition-all duration-300 appearance-none"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">Select user</option>
                    {availableEmployees.map((user) => (
                      <option key={user._id} value={user._id} className="bg-slate-900 text-white">
                        {user.name || user.email} ({user.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {errors.raisedBy && (<p className="text-red-400 text-sm mt-1">{errors.raisedBy}</p>)}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Monitored By</label>
                <div className="relative">
                  <select
                    name="monitoredBy"
                    value={formData.monitoredBy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white transition-all duration-300 appearance-none"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">Select user</option>
                    {availableEmployees.map((user) => (
                      <option key={user._id} value={user._id} className="bg-slate-900 text-white">
                        {user.name || user.email} ({user.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {errors.monitoredBy && (<p className="text-red-400 text-sm mt-1">{errors.monitoredBy}</p>)}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 shadow-lg flex items-center space-x-2 disabled:from-white/5 disabled:to-white/5 disabled:text-slate-400 disabled:border-white/20 disabled:cursor-not-allowed"
            >
              {isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}
              <span>
                {isSubmitting ? "Submitting..." : `Submit ${formData.type}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitItemPopup;
