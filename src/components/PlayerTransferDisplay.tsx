import { Time } from '@/types/time';
import { Transferencia } from './PlayerTransferForm';

interface PlayerTransferDisplayProps {
  transferencias: Transferencia[];
  times: Time[];
  onRemove: (index: number) => void;
}

export function PlayerTransferDisplay({ 
  transferencias, 
  times, 
  onRemove 
}: PlayerTransferDisplayProps) {
  if (transferencias.length === 0) return null;
  
  return (
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
              onClick={() => onRemove(index)}
              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}