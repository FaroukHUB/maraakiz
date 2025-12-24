import React from "react";

const Header = () => {
  return (
    <header className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between p-4 shadow-md bg-white z-50">
      {/* LOGO */}
      <div className="flex items-center gap-3 min-w-[140px]">
        <img
          src="/logo.png"
          alt="Logo Maraakiz"
          className="h-12 w-auto object-contain"
          style={{ minWidth: '70px', maxWidth: '110px' }}
        />
        <span className="text-xl font-bold text-[#AA8862] ml-2">Maraakiz</span>
      </div>
      {/* MENU */}
      <nav className="flex flex-row items-center space-x-8 text-gray-700 font-medium whitespace-nowrap">
        <a href="/" className="hover:text-yellow-600">Accueil</a>
        <a href="/a-propos" className="hover:text-yellow-600">À propos</a>
        <div className="relative group">
          <a
            href="#"
            className="hover:text-yellow-600 flex items-center gap-1"
            onClick={e => e.preventDefault()}
          >
            Annonces
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <div className="absolute left-1/2 -translate-x-1/2 mt-3 hidden group-hover:block bg-white shadow-lg rounded-lg w-48 z-20">
            <a href="/emploi" className="block px-4 py-3 hover:bg-yellow-50 border-b border-gray-100">Emploi</a>
            <a href="/classe-a-completer" className="block px-4 py-3 hover:bg-yellow-50">Classe à compléter</a>
          </div>
        </div>
        <a href="/contact" className="hover:text-yellow-600">Contact</a>
        <a href="/inscription" className="hover:text-yellow-600">Inscription</a>
      </nav>
    </header>
  );
};

export default Header;
