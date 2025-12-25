import React, { useState } from "react";
import { Search } from "lucide-react";

const HeroSearch = () => {
  const [matiere, setMatiere] = useState("");
  const [format, setFormat] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Recherche:", { matiere, format });
  };

  return (
    <section className="relative bg-gradient-to-br from-[#3D4C66] via-[#437C8B] to-[#3D4C66] text-white overflow-hidden">
      {/* Pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24">
        {/* Citation islamique */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 leading-relaxed font-['Amiri'] max-w-4xl mx-auto">
            مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللّٰهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ
          </h1>
          <p className="text-sm sm:text-base md:text-lg italic text-white/90 mb-2">
            "Quiconque emprunte un chemin à la recherche de la science,
            <br className="hidden sm:block" /> Allah lui facilite par cela un chemin vers le Paradis"
          </p>
          <p className="text-xs sm:text-sm text-white/70">Rapporté par Muslim (2699)</p>
        </div>

        {/* Barre de recherche moderne */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              {/* Matière */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1 px-1">
                  Matière
                </label>
                <select
                  value={matiere}
                  onChange={(e) => setMatiere(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437C8B] focus:border-transparent text-gray-900 bg-gray-50"
                >
                  <option value="">Toutes les matières</option>
                  <option value="coran">Coran</option>
                  <option value="arabe">Arabe</option>
                  <option value="tajwid">Tajwid</option>
                  <option value="sciences">Sciences religieuses</option>
                </select>
              </div>

              {/* Format */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1 px-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#437C8B] focus:border-transparent text-gray-900 bg-gray-50"
                >
                  <option value="">Tous les formats</option>
                  <option value="en-ligne">En ligne</option>
                  <option value="presentiel">Présentiel</option>
                  <option value="differe">En différé</option>
                </select>
              </div>

              {/* Bouton recherche */}
              <div className="sm:self-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#A8835D] to-[#C09968] hover:from-[#916f4b] hover:to-[#A8835D] text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:mt-0 mt-0"
                >
                  <Search size={20} />
                  <span className="sm:inline">Rechercher</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Stats rapides */}
        <div className="mt-8 sm:mt-10 text-center">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 text-sm sm:text-base">
            <div>
              <div className="font-bold text-2xl sm:text-3xl">150+</div>
              <div className="text-white/80">Professeurs</div>
            </div>
            <div>
              <div className="font-bold text-2xl sm:text-3xl">4.8/5</div>
              <div className="text-white/80">Note moyenne</div>
            </div>
            <div>
              <div className="font-bold text-2xl sm:text-3xl">2500+</div>
              <div className="text-white/80">Cours donnés</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
