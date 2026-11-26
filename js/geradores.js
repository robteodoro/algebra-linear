/* Geradores de exercícios de reforço: cada chamada de gerar() cria um exercício novo,
   com a resposta calculada exatamente e uma solução comentada. */
'use strict';

L.geradores = {};
L.registrarGerador = function (g) { L.geradores[g.id] = g; };

(function () {
  const { int, intNZ, sortear, embaralhar } = L.util;
  const F = (n, d) => new L.Frac(n, d);
  const T = L.tex;
  const det = M => L.mat.det(M);
  const matAleatoria = (m, n, a, b) => Array.from({ length: m }, () => Array.from({ length: n }, () => int(a, b)));
  const lin = i => `\\ell_{${i + 1}}`;
  /** Coeficiente na frente de uma letra: 1 → "", -1 → "-", 2 → "2". */
  const coef = f => {
    const fr = L.Frac.de(f);
    if (fr.igual(1)) return '';
    if (fr.igual(-1)) return '-';
    return fr.tex();
  };
  /** Operação ℓi → ℓi − f·ℓj escrita com o sinal certo. */
  const opSub = (i, j, f) => {
    const fr = L.Frac.de(f);
    const abs = fr.n < 0 ? fr.neg() : fr;
    return `${lin(i)} \\to ${lin(i)} ${fr.n < 0 ? '+' : '-'} ${coef(abs)}${lin(j)}`;
  };

  /* ------------------------------------------------------------ 2×2 */
  L.registrarGerador({
    id: 'det2', titulo: 'Determinantes 2×2', cap: 4, sec: 1,
    gerar() {
      let A = matAleatoria(2, 2, -6, 7);
      if (Math.random() < 0.35) {
        const k = intNZ(-3, 3);
        A = [[A[0][0], A[0][1]], [k * A[0][0], k * A[0][1]]];
        if (Math.random() < 0.5) A = [A[1], A[0]];
      }
      const [[a, b], [c, d]] = A;
      const r = a * d - b * c;
      const conta = `$\\det A = ${T.p(a)}\\cdot${T.p(d)} - ${T.p(b)}\\cdot${T.p(c)} = ${a * d} - ${T.p(b * c)} = ${r}$.`;
      if (Math.random() < 0.6) {
        return { t: 'num', p: `Calcule $\\det A$, sendo $A = ${T.mat(A)}$.`, r, exp: conta };
      }
      return {
        t: 'escolha', p: `A matriz $A = ${T.mat(A)}$ é invertível?`, fixa: true,
        op: ['Sim, pois $\\det A \\neq 0$.', 'Não, pois $\\det A = 0$.'], c: r !== 0 ? 0 : 1,
        exp: conta + (r === 0 ? ' Note que uma linha é múltipla da outra.' : '')
      };
    }
  });

  /* ------------------------------------------------------------ 3×3 (Sarrus) */
  L.registrarGerador({
    id: 'det3', titulo: 'Determinantes 3×3 (Sarrus)', cap: 4, sec: 2,
    gerar() {
      const A = matAleatoria(3, 3, -3, 4);
      const a = (i, j) => A[i - 1][j - 1];
      const mais = [a(1, 1) * a(2, 2) * a(3, 3), a(1, 2) * a(2, 3) * a(3, 1), a(1, 3) * a(2, 1) * a(3, 2)];
      const menos = [a(1, 3) * a(2, 2) * a(3, 1), a(1, 1) * a(2, 3) * a(3, 2), a(1, 2) * a(2, 1) * a(3, 3)];
      const r = mais.reduce((s, x) => s + x, 0) - menos.reduce((s, x) => s + x, 0);
      // \mathord{...} impede o KaTeX de quebrar a linha no meio do produto
      const prod = (i1, j1, i2, j2, i3, j3) => `$\\mathord{${T.p(a(i1, j1))}\\cdot${T.p(a(i2, j2))}\\cdot${T.p(a(i3, j3))} = ${a(i1, j1) * a(i2, j2) * a(i3, j3)}}$`;
      const sMais = mais.reduce((s, x) => s + x, 0), sMenos = menos.reduce((s, x) => s + x, 0);
      const exp = `Pela regra de Sarrus:
        <ul class="passos"><li>descendentes ($+$): ${prod(1, 1, 2, 2, 3, 3)}, ${prod(1, 2, 2, 3, 3, 1)}, ${prod(1, 3, 2, 1, 3, 2)}; soma $${sMais}$;</li>
        <li>ascendentes ($-$): ${prod(1, 3, 2, 2, 3, 1)}, ${prod(1, 1, 2, 3, 3, 2)}, ${prod(1, 2, 2, 1, 3, 3)}; soma $${sMenos}$.</li></ul>
        Logo $\\det A = ${sMais} - ${T.p(sMenos)} = ${r}$.`;
      return { t: 'num', p: `Calcule $\\det A$, sendo $A = ${T.mat(A)}$.`, r, exp };
    }
  });

  /* ------------------------------------------------------------ operações sobre filas */
  L.registrarGerador({
    id: 'filas', titulo: 'Operações sobre filas e propriedades', cap: 4, sec: 3,
    gerar() {
      const d = sortear([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7]);
      const ls = [lin(0), lin(1), lin(2)];
      const B = rows => `\\begin{bmatrix}${rows.join('\\\\')}\\end{bmatrix}`;
      const k = sortear([-3, -2, 2, 3, 4, 5]);
      const m = sortear([-3, -2, -1, 1, 2, 3]);
      const [i, j] = embaralhar([0, 1, 2]);
      const modelos = [
        () => { // troca de duas linhas
          const rows = ls.slice(); [rows[i], rows[j]] = [rows[j], rows[i]];
          return { M: B(rows), r: -d, exp: `Trocar duas linhas de posição troca o sinal do determinante: $\\det B = -\\det A = ${-d}$.` };
        },
        () => { // multiplicar uma linha
          const rows = ls.slice(); rows[i] = `${k}${ls[i]}`;
          return { M: B(rows), r: k * d, exp: `Multiplicar <b>uma</b> linha por $${k}$ multiplica o determinante por $${k}$ (linearidade naquela linha): $\\det B = ${k}\\cdot${T.p(d)} = ${k * d}$.` };
        },
        () => { // somar múltiplo de outra
          const rows = ls.slice(); rows[i] = `${ls[i]} ${m < 0 ? '-' : '+'} ${coef(Math.abs(m))}${ls[j]}`;
          return { M: B(rows), r: d, exp: `Somar a uma linha um múltiplo de <b>outra</b> não altera o determinante (Prop. 4.14): $\\det B = \\det A = ${d}$.` };
        },
        () => { // armadilha: k·ℓi + m·ℓj
          const rows = ls.slice(); rows[i] = `${k}${ls[i]} ${m < 0 ? '-' : '+'} ${coef(Math.abs(m))}${ls[j]}`;
          return { M: B(rows), r: k * d, exp: `Cuidado: aqui a própria linha $${ls[i]}$ foi multiplicada por $${k}$. Pela linearidade nessa linha, $\\det B = ${k}\\det A + ${T.p(m)}\\cdot 0 = ${k * d}$ (a segunda parcela tem duas linhas iguais).` };
        },
        () => { // múltiplo da matriz toda
          return { M: `${k}A`, r: k * k * k * d, tex: true, exp: `$${k}A$ tem as <b>três</b> linhas multiplicadas por $${k}$, logo $\\det(${k}A) = ${k}^3\\det A = ${k * k * k}\\cdot${T.p(d)} = ${k * k * k * d}$.` };
        },
        () => { // permutação cíclica
          return { M: B([ls[1], ls[2], ls[0]]), r: d, exp: `Duas trocas levam $(${ls[1]}, ${ls[2]}, ${ls[0]})$ a $(${ls[0]}, ${ls[1]}, ${ls[2]})$: troca-se o sinal duas vezes, e $\\det B = \\det A = ${d}$.` };
        },
        () => { // somas consecutivas
          return { M: B([`${ls[0]} + ${ls[1]}`, `${ls[1]} + ${ls[2]}`, `${ls[2]} + ${ls[0]}`]), r: 2 * d,
            exp: `Abrindo por linearidade em cada linha, sobram apenas as parcelas sem linhas repetidas: $\\det(${ls[0]},${ls[1]},${ls[2]}) + \\det(${ls[1]},${ls[2]},${ls[0]}) = \\det A + \\det A$ (a segunda é uma permutação cíclica, que não muda o sinal). Logo $\\det B = 2\\cdot${T.p(d)} = ${2 * d}$.` };
        },
        () => { // transposta combinada com escalar
          return { M: `${k}A^*`, r: k * k * k * d, tex: true, exp: `$\\det A^* = \\det A$ e as três filas são multiplicadas por $${k}$: $\\det(${k}A^*) = ${k}^3\\cdot${T.p(d)} = ${k * k * k * d}$.` };
        },
        () => { // linha repetida
          const rows = ls.slice(); rows[i] = `${k}${ls[j]}`;
          return { M: B(rows), r: 0, exp: `Uma linha de $B$ é múltipla de outra (filas proporcionais), logo $\\det B = 0$.` };
        }
      ];
      const mod = sortear(modelos)();
      const p = mod.tex
        ? `Seja $A\\in M(3)$ com $\\det A = ${d}$. Calcule $\\det(${mod.M})$.`
        : `Seja $A\\in M(3)$ com linhas $${ls.join(', ')}$ e $\\det A = ${d}$. Calcule $\\det B$, sendo $B = ${mod.M}$.`;
      return { t: 'num', p, r: mod.r, exp: mod.exp };
    }
  });

  /* ------------------------------------------------------------ cofatores */
  L.registrarGerador({
    id: 'cofator', titulo: 'Menores e cofatores', cap: 4, sec: 4,
    gerar() {
      const A = matAleatoria(3, 3, -4, 5);
      const i = int(0, 2), j = int(0, 2);
      const Mn = L.mat.menor(A, i, j);
      const dm = det(Mn).valor();
      const sinal = (i + j) % 2 === 0 ? 1 : -1;
      const c = sinal * dm;
      const exp = `Eliminando a linha ${i + 1} e a coluna ${j + 1}: $A_{${i + 1}${j + 1}} = ${T.mat(Mn)}$, com $\\det A_{${i + 1}${j + 1}} = ${T.p(Mn[0][0])}\\cdot${T.p(Mn[1][1])} - ${T.p(Mn[0][1])}\\cdot${T.p(Mn[1][0])} = ${dm}$.
        O sinal é $(-1)^{${i + 1}+${j + 1}} = ${sinal > 0 ? '+1' : '-1'}$, logo $c_{${i + 1}${j + 1}} = ${c}$.`;
      return { t: 'num', p: `Seja $A = ${T.mat(A)}$. Calcule o cofator $c_{${i + 1}${j + 1}} = (-1)^{${i + 1}+${j + 1}}\\det A_{${i + 1}${j + 1}}$.`, r: c, exp };
    }
  });

  /* ------------------------------------------------------------ Laplace numa fila com zeros */
  L.registrarGerador({
    id: 'laplace', titulo: 'Laplace pela fila com mais zeros', cap: 4, sec: 4,
    gerar() {
      const A = matAleatoria(4, 4, -3, 4);
      const porColuna = Math.random() < 0.5;
      const f = int(0, 3);
      const naoNulas = Math.random() < 0.6 ? 1 : 2;
      const pos = embaralhar([0, 1, 2, 3]).slice(0, naoNulas);
      for (let t = 0; t < 4; t++) {
        const v = pos.includes(t) ? intNZ(-4, 5) : 0;
        if (porColuna) A[t][f] = v; else A[f][t] = v;
      }
      const r = det(A).valor();
      const nome = porColuna ? `${f + 1}ª coluna` : `${f + 1}ª linha`;
      const parcelas = pos.sort().map(t => {
        const [ii, jj] = porColuna ? [t, f] : [f, t];
        const Mn = L.mat.menor(A, ii, jj);
        const s = (ii + jj) % 2 === 0 ? '+' : '-';
        return { tex: `${s}\\,${T.p(A[ii][jj])}\\cdot\\det A_{${ii + 1}${jj + 1}}`, mn: `\\det A_{${ii + 1}${jj + 1}} = \\det${T.mat(Mn)} = ${det(Mn).valor()}` };
      });
      const exp = `A ${nome} tem ${4 - naoNulas} zeros. Desenvolvendo por ela:
        $$\\det A = ${parcelas.map(x => x.tex).join(' ')},$$ com ${parcelas.map(x => `$${x.mn}$`).join(' e ')}. Resultado: $\\det A = ${r}$.`;
      return { t: 'num', p: `Calcule $\\det A$ para $A = ${T.mat(A)}$. (Escolha bem a fila!)`, r, exp,
        dica: `Procure a fila com mais zeros e desenvolva por Laplace por ela.` };
    }
  });

  /* ------------------------------------------------------------ triangulares */
  L.registrarGerador({
    id: 'triang', titulo: 'Matrizes triangulares', cap: 4, sec: 4,
    gerar() {
      const n = sortear([3, 4, 4, 5]);
      const diag = Array.from({ length: n }, () => (Math.random() < 0.08 ? 0 : intNZ(-3, 3)));
      const sup = Math.random() < 0.5;
      const A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) =>
        i === j ? diag[i] : ((sup ? j > i : j < i) ? int(-9, 9) : 0)));
      const r = diag.reduce((p, x) => p * x, 1);
      return {
        t: 'num', p: `Calcule $\\det A$, sendo $A = ${T.mat(A)}$.`, r,
        exp: `$A$ é triangular ${sup ? 'superior' : 'inferior'}, então $\\det A$ é o produto da diagonal: $${diag.map(T.p).join('\\cdot')} = ${r}$. As entradas fora da diagonal não importam!`
      };
    }
  });

  /* ------------------------------------------------------------ triangularização */
  L.registrarGerador({
    id: 'escalona', titulo: 'Criar zeros e triangularizar', cap: 4, sec: 5,
    gerar() {
      const n = sortear([3, 4, 4]);
      // A = P·L·U com L unitriangular inferior e U triangular superior (contas inteiras)
      const Lm = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : j < i ? int(-2, 2) : 0)));
      const U = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? sortear([-2, -1, 1, 1, 2, 3]) : j > i ? int(-2, 3) : 0)));
      let A = L.mat.produto(Lm, U).map(l => l.map(x => x.valor()));
      if (Math.random() < 0.3) { const a = int(1, n - 1); [A[0], A[a]] = [A[a], A[0]]; }
      // elimina registrando as operações
      const M = L.mat.frac(A);
      const passos = [];
      let trocas = 0;
      for (let j = 0; j < n; j++) {
        let p = j;
        while (p < n && M[p][j].zero()) p++;
        if (p === n) break;
        if (p !== j) { [M[p], M[j]] = [M[j], M[p]]; trocas++; passos.push(`${lin(j)} \\leftrightarrow ${lin(p)}\\ \\text{(troca: o sinal muda)}`); }
        const ops = [];
        for (let i = j + 1; i < n; i++) {
          if (M[i][j].zero()) continue;
          const f = M[i][j].div(M[j][j]);
          for (let k = j; k < n; k++) M[i][k] = M[i][k].sub(f.mul(M[j][k]));
          ops.push(opSub(i, j, f));
        }
        if (ops.length) passos.push(ops.join(',\\quad '));
      }
      const diag = M.map((l, i) => l[i]);
      const r = det(A);
      const exp = `Somando múltiplos de linhas a outras linhas (o que não altera o determinante):
        <ol class="passos">${passos.map(s => `<li>$${s}$</li>`).join('')}</ol>
        chega-se à matriz triangular $${T.mat(M)}$. Logo $\\det A = ${trocas % 2 ? '-' : ''}${trocas ? '(' : ''}${diag.map(T.p).join('\\cdot')}${trocas ? ')' : ''} = ${r.tex()}$.`;
      return { t: 'num', p: `Calcule $\\det A$ criando zeros com operações sobre as linhas: $A = ${T.mat(A)}$.`, r, exp,
        dica: `Use a primeira linha para zerar a primeira coluna abaixo dela; depois a segunda linha para zerar a segunda coluna, e assim por diante.` };
    }
  });

  /* ------------------------------------------------------------ propriedade fundamental */
  L.registrarGerador({
    id: 'produto', titulo: 'det(AB) = det A · det B e consequências', cap: 4, sec: 6,
    gerar() {
      const n = sortear([2, 3, 3, 4]);
      const a = sortear([-3, -2, 2, 3, 4, 5]);
      let b = sortear([-4, -3, -2, -1, 2, 3, 5]);
      const k = sortear([-2, 2, 3]);
      const m = sortear([2, 3]);
      const da = F(a), db = F(b);
      const modelos = [
        () => ({ e: 'AB', r: da.mul(db), exp: `$\\det(AB) = \\det A\\cdot\\det B = ${a}\\cdot${T.p(b)}$` }),
        () => ({ e: `${k}A`, r: F(k).pot(n).mul(da), exp: `$${k}A$ multiplica as $${n}$ linhas por $${k}$: $\\det(${k}A) = ${T.p(k)}^{${n}}\\det A = ${F(k).pot(n).tex()}\\cdot${T.p(a)}$` }),
        () => ({ e: `A^{${m}}`, r: da.pot(m), exp: `$\\det(A^{${m}}) = (\\det A)^{${m}} = ${T.p(a)}^{${m}}$` }),
        () => ({ e: 'A^{-1}', r: da.pot(-1), exp: `$\\det(A^{-1}) = \\dfrac{1}{\\det A} = \\dfrac{1}{${a}}$` }),
        () => ({ e: 'A^*B', r: da.mul(db), exp: `$\\det(A^*B) = \\det A^*\\cdot\\det B = \\det A\\cdot\\det B = ${a}\\cdot${T.p(b)}$` }),
        () => ({ e: 'A^{-1}B', r: db.div(da), exp: `$\\det(A^{-1}B) = \\dfrac{\\det B}{\\det A} = \\dfrac{${b}}{${a}}$` }),
        () => ({ e: `A^{2}B^{-1}`, r: da.pot(2).div(db), exp: `$\\det(A^2B^{-1}) = \\dfrac{(\\det A)^2}{\\det B} = \\dfrac{${a * a}}{${b}}$` }),
        () => ({ e: `(${k}A)^{-1}`, r: F(k).pot(n).mul(da).pot(-1), exp: `$\\det((${k}A)^{-1}) = \\dfrac{1}{\\det(${k}A)} = \\dfrac{1}{${T.p(k)}^{${n}}\\cdot${T.p(a)}}$` }),
        () => ({ e: 'B^{-1}AB', r: da, exp: `$\\det(B^{-1}AB) = \\dfrac{1}{\\det B}\\det A\\det B = \\det A$ (matrizes semelhantes têm o mesmo determinante)` })
      ];
      const mod = sortear(modelos)();
      return {
        t: 'num', p: `Sejam $A, B\\in M(${n})$ com $\\det A = ${a}$ e $\\det B = ${b}$. Calcule $\\det(${mod.e})$.`,
        r: mod.r, exp: `${mod.exp} $= ${mod.r.tex()}$.`, ph: 'ex.: -12 ou 3/4'
      };
    }
  });

  /* ------------------------------------------------------------ parâmetro: quando não é invertível */
  L.registrarGerador({
    id: 'param', titulo: 'Para que valores de k a matriz é invertível?', cap: 4, sec: 7,
    gerar() {
      const modelos = [
        () => { // 2×2 com raízes inteiras
          const r1 = int(-4, 4), r2 = int(-4, 4);
          const s = -(r1 + r2), prod = r1 * r2; // det = k² + s·k − p·q, com p·q = −prod
          const p = sortear([1, -1, 2, -2].filter(x => prod % x === 0)), q = -prod / p || 0;
          const termo = (x, v) => x === 0 ? '' : ` ${x < 0 ? '-' : '+'} ${Math.abs(x) === 1 && v ? '' : Math.abs(x)}${v}`;
          const ent = c => `k${termo(c, '')}`;
          const fator = r => r === 0 ? 'k' : `(k${termo(-r, '')})`;
          const M = [['k', p], [q, ent(s)]];
          const poli = `k^2${termo(s, 'k')}${termo(prod, '')}`;
          const fat = r1 === r2 ? (r1 === 0 ? 'k^2' : `${fator(r1)}^2`) : `${fator(r1)}${fator(r2)}`;
          return { M, r: [...new Set([r1, r2])], exp: `$\\det A = k(${ent(s)}) - ${T.p(p)}\\cdot${T.p(q)} = ${poli} = ${fat}$.` };
        },
        () => { // Vandermonde
          const [a, b] = embaralhar([-3, -2, -1, 0, 1, 2, 3, 4]).slice(0, 2);
          const M = [[1, 1, 1], [a, b, 'k'], [a * a, b * b, 'k^2']];
          return { M, r: [a, b], exp: `É uma matriz de Vandermonde (Exemplo 4.17): $\\det A = (${b} - ${T.p(a)})(k - ${T.p(a)})(k - ${T.p(b)})$, que se anula exatamente para $k = ${a}$ e $k = ${b}$.` };
        },
        () => { // bloco
          const r = int(1, 4), mm = intNZ(-3, 3), c1 = int(-3, 3), c2 = int(-3, 3);
          const M = [['k', r, 0], [r, 'k', 0], [c1, c2, mm]];
          return { M, r: [-r, r], exp: `Desenvolvendo pela 3ª coluna: $\\det A = ${mm}\\,(k^2 - ${r * r}) = ${mm}(k-${r})(k+${r})$.` };
        },
        () => { // 3×3 com det linear em k
          const r = intNZ(-4, 4);
          // [[1,2,1],[0,1,k],[1,3,c]]: det = 1·(c - 3k) - 2(0 - k) + 1(0 - 1) = c - k - 1  → zero em k = c - 1
          const c = r + 1;
          const M = [[1, 2, 1], [0, 1, 'k'], [1, 3, c]];
          return { M, r: [r], exp: `Pela 1ª coluna: $\\det A = 1\\cdot(${c} - 3k) + 1\\cdot(2k - 1) = ${c - 1} - k$, que se anula só em $k = ${r}$.` };
        }
      ];
      const mod = sortear(modelos)();
      return {
        t: 'conj', p: `Para quais valores de $k$ a matriz $A = ${T.mat(mod.M)}$ <b>não</b> é invertível?`, r: mod.r,
        exp: mod.exp + ' Para todos os outros valores de $k$, $\\det A\\neq 0$ e $A$ é invertível.',
        dica: 'Calcule $\\det A$ em função de $k$ e encontre as raízes.'
      };
    }
  });

  /* ------------------------------------------------------------ LI / LD */
  L.registrarGerador({
    id: 'lild', titulo: 'LI ou LD? Decida pelo determinante', cap: 4, sec: 7,
    gerar() {
      const v1 = [int(-3, 3), int(-3, 3), int(-3, 3)];
      const v2 = [int(-3, 3), int(-3, 3), int(-3, 3)];
      let v3, rel = '';
      const ld = Math.random() < 0.5;
      if (ld) {
        const a = intNZ(-2, 2), b = intNZ(-2, 2);
        v3 = v1.map((x, t) => a * x + b * v2[t]);
        rel = ` De fato, $v_3 = ${coef(a)}v_1 ${b < 0 ? '-' : '+'} ${coef(Math.abs(b))}v_2$.`;
      } else v3 = [int(-3, 3), int(-3, 3), int(-3, 3)];
      const M = [v1, v2, v3];
      const d = det(M).valor();
      const vs = [v1, v2, v3].map((v, t) => `v_${t + 1} = (${v.join(', ')})`).join(',\\ ');
      return {
        t: 'escolha', fixa: true, p: `Os vetores $${vs}$ de $\\mathbb{R}^3$ são LI ou LD?`,
        op: ['LI', 'LD'], c: d !== 0 ? 0 : 1,
        exp: `A matriz cujas linhas são $v_1, v_2, v_3$ tem determinante $\\det${T.mat(M)} = ${d}$${d !== 0 ? ' \\neq 0' : ''}, logo os vetores são ${d !== 0 ? '<b>LI</b>' : '<b>LD</b>'}.${d === 0 ? rel : ''}`
      };
    }
  });

  /* ------------------------------------------------------------ inversa 2×2 pela adjunta */
  L.registrarGerador({
    id: 'inv2', titulo: 'Inversa pela adjunta clássica (2×2)', cap: 4, sec: 8,
    gerar() {
      let A, d;
      do {
        A = matAleatoria(2, 2, -5, 6);
        d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      } while (![1, -1, 2, -2, 1, -1].includes(d));
      const [[a, b], [c, e]] = A;
      const adj = [[e, -b], [-c, a]];
      const inv = adj.map(l => l.map(x => F(x, d)));
      return {
        t: 'mat', p: `Calcule $A^{-1}$, sendo $A = ${T.mat(A)}$. (Frações são aceitas, como 1/2.)`, r: inv, rot: '$A^{-1} =$',
        exp: `$\\det A = ${d}$ e $\\operatorname{adj} A = ${T.mat(adj)}$ (troque as entradas da diagonal e o sinal das outras). Logo $A^{-1} = \\dfrac{1}{\\det A}\\operatorname{adj}A = ${T.mat(inv)}$.`
      };
    }
  });

  /* ------------------------------------------------------------ Cramer */
  L.registrarGerador({
    id: 'cramer', titulo: 'Regra de Cramer', cap: 4, sec: 8,
    gerar() {
      const n = Math.random() < 0.6 ? 2 : 3;
      let A, d;
      do { A = matAleatoria(n, n, -3, 4); d = det(A).valor(); } while (d === 0 || Math.abs(d) > 15);
      const X = Array.from({ length: n }, () => int(-4, 4));
      const B = A.map(l => l.reduce((s, x, k) => s + x * X[k], 0));
      const nomes = ['x', 'y', 'z'];
      const sist = `\\begin{cases}${A.map((l, i) => {
        let s = '';
        l.forEach((x, k) => {
          if (x === 0) return;
          const termo = `${coef(Math.abs(x))}${nomes[k]}`;
          s += s ? ` ${x < 0 ? '-' : '+'} ${termo}` : `${x < 0 ? '-' : ''}${termo}`;
        });
        return `${s || '0'} = ${B[i]}`;
      }).join('\\\\')}\\end{cases}`;
      const Ai = k => A.map((l, i) => l.map((x, j) => (j === k ? B[i] : x)));
      const dets = Array.from({ length: n }, (_, k) => det(Ai(k)).valor());
      if (n === 2) {
        return {
          t: 'multi', p: `Resolva pela regra de Cramer: $${sist}$`,
          campos: [{ rot: '$x =$', r: X[0] }, { rot: '$y =$', r: X[1] }],
          exp: `$\\det A = ${d}$, $\\det A_1 = \\det${T.mat(Ai(0), 'b')} = ${dets[0]}$ e $\\det A_2 = \\det${T.mat(Ai(1), 'b')} = ${dets[1]}$.
            Logo $x = \\frac{${dets[0]}}{${d}} = ${X[0]}$ e $y = \\frac{${dets[1]}}{${d}} = ${X[1]}$.`
        };
      }
      const k = int(0, 2);
      return {
        t: 'num', p: `No sistema $${sist}$, use a regra de Cramer para obter <b>apenas</b> $${nomes[k]}$.`, r: X[k], rot: `$${nomes[k]} =$`,
        exp: `$\\det A = ${d}$ e, trocando a ${k + 1}ª coluna pelos termos independentes, $\\det A_${k + 1} = \\det${T.mat(Ai(k))} = ${dets[k]}$. Logo $${nomes[k]} = \\frac{${dets[k]}}{${d}} = ${X[k]}$.`
      };
    }
  });

  /* ------------------------------------------------------------ posto por submatrizes */
  L.registrarGerador({
    id: 'posto', titulo: 'Posto por meio de submatrizes', cap: 4, sec: 9,
    gerar() {
      const n = sortear([3, 4]);
      const r = sortear([1, 2, 2, 3]);
      let A;
      do {
        const base = matAleatoria(r, n, -3, 3);
        const linhas = base.slice();
        while (linhas.length < 3) {
          const c = base.map(() => int(-2, 2));
          linhas.push(base[0].map((_, j) => base.reduce((s, l, t) => s + c[t] * l[j], 0)));
        }
        A = embaralhar(linhas);
      } while (L.mat.posto(A) !== r || A.every(l => l.every(x => x === 0)));
      // procura uma submatriz r×r com determinante não nulo
      const comb = (arr, k) => k === 0 ? [[]] : arr.flatMap((x, i) => comb(arr.slice(i + 1), k - 1).map(c => [x, ...c]));
      let sub = null;
      for (const ls of comb([0, 1, 2], r)) {
        for (const cs of comb([...Array(n).keys()], r)) {
          const S = ls.map(i => cs.map(j => A[i][j]));
          if (!det(S).zero()) { sub = { ls, cs, S }; break; }
        }
        if (sub) break;
      }
      const subTex = `$${T.mat(sub.S)}$ (linhas ${sub.ls.map(x => x + 1).join(', ')}; colunas ${sub.cs.map(x => x + 1).join(', ')}), de determinante $${det(sub.S).valor()}\\neq 0$`;
      const exp = r === 3
        ? `A submatriz ${subTex}, tem ordem 3, que é o máximo possível. Logo o posto é 3.`
        : `A submatriz ${subTex}. Mas ${r === 1 ? 'todas as linhas são múltiplas de uma só' : 'uma linha é combinação das outras duas'}, então toda submatriz de ordem ${r + 1} tem determinante zero. Logo o posto é ${r} (Prop. 4.25).`;
      return { t: 'num', p: `Qual é o posto de $A = ${T.mat(A)}$?`, r, exp,
        dica: 'O posto é a maior ordem de uma submatriz quadrada com determinante não nulo.' };
    }
  });
})();
