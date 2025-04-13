import { Time } from '@/types/time';
import { TimeChange } from './TeamChangesForm';

interface TeamChangesDisplayProps {
  timeChanges: TimeChange[];
  times: Time[];
  onRemove: (index: number) => void;
}

export function TeamChangesDisplay({ timeChanges, times, onRemove }: TeamChangesDisplayProps) {
  if (timeChanges.length === 0) return null;
  
  return (
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
                  {change.instagram && <li>Instagram: {change.instagram}</li>}
                  {change.instagram2 && <li>@:: {change.instagram2}</li>}
                  {change.logo && <li>Logo: {change.logo}</li>}
                  {change.presidente && <li>Presidente: {change.presidente}</li>}
                  {change.head_coach && <li>Head Coach: {change.head_coach}</li>}
                  {change.coord_ofen && <li>Coord. Ofensivo: {change.coord_ofen}</li>}
                  {change.coord_defen && <li>Coord. Defensivo: {change.coord_defen}</li>}
                </ul>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
              >
                Remover
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}