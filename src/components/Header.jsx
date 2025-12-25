import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { FaBars, FaTimes } from "react-icons/fa";
import ModalConnexion from "./ModalConnexion";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Accueil", path: "/" },
    { label: "Devenir enseignant", path: "/inscription" }
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 font-[Poppins] transition-all duration-300 ${
      scrolled ? "bg-white shadow-md" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Logo */}
        <NavLink to="/">
          <img src={logo} alt="Logo Maraakiz" className="h-16 w-auto" />
        </NavLink>

        {/* Desktop Menu */}
        <nav className={`hidden md:flex items-center space-x-8 text-base font-medium ${
          scrolled ? "text-[#3D4C66]" : "text-white"
        }`}>
          {navLinks.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive
                  ? `border-b-2 ${scrolled ? "border-[#A8835D] text-[#A8835D]" : "border-white"}`
                  : "hover:opacity-80 transition"
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Connexion Desktop */}
        <button
          onClick={() => setShowLoginModal(true)}
          className={`hidden md:inline-block px-6 py-2.5 rounded-full text-sm font-semibold transition ${
            scrolled
              ? "bg-gradient-to-r from-[#3D4C66] to-[#437C8B] text-white"
              : "bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20"
          }`}
        >
          Connexion
        </button>

        {/* Hamburger Mobile */}
        <button
          className={`md:hidden text-2xl ${scrolled ? "text-[#3D4C66]" : "text-white"}`}
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
          {navLinks.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className="text-white text-base border-b border-white/20 pb-2"
            >
              {label}
            </NavLink>
          ))}
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
