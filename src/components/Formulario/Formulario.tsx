"use client"

import { useForm, SubmitHandler, FieldError } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { Time } from "../../types/time"
import { TimeSchema } from "@/schemas/Time"
import { JogadorSchema } from "@/schemas/Jogador"
import { api, getTimes } from "@/api/api"
import { FormField } from "@/components/Formulario/FormField"
import get from "lodash/get"
import ModalTime from "@/components/Modal/ModalTime";
import ModalJogador from "@/components/Modal/ModalJogador";
import ModalSucesso from "../Modal/ModalSucesso"
import { camposJogador, camposNumericosJogador, camposTime, estatisticas } from "../../utils/campos"
import Link from "next/link"

type TimeFormData = z.infer<typeof TimeSchema>
type JogadorFormData = z.infer<typeof JogadorSchema>

export default function Formulario() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<TimeFormData>({
        resolver: zodResolver(TimeSchema),
        defaultValues: {
            temporada: "2024" // Valor padrão para temporada (presumindo que TimeSchema inclua temporada)
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
    const [jogadorTemporada, setJogadorTemporada] = useState("2024") // Estado para temporada do jogador

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
                temporada: jogadorTemporada, // Usar o estado da temporada
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

    return (
        <div className="p-4 overflow-x-hidden bg-[#1C1C24] min-h-screen">
            <Link
                href={`/materia`}
                className="w-44 h-12 font-bold text-lg bg-[#63E300] p-2 text-center rounded-md absolute right-6 top-6 text-black hover:bg-[#50B800] transition-colors"
            >
                Painel de Matérias
            </Link>

            {/* Seletor de temporada global */}
            <div className="flex justify-center mb-8 mt-4">
                <div className="flex items-center">
                    <label className="text-white mr-2 font-bold">Temporada:</label>
                    <select
                        value={temporadaSelecionada}
                        onChange={handleTemporadaChange}
                        className="bg-[#272731] text-white px-4 py-2 rounded-md border border-gray-700"
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                </div>
            </div>

            <div className="text-4xl font-bold text-white text-center mb-2 mt-12">Time</div>

            <form
                onSubmit={handleSubmit(onSubmitTime)}
                className="mb-8 p-6 bg-[#1C1C24] rounded-lg grid grid-cols-6 gap-4"
            >
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

                <div className="col-span-6 flex justify-center mt-5">
                    <button
                        type="submit"
                        className="bg-[#63E300] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#50B800] transition-colors"
                    >
                        Adicionar Time
                    </button>
                </div>
            </form>

            <div className="text-4xl font-bold text-white text-center mb-2">Jogador</div>

            {loading ? (
                <div className="text-white">Carregando times...</div>
            ) : (
                <form
                    onSubmit={handleSubmitJogador(onSubmitJogador)}
                    className="p-6 min-w-[800px] bg-[#1C1C24] rounded-lg"
                >

                    <div className="grid grid-cols-6 gap-4 mb-8">
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

                        {/* Campo de temporada para jogador (usando um select normal) */}
                        <div className="mb-4 w-full">
                            <label className="block text-white text-sm font-medium mb-2">
                                Temporada
                            </label>
                            <select
                                value={jogadorTemporada}
                                onChange={(e) => setJogadorTemporada(e.target.value)}
                                className="w-full px-3 py-2 bg-[#272731] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
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

                    <div className="grid grid-cols-7 gap-4">
                        {/* Estatísticas do Jogador */}
                        {estatisticas.map((grupo) => (
                            <div key={grupo.group} className="">
                                <div className="text-2xl font-bold mb-2 text-white">{grupo.group.toUpperCase()}</div>
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
                        ))}
                    </div>

                    <div className="flex justify-center mt-5">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#63E300] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#50B800] transition-colors"
                        >
                            Adicionar Jogador
                        </button>
                    </div>
                </form>
            )}
            <div className="text-4xl font-bold text-white text-center mt-10 mb-6">Times Cadastrados</div>
            <div className="grid grid-cols-3 gap-4 my-6">
                {times.map((time) => (
                    <div
                        key={time.id}
                        className="border border-gray-700 p-6 rounded-lg cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => {
                            setSelectedTime(time);
                            setIsTimeModalOpen(true);
                        }}
                        style={{
                            backgroundColor: "transparent",
                            transition: "all 0.3s ease",
                            color: "#fff"
                        }}
                        onMouseEnter={(e) => {
                            // @ts-ignore
                            e.currentTarget.style.backgroundColor = time.cor;
                            e.currentTarget.style.color = '#FFF';
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = '#374151';
                        }}
                    >
                        <h2 className="text-xl font-bold">{time.nome}</h2>
                        <p className="text-gray-300">Sigla: {time.sigla}</p>
                        <p className="text-gray-300">Cidade: {time.cidade}</p>
                        <p className="text-gray-300">Temporada: {time.temporada}</p>
                    </div>
                ))}
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
                    onClose={() => setIsSuccessModalOpen(false)}
                />
            )}

        </div>
    )
}