import React from "react";
import { User, BookOpen, Monitor, Trophy, X } from "lucide-react";

const FilterSidebar = ({ filters, onFilterChange, resultCount }) => {

  const toggleFilter = (category, value) => {
    const current = filters[category] || [];
    const exists = current.includes(value);
    const updated = exists
      ? current.filter(v => v !== value)
      : [...current, value];

    onFilterChange({ ...filters, [category]: updated });
  };

  const clearAll = () => {
    onFilterChange({ type: [], matiere: [], format: [], type_classe: [], niveau: [], langue: [], public: [] });
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  const filterSections = [
    {
      id: "type",
      title: "Je cherche",
      icon: User,
      options: [
        { value: "professeur", label: "Un professeur", icon: "🎓", description: "Cours particuliers" },
        { value: "institut", label: "Un institut", icon: "🏫", description: "Centre de formation" }
      ]
    },
    {
      id: "matiere",
      title: "Matière",
      icon: BookOpen,
      options: [
        { value: "coran", label: "Coran", icon: "📖" },
        { value: "arabe", label: "Arabe", icon: "✍️" },
        { value: "tajwid", label: "Tajwid", icon: "📕" },
        { value: "sciences", label: "Sciences religieuses", icon: "📚" }
      ]
    },
    {
      id: "format",
      title: "Format",
      icon: Monitor,
      options: [
        { value: "en-ligne", label: "En ligne", icon: "💻" },
        { value: "presentiel", label: "Présentiel", icon: "🏢" },
        { value: "en-differe", label: "En différé", icon: "📹" }
      ]
    },
    {
      id: "type_classe",
      title: "Type de classe",
      icon: User,
      options: [
        { value: "seul", label: "Cours individuel", icon: "🎯" },
        { value: "binome", label: "En binôme", icon: "📋" },
        { value: "groupes", label: "En groupe", icon: "📚" }
      ]
    },
    {
      id: "niveau",
      title: "Niveau",
      icon: Trophy,
      options: [
        { value: "debutant", label: "Débutant", icon: "🌱" },
        { value: "intermediaire", label: "Intermédiaire", icon: "🌿" },
        { value: "avance", label: "Avancé", icon: "🌳" }
      ]
    },
    {
      id: "langue",
      title: "Langue d'enseignement",
      icon: BookOpen,
      options: [
        { value: "francais", label: "Français", icon: "🇫🇷" },
        { value: "arabe", label: "Arabe", icon: "🇸🇦" },
        { value: "anglais", label: "Anglais", icon: "🇬🇧" }
      ]
    },
    {
      id: "public",
      title: "Public",
      icon: User,
      options: [
        { value: "homme", label: "Homme", icon: "🔵" },
        { value: "femme", label: "Femme", icon: "🟣" },
        { value: "garcon", label: "Garçon", icon: "🔷" },
        { value: "fille", label: "Fille", icon: "💜" }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Filtres</h2>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <X size={16} />
              Effacer
            </button>
          )}
        </div>
        {resultCount !== undefined && (
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-[#437C8B]">{resultCount}</span> résultat{resultCount > 1 ? 's' : ''} trouvé{resultCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Filter Sections */}
      <div className="space-y-6">
        {filterSections.map((section) => {
          const SectionIcon = section.icon;
          return (
            <div key={section.id} className="border-b border-gray-100 pb-6 last:border-b-0">
              {/* Section Title */}
              <div className="flex items-center gap-2 mb-4">
                <SectionIcon size={20} className="text-[#437C8B]" />
                <h3 className="font-semibold text-gray-900 text-lg">{section.title}</h3>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {section.options.map((option) => {
                  const isActive = filters[section.id]?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleFilter(section.id, option.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                        isActive
                          ? "bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white shadow-lg scale-105"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {/* Icon */}
                      {option.icon && <span className="text-2xl flex-shrink-0">{option.icon}</span>}

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{option.label}</div>
                        {option.description && !isActive && (
                          <div className="text-xs text-gray-500 truncate">{option.description}</div>
                        )}
                      </div>

                      {/* Checkmark */}
                      {isActive && (
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilterSidebar;
