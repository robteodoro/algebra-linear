/* Núcleo: utilidades, armazenamento local, repetição espaçada,
   aritmética exata (frações), matrizes e leitura de respostas matemáticas. */
'use strict';
window.L = window.L || {};

/* ============================================================
   UTILIDADES
   ============================================================ */
L.util = {
  esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  hoje() { return L.util.dataISO(new Date()); },
  dataISO(d) {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  },
  somarDias(iso, n) {
    const [a, m, d] = iso.split('-').map(Number);
    return L.util.dataISO(new Date(a, m - 1, d + n));
  },
  embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  sortear(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  /** Inteiro aleatório em [a, b]. */
  int(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
  /** Inteiro aleatório em [a, b], diferente de zero. */
  intNZ(a, b) { let x; do { x = L.util.int(a, b); } while (x === 0); return x; }
};

/* ============================================================
   ARMAZENAMENTO LOCAL
   ============================================================ */
(function () {
  const CHAVE = 'algebra-linear-ufrn.v1';

  function padrao() {
    return {
      versao: 1,
      criadoEm: new Date().toISOString(),
      config: { novosPorDia: 10, itensPorTreino: 8, tema: 'auto', nome: '' },
      secoes: {},        // "4/3" -> data de conclusão
      praticas: {},      // "4/3/2" -> { acertos, total, data } (último resultado de cada bloco de prática)
      ultima: null,      // { cap, sec }
      cartoes: {},       // id -> estado SRS
      ordemCartoes: 0,
      treino: {},        // gerador -> { feitos, acertos }
      historico: {}      // "AAAA-MM-DD" -> { revisoes, novos, acertos, exercicios, certos, secoes }
    };
  }

  function mesclar(base, extra) {
    for (const k of Object.keys(extra || {})) {
      if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) && base[k] && typeof base[k] === 'object') {
        mesclar(base[k], extra[k]);
      } else {
        base[k] = extra[k];
      }
    }
    return base;
  }

  L.db = {
    estado: null,
    carregar() {
      let salvo = null;
      try { salvo = JSON.parse(localStorage.getItem(CHAVE)); } catch (e) { salvo = null; }
      this.estado = mesclar(padrao(), salvo || {});
      return this.estado;
    },
    salvar() {
      this.estado.atualizadoEm = new Date().toISOString();
      try { localStorage.setItem(CHAVE, JSON.stringify(this.estado)); } catch (e) { /* armazenamento cheio ou bloqueado */ }
    },
    exportar() { return JSON.stringify(this.estado, null, 2); },
    importar(texto) {
      const dados = JSON.parse(texto);
      if (!dados || typeof dados !== 'object' || !dados.versao || !dados.config) throw new Error('Arquivo não reconhecido.');
      this.estado = mesclar(padrao(), dados);
      this.salvar();
    },
    resetar() {
      const nome = this.estado.config.nome;
      this.estado = padrao();
      this.estado.config.nome = nome;
      this.salvar();
    },
    hist(dia) {
      const d = dia || L.util.hoje();
      const h = this.estado.historico;
      if (!h[d]) h[d] = { revisoes: 0, novos: 0, acertos: 0, exercicios: 0, certos: 0, secoes: 0 };
      return h[d];
    },
    /** Registra um exercício resolvido (prática de seção ou treino). */
    registrarExercicio(ok) {
      const h = this.hist();
      h.exercicios = (h.exercicios || 0) + 1;
      if (ok) h.certos = (h.certos || 0) + 1;
    },
    async pedirPersistencia() {
      try {
        if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
      } catch (e) { /* ignora */ }
      return false;
    }
  };
})();

/* ============================================================
   REPETIÇÃO ESPAÇADA (variante simples do SM-2)
   notas: 0 = Errei, 1 = Difícil, 2 = Bom, 3 = Fácil
   ============================================================ */
