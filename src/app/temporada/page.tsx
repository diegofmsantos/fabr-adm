// pages/iniciar-temporada.tsx
"use client"

import { useState } from "react"
import { iniciarTemporada } from "@/api/api"

export default function IniciarTemporadaPage() {
  const [timeChanges, setTimeChanges] = useState([])
  const [transferencias, setTransferencias] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await iniciarTemporada("2025", {
        timeChanges,
        transferencias
      })
      setMessage(`Temporada 2025 iniciada com sucesso! ${response.times} times e ${response.jogadores} jogadores criados.`)
    } catch (error) {
      console.error("Erro ao iniciar temporada:", error)
      setMessage("Erro ao iniciar temporada. Verifique o console para mais detalhes.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 overflow-x-hidden bg-[#1C1C24] min-h-screen">
      <h1 className="text-4xl font-bold text-white text-center mb-8">Iniciar Temporada 2025</h1>
      
      {/* Interface para configurar alterações de times */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Times com Alterações</h2>
        {/* Componentes para adicionar e visualizar alterações de times */}
      </div>
      
      {/* Interface para configurar transferências de jogadores */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Transferências de Jogadores</h2>
        {/* Componentes para adicionar e visualizar transferências */}
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#63E300] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#50B800] transition-colors"
        >
          {loading ? "Processando..." : "Iniciar Temporada 2025"}
        </button>
      </div>
      
      {message && (
        <div className="mt-4 p-4 bg-[#272731] rounded-lg">
          <p className="text-white">{message}</p>
        </div>
      )}
    </div>
  )
}