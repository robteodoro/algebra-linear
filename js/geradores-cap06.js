/* Geradores de reforço do capítulo 6 (autovalores, autovetores, diagonalização, polinômio mínimo).
   As matrizes são montadas como A = P·D·P⁻¹ com P de determinante ±1, para que tudo seja inteiro
   e os autovalores/autovetores sejam conhecidos de antemão. */
'use strict';

(function () {
  const { int, intNZ, sortear, embaralhar } = L.util;
  const T = L.tex;
  const Fr = L.Frac;
  const M = L.mat;

  /* ---------- álgebra de matrizes exata ---------- */
  const id = n => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => new Fr(i === j ? 1 : 0)));
  const soma = (A, B) => A.map((l, i) => l.map((x, j) => Fr.de(x).soma(B[i][j])));
  const esc = (c, A) => A.map(l => l.map(x => Fr.de(x).mul(c)));
  const nula = A => A.every(l => l.every(x => Fr.de(x).zero()));
  const val = A => A.map(l => l.map(x => Fr.de(x).valor()));
  const potM = (A, k) => { let R = id(A.length); for (let i = 0; i < k; i++) R = M.produto(R, A); return R; };
  const inv = A => {
    const d = M.det(A), n = A.length;
    const C = A.map((l, i) => l.map((_, j) => M.cofator(A, i, j)));
    return M.transposta(C).map(l => l.map(x => x.div(d)));
  };
  const maxAbs = A => Math.max(...A.flat().map(x => Math.abs(Fr.de(x).valor())));

  /** P inteira com det ±1 (inversa inteira), entradas pequenas. */
  function unimodular(n) {
    for (;;) {
      let P;
      if (n === 2) {
        const a = int(-2, 3), b = int(-2, 3), c = int(-2, 3), d = int(-2, 3);
        P = [[a, b], [c, d]];
      } else {
        const Lm = [[1, 0, 0], [int(-1, 1), 1, 0], [int(-1, 1), int(-1, 1), 1]];
        const U = [[1, int(-1, 1), int(-1, 1)], [0, 1, int(-1, 1)], [0, 0, 1]];
        P = val(M.produto(Lm, U));
        P = embaralhar(P); // trocar linhas só muda o sinal do determinante
      }
      const d = M.det(P).valor();
      if (Math.abs(d) === 1 && maxAbs(P) <= 3 && P[0].some((_, j) => P.some(l => l[j] !== 0))) {
        // evita colunas com zeros demais (autovetores óbvios demais)
        const colunasTriviais = P[0].map((_, j) => P.filter(l => l[j] !== 0).length).filter(c => c <= 1).length;
        if (n === 2 && colunasTriviais > 1) continue;
        if (n === 3 && colunasTriviais > 1) continue;
        return P;
      }
    }
  }

  /** A = P·D·P⁻¹ com D diagonal dada; tenta até as entradas ficarem pequenas. */
  function comAutovalores(diag, limite = 12) {
    const n = diag.length;
    for (let tent = 0; tent < 200; tent++) {
      const P = unimodular(n);
      const D = diag.map((x, i) => diag.map((_, j) => (i === j ? x : 0)));
      const A = val(M.produto(M.produto(P, D), inv(P)));
      if (maxAbs(A) <= limite) return { A, P, D };
    }
    return null;
  }

  /** Fator (t − λ)^e em LaTeX e em texto digitável. */
  const fatorTex = (l, e = 1) => {
    const base = l === 0 ? 't' : `(t ${l < 0 ? '+' : '-'} ${Math.abs(l)})`;
    return e === 1 ? base : `${l === 0 ? 't' : base}^{${e}}`;
  };
  const fatorTxt = (l, e = 1) => `(t-(${l}))${e === 1 ? '' : `^${e}`}`;
  const vetTex = v => `(${v.map(x => T.x(Fr.de(x).inteiro() ? Fr.de(x).valor() : Fr.de(x))).join(', ')})`;
  const coluna = (P, j) => P.map(l => l[j]);
  const polTex2 = (tr, d) => {
    const termo = (x, v) => x === 0 ? '' : ` ${x < 0 ? '-' : '+'} ${Math.abs(x) === 1 && v ? '' : Math.abs(x)}${v}`;
    return `t^2${termo(-tr, 't')}${termo(d, '')}`;
  };

  /* ------------------------------------------------------------ é autovetor? */
  L.registrarGerador({
    id: 'autovetor', titulo: 'É autovetor? Qual o autovalor?', cap: 6, sec: 2,
    gerar() {
      const [l1, l2] = embaralhar([-3, -2, -1, 1, 2, 3, 4, 5]).slice(0, 2);
      const { A, P } = comAutovalores([l1, l2]);
      const eh = Math.random() < 0.6;
      let v, lam = null;
      if (eh) {
        const j = int(0, 1), c = sortear([1, -1, 2]);
        v = coluna(P, j).map(x => c * x);
        lam = [l1, l2][j];
      } else {
        do { v = [intNZ(-3, 3), int(-3, 3)]; } while (v[0] * (A[1][0] * v[0] + A[1][1] * v[1]) - v[1] * (A[0][0] * v[0] + A[0][1] * v[1]) === 0);
      }
      const Av = [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
      const conta = `$Av = ${T.mat(A)}${T.mat(v.map(x => [x]))} = ${T.mat(Av.map(x => [x]))}$`;
      if (eh && Math.random() < 0.5) {
        return { t: 'num', p: `Sejam $A = ${T.mat(A)}$ e $v = (${v.join(', ')})$. Verifique que $v$ é autovetor de $A$ e dê o autovalor associado.`,
          r: lam, rot: '$\\lambda =$', exp: `${conta} $= ${lam}\\,v$. Logo $\\lambda = ${lam}$.` };
      }
      return {
        t: 'escolha', fixa: true, p: `Sejam $A = ${T.mat(A)}$ e $v = (${v.join(', ')})$. O vetor $v$ é autovetor de $A$?`,
        op: ['Sim', 'Não'], c: eh ? 0 : 1,
        exp: eh ? `${conta} $= ${lam}\\,v$: é autovetor, com autovalor $${lam}$.`
          : `${conta}, que não é múltiplo de $v$ (compare as razões entre as coordenadas). Logo $v$ não é autovetor.`
      };
    }
  });

  /* ------------------------------------------------------------ polinômio característico e autovalores */
  L.registrarGerador({
    id: 'polcar', titulo: 'Polinômio característico e autovalores', cap: 6, sec: 4,
    gerar() {
      const modo = sortear(['c2', 'c2', 'aut2', 'tri3', 'bloco3']);
      if (modo === 'c2' || modo === 'aut2') {
        const [l1, l2] = Math.random() < 0.8 ? embaralhar([-3, -2, -1, 0, 1, 2, 3, 4, 5]).slice(0, 2) : (x => [x, x])(int(-2, 3));
        const { A } = l1 === l2 ? { A: [[l1, intNZ(-3, 3)], [0, l1]] } : comAutovalores([l1, l2]);
        const tr = A[0][0] + A[1][1], d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
        const fat = l1 === l2 ? fatorTex(l1, 2) : `${fatorTex(l1)}${fatorTex(l2)}`;
        const exp = `Para $2\\times2$, $c(t) = t^2 - (\\operatorname{traço}A)\\,t + \\det A$, com traço $${tr}$ e $\\det A = ${d}$:
          $c(t) = ${polTex2(tr, d)} = ${fat}$.`;
        if (modo === 'c2') return { t: 'expr', p: `Calcule o polinômio característico $c(t) = \\det(tI - A)$ de $A = ${T.mat(A)}$.`, r: `t^2-(${tr})t+(${d})`, vars: ['t'], rtex: polTex2(tr, d), ph: 'ex.: t^2 - 3t + 2', exp };
        return { t: 'conj', p: `Quais são os autovalores de $A = ${T.mat(A)}$?`, r: [...new Set([l1, l2])], exp: exp + ` As raízes são os autovalores (Prop. 6.4).` };
      }
      if (modo === 'tri3') {
        const dg = [int(-3, 4), int(-3, 4), int(-3, 4)];
        const sup = Math.random() < 0.5;
        const A = [0, 1, 2].map(i => [0, 1, 2].map(j => (i === j ? dg[i] : ((sup ? j > i : j < i) ? int(-5, 5) : 0))));
        return { t: 'conj', p: `Quais são os autovalores de $A = ${T.mat(A)}$?`, r: [...new Set(dg)],
          exp: `$tI - A$ também é triangular, logo $c(t) = ${fatorTex(dg[0])}${fatorTex(dg[1])}${fatorTex(dg[2])}$: os autovalores de uma matriz triangular são as entradas da diagonal.` };
      }
      // bloco: [[B, 0],[*, e]]
      const [l1, l2] = embaralhar([-2, -1, 1, 2, 3, 4]).slice(0, 2);
      const { A: B } = comAutovalores([l1, l2], 6);
      const e = int(-3, 4), x = int(-3, 3), y = int(-3, 3);
      const A = [[B[0][0], B[0][1], 0], [B[1][0], B[1][1], 0], [x, y, e]];
      const tr = B[0][0] + B[1][1], d = B[0][0] * B[1][1] - B[0][1] * B[1][0];
      return { t: 'conj', p: `Quais são os autovalores de $A = ${T.mat(A)}$?`, r: [...new Set([l1, l2, e])],
        dica: 'Desenvolva $\\det(tI - A)$ pela 3ª coluna.',
        exp: `Pela 3ª coluna, $c(t) = ${fatorTex(e)}\\,\\det\\begin{bmatrix}t-${T.p(B[0][0])}&${-B[0][1]}\\\\${-B[1][0]}&t-${T.p(B[1][1])}\\end{bmatrix} = ${fatorTex(e)}(${polTex2(tr, d)})$, e $${polTex2(tr, d)} = ${fatorTex(l1)}${fatorTex(l2)}$. Autovalores: $${[...new Set([l1, l2, e])].join(',\\ ')}$.` };
    }
  });

  /* ------------------------------------------------------------ base de autoespaço */
  L.registrarGerador({
    id: 'autoesp', titulo: 'Base de um autoespaço', cap: 6, sec: 5,
    gerar() {
      const n = Math.random() < 0.5 ? 2 : 3;
      let diag;
      if (n === 2) diag = embaralhar([-2, -1, 1, 2, 3, 4]).slice(0, 2);
      else {
        const [a, b, c] = embaralhar([-2, -1, 1, 2, 3]).slice(0, 3);
        diag = Math.random() < 0.5 ? [a, a, b] : [a, b, c];
      }
      const r = comAutovalores(diag, n === 2 ? 10 : 8);
      const { A, P } = r;
      const lam = sortear(diag);
      const js = diag.map((x, j) => (x === lam ? j : -1)).filter(j => j >= 0);
      const base = js.map(j => coluna(P, j));
      const LI = A.map((l, i) => l.map((x, j) => (i === j ? lam - x : -x)));
      return {
        t: 'subesp', p: `$\\lambda = ${lam}$ é autovalor de $A = ${T.mat(A)}$. Dê uma base do autoespaço $W_{${lam}}$.`, base,
        dica: `$W_{${lam}} = \\operatorname{nuc}(${lam}I - A)$: resolva o sistema homogêneo $(${lam}I - A)v = 0$.`,
        exp: `$${lam}I - A = ${T.mat(LI)}$ tem posto ${n - base.length}, e as soluções de $(${lam}I - A)v = 0$ formam $W_{${lam}} = \\operatorname{ger}\\{${base.map(vetTex).join(',\\ ')}\\}$, de dimensão ${base.length}. Confira: $A v = ${lam}\\,v$.`
      };
    }
  });

  /* ------------------------------------------------------------ é diagonalizável? */
  L.registrarGerador({
    id: 'diagon', titulo: 'É diagonalizável?', cap: 6, sec: 6,
    gerar() {
      const modo = sortear(['dist2', 'jordan2', 'complexo', 'tri3', 'tri3', 'escalar']);
      let A, sim, exp;
      if (modo === 'dist2') {
        const [l1, l2] = embaralhar([-2, -1, 0, 1, 2, 3, 4]).slice(0, 2);
        A = comAutovalores([l1, l2]).A; sim = true;
        exp = `$c(t) = ${fatorTex(l1)}${fatorTex(l2)}$ tem 2 raízes reais distintas, logo $A$ é diagonalizável (Prop. 6.6).`;
      } else if (modo === 'jordan2') {
        const a = int(-2, 3);
        const { A: J0, P } = { A: [[a, 1], [0, a]], P: unimodular(2) };
        A = val(M.produto(M.produto(P, J0), inv(P)));
        if (maxAbs(A) > 12) A = [[a, intNZ(-4, 4)], [0, a]];
        sim = false;
        exp = `$c(t) = ${fatorTex(a, 2)}$, mas $${a}I - A = ${T.mat(A.map((l, i) => l.map((x, j) => (i === j ? a - x : -x))))}\\neq 0$ tem posto 1, então $\\dim W_{${a}} = 1 < 2$. Não há base de autovetores (Prop. 6.8).`;
      } else if (modo === 'complexo') {
        const a = int(-2, 3), b = intNZ(-3, 3);
        A = [[a, -b], [b, a]]; sim = false;
        exp = `$c(t) = (t - ${T.p(a)})^2 + ${b * b}$ não tem raízes reais: $A$ não tem autovalores (reais), logo nenhum autovetor. Não é diagonalizável.`;
      } else if (modo === 'tri3') {
        const [a, b] = embaralhar([-2, -1, 1, 2, 3]).slice(0, 2);
        const x = Math.random() < 0.5 ? 0 : intNZ(-3, 3), y = int(-3, 3), z = int(-3, 3);
        A = [[a, x, y], [0, a, z], [0, 0, b]];
        sim = x === 0;
        exp = `Autovalores: $${a}$ (raiz dupla) e $${b}$. ${sim
          ? `$${a}I - A$ só tem a 3ª coluna não nula: posto 1, logo $\\dim W_{${a}} = 2$ e $\\dim W_{${a}} + \\dim W_{${b}} = 2 + 1 = 3$. É diagonalizável (Prop. 6.8).`
          : `Como $a_{12} = ${x}\\neq 0$, a matriz $${a}I - A$ tem posto 2, logo $\\dim W_{${a}} = 1$ e $\\dim W_{${a}} + \\dim W_{${b}} = 2 < 3$. Não é diagonalizável.`}`;
      } else {
        const a = intNZ(-3, 4);
        A = [[a, 0], [0, a]]; sim = true;
        exp = `$A = ${a}I$ já é diagonal (todo vetor não nulo é autovetor). Autovalor repetido não impede a diagonalização!`;
      }
      return { t: 'escolha', fixa: true, p: `A matriz $A = ${T.mat(A)}$ é diagonalizável?`, op: ['Sim', 'Não'], c: sim ? 0 : 1, exp };
    }
  });

  /* ------------------------------------------------------------ potências */
  L.registrarGerador({
    id: 'potencia', titulo: 'Potências via diagonalização', cap: 6, sec: 7,
    gerar() {
      const [l1, l2] = embaralhar([-1, 1, 2, 3, -2]).slice(0, 2);
      const { A, P, D } = comAutovalores([l1, l2], 8);
      const k = int(3, 6);
      const Ak = potM(A, k);
      const i = int(0, 1), j = int(0, 1);
      const Pi = inv(P);
      return {
        t: 'num', p: `Sabendo que $A = ${T.mat(A)} = PDP^{-1}$, com $P = ${T.mat(P)}$ e $D = ${T.mat(D)}$, calcule a entrada $(${i + 1},${j + 1})$ de $A^{${k}}$.`,
        r: Ak[i][j],
        dica: `$A^{${k}} = PD^{${k}}P^{-1}$, e $D^{${k}}$ é só elevar a diagonal.`,
        exp: `$A^{${k}} = PD^{${k}}P^{-1} = ${T.mat(P)}${T.mat([[l1 ** k, 0], [0, l2 ** k]])}${T.mat(Pi)} = ${T.mat(Ak)}$. A entrada $(${i + 1},${j + 1})$ é $${Ak[i][j].tex()}$.`
      };
    }
  });

  /* ------------------------------------------------------------ Cayley-Hamilton (2×2) */
  L.registrarGerador({
    id: 'cayley', titulo: 'Cayley-Hamilton em M(2)', cap: 6, sec: 8,
    gerar() {
      let A, tr, d;
      do { A = [[int(-3, 4), int(-3, 3)], [int(-3, 3), int(-3, 4)]]; tr = A[0][0] + A[1][1]; d = A[0][0] * A[1][1] - A[0][1] * A[1][0]; } while (d === 0 || Math.abs(d) > 6);
      const ch = `Pelo teorema de Cayley-Hamilton, $c(A) = A^2 - ${T.p(tr)}A + ${T.p(d)}I = 0$ (pois $c(t) = ${polTex2(tr, d)}$).`;
      if (Math.random() < 0.5) {
        return { t: 'multi', p: `Seja $A = ${T.mat(A)}$. Sem calcular $A^2$ diretamente, encontre $\\alpha, \\beta$ tais que $A^2 = \\alpha A + \\beta I$.`,
          campos: [{ rot: '$\\alpha =$', r: tr }, { rot: '$\\beta =$', r: -d }],
          exp: `${ch} Logo $A^2 = ${tr}A ${-d < 0 ? '-' : '+'} ${Math.abs(d)}I$.` };
      }
      const Ainv = A.map((l, i) => l.map((x, j) => new Fr((i === j ? tr : 0) - x, d)));
      return { t: 'mat', p: `Seja $A = ${T.mat(A)}$. Use Cayley-Hamilton para obter $A^{-1}$.`, r: Ainv, rot: '$A^{-1} =$',
        dica: 'Multiplique $A^2 - (\\operatorname{traço}A)A + (\\det A)I = 0$ por $A^{-1}$.',
        exp: `${ch} Multiplicando por $A^{-1}$: $A - ${T.p(tr)}I + ${T.p(d)}A^{-1} = 0$, logo $A^{-1} = \\dfrac{1}{${d}}(${tr}I - A) = ${T.mat(Ainv)}$.` };
    }
  });

  /* ------------------------------------------------------------ polinômio mínimo */
  L.registrarGerador({
    id: 'minimo', titulo: 'Polinômio mínimo', cap: 6, sec: 9,
    gerar() {
      const [a, b] = embaralhar([-2, -1, 0, 1, 2, 3]).slice(0, 2);
      const fam = sortear(['aab', 'aab', 'aaa', 'aaa', 'abc']);
      let dg = fam === 'aab' ? [a, a, b] : fam === 'aaa' ? [a, a, a] : [a, b, sortear([-3, 4, 5])];
      const x = sortear([0, 0, 1, -1, 2]), y = int(-2, 2), z = sortear([0, 1, -1, 2]);
      const A = [[dg[0], x, y], [0, dg[1], z], [0, 0, dg[2]]];
      // multiplicidades
      const mult = {};
      dg.forEach(l => (mult[l] = (mult[l] || 0) + 1));
      const lams = Object.keys(mult).map(Number);
      // candidatos ∏ (t − λ)^e, 1 ≤ e ≤ mult, em ordem de grau
      let cands = [[]];
      for (const l of lams) cands = cands.flatMap(c => Array.from({ length: mult[l] }, (_, e) => [...c, [l, e + 1]]));
      cands.sort((p, q) => p.reduce((s, f) => s + f[1], 0) - q.reduce((s, f) => s + f[1], 0));
      const avaliar = c => c.reduce((R, [l, e]) => M.produto(R, potM(soma(A, esc(-l, id(3))), e)), id(3));
      const testes = [];
      let m = null;
      for (const c of cands) {
        const zero = nula(avaliar(c));
        const fatorA = (l, e) => {
          const base = l === 0 ? 'A' : `(A ${l < 0 ? '+' : '-'} ${Math.abs(l)}I)`;
          return e === 1 ? base : `${base}^{${e}}`;
        };
        testes.push(`$\\mathord{${c.map(([l, e]) => fatorA(l, e)).join('')}${zero ? ' = 0' : ' \\neq 0'}}$`);
        if (zero) { m = c; break; }
      }
      const cTex = lams.map(l => fatorTex(l, mult[l])).join('');
      const mTex = m.map(([l, e]) => fatorTex(l, e)).join('');
      const mTxt = m.map(([l, e]) => fatorTxt(l, e)).join('*');
      return {
        t: 'expr', p: `Determine o polinômio mínimo de $A = ${T.mat(A)}$.`, r: mTxt, vars: ['t'], rtex: mTex, ph: 'ex.: (t-1)^2(t+2)',
        dica: `$m$ divide $c(t) = ${cTex}$ e tem todos os autovalores como raízes. Teste os candidatos do menor grau para o maior.`,
        exp: `$c(t) = ${cTex}$. Candidatos (divisores de $c$ com todos os autovalores como raízes), do menor grau para o maior: ${testes.join('; ')}. Logo $m(t) = ${mTex}$.`
      };
    }
  });
})();
