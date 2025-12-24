import React, { useState } from "react";
import axios from "axios";
import { ShieldCheck } from "lucide-react";

const AdminAddProfForm = () => {
  const [formData, setFormData] = useState({
    nom: "",
   
    email: "",
   
    image: null,
    enseignement: [],
    format: [],
    mode: [],
    langue: [],
    niveau: [],
    public: [],
    programme: "",
    cursus: "",
    salafCheck: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valeurs par défaut pour éviter les erreurs backend
    if (!formData.enseignement.length) formData.enseignement = ["arabe"];
    if (!formData.format.length) formData.format = ["individuel"];
    if (!formData.mode.length) formData.mode = ["en ligne"];
    if (!formData.langue.length) formData.langue = ["français"];
    if (!formData.niveau.length) formData.niveau = ["débutant"];
    if (!formData.public.length) formData.public = ["hommes"];

    const formPayload = new FormData();
    for (const key in formData) {
      if (key === "image" && formData.image) {
        formPayload.append("image", formData.image);
      } else if (Array.isArray(formData[key])) {
        formData[key].forEach((item) => formPayload.append(key, item));
      } else {
        formPayload.append(key, formData[key] ?? "");
      }
    }

    formPayload.set("salafCheck", formData.salafCheck ? "true" : "false");

    try {
      const response = await axios.post(
        "http://localhost:3001/dashboard/api/merkez",
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      alert("Professeur enregistré avec succès");
      console.log(response.data);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);

      if (error.response?.status === 422 && Array.isArray(error.response.data?.detail)) {
        const messages = error.response.data.detail
          .map((err) => `• ${err.loc.join(" > ")} : ${err.msg}`)
          .join("\n");
        alert(`Erreur de validation :\n${messages}`);
      } else if (error.response) {
        alert(`Erreur : ${error.response.data?.detail || "Erreur serveur."}`);
      } else if (error.request) {
        alert("Erreur réseau : le serveur ne répond pas.");
      } else {
        alert("Erreur inattendue : vérifie ta configuration.");
      }
    }
  };

  return (
    <section className="bg-white py-10 px-4 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#3D4C66]">
        Ajouter un professeur ou institut
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            className="flex-1 border p-3 rounded"
            required
          />
          
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

       
        <div className="">
          <label className="block mb-2 font-semibold text-[#3D4C66]">
            Photo de profil
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        <textarea
          name="programme"
          placeholder="Programme enseigné (ex: Nouraniya, Médine...)"
          value={formData.programme}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <textarea
          name="cursus"
          placeholder="Cursus (diplômes, ijaza...)"
          value={formData.cursus}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            name="salafCheck"
            checked={formData.salafCheck}
            onChange={handleChange}
            className="mt-1"
          />
          <label className="text-sm text-gray-700">
            Je suis le Coran et la Sunna selon la compréhension des pieux prédécesseurs
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-[#437C8B] text-white py-3 rounded font-semibold hover:bg-[#3D4C66]"
        >
          Enregistrer le professeur
        </button>
      </form>
    </section>
  );
};

export default AdminAddProfForm;
