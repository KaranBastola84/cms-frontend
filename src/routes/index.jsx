import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/common/Layout";
import Login from "../components/auth/Login";
import InquiryForm from "../components/pages/InquiryForm";

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<InquiryForm />} />
        <Route path="/inquiry" element={<InquiryForm />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
