import React from "react";
import { Star, MapPin, Video, Clock, Shield, CheckCircle } from "lucide-react";

const ProfessorCard = ({ professor }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
      {/* Image */}
      <div className="relative h-56 sm:h-64 overflow-hidden">
        <img
          src={professor.image}
          alt={professor.nom}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {professor.badges?.nouveauProf && (
            <span className="bg-[#437C8B] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
              Nouveau
            </span>
          )}
          {professor.badges?.premierCoursGratuit && (
            <span className="bg-[#A8835D] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
              1er cours gratuit
            </span>
          )}
        </div>
        {/* Badge vérifié */}
        {professor.verifie && (
          <div className="absolute top-3 right-3">
            <div className="bg-white rounded-full p-1.5 shadow-lg">
              <CheckCircle className="text-green-500" size={20} />
            </div>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 sm:p-5">
        {/* Nom et note */}
        <div className="mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 line-clamp-1">
            {professor.nom}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500 fill-yellow-500" size={16} />
              <span className="font-semibold text-gray-900">{professor.note}</span>
            </div>
            <span className="text-sm text-gray-500">({professor.nbAvis} avis)</span>
          </div>
        </div>

        {/* Infos rapides */}
        <div className="space-y-2 mb-4">
          {/* Matières */}
          <div className="flex items-start gap-2 text-sm">
            <div className="mt-0.5">📚</div>
            <div className="flex-1">
              <span className="text-gray-700 font-medium">
                {professor.matieres.join(", ")}
              </span>
            </div>
          </div>

          {/* Format */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Video size={16} className="text-gray-400 flex-shrink-0" />
            <span>{professor.format}</span>
          </div>

          {/* Langues */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-400">🗣️</span>
            <span>{professor.langues.join(", ")}</span>
          </div>

          {/* Niveau */}
          {professor.niveaux && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield size={16} className="text-gray-400 flex-shrink-0" />
              <span>{professor.niveaux.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-100 my-4"></div>

        {/* Prix et CTA */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">À partir de</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {professor.prix}€<span className="text-sm font-normal text-gray-500">/h</span>
            </div>
          </div>
          <button className="bg-[#437C8B] hover:bg-[#35626f] text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors shadow-md hover:shadow-lg">
            Voir profil
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCard;
