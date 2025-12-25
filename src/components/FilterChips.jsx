import React, { useState } from "react";
import { X } from "lucide-react";

const FilterChips = ({ onFilterChange }) => {
  const [activeFilters, setActiveFilters] = useState({
    matiere: [],
    format: [],
    niveau: []
  });

  const filterOptions = {
    matiere: [
      { value: "coran", label: "Coran" },
      { value: "arabe", label: "Arabe" },
      { value: "tajwid", label: "Tajwid" },
      { value: "sciences", label: "Sciences religieuses" }
    ],
    format: [
      { value: "en-ligne", label: "En ligne" },
      { value: "presentiel", label: "Présentiel" }
    ],
    niveau: [
      { value: "debutant", label: "Débutant" },
      { value: "intermediaire", label: "Intermédiaire" },
      { value: "avance", label: "Avancé" }
    ]
  };

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => {
      const current = prev[category] || [];
      const exists = current.includes(value);
      const updated = exists
        ? current.filter(v => v !== value)
        : [...current, value];

      const newFilters = { ...prev, [category]: updated };
      if (onFilterChange) onFilterChange(newFilters);
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({ matiere: [], format: [], niveau: [] });
    if (onFilterChange) onFilterChange({ matiere: [], format: [], niveau: [] });
  };

  const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tous les filtres en une seule ligne */}
          {Object.entries(filterOptions).map(([category, options]) =>
            options.map(option => {
              const isActive = activeFilters[category]?.includes(option.value);
              return (
                <button
                  key={`${category}-${option.value}`}
                  onClick={() => toggleFilter(category, option.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#437C8B] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })
          )}

          {/* Bouton effacer */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium px-3 py-2 ml-2"
            >
              <X size={16} />
              <span className="text-sm">Effacer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterChips;
