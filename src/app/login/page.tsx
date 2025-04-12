"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Verificação simples de credenciais
    if (username === 'fabrnetwork' && password === 'fabrnetwork321@@') {
      // Simulando um pequeno delay para dar feedback visual de carregamento
      setTimeout(() => {
        // Em um ambiente de produção, você usaria algo como o NextAuth
        // Aqui, estamos apenas simulando o login salvando em um cookie
        document.cookie = "fabr_auth_token=true; path=/; max-age=86400; samesite=strict" // expira em 24 horas
        router.push('/')
      }, 1000)
    } else {
      setError('Credenciais inválidas. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1C24] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/logo-fabr-color.png" 
            alt="FABR Network Logo" 
            width={220} 
            height={120}
            priority
          />
        </div>

        {/* Card de Login */}
        <div className="bg-[#272731] rounded-xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-4xl text-[#63E300] font-extrabold italic leading-[55px] tracking-[-3px] text-center mb-6">
              PAINEL DE ADMINISTRAÇÃO
            </h2>
            
            <p className="text-gray-400 text-center mb-8">
              Faça login para acessar o painel administrativo
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-gray-300 text-sm font-medium mb-2">
                    Nome de usuário
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300] transition-colors"
                    placeholder="Digite seu nome de usuário"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">
                    Senha
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300] transition-colors"
                    placeholder="Digite sua senha"
                    required
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full px-4 py-3 bg-[#63E300] text-black font-bold rounded-lg hover:bg-[#50B800] transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Entrando...
                      </span>
                    ) : 'Entrar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Footer */}
          <div className="px-8 py-4 bg-[#1C1C24]">
            <p className="text-gray-500 text-center text-sm">
              © {new Date().getFullYear()} FABR Network - Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}