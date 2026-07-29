import React from "react";
import StudentManagementPanel from "./StudentManagementPanel";

const StudentManagement = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Student Management
        </h1>
        <p className="text-[var(--text-primary)]">
          View, filter, and manage student records including enrolled students.
        </p>
      </div>

      <StudentManagementPanel />
    </div>
  );
};

export default StudentManagement;
