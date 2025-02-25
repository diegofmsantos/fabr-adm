import { useState } from "react";
import { atualizarJogador, deletarJogador } from "@/api/api";
import { Estatisticas, Jogador } from "@/types/jogador";

export default function ModalJogador({
    jogador,
    closeModal,
}: {
    jogador: Jogador;
    closeModal: () => void;
}) {
    const [formData, setFormData] = useState({
        ...jogador,
        // Tratamos altura como string no formulário
        altura: jogador.altura !== undefined ? String(jogador.altura).replace(".", ",") : "",
        // Incluímos temporada do relacionamento para o formulário
        temporada: jogador.times?.[0]?.temporada || "2024",
        estatisticas: jogador.estatisticas || { /* valores padrão */ }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            // Definir o tipo corretamente aqui para evitar o erro
            const estatisticas = { ...prev.estatisticas } as Estatisticas;

            // Inicializar grupo se não existir
            if (!estatisticas[groupKey]) { // @ts-ignore
                estatisticas[groupKey] = {};
            }

            // Definir o valor no campo apropriado
            if (groupKey === "kicker" && fieldKey.startsWith("fg")) {
                // @ts-ignore - Para valores como "1/1"
                estatisticas[groupKey][fieldKey] = value;
            } else {
                // @ts-ignore - Para valores numéricos
                estatisticas[groupKey][fieldKey] = value === "" ? 0 : Number(value);
            }

            return { ...prev, estatisticas };
        });
    };

    const handleSave = async () => {
        try {
            // Crie um objeto intermediário para evitar problemas de tipo
            const parsedValues = {
                altura: parseFloat(String(formData.altura).replace(",", ".")),
                peso: Number(formData.peso),
                idade: Number(formData.idade),
                experiencia: Number(formData.experiencia),
                numero: Number(formData.numero)
            };

            // Então crie o objeto final a ser enviado
            const dataToSave = {
                ...formData,
                ...parsedValues, // Sobrescreve os valores com as versões numéricas
            };

            // Criar um objeto específico para enviar à API
            const apiData = {
                ...dataToSave,
                id: jogador.id,
                timeId: jogador.timeId,
                temporada: formData.temporada || "2024"
            };

            // Enviar para a API
            await atualizarJogador(apiData);

            alert("Jogador atualizado com sucesso!");
            closeModal();
        } catch (error) {
            console.error("Erro ao atualizar jogador:", error);
            alert("Erro ao salvar alterações.");
        }
    };

    const handleDelete = async () => {
        try {
            const confirmDelete = confirm("Tem certeza que deseja excluir este jogador?");
            if (!confirmDelete) return;

            // Usar a função reutilizável para deletar jogador
            await deletarJogador(jogador.id);
            alert("Jogador excluído com sucesso!");
            closeModal();
        } catch (error) {
            console.error("Erro ao excluir jogador:", error);
            alert("Erro ao excluir jogador. Verifique os logs para mais detalhes.");
        }
    };

    const estatisticasOrdem = {
        passe: ["passes_completos", "passes_tentados", "jardas_de_passe", "td_passados", "interceptacoes_sofridas", "sacks_sofridos", "fumble_de_passador"],
        corrida: ["corridas", "jardas_corridas", "tds_corridos", "fumble_de_corredor"],
        recepcao: ["recepcoes", "alvo", "jardas_recebidas", "tds_recebidos"],
        retorno: ["retornos", "jardas_retornadas", "td_retornados"],
        defesa: ["tackles_totais", "tackles_for_loss", "sacks_forcado", "fumble_forcado", "interceptacao_forcada", "passe_desviado", "safety", "td_defensivo"],
        kicker: ["xp_bons", "tentativas_de_xp", "fg_bons", "tentativas_de_fg", "fg_mais_longo"],
        punter: ["punts", "jardas_de_punt"],
    };


    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-[#272731] p-6 rounded-lg w-2/3 h-[90vh] relative flex flex-col">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    onClick={closeModal}
                >
                    ✖
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Editar Jogador</h2>

                <div className="overflow-y-auto flex-grow">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Nome</label>
                            <input
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                placeholder="Nome do Jogador"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Time Formador</label>
                            <input
                                name="timeFormador"
                                value={formData.timeFormador}
                                onChange={handleChange}
                                placeholder="Time Formador"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Posição</label>
                            <input
                                name="posicao"
                                value={formData.posicao}
                                onChange={handleChange}
                                placeholder="Posição"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Setor</label>
                            <select
                                name="setor"
                                value={formData.setor}
                                onChange={(e) => setFormData((prev) => ({ ...prev, setor: e.target.value as "Ataque" | "Defesa" | "Special" }))}
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            >
                                <option value="">Selecione uma opção</option>
                                <option value="Ataque">Ataque</option>
                                <option value="Defesa">Defesa</option>
                                <option value="Special">Special</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Cidade</label>
                            <input
                                name="cidade"
                                value={formData.cidade}
                                onChange={handleChange}
                                placeholder="Cidade"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Nacionalidade</label>
                            <input
                                name="nacionalidade"
                                value={formData.nacionalidade}
                                onChange={handleChange}
                                placeholder="Nacionalidade"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Instagram</label>
                            <input
                                name="instagram"
                                value={formData.instagram}
                                onChange={handleChange}
                                placeholder="Instagram"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">@</label>
                            <input
                                name="instagram2"
                                value={formData.instagram2}
                                onChange={handleChange}
                                placeholder="@"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Camisa</label>
                            <input
                                name="camisa"
                                value={formData.camisa}
                                onChange={handleChange}
                                placeholder="Camisa"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Experiência</label>
                            <input
                                name="experiencia"
                                value={formData.experiencia}
                                onChange={handleChange}
                                placeholder="Experiência"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Número</label>
                            <input
                                name="numero"
                                value={formData.numero}
                                onChange={handleChange}
                                placeholder="Número"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Idade</label>
                            <input
                                name="idade"
                                value={formData.idade}
                                onChange={handleChange}
                                placeholder="Idade"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Altura</label>
                            <input
                                name="altura"
                                value={formData.altura}
                                onChange={handleChange}
                                placeholder="Altura (ex: 1.75 ou 1,75)"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Peso</label>
                            <input
                                name="peso"
                                value={formData.peso}
                                onChange={handleChange}
                                placeholder="Peso"
                                className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                            />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4">Estatísticas</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(estatisticasOrdem).map(([group, fields]) => (
                            <div key={group} className="bg-[#1C1C24] border border-gray-700 rounded-lg p-4">
                                <h4 className="text-lg font-bold text-white mb-4 capitalize">{group}</h4>
                                {fields.map((field) => (
                                    <div key={field} className="mb-3">
                                        <label className="block text-gray-300 text-sm font-medium mb-1">
                                            {field.replace(/_/g, " ").toUpperCase()}
                                        </label>
                                        <input
                                            type="text"
                                            name={`${group}.${field}`} //@ts-ignore
                                            value={formData.estatisticas[group]?.[field] ?? 0}
                                            onChange={handleStatisticChange}
                                            className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Excluir
                    </button>
                    <div className="space-x-3">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Fechar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-[#63E300] text-black rounded-lg hover:bg-[#50B800] transition-colors"
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}