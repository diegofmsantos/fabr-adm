"use client"

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // Remover o cookie de autenticação
    document.cookie = "fabr_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // Redirecionar para a página de login
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-24 h-10 flex justify-center items-center px-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors absolute right-6 top-4 font-medium"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 mr-2" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
        />
      </svg>
      Sair
    </button>
  )
}