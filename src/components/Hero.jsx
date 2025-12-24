import React from "react";
import bibliotheque from "../assets/bibliotheque.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      className="relative h-[85vh] bg-cover bg-center bg-no-repeat text-center"
      style={{ backgroundImage: `url(${bibliotheque})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#3D4C66]/80 z-0"></div>

      {/* Contenu Hero */}
      <div className="z-10 relative px-6 md:px-12 max-w-5xl mx-auto text-white pt-[30vh]">
       <h1 className="text-3xl md:text-5xl font-semibold mb-8 leading-relaxed font-['Amiri']">
  مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللّٰهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ
</h1>

        <p className="text-lg md:text-xl italic text-white mb-4 font-['Poppins']">
          "Quiconque emprunte un chemin à la recherche de la science, Allah lui
          facilite par cela un chemin vers le Paradis"
        </p>

        <p className="text-sm md:text-base mb-8 text-white font-['Poppins']">
          Rapporté par Muslim (2699)
        </p>

        <Link
          to="/trouver-un-cours"
          className="bg-[#A8835D] hover:bg-[#916f4b] text-white font-semibold py-3 px-6 rounded-lg text-lg transition"
        >
          Trouver un Cours
        </Link>
      </div>
    </section>
  );
};

export default Hero;
