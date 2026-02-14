import React from "react";
import { Routes, Route } from "react-router-dom";
import InquiryForm from "../components/pages/InquiryForm";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<InquiryForm />} />
      <Route path="/inquiry" element={<InquiryForm />} />
    </Routes>
  );
};

export default AppRoutes;
