export interface MuseuFiltro {
  usuario?: null // Filtro de museus sem vínculo com usuários
  $text?: { $search: string } // Filtro de busca usando índice de texto
}
