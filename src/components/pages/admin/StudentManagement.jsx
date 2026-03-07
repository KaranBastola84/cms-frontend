import React from "react";
import StudentManagementPanel from "./StudentManagementPanel";

const StudentManagement = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
          Student Management
        </h1>
        <p className="text-[#6B4423]">
          View, filter, and manage student records including enrolled students.
        </p>
      </div>

      <StudentManagementPanel />
    </div>
  );
};

export default StudentManagement;
