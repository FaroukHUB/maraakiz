import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import MerkezDetail from "./pages/MerkezDetail";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardEleves from "./pages/DashboardEleves";
import DashboardEleveForm from "./pages/DashboardEleveForm";
import DashboardEleveDetail from "./pages/DashboardEleveDetail";
import DashboardProfil from "./pages/DashboardProfil";
import DashboardProfilComplet from "./pages/DashboardProfilComplet";
import DashboardCalendrier from "./pages/DashboardCalendrier";
import CalendrierApple from "./pages/CalendrierApple";
import DashboardMessages from "./pages/DashboardMessages";
import DashboardBibliotheque from "./pages/DashboardBibliotheque";
import Tarifs from "./pages/Tarifs";
import Contact from "./pages/Contact";
import Inscription from "./pages/Inscription";
import AdminAddProfPage from "./pages/AdminAddProfPage";
import CRM from "./pages/CRM.jsx";
import Eleves from "./pages/Eleves.jsx";
import Eleve from "./pages/Eleve.jsx";
import ProfProfile from "./pages/ProfProfile.jsx";
import PaiementsV2 from "./pages/PaiementsV2.jsx";
import Paiements from "./pages/Paiements.jsx";
import PaiementPublic from "./pages/PaiementPublic.jsx";
import MesCours from "./pages/MesCours.jsx";
import MesRapportsCours from "./pages/MesRapportsCours.jsx";

import CRMLayout from "./layouts/CRMLayout";


function App() {
  return (
    <div className="font-[Poppins]">
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<HomePage />} />

        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/eleves" element={<DashboardEleves />} />
        <Route path="/dashboard/eleves/nouveau" element={<DashboardEleveForm />} />
        <Route path="/dashboard/eleves/:id" element={<DashboardEleveDetail />} />
        <Route path="/dashboard/eleves/:id/modifier" element={<DashboardEleveForm />} />
        <Route path="/dashboard/profil" element={<DashboardProfilComplet />} />
        <Route path="/dashboard/calendrier" element={<CalendrierApple />} />
        <Route path="/dashboard/calendrier-old" element={<DashboardCalendrier />} />
        <Route path="/dashboard/mes-cours" element={<MesCours />} />
        <Route path="/dashboard/mes-rapports" element={<MesRapportsCours />} />
        <Route path="/dashboard/paiements" element={<PaiementsV2 />} />
        <Route path="/dashboard/bibliotheque" element={<DashboardBibliotheque />} />
        <Route path="/dashboard/messages" element={<DashboardMessages />} />
        <Route path="/dashboard/messages/:userId" element={<DashboardMessages />} />

        {/* Autres pages */}
        <Route path="/merkez/:id" element={<MerkezDetail />} />
        <Route path="/prof/:id" element={<ProfProfile />} />
        <Route path="/tarifs" element={<Tarifs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/admin-ajout-prof" element={<AdminAddProfPage />} />

        {/* Public payment page */}
        <Route path="/paiement/:token" element={<PaiementPublic />} />

        {/* CRM */}
        <Route path="/crm" element={<CRM />} />
        <Route path="/crm/eleves" element={<Eleves />} />
        <Route path="/crm/eleves/:id" element={<Eleve />} />
      </Routes>
    </div>
  );
}

export default App;
