"use client"

import { useState } from "react";
import { api } from "@/api/api";
import { Time } from "@/types/time";
import { fieldGroups } from "@/utils/campos";

export default function ModalTime({
    time,
    closeModal,
    openJogadorModal,
    updateTime,
}: {
    time: Time;
    closeModal: () => void;
    openJogadorModal: (jogador: any) => void;
    updateTime: (updatedTime: Time) => void;
}) {
    // Inicializa o formulário garantindo a estrutura correta para titulos
    const initialFormData = {
        ...time,
        titulos: time.titulos?.[0] || { nacionais: "", conferencias: "", estaduais: "" },
        jogadores: time.jogadores || [],
    };

    const [formData, setFormData] = useState<typeof initialFormData>(initialFormData);
    const [filter, setFilter] = useState("");
    const [filteredJogadores, setFilteredJogadores] = useState(time.jogadores || []);
    const [activeTab, setActiveTab] = useState<'info' | 'jogadores'>('info');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Atualiza os campos do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name.startsWith("titulos.")) {
            const field = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                titulos: {
                    ...prev.titulos,
                    [field]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Salva as alterações no backend
    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                titulos: [formData.titulos],
            };
            await api.put(`/time/${time.id}`, payload);
            updateTime(payload);
            closeModal();
        } catch (error) {
            console.error("Erro ao atualizar time:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Deleta o time
    const handleDelete = async () => {
        if (confirm("Tem certeza que deseja excluir este time?")) {
            setIsSubmitting(true);
            try {
                await api.delete(`/time/${time.id}`);
                closeModal();
                window.location.reload(); // Recarrega a página para refletir a exclusão
            } catch (error) {
                console.error("Erro ao excluir time:", error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Filtra os jogadores pelo nome
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setFilter(value);
        setFilteredJogadores(
            formData.jogadores.filter((jogador) =>
                jogador.nome.toLowerCase().includes(value)
            )
        );
    };


    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Overlay com blur */}
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                onClick={closeModal}
            ></div>
            
            {/* Modal */}
            <div className="absolute inset-12 bg-[#272731] rounded-xl shadow-lg overflow-hidden flex flex-col">
                {/* Header do modal */}
                <div className="bg-[#1C1C24] px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <div 
                            className="w-8 h-8 rounded-md mr-3 flex items-center justify-center"
                            style={{ backgroundColor: formData.cor || '#63E300' }}
                        >
                            <span className="text-white font-bold">{formData.sigla?.substring(0, 1)}</span>
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {formData.nome || 'Editar Time'}
                        </h2>
                    </div>
                    
                    <button
                        className="text-gray-400 hover:text-white transition-colors"
                        onClick={closeModal}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs de navegação */}
                <div className="bg-[#1C1C24] px-6 border-t border-gray-800">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                                activeTab === 'info'
                                    ? 'text-[#63E300]'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Informações do Time
                            {activeTab === 'info' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#63E300]"></span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('jogadores')}
                            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                                activeTab === 'jogadores'
                                    ? 'text-[#63E300]'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Jogadores ({formData.jogadores.length})
                            {activeTab === 'jogadores' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#63E300]"></span>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Conteúdo principal (scrollable) */}
                <div className="flex-grow overflow-y-auto p-6">
                    {/* Tab de informações do time */}
                    {activeTab === 'info' && (
                        <div className="space-y-6 animate-fadeIn">
                            {fieldGroups.map((group, groupIndex) => (
                                <div key={groupIndex} className="bg-[#1C1C24] rounded-lg p-5">
                                    <h3 className="text-[#63E300] font-semibold mb-4 text-sm uppercase tracking-wide">
                                        {group.title}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {group.fields.map((field) => (
                                            <div key={field.name}>
                                                <label className="block text-white text-sm font-medium mb-2">
                                                    {field.label}
                                                </label>
                                                <input
                                                    type="text"
                                                    name={field.name}
                                                    // @ts-ignore
                                                    value={field.name.startsWith("titulos.") ? formData.titulos?.[field.name.split(".")[1]] || "" : formData[field.name] || ""}
                                                    onChange={handleChange}
                                                    placeholder={field.label}
                                                    className="w-full px-3 py-2 bg-[#272731] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Tab de jogadores */}
                    {activeTab === 'jogadores' && (
                        <div className="animate-fadeIn">
                            <div className="bg-[#1C1C24] p-4 rounded-lg mb-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={filter}
                                        onChange={handleFilterChange}
                                        placeholder="Buscar jogador por nome..."
                                        className="block w-full pl-10 pr-3 py-2 bg-[#272731] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                                    />
                                </div>
                            </div>
                            
                            {filteredJogadores.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredJogadores.map((jogador) => (
                                        <div
                                            key={jogador.id}
                                            onClick={() => openJogadorModal(jogador)}
                                            className="bg-[#1C1C24] rounded-lg overflow-hidden flex items-center border border-gray-800 hover:border-[#63E300] transition-colors cursor-pointer"
                                        >
                                            <div 
                                                className="w-10 flex-shrink-0 h-full flex items-center justify-center"
                                                style={{ backgroundColor: formData.cor || '#63E300' }}
                                            >
                                                <span className="text-white font-bold">{jogador.numero}</span>
                                            </div>
                                            <div className="p-3 flex-grow">
                                                <h4 className="text-white font-medium">{jogador.nome}</h4>
                                                <div className="flex items-center mt-1">
                                                    <span className="text-xs text-gray-400 bg-[#272731] px-2 py-0.5 rounded">
                                                        {jogador.posicao}
                                                    </span>
                                                    <span className="mx-2 text-gray-600">•</span>
                                                    <span className="text-xs text-gray-400">
                                                        {jogador.setor}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-3 text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-[#1C1C24] p-8 rounded-lg text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {filter ? (
                                        <p className="text-gray-400">Nenhum jogador encontrado com o termo "{filter}"</p>
                                    ) : (
                                        <p className="text-gray-400">Este time ainda não possui jogadores cadastrados</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Footer com botões de ação */}
                <div className="bg-[#1C1C24] px-6 py-4 border-t border-gray-800 flex justify-between">
                    <button
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Excluindo...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Excluir Time
                            </>
                        )}
                    </button>
                    
                    <div className="space-x-3 flex">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#63E300] text-black rounded-lg hover:bg-[#50B800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Estilos adicionais */}
            <style jsx global>{`
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-in-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}