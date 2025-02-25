import { z } from 'zod'
import { JogadorSchema } from './Jogador'

export const TitulosSchema = z.object({
  nacionais: z.string().optional(),
  conferencias: z.string().optional(),
  estaduais: z.string().optional(),
})

export const TimeSchema = z.object({
  id: z.number().optional(),
  nome: z.string(),
  temporada: z.string(),
  sigla: z.string(),
  cor: z.string(),
  cidade: z.string(),
  bandeira_estado: z.string(),
  fundacao: z.string(),
  logo: z.string(),
  capacete: z.string(),
  instagram: z.string(),
  instagram2: z.string(),
  estadio: z.string(),
  presidente: z.string(),
  head_coach: z.string(),
  instagram_coach: z.string().optional(),
  coord_ofen: z.string(),
  coord_defen: z.string(),
  titulos: z.array(TitulosSchema).optional(),
  jogadores: z.array(JogadorSchema).optional(),
})
