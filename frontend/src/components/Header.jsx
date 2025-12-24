import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { FaBars, FaTimes } from "react-icons/fa";
import ModalConnexion from "./ModalConnexion";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navLinks = [
    { label: "Accueil", path: "/" },
    { label: "Trouver un cours", path: "/cours" },
    { label: "Devenir enseignant", path: "/devenir-professeur" },
    { label: "Offres & Tarifs", path: "/tarifs" },
    { label: "À propos", path: "/a-propos" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50 font-[Trajan]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-5">
        {/* Logo */}
        <NavLink to="/">
          <img src={logo} alt="Logo Maraakiz" className="h-20 w-auto" />
        </NavLink>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-6 text-[#3D4C66] text-[20px] font-normal">
          {navLinks.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive
                  ? "border-b-2 border-[#A8835D] text-[#A8835D]"
                  : "hover:text-[#437C8B] transition"
              }
            >
              {label}
            </NavLink>
          ))}

          {/* Annonce Dropdown */}
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <span className="hover:text-[#437C8B] transition">Annonce ▾</span>
            {dropdownOpen && (
              <div className="absolute top-6 left-0 bg-white border border-gray-200 rounded shadow-md mt-2 z-50 min-w-[200px]">
                <NavLink
                  to="/annonce/emploi"
                  className="block px-4 py-2 text-sm text-[#3D4C66] hover:bg-gray-100"
                >
                  Emploi
                </NavLink>
                <NavLink
                  to="/annonce/classe"
                  className="block px-4 py-2 text-sm text-[#3D4C66] hover:bg-gray-100"
                >
                  Classe à compléter
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Connexion Desktop */}
        <button
          onClick={() => setShowLoginModal(true)}
          className="hidden md:inline-block bg-gradient-to-r from-[#3D4C66] to-[#437C8B] text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition"
        >
          Connexion
        </button>

        {/* Hamburger Mobile */}
        <button
          className="md:hidden text-[#3D4C66] text-2xl"
          onClick={() => setMenuOpen(true)}
        >
          <FaBars />
        </button>
      </div>

      {/* Mobile Menu Slide */}
      <div
        className={`fixed top-0 right-0 h-full w-4/5 bg-gradient-to-b from-[#3D4C66] to-[#437C8B] text-white z-50 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <img src={logo} alt="Logo Maraakiz" className="h-14 w-auto" />
          <button onClick={() => setMenuOpen(false)} className="text-white text-2xl">
            <FaTimes />
          </button>
        </div>

        <nav className="flex flex-col space-y-4 px-6 mt-4">
          {[...navLinks, { label: "Annonce - Emploi", path: "/annonce/emploi" }, { label: "Annonce - Classe", path: "/annonce/classe" }].map(
            ({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className="text-white text-base border-b border-white/20 pb-2"
              >
                {label}
              </NavLink>
            )
          )}
        </nav>

        <div className="px-6 mt-6">
          <h3 className="text-sm tracking-wide uppercase text-white mb-2">Espace membres</h3>
          <button
            onClick={() => {
              setShowLoginModal(true);
              setMenuOpen(false);
            }}
            className="inline-block w-full bg-white text-[#3D4C66] text-center font-semibold py-2 rounded-full"
          >
            Connexion
          </button>
        </div>
      </div>

      {/* Popup connexion */}
      <ModalConnexion isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
}
