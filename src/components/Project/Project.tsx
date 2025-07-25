"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAtom } from "@/store/atoms";
import { useCompanyAtom } from "@/store/companyAtom";
// import { createProject } from "@/api/project.api";
// import { getEmployees } from "@/api/employee.api";

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  kanbanStages: string[];
  modules: string[];
  employees: string[];
}

export default function CreateProject() {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    kanbanStages: ["Todo", "In Progress", "Review", "Done"],
    modules: [],
    employees: [],
  });

  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [newModule, setNewModule] = useState("");
  const [newStage, setNewStage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { currentUser } = useUserAtom();
  const { companyUser } = useCompanyAtom();

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Replace with your actual API call
        // const response = await getEmployees(companyUser?.companyId);
        // setAvailableEmployees(response?.data || []);

        // Mock data for demonstration
        setAvailableEmployees([
          {
            _id: "1",
            name: "John Doe",
            email: "john@company.com",
            role: "Frontend",
          },
          {
            _id: "2",
            name: "Jane Smith",
            email: "jane@company.com",
            role: "Backend",
          },
          {
            _id: "3",
            name: "Mike Johnson",
            email: "mike@company.com",
            role: "Database",
          },
          {
            _id: "4",
            name: "Sarah Wilson",
            email: "sarah@company.com",
            role: "Frontend",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };

    // if (companyUser?._id) {
    fetchEmployees();
    // }
  }, [companyUser?._id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addModule = () => {
    if (newModule.trim() && !formData.modules.includes(newModule.trim())) {
      setFormData({
        ...formData,
        modules: [...formData.modules, newModule.trim()],
      });
      setNewModule("");
    }
  };

  const removeModule = (moduleToRemove: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter((module) => module !== moduleToRemove),
    });
  };

  const addKanbanStage = () => {
    if (newStage.trim() && !formData.kanbanStages.includes(newStage.trim())) {
      setFormData({
        ...formData,
        kanbanStages: [...formData.kanbanStages, newStage.trim()],
      });
      setNewStage("");
    }
  };

  const removeKanbanStage = (stageToRemove: string) => {
    setFormData({
      ...formData,
      kanbanStages: formData.kanbanStages.filter(
        (stage) => stage !== stageToRemove
      ),
    });
  };

  const addEmployee = () => {
    if (
      selectedEmployee &&
      !formData.employees.includes(selectedEmployee._id)
    ) {
      setFormData({
        ...formData,
        employees: [...formData.employees, selectedEmployee._id],
      });
      setSelectedEmployee(null);
    }
  };

  const removeEmployee = (employeeId: string) => {
    setFormData({
      ...formData,
      employees: formData.employees.filter((id) => id !== employeeId),
    });
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
      const projectData = {
        ...formData,
        companyId: companyUser?._id,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      };

      // Replace with your actual API call
      // const response = await createProject(projectData);
      console.log("Project data:", projectData);

      // Mock success response
      setTimeout(() => {
        setLoading(false);
        router.push("/projects");
      }, 1000);
    } catch (error) {
      console.error("Failed to create project:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Create New Project
          </h1>
          <p className="text-neutral-400">
            Configure your project settings for intelligent bug tracking
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Project Details */}
          <div className="bg-glass border border-border rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 text-primary">⚙️</div>
              <h2 className="text-xl font-semibold">Project Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1" htmlFor="name">
                  Project Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project"
                  className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1" htmlFor="startDate">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" htmlFor="endDate">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="bg-glass border border-border rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 text-primary">📦</div>
              <h2 className="text-xl font-semibold">Modules</h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {formData.modules.map((module, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                >
                  {module}
                  <button
                    type="button"
                    onClick={() => removeModule(module)}
                    className="ml-1 text-blue-200 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                placeholder="Add module"
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-neutral-800 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addModule())
                }
              />
              <button
                type="button"
                onClick={addModule}
                className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white border border-border"
              >
                +
              </button>
            </div>
          </div>

          {/* Kanban Stages */}
          <div className="bg-glass border border-border rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 text-primary">📋</div>
              <h2 className="text-xl font-semibold">Kanban Stages</h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {formData.kanbanStages.map((stage, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm"
                >
                  {stage}
                  <button
                    type="button"
                    onClick={() => removeKanbanStage(stage)}
                    className="ml-1 text-green-200 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                placeholder="Add stage"
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-neutral-800 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addKanbanStage())
                }
              />
              <button
                type="button"
                onClick={addKanbanStage}
                className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white border border-border"
              >
                +
              </button>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-glass border border-border rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 text-primary">👥</div>
              <h2 className="text-xl font-semibold">Team Members</h2>
            </div>

            {/* Selected Employees */}
            <div className="mb-4 space-y-2">
              {formData.employees.map((employeeId) => (
                <div
                  key={employeeId}
                  className="flex items-center justify-between p-2 bg-neutral-800 rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {getEmployeeName(employeeId)}
                    </div>
                    <div className="text-sm text-neutral-400">
                      {getEmployeeRole(employeeId)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEmployee(employeeId)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Add Employee */}
            <div className="space-y-3">
              <select
                value={selectedEmployee?._id || ""}
                onChange={(e) => {
                  const employee = availableEmployees.find(
                    (emp) => emp._id === e.target.value
                  );
                  setSelectedEmployee(employee || null);
                }}
                className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a team member</option>
                {availableEmployees
                  .filter((emp) => !formData.employees.includes(emp._id))
                  .map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name} - {employee.role}
                    </option>
                  ))}
              </select>

              <button
                type="button"
                onClick={addEmployee}
                disabled={!selectedEmployee}
                className="w-full py-2 px-4 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-800 disabled:opacity-50 rounded-lg text-white font-semibold transition border border-border"
              >
                Add Developer
              </button>
            </div>
          </div>
        </form>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 rounded-lg text-white font-semibold transition min-w-48"
          >
            {loading ? "Creating Project..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
