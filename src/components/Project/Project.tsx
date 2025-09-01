'use client';
import { getCompanyUserById } from '@/api/company.api';
import { createProject } from '@/api/project.api';
import { useUserAtom } from '@/store/atoms';
import { useCompanyAtom } from '@/store/companyAtom';
import { GripVertical, ListTodo, Loader2, Package, Plus, Settings, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
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
  const router = useRouter();
  // State to manage form input values
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    kanbanStages: ['Todo', 'In Progress', 'Testing', 'Done'], // Default Kanban stages
    modules: ['Frontend', 'Backend', 'Database', 'DevOps', 'Testing', 'UI/UX'], // Sample modules
    employees: [],
  });

  // State for available employees
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);

  // States for adding a NEW team member with modules
  const [selectedEmployeeToAdd, setSelectedEmployeeToAdd] = useState<Employee | null>(null);
  const [stagedModulesForNewEmployee, setStagedModulesForNewEmployee] = useState<AssignedModule[]>([]);
  const [currentModuleToStage, setCurrentModuleToStage] = useState<string>('');
  const [currentProficiencyToStage, setCurrentProficiencyToStage] = useState<number>(1);

  // States for adding new modules and Kanban stages (unrelated to employee module assignment)
  const [newModule, setNewModule] = useState('');
  const [newStage, setNewStage] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator
  const { companyUser } = useCompanyAtom();
  const { currentUser } = useUserAtom();

  const dragItem = useRef<null | number>(null);
  const dragOverItem = useRef<null | number>(null);
  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!currentUser?.details.companyId) return;
        // Simulate API call delay
        const employees = await getCompanyUserById(currentUser?.details.companyId || '');
        if (!employees) return;
        // Mock data for demonstration purposes
        setAvailableEmployees(employees);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };

    // Fetch employees when the component mounts
    fetchEmployees();
  }, [currentUser]); // Empty dependency array means this effect runs once on mount

  // Handles changes to input fields (project name, description, dates)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setNewModule(''); // Clear the input field
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
        assignedModules: emp.assignedModules.filter((mod) => mod.moduleId !== moduleToRemove),
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
      setNewStage(''); // Clear the input field
    }
  };

  // Removes a Kanban stage from the project
  const removeKanbanStage = (stageToRemove: string) => {
    setFormData({
      ...formData,
      kanbanStages: formData.kanbanStages.filter((stage) => stage !== stageToRemove),
    });
  };

  // Adds a module with proficiency to the temporary staging area for a new employee
  const addModuleToStaging = () => {
    if (currentModuleToStage && !stagedModulesForNewEmployee.some((m) => m.moduleId === currentModuleToStage)) {
      setStagedModulesForNewEmployee((prev) => [
        ...prev,
        { moduleId: currentModuleToStage, proficiency: currentProficiencyToStage },
      ]);
      setCurrentModuleToStage(''); // Reset module selection
      setCurrentProficiencyToStage(1); // Reset proficiency
    } else if (currentModuleToStage) {
      console.warn(`Module '${currentModuleToStage}' is already staged for this employee.`);
    }
  };

  // Removes a module from the temporary staging area for a new employee
  const removeStagedModule = (moduleId: string) => {
    setStagedModulesForNewEmployee((prev) => prev.filter((mod) => mod.moduleId !== moduleId));
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
      setCurrentModuleToStage('');
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
    return employee ? employee.name : 'Unknown Employee';
  };

  // Helper function to get employee role by ID
  const getEmployeeRole = (employeeId: string) => {
    const employee = availableEmployees.find((emp) => emp._id === employeeId);
    return employee ? employee.role : '';
  };

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading state to true

    try {
      // Prepare project data for submission
      const projectData = {
        ...formData,
        adminId: currentUser?._id,
        companyId: companyUser?._id, // Use mock company ID
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      };

      // Simulate API call for creating a project
      await createProject(projectData); // Simulate network delay
      console.log('Project data submitted:', projectData);

      // Simulate success and navigate (or show success message)
      setLoading(false);
      // In a real Next.js app, you would use router.push('/projects');
      router.push('/dashboard');
      // Optionally, reset form or show a success message
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        kanbanStages: ['Todo', 'In Progress', 'Review', 'Done'],
        modules: ['Frontend', 'Backend', 'Database', 'DevOps', 'Testing', 'UI/UX'],
        employees: [],
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      setLoading(false); // Reset loading state on error
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Main content container */}
      <div className="w-full max-w-7xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r text-white bg-clip-text">Create New Project</h1>
          <p className="text-slate-400">Configure your project settings for intelligent bug tracking</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          {/* Project Details Section */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r text-white bg-clip-text">Project Details</h2>
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
              <h2 className="text-2xl font-bold bg-gradient-to-r  bg-clip-text text-white">Modules</h2>
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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addModule())}
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
              <h2 className="text-2xl font-bold bg-gradient-to-r  bg-clip-text text-white">Kanban Stages</h2>
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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKanbanStage())}
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
              <h2 className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-white">Team Members</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/20">
                <p className="text-slate-400 text-sm font-medium">Add New Team Member:</p>
                <select
                  value={selectedEmployeeToAdd?._id || ''}
                  onChange={(e) => {
                    const employee = availableEmployees.find((emp) => emp._id === e.target.value);
                    setSelectedEmployeeToAdd(employee || null);
                    setStagedModulesForNewEmployee([]);
                    setCurrentModuleToStage('');
                    setCurrentProficiencyToStage(1);
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300 appearance-none"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    Select a team member to add
                  </option>
                  {availableEmployees
                    .filter((emp) => !formData.employees.some((assignedEmp) => assignedEmp.employeeId === emp._id))
                    .map((employee) => (
                      <option key={employee._id} value={employee._id} className="bg-slate-900 text-white">
                        {employee.name} - {employee.role}
                      </option>
                    ))}
                </select>

                {selectedEmployeeToAdd && (
                  <div className="space-y-4 pt-4 border-t border-white/20">
                    <p className="text-slate-400 text-sm font-medium">
                      Assign Modules to {selectedEmployeeToAdd.name}:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <select
                        value={currentModuleToStage}
                        onChange={(e) => setCurrentModuleToStage(e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all duration-300 appearance-none"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">
                          Select a module
                        </option>
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
                          <div className="text-sm text-slate-400">{getEmployeeRole(assignedEmp.employeeId)}</div>
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
                Creating Project...
              </span>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
