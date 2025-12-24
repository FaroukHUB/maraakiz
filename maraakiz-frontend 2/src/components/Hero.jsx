// ✅ src/components/Hero.jsx
import React from "react";

const Hero = () => {
  return (
    <section id="hero" className="flex flex-col md:flex-row items-center justify-between px-8 py-20 bg-gradient-to-r from-yellow-100 to-orange-100">
      <div className="md:w-1/2 mb-8 md:mb-0">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">Trouve ton professeur idéal en quelques clics.</h1>
        <p className="text-lg text-gray-700 mb-6">Maraakiz simplifie la recherche de professeurs spécialisés en arabe, Coran et sciences religieuses avec des outils modernes et rapides.</p>
        <a href="#filtre" className="inline-block px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition">Commencer</a>
      </div>
      <div className="md:w-1/2 flex justify-center">
       <img src="/hero-image.png" alt="Illustration Maraakiz" className="w-64 md:w-96 rounded-xl shadow-lg object-cover" />

      </div>
    </section>
  );
};

export default Hero;
