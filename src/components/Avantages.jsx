import React from "react";
import { CheckCircle } from "lucide-react";

const AvantagesSection = () => {
  return (
    <section className="bg-[#F9FAFB] py-20 px-4 md:px-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-semibold text-[#3D4C66] font-title mb-4">
          Avantages de Maraakiz
        </h2>
        <p className="text-gray-600 text-lg font-paragraph">
          Une plateforme pensée pour faciliter l'apprentissage et l'enseignement, gratuitement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Élèves */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-[#3D4C66] mb-6 text-center">
            Pour les élèves
          </h3>
          <ul className="space-y-4 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-[#437C8B]" />
              <span>Accès rapide aux meilleurs professeurs</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-[#437C8B]" />
              <span>Recherche simplifiée et intuitive</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-[#437C8B]" />
              <span>Accès à des offres exclusives</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-[#437C8B]" />
              <span>Messagerie privée avec les enseignants</span>
            </li>
          </ul>
          <div className="text-center">
            <button className="bg-[#A8835D] hover:bg-[#926c4b] text-white px-6 py-3 rounded-full font-semibold transition">
              S'inscrire en tant qu'élève
            </button>
          </div>
        </div>

        {/* Professeurs */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-[#3D4C66] mb-6 text-center">
            Pour les professeurs / instituts
          </h3>
          <ul className="space-y-4 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-[#437C8B]" />
              <span>Fiche publique visible sur le site</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-[#437C8B]" />
              <span>Référencement optimisé par Maraakiz</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-[#437C8B]" />
              <span>Réception de messages d'élèves inscrits</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-[#437C8B]" />
              <span>Accès à la publication d’annonces d’emploi ou de classe à compléter</span>
            </li>
          </ul>
          <div className="text-center">
            <button className="bg-[#437C8B] hover:bg-[#35626f] text-white px-6 py-3 rounded-full font-semibold transition">
              S'inscrire en tant que professeur
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvantagesSection;
