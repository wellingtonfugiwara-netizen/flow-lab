# Flow Lab

Terceiro jogo do estúdio NIOL. Ligue os pares de cor com caminhos que não se
cruzam, até não sobrar espaço vazio no tabuleiro.

## Estado

Em desenvolvimento, já jogável. Duas telas: lista de níveis e jogo.

- `src/logic/` — motor do jogo, solver e níveis. **100% testado, sem React.**
- `src/ui/` — conversão entre o dedo e a grade (puro, testado).
- `src/storage/` — progresso no aparelho; único ponto de acesso ao AsyncStorage.
- `src/components/`, `src/screens/` — tabuleiro, HUD e as duas telas.
- `src/themes/` — tokens e paleta.

O gesto usa `PanResponder`, que já vem no React Native: arrastar sobre uma grade
não justifica `gesture-handler` + `reanimated`. A navegação é um `useState` em
`App.tsx` pelo mesmo motivo. Falta: som, animação de nível fechado, mais níveis,
anúncios e ícone.

## Como os níveis são feitos

Nível impossível é o pior defeito num jogo assim: o jogador tenta, não
consegue, e conclui que a culpa é dele. Por isso a solubilidade é garantida em
duas camadas independentes:

1. `scripts/gen-levels.js` constrói cada nível a partir de um caminho que
   cobre o tabuleiro inteiro, cortado em pedaços — a solução existe por
   construção.
2. `src/logic/solver.ts` roda um busca exaustiva em cima do resultado, nos
   testes, e prova de novo que fecha.

Regenerar: `npm run gen:levels` (a semente é fixa, o resultado é reprodutível).

## Comandos

```bash
npm test           # suíte
npm run check      # lint + typecheck + formatação + testes
npm run check:full # o mesmo, com gate de cobertura — porta única pra build
```
