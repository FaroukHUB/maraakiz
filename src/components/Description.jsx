import React from "react";
import descriptionImg from "../assets/description.jpg"; // Placez l'image ici

const DescriptionSection = () => {
  return (
    <section className="w-full bg-white py-20 px-4 md:px-20">
      <div className="flex flex-col-reverse md:flex-row items-center gap-14">
        {/* Texte */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl font-semibold font-title text-[#3D4C66] mb-10 text-center">
            La plateforme qui connecte professeurs et élèves pour un apprentissage simplifié
          </h2>
          <p className="text-xl text-gray-700 font-paragraph leading-loose space-y-6">
            Aujourd'hui, le nombre d'instituts et de professeurs indépendants ne cesse d'augmenter,
            rendant la recherche du cours idéal parfois complexe pour les élèves. Trouver le bon professeur,
            comparer les offres et choisir une méthode adaptée peut rapidement devenir un véritable casse-tête.
          </p>
          <p className="text-xl text-gray-700 font-paragraph leading-loose mt-6">
            <strong>Maraakiz</strong> a été conçu pour simplifier cette recherche en mettant directement en relation
            les élèves avec des enseignants qualifiés et des instituts de qualité, dans un espace structuré et accessible.
          </p>
        </div>

        {/* Image */}
        <div className="md:w-1/2">
          <img 
            src={descriptionImg} 
            alt="Interface de recherche simplifiée Maraakiz" 
            className="w-full max-h-[500px] object-contain rounded-2xl shadow-md"
          />
        </div>
      </div>
    </section>
  );
};

export default DescriptionSection;
