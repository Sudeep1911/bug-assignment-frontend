"use client";
import { useState } from "react";
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface DashboardProps {
  selectedProject: string;
}

const mockDevelopers = [
  { name: "sk", tasks: 2, total: 5 },
  { name: "khaleef", tasks: 1, total: 5 },
];
const mockTesters = [
  { name: "alex", tasks: 3, total: 5 },
  { name: "jane", tasks: 0, total: 5 },
];

const mockBugs = [
  { id: "1", title: "UI not responsive", description: "", severity: "high", assignee: "sk", stage: "todo", category: "UI" },
  { id: "2", title: "API error", description: "", severity: "critical", assignee: "khaleef", stage: "in-progress", category: "Backend" },
  { id: "3", title: "Performance lag", description: "", severity: "medium", assignee: "alex", stage: "review", category: "Performance" },
];

const bugCategories = ["UI", "Backend", "Performance", "Security"];
const categoryCounts = bugCategories.map(
  cat => mockBugs.filter(bug => bug.category === cat).length
);

const severityLevels = ["critical", "high", "medium", "low"];
const severityCounts = severityLevels.map(
  sev => mockBugs.filter(bug => bug.severity === sev).length
);

const barData = {
  labels: bugCategories,
  datasets: [
    {
      label: 'Bugs',
      data: categoryCounts,
      backgroundColor: [
        '#6366f1', '#06b6d4', '#f59e42', '#f87171'
      ],
    },
  ],
};

const doughnutData = {
  labels: ['Critical', 'High', 'Medium', 'Low'],
  datasets: [
    {
      data: severityCounts,
      backgroundColor: [
        '#ef4444', // Critical
        '#f59e42', // High
        '#fbbf24', // Medium
        '#22c55e', // Low
      ],
    },
  ],
};

export default function Dashboard({ selectedProject }: DashboardProps) {
  const [projectStatus] = useState("active");

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedProject || "Select Project"}</h1>
            <p className="text-gray-600 mt-1">new project</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {projectStatus}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bugs */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bugs</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500">2 open, 1 resolved</p>
            </div>
            <div className="text-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
        </div>
        {/* In Progress */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-sm text-gray-500">Being worked on</p>
            </div>
            <div className="text-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        {/* Critical Issues */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">1</p>
              <p className="text-sm text-gray-500">Require immediate attention</p>
            </div>
            <div className="text-red-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
          </div>
        </div>
        {/* Resolution Rate */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-green-600">33%</p>
              <p className="text-sm text-gray-500">Bugs resolved</p>
            </div>
            <div className="text-green-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bugs by Category */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bugs by Category</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <Bar data={barData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }} />
          </div>
        </div>
        {/* Severity Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Distribution</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <Doughnut data={doughnutData} options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } }
            }} />
          </div>
        </div>
      </div>
      {/* Workload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Developer Workload */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Developer Workload</h3>
          <div className="space-y-3">
            {mockDevelopers.map(dev => (
              <div key={dev.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {dev.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900">{dev.name}</span>
                </div>
                <span className="text-sm text-gray-600">{dev.tasks}/{dev.total}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Tester Workload */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tester Workload</h3>
          <div className="space-y-3">
            {mockTesters.map(tester => (
              <div key={tester.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {tester.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900">{tester.name}</span>
                </div>
                <span className="text-sm text-gray-600">{tester.tasks}/{tester.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 