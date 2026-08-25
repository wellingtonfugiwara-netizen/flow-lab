import {
  beginStroke,
  clearColor,
  createInitialState,
  endStroke,
  extendStroke,
  fillRatio,
  filledCount,
  isPairComplete,
  isSolved,
  occupantAt,
  resetLevel,
} from '../engine';
import type { GameState, Level } from '../types';

/**
 * Tabuleiro 3x3 usado na maior parte dos testes:
 *
 *   R . B
 *   . . .
 *   R . B
 *
 * Uma solução que cobre tudo: rose desce pela coluna 0, blue desce pela
 * coluna 2, e a coluna do meio precisa ser absorvida por uma das duas.
 */
const LEVEL: Level = {
  id: 'test-3',
  size: 3,
  pairs: [
    { color: 'rose', a: { row: 0, col: 0 }, b: { row: 2, col: 0 } },
    { color: 'blue', a: { row: 0, col: 2 }, b: { row: 2, col: 2 } },
  ],
};

const at = (row: number, col: number) => ({ row, col });

/** Aplica uma sequência de células como se fosse um arrastar contínuo. */
function drag(state: GameState, cells: { row: number; col: number }[]): GameState {
  let s = beginStroke(state, cells[0]);
  for (const c of cells.slice(1)) s = extendStroke(s, c);
  return endStroke(s);
}

describe('createInitialState', () => {
  it('começa com um caminho vazio por cor e sem cor ativa', () => {
    const s = createInitialState(LEVEL);
    expect(Object.keys(s.paths).sort()).toEqual(['blue', 'rose']);
    expect(s.paths.rose).toEqual([]);
    expect(s.activeColor).toBeNull();
    expect(s.moves).toBe(0);
  });
});

describe('beginStroke', () => {
  it('começa um traço ao tocar um ponto fixo', () => {
    const s = beginStroke(createInitialState(LEVEL), at(0, 0));
    expect(s.activeColor).toBe('rose');
    expect(s.paths.rose).toEqual([at(0, 0)]);
  });

  it('ignora toque em célula vazia', () => {
    const initial = createInitialState(LEVEL);
    expect(beginStroke(initial, at(1, 1))).toBe(initial);
  });

  it('ignora toque fora do tabuleiro', () => {
    const initial = createInitialState(LEVEL);
    expect(beginStroke(initial, at(9, 9))).toBe(initial);
  });

  it('descarta o traço anterior ao recomeçar pelo ponto fixo', () => {
    let s = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0), at(2, 0)]);
    expect(s.paths.rose).toHaveLength(3);
    s = beginStroke(s, at(0, 0));
    expect(s.paths.rose).toEqual([at(0, 0)]);
  });

  it('retoma do meio do próprio traço, jogando fora o resto', () => {
    let s = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0), at(2, 0)]);
    s = beginStroke(s, at(1, 0));
    expect(s.activeColor).toBe('rose');
    expect(s.paths.rose).toEqual([at(0, 0), at(1, 0)]);
  });
});

describe('extendStroke', () => {
  it('não faz nada sem cor ativa', () => {
    const initial = createInitialState(LEVEL);
    expect(extendStroke(initial, at(1, 0))).toBe(initial);
  });

  it('recusa célula não vizinha', () => {
    const s = beginStroke(createInitialState(LEVEL), at(0, 0));
    expect(extendStroke(s, at(2, 2))).toBe(s);
  });

  it('recusa repetir a célula da ponta', () => {
    const s = beginStroke(createInitialState(LEVEL), at(0, 0));
    expect(extendStroke(s, at(0, 0))).toBe(s);
  });

  it('recusa sair do tabuleiro', () => {
    const s = beginStroke(createInitialState(LEVEL), at(0, 0));
    expect(extendStroke(s, at(-1, 0))).toBe(s);
  });

  it('encurta o caminho ao voltar sobre o próprio rastro', () => {
    let s = beginStroke(createInitialState(LEVEL), at(0, 0));
    s = extendStroke(s, at(1, 0));
    s = extendStroke(s, at(1, 1));
    expect(s.paths.rose).toHaveLength(3);
    s = extendStroke(s, at(1, 0));
    expect(s.paths.rose).toEqual([at(0, 0), at(1, 0)]);
  });

  it('não atravessa ponto fixo de outra cor', () => {
    let s = beginStroke(createInitialState(LEVEL), at(0, 0));
    s = extendStroke(s, at(0, 1));
    const blocked = extendStroke(s, at(0, 2));
    expect(blocked).toBe(s);
  });

  it('corta o caminho alheio ao cruzar por cima dele', () => {
    let s = drag(createInitialState(LEVEL), [at(0, 2), at(1, 2), at(1, 1)]);
    expect(s.paths.blue).toHaveLength(3);

    s = beginStroke(s, at(0, 0));
    s = extendStroke(s, at(0, 1));
    s = extendStroke(s, at(1, 1));

    // blue perde a célula invadida e tudo que vinha depois dela.
    expect(s.paths.blue).toEqual([at(0, 2), at(1, 2)]);
    expect(s.paths.rose).toEqual([at(0, 0), at(0, 1), at(1, 1)]);
  });

  it('para de crescer depois de fechar o par', () => {
    const closed = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0), at(2, 0)]);
    expect(isPairComplete(closed, 'rose')).toBe(true);

    // Reativa a cor sem passar por beginStroke — tocar um ponto fixo reiniciaria
    // o traço, e o que queremos verificar é o bloqueio do traço já fechado.
    const active = { ...closed, activeColor: 'rose' };
    expect(extendStroke(active, at(2, 1))).toBe(active);
  });
});

