"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTimes, getJogadores } from '@/api/api'
import { Time } from '@/types/time'
import { Jogador } from '@/types/jogador'
import Image from 'next/image'

// Interfaces para relatórios
interface Relatorio {
    id: string
    titulo: string
    descricao: string
    executar: (times: Time[], jogadores: Jogador[]) => any
}

export default function DashboardPage() {
    const [times, setTimes] = useState<Time[]>([])
    const [jogadores, setJogadores] = useState<Jogador[]>([])
    const [temporada, setTemporada] = useState("2024")
    const [loading, setLoading] = useState(true)
    const [filtroAtivo, setFiltroAtivo] = useState<string | null>(null)
    const [resultados, setResultados] = useState<any>(null)

    // Buscar dados ao carregar a página
    useEffect(() => {
        async function carregarDados() {
            setLoading(true)
            try {
                const timesData = await getTimes(temporada)
                setTimes(timesData)
                const jogadoresData = await getJogadores(temporada)
                setJogadores(jogadoresData)
            } catch (error) {
                console.error("Erro ao carregar dados:", error)
            } finally {
                setLoading(false)
            }
        }
        carregarDados()
    }, [temporada])

    // Lista de relatórios pré-definidos
    const relatorios: Relatorio[] = [
        {
            id: "jogadores-nacionalidade",
            titulo: "Jogadores por Nacionalidade",
            descricao: "Exibe a quantidade de jogadores por país",
            executar: (times, jogadores) => {
                const nacionalidades: { [key: string]: number } = {}
                jogadores.forEach(jogador => {
                    if (jogador.nacionalidade) {
                        nacionalidades[jogador.nacionalidade] = (nacionalidades[jogador.nacionalidade] || 0) + 1
                    }
                })
                return {
                    tipo: 'tabela',
                    cabecalho: ['Nacionalidade', 'Quantidade'],
                    dados: Object.entries(nacionalidades)
                        .sort((a, b) => b[1] - a[1])
                        .map(([nacionalidade, quantidade]) => [nacionalidade, quantidade]),
                    resumo: `Total de ${jogadores.length} jogadores, sendo ${Object.keys(nacionalidades).length} nacionalidades diferentes.`
                }
            }
        },
        {
            id: "jogadores-posicao-setor",
            titulo: "Jogadores por Posição e Setor",
            descricao: "Exibe a quantidade de jogadores por posição, agrupados por setor",
            executar: (times, jogadores) => {
                const posicoes: { [key: string]: { [key: string]: number } } = {
                    "Ataque": {},
                    "Defesa": {},
                    "Special": {}
                }

                jogadores.forEach(jogador => {
                    if (jogador.posicao && jogador.setor) {
                        if (!posicoes[jogador.setor]) {
                            posicoes[jogador.setor] = {}
                        }
                        posicoes[jogador.setor][jogador.posicao] = (posicoes[jogador.setor][jogador.posicao] || 0) + 1
                    }
                })

                return {
                    tipo: 'tabela-agrupada',
                    grupos: Object.keys(posicoes),
                    dados: Object.entries(posicoes).map(([setor, pos]) => ({
                        nome: setor,
                        itens: Object.entries(pos)
                            .sort((a, b) => b[1] - a[1])
                            .map(([posicao, quantidade]) => ({ nome: posicao, valor: quantidade }))
                    }))
                }
            }
        },
        {
            id: "idade-media",
            titulo: "Idade Média dos Jogadores",
            descricao: "Exibe a idade média dos jogadores por time",
            executar: (times, jogadores) => {
                const idadesPorTime: { [key: string]: { total: number, quantidade: number } } = {}

                jogadores.forEach(jogador => {
                    if (jogador.idade && jogador.timeId) {
                        const time = times.find(t => t.id === jogador.timeId)
                        if (time && time.nome) {
                            if (!idadesPorTime[time.nome]) {
                                idadesPorTime[time.nome] = { total: 0, quantidade: 0 }
                            }
                            idadesPorTime[time.nome].total += jogador.idade
                            idadesPorTime[time.nome].quantidade += 1
                        }
                    }
                })

                const idadeGeral = { total: 0, quantidade: 0 }

                const resultado = Object.entries(idadesPorTime).map(([time, dados]) => {
                    idadeGeral.total += dados.total
                    idadeGeral.quantidade += dados.quantidade
                    return [
                        time,
                        (dados.total / dados.quantidade).toFixed(1),
                        dados.quantidade
                    ]
                }).sort((a, b) => parseFloat(b[1] as string) - parseFloat(a[1] as string))

                return {
                    tipo: 'tabela',
                    cabecalho: ['Time', 'Idade Média', 'Nº de Jogadores'],
                    dados: resultado,
                    resumo: `Idade média geral: ${(idadeGeral.total / idadeGeral.quantidade).toFixed(1)} anos`
                }
            }
        },
        {
            id: "altura-peso-medio",
            titulo: "Altura e Peso Médio por Posição",
            descricao: "Exibe a altura e peso médio dos jogadores por posição",
            executar: (times, jogadores) => {
                const posicoes: { [key: string]: { altura: number, peso: number, quantidade: number } } = {}

                jogadores.forEach(jogador => {
                    if (jogador.posicao && jogador.altura && jogador.peso) {
                        if (!posicoes[jogador.posicao]) {
                            posicoes[jogador.posicao] = { altura: 0, peso: 0, quantidade: 0 }
                        }
                        posicoes[jogador.posicao].altura += jogador.altura
                        posicoes[jogador.posicao].peso += jogador.peso
                        posicoes[jogador.posicao].quantidade += 1
                    }
                })

                return {
                    tipo: 'tabela',
                    cabecalho: ['Posição', 'Altura Média (m)', 'Peso Médio (kg)', 'Quantidade'],
                    dados: Object.entries(posicoes)
                        .filter(([_, dados]) => dados.quantidade > 0)
                        .map(([posicao, dados]) => [
                            posicao,
                            (dados.altura / dados.quantidade).toFixed(2),
                            (dados.peso / dados.quantidade).toFixed(1),
                            dados.quantidade
                        ])
                        .sort((a, b) => parseFloat(b[1] as string) - parseFloat(a[1] as string))
                }
            }
        },
        {
            id: "estatisticas-jogadores",
            titulo: "Top 10 Jogadores por Estatística",
            descricao: "Exibe os jogadores com melhores estatísticas em diversas categorias",
            executar: (times, jogadores) => {
                // Função auxiliar para obter o valor da estatística
                const getEstatistica = (jogador: Jogador, grupo: string, campo: string) => {
                    if (!jogador.estatisticas) return 0
                    // @ts-ignore
                    return jogador.estatisticas[grupo]?.[campo] || 0
                }

                // Categorias de estatísticas para analisar
                const categorias = [
                    { grupo: 'passe', campo: 'jardas_de_passe', titulo: 'Jardas de Passe' },
                    { grupo: 'passe', campo: 'td_passados', titulo: 'Touchdowns Passados' },
                    { grupo: 'corrida', campo: 'jardas_corridas', titulo: 'Jardas Corridas' },
                    { grupo: 'corrida', campo: 'tds_corridos', titulo: 'Touchdowns Corridos' },
                    { grupo: 'recepcao', campo: 'recepcoes', titulo: 'Recepções' },
                    { grupo: 'recepcao', campo: 'jardas_recebidas', titulo: 'Jardas Recebidas' },
                    { grupo: 'defesa', campo: 'tackles_totais', titulo: 'Tackles Totais' },
                    { grupo: 'defesa', campo: 'sacks_forcado', titulo: 'Sacks' }
                ]

                const resultados = categorias.map(categoria => {
                    const top10 = jogadores
                        .filter(j => getEstatistica(j, categoria.grupo, categoria.campo) > 0)
                        .sort((a, b) =>
                            getEstatistica(b, categoria.grupo, categoria.campo) -
                            getEstatistica(a, categoria.grupo, categoria.campo)
                        )
                        .slice(0, 10)
                        .map(j => {
                            const time = times.find(t => t.id === j.timeId)
                            return {
                                jogador: j.nome,
                                time: time?.sigla || 'N/A',
                                valor: getEstatistica(j, categoria.grupo, categoria.campo)
                            }
                        })

                    return {
                        categoria: categoria.titulo,
                        jogadores: top10
                    }
                })

                return {
                    tipo: 'multi-tabela',
                    tabelas: resultados.map(r => ({
                        titulo: `Top 10 - ${r.categoria}`,
                        cabecalho: ['Jogador', 'Time', 'Valor'],
                        dados: r.jogadores.map(j => [j.jogador, j.time, j.valor])
                    }))
                }
            }
        },
        {
            id: "jogadores-por-estado",
            titulo: "Jogadores por Estado",
            descricao: "Exibe a quantidade de jogadores por estado brasileiro",
            executar: (times, jogadores) => {
                const estadosCount: { [key: string]: number } = {}

                jogadores.forEach(jogador => {
                    if (jogador.cidade) {
                        // Extrai o estado do formato "Cidade/UF"
                        const partes = jogador.cidade.split('/')
                        if (partes.length > 1) {
                            const estado = partes[1]
                            estadosCount[estado] = (estadosCount[estado] || 0) + 1
                        }
                    }
                })

                return {
                    tipo: 'tabela',
                    cabecalho: ['Estado', 'Quantidade', 'Porcentagem'],
                    dados: Object.entries(estadosCount)
                        .sort((a, b) => b[1] - a[1])
                        .map(([estado, quantidade]) => [
                            estado,
                            quantidade,
                            ((quantidade / jogadores.length) * 100).toFixed(1) + "%"
                        ])
                }
            }
        }
    ]

    // Executar relatório selecionado
    const executarRelatorio = (id: string) => {
        const relatorio = relatorios.find(r => r.id === id)
        if (relatorio) {
            setFiltroAtivo(id)
            setResultados(relatorio.executar(times, jogadores))
        }
    }

    // Renderização de diferentes tipos de resultados
    const renderizarResultados = () => {
        if (!resultados) return null

        switch (resultados.tipo) {
            case 'tabela':
                return (
                    <div className="bg-[#272731] p-4 rounded-lg">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    {resultados.cabecalho.map((header: string, index: number) => (
                                        <th key={index} className="px-4 py-2 text-left text-white font-medium bg-[#1C1C24] rounded-t-lg">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.dados.map((row: any[], index: number) => (
                                    <tr key={index} className={index % 2 === 0 ? "bg-[#1C1C24]" : "bg-[#26262e]"}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-4 py-2 text-gray-300">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {resultados.resumo && (
                            <div className="mt-4 p-3 text-white bg-[#1C1C24] rounded-lg">
                                {resultados.resumo}
                            </div>
                        )}
                    </div>
                )

            case 'tabela-agrupada':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {resultados.dados.map((grupo: any, index: number) => (
                            <div key={index} className="bg-[#272731] p-4 rounded-lg">
                                <h3 className="text-xl font-bold text-white mb-4">{grupo.nome}</h3>
                                <table className="min-w-full">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-white font-medium bg-[#1C1C24]">Posição</th>
                                            <th className="px-4 py-2 text-left text-white font-medium bg-[#1C1C24]">Quantidade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grupo.itens.map((item: any, itemIndex: number) => (
                                            <tr key={itemIndex} className={itemIndex % 2 === 0 ? "bg-[#1C1C24]" : "bg-[#26262e]"}>
                                                <td className="px-4 py-2 text-gray-300">{item.nome}</td>
                                                <td className="px-4 py-2 text-gray-300">{item.valor}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )

            case 'multi-tabela':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {resultados.tabelas.map((tabela: any, index: number) => (
                            <div key={index} className="bg-[#272731] p-4 rounded-lg">
                                <h3 className="text-xl font-bold text-white mb-4">{tabela.titulo}</h3>
                                <table className="min-w-full">
                                    <thead>
                                        <tr>
                                            {tabela.cabecalho.map((header: string, headerIndex: number) => (
                                                <th key={headerIndex} className="px-4 py-2 text-left text-white font-medium bg-[#1C1C24]">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tabela.dados.map((row: any[], rowIndex: number) => (
                                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-[#1C1C24]" : "bg-[#26262e]"}>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex} className="px-4 py-2 text-gray-300">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )

            default:
                return (
                    <div className="bg-[#272731] p-4 rounded-lg">
                        <pre className="text-white whitespace-pre-wrap">{JSON.stringify(resultados, null, 2)}</pre>
                    </div>
                )
        }
    }

    // Formulário de filtros personalizados
    const renderizarFormularioFiltros = () => {
        return (
            <div className="bg-[#272731] p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Filtros Personalizados</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Form para filtros avançados a ser implementado */}
                    <p className="text-gray-400 col-span-3">
                        Funcionalidade de filtros personalizados em desenvolvimento.
                        Por enquanto, utilize os relatórios pré-definidos abaixo.
                    </p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1C1C24] p-6 flex justify-center items-center">
                <div className="text-white text-xl">Carregando dados...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1C1C24] p-6">
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
                        <h1 className="text-4xl text-[#63E300] font-extrabold italic leading-[55px] tracking-[-3px]">DASHBOARD</h1>
                    </div>
                    <div className='flex'>
                        <div className="flex items-center bg-[#272731] px-3 py-2 rounded-lg">
                            <span className="text-white mr-2">Temporada:</span>
                            <select
                                value={temporada}
                                onChange={(e) => setTemporada(e.target.value)}
                                className="bg-[#1C1C24] text-white px-2 py-1 rounded border border-gray-700"
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


            <div className="mb-6 bg-[#272731] p-4 rounded-lg text-gray-300">
                <p>
                    Utilize esta página para gerar relatórios e insights sobre os times e jogadores do campeonato.
                    Selecione um dos relatórios pré-definidos abaixo ou crie filtros personalizados.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Seção de estatísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#272731] p-4 rounded-lg flex flex-col">
                        <h3 className="text-gray-400 mb-2">Total de Times</h3>
                        <p className="text-3xl font-bold text-white">{times.length}</p>
                    </div>
                    <div className="bg-[#272731] p-4 rounded-lg flex flex-col">
                        <h3 className="text-gray-400 mb-2">Total de Jogadores</h3>
                        <p className="text-3xl font-bold text-white">{jogadores.length}</p>
                    </div>
                    <div className="bg-[#272731] p-4 rounded-lg flex flex-col">
                        <h3 className="text-gray-400 mb-2">Média de Jogadores por Time</h3>
                        <p className="text-3xl font-bold text-white">
                            {times.length > 0 ? Math.round(jogadores.length / times.length) : 0}
                        </p>
                    </div>
                </div>

                {/* Formulário de filtros personalizados */}
                {renderizarFormularioFiltros()}

                {/* Relatórios pré-definidos */}
                <div className="bg-[#272731] p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-white mb-4">Relatórios Pré-definidos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {relatorios.map((relatorio) => (
                            <div
                                key={relatorio.id}
                                onClick={() => executarRelatorio(relatorio.id)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border ${filtroAtivo === relatorio.id
                                    ? 'bg-[#63E300] text-black border-[#63E300]'
                                    : 'bg-[#1C1C24] text-white border-gray-700 hover:border-[#63E300]'
                                    }`}
                            >
                                <h4 className={`font-bold ${filtroAtivo === relatorio.id ? 'text-black' : 'text-white'}`}>
                                    {relatorio.titulo}
                                </h4>
                                <p className={`text-sm mt-1 ${filtroAtivo === relatorio.id ? 'text-black' : 'text-gray-400'}`}>
                                    {relatorio.descricao}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resultados */}
                {filtroAtivo && (
                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-white mb-4">Resultados</h3>
                        {renderizarResultados()}
                    </div>
                )}
            </div>
        </div>
    )
}