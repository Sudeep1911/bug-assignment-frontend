"use client";
import { createUser } from "@/api/login.api";
import { useCompanyAtom } from "@/store/companyAtom";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function People() {
  const [employees, setEmployees] = useState([{ email: "", role: "" }]);
  const { companyUser } = useCompanyAtom();
  const router = useRouter();
  const handleEmployeeChange = (
    index: number,
    key: "email" | "role",
    value: string
  ) => {
    const updated = [...employees];
    updated[index][key] = value;
    setEmployees(updated);
  };

  const handleAddEmployee = () => {
    setEmployees([...employees, { email: "", role: "" }]);
  };

  const handleRemoveEmployee = () => {
    if (employees.length > 1) {
      setEmployees(employees.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted Employees:", employees);
    const payload = { employees: employees, companyId: companyUser?._id };
    const result = await createUser(payload);
    if (result?.data) {
      router.push("/company/project");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-glass border border-border rounded-xl p-8 w-full max-w-2xl shadow-xl backdrop-blur-sm"
      >
        <h2 className="text-3xl font-bold text-primary mb-6">Add Employees</h2>

        {employees.map((employee, index) => (
          <div
            key={index}
            className="mb-6 p-4 border border-border rounded-lg bg-neutral-800 space-y-4"
          >
            <div>
              <label className="block text-sm mb-1" htmlFor={`email-${index}`}>
                Employee Email
              </label>
              <input
                id={`email-${index}`}
                name="email"
                type="email"
                value={employee.email}
                onChange={(e) =>
                  handleEmployeeChange(index, "email", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor={`role-${index}`}>
                Role
              </label>
              <select
                id={`role-${index}`}
                name="role"
                value={employee.role}
                onChange={(e) =>
                  handleEmployeeChange(index, "role", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Role</option>
                <option value="developer">Developer</option>
                <option value="tester">Tester</option>
              </select>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={handleAddEmployee}
            className="py-2 px-4 bg-primary hover:bg-primary-dark rounded-lg text-white font-medium transition"
          >
            + Add Another
          </button>

          {employees.length > 1 && (
            <button
              type="button"
              onClick={handleRemoveEmployee}
              className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition"
            >
              - Remove Last
            </button>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary hover:bg-primary-dark rounded-lg text-white font-semibold transition"
        >
          Submit Employees
        </button>
      </form>
    </div>
  );
}
