"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LogoutButton from '@/components/LogoutButton'

export default function HomePage() {
  const router = useRouter()

  const cards = [
    {
      title: 'Times/Jogadores',
      description: 'Gerencie os times, suas informações e jogadores',
      icon: '/window.svg',
      route: '/times'
    },
    {
      title: 'Matérias',
      description: 'Crie e edite notícias para o site',
      icon: '/file.svg',
      route: '/materia'
    },
    {
      title: 'Temporada',
      description: 'Gerencie a transição entre temporadas',
      icon: '/window.svg',
      route: '/temporada'
    },
    {
      title: 'Dashboard',
      description: 'Filtros e insights sobre times e jogadores',
      icon: '/globe.svg',
      route: '/dashboard'
    }
  ]

  return (
    <div className="min-h-screen bg-[#1C1C24] p-6">
      {/* Header com botão de logout */}
      <header className="flex justify-center items-center mb-8">
        <h1 className="text-5xl text-[#63E300] font-extrabold italic leading-[55px] tracking-[-3px]">
          FABR NETWORK
        </h1>
      </header>
        <LogoutButton />
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl text-[#63E300] font-extrabold italic leading-[55px] tracking-[-3px] text-center mb-6">
          PAINEL DE ADMINISTRAÇÃO
        </h1>
        <p className="text-gray-300 text-center mb-12">
          Gerencie times, jogadores, matérias e obtenha insights sobre o futebol americano brasileiro
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => router.push(card.route)}
              className="bg-[#272731] rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] hover:border-[#63E300] border border-gray-700"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 mr-3 bg-[#1C1C24] rounded-full flex items-center justify-center">
                  <Image
                    src={card.icon}
                    alt={card.title}
                    width={20}
                    height={20}
                  />
                </div>
                <h2 className="text-xl font-bold text-white">{card.title}</h2>
              </div>
              <p className="text-gray-400 mb-4">{card.description}</p>
              <div className="mt-auto">
                <button className="px-4 py-2 text-[#63E300] hover:text-white transition-colors">
                  Acessar →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} FABR Network - Todos os direitos reservados
          </p>
        </div>
        <div className='flex justify-center items-center mx-auto w-60 h-20'>
          <Image
            src="/logo-fabr-color.png"
            alt="Logo"
            width={200}
            height={100}
          />
        </div>
      </div>
    </div>
  )
}