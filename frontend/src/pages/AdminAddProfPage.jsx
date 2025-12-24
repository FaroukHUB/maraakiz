import React from "react";
import AdminAddProfForm from "../components/AdminAddProfForm";

const AdminAddProfPage = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-20">
      <h1 className="text-3xl font-bold text-[#3D4C66] mb-8 text-center">Ajouter un Professeur / Institut</h1>
      <AdminAddProfForm />
    </div>
  );
};

export default AdminAddProfPage;