L.srs = {
  desbloquear(ids) {
    const est = L.db.estado;
    let novos = 0;
    for (const id of ids) {
      if (!est.cartoes[id] && L.cartoes[id]) {
        est.cartoes[id] = { fase: 'novo', ordem: est.ordemCartoes++, intervalo: 0, facilidade: 2.5, reps: 0, lapsos: 0, vence: null };
        novos++;
      }
    }
    return novos;
  },

  filaDoDia() {
    const est = L.db.estado;
    const hoje = L.util.hoje();
    const devidos = [], novos = [];
    for (const [id, c] of Object.entries(est.cartoes)) {
      if (!L.cartoes[id]) continue;
      if (c.fase === 'novo') novos.push([id, c]);
      else if (c.vence <= hoje) devidos.push([id, c]);
    }
    novos.sort((a, b) => a[1].ordem - b[1].ordem);
    const restante = Math.max(0, est.config.novosPorDia - L.db.hist().novos);
    return {
      devidos: L.util.embaralhar(devidos.map(x => x[0])),
      novos: novos.slice(0, restante).map(x => x[0]),
      totalNovos: novos.length
    };
  },

  responder(id, nota) {
    const c = L.db.estado.cartoes[id];
    if (!c) return;
    const h = L.db.hist();
    const hoje = L.util.hoje();
    if (c.fase === 'novo') h.novos++;
    h.revisoes++;
    if (nota > 0) h.acertos++;

    if (c.fase === 'novo' || c.fase === 'aprendendo') {
      if (nota === 0) { c.fase = 'aprendendo'; c.intervalo = 0; }
      else { c.fase = 'revisao'; c.intervalo = nota === 3 ? 4 : 1; }
    } else if (nota === 0) {
      c.lapsos++;
      c.facilidade = Math.max(1.3, c.facilidade - 0.2);
      c.fase = 'aprendendo';
      c.intervalo = 0;
    } else if (nota === 1) {
      c.facilidade = Math.max(1.3, c.facilidade - 0.15);
      c.intervalo = Math.max(1, Math.round(c.intervalo * 1.2));
    } else if (nota === 2) {
      c.intervalo = Math.max(c.intervalo + 1, Math.round(c.intervalo * c.facilidade));
    } else {
      c.facilidade += 0.15;
      c.intervalo = Math.max(c.intervalo + 2, Math.round(c.intervalo * c.facilidade * 1.3));
    }
    c.reps++;
    c.vence = c.intervalo === 0 ? hoje : L.util.somarDias(hoje, c.intervalo);
    L.db.salvar();
  },

  rotuloIntervalo(id, nota) {
    const c = L.db.estado.cartoes[id];
    if (!c) return '';
    if (nota === 0) return 'agora';
    if (c.fase !== 'revisao') return nota === 3 ? '4 d' : '1 d';
    let i;
    if (nota === 1) i = Math.max(1, Math.round(c.intervalo * 1.2));
    else if (nota === 2) i = Math.max(c.intervalo + 1, Math.round(c.intervalo * c.facilidade));
    else i = Math.max(c.intervalo + 2, Math.round(c.intervalo * (c.facilidade + 0.15) * 1.3));
    return i >= 30 ? `${Math.round(i / 30)} m` : `${i} d`;
  }
};

/* ============================================================
   FRAÇÕES EXATAS (para gerar exercícios e soluções)
   ============================================================ */
