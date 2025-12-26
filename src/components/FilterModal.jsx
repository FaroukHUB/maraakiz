import React, { useEffect } from "react";
import { X, User, BookOpen, Monitor, Trophy } from "lucide-react";

const FilterModal = ({ isOpen, onClose, filters, onFilterChange, resultCount }) => {

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        { value: "professeur", label: "Professeur", icon: "🎓" },
        { value: "institut", label: "Institut", icon: "🏫" }
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
    },
    {
      id: "matiere",
      title: "Matière",
      icon: BookOpen,
      options: [
        { value: "coran", label: "Coran", icon: "📖" },
        { value: "arabe", label: "Arabe", icon: "✍️" },
        { value: "tajwid", label: "Tajwid", icon: "📕" },
        { value: "sciences", label: "Sciences", icon: "📚" }
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
        { value: "seul", label: "Individuel", icon: "🎯" },
        { value: "binome", label: "Binôme", icon: "📋" },
        { value: "groupes", label: "Groupe", icon: "📚" }
      ]
    },
    {
      id: "langue",
      title: "Langue",
      icon: BookOpen,
      options: [
        { value: "francais", label: "Français", icon: "🇫🇷" },
        { value: "arabe", label: "Arabe", icon: "🇸🇦" },
        { value: "anglais", label: "Anglais", icon: "🇬🇧" }
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
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Filtres</h2>
              {resultCount !== undefined && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-[#437C8B]">{resultCount}</span> résultat{resultCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6 pb-24">
              {filterSections.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <div key={section.id}>
                    {/* Section Title */}
                    <div className="flex items-center gap-2 mb-3">
                      <SectionIcon size={22} className="text-[#437C8B]" />
                      <h3 className="font-bold text-gray-900 text-lg">{section.title}</h3>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {section.options.map((option) => {
                        const isActive = filters[section.id]?.includes(option.value);
                        return (
                          <button
                            key={option.value}
                            onClick={() => toggleFilter(section.id, option.value)}
                            className={`p-4 rounded-2xl transition-all duration-200 flex flex-col items-center gap-2 text-center min-h-[100px] ${
                              isActive
                                ? "bg-gradient-to-br from-[#437C8B] to-[#35626f] text-white shadow-lg scale-105"
                                : "bg-gray-50 active:bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-200"
                            }`}
                          >
                            {/* Icon */}
                            {option.icon && <span className="text-4xl">{option.icon}</span>}

                            {/* Label */}
                            <span className={`font-semibold text-sm leading-tight ${isActive ? 'text-white' : 'text-gray-900'}`}>
                              {option.label}
                            </span>

                            {/* Checkmark */}
                            {isActive && (
                              <div className="mt-1">
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

          {/* Footer - Sticky */}
          <div className="px-6 py-4 bg-white border-t border-gray-100 shadow-lg">
            <div className="flex gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="flex-1 py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Effacer tout
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#437C8B] to-[#35626f] shadow-lg hover:opacity-90 transition-opacity"
              >
                Voir {resultCount || 0} résultat{resultCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterModal;
