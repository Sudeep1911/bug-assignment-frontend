"use client";
import { useState } from "react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "on-hold";
}

interface ProjectSelectorProps {
  onSelect: (project: Project) => void;
  selectedProject?: string;
}

export default function ProjectSelector({ onSelect, selectedProject }: ProjectSelectorProps) {
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "E-commerce Platform",
      description: "Online shopping platform with payment integration",
      status: "active"
    },
    {
      id: "2", 
      name: "Mobile App",
      description: "Cross-platform mobile application",
      status: "active"
    },
    {
      id: "3",
      name: "Admin Dashboard",
      description: "Administrative interface for system management",
      status: "on-hold"
    }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const project = projects.find(p => p.id === e.target.value);
    if (project) {
      onSelect(project);
    }
  };

  return (
    <select
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none"
      value={projects.find(p => p.name === selectedProject)?.id || ""}
      onChange={handleChange}
    >
      <option value="" disabled>Select Project</option>
      {projects.map(project => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  );
} 