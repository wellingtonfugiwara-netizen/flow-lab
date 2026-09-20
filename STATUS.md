# Status — Flow Lab

Atualizado em **20/09/2026**. Este arquivo é a primeira leitura de uma sessão
nova. O terceiro jogo da NIOL: ligar os pares de cor com caminhos que não se
cruzam, até não sobrar célula vazia. As duas condições, não só a primeira — é
isso que faz dele um quebra-cabeça e não um exercício de ligar pontos.

## Regras que não se negociam

- 🚫 **Nada da NIOL com a conta corporativa.** Conta:
  `wellington.fugiwara@gmail.com`.
- 📁 Trabalho só dentro de `C:\Users\wfugi\IA\NIOL LAB`.
- Nunca usar `--no-verify`, nunca pular hook.

## Onde o app está

| | |
| --- | --- |
| Versão | 0.1.0 — **em desenvolvimento, já jogável** |
| Lojas | **não publicado**, sem conta de loja, sem ícone, sem anúncios |
| Pacote (reservado no código) | `com.niol.flowlab` |
| Stack | Expo SDK **57**, RN 0.86, React 19.2, TypeScript 6 |
| Branch | `main` (em `eedbe90`) |
| Testes | 112, e o `check` completo passa |

⚠️ **Este é o único app no SDK 57.** Block Lab e Sudoku Lab estão no 54 de
propósito: os dois têm versão em análise nas lojas, e trocar o React Native
embaixo de um app em revisão é risco à toa. Aqui subimos porque o Expo Go da
loja só roda o SDK da vez, e sem isso não dá para testar no celular.

## O que já existe

- `src/logic/` — motor, solver e catálogo. **Sem React, 100% testado.**
- `src/ui/geometry.ts` — conversão entre o dedo e a grade. Puro e testado.
- `src/storage/progress.ts` — progresso no aparelho; único ponto de acesso ao
  AsyncStorage.
- `src/components/` e `src/screens/` — tabuleiro, HUD, lista de níveis e jogo.
- Duas telas ligadas por `useState` no `App.tsx`.

**Uma dependência além do Expo:** `async-storage`. O gesto é `PanResponder`,
que já vem no React Native — arrastar sobre uma grade não justifica
`gesture-handler` + `reanimated`, e navegação de biblioteca custaria cinco
pacotes para duas telas. Quando aparecer a terceira tela, vale reavaliar.

## Catálogo de níveis

9 níveis, de 5×5 com 4 cores a 9×9 com 9 cores. Seis têm **solução única**; o
7-1, o 8-1 e o 9-1 ficaram com duas ou mais.

O que torna um nível difícil aqui **não é o tamanho, é o número de soluções**:
com duas maneiras de encher o tabuleiro, qualquer tentativa razoável fecha. O
gerador conta as soluções de cada candidato e procura os de solução única; se o
orçamento de tempo acabar, fica o de menos soluções **já verificado** — nível
não conferido nunca entra.

`npm run gen:levels` **leva alguns minutos** e o relatório sai no stderr. A
semente é fixa: rodar de novo dá exatamente os mesmos níveis.

## Em aberto

| O quê | Observação |
| --- | --- |
| Som | nada ainda |
| Animação ao fechar o nível | hoje só aparece o painel |
| Ícone e identidade visual | não existe |
| Anúncios e consentimento | não existe; quando entrar, copiar o padrão do Sudoku (diálogo antes do vídeo) |
| Mais níveis | 10×10, ou deixar o gerador procurar mais tempo para ter solução única nos grandes |
| Publicação | nenhuma conta de loja criada para este pacote |

## Coisas que não são óbvias no código

- **O dedo corre mais que os eventos do gesto.** Entre dois avisos do
  `PanResponder` ele pode ter pulado três células. Quem completa o caminho é o
  `setState` do `GameScreen`, que enxerga a ponta **atual** — fazer essa conta
  no componente lê a ponta do render anterior e o traço falha no arrasto
  rápido. O motor corta e encurta caminhos sozinho, então essa diferença
  importa.
- **Zona morta de 18% na borda da célula** (`pointToCell`): sem ela, o arrasto
  em diagonal encosta de raspão na vizinha e o caminho ganha degraus. No toque
  inicial a margem é zero, senão encostar na beirada do ponto fixo não valeria.
- **O eslint do SDK 57 tem as regras do React Compiler**: não pode ler ref
  durante o render nem chamar `setState` dentro de efeito. Foi uma dessas
  regras que revelou o bug do traço acima.
- **TypeScript 6 não inclui `@types/*` sozinho** — daí o `"types"` explícito no
  `tsconfig.json`; sem ele os testes rodam e o `tsc` reprova.
- **Ponto fixo de par fechado ganha miolo escuro**, para ver o que falta sem
  conferir cor por cor.

## Comandos

```bash
npx expo start      # QR pro Expo Go
npm run check       # lint + typecheck + formatação + testes
npm run check:full  # o mesmo, com cobertura da lógica
npm run gen:levels  # regera o catálogo (minutos)
npx expo export     # valida o bundle; pega o que o jest não pega
```
