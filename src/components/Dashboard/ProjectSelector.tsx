"use client";
import { useState, useEffect } from "react";
import { getProjects } from "@/api/project.api";
import { useUserAtom } from "@/store/atoms";
import { Project } from "@/types/project.types";

interface ProjectSelectorProps {
  onSelect: (project: Project) => void;
  selectedProject?: Project;
}

export default function ProjectSelector({ onSelect, selectedProject }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { currentUser } = useUserAtom();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentUser?._id) return; // No user logged in → no projects

      try {
        const response = await getProjects(currentUser._id);
        const fetchedProjects = response?.data || [];
        setProjects(fetchedProjects);

        // Auto-select first project if none selected
        if (fetchedProjects.length > 0 && !selectedProject) {
          onSelect(fetchedProjects[0]);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      }
    };

    fetchProjects();
  }, [currentUser?._id]); // Refetch if user changes

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const project = projects.find(p => p._id === e.target.value);
    if (project) {
      onSelect(project);
    }
  };

  return (
    <select
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none"
      value={selectedProject?._id || ""}
      onChange={handleChange}
      disabled={!projects.length}
    >

      {projects.map(project => (
    <option
      key={project._id}
      value={project._id}
      className="bg-white text-gray-800 hover:bg-purple-100"
    >
      {project.name}
    </option>
      ))}
    </select>
  );
}
