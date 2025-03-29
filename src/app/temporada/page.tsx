"use client"

import { useState, useEffect } from "react"
import { iniciarTemporada, getTimes, getJogadores } from "@/api/api"
import { Time } from "@/types/time"
import { TeamChangesForm, TimeChange } from "@/components/TeamChangesForm"
import { PlayerTransferForm, Transferencia } from "@/components/PlayerTransferForm"
import Link from "next/link"

export default function IniciarTemporadaPage() {
  const [times, setTimes] = useState<Time[]>([]);
  const [jogadores, setJogadores] = useState<any[]>([]);
  const [timeChanges, setTimeChanges] = useState<TimeChange[]>([]);
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState("");

  // Estado para temporadas
  const [currentSeason, setCurrentSeason] = useState("2024");
  const [targetSeason, setTargetSeason] = useState("2025");

  // Carregar times e jogadores
  useEffect(() => {
    async function carregarDados() {
      setMessage(""); // Limpar mensagens anteriores
      setLoadingData(true);

      try {
        // Tenta buscar times
        console.log(`Buscando times da temporada ${currentSeason}...`);
        const timesData = await getTimes(currentSeason);
        console.log(`${timesData.length} times encontrados`);
        setTimes(timesData);

        // Se chegou aqui, conseguiu buscar times 
        // Agora tenta buscar jogadores
        console.log(`Buscando jogadores da temporada ${currentSeason}...`);
        const jogadoresData = await getJogadores(currentSeason);
        console.log(`${jogadoresData.length} jogadores encontrados`);
        setJogadores(jogadoresData);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setMessage("Erro ao carregar dados. Verifique se o servidor backend está rodando.");
      } finally {
        setLoadingData(false);
      }
    }

    carregarDados();
  }, [currentSeason]);

  // Função para adicionar alteração de time
  const adicionarAlteracaoTime = (change: TimeChange) => {
    // Verificar se já existe uma alteração para este time
    const index = timeChanges.findIndex(tc => tc.timeId === change.timeId);
    if (index >= 0) {
      // Atualiza a alteração existente
      const updatedChanges = [...timeChanges];
      updatedChanges[index] = { ...updatedChanges[index], ...change };
      setTimeChanges(updatedChanges);
    } else {
      // Adiciona nova alteração
      setTimeChanges([...timeChanges, change]);
    }
  };

  // Função para adicionar transferência
  const adicionarTransferencia = (transferencia: Transferencia) => {
    // Verificar se já existe uma transferência para este jogador
    const index = transferencias.findIndex(t => t.jogadorId === transferencia.jogadorId);
    if (index >= 0) {
      // Atualiza a transferência existente
      const updatedTransfers = [...transferencias];
      updatedTransfers[index] = transferencia;
      setTransferencias(updatedTransfers);
    } else {
      // Adiciona nova transferência
      setTransferencias([...transferencias, transferencia]);
    }
  };

  // Remover alteração de time
  const removerAlteracaoTime = (index: number) => {
    const updatedChanges = [...timeChanges];
    updatedChanges.splice(index, 1);
    setTimeChanges(updatedChanges);
  };

  // Remover transferência
  const removerTransferencia = (index: number) => {
    const updatedTransfers = [...transferencias];
    updatedTransfers.splice(index, 1);
    setTransferencias(updatedTransfers);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      console.log(`Iniciando temporada ${targetSeason} com:`, {
        timeChanges,
        transferencias
      });

      const response = await iniciarTemporada(targetSeason, {
        timeChanges,
        transferencias
      });

      console.log("Resposta:", response);
      setMessage(`Temporada ${targetSeason} iniciada com sucesso! ${response.times} times e ${response.jogadores} jogadores criados.`);

      // Limpar os formulários após sucesso
      setTimeChanges([]);
      setTransferencias([]);
    } catch (error) {
      console.error("Erro ao iniciar temporada:", error);
      setMessage(error instanceof Error
        ? `Erro: ${error.message}`
        : "Erro ao iniciar temporada. Verifique o console para mais detalhes.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-4 overflow-x-hidden bg-[#1C1C24] min-h-screen flex items-center justify-center">
      <p className="text-white text-xl">Carregando dados...</p>
    </div>;
  }

  return (
    <div className="p-4 overflow-x-hidden bg-[#1C1C24] min-h-screen">
      <Link
        href={`/`}
        className="w-44 h-12 font-bold text-lg bg-[#63E300] p-2 text-center rounded-md absolute right-6 top-6 text-black hover:bg-[#50B800] transition-colors"
      >
        Painel de Times
      </Link>
      <Link
        href={`/materia`}
        className="w-52 h-12 font-bold text-lg bg-[#63E300] p-2 text-center rounded-md absolute right-56 top-6 text-black hover:bg-[#50B800] transition-colors"
      >
        Painel de Matérias
      </Link>
      <h1 className="text-4xl font-bold text-white text-center mb-8">Iniciar Temporada {targetSeason}</h1>

      {/* Seleção de temporadas */}
      <div className="mb-8 bg-[#272731] p-6 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Temporada Atual
            </label>
            <select
              value={currentSeason}
              onChange={(e) => setCurrentSeason(e.target.value)}
              className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
              disabled={loading}
            >
              <option value="2024">2024</option>
            </select>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Nova Temporada
            </label>
            <select
              value={targetSeason}
              onChange={(e) => setTargetSeason(e.target.value)}
              className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
              disabled={loading}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mensagem de status */}
      {message && (
        <div className="mb-6 p-4 bg-[#272731] rounded-lg">
          <p className="text-white">{message}</p>
        </div>
      )}

      {/* Form de alterações de times */}
      <TeamChangesForm
        times={times}
        onAddChange={adicionarAlteracaoTime}
      />

      {/* Lista de alterações de times */}
      {timeChanges.length > 0 && (
        <div className="mt-4 bg-[#272731] p-6 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">Alterações Adicionadas</h3>
          <div className="space-y-2">
            {timeChanges.map((change, index) => {
              const time = times.find(t => t.id === change.timeId);
              return (
                <div key={index} className="bg-[#1C1C24] p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-white font-medium">{time?.nome}</span>
                    <ul className="text-gray-400 text-sm mt-1">
                      {change.nome && <li>Nome: {change.nome}</li>}
                      {change.sigla && <li>Sigla: {change.sigla}</li>}
                      {change.cor && <li>Cor: {change.cor}</li>}
                      {change.presidente && <li>Presidente: {change.presidente}</li>}
                      {change.head_coach && <li>Head Coach: {change.head_coach}</li>}
                      {change.coord_ofen && <li>Coord. Ofensivo: {change.coord_ofen}</li>}
                      {change.coord_defen && <li>Coord. Defensivo: {change.coord_defen}</li>}
                    </ul>
                  </div>
                  <button
                    onClick={() => removerAlteracaoTime(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form de transferências de jogadores */}
      <PlayerTransferForm
        jogadores={jogadores}
        times={times}
        onAddTransfer={adicionarTransferencia}
      />

      {/* Lista de transferências */}
      {transferencias.length > 0 && (
        <div className="mt-4 bg-[#272731] p-6 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">Transferências Adicionadas</h3>
          <div className="space-y-2">
            {transferencias.map((transfer, index) => (
              <div key={index} className="bg-[#1C1C24] p-3 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-white font-medium">{transfer.jogadorNome}</span>
                  <div className="text-gray-400 text-sm mt-1">
                    {transfer.timeOrigemNome && (
                      <span>
                        {transfer.timeOrigemNome} → {transfer.novoTimeNome}
                      </span>
                    )}
                    {transfer.novoNumero && (
                      <span className="ml-2">
                        Novo número: {transfer.novoNumero}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removerTransferencia(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão de envio */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#63E300] text-black px-6 py-3 rounded-lg font-medium text-lg hover:bg-[#50B800] transition-colors disabled:bg-gray-600 disabled:text-gray-400"
        >
          {loading ? "Processando..." : `Iniciar Temporada ${targetSeason}`}
        </button>
      </div>
    </div>
  );
}