(function () {
  const mdc = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };

  class Frac {
    constructor(n, d = 1) {
      if (d === 0) throw new Error('Divisão por zero');
      if (d < 0) { n = -n; d = -d; }
      const g = mdc(n, d);
      this.n = n / g; this.d = d / g;
    }
    static de(x) { return x instanceof Frac ? x : new Frac(x, 1); }
    soma(o) { o = Frac.de(o); return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { o = Frac.de(o); return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { o = Frac.de(o); return new Frac(this.n * o.n, this.d * o.d); }
    div(o) { o = Frac.de(o); return new Frac(this.n * o.d, this.d * o.n); }
    neg() { return new Frac(-this.n, this.d); }
    pot(k) { let r = new Frac(1); const b = k < 0 ? new Frac(1).div(this) : this; for (let i = 0; i < Math.abs(k); i++) r = r.mul(b); return r; }
    zero() { return this.n === 0; }
    igual(o) { o = Frac.de(o); return this.n === o.n && this.d === o.d; }
    valor() { return this.n / this.d; }
    inteiro() { return this.d === 1; }
    /** Texto simples, para digitar: "-3/4". */
    texto() { return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`; }
    /** LaTeX: "-\frac{3}{4}". */
    tex() {
      if (this.d === 1) return String(this.n);
      return `${this.n < 0 ? '-' : ''}\\frac{${Math.abs(this.n)}}{${this.d}}`;
    }
  }
  L.Frac = Frac;
  L.mdc = mdc;
})();

/* ============================================================
   MATRIZES
   ============================================================ */
L.mat = {
  /** Copia uma matriz convertendo as entradas em frações. */
  frac(M) { return M.map(l => l.map(x => L.Frac.de(x))); },

  /** Determinante exato (eliminação com frações). Aceita números ou Frac. */
  det(M) {
    const n = M.length;
    const A = this.frac(M);
    let det = new L.Frac(1);
    for (let j = 0; j < n; j++) {
      let p = j;
      while (p < n && A[p][j].zero()) p++;
      if (p === n) return new L.Frac(0);
      if (p !== j) { [A[p], A[j]] = [A[j], A[p]]; det = det.neg(); }
      det = det.mul(A[j][j]);
      for (let i = j + 1; i < n; i++) {
        if (A[i][j].zero()) continue;
        const f = A[i][j].div(A[j][j]);
        for (let k = j; k < n; k++) A[i][k] = A[i][k].sub(f.mul(A[j][k]));
      }
    }
    return det;
  },

  /** Matriz obtida eliminando a linha i e a coluna j (índices a partir de 0). */
  menor(M, i, j) {
    return M.filter((_, r) => r !== i).map(l => l.filter((_, c) => c !== j));
  },

  cofator(M, i, j) {
    const d = this.det(this.menor(M, i, j));
    return (i + j) % 2 === 0 ? d : d.neg();
  },

  transposta(M) { return M[0].map((_, j) => M.map(l => l[j])); },

  produto(A, B) {
    return A.map(l => B[0].map((_, j) => l.reduce((s, x, k) => s.soma(L.Frac.de(x).mul(B[k][j])), new L.Frac(0))));
  },

  /** Posto de uma matriz de números reais quaisquer (respostas digitadas), com tolerância. */
  postoNum(M) {
    const A = M.map(l => l.map(Number));
    const m = A.length, n = m ? A[0].length : 0;
    const escala = Math.max(1, ...A.flat().map(Math.abs));
    let r = 0;
    for (let j = 0; j < n && r < m; j++) {
      let p = r;
      for (let i = r + 1; i < m; i++) if (Math.abs(A[i][j]) > Math.abs(A[p][j])) p = i;
      if (Math.abs(A[p][j]) < 1e-9 * escala) continue;
      [A[p], A[r]] = [A[r], A[p]];
      for (let i = r + 1; i < m; i++) {
        const f = A[i][j] / A[r][j];
        for (let k = j; k < n; k++) A[i][k] -= f * A[r][k];
      }
      r++;
    }
    return r;
  },

  /** Posto exato. */
  posto(M) {
    const A = this.frac(M);
    const m = A.length, n = A[0].length;
    let r = 0;
    for (let j = 0; j < n && r < m; j++) {
      let p = r;
      while (p < m && A[p][j].zero()) p++;
      if (p === m) continue;
      [A[p], A[r]] = [A[r], A[p]];
      for (let i = r + 1; i < m; i++) {
        const f = A[i][j].div(A[r][j]);
        for (let k = j; k < n; k++) A[i][k] = A[i][k].sub(f.mul(A[r][k]));
      }
      r++;
    }
    return r;
  }
};

/* ============================================================
   LaTeX
   ============================================================ */
L.tex = {
  /** Entrada em LaTeX (número, Frac ou texto já em LaTeX). */
  x(v) {
    if (v instanceof L.Frac) return v.tex();
    if (typeof v === 'number') return String(v);
    return v;
  },
  /** Matriz em LaTeX; tipo 'b' = colchetes, 'v' = barras (determinante). */
  mat(M, tipo = 'b') {
    return `\\begin{${tipo}matrix}${M.map(l => l.map(v => L.tex.x(v)).join('&')).join('\\\\')}\\end{${tipo}matrix}`;
  },
  /** Número entre parênteses se negativo (para produtos: 2·(−3)). */
  p(v) {
    const t = L.tex.x(v);
    const neg = (v instanceof L.Frac && v.n < 0) || (typeof v === 'number' && v < 0) || /^-/.test(t);
    return neg ? `(${t})` : t;
  },
  /** Soma de parcelas já com sinal correto: [3, -2, 5] -> "3 - 2 + 5". */
  soma(parcelas) {
    return parcelas.map((t, k) => {
      const s = L.tex.x(t);
      if (k === 0) return s;
      return s.startsWith('-') ? ` - ${s.slice(1)}` : ` + ${s}`;
    }).join('');
  }
};

/* ============================================================
   LEITURA DE RESPOSTAS MATEMÁTICAS
   Aceita: inteiros, decimais (com vírgula ou ponto), frações (3/4),
   potências (2^3, x²), raízes (sqrt(2), √2), multiplicação implícita
   (2a, (a-b)(a+b)), e variáveis de uma letra.
   ============================================================ */
L.expr = {
  normalizar(s) {
    return String(s)
      .replace(/[−–—]/g, '-').replace(/[·×∙⋅]/g, '*').replace(/÷/g, '/')
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4')
      .replace(/√/g, 'sqrt').replace(/raiz/gi, 'sqrt')
      .replace(/\s+/g, '');
  },

  tokens(s) {
    const t = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/[0-9.,]/.test(c)) {
        let j = i;
        while (j < s.length && /[0-9.,]/.test(s[j])) j++;
        const txt = s.slice(i, j).replace(',', '.');
        if ((txt.match(/\./g) || []).length > 1 || txt === '.') throw new Error(`Número mal escrito: “${s.slice(i, j)}”`);
        t.push({ k: 'num', v: parseFloat(txt) });
        i = j;
      } else if (/[a-zA-Zα-ωλ]/.test(c)) {
        if (s.startsWith('sqrt', i)) { t.push({ k: 'fn', v: 'sqrt' }); i += 4; continue; }
        t.push({ k: 'var', v: c });
        i++;
      } else if ('+-*/^()'.includes(c)) {
        t.push({ k: c });
        i++;
      } else {
        throw new Error(`Símbolo não reconhecido: “${c}”`);
      }
    }
    return t;
  },

  /** Devolve uma função env -> número. Lança erro com mensagem amigável. */
  compilar(texto) {
    const s = this.normalizar(texto);
    if (!s) throw new Error('Resposta vazia.');
    const t = this.tokens(s);
    let i = 0;
    const ver = () => t[i];
    const comer = k => { if (!t[i] || t[i].k !== k) throw new Error('Expressão incompleta ou parênteses desbalanceados.'); i++; };

    // expr := termo (('+'|'-') termo)*
    function expr() {
      let f = termo();
      while (ver() && (ver().k === '+' || ver().k === '-')) {
        const op = t[i++].k, g = termo(), a = f;
        f = op === '+' ? e => a(e) + g(e) : e => a(e) - g(e);
      }
      return f;
    }
    // termo := unario (('*'|'/'|implícito) unario)*
    function termo() {
      let f = unario();
      for (;;) {
        const x = ver();
        if (!x) break;
        if (x.k === '*' || x.k === '/') {
          i++;
          const g = unario(), a = f;
          f = x.k === '*' ? e => a(e) * g(e) : e => a(e) / g(e);
        } else if (x.k === '(' || x.k === 'var' || x.k === 'fn' || x.k === 'num') {
          const g = potencia(), a = f;   // multiplicação implícita: 2a, (a)(b), a(b)
          f = e => a(e) * g(e);
        } else break;
      }
      return f;
    }
    // unario := ('-'|'+') unario | potencia      (assim, -2^2 = -4)
    function unario() {
      if (ver() && ver().k === '-') { i++; const g = unario(); return e => -g(e); }
      if (ver() && ver().k === '+') { i++; return unario(); }
      return potencia();
    }
    // potencia := primario ('^' unario)?
    function potencia() {
      const b = primario();
      if (ver() && ver().k === '^') { i++; const ex = unario(); return e => Math.pow(b(e), ex(e)); }
      return b;
    }
    function primario() {
      const x = t[i++];
      if (!x) throw new Error('Expressão incompleta.');
      if (x.k === 'num') { const v = x.v; return () => v; }
      if (x.k === 'var') {
        const nome = x.v;
        return e => {
          if (!(nome in e)) throw new Error(`A resposta não deveria ter a letra “${nome}”.`);
          return e[nome];
        };
      }
      if (x.k === 'fn') {
        if (ver() && ver().k === '(') { i++; const g = expr(); comer(')'); return e => Math.sqrt(g(e)); }
        const g = primario(); // √9, √x
        return e => Math.sqrt(g(e));
      }
      if (x.k === '(') { const g = expr(); comer(')'); return g; }
      throw new Error('Expressão mal formada.');
    }

    const f = expr();
    if (i < t.length) throw new Error('Expressão mal formada (sobrou algo no final).');
    return f;
  },

  /** Valor numérico de uma resposta sem variáveis. */
  valor(texto) {
    const v = this.compilar(texto)({});
    if (!isFinite(v)) throw new Error('A conta não dá um número (divisão por zero?).');
    return v;
  },

  iguais(a, b, tol = 1e-9) { return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b)); },

  /** Valor numérico de um gabarito: número, Frac ou texto. */
  gabarito(r) {
    if (r instanceof L.Frac) return r.valor();
    if (typeof r === 'number') return r;
    return this.valor(r);
  },

  /** Compara resposta numérica. Retorna { ok, erro }. */
  compararNumero(resp, r) {
    try {
      const v = this.valor(resp);
      return { ok: this.iguais(v, this.gabarito(r)) };
    } catch (e) { return { ok: false, erro: e.message }; }
  },

  /** Compara expressões em algumas variáveis avaliando em pontos aleatórios. */
  compararExpressao(resp, r, vars) {
    let f, g;
    try { f = this.compilar(resp); } catch (e) { return { ok: false, erro: e.message }; }
    g = this.compilar(r);
    try {
      for (let k = 0; k < 8; k++) {
        const env = {};
        for (const v of vars) env[v] = Math.round((Math.random() * 6 - 3) * 1000) / 1000 + 0.137 * (k + 1);
        const a = f(env), b = g(env);
        if (!isFinite(b)) { k--; continue; }
        if (!this.iguais(a, b, 1e-7)) return { ok: false };
      }
      return { ok: true };
    } catch (e) { return { ok: false, erro: e.message }; }
  },

  /** Compara conjuntos de números: "1; -2" ou "1 e -2". "nenhum"/"vazio"/"∅" = conjunto vazio. */
  compararConjunto(resp, r) {
    const txt = String(resp).trim().replace(/[{}]/g, '');
    let lista;
    if (/^(nenhum|nenhuma|vazio|∅|ø)$/i.test(txt)) lista = [];
    else {
      try {
        lista = txt.split(/\s*(?:;|,|\be\b|\bou\b)\s*/).filter(Boolean).map(x => this.valor(x));
      } catch (e) { return { ok: false, erro: e.message }; }
    }
    const esperado = r.map(x => this.gabarito(x));
    const uniq = arr => arr.filter((x, k) => arr.findIndex(y => this.iguais(x, y)) === k);
    const a = uniq(lista), b = uniq(esperado);
    const ok = a.length === b.length && a.every(x => b.some(y => this.iguais(x, y)));
    return { ok };
  }
};

/* ============================================================
   REGISTRO DE CONTEÚDO
   ============================================================ */
L.capitulos = [];
L.registrarCapitulo = function (cap) {
  L.capitulos.push(cap);
  L.capitulos.sort((a, b) => a.num - b.num);
};
/** Atalho para escrever LaTeX sem duplicar barras: R`\det A`. */
window.R = String.raw;
