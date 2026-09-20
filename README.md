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

### Por que os níveis são difíceis

Solubilidade não basta: o primeiro catálogo fechava rápido demais. O que fazia
o jogo ser fácil era ter **várias soluções** — com duas maneiras de encher o
tabuleiro, qualquer tentativa razoável fecha, e o quebra-cabeça vira exercício
de preencher espaço.

Agora o gerador conta as soluções de cada candidato (busca com poda, parando na
segunda) e procura um de **solução única**, onde cada caminho é forçado. Junto
com isso: pedaço com menos de 4 células é descartado, pedaço reto também, e
ponta colada na outra também. Nível único é raro — cerca de 1 em 10 no 6x6 e
menos nos grandes —, então cada nível tem um orçamento de tempo; se ele acabar,
fica o candidato de menos soluções **já verificado**. Nível não verificado
nunca entra.

Os caminhos que cobrem o tabuleiro saem por "backbite" (inverter o trecho entre
uma ponta e um vizinho dela), não mais por backtracking com Warnsdorff: são
milhares por segundo em vez de um a cada dois segundos, e a busca por solução
única precisa de centenas deles.

Regenerar: `npm run gen:levels` — **leva alguns minutos**, e a semente é fixa,
então o resultado é reprodutível. O log de cada nível (tamanho, cores, soluções)
sai no stderr.

## Comandos

```bash
npm test           # suíte
npm run check      # lint + typecheck + formatação + testes
npm run check:full # o mesmo, com gate de cobertura — porta única pra build
```
