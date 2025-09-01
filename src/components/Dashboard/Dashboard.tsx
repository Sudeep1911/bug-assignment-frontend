'use client';
import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Project } from '@/types/project.types';
import { ItemData } from '@/api/item.api';
import { BarChart3, Bug, Kanban, Loader2, Timer } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface DashboardProps {
  selectedProject?: Project;
  availableEmployees: Employee[];
  tasks: ItemData[];
}

export default function Dashboard({ selectedProject, availableEmployees, tasks }: DashboardProps) {
  const totalTasks = tasks.length;
  const inProgressStageId = selectedProject?.kanbanStages
    .find((stage) => stage.name === 'In Progress')
    ?._id?.toString();

  const doneStageId = selectedProject?.kanbanStages.find((stage) => stage.name === 'Done')?._id?.toString();

  // Then filter tasks by matching ObjectId strings
  const inProgressTasks = tasks.filter((task) => task.status?.toString() === inProgressStageId).length;

  const resolvedTasks = tasks.filter((task) => task.status?.toString() === doneStageId).length;

  const criticalIssues = tasks.filter((task) => task.priority === 'High').length;

  const resolutionRate = totalTasks > 0 ? Math.round((resolvedTasks / totalTasks) * 100) : 0;
  const categoryCounts = selectedProject?.modules.map((cat) => tasks.filter((bug) => bug.modules === cat._id).length);
  const projectModules = selectedProject?.modules.map((module) => module.name) || [];

  const severityLevels = ['High', 'Medium', 'Low'];
  const severityCounts = severityLevels.map((sev) => tasks.filter((bug) => bug.priority === sev).length);

  const barData = {
    labels: selectedProject?.modules.map((module) => module.name) || [],
    datasets: [
      {
        label: 'Tasks',
        data: categoryCounts,
        backgroundColor: [
          '#a855f7', // A shade of purple
          '#06b6d4', // A shade of cyan
          '#8b5cf6', // A slightly different purple
          '#22d3ee', // A slightly different cyan
        ],
      },
    ],
  };

  const doughnutData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: severityCounts,
        backgroundColor: [
          '#ef4444', // High priority (Red, matches your critical issues color)
          '#a855f7', // Medium priority (Purple)
          '#06b6d4', // Low priority (Cyan)
        ],
      },
    ],
  };

  const [projectStatus] = useState('active');

  // Filter availableEmployees by role
  const mockDevelopers = availableEmployees
    .filter((emp) => emp.role?.toLowerCase() === 'developer')
    .map((dev) => ({
      name: dev.name || dev.email,
      tasks: dev.tasks.length, // Replace with actual logic if available
      total: tasks.length, // Replace with actual logic if available
    }));

  const mockTesters = availableEmployees
    .filter((emp) => emp.role?.toLowerCase() === 'tester')
    .map((tester) => ({
      name: tester.name || tester.email,
      tasks: tester.tasks.length, // Replace with actual logic if available
      total: tasks.length, // Replace with actual logic if available
    }));

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {selectedProject?.name || 'Select Project'}
            </h1>
            <p className="text-slate-400 mt-1">{selectedProject?.description || 'Project Description'}</p>
          </div>
          <span className="px-3 py-1 bg-green-600/30 text-green-200 rounded-full text-sm font-medium border border-green-600">
            Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bugs */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Tasks</p>
              <p className="text-2xl font-bold text-white">{totalTasks}</p>
              <p className="text-sm text-slate-500">
                {totalTasks - resolvedTasks} open, {resolvedTasks} resolved
              </p>
            </div>
            <div className="text-blue-400">
              <BarChart3 className="w-8 h-8" />
            </div>
          </div>
        </div>
        {/* In Progress */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">In Progress</p>
              <p className="text-2xl font-bold text-white">{inProgressTasks}</p>
              <p className="text-sm text-slate-500">Being worked on</p>
            </div>
            <div className="text-yellow-400">
              <Timer className="w-8 h-8" />
            </div>
          </div>
        </div>
        {/* Critical Issues */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">High Priority Issues</p>
              <p className="text-2xl font-bold text-red-400">{criticalIssues}</p>
              <p className="text-sm text-slate-500">Require immediate attention</p>
            </div>
            <div className="text-red-400">
              <Bug className="w-8 h-8" />
            </div>
          </div>
        </div>
        {/* Resolution Rate */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Resolution Rate</p>
              <p className="text-2xl font-bold text-green-400">{resolutionRate}%</p>
              <p className="text-sm text-slate-500">Tasks resolved</p>
            </div>
            <div className="text-green-400">
              <Kanban className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bugs by Category */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Tasks by Category</h3>
          <div className="h-64 flex items-center justify-center">
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: { legend: { display: false, labels: { color: 'white' } } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { ticks: { color: 'white' } } },
              }}
            />
          </div>
        </div>
        {/* Severity Distribution */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Severity Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { color: 'white' } } },
              }}
            />
          </div>
        </div>
      </div>
      {/* Workload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Developer Workload */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Developer Workload</h3>
          <div className="space-y-3">
            {mockDevelopers.map((dev) => (
              <div
                key={dev.name}
                className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/20"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {dev.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-white">{dev.name}</span>
                </div>
                <span className="text-sm text-slate-400">
                  {dev.tasks}/{dev.total}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Tester Workload */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Tester Workload</h3>
          <div className="space-y-3">
            {mockTesters.map((tester) => (
              <div
                key={tester.name}
                className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/20"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {tester.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-white">{tester.name}</span>
                </div>
                <span className="text-sm text-slate-400">
                  {tester.tasks}/{tester.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
