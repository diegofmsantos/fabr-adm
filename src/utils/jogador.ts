export const jogadorGroups = [
    {
        title: "Informações Básicas",
        fields: [
            { name: "nome", label: "Nome", type: "text" },
            { name: "timeFormador", label: "Time Formador", type: "text" },
            { name: "posicao", label: "Posição", type: "text" },
            { name: "setor", label: "Setor", type: "select", options: ["Ataque", "Defesa", "Special"] },
            { name: "experiencia", label: "Experiência", type: "number" },
        ]
    },
    {
        title: "Localização",
        fields: [
            { name: "cidade", label: "Cidade", type: "text" },
            { name: "nacionalidade", label: "Nacionalidade", type: "text" }
        ]
    },
    {
        title: "Redes Sociais",
        fields: [
            { name: "instagram", label: "Instagram", type: "text" },
            { name: "instagram2", label: "@", type: "text" }
        ]
    },
    {
        title: "Identificação",
        fields: [
            { name: "camisa", label: "Camisa", type: "text" },
            { name: "numero", label: "Número", type: "number" }
        ]
    },
    {
        title: "Atributos Físicos",
        fields: [
            { name: "idade", label: "Idade", type: "number" },
            { name: "altura", label: "Altura (m)", type: "text" },
            { name: "peso", label: "Peso (kg)", type: "number" }
        ]
    }
];