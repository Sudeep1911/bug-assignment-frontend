"use client";
import { getCompanyUser } from "@/api/company.api";
import { createProject } from "@/api/project.api";
import { useCompanyAtom } from "@/store/companyAtom";
import { useState, useEffect } from "react";

// Define interfaces for Employee, AssignedModule, and AssignedEmployee

interface AssignedModule {
  moduleId: string; // This will store the module name, as formData.modules stores names
  proficiency: number;
}

interface AssignedEmployee {
  employeeId: string;
  assignedModules: AssignedModule[];
}

interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  kanbanStages: string[];
  modules: string[];
  employees: AssignedEmployee[]; // Updated to store AssignedEmployee objects
}

export default function CreateProject() {
  // State to manage form input values
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    kanbanStages: ["Todo", "In Progress", "Review", "Done"], // Default Kanban stages
    modules: ["Frontend", "Backend", "Database", "DevOps", "Testing", "UI/UX"], // Sample modules
    employees: [],
  });

  // State for available employees
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);

  // States for adding a NEW team member with modules
  const [selectedEmployeeToAdd, setSelectedEmployeeToAdd] = useState<Employee | null>(null);
  const [stagedModulesForNewEmployee, setStagedModulesForNewEmployee] = useState<AssignedModule[]>([]);
  const [currentModuleToStage, setCurrentModuleToStage] = useState<string>("");
  const [currentProficiencyToStage, setCurrentProficiencyToStage] = useState<number>(1);

  // States for adding new modules and Kanban stages (unrelated to employee module assignment)
  const [newModule, setNewModule] = useState("");
  const [newStage, setNewStage] = useState("");
  const [loading, setLoading] = useState(false); // State for loading indicator
  const { companyUser } = useCompanyAtom();

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Simulate API call delay
        const employees=await getCompanyUser(companyUser?._id || "");
        if (!employees) return;
        // Mock data for demonstration purposes
        setAvailableEmployees(employees);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };

    // Fetch employees when the component mounts
    fetchEmployees();
  }, []); // Empty dependency array means this effect runs once on mount

  // Handles changes to input fields (project name, description, dates)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Adds a new module to the project's global module list
  const addModule = () => {
    if (newModule.trim() && !formData.modules.includes(newModule.trim())) {
      setFormData((prevData) => ({
        ...prevData,
        modules: [...prevData.modules, newModule.trim()],
      }));
      setNewModule(""); // Clear the input field
    }
  };

  // Removes a module from the project's global module list
  const removeModule = (moduleToRemove: string) => {
    setFormData((prevData) => ({
      ...prevData,
      modules: prevData.modules.filter((module) => module !== moduleToRemove),
      // Also remove this module from any assigned employees
      employees: prevData.employees.map((emp) => ({
        ...emp,
        assignedModules: emp.assignedModules.filter(
          (mod) => mod.moduleId !== moduleToRemove
        ),
      })),
    }));
  };

  // Adds a new Kanban stage to the project
  const addKanbanStage = () => {
    if (newStage.trim() && !formData.kanbanStages.includes(newStage.trim())) {
      setFormData({
        ...formData,
        kanbanStages: [...formData.kanbanStages, newStage.trim()],
      });
      setNewStage(""); // Clear the input field
    }
  };

  // Removes a Kanban stage from the project
  const removeKanbanStage = (stageToRemove: string) => {
    setFormData({
      ...formData,
      kanbanStages: formData.kanbanStages.filter(
        (stage) => stage !== stageToRemove
      ),
    });
  };

  // Adds a module with proficiency to the temporary staging area for a new employee
  const addModuleToStaging = () => {
    if (currentModuleToStage && !stagedModulesForNewEmployee.some(m => m.moduleId === currentModuleToStage)) {
      setStagedModulesForNewEmployee((prev) => [
        ...prev,
        { moduleId: currentModuleToStage, proficiency: currentProficiencyToStage },
      ]);
      setCurrentModuleToStage(""); // Reset module selection
      setCurrentProficiencyToStage(1); // Reset proficiency
    } else if (currentModuleToStage) {
      console.warn(`Module '${currentModuleToStage}' is already staged for this employee.`);
    }
  };

  // Removes a module from the temporary staging area for a new employee
  const removeStagedModule = (moduleId: string) => {
    setStagedModulesForNewEmployee((prev) =>
      prev.filter((mod) => mod.moduleId !== moduleId)
    );
  };

  // Adds the selected employee with their staged modules to the project's team
  const addTeamMemberWithModules = () => {
    if (selectedEmployeeToAdd && stagedModulesForNewEmployee.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        employees: [
          ...prevData.employees,
          { employeeId: selectedEmployeeToAdd._id, assignedModules: stagedModulesForNewEmployee },
        ],
      }));
      // Reset all states related to adding a new employee
      setSelectedEmployeeToAdd(null);
      setStagedModulesForNewEmployee([]);
      setCurrentModuleToStage("");
      setCurrentProficiencyToStage(1);
    }
  };

  // Removes an assigned employee from the project's team
  const removeEmployee = (employeeId: string) => {
    setFormData({
      ...formData,
      employees: formData.employees.filter((emp) => emp.employeeId !== employeeId),
    });
  };

  // Helper function to get employee name by ID
  const getEmployeeName = (employeeId: string) => {
    const employee = availableEmployees.find((emp) => emp._id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };

  // Helper function to get employee role by ID
  const getEmployeeRole = (employeeId: string) => {
    const employee = availableEmployees.find((emp) => emp._id === employeeId);
    return employee ? employee.role : "";
  };

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading state to true

    try {
      // Prepare project data for submission
      const projectData = {
        ...formData,
        companyId: companyUser?._id, // Use mock company ID
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      };

      // Simulate API call for creating a project
      await createProject(projectData); // Simulate network delay
      console.log("Project data submitted:", projectData);

      // Simulate success and navigate (or show success message)
      setLoading(false);
      // In a real Next.js app, you would use router.push('/projects');
      console.log("Project created successfully! Redirecting to /projects (simulated).");
      // Optionally, reset form or show a success message
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        kanbanStages: ["Todo", "In Progress", "Review", "Done"],
        modules: ["Frontend", "Backend", "Database", "DevOps", "Testing", "UI/UX"],
        employees: [],
      });
    } catch (error) {
      console.error("Failed to create project:", error);
      setLoading(false); // Reset loading state on error
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Create New Project
          </h1>
          <p className="text-neutral-400 text-lg">
            Configure your project settings for intelligent bug tracking
          </p>
        </div>

        {/* Project Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Project Details Section */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl text-blue-400">⚙️</span> {/* Icon */}
              <h2 className="text-2xl font-bold text-white">Project Details</h2>
            </div>

            <div className="space-y-5">
              {/* Project Name Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="name">
                  Project Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., E-commerce Platform Revamp"
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a brief overview of the project, its goals, and scope."
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition duration-200"
                />
              </div>

              {/* Start and End Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="startDate">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="endDate">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modules Section */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl text-purple-400">📦</span> {/* Icon */}
              <h2 className="text-2xl font-bold text-white">Modules</h2>
            </div>

            {/* Display existing modules */}
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.modules.map((module, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-600 text-white rounded-full text-sm font-medium shadow-md"
                >
                  {module}
                  <button
                    type="button"
                    onClick={() => removeModule(module)}
                    className="text-purple-200 hover:text-white transition duration-200 focus:outline-none"
                    aria-label={`Remove module ${module}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </span>
              ))}
            </div>

            {/* Add new module input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                placeholder="Add new module (e.g., User Authentication)"
                className="flex-1 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addModule())
                }
              />
              <button
                type="button"
                onClick={addModule}
                className="w-10 h-10 bg-purple-700 hover:bg-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold border border-purple-600 shadow-md transition duration-200"
                aria-label="Add module"
              >
                +
              </button>
            </div>
          </div>

          {/* Kanban Stages Section */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl text-green-400">📋</span> {/* Icon */}
              <h2 className="text-2xl font-bold text-white">Kanban Stages</h2>
            </div>

            {/* Display existing Kanban stages */}
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.kanbanStages.map((stage, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-full text-sm font-medium shadow-md"
                >
                  {stage}
                  <button
                    type="button"
                    onClick={() => removeKanbanStage(stage)}
                    className="text-green-200 hover:text-white transition duration-200 focus:outline-none"
                    aria-label={`Remove stage ${stage}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </span>
              ))}
            </div>

            {/* Add new Kanban stage input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                placeholder="Add new stage (e.g., Testing, Deployment)"
                className="flex-1 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addKanbanStage())
                }
              />
              <button
                type="button"
                onClick={addKanbanStage}
                className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-lg flex items-center justify-center text-white text-xl font-bold border border-green-600 shadow-md transition duration-200"
                aria-label="Add Kanban stage"
              >
                +
              </button>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl text-yellow-400">👥</span> {/* Icon */}
              <h2 className="text-2xl font-bold text-white">Team Members</h2>
            </div>

            {/* Add New Team Member Section */}
            <div className="space-y-3 mb-5 p-3 bg-neutral-900 rounded-lg border border-neutral-700">
              <p className="text-neutral-300 text-sm font-medium mb-2">Add New Team Member:</p>
              <select
                value={selectedEmployeeToAdd?._id || ""}
                onChange={(e) => {
                  const employee = availableEmployees.find(
                    (emp) => emp._id === e.target.value
                  );
                  setSelectedEmployeeToAdd(employee || null);
                  setStagedModulesForNewEmployee([]); // Reset staged modules when employee changes
                  setCurrentModuleToStage("");
                  setCurrentProficiencyToStage(1);
                }}
                className="w-full px-4 py-2.5 rounded-lg bg-neutral-800 border border-neutral-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-200"
              >
                <option value="">Select a team member to add</option>
                {availableEmployees
                  .filter((emp) => !formData.employees.some(assignedEmp => assignedEmp.employeeId === emp._id)) // Filter out already added employees
                  .map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name} - {employee.role}
                    </option>
                  ))}
              </select>

              {selectedEmployeeToAdd && (
                <div className="mt-4 p-3 bg-neutral-800 rounded-lg border border-neutral-700 space-y-3">
                  <p className="text-neutral-300 text-sm font-medium">Assign Modules to {selectedEmployeeToAdd.name}:</p>
                  
                  {/* Module and Proficiency Selection for new employee */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={currentModuleToStage}
                      onChange={(e) => setCurrentModuleToStage(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-600 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value="">Select a module</option>
                      {formData.modules
                        .filter(
                          (module) =>
                            !stagedModulesForNewEmployee.some((sm) => sm.moduleId === module)
                        )
                        .map((module) => (
                          <option key={module} value={module}>
                            {module}
                          </option>
                        ))}
                    </select>
                    <select
                      value={currentProficiencyToStage}
                      onChange={(e) => setCurrentProficiencyToStage(parseInt(e.target.value))}
                      className="w-28 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-600 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    >
                      {[1, 2, 3, 4, 5].map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={addModuleToStaging}
                    disabled={!currentModuleToStage}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition duration-200"
                  >
                    Add Module to Employee
                  </button>

                  {/* Staged Modules for New Employee Display */}
                  {stagedModulesForNewEmployee.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-700">
                      <p className="text-neutral-300 text-sm mb-2">Modules to be assigned:</p>
                      <div className="flex flex-wrap gap-2">
                        {stagedModulesForNewEmployee.map((mod, modIdx) => (
                          <span
                            key={modIdx}
                            className="inline-flex items-center px-3 py-1 bg-purple-700 text-white rounded-full text-xs font-medium"
                          >
                            {mod.moduleId} (Proficiency: {mod.proficiency})
                            <button
                              type="button"
                              onClick={() => removeStagedModule(mod.moduleId)}
                              className="ml-1 text-purple-200 hover:text-white"
                              aria-label={`Remove staged module ${mod.moduleId}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Combined Add Team Member button */}
              <button
                type="button"
                onClick={addTeamMemberWithModules}
                disabled={!selectedEmployeeToAdd || stagedModulesForNewEmployee.length === 0}
                className="w-full py-2.5 px-4 bg-yellow-600 hover:bg-yellow-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition duration-200 shadow-md"
              >
                Add Team Member
              </button>
            </div>

            {/* Current Team Members List */}
            <div className="mb-5 space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {formData.employees.length > 0 ? (
                formData.employees.map((assignedEmp) => (
                  <div
                    key={assignedEmp.employeeId}
                    className="p-3 bg-neutral-900 rounded-lg border border-neutral-700 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-lg text-white">
                          {getEmployeeName(assignedEmp.employeeId)}
                        </div>
                        <div className="text-sm text-neutral-400">
                          {getEmployeeRole(assignedEmp.employeeId)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEmployee(assignedEmp.employeeId)}
                        className="text-red-500 hover:text-red-400 transition duration-200 focus:outline-none"
                        aria-label={`Remove ${getEmployeeName(assignedEmp.employeeId)}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>

                    {/* Assigned Modules Display for existing members */}
                    {assignedEmp.assignedModules.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-neutral-700">
                        <p className="text-neutral-300 text-sm mb-1">Assigned Modules:</p>
                        <div className="flex flex-wrap gap-2">
                          {assignedEmp.assignedModules.map((mod, modIdx) => (
                            <span
                              key={modIdx}
                              className="inline-flex items-center px-3 py-1 bg-blue-700 text-white rounded-full text-xs font-medium"
                            >
                              {mod.moduleId} (Proficiency: {mod.proficiency})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-4">No team members added yet.</p>
              )}
            </div>
          </div>
        </form>

        {/* Submit Button */}
        <div className="flex justify-center mt-10">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading} // Disable button when loading
            className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-lg text-white font-bold text-lg transition duration-300 transform hover:scale-105 shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Project...
              </span>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #777;
        }
      `}</style>
    </div>
  );
}
