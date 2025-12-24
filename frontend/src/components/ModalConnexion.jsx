import React from "react";

export default function ModalConnexion({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-md p-6 relative font-[Poppins]">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">
          &times;
        </button>

        <h2 className="text-2xl font-bold text-[#3D4C66] mb-4">Connexion</h2>

        {/* Bouton Google */}
        <button className="w-full border border-gray-300 py-2 rounded flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-50 mb-4">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
          Continuer avec Google
        </button>

        {/* Separateur */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-3 text-gray-400 text-sm">Ou</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Formulaire */}
        <form>
          <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
          <div className="flex items-center border border-gray-300 rounded px-3 mb-4">
            <span className="text-gray-400 mr-2">@</span>
            <input type="email" className="w-full py-2 outline-none" placeholder="exemple@mail.com" />
          </div>

          <label className="block mb-2 text-sm font-medium text-gray-700">Mot de passe</label>
          <div className="flex items-center border border-gray-300 rounded px-3 mb-4">
            <span className="text-gray-400 mr-2">🔒</span>
            <input type="password" className="w-full py-2 outline-none" placeholder="••••••••" />
            <span className="text-gray-400 cursor-pointer ml-2">👁️</span>
          </div>

          <button type="submit" className="w-full bg-[#0070f3] hover:bg-[#0057c0] text-white py-2 rounded-full font-semibold">
            Se connecter
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Pas encore de compte ?{" "}
          <a href="/inscription" className="text-[#0070f3] hover:underline font-medium">
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  );
}
