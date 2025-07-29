"use client";
import { useState } from "react";

interface KanbanBoardProps {
  selectedProject: string;
}

interface Bug {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  assignee: string;
  stage: "todo" | "in-progress" | "review" | "done";
}

const mockBugs: Bug[] = [
  {
    id: "1",
    title: "UI not responsive on mobile",
    description: "The main dashboard does not scale properly on mobile devices.",
    severity: "high",
    assignee: "sk",
    stage: "todo",
  },
  {
    id: "2",
    title: "API returns 500 error",
    description: "Fetching project data sometimes fails with a 500 error.",
    severity: "critical",
    assignee: "khaleef",
    stage: "in-progress",
  },
  {
    id: "3",
    title: "Performance lag on Kanban drag",
    description: "Dragging cards in the Kanban board is slow.",
    severity: "medium",
    assignee: "alex",
    stage: "review",
  },
  {
    id: "4",
    title: "Security: JWT not validated",
    description: "JWT tokens are not being validated on the backend.",
    severity: "critical",
    assignee: "jane",
    stage: "done",
  },
];

export default function KanbanBoard({ selectedProject }: KanbanBoardProps) {
  const [bugs, setBugs] = useState<Bug[]>(mockBugs);
  const [draggedBug, setDraggedBug] = useState<string | null>(null);

  const stages = [
    { id: "todo", title: "Todo", color: "bg-gray-100" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-100" },
    { id: "review", title: "Review", color: "bg-yellow-100" },
    { id: "done", title: "Done", color: "bg-green-100" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDragStart = (e: React.DragEvent, bugId: string) => {
    setDraggedBug(bugId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (draggedBug) {
      setBugs(prevBugs =>
        prevBugs.map(bug =>
          bug.id === draggedBug ? { ...bug, stage: stage as any } : bug
        )
      );
      setDraggedBug(null);
    }
  };

  const getBugsByStage = (stage: string) => {
    return bugs.filter(bug => bug.stage === stage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kanban Board</h1>
        <p className="text-gray-600">Project: {selectedProject || "Select Project"}</p>
      </div>
      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="bg-white rounded-lg shadow-sm"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Column Header */}
            <div className={`p-4 ${stage.color} rounded-t-lg`}>
              <h3 className="font-semibold text-gray-900">{stage.title}</h3>
              <p className="text-sm text-gray-600">
                {getBugsByStage(stage.id).length} bugs
              </p>
            </div>
            {/* Column Content */}
            <div className="p-4 min-h-[400px]">
              {getBugsByStage(stage.id).length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p className="text-sm">No bugs</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {getBugsByStage(stage.id).map((bug) => (
                    <div
                      key={bug.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, bug.id)}
                      className="bg-gray-50 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {bug.title}
                        </h4>
                        <span className={`w-3 h-3 rounded-full ${getSeverityColor(bug.severity)}`}></span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {bug.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{bug.assignee}</span>
                        <div className="flex space-x-1">
                          <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-700">
                            {bug.severity}
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
      {/* Add Bug Button */}
      <div className="flex justify-center">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Add New Bug
        </button>
      </div>
    </div>
  );
} 