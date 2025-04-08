export const estatisticasGroups = [
    {
        id: 'passe',
        title: 'Passe',
        fields: [
            { id: "passes_completos", label: "PASSES COMPLETOS" },
            { id: "passes_tentados", label: "PASSES TENTADOS" },
            { id: "jardas_de_passe", label: "JARDAS DE PASSE" },
            { id: "td_passados", label: "TD PASSADOS" },
            { id: "interceptacoes_sofridas", label: "INTERCEPTAÇÕES SOFRIDAS" },
            { id: "sacks_sofridos", label: "SACKS SOFRIDOS" },
            { id: "fumble_de_passador", label: "FUMBLE DE PASSADOR" },
        ]
    },
    {
        id: 'corrida',
        title: 'Corrida',
        fields: [
            { id: "corridas", label: "CORRIDAS" },
            { id: "jardas_corridas", label: "JARDAS CORRIDAS" },
            { id: "tds_corridos", label: "TDS CORRIDOS" },
            { id: "fumble_de_corredor", label: "FUMBLE DE CORREDOR" },
        ]
    },
    {
        id: 'recepcao',
        title: 'Recepção',
        fields: [
            { id: "recepcoes", label: "RECEPÇÕES" },
            { id: "alvo", label: "ALVO" },
            { id: "jardas_recebidas", label: "JARDAS RECEBIDAS" },
            { id: "tds_recebidos", label: "TDS RECEBIDOS" },
        ]
    },
    {
        id: 'retorno',
        title: 'Retorno',
        fields: [
            { id: "retornos", label: "RETORNOS" },
            { id: "jardas_retornadas", label: "JARDAS RETORNADAS" },
            { id: "td_retornados", label: "TD RETORNADOS" },
        ]
    },
    {
        id: 'defesa',
        title: 'Defesa',
        fields: [
            { id: "tackles_totais", label: "TACKLES TOTAIS" },
            { id: "tackles_for_loss", label: "TACKLES FOR LOSS" },
            { id: "sacks_forcado", label: "SACKS FORÇADO" },
            { id: "fumble_forcado", label: "FUMBLE FORÇADO" },
            { id: "interceptacao_forcada", label: "INTERCEPTAÇÃO FORÇADA" },
            { id: "passe_desviado", label: "PASSE DESVIADO" },
            { id: "safety", label: "SAFETY" },
            { id: "td_defensivo", label: "TD DEFENSIVO" },
        ]
    },
    {
        id: 'kicker',
        title: 'Kicker',
        fields: [
            { id: "xp_bons", label: "XP BONS" },
            { id: "tentativas_de_xp", label: "TENTATIVAS DE XP" },
            { id: "fg_bons", label: "FG BONS" },
            { id: "tentativas_de_fg", label: "TENTATIVAS DE FG" },
            { id: "fg_mais_longo", label: "FG MAIS LONGO" },
        ]
    },
    {
        id: 'punter',
        title: 'Punter',
        fields: [
            { id: "punts", label: "PUNTS" },
            { id: "jardas_de_punt", label: "JARDAS DE PUNT" },
        ]
    }
];