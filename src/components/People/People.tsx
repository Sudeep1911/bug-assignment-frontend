'use client';
import React, { useState, useEffect } from 'react';
import { ArrowRight, Trash2, UserPlus, ArrowLeft } from 'lucide-react';
import { useCompanyAtom } from '@/store/companyAtom';
import { useRouter } from 'next/navigation';
import { createUser } from '@/api/login.api'; // single API to handle create/update/delete
import { getCompanyUserById } from '@/api/company.api';

export default function People() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { companyUser } = useCompanyAtom();
  const router = useRouter();

  // Auto-close success toast
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // Fetch employees
  useEffect(() => {
    async function fetchEmployees() {
      if (!companyUser?._id) {
        setEmployees([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getCompanyUserById(companyUser._id);
        setEmployees(result || []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, [companyUser]);

  // Handle input changes
  const handleEmployeeChange = (index: number, key: 'email' | 'role' | 'name', value: string) => {
    const updated = [...employees];
    updated[index] = { ...updated[index], [key]: value };
    setEmployees(updated);
  };

  const handleAddEmployee = () => {
    setEmployees([...employees, { name: '', email: '', role: '' } as Employee]);
  };

  const handleRemoveEmployee = (indexToRemove: number) => {
    setEmployees((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Save employees
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyUser?._id) {
      console.error('Company ID is not available.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        companyId: companyUser._id,
        employees: employees,
      };

      await createUser(payload); // backend handles create/update/delete
      setShowSuccessMessage(true);
      console.log('Employees successfully saved!');
    } catch (error) {
      console.error('Failed to save employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // If loading and no employees yet → show loader
  if (loading && employees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <svg
          className="animate-spin h-8 w-8 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 
               0 12h4zm2 5.291A7.962 7.962 0 
               014 12H0c0 3.042 1.135 5.824 
               3 7.938l3-2.647z"
          />
        </svg>
        <span className="ml-4">Loading employee data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Back to Company Overview button (shown if employees exist while loading or after) */}
      {employees.length > 0 && (
        <div className="w-full max-w-xl mb-4">
          <button
            onClick={() => router.push('/dashboard')} // or /company/overview if that’s your route
            className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors gap-3"
            aria-label="Back to Company Overview"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" /> Back to Dashboard
          </button>
        </div>
      )}

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl mb-6 shadow-2xl">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {employees.length > 0 ? 'Edit & Add Employees' : 'Add Employees'}
          </h1>
          <p className="text-slate-400">Manage existing members or invite new ones.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          {employees.map((employee, index) => (
            <div
              key={employee._id || `new-emp-${index}`}
              className="mb-6 p-6 border border-white/20 rounded-2xl bg-white/5 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">{`Employee ${index + 1}`}</h3>
                {employees.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEmployee(index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Employee Name"
                value={employee.name}
                onChange={(e) => handleEmployeeChange(index, 'name', e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white"
                required
              />

              <input
                type="email"
                placeholder="Employee Email"
                value={employee.email}
                onChange={(e) => handleEmployeeChange(index, 'email', e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white"
                required
              />

              <select
                value={employee.role}
                onChange={(e) => handleEmployeeChange(index, 'role', e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white"
                required
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">
                  Select Role
                </option>
                <option value="developer" className="bg-slate-900 text-white">
                  Developer
                </option>
                <option value="tester" className="bg-slate-900 text-white">
                  Tester
                </option>
              </select>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddEmployee}
            className="w-full mt-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-slate-300 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add New Member</span>
          </button>

          <button
            type="submit"
            className="mt-6 w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Toast */}
      {showSuccessMessage && (
        <div className="z-50 fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in-up">
          <span>✅ Employee data has been saved successfully.</span>
        </div>
      )}
    </div>
  );
}
