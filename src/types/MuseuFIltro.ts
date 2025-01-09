export interface MuseuFiltro {
  usuario?: null // Filtro de museus sem vínculo com usuários
  $text?: { $search: string }
  nome?: { $regex: string; $options: string } // Filtro de busca usando índice de texto
}
