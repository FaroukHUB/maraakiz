import React, { useState, useEffect } from "react";
import axios from "axios";
import { SlidersHorizontal } from "lucide-react";
import HeroSearch from "../components/HeroSearch";
import FilterSidebar from "../components/FilterSidebar";
import FilterModal from "../components/FilterModal";
import ProfessorGrid from "../components/ProfessorGrid";

const API_URL = "http://127.0.0.1:8000";

const HomePage = () => {
  const [filters, setFilters] = useState({
    type: [],
    matiere: [],
    format: [],
    niveau: []
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  // Compter les résultats en temps réel
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.type?.length > 0) filters.type.forEach(t => params.append("type", t));
        if (filters.matiere?.length > 0) filters.matiere.forEach(m => params.append("matiere", m));
        if (filters.format?.length > 0) filters.format.forEach(f => params.append("format", f));
        if (filters.niveau?.length > 0) filters.niveau.forEach(n => params.append("niveau", n));

        const response = await axios.get(`${API_URL}/api/public/merkez?${params.toString()}`);
        setResultCount(response.data.length);
      } catch (error) {
        console.error("Erreur comptage:", error);
        setResultCount(0);
      }
    };

    fetchCount();
  }, [filters]);

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSearch />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar Desktop uniquement */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              resultCount={resultCount}
            />
          </div>

          {/* Grille Professeurs */}
          <div className="lg:col-span-3">
            <ProfessorGrid filters={filters} />
          </div>
        </div>
      </div>

      {/* Bouton Filtres Mobile - Flottant */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-40 px-4">
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="w-full bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white font-bold py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <SlidersHorizontal size={24} />
          <span className="text-lg">
            Filtres
            {hasActiveFilters && (
              <span className="ml-2 bg-white text-[#437C8B] px-2 py-0.5 rounded-full text-sm font-bold">
                {Object.values(filters).flat().length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Modal Filtres Mobile */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        resultCount={resultCount}
      />
    </div>
  );
};

export default HomePage;
