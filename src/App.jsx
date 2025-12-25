import React from "react";
import { Routes, Route } from "react-router-dom";

// Composants communs
import Header from "./components/Header";

// Sections de la nouvelle landing page
import HeroSearch from "./components/HeroSearch";
import FilterChips from "./components/FilterChips";
import ProfessorGrid from "./components/ProfessorGrid";

// Pages
import Tarifs from "./pages/Tarifs";
import Contact from "./pages/Contact";
import Inscription from "./pages/Inscription";
import AdminAddProfPage from "./pages/AdminAddProfPage";
import CRM from "./pages/CRM.jsx";
import Eleves from "./pages/Eleves.jsx";
import Eleve from "./pages/Eleve.jsx";


import CRMLayout from "./layouts/CRMLayout";


function App() {
  const [filters, setFilters] = React.useState({});

  return (
    <div className="font-[Poppins]">
      <Header />

      <Routes>
        {/* Landing page */}
        <Route
          path="/"
          element={
            <>
              <HeroSearch />
              <FilterChips onFilterChange={setFilters} />
              <ProfessorGrid filters={filters} />
            </>
          }
        />

        {/* Autres pages */}
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
