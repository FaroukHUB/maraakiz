import React, { useState, useEffect } from "react";
import ProfessorCard from "./ProfessorCard";

// Données mockées pour la démo
const mockProfessors = [
  {
    id: 1,
    nom: "Cheikh Ahmed Al-Mansouri",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
    note: 4.9,
    nbAvis: 127,
    matieres: ["Coran", "Tajwid"],
    format: "En ligne",
    langues: ["Français", "Arabe"],
    niveaux: ["Tous niveaux"],
    prix: 20,
    verifie: true,
    badges: {
      nouveauProf: false,
      premierCoursGratuit: true
    }
  },
  {
    id: 2,
    nom: "Oum Khadija",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop",
    note: 5.0,
    nbAvis: 89,
    matieres: ["Arabe", "Sciences religieuses"],
    format: "En ligne & Présentiel",
    langues: ["Français", "Arabe"],
    niveaux: ["Débutant", "Intermédiaire"],
    prix: 18,
    verifie: true,
    badges: {
      nouveauProf: false,
      premierCoursGratuit: false
    }
  },
  {
    id: 3,
    nom: "Ustadh Bilal Ibrahim",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop",
    note: 4.8,
    nbAvis: 203,
    matieres: ["Coran", "Arabe", "Tajwid"],
    format: "En ligne",
    langues: ["Français", "Arabe", "Anglais"],
    niveaux: ["Tous niveaux"],
    prix: 25,
    verifie: true,
    badges: {
      nouveauProf: true,
      premierCoursGratuit: true
    }
  }
];

const ProfessorGrid = ({ filters }) => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation d'un chargement
    setLoading(true);
    setTimeout(() => {
      setProfessors(mockProfessors);
      setLoading(false);
    }, 500);
  }, [filters]);

  return (
    <div className="bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {professors.length} professeurs disponibles
          </h2>
          <p className="text-gray-600 mt-2">
            Trouvez le professeur idéal pour votre apprentissage
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-200 rounded mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Grille de professeurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professors.map(professor => (
                <ProfessorCard key={professor.id} professor={professor} />
              ))}
            </div>

            {/* Message si aucun résultat */}
            {professors.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun professeur trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfessorGrid;
