import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-2xl w-full bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col items-center">
          <img src="/lovable-uploads/logo2.png" alt="MusicLinks Logo" className="w-24 h-24 rounded-full shadow-lg mb-4 mx-auto" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4 text-center">Qui sommes-nous ?</h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 text-center">
            MusicLinks est une plateforme collaborative qui connecte artistes, prestataires et partenaires du secteur musical. Notre mission : faciliter la création, la rencontre et la réussite de vos projets musicaux, dans un esprit d'entraide et d'innovation.
          </p>
          <div className="w-full flex flex-col items-center mb-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Founders</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              <div className="flex flex-col items-center">
                <img src="/placeholder.svg" alt="Nicolas Bohbot" className="w-20 h-20 rounded-full shadow mb-2" />
                <span className="font-semibold text-gray-800">Nicolas Bohbot</span>
                <span className="text-xs text-blue-700">Founder</span>
              </div>
              <div className="flex flex-col items-center">
                <img src="/placeholder.svg" alt="Mauly XX" className="w-20 h-20 rounded-full shadow mb-2" />
                <span className="font-semibold text-gray-800">Mauly XX</span>
                <span className="text-xs text-blue-700">Co-founder</span>
              </div>
              <div className="flex flex-col items-center">
                <img src="/placeholder.svg" alt="Raphael Levy" className="w-20 h-20 rounded-full shadow mb-2" />
                <span className="font-semibold text-gray-800">Raphael Levy</span>
                <span className="text-xs text-blue-700">Co-founder</span>
              </div>
            </div>
          </div>
          <Link to="/" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all">Retour à l'accueil</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
} 