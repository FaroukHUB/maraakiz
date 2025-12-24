import React from 'react';
import FormulaireMerkez from '../components/FormulaireMerkez';

const Inscription = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <h1 className="text-center text-3xl font-bold mb-6 text-[#3D4C66]">Inscription Professeur / Merkez</h1>
      <FormulaireMerkez />
    </div>
  );
};

export default Inscription;

