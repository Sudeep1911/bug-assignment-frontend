'use client';
import { useState, useEffect, useRef } from 'react';
import { getProjects } from '@/api/project.api';
import { useUserAtom } from '@/store/atoms';
import { Project } from '@/types/project.types';
import { ChevronDown } from 'lucide-react'; // Importing an icon for the dropdown arrow

interface ProjectSelectorProps {
  onSelect: (project: Project) => void;
  selectedProject?: Project;
}

export default function ProjectSelector({ onSelect, selectedProject }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useUserAtom();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentUser?._id) return;

      try {
        const response = await getProjects(currentUser._id);
        const fetchedProjects = response?.data || [];
        setProjects(fetchedProjects);

        if (fetchedProjects.length > 0 && !selectedProject) {
          onSelect(fetchedProjects[0]);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setProjects([]);
      }
    };

    fetchProjects();
  }, [currentUser?._id, onSelect, selectedProject]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (project: Project) => {
    onSelect(project);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-between items-center w-full min-w-[150px] rounded-2xl px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all duration-300
                     bg-white/5 border border-white/20 hover:border-purple-500 hover:bg-white/10"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedProject ? selectedProject.name : 'Select Project'}
          <ChevronDown
            className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${isOpen ? '-rotate-180' : 'rotate-0'}`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-left absolute left-0 mt-2 w-full rounded-2xl shadow-xl backdrop-blur-lg bg-black/80 border border-white/20 z-30 overflow-hidden"
          role="menu"
        >
          <div className="py-1">
            {projects.length > 0 ? (
              projects.map((project) => (
                <button
                  key={project._id}
                  onClick={() => handleSelect(project)}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-white/20 transition-colors"
                  role="menuitem"
                >
                  {project.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-slate-400">No projects found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
