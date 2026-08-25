# Flow Lab

Quarto jogo do estúdio NIOL. Ligue os pares de cor com caminhos que não se
cruzam, até não sobrar espaço vazio no tabuleiro.

## Estado

**Jogável.** 8 níveis, de 5×5 a 7×7, com progresso salvo no aparelho.

- `src/logic/` — motor, solver, níveis e progresso. Puro, sem React.
- `src/components/Board.tsx` — tabuleiro e leitura do gesto.
- `src/screens/` — seleção de níveis e partida.
- `src/storage/` — gravação em disco.

## A regra que define o gênero

Um nível **não fecha só por ligar todos os pares** — também não pode sobrar
célula vazia. É essa segunda condição que transforma o jogo num quebra-cabeça
em vez de um exercício de ligar pontos.

## Como os níveis são feitos

Nível impossível é o pior defeito num jogo assim: o jogador tenta, não
consegue, e conclui que a culpa é dele. Por isso a solubilidade é garantida em
três camadas independentes:

1. `scripts/gen-levels.js` monta cada nível a partir de um caminho que cobre o
   tabuleiro inteiro, cortado em pedaços — a solução existe por construção.
2. `src/logic/solver.ts` faz busca exaustiva por cima do resultado, nos testes,
   e prova de novo que fecha.
3. `playthrough.test.ts` pega essa solução e a reproduz pelos mesmos comandos
   que o dedo dispara, fechando a lacuna entre "tem solução" e "dá para jogar".

Regenerar: `npm run gen:levels` (semente fixa, resultado reproduzível).

## Comandos

```bash
npm start          # Expo
npm test           # suíte
npm run check      # lint + typecheck + formatação + testes
npm run check:full # o mesmo, com gate de cobertura — porta única pra build
```

## Ramos

Git Flow: `main` só recebe release, o trabalho sai de `develop` em ramos
`feature/`.
