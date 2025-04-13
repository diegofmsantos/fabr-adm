"use client"

import { useState } from "react";
import { atualizarJogador, deletarJogador } from "@/api/api";
import { Estatisticas, Jogador } from "@/types/jogador";
import { useRouter } from "next/navigation";
import { estatisticasGroups } from "@/utils/stats";
import { jogadorGroups } from "@/utils/jogador";

export default function ModalJogador({
    jogador,
    closeModal,
}: {
    jogador: Jogador;
    closeModal: () => void;
}) {
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        ...jogador,
        altura: jogador.altura !== undefined ? String(jogador.altura).replace(".", ",") : "",
        temporada: jogador.times?.[0]?.temporada || "2025",
        estatisticas: jogador.estatisticas || {},
        camisa: jogador.camisa 
    });
    
    const [activeTab, setActiveTab] = useState<'info' | 'estatisticas'>('info');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "altura" || name === "idade" || name === "peso"
                ? value.replace(",", ".")
                : value,
        }));
    };

    const handleStatisticChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [groupKey, fieldKey] = name.split(".") as [keyof Estatisticas, string];

        setFormData((prev) => {
            const estatisticas = { ...prev.estatisticas } as Estatisticas;

            if (!estatisticas[groupKey]) { //@ts-ignore
                estatisticas[groupKey] = {};
            }
            //@ts-ignore
            estatisticas[groupKey][fieldKey] = value === "" 
                ? 0 
                : (fieldKey.startsWith("fg") ? value : Number(value));

            return { ...prev, estatisticas };
        });
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            console.log("Iniciando atualização do jogador");
            console.log("Valor da camisa antes do envio:", formData.camisa);
            
            // Converter altura corretamente
            const altura = formData.altura
                ? Number(String(formData.altura).replace(',', '.'))
                : jogador.altura;
    
            // Garantir conversão adequada dos valores numéricos
            const parsedValues = {
                altura: altura,
                peso: Number(formData.peso),
                idade: Number(formData.idade),
                experiencia: Number(formData.experiencia),
                numero: Number(formData.numero)
            };
    
            // Construir objeto final para envio à API
            // Cuidado para não duplicar campos que já existem no formData
            const apiData = {
                ...formData,          // Incluir todos os campos do formData primeiro
                ...parsedValues,      // Sobrescrever com valores numéricos convertidos
                timeId: jogador.timeId // Garantir que timeId esteja presente
            };
    
            console.log("Dados completos enviados para API:", apiData);
            
            // Enviar a requisição e aguardar a resposta
            const response = await atualizarJogador(apiData);
            console.log("Resposta da API após atualização:", response);
            
            // Fechar o modal e atualizar a UI
            closeModal();
            router.refresh();
        } catch (error) {
            console.error("Erro ao atualizar jogador:", error);
            alert("Ocorreu um erro ao atualizar o jogador. Verifique o console para mais detalhes.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Tem certeza que deseja excluir este jogador?")) {
            setIsSubmitting(true);
            try {
                await deletarJogador(jogador.id);
                closeModal();
                router.refresh(); // Força recarregamento
            } catch (error) {
                console.error("Erro ao excluir jogador:", error);
            } finally {
                setIsSubmitting(false);
            }
        }
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
                            className="w-8 h-8 rounded-md mr-3 flex items-center justify-center bg-[#63E300]"
                        >
                            <span className="text-black font-bold">{formData.numero}</span>
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {formData.nome || 'Editar Jogador'}
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
                            Informações do Jogador
                            {activeTab === 'info' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#63E300]"></span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('estatisticas')}
                            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                                activeTab === 'estatisticas'
                                    ? 'text-[#63E300]'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Estatísticas
                            {activeTab === 'estatisticas' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#63E300]"></span>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Conteúdo principal (scrollable) */}
                <div className="flex-grow overflow-y-auto p-6">
                    {/* Tab de informações do jogador */}
                    {activeTab === 'info' && (
                        <div className="space-y-6 animate-fadeIn">
                            {jogadorGroups.map((group, groupIndex) => (
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
                                                {field.type === "select" ? (
                                                    <select
                                                        name={field.name}
                                                        value={formData[field.name as keyof typeof formData] as string}
                                                        onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                                                        className="w-full px-3 py-2 bg-[#272731] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                                                    >
                                                        <option value="">Selecione uma opção</option>
                                                        {field.options?.map((option) => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        name={field.name}
                                                        value={formData[field.name as keyof typeof formData] as string}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 bg-[#272731] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Tab de estatísticas */}
                    {activeTab === 'estatisticas' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {estatisticasGroups.map((group) => (
                                    <div key={group.id} className="bg-[#1C1C24] rounded-lg p-5">
                                        <h3 className="text-[#63E300] font-semibold mb-4 text-sm uppercase tracking-wide">
                                            {group.title}
                                        </h3>
                                        <div className="space-y-3">
                                            {group.fields.map((field) => (
                                                <div key={field.id} className="flex flex-col">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-xs text-gray-400 font-medium">
                                                            {field.label}
                                                        </label>
                                                        <div className="flex items-center bg-[#272731] px-2 py-0.5 rounded text-xs">
                                                            <input
                                                                type="text"
                                                                name={`${group.id}.${field.id}`} // @ts-ignore
                                                                value={formData.estatisticas[group.id as keyof Estatisticas]?.[field.id as any] ?? 0}
                                                                onChange={handleStatisticChange}
                                                                className="w-16 bg-transparent text-right border-none focus:outline-none text-white"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-[#272731] rounded-full h-1.5">
                                                        <div 
                                                            className="bg-[#63E300] h-1.5 rounded-full" 
                                                            style={{ 
                                                                width: `${Math.min(
                                                                    100, // @ts-ignore
                                                                    (Number(formData.estatisticas[group.id as keyof Estatisticas]?.[field.id as any]) / 
                                                                    (field.id.includes('jardasde') ? 500 : 100)) * 100
                                                                )}%` 
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                Excluir Jogador
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