import React from "react";
import { CheckCircle, Sparkles } from "lucide-react";

const MaraakizPlusSection = () => {
  return (
    <section className="bg-[#3D4C66] text-white py-20 px-6 md:px-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-title mb-4">
          Passez à Maraakiz Plus
        </h2>
        <p className="text-lg md:text-xl font-paragraph max-w-3xl mx-auto">
          Pour seulement <span className="text-[#FFD100] font-semibold">6€ par mois</span>, débloquez des fonctionnalités professionnelles : gestion du planning, suivi pédagogique, messagerie complète, statistiques avancées, et bien plus encore.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div className="space-y-4 text-left max-w-xl mx-auto">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-[#FFD100]" />
            <span>Vue calendrier avec planning personnalisé</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-[#FFD100]" />
            <span>Suivi individuel des élèves (progression, difficultés, remarques)</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-[#FFD100]" />
            <span>Messagerie enrichie avec vos élèves et l'administration</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-[#FFD100]" />
            <span>Statistiques de profil (visites, messages, annonces)</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-[#FFD100]" />
            <span>Ajout manuel de vos élèves externes à Maraakiz</span>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <Sparkles className="text-[#FFD100] w-24 h-24 animate-bounce" />
        </div>
      </div>

      <p className="mt-12 text-center text-sm md:text-base max-w-2xl mx-auto font-paragraph">
        Notre équipe étant composée de professeurs expérimentés, nous développons Maraakiz Plus selon leurs retours directs. D’autres outils pédagogiques exclusifs seront intégrés au fil du temps, sans surcoût.
      </p>

      <div className="mt-10 text-center">
        <button className="bg-[#A8835D] hover:bg-[#926c4b] text-white px-8 py-3 rounded-full font-semibold transition">
          Découvrir Maraakiz Plus
        </button>
      </div>
    </section>
  );
};

export default MaraakizPlusSection;
