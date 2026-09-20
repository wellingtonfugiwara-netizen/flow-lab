import { cellCenter, pointToCell, stepsBetween } from '../geometry';

describe('pointToCell', () => {
  it('acha a célula pelo centro do toque', () => {
    expect(pointToCell(50, 50, 40, 5)).toEqual({ row: 1, col: 1 });
    expect(pointToCell(10, 10, 40, 5)).toEqual({ row: 0, col: 0 });
  });

  it('ignora o toque fora do tabuleiro', () => {
    expect(pointToCell(-1, 20, 40, 5)).toBeNull();
    expect(pointToCell(20, -1, 40, 5)).toBeNull();
    expect(pointToCell(200, 20, 40, 5)).toBeNull();
    expect(pointToCell(20, 200, 40, 5)).toBeNull();
  });

  it('ignora a borda da célula, pra diagonal não roçar na vizinha', () => {
    // 2px dentro de uma célula de 40px cai na margem de 18%.
    expect(pointToCell(2, 20, 40, 5)).toBeNull();
    expect(pointToCell(38, 20, 40, 5)).toBeNull();
    expect(pointToCell(20, 2, 40, 5)).toBeNull();
    expect(pointToCell(20, 38, 40, 5)).toBeNull();
  });

  it('aceita margem zero quando o chamador não quer zona morta', () => {
    expect(pointToCell(1, 1, 40, 5, 0)).toEqual({ row: 0, col: 0 });
  });

  it('devolve null com célula de tamanho inválido', () => {
    expect(pointToCell(10, 10, 0, 5)).toBeNull();
  });
});

describe('stepsBetween', () => {
  it('não anda quando já está na célula', () => {
    expect(stepsBetween({ row: 2, col: 2 }, { row: 2, col: 2 })).toEqual([]);
  });

  it('devolve só a vizinha quando o passo é de uma célula', () => {
    expect(stepsBetween({ row: 2, col: 2 }, { row: 2, col: 3 })).toEqual([{ row: 2, col: 3 }]);
  });

  it('preenche o meio quando o dedo pula várias células', () => {
    expect(stepsBetween({ row: 0, col: 0 }, { row: 2, col: 2 })).toEqual([
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ]);
  });

  it('anda para trás também', () => {
    expect(stepsBetween({ row: 3, col: 3 }, { row: 2, col: 2 })).toEqual([
      { row: 2, col: 3 },
      { row: 2, col: 2 },
    ]);
  });

  it('cada passo é vizinho do anterior', () => {
    const from = { row: 0, col: 4 };
    const steps = stepsBetween(from, { row: 4, col: 0 });
    let prev = from;
    for (const step of steps) {
      expect(Math.abs(step.row - prev.row) + Math.abs(step.col - prev.col)).toBe(1);
      prev = step;
    }
    expect(prev).toEqual({ row: 4, col: 0 });
  });
});

describe('cellCenter', () => {
  it('devolve o centro, não o canto', () => {
    expect(cellCenter({ row: 0, col: 0 }, 40)).toEqual({ x: 20, y: 20 });
    expect(cellCenter({ row: 2, col: 1 }, 40)).toEqual({ x: 60, y: 100 });
  });
});
