'use client';
import { createUser } from '@/api/login.api';
import { useCompanyAtom } from '@/store/companyAtom';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Trash2, User, UserPlus } from 'lucide-react';

export default function People() {
  const [employees, setEmployees] = useState([{ email: '', role: '', name: '' }]);
  const { companyUser } = useCompanyAtom();
  const router = useRouter();
  const handleEmployeeChange = (index: number, key: 'email' | 'role' | 'name', value: string) => {
    const updated = [...employees];
    updated[index][key] = value;
    setEmployees(updated);
  };

  const handleAddEmployee = () => {
    setEmployees([...employees, { email: '', role: '', name: '' }]);
  };

  const handleRemoveEmployee = () => {
    if (employees.length > 1) {
      setEmployees(employees.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted Employees:', employees);
    const payload = { employees: employees, companyId: companyUser?._id };
    const result = await createUser(payload);
    if (result?.data) {
      router.push('/company/project');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Main content container */}
      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl mb-6 shadow-2xl">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Add Employees
          </h1>
          <p className="text-slate-400">Invite new members to your company and assign their roles.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          {employees.map((employee, index) => (
            <div
              key={index}
              className={`mb-6 p-6 border border-white/20 rounded-2xl bg-white/5 space-y-4 transition-all duration-300 ${
                index > 0 ? 'mt-4' : ''
              }`}
            >
              {/* Employee Name */}
              <div className="relative">
                <input
                  id={`name-${index}`}
                  name="name"
                  type="text"
                  placeholder="Employee Name"
                  value={employee.name}
                  onChange={(e) => handleEmployeeChange(index, 'name', e.target.value)}
                  className="w-full pl-4 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
                  required
                />
              </div>

              {/* Employee Email */}
              <div className="relative">
                <input
                  id={`email-${index}`}
                  name="email"
                  type="email"
                  placeholder="Employee Email"
                  value={employee.email}
                  onChange={(e) => handleEmployeeChange(index, 'email', e.target.value)}
                  className="w-full pl-4 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300"
                  required
                />
              </div>

              {/* Role */}
              <div className="relative">
                <select
                  id={`role-${index}`}
                  name="role"
                  value={employee.role}
                  onChange={(e) => handleEmployeeChange(index, 'role', e.target.value)}
                  className="w-full pl-4 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:bg-white/10 transition-all duration-300 appearance-none"
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
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-8">
            <button
              type="button"
              onClick={handleAddEmployee}
              className="flex-1 py-3 px-6 bg-white/5 border border-white/20 rounded-2xl text-slate-300 font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add Another</span>
            </button>
            {employees.length > 1 && (
              <button
                type="button"
                onClick={handleRemoveEmployee}
                className="flex-1 py-3 px-6 bg-red-600/20 border border-red-600 rounded-2xl text-red-400 font-medium hover:bg-red-600/30 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-5 h-5" />
                <span>Remove Last</span>
              </button>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="mt-6 w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-4 rounded-2xl font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <span>Submit Employees</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
