// components/PlayerTransferForm.tsx
import { useState, useEffect } from 'react';
import { Time } from '@/types/time';
import { Jogador } from '@/types/jogador';

interface PlayerTransferFormProps {
  jogadores: Jogador[];
  times: Time[];
  onAddTransfer: (transfer: Transferencia) => void;
}

export interface Transferencia {
  jogadorId: number;
  jogadorNome?: string;
  timeOrigemId?: number;
  timeOrigemNome?: string;
  novoTimeId: number;
  novoTimeNome?: string;
  novoNumero?: number;
  novaCamisa?: string;
}

export function PlayerTransferForm({ jogadores, times, onAddTransfer }: PlayerTransferFormProps) {
  const [selectedJogador, setSelectedJogador] = useState<Jogador | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedNovoTime, setSelectedNovoTime] = useState<string>('');
  const [novoNumero, setNovoNumero] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  // Filtrar jogadores com base no termo de busca
  const filteredJogadores = searchTerm 
    ? jogadores.filter(jogador => 
        jogador.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jogador.posicao?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  const handleSelectJogador = (jogador: Jogador) => {
    setSelectedJogador(jogador);
    setSearchTerm(jogador.nome || '');
    setShowDropdown(false);
  };
  
  const handleSubmit = () => {
    if (!selectedJogador || !selectedNovoTime) return;
    
    const novoTime = times.find(t => t.id === Number(selectedNovoTime));
    if (!novoTime || selectedJogador.timeId === Number(selectedNovoTime)) return;
    
    const timeOrigem = times.find(t => t.id === selectedJogador.timeId);
    
    const transferencia: Transferencia = {
      jogadorId: selectedJogador.id || 0,
      jogadorNome: selectedJogador.nome,
      timeOrigemId: selectedJogador.timeId,
      timeOrigemNome: timeOrigem?.nome,
      novoTimeId: Number(selectedNovoTime),
      novoTimeNome: novoTime.nome,
      novoNumero: novoNumero ? Number(novoNumero) : undefined
    };
    
    onAddTransfer(transferencia);
    
    // Reset
    setSelectedJogador(null);
    setSearchTerm('');
    setSelectedNovoTime('');
    setNovoNumero('');
  };
  
  // Fechar o dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="mb-8 bg-[#272731] p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Transferências de Jogadores</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Input de busca ao invés de select para jogadores */}
        <div className="relative">
          <label className="block text-white text-sm font-medium mb-2">
            Buscar Jogador
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
              if (!e.target.value) {
                setSelectedJogador(null);
              }
            }}
            onFocus={(e) => {
              e.stopPropagation();
              setShowDropdown(true);
            }}
            className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
            placeholder="Digite o nome do jogador..."
          />
          
          {/* Lista de jogadores filtrados */}
          {showDropdown && searchTerm && (
            <div 
              className="absolute z-10 mt-1 w-full bg-[#1C1C24] border border-gray-700 rounded-lg max-h-60 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {filteredJogadores.length === 0 ? (
                <div className="px-3 py-2 text-gray-400">Nenhum jogador encontrado</div>
              ) : (
                filteredJogadores.map(jogador => {
                  const time = times.find(t => t.id === jogador.timeId);
                  return (
                    <div
                      key={jogador.id}
                      className="px-3 py-2 hover:bg-[#272731] cursor-pointer text-white"
                      onClick={() => handleSelectJogador(jogador)}
                    >
                      {jogador.nome} ({jogador.posicao}) - {time?.sigla}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        
        {/* Seleção de novo time */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Novo Time
          </label>
          <select
            value={selectedNovoTime}
            onChange={(e) => setSelectedNovoTime(e.target.value)}
            className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
            disabled={!selectedJogador}
          >
            <option value="">Selecione...</option>
            {times
              .filter(time => !selectedJogador || time.id !== selectedJogador.timeId)
              .map((time) => (
                <option key={time.id} value={time.id}>
                  {time.nome} ({time.sigla})
                </option>
              ))}
          </select>
        </div>
        
        {/* Novo número */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Novo Número (opcional)
          </label>
          <input
            type="number"
            value={novoNumero}
            onChange={(e) => setNovoNumero(e.target.value)}
            className="w-full px-3 py-2 bg-[#1C1C24] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#63E300]"
            disabled={!selectedJogador || !selectedNovoTime}
            placeholder="Número na camisa"
          />
        </div>
      </div>
      
      {/* Informações do jogador selecionado */}
      {selectedJogador && (
        <div className="bg-[#1C1C24] p-4 rounded-lg mb-4">
          <h3 className="text-white font-medium mb-2">Jogador Selecionado</h3>
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-300">
            <div>Nome: {selectedJogador.nome}</div>
            <div>Posição: {selectedJogador.posicao}</div>
            <div>
              Time Atual: {times.find(t => t.id === selectedJogador.timeId)?.nome}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!selectedJogador || !selectedNovoTime}
          className="bg-[#63E300] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#50B800] transition-colors disabled:bg-gray-600 disabled:text-gray-400"
        >
          Adicionar Transferência
        </button>
      </div>
    </div>
  );
}