export type Estatisticas = {
    passe: {
        passes_completos: number
        passes_tentados: number
        jardas_de_passe: number
        td_passados: number
        interceptacoes_sofridas: number
        sacks_sofridos: number
        fumble_de_passador: number
    }
    corrida: {
        corridas: number
        jardas_corridas: number
        tds_corridos: number
        fumble_de_corredor: number
    }
    recepcao: {
        recepcoes: number
        alvo: number
        jardas_recebidas: number
        tds_recebidos: number
        fumble_de_recebedor: number
    }
    retorno: {
        retornos: number
        jardas_retornadas: number
        td_retornados: number
        fumble_retornador: number
    }
    defesa: {
        tackles_totais: number
        tackles_for_loss: number
        sacks_forcado: number
        fumble_forcado: number
        interceptacao_forcada: number
        passe_desviado: number
        safety: number
        td_defensivo: number
    }
    kicker: {
        xp_bons: number
        tentativas_de_xp: number
        fg_bons: number
        tentativas_de_fg: number
        fg_mais_longo: number
        fg_0_10: string
        fg_11_20: string
        fg_21_30: string
        fg_31_40: string
        fg_41_50: string
    }
    punter: {
        punts: number
        jardas_de_punt: number
    }
}

export type Jogador = {
    id: number
    nome: string
    time: string
    timeId: number
    posicao: string
    setor: "Ataque" | "Defesa" | "Special"
    experiencia: number
    numero: number
    idade: number
    altura: number
    peso: number
    instagram: string,
    instagram2: string
    cidade: string
    nacionalidade: string
    camisa: string
    estatisticas?: Estatisticas
}
