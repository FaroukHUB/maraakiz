import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import Tarifs from "./pages/Tarifs";
import Contact from "./pages/Contact";
import Inscription from "./pages/Inscription";
import AdminAddProfPage from "./pages/AdminAddProfPage";
import CRM from "./pages/CRM.jsx";
import Eleves from "./pages/Eleves.jsx";
import Eleve from "./pages/Eleve.jsx";
import ProfProfile from "./pages/ProfProfile.jsx";

import CRMLayout from "./layouts/CRMLayout";


function App() {
  return (
    <div className="font-[Poppins]">
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<HomePage />} />

        {/* Autres pages */}
        <Route path="/prof/:id" element={<ProfProfile />} />
        <Route path="/tarifs" element={<Tarifs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/admin-ajout-prof" element={<AdminAddProfPage />} />

        {/* CRM */}
        <Route path="/crm" element={<CRM />} />
        <Route path="/crm/eleves" element={<Eleves />} />
        <Route path="/crm/eleves/:id" element={<Eleve />} />
      </Routes>
    </div>
  );
}

export default App;
