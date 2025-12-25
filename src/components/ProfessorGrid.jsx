import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfessorCard from "./ProfessorCard";

const API_URL = "http://127.0.0.1:8000";

const ProfessorGrid = ({ filters, onCountChange }) => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessors = async () => {
      setLoading(true);
      try {
        // Construire les query params à partir des filtres
        const params = new URLSearchParams();

        if (filters.type && filters.type.length > 0) {
          filters.type.forEach(t => params.append("type", t));
        }
        if (filters.matiere && filters.matiere.length > 0) {
          filters.matiere.forEach(m => params.append("matiere", m));
        }
        if (filters.format && filters.format.length > 0) {
          filters.format.forEach(f => params.append("format", f));
        }
        if (filters.niveau && filters.niveau.length > 0) {
          filters.niveau.forEach(n => params.append("niveau", n));
        }

        const response = await axios.get(`${API_URL}/api/public/merkez?${params.toString()}`);
        setProfessors(response.data);

        // Notifier le parent du nombre de résultats
        if (onCountChange) {
          onCountChange(response.data.length);
        }
      } catch (error) {
        console.error("Erreur chargement professeurs:", error);
        setProfessors([]);
        if (onCountChange) {
          onCountChange(0);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfessors();
  }, [filters, onCountChange]);

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
