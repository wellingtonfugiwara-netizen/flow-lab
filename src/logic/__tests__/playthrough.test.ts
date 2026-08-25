import { beginStroke, createInitialState, endStroke, extendStroke, isSolved } from '../engine';
import { LEVELS } from '../levels';
import { solve } from '../solver';
import type { Cell, GameState } from '../types';

/**
 * Teste de ponta a ponta da REGRA, não da tela.
 *
 * Pega a solução que o solver encontra e a reproduz através das mesmas três
 * operações que o gesto da interface dispara — encostar, arrastar, soltar. Se
 * um nível é resolvível na teoria mas não dá para desenhá-lo com esses
 * comandos, o jogo estaria quebrado mesmo com todo o resto passando. É essa
 * lacuna entre "tem solução" e "dá para jogar" que este teste fecha.
 */

/** Reproduz um caminho como o dedo faria: toca a ponta e arrasta célula a célula. */
function drawPath(state: GameState, path: readonly Cell[]): GameState {
  let s = beginStroke(state, path[0]);
  for (const cell of path.slice(1)) s = extendStroke(s, cell);
  return endStroke(s);
}

describe.each(LEVELS.map((l) => [l.id, l] as const))('nível %s é jogável', (_id, level) => {
  it('fecha ao desenhar a solução com os gestos da interface', () => {
    const solution = solve(level);
    expect(solution.solved).toBe(true);

    let state = createInitialState(level);
    for (const color of Object.keys(solution.paths)) {
      state = drawPath(state, solution.paths[color]);
    }

    expect(isSolved(state)).toBe(true);
    // Um traço por cor, nenhum desperdiçado.
    expect(state.moves).toBe(level.pairs.length);
    expect(state.activeColor).toBeNull();
  });
});
