import React, { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

const FilterChips = ({ onFilterChange }) => {
  const [activeFilters, setActiveFilters] = useState({
    matiere: [],
    format: [],
    mode: [],
    niveau: [],
    public: []
  });
  const [showAllFilters, setShowAllFilters] = useState(false);

  const filterOptions = {
    matiere: [
      { value: "coran", label: "Coran" },
      { value: "arabe", label: "Arabe" },
      { value: "tajwid", label: "Tajwid" },
      { value: "sciences", label: "Sciences religieuses" }
    ],
    format: [
      { value: "individuel", label: "Individuel" },
      { value: "binome", label: "Binôme" },
      { value: "groupe", label: "Groupe" }
    ],
    mode: [
      { value: "en-ligne", label: "En ligne" },
      { value: "presentiel", label: "Présentiel" },
      { value: "differe", label: "En différé" }
    ],
    niveau: [
      { value: "debutant", label: "Débutant" },
      { value: "intermediaire", label: "Intermédiaire" },
      { value: "avance", label: "Avancé" }
    ],
    public: [
      { value: "enfants", label: "Enfants" },
      { value: "ados", label: "Adolescents" },
      { value: "hommes", label: "Hommes" },
      { value: "femmes", label: "Femmes" }
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
    setActiveFilters({ matiere: [], format: [], mode: [], niveau: [], public: [] });
    if (onFilterChange) onFilterChange({ matiere: [], format: [], mode: [], niveau: [], public: [] });
  };

  const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile: Bouton "Tous les filtres" */}
        <div className="sm:hidden">
          <button
            onClick={() => setShowAllFilters(!showAllFilters)}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-3 rounded-xl transition-colors"
          >
            <SlidersHorizontal size={18} />
            <span>Filtres</span>
            {hasActiveFilters && (
              <span className="bg-[#437C8B] text-white text-xs px-2 py-0.5 rounded-full">
                {Object.values(activeFilters).flat().length}
              </span>
            )}
          </button>

          {/* Filtres mobiles (collapsible) */}
          {showAllFilters && (
            <div className="mt-4 space-y-4">
              {Object.entries(filterOptions).map(([category, options]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {options.map(option => {
                      const isActive = activeFilters[category]?.includes(option.value);
                      return (
                        <button
                          key={option.value}
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
                    })}
                  </div>
                </div>
              ))}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-medium py-2"
                >
                  <X size={18} />
                  Effacer tous les filtres
                </button>
              )}
            </div>
          )}
        </div>

        {/* Desktop: Filtres horizontaux scrollables */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Bouton tous les filtres */}
            <button
              onClick={() => setShowAllFilters(!showAllFilters)}
              className="flex-shrink-0 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <SlidersHorizontal size={16} />
              <span>Filtres</span>
            </button>

            {/* Chips de filtres */}
            {Object.entries(filterOptions).map(([category, options]) =>
              options.map(option => {
                const isActive = activeFilters[category]?.includes(option.value);
                return (
                  <button
                    key={`${category}-${option.value}`}
                    onClick={() => toggleFilter(category, option.value)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                className="flex-shrink-0 flex items-center gap-1 text-red-600 hover:text-red-700 font-medium px-4 py-2"
              >
                <X size={16} />
                <span>Effacer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterChips;