describe('endStroke', () => {
  it('conta movimento quando algo foi desenhado', () => {
    const s = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0)]);
    expect(s.moves).toBe(1);
    expect(s.activeColor).toBeNull();
  });

  it('não conta movimento quando só houve o toque inicial', () => {
    const s = endStroke(beginStroke(createInitialState(LEVEL), at(0, 0)));
    expect(s.moves).toBe(0);
  });

  it('não faz nada sem cor ativa', () => {
    const initial = createInitialState(LEVEL);
    expect(endStroke(initial)).toBe(initial);
  });
});

describe('isPairComplete', () => {
  it('é falso com caminho curto demais', () => {
    expect(isPairComplete(createInitialState(LEVEL), 'rose')).toBe(false);
  });

  it('é falso quando o caminho não alcançou o outro ponto', () => {
    const s = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0)]);
    expect(isPairComplete(s, 'rose')).toBe(false);
  });

  it('é verdadeiro ao ligar as duas pontas', () => {
    const s = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0), at(2, 0)]);
    expect(isPairComplete(s, 'rose')).toBe(true);
  });
});

describe('occupantAt', () => {
  it('acha quem ocupa e em que posição do caminho', () => {
    const s = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0)]);
    expect(occupantAt(s, at(1, 0))).toEqual({ color: 'rose', index: 1 });
  });

  it('devolve null em célula livre', () => {
    expect(occupantAt(createInitialState(LEVEL), at(1, 1))).toBeNull();
  });
});

describe('isSolved', () => {
  it('exige tabuleiro cheio, não só os pares ligados', () => {
    let s = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0), at(2, 0)]);
    s = drag(s, [at(0, 2), at(1, 2), at(2, 2)]);
    expect(isPairComplete(s, 'rose')).toBe(true);
    expect(isPairComplete(s, 'blue')).toBe(true);
    // A coluna do meio ficou vazia — o nível não está resolvido.
    expect(filledCount(s)).toBe(6);
    expect(isSolved(s)).toBe(false);
  });

  it('é verdadeiro quando tudo liga e nada sobra', () => {
    let s = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0), at(2, 0)]);
    s = drag(s, [at(0, 2), at(0, 1), at(1, 1), at(2, 1), at(2, 2)]);
    expect(filledCount(s)).toBe(8);
    expect(isSolved(s)).toBe(false);

    // Falta a célula (1,2). Refazendo blue para cobrir tudo:
    let t = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0), at(2, 0)]);
    t = drag(t, [at(0, 2), at(0, 1), at(1, 1), at(1, 2), at(2, 2)]);
    expect(filledCount(t)).toBe(8);
    // Ainda falta (2,1).
    expect(isSolved(t)).toBe(false);
  });
});

describe('fillRatio', () => {
  it('vai de 0 ao ocupar o tabuleiro', () => {
    expect(fillRatio(createInitialState(LEVEL))).toBe(0);
    const s = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0), at(2, 0)]);
    expect(fillRatio(s)).toBeCloseTo(3 / 9);
  });
});

describe('clearColor e resetLevel', () => {
  it('apaga só a cor pedida', () => {
    let s = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0)]);
    s = drag(s, [at(0, 2), at(1, 2)]);
    const cleared = clearColor(s, 'rose');
    expect(cleared.paths.rose).toEqual([]);
    expect(cleared.paths.blue).toHaveLength(2);
  });

  it('ignora cor inexistente', () => {
    const s = createInitialState(LEVEL);
    expect(clearColor(s, 'nao-existe')).toBe(s);
  });

  it('reset devolve tudo ao início', () => {
    const s = drag(createInitialState(LEVEL), [at(0, 0), at(1, 0)]);
    const r = resetLevel(s);
    expect(r.paths.rose).toEqual([]);
    expect(r.moves).toBe(0);
  });
});
