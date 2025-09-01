'use client';
import { ItemData } from '@/api/item.api';
import { Project } from '@/types/project.types';
import { ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';

interface KanbanBoardProps {
  selectedProject?: Project;
  availableEmployees: Employee[];
  tasks: ItemData[];
  onItemStatusChange: (itemId: string, newStatus: string) => void;
  onBugClick: (bug: ItemData) => void;
}

export default function KanbanBoard({
  selectedProject,
  availableEmployees,
  tasks,
  onItemStatusChange,
  onBugClick,
}: KanbanBoardProps) {
  const [bugs, setBugs] = useState<ItemData[]>(tasks);
  const [draggedBug, setDraggedBug] = useState<string | null>(null);

  useEffect(() => {
    setBugs(tasks);
  }, [tasks]);

  const stages = selectedProject?.kanbanStages || [];

  const getStageColor = (stageName: string) => {
    const name = stageName.toLowerCase();
    if (name.includes('todo')) return 'bg-purple-600/30 text-purple-200 border-purple-600';
    if (name.includes('progress')) return 'bg-cyan-600/30 text-cyan-200 border-cyan-600';
    if (name.includes('review')) return 'bg-pink-600/30 text-pink-200 border-pink-600';
    if (name.includes('done')) return 'bg-green-600/30 text-green-200 border-green-600';
    return 'bg-slate-600/30 text-slate-200 border-slate-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleDragStart = (e: React.DragEvent, bugId: string) => {
    setDraggedBug(bugId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedBug) {
      onItemStatusChange(draggedBug, stageId);
      setDraggedBug(null);
    }
  };

  const getBugsByStage = (stageId: string) => {
    const priorityOrder = { High: 3, Medium: 2, Low: 1, default: 0 };

    // Filter tasks for the current stage
    const filteredBugs = bugs.filter((bug) => bug.status === stageId);

    // Sort the filtered tasks in descending order of priority
    return filteredBugs.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      return bPriority - aPriority;
    });
  };

  const getAssigneeName = (assigneeId: string) => {
    const employee = availableEmployees.find((emp) => emp._id === assigneeId);
    return employee?.name || employee?.email || 'Unassigned';
  };

  return (
    <div className="space-y-6">
      {/* Kanban Board */}
      <div className="flex flex-col md:flex-row flex-nowrap md:justify-center overflow-x-auto gap-6 p-4">
        {stages.map((stage) => (
          <div
            key={stage._id}
            className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 flex-shrink-0 w-full md:w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage._id)}
          >
            {/* Column Header */}
            <div className={`p-4 rounded-t-3xl border-b border-white/20 ${getStageColor(stage.name)}`}>
              <h3 className="font-semibold">{stage.name}</h3>
              <p className="text-sm">{getBugsByStage(stage._id).length} tasks</p>
            </div>

            {/* Column Content: Fixed height and scrollable */}
            <div className="p-4 h-[700px] overflow-y-auto custom-scrollbar">
              {getBugsByStage(stage._id).length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <ListTodo className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">No tasks here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {getBugsByStage(stage._id).map((bug) => (
                    <div
                      key={bug._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, bug._id)}
                      onClick={() => onBugClick(bug)}
                      className="bg-white/5 rounded-2xl p-4 cursor-grab hover:shadow-lg transition-all duration-200 border border-white/20 active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white text-sm line-clamp-2">{bug.title}</h4>
                        <span className={`w-3 h-3 rounded-full ${getSeverityColor(bug.priority)}`}></span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{bug.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-200">{getAssigneeName(bug.assignedTo || '')}</span>
                        <div className="flex space-x-1">
                          <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-slate-400 border border-white/20">
                            {bug.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
