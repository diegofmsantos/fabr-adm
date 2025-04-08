"use client"

import { useEffect, useState } from 'react'
import { Editor } from './Editor'
import { InputField } from './InputField'
import { FormField } from './FormField'
import { createNoticia, getNoticias } from '@/api/api'
import Link from 'next/link'
import { Materia } from '@/types/materia'
import { ModalMateria } from '../Modal/ModalMateria'
import Image from 'next/image'
import { motion } from 'framer-motion' // Se você não tiver framer-motion, instale com: npm install framer-motion

export const FormMateria = () => {
  // Estados existentes
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    imagem: '',
    legenda: '',
    texto: '',
    autor: '',
    autorImage: '',
    createdAt: new Date().toISOString().slice(0, 16),
    updatedAt: new Date().toISOString().slice(0, 16)
  })

  const [materias, setMaterias] = useState<Materia[]>([])
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null)

  // Novos estados para interações
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid')
  const [isFormMinimized, setIsFormMinimized] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewAuthorImage, setPreviewAuthorImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadMaterias = async () => {
      try {
        const data = await getNoticias()
        setMaterias(data)
      } catch (error) {
        console.error('Erro ao carregar notícias:', error)
      }
    }
    loadMaterias()
  }, [])

  // Efeito para mostrar temporariamente a mensagem de sucesso
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const formatarDataLocal = () => {
    // Obtém a data atual
    const dataAtual = new Date();

    // Formata a data no formato ISO para campos datetime-local
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const hora = String(dataAtual.getHours()).padStart(2, '0');
    const minuto = String(dataAtual.getMinutes()).padStart(2, '0');

    return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
  };

  const handleUpdateMateria = (updatedMateria: Materia) => {
    setMaterias(prev => prev.map(m => m.id === updatedMateria.id ? updatedMateria : m))
    setSuccessMessage('Matéria atualizada com sucesso!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const materiaData = {
        ...formData,
        createdAt: new Date(new Date(formData.createdAt).toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })),
        updatedAt: new Date(new Date(formData.updatedAt).toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
      };

      await createNoticia(materiaData);
      const noticiasAtualizadas = await getNoticias();
      setMaterias(noticiasAtualizadas);

      setSuccessMessage('Matéria criada com sucesso!')

      setFormData({
        titulo: '',
        subtitulo: '',
        imagem: '',
        legenda: '',
        texto: '',
        autor: '',
        autorImage: '',
        createdAt: new Date().toISOString().slice(0, 16),
        updatedAt: new Date().toISOString().slice(0, 16)
      });

      setPreviewImage(null);
      setPreviewAuthorImage(null);

    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSuccessMessage('Erro ao salvar a matéria')
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para imagem principal com preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, imagem: result }))
        setPreviewImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handler para foto do autor com preview
  const handleAuthorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, autorImage: result }))
        setPreviewAuthorImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F13]">
      {/* Header moderno com degradê */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-[#191920] to-[#272731] shadow-xl">
        <div className="w-full px-2 py-4 flex justify-between items-center">
          <Link href="/" className="text-white font-bold text-xl flex items-center">
            <Image
              src="/logo-fabr-color.png"
              alt="Logo"
              width={200}
              height={100}
            />
          </Link>
          <h1 className="text-4xl text-[#63E300] font-extrabold italic leading-[55px] tracking-[-3px]">GERENCIAR MATÉRIAS</h1>
          <div className="flex ml-auto gap-4 mr-4">
            <button
              onClick={() => setIsFormMinimized(!isFormMinimized)}
              className="px-4 py-2 bg-[#272731] text-white rounded-lg hover:bg-[#323240] transition-all flex items-center"
            >
              {isFormMinimized ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nova Matéria
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Minimizar
                </>
              )}
            </button>
            <Link
              href={`/`}
              className="px-4 py-2 bg-[#63E300] text-black rounded-lg hover:bg-[#50B800] transition-colors flex items-center font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-5 right-5 z-50 bg-[#63E300] text-black px-6 py-3 rounded-lg shadow-lg"
        >
          <p className="font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </p>
        </motion.div>
      )}

      <div className="max-w-screen-3xl mx-auto px-6 py-6">
        {/* Área de controle de visualização */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Matérias Publicadas
            <span className="ml-2 text-sm font-normal bg-[#272731] px-2 py-1 rounded text-gray-400">
              {materias.length} matérias
            </span>
          </h2>
          <div className="flex items-center gap-2 bg-[#272731] p-1 rounded-lg">
            <button
              onClick={() => setActiveView('grid')}
              className={`p-2 rounded ${activeView === 'grid' ? 'bg-[#323240] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`p-2 rounded ${activeView === 'list' ? 'bg-[#323240] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Layout Flexível */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Formulário (Pode ser minimizado/maximizado) */}
          <motion.div
            className={`${isFormMinimized ? 'lg:w-0 overflow-hidden' : 'lg:w-3/5'} bg-[#191920] rounded-xl shadow-xl transition-all duration-300`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {!isFormMinimized && (
              <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#63E300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Nova Matéria
                </h2>

                <div className="space-y-4">
                  {/* Imagem Principal com Preview */}
                  <div className="mb-6">
                    <label className="block text-white text-sm font-medium mb-2">Imagem Principal</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-4 transition-all hover:border-[#63E300] cursor-pointer bg-[#0F0F13]">
                      <input
                        type="file"
                        className="hidden"
                        id="imagem-upload"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                      <label htmlFor="imagem-upload" className="cursor-pointer w-full h-full">
                        {previewImage ? (
                          <div className="relative h-40 w-full">
                            <Image
                              src={previewImage}
                              alt="Preview"
                              fill
                              className="object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                              <span className="text-white bg-[#63E300] px-3 py-1 rounded text-sm font-medium">
                                Alterar Imagem
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-400">Clique para upload ou arraste a imagem</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Campos de texto agrupados */}
                  <div className="flex flex-col gap-4 bg-[#0F0F13] p-4 rounded-lg border border-gray-800">
                    <FormField label="Título">
                      <InputField
                        value={formData.titulo}
                        onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                        placeholder="Digite o título da matéria"
                      />
                    </FormField>

                    <FormField label="Subtítulo">
                      <InputField
                        value={formData.subtitulo}
                        onChange={(e) => setFormData(prev => ({ ...prev, subtitulo: e.target.value }))}
                        placeholder="Digite o subtítulo"
                      />
                    </FormField>

                    <FormField label="Legenda da Imagem">
                      <InputField
                        value={formData.legenda}
                        onChange={(e) => setFormData(prev => ({ ...prev, legenda: e.target.value }))}
                        placeholder="Digite a legenda para a imagem"
                      />
                    </FormField>
                  </div>

                  {/* Editor de texto em um card separado */}
                  <div className="bg-[#0F0F13] p-4 rounded-lg border border-gray-800">
                    <FormField label="Conteúdo da Matéria">
                      <Editor
                        value={formData.texto}
                        onChange={(content) => setFormData(prev => ({ ...prev, texto: content }))}
                      />
                    </FormField>
                  </div>

                  {/* Informações do autor agrupadas */}
                  <div className="bg-[#0F0F13] p-4 rounded-lg border border-gray-800">
                    <h3 className="text-white font-medium mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#63E300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Informações do Autor
                    </h3>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <input
                          type="file"
                          className="hidden"
                          id="author-upload"
                          onChange={handleAuthorImageChange}
                          accept="image/*"
                        />
                        <label htmlFor="author-upload" className="cursor-pointer">
                          <div className="w-20 h-20 bg-[#272731] rounded-full flex items-center justify-center border-2 border-dashed border-gray-700 hover:border-[#63E300] transition-all">
                            {previewAuthorImage ? (
                              <div className="relative w-full h-full rounded-full overflow-hidden">
                                <Image
                                  src={previewAuthorImage}
                                  alt="Autor"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </div>
                      <div className="flex-grow">
                        <FormField label="Nome do Autor">
                          <InputField
                            value={formData.autor}
                            onChange={(e) => setFormData(prev => ({ ...prev, autor: e.target.value }))}
                            placeholder="Nome do autor"
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>

                  {/* Datas em linha */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0F0F13] p-4 rounded-lg border border-gray-800">
                      <FormField label="Data de Criação">
                        <InputField
                          type="datetime-local"
                          value={formData.createdAt}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            createdAt: e.target.value
                          }))}
                        />
                      </FormField>
                    </div>

                    <div className="bg-[#0F0F13] p-4 rounded-lg border border-gray-800">
                      <FormField label="Data de Atualização">
                        <InputField
                          type="datetime-local"
                          value={formData.updatedAt}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            updatedAt: e.target.value
                          }))}
                        />
                      </FormField>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-[#63E300] text-black py-3 rounded-lg font-medium text-center flex items-center justify-center transition-all
                        ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#50B800]'}`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processando...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Publicar Matéria
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>

          {/* Lista de Matérias */}
          <motion.div
            className={`${isFormMinimized ? 'w-full' : 'lg:w-2/5'} transition-all duration-300`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {materias.length === 0 ? (
              <div className="bg-[#191920] p-10 rounded-xl text-center shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-9a2 2 0 00-2 2v8a2 2 0 002 2h9z" />
                </svg>
                <p className="text-gray-400 mb-4">Nenhuma matéria publicada ainda.</p>
                <button
                  onClick={() => setIsFormMinimized(false)}
                  className="bg-[#63E300] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#50B800] transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Criar Primeira Matéria
                </button>
              </div>
            ) : (
              <div className={activeView === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
              }>
                {materias.map((materia, index) => (
                  <motion.div
                    key={materia.id}
                    layoutId={`materia-${materia.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.05 }
                    }}
                    className={`
                      bg-[#191920] rounded-xl shadow-xl overflow-hidden cursor-pointer 
                      hover:shadow-2xl transform transition-all
                      hover:translate-y-[-5px] hover:border-[#63E300] border border-transparent
                      ${activeView === 'list' ? 'flex' : ''}
                    `}
                    onClick={() => setSelectedMateria(materia)}
                  >
                    {/* Imagem */}
                    <div className={`relative ${activeView === 'list' ? 'h-28 w-40' : 'h-48 w-full'}`}>
                      <Image
                        src={materia.imagem}
                        alt={materia.titulo}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70"></div>
                    </div>

                    {/* Conteúdo */}
                    <div className={`p-4 ${activeView === 'list' ? 'flex-1' : ''}`}>
                      <h3 className="text-white font-bold text-lg line-clamp-2 mb-1 hover:text-[#63E300] transition-colors">
                        {materia.titulo}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {materia.subtitulo}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#272731]">
                            <Image
                              src={materia.autorImage}
                              alt={materia.autor}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-gray-400 text-sm">
                            {materia.autor}
                          </span>
                        </div>

                        <span className="text-gray-500 text-xs bg-[#0F0F13] px-2 py-1 rounded-full">
                          {new Date(materia.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal de edição */}
      {selectedMateria && (
        <ModalMateria
          materia={selectedMateria}
          closeModal={() => setSelectedMateria(null)}
          onUpdate={handleUpdateMateria}
        />
      )}
    </div>
  )
}