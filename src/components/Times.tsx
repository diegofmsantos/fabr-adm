"use client"

import { useForm, SubmitHandler, FieldError } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { Time } from "../types/time"
import { TimeSchema } from "@/schemas/Time"
import { JogadorSchema } from "@/schemas/Jogador"
import { api, getTimes } from "@/api/api"
import { FormField } from "@/components/Formulario/FormField"
import get from "lodash/get"
import ModalTime from "@/components/Modal/ModalTime";
import ModalJogador from "@/components/Modal/ModalJogador";
import ModalSucesso from "./Modal/ModalSucesso"
import { camposJogador, camposNumericosJogador, camposTime, estatisticas } from "../utils/campos"
import Link from "next/link"
import Image from "next/image"

type TimeFormData = z.infer<typeof TimeSchema>
type JogadorFormData = z.infer<typeof JogadorSchema>

export const Times = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<TimeFormData>({
        resolver: zodResolver(TimeSchema),
        defaultValues: {
            temporada: "2024"
        }
    })

    const {
        register: registerJogador,
        handleSubmit: handleSubmitJogador,
        formState: { errors: jogadorErrors },
        reset: resetJogador
    } = useForm<JogadorFormData>({
        resolver: zodResolver(JogadorSchema),
        defaultValues: {
            estatisticas: {
                passe: {},
                corrida: {},
                recepcao: {},
                retorno: {},
                defesa: {},
                kicker: {},
                punter: {},
            },
        },
    })

    const [times, setTimes] = useState<Time[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedTime, setSelectedTime] = useState<Time | null>(null)
    const [selectedJogador, setSelectedJogador] = useState<any | null>(null)
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false)
    const [isJogadorModalOpen, setIsJogadorModalOpen] = useState(false)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [temporadaSelecionada, setTemporadaSelecionada] = useState("2024")
    const [jogadorTemporada, setJogadorTemporada] = useState("2024")
    const [activeTab, setActiveTab] = useState<'time' | 'jogador' | 'times-cadastrados'>('time')
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

    // Fetch dos times quando o componente é montado ou a temporada muda
    useEffect(() => {
        const fetchTimes = async () => {
            try {
                const data = await getTimes(temporadaSelecionada)
                setTimes(data)
            } catch (error) {
                console.error("Erro ao buscar os times:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTimes()
    }, [temporadaSelecionada])

    const removeEmptyFields = (obj: any) => {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, value]) => value !== undefined && value !== "")
        )
    }

    const onSubmitTime: SubmitHandler<TimeFormData> = async (data) => {
        try {
            await api.post("/time", data)
            setSuccessMessage("Time adicionado com sucesso!")
            setIsSuccessModalOpen(true)
            reset()
        } catch (error) {
            console.error("Erro ao adicionar time:", error)
        }
    }

    const onSubmitJogador: SubmitHandler<JogadorFormData> = async (data) => {
        setIsSubmitting(true)

        try {
            // Filtrar estatísticas não preenchidas
            const estatisticasFiltradas = Object.fromEntries(
                Object.entries(data.estatisticas || {}).map(([group, stats]) => [
                    group,
                    removeEmptyFields(stats || {}),
                ])
            );

            // Adicionar temporada manualmente ao objeto de dados
            const jogadorData = {
                ...data,
                temporada: jogadorTemporada,
                estatisticas: estatisticasFiltradas,
            };

            await api.post("/jogador", jogadorData);
            setSuccessMessage("Jogador adicionado com sucesso!")
            setIsSuccessModalOpen(true)
            resetJogador()
        } catch (error) {
            console.error("Erro ao adicionar jogador:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Função para atualizar um time no estado
    const updateTime = (updatedTime: Time) => {
        setTimes((prevTimes) =>
            prevTimes.map((time) =>
                time.id === updatedTime.id ? { ...time, ...updatedTime } : time
            )
        )
    }

    // Função para lidar com mudança de temporada
    const handleTemporadaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTemporadaSelecionada(e.target.value);
    }

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    return (
        <div className="bg-[#1C1C24] min-h-screen">
            {/* Header com navegação e seletor de temporada */}
            <header className="sticky top-0 z-10 bg-gradient-to-r from-[#191920] to-[#272731] shadow-xl mb-4">
                <div className="w-full px-2 py-4 flex justify-between items-center">
                    <div className='flex items-center'>
                        <Link href="/" className="text-white font-bold text-xl flex items-center">
                            <Image
                                src="/logo-fabr-color.png"
                                alt="Logo"
                                width={200}
                                height={100}
                            />
                        </Link>
                        <h1 className="text-4xl text-[#63E300] font-extrabold italic leading-[55px] tracking-[-3px]">GERENCIAR TIMES E JOGADORES</h1>
                    </div>
                    <div className='flex'>
                        <div className="flex items-center bg-[#1C1C24] px-3 py-2 rounded-lg">
                            <span className="text-white text-sm mr-2">Temporada:</span>
                            <select
                                value={temporadaSelecionada}
                                onChange={handleTemporadaChange}
                                className="bg-[#2C2C34] text-white px-2 py-1 rounded border border-gray-700 text-sm"
                            >
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                            </select>
                        </div>
                        <div className="flex ml-auto gap-4 mr-4">
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
                </div>
            </header>

           

            {/* Tabs de navegação */}
            <div className="bg-[#272731] border-b border-gray-700 sticky top-20 z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <nav className="flex justify-between">
                        <button
                            onClick={() => setActiveTab('time')}
                            className={`px-4 py-4 text-xl font-extrabold italic leading-[55px] tracking-[-1px] transition-colors relative ${activeTab === 'time'
                                ? 'text-[#63E300]'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            ADICIONAR TIME
                            {activeTab === 'time' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#63E300]"></span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('jogador')}
                            className={`px-4 py-4 text-xl font-extrabold italic leading-[55px] tracking-[-1px] transition-colors relative ${activeTab === 'jogador'
                                ? 'text-[#63E300]'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            ADICIONAR JOGADOR
                            {activeTab === 'jogador' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#63E300]"></span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('times-cadastrados')}
                            className={`px-4 py-4 text-xl font-extrabold italic leading-[55px] tracking-[-1px] transition-colors relative ${activeTab === 'times-cadastrados'
                                ? 'text-[#63E300]'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            TIMES CADASTRADOS
                            {activeTab === 'times-cadastrados' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#63E300]"></span>
                            )}
                        </button>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Seção de Adicionar Time */}
                {activeTab === 'time' && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Adicionar Time</h2>
                            <span className="bg-[#272731] px-3 py-1 rounded-full text-xs text-gray-400">
                                Temporada {temporadaSelecionada}
                            </span>
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmitTime)}
                            className="bg-[#272731] rounded-xl shadow-lg overflow-hidden"
                        >
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {camposTime.map((field) => (
                                    <FormField
                                        key={field.id}
                                        label={field.label}
                                        id={field.id}
                                        register={register(field.id)}
                                        error={errors[field.id as keyof TimeFormData] as FieldError | undefined}
                                    />
                                ))}

                                {/* Campo de temporada para o time */}
                                <FormField
                                    label="Temporada"
                                    id="temporada"
                                    register={register("temporada")}
                                    error={errors.temporada as FieldError | undefined}
                                    type="select"
                                    options={[
                                        { value: "2024", label: "2024" },
                                        { value: "2025", label: "2025" },
                                    ]}
                                />

                                {/* Campos de Títulos */}
                                {(["nacionais", "conferencias", "estaduais"] as const).map((titulo) => (
                                    <FormField
                                        key={`titulos.0.${titulo}`}
                                        label={`Títulos ${titulo.charAt(0).toUpperCase() + titulo.slice(1)}`}
                                        id={`titulos.0.${titulo}`}
                                        register={register(`titulos.0.${titulo}`)}
                                        error={errors.titulos?.[0]?.[titulo]}
                                    />
                                ))}
                            </div>

                            <div className="bg-[#2C2C34] py-4 px-6 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-[#63E300] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#50B800] transition-colors"
                                >
                                    Adicionar Time
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Seção de Adicionar Jogador */}
                {activeTab === 'jogador' && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Adicionar Jogador</h2>
                            <span className="bg-[#272731] px-3 py-1 rounded-full text-xs text-gray-400">
                                Temporada {jogadorTemporada}
                            </span>
                        </div>

                        {loading ? (
                            <div className="bg-[#272731] rounded-xl p-6 flex justify-center items-center h-64">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#63E300] mb-3"></div>
                                    <p className="text-gray-400">Carregando times...</p>
                                </div>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmitJogador(onSubmitJogador)}
                                className="bg-[#272731] rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
                                        {/* Campo de Seleção do Time */}
                                        <FormField
                                            label="Time"
                                            id="timeId"
                                            register={registerJogador("timeId", {
                                                setValueAs: (v) => (v === "" ? undefined : parseInt(v)),
                                            })}
                                            error={jogadorErrors.timeId as FieldError | undefined}
                                            type="select"
                                            options={times
                                                .filter((time) => time.id !== undefined && time.nome !== undefined)
                                                .map((time) => ({ value: time.id as number, label: time.nome as string }))}
                                        />

                                        {/* Campo de temporada para jogador */}
                                        <div className="mb-1">
                                            <label className="block text-white text-sm font-medium mb-2">
                                                Temporada
                                            </label>
                                            <select
                                                value={jogadorTemporada}
                                                onChange={(e) => setJogadorTemporada(e.target.value)}
                                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                                            >
                                                <option value="2024">2024</option>
                                                <option value="2025">2025</option>
                                            </select>
                                        </div>

                                        {/* Campos do Jogador */}
                                        {camposJogador.map((field) => (
                                            <FormField
                                                key={field.id}
                                                label={field.label}
                                                id={field.id}
                                                register={registerJogador(field.id)}
                                                error={jogadorErrors[field.id] as FieldError | undefined}
                                                type={field.type === "number" || field.type === "select" ? field.type : "text"}
                                                options={field.options}
                                            />
                                        ))}

                                        {/* Campos Numéricos do Jogador */}
                                        {camposNumericosJogador.map((field) => (
                                            <FormField
                                                key={field.id}
                                                label={field.label}
                                                id={field.id}
                                                register={registerJogador(field.id, {
                                                    setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                                                })}
                                                error={jogadorErrors[field.id] as FieldError | undefined}
                                                type="number"
                                                step={field.id === "altura" ? "0.01" : "1"}
                                            />
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-700 pt-6 pb-2">
                                        <h3 className="text-xl font-bold text-white mb-4">Estatísticas do Jogador</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-5">
                                        {estatisticas.map((grupo) => (
                                            <div key={grupo.group} className="bg-[#1C1C24] p-4 rounded-lg">
                                                {/* Cabeçalho clicável do grupo de estatísticas */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleGroup(grupo.group)}
                                                    className="w-full text-left flex justify-between items-center text-lg font-bold mb-2 text-[#63E300]"
                                                >
                                                    <span>{grupo.group.toUpperCase()}</span>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className={`h-5 w-5 transition-transform ${expandedGroups[grupo.group] ? 'transform rotate-180' : ''}`}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {/* Conteúdo que aparece/desaparece */}
                                                <div
                                                    className={`transition-all duration-300 overflow-hidden ${expandedGroups[grupo.group]
                                                        ? 'max-h-[1000px] opacity-100'
                                                        : 'max-h-0 opacity-0'
                                                        }`}
                                                >
                                                    {grupo.fields.map((field) => (
                                                        <FormField
                                                            key={field.id}
                                                            label={field.label}
                                                            id={`estatisticas.${grupo.group}.${field.id}`}
                                                            register={registerJogador(
                                                                `estatisticas.${grupo.group}.${field.id}` as keyof JogadorFormData,
                                                                {
                                                                    setValueAs: (v) => (v === "" ? undefined : field.type === "string" ? v : Number(v)),
                                                                }
                                                            )}
                                                            error={get(jogadorErrors, `estatisticas.${grupo.group}.${field.id}`) as FieldError | undefined}
                                                            type={field.type === "string" ? "text" : "number"}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>

                                <div className="bg-[#2C2C34] py-4 px-6 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-[#63E300] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#50B800] transition-colors disabled:bg-gray-600 disabled:text-gray-400"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Adicionando...
                                            </span>
                                        ) : (
                                            "Adicionar Jogador"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Seção de Times Cadastrados */}
                {activeTab === 'times-cadastrados' && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Times Cadastrados</h2>
                            <span className="bg-[#272731] px-3 py-1 rounded-full text-xs text-gray-400">
                                Temporada {temporadaSelecionada}
                            </span>
                        </div>

                        {loading ? (
                            <div className="bg-[#272731] rounded-xl p-6 flex justify-center items-center h-64">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#63E300] mb-3"></div>
                                    <p className="text-gray-400">Carregando times...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {times.map((time) => (
                                    <div
                                        key={time.id}
                                        onClick={() => {
                                            setSelectedTime(time);
                                            setIsTimeModalOpen(true);
                                        }}
                                        className="bg-[#272731] rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 group"
                                        style={{
                                            borderLeft: `4px solid ${time.cor || '#63E300'}`
                                        }}
                                    >
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-white group-hover:text-[#63E300] transition-colors">
                                                    {time.nome}
                                                </h3>
                                                <span className="text-xs font-medium bg-[#1C1C24] text-gray-400 px-2 py-1 rounded">
                                                    {time.sigla}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-gray-400 text-sm">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {time.cidade}
                                                </div>
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {time.temporada}
                                                </div>
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {time.jogadores?.length || 0} jogadores
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#1C1C24] px-5 py-3 flex justify-end">
                                            <button className="text-xs text-[#63E300] font-medium hover:text-white transition-colors">
                                                Ver detalhes
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {times.length === 0 && !loading && (
                            <div className="bg-[#272731] rounded-xl p-10 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-400 mb-4">Nenhum time cadastrado para esta temporada</p>
                                <button
                                    onClick={() => setActiveTab('time')}
                                    className="bg-[#63E300] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#50B800] transition-colors"
                                >
                                    Adicionar Novo Time
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Time */}
            {isTimeModalOpen && selectedTime && (
                <ModalTime
                    time={selectedTime}
                    closeModal={() => setIsTimeModalOpen(false)}
                    openJogadorModal={(jogador) => {
                        setSelectedJogador(jogador);
                        setIsJogadorModalOpen(true);
                    }}
                    updateTime={updateTime}
                />
            )}

            {/* Modal de Jogador */}
            {isJogadorModalOpen && selectedJogador && (
                <ModalJogador
                    jogador={selectedJogador}
                    closeModal={() => setIsJogadorModalOpen(false)}
                />
            )}

            {/* Modal de Sucesso */}
            {isSuccessModalOpen && (
                <ModalSucesso
                    mensagem={successMessage}
                    onClose={() => setIsSuccessModalOpen(true)}
                />
            )}

            {/* Estilos CSS adicionais */}
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
    )
}