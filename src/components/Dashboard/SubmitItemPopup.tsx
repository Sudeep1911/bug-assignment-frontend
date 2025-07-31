"use client";
import React, { useState } from "react";
import { X, Calendar, User, Bug, CheckSquare, Star } from "lucide-react";

interface SubmitItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitItemData) => void;
}

export interface SubmitItemData {
  type: "bug" | "task" | "feature";
  title: string;
  description: string;
  modules: string[];
  priority: "high" | "medium" | "low";
  assignedTo: string;
  raisedBy: string;
  monitoredBy: string;
  dueDate: string;
}

const SubmitItemPopup: React.FC<SubmitItemPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<SubmitItemData>({
    type: "bug",
    title: "",
    description: "",
    modules: [],
    priority: "high",
    assignedTo: "",
    raisedBy: "",
    monitoredBy: "",
    dueDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data for dropdowns
  const availableUsers = [
    { id: "1", name: "John Doe", role: "Developer" },
    { id: "2", name: "Jane Smith", role: "Tester" },
    { id: "3", name: "Mike Johnson", role: "Developer" },
    { id: "4", name: "Sarah Wilson", role: "Manager" },
  ];

  const availableModules = [
    "Frontend", "Backend", "Database", "API", "UI/UX", "Testing", "DevOps"
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

  const handleTypeChange = (type: "bug" | "task" | "feature") => {
    setFormData(prev => ({
      ...prev,
      type,
    }));
  };

  const handleModuleChange = (module: string) => {
    setFormData(prev => ({
      ...prev,
      modules: [module], // Only allow one module selection
    }));
  };

  const handleAutoFill = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }
    
    // Auto-fill logic based on title and description content
    const title = formData.title.toLowerCase();
    const description = formData.description.toLowerCase();
    
    // Auto-detect priority based on keywords
    let suggestedPriority = "medium";
    if (title.includes("critical") || title.includes("urgent") || description.includes("critical") || description.includes("urgent")) {
      suggestedPriority = "high";
    } else if (title.includes("low") || description.includes("low")) {
      suggestedPriority = "low";
    }
    
    // Auto-detect module based on keywords
    let suggestedModule = "General";
    if (title.includes("ui") || title.includes("frontend") || description.includes("ui") || description.includes("frontend")) {
      suggestedModule = "Frontend";
    } else if (title.includes("api") || title.includes("backend") || description.includes("api") || description.includes("backend")) {
      suggestedModule = "Backend";
    } else if (title.includes("database") || title.includes("db") || description.includes("database") || description.includes("db")) {
      suggestedModule = "Database";
    } else if (title.includes("test") || description.includes("test")) {
      suggestedModule = "Testing";
    }
    
    setFormData(prev => ({
      ...prev,
      priority: suggestedPriority as "high" | "medium" | "low",
      modules: [suggestedModule],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.modules.length === 0) {
      newErrors.modules = "Module is required";
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = "Assignee is required";
    }

    if (!formData.raisedBy) {
      newErrors.raisedBy = "Raised by is required";
    }

    if (!formData.monitoredBy) {
      newErrors.monitoredBy = "Monitored by is required";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
             // Reset form
       setFormData({
         type: "bug",
         title: "",
         description: "",
         modules: [],
         priority: "high",
         assignedTo: "",
         raisedBy: "",
         monitoredBy: "",
         dueDate: "",
       });
      onClose();
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="w-5 h-5" />;
      case "task":
        return <CheckSquare className="w-5 h-5" />;
      case "feature":
        return <Star className="w-5 h-5" />;
      default:
        return <Bug className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bug":
        return "bg-red-500";
      case "task":
        return "bg-blue-500";
      case "feature":
        return "bg-green-500";
      default:
        return "bg-red-500";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                 {/* Header with Type and Due Date */}
         <div className="flex items-center justify-between p-6 border-b border-gray-200">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Type
             </label>
             <select
               name="type"
               value={formData.type}
               onChange={handleInputChange}
               className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
             >
               <option value="bug">Bug</option>
               <option value="task">Task</option>
               <option value="feature">Feature</option>
             </select>
           </div>
           <div className="flex items-center space-x-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Due Date
               </label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input
                   type="date"
                   name="dueDate"
                   value={formData.dueDate}
                   onChange={handleInputChange}
                   className="w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                   min={new Date().toISOString().split('T')[0]}
                 />
               </div>
             </div>
             <button
               onClick={onClose}
               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
             >
               <X className="w-6 h-6 text-gray-500" />
             </button>
           </div>
         </div>

                 {/* Form */}
         <form onSubmit={handleSubmit} className="p-6 space-y-6">

                     {/* Title and Description */}
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Title
               </label>
               <input
                 type="text"
                 name="title"
                 value={formData.title}
                 onChange={handleInputChange}
                 placeholder="Brief description of the issue"
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
               />
               {errors.title && (
                 <p className="text-red-500 text-sm mt-1">{errors.title}</p>
               )}
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Description
               </label>
               <textarea
                 name="description"
                 value={formData.description}
                 onChange={handleInputChange}
                 rows={4}
                 placeholder="Detailed description of the bug, steps to reproduce, expected vs actual behavior"
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-black"
               />
               {errors.description && (
                 <p className="text-red-500 text-sm mt-1">{errors.description}</p>
               )}
             </div>
           </div>

                     {/* Module, Priority, and Assigned To */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Module */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Module
               </label>
               <select
                 name="module"
                 value={formData.modules[0] || ""}
                 onChange={(e) => handleModuleChange(e.target.value)}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
               >
                 <option value="">Select module</option>
                 {availableModules.map((module) => (
                   <option key={module} value={module}>
                     {module}
                   </option>
                 ))}
               </select>
               {errors.modules && (
                 <p className="text-red-500 text-sm mt-1">{errors.modules}</p>
               )}
             </div>

             {/* Priority */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Priority
               </label>
               <select
                 name="priority"
                 value={formData.priority}
                 onChange={handleInputChange}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
               >
                 <option value="high">High</option>
                 <option value="medium">Medium</option>
                 <option value="low">Low</option>
               </select>
             </div>

             {/* Assigned To */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Assigned To
               </label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <select
                   name="assignedTo"
                   value={formData.assignedTo}
                   onChange={handleInputChange}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                 >
                   <option value="">Select assignee</option>
                   {availableUsers.map((user) => (
                     <option key={user.id} value={user.id}>
                       {user.name} ({user.role})
                     </option>
                   ))}
                 </select>
               </div>
               {errors.assignedTo && (
                 <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>
               )}
             </div>
           </div>

           {/* Auto Fill Button - Right side below Assigned To */}
           <div className="flex justify-end">
             <button
               type="button"
               onClick={handleAutoFill}
               disabled={!formData.title.trim() || !formData.description.trim()}
               className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                 formData.title.trim() && formData.description.trim()
                   ? "bg-green-600 text-white hover:bg-green-700"
                   : "bg-gray-300 text-gray-500 cursor-not-allowed"
               }`}
               title={
                 formData.title.trim() && formData.description.trim()
                   ? "Auto-fill based on title and description"
                   : "Please fill both title and description first"
               }
             >
               Auto Fill
             </button>
           </div>

                     {/* Raised By and Monitored By - Right side, one by one */}
           <div className="flex justify-end">
             <div className="w-64 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Raised By
                 </label>
                 <select
                   name="raisedBy"
                   value={formData.raisedBy}
                   onChange={handleInputChange}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                 >
                   <option value="">Select user</option>
                   {availableUsers.map((user) => (
                     <option key={user.id} value={user.id}>
                       {user.name} ({user.role})
                     </option>
                   ))}
                 </select>
                 {errors.raisedBy && (
                   <p className="text-red-500 text-sm mt-1">{errors.raisedBy}</p>
                 )}
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Monitored By
                 </label>
                 <select
                   name="monitoredBy"
                   value={formData.monitoredBy}
                   onChange={handleInputChange}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                 >
                   <option value="">Select user</option>
                   {availableUsers.map((user) => (
                     <option key={user.id} value={user.id}>
                       {user.name} ({user.role})
                     </option>
                   ))}
                 </select>
                 {errors.monitoredBy && (
                   <p className="text-red-500 text-sm mt-1">{errors.monitoredBy}</p>
                 )}
               </div>
             </div>
           </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Submit {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitItemPopup; 