"use client";
import { getCompanyUser } from "@/api/company.api";
import { getProject, updateProject } from "@/api/project.api";
import { useUserAtom } from "@/store/atoms";
import { useCompanyAtom } from "@/store/companyAtom";
import { GripVertical, ListTodo, Loader2, Package, Plus, Settings, Users } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

// Assuming these interfaces are defined elsewhere or in this file.
// I've added a dummy 'Modules' interface to resolve the TypeScript error.
interface Employee {
  _id: string;
  name: string;
  role: string;
}

interface AssignedModule {
  moduleId: string;
  proficiency: number;
}

interface AssignedEmployee {
  employeeId: string;
  assignedModules: AssignedModule[];
}

interface Modules {
  name: string;
}

interface ProjectDataFromAPI {
  _id: string;
  name: string;
  description: string;
  startDate: string; // The API might return this as a string
  endDate: string; // The API might return this as a string
  kanbanStages: string[];
  modules: Modules[]; // The API might return an array of objects
  employees: AssignedEmployee[];
}

interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  kanbanStages: string[];
  modules: string[];
  employees: AssignedEmployee[];
}

export default function EditProject() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    kanbanStages: [],
    modules: [],
    employees: [],
  });

  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeToAdd, setSelectedEmployeeToAdd] = useState<Employee | null>(null);
  const [stagedModulesForNewEmployee, setStagedModulesForNewEmployee] = useState<AssignedModule[]>([]);
  const [currentModuleToStage, setCurrentModuleToStage] = useState<string>("");
  const [currentProficiencyToStage, setCurrentProficiencyToStage] = useState<number>(1);
  const [newModule, setNewModule] = useState("");
  const [newStage, setNewStage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const { companyUser } = useCompanyAtom();
  const { currentUser } = useUserAtom();

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Fetch project and employee data on component mount or projectId change
  useEffect(() => {
    const fetchProjectAndEmployees = async () => {
      if (!projectId || !companyUser?._id) return;

      setIsProjectLoading(true);
      try {
        // Fetch employees
        const employees = await getCompanyUser(companyUser._id);
        if (employees) {
          setAvailableEmployees(employees);
        }

        // Fetch project details
        const project = await getProject(projectId);
        if (project) {
          // Correctly map the incoming project data to the formData state shape
          setFormData({
            name: project.name,
            description: project.description,
            startDate: new Date(project.startDate).toISOString().split('T')[0],
            endDate: new Date(project.endDate).toISOString().split('T')[0],
            kanbanStages: project.kanbanStages || [], // Ensure it's an array
            // Map the modules from the API to the string[] format expected by the form state
            modules: project.modules.map((m: Modules) => m.name) || [],
            employees: project.employees || [], // Ensure 'employees' property is present
          });
        }
      } catch (error) {
        console.error("Failed to fetch project or employees:", error);
      } finally {
        setIsProjectLoading(false);
      }
    };

    fetchProjectAndEmployees();
  }, [projectId, companyUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const addModule = () => {
    if (newModule.trim() && !formData.modules.includes(newModule.trim())) {
      setFormData((prevData) => ({
        ...prevData,
        modules: [...prevData.modules, newModule.trim()],
      }));
      setNewModule("");
    }
  };

  const removeModule = (moduleToRemove: string) => {
    setFormData((prevData) => ({
      ...prevData,
      modules: prevData.modules.filter((module) => module !== moduleToRemove),
      employees: prevData.employees.map((emp) => ({
        ...emp,
        assignedModules: emp.assignedModules.filter(
          (mod) => mod.moduleId !== moduleToRemove
        ),
      })),
    }));
  };

  const addKanbanStage = () => {
    if (newStage.trim() && !formData.kanbanStages.includes(newStage.trim())) {
      setFormData((prevData) => ({
        ...prevData,
        kanbanStages: [...prevData.kanbanStages, newStage.trim()],
      }));
      setNewStage("");
    }
  };

  const removeKanbanStage = (stageToRemove: string) => {
    setFormData((prevData) => ({
      ...prevData,
      kanbanStages: prevData.kanbanStages.filter(
        (stage) => stage !== stageToRemove
      ),
    }));
  };

  const addModuleToStaging = () => {
    if (currentModuleToStage && !stagedModulesForNewEmployee.some(m => m.moduleId === currentModuleToStage)) {
      setStagedModulesForNewEmployee((prev) => [
        ...prev,
        { moduleId: currentModuleToStage, proficiency: currentProficiencyToStage },
      ]);
      setCurrentModuleToStage("");
      setCurrentProficiencyToStage(1);
    } else if (currentModuleToStage) {
      console.warn(`Module '${currentModuleToStage}' is already staged for this employee.`);
    }
  };

  const removeStagedModule = (moduleId: string) => {
    setStagedModulesForNewEmployee((prev) =>
      prev.filter((mod) => mod.moduleId !== moduleId)
    );
  };

  const addTeamMemberWithModules = () => {
    if (selectedEmployeeToAdd && stagedModulesForNewEmployee.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        employees: [
          ...prevData.employees,
          { employeeId: selectedEmployeeToAdd._id, assignedModules: stagedModulesForNewEmployee },
        ],
      }));
      setSelectedEmployeeToAdd(null);
      setStagedModulesForNewEmployee([]);
      setCurrentModuleToStage("");
      setCurrentProficiencyToStage(1);
    }
  };

  const removeEmployee = (employeeId: string) => {
    setFormData((prevData) => ({
      ...prevData,
      employees: prevData.employees.filter((emp) => emp.employeeId !== employeeId),
    }));
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = availableEmployees.find((emp) => emp._id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };

  const getEmployeeRole = (employeeId: string) => {
    const employee = availableEmployees.find((emp) => emp._id === employeeId);
    return employee ? employee.role : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Map modules from string[] to the required Modules[] format for the API
      const updatedModules = formData.modules.map(moduleName => ({ name: moduleName }));
      
      const updatedProjectData = {
        name: formData.name,
        description: formData.description,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        kanbanStages: formData.kanbanStages,
        modules: updatedModules, // Use the mapped modules
        employees: formData.employees,
      };

      await updateProject(projectId, updatedProjectData);
      console.log("Project data updated:", updatedProjectData);

      setLoading(false);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to update project:", error);
      setLoading(false);
    }
  };

  const handleSort = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newList = [...formData.kanbanStages];
      const draggedItemContent = newList.splice(dragItem.current, 1)[0];
      newList.splice(dragOverItem.current, 0, draggedItemContent);
      setFormData((prev) => ({ ...prev, kanbanStages: newList }));
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (isProjectLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-white w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Main content container */}
      <div className="w-full max-w-7xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Edit Project
          </h1>
          <p className="text-slate-400">
            Modify your project settings and configurations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          {/* Project Details Section */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Project Details
              </h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="name">
                  Project Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., E-commerce Platform Revamp"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a brief overview of the project, its goals, and scope."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 resize-none transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="startDate">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2" htmlFor="endDate">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modules Section */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Modules
              </h2>
            </div>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {formData.modules.map((module, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/30 text-purple-200 rounded-full text-sm font-medium border border-purple-600"
                  >
                    {module}
                    <button
                      type="button"
                      onClick={() => removeModule(module)}
                      className="text-purple-200 hover:text-white transition duration-200 focus:outline-none"
                    >
                      <Plus className="w-4 h-4 transform rotate-45" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newModule}
                  onChange={(e) => setNewModule(e.target.value)}
                  placeholder="Add new module"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addModule())}
                />
                <button
                  type="button"
                  onClick={addModule}
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-cyan-600"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Kanban Stages Section */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-500 rounded-xl">
                <ListTodo className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Kanban Stages
              </h2>
            </div>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {formData.kanbanStages.map((stage, index) => (
                  <span
                    key={index}
                    draggable
                    onDragStart={() => (dragItem.current = index)}
                    onDragEnter={() => (dragOverItem.current = index)}
                    onDragEnd={handleSort}
                    onDragOver={(e) => e.preventDefault()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600/30 text-pink-200 rounded-full text-sm font-medium border border-pink-600 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-4 h-4" />
                    {stage}
                    <button
                      type="button"
                      onClick={() => removeKanbanStage(stage)}
                      className="text-pink-200 hover:text-white transition duration-200 focus:outline-none"
                    >
                      <Plus className="w-4 h-4 transform rotate-45" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                  placeholder="Add new stage"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKanbanStage())}
                />
                <button
                  type="button"
                  onClick={addKanbanStage}
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-cyan-600"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Team Members Section */}
          <div className="lg:col-span-2 xl:col-span-1 backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Team Members
              </h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/20">
                <p className="text-slate-400 text-sm font-medium">Add New Team Member:</p>
                <select
                  value={selectedEmployeeToAdd?._id || ""}
                  onChange={(e) => {
                    const employee = availableEmployees.find((emp) => emp._id === e.target.value);
                    setSelectedEmployeeToAdd(employee || null);
                    setStagedModulesForNewEmployee([]);
                    setCurrentModuleToStage("");
                    setCurrentProficiencyToStage(1);
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300 appearance-none"
                >
                  <option value="" className="bg-slate-900 text-slate-400">Select a team member to add</option>
                  {availableEmployees
                    .filter((emp) => !formData.employees.some(assignedEmp => assignedEmp.employeeId === emp._id))
                    .map((employee) => (
                      <option key={employee._id} value={employee._id} className="bg-slate-900 text-white">
                        {employee.name} - {employee.role}
                      </option>
                    ))}
                </select>

                {selectedEmployeeToAdd && (
                  <div className="space-y-4 pt-4 border-t border-white/20">
                    <p className="text-slate-400 text-sm font-medium">Assign Modules to {selectedEmployeeToAdd.name}:</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <select
                        value={currentModuleToStage}
                        onChange={(e) => setCurrentModuleToStage(e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300 appearance-none"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">Select a module</option>
                        {formData.modules
                          .filter((module) => !stagedModulesForNewEmployee.some((sm) => sm.moduleId === module))
                          .map((module) => (
                            <option key={module} value={module} className="bg-slate-900 text-white">
                              {module}
                            </option>
                          ))}
                      </select>
                      <select
                        value={currentProficiencyToStage}
                        onChange={(e) => setCurrentProficiencyToStage(parseInt(e.target.value))}
                        className="w-28 px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300 appearance-none"
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <option key={level} value={level} className="bg-slate-900 text-white">
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={addModuleToStaging}
                      disabled={!currentModuleToStage}
                      className="w-full py-3 px-4 bg-yellow-600/30 text-yellow-200 border border-yellow-600 rounded-2xl font-semibold transition duration-200 hover:bg-yellow-600/40 disabled:bg-white/5 disabled:text-slate-400 disabled:border-white/20 disabled:cursor-not-allowed"
                    >
                      Add Module to Employee
                    </button>
                    {stagedModulesForNewEmployee.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-slate-400 text-sm mb-2">Modules to be assigned:</p>
                        <div className="flex flex-wrap gap-2">
                          {stagedModulesForNewEmployee.map((mod, modIdx) => (
                            <span
                              key={modIdx}
                              className="inline-flex items-center px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-xs font-medium border border-purple-600"
                            >
                              {mod.moduleId} (Proficiency: {mod.proficiency})
                              <button
                                type="button"
                                onClick={() => removeStagedModule(mod.moduleId)}
                                className="ml-1 text-purple-200 hover:text-white transition-colors"
                              >
                                <Plus className="w-3 h-3 transform rotate-45" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={addTeamMemberWithModules}
                  disabled={!selectedEmployeeToAdd || stagedModulesForNewEmployee.length === 0}
                  className="w-full py-4 px-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl font-semibold transition-all duration-300 hover:from-purple-600 hover:to-cyan-600 shadow-lg disabled:from-white/5 disabled:to-white/5 disabled:text-slate-400 disabled:border-white/20 disabled:cursor-not-allowed"
                >
                  Add Team Member
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {formData.employees.length > 0 ? (
                  formData.employees.map((assignedEmp) => (
                    <div
                      key={assignedEmp.employeeId}
                      className="p-4 bg-white/5 rounded-2xl border border-white/20 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-lg text-white">
                            {getEmployeeName(assignedEmp.employeeId)}
                          </div>
                          <div className="text-sm text-slate-400">
                            {getEmployeeRole(assignedEmp.employeeId)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEmployee(assignedEmp.employeeId)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <Plus className="w-5 h-5 transform rotate-45" />
                        </button>
                      </div>
                      {assignedEmp.assignedModules.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <p className="text-slate-400 text-sm mb-1">Assigned Modules:</p>
                          <div className="flex flex-wrap gap-2">
                            {assignedEmp.assignedModules.map((mod, modIdx) => (
                              <span
                                key={modIdx}
                                className="inline-flex items-center px-3 py-1 bg-cyan-600/30 text-cyan-200 rounded-full text-xs font-medium border border-cyan-600"
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
                  <p className="text-slate-500 text-center py-4">No team members added yet.</p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Submit Button */}
        <div className="flex justify-center mt-10">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:from-purple-600 hover:to-cyan-600 transform hover:-translate-y-0.5 shadow-lg disabled:from-white/5 disabled:to-white/5 disabled:text-slate-400 disabled:border-white/20 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin w-6 h-6 mr-3" />
                Saving Changes...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}