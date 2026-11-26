/* Renderização dos blocos de conteúdo e dos exercícios. */
'use strict';

L.ui = {
  el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  },

  ultimoCampo: null,

  /** Barra de símbolos: insere no último campo de resposta focado. */
  barraSimbolos(vars = []) {
    const simb = ['-', '/', '^', '(', ')', ...vars];
    const rot = { '-': '−' };
    const barra = L.ui.el(`<div class="simbolos" aria-label="Inserir símbolo">
      ${simb.map(s => `<button type="button" tabindex="-1" data-s="${L.util.esc(s)}">${L.util.esc(rot[s] || s)}</button>`).join('')}
    </div>`);
    barra.addEventListener('mousedown', e => e.preventDefault()); // mantém o foco no campo
    barra.addEventListener('click', e => {
      const b = e.target.closest('button[data-s]');
      if (!b) return;
      let campo = L.ui.ultimoCampo;
      const form = barra.closest('form');
      if (!campo || !form || !form.contains(campo)) campo = form && form.querySelector('input.resp:not(:disabled)');
      if (!campo || campo.disabled) return;
      const ini = campo.selectionStart ?? campo.value.length;
      const fim = campo.selectionEnd ?? campo.value.length;
      campo.value = campo.value.slice(0, ini) + b.dataset.s + campo.value.slice(fim);
      campo.setSelectionRange(ini + b.dataset.s.length, ini + b.dataset.s.length);
      campo.focus();
    });
    return barra;
  },

  instalarCampos() {
    document.addEventListener('focusin', e => {
      if (e.target.matches('input.resp')) L.ui.ultimoCampo = e.target;
    });
  },

  campo(placeholder = '', classe = '') {
    return `<input class="resp ${classe}" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${L.util.esc(placeholder)}">`;
  }
};

/* ============================================================
   RENDERIZAÇÃO DE FÓRMULAS (KaTeX)
   Toda vez que algo é inserido na página, as fórmulas entre $...$ e $$...$$ são desenhadas.
   ============================================================ */
L.formulas = {
  opcoes: {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false,
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'input']
  },
  desenhar(el) {
    if (window.renderMathInElement && el) window.renderMathInElement(el, this.opcoes);
  },
  instalar() {
    if (!window.MutationObserver) return;
    const obs = new MutationObserver(lista => {
      obs.disconnect();
      for (const m of lista) {
        for (const n of m.addedNodes) {
          if (n.nodeType === 1 && !n.closest('.katex')) this.desenhar(n);
        }
      }
      obs.observe(document.body, { childList: true, subtree: true });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
};

/* ============================================================
   BLOCOS DE CONTEÚDO
   ============================================================ */
L.blocos = {
  render(bloco, cap, ctx) {
    const fn = this[bloco.t];
    if (!fn) return L.ui.el(`<div class="aviso">Bloco desconhecido: ${L.util.esc(bloco.t)}</div>`);
    return fn.call(this, bloco, cap, ctx);
  },

  html(b) { return L.ui.el(`<div class="bloco texto">${b.html}</div>`); },

  /** Definição, teorema, proposição: caixa destacada. */
  teo(b) {
    return L.ui.el(`<div class="bloco teo"><div class="teo-rot">${b.rotulo}</div>${b.html}</div>`);
  },

  dica(b) {
    return L.ui.el(`<aside class="bloco dica"><div class="caixa-titulo">💡 ${b.titulo || 'Dica'}</div>${b.html}</aside>`);
  },

  atencao(b) {
    return L.ui.el(`<aside class="bloco atencao"><div class="caixa-titulo">⚠️ ${b.titulo || 'Atenção'}</div>${b.html}</aside>`);
  },

  livro(b) {
    return L.ui.el(`<aside class="bloco livro"><div class="caixa-titulo">📖 No livro-texto</div><p>${b.html}</p></aside>`);
  },

  /** Exemplo com a solução escondida, para o estudante tentar antes. */
  exemplo(b) {
    return L.ui.el(`<div class="bloco exemplo"><div class="caixa-titulo">✏️ ${b.titulo || 'Exemplo'}</div>
      <div>${b.enunciado}</div>
      <details class="solucao"${b.aberto ? ' open' : ''}><summary>${b.aberto ? 'Solução' : 'Tente antes. Depois toque para ver a solução'}</summary><div>${b.solucao}</div></details></div>`);
  },

  tabela(b) {
    return L.ui.el(`<div class="bloco">
      ${b.titulo ? `<h3>${b.titulo}</h3>` : ''}
      <div class="rolagem"><table class="tab">
        <thead><tr>${b.cab.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${b.linhas.map(l => `<tr>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div></div>`);
  },

  /** Vídeo (p.ex. gerado com Manim). Coloque o arquivo em app/videos/. */
  video(b) {
    const div = L.ui.el(`<figure class="bloco video">
      <video controls playsinline preload="metadata" ${b.poster ? `poster="${b.poster}"` : ''}>
        <source src="${b.src}" type="video/mp4">
      </video>
      ${b.legenda ? `<figcaption>🎬 ${b.legenda}</figcaption>` : ''}
    </figure>`);
    const v = div.querySelector('video');
    v.addEventListener('error', () => div.replaceWith(L.ui.el(
      `<div class="bloco aviso">🎬 O vídeo não pôde ser carregado (é preciso estar conectado à internet na primeira vez).</div>`)), true);
    return div;
  },

  pratica(b, cap, ctx) {
    const div = L.ui.el(`<div class="bloco pratica">
      <div class="pratica-cab"><h3>✍️ ${b.titulo || 'Fixação'}</h3><span class="pratica-cont"></span></div>
      ${b.instrucao ? `<p class="instrucao">${b.instrucao}</p>` : ''}
      <div class="pratica-corpo"></div></div>`);
    const chave = ctx ? `${cap.num}/${ctx.sec.id}/${ctx.idx}` : null;
    L.quiz.iniciar(b.itens, div.querySelector('.pratica-corpo'), div.querySelector('.pratica-cont'), (ac, tot) => {
      if (!chave) return;
      L.db.estado.praticas[chave] = { acertos: ac, total: tot, data: L.util.hoje() };
      L.db.salvar();
    });
    return div;
  },

  /** Atalhos para os treinos de reforço da seção. */
  reforco(b) {
    const gs = b.geradores.map(id => L.geradores[id]).filter(Boolean);
    return L.ui.el(`<div class="bloco reforco"><div class="caixa-titulo">🎯 Reforço</div>
      <p class="sub">Exercícios novos a cada vez, com correção na hora e solução comentada.</p>
      <div class="lista-treinos">${gs.map(g => `<a class="treino-item" href="#/treino/${g.id}">
        <span class="treino-nome">${g.titulo}</span><span class="treino-ir">Praticar →</span></a>`).join('')}</div></div>`);
  }
};

/* ============================================================
   QUIZ: apresenta itens um a um, com correção e placar
   ============================================================ */
L.quiz = {
  iniciar(itens, corpo, contador, aoTerminar, opcoes = {}) {
    let i = 0, acertos = 0;

    const proximo = () => {
      if (i >= itens.length) return fim();
      contador.textContent = `${i + 1} / ${itens.length}`;
      corpo.innerHTML = '';
      const item = itens[i];
      const tipo = L.quiz.tipos[item.t];
      if (!tipo) { corpo.textContent = `Tipo de exercício desconhecido: ${item.t}`; return; }
      tipo(item, corpo, (ok) => {
        if (ok) acertos++;
        L.db.registrarExercicio(ok);
        if (opcoes.aoResponder) opcoes.aoResponder(item, ok);
        L.db.salvar();
        const bt = L.ui.el(`<button class="btn primario proximo">${i + 1 < itens.length ? 'Próximo →' : 'Ver resultado'}</button>`);
        bt.addEventListener('click', () => { i++; proximo(); corpo.closest('.pratica')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
        corpo.appendChild(bt);
      });
    };

    const fim = () => {
      const pct = Math.round(100 * acertos / itens.length);
      contador.textContent = '';
      const msg = pct >= 90 ? 'Excelente! 🎉' : pct >= 70 ? 'Muito bem!' : pct >= 50 ? 'Bom começo. Vale a pena refazer.' : 'Releia o trecho acima e tente de novo.';
      corpo.innerHTML = `<div class="resultado"><div class="placar">${acertos} / ${itens.length}</div><div class="sub">acertos de primeira</div><div>${msg}</div></div>`;
      const bt = L.ui.el('<button class="btn">↻ Refazer</button>');
      bt.addEventListener('click', () => { i = 0; acertos = 0; proximo(); });
      corpo.appendChild(bt);
      if (aoTerminar) aoTerminar(acertos, itens.length);
    };

    proximo();
  },

  feedback(ok, html, rotulo) {
    return L.ui.el(`<div class="feedback ${ok ? 'certo' : 'errado'}"><b>${rotulo || (ok ? '✓ Certo!' : '✗ Não foi dessa vez.')}</b>${html ? `<div class="exp">${html}</div>` : ''}</div>`);
  },

  /** Botão de dica (se o item tiver uma). */
  botaoDica(item) {
    if (!item.dica) return '';
    return `<details class="dica-item"><summary>💡 Dica</summary><div>${item.dica}</div></details>`;
  },

  /**
   * Fluxo comum dos exercícios com campos de resposta:
   * 1ª tentativa errada → pode tentar de novo ou ver a solução; 2ª errada → mostra a solução.
   *   ler(): { ok, erro, marcas? }   (marcas: lista de [campo, ok] para colorir)
   *   resposta: HTML da resposta correta.
   */
  formulario(item, form, ler, resposta, pronto) {
    let tentativas = 0;
    const campos = () => [...form.querySelectorAll('input.resp')];
    const botao = form.querySelector('button.verificar');
    let aviso = null;

    const encerrar = (ok) => {
      campos().forEach(c => (c.disabled = true));
      form.querySelector('.simbolos')?.remove();
      botao.remove();
      form.querySelector('.tentar')?.remove();
      const rot = ok ? (tentativas ? '✓ Certo na segunda tentativa!' : '✓ Certo!') : '✗ Não foi dessa vez.';
      const extra = ok ? (item.exp || '') : `<div class="resposta-certa">Resposta: ${resposta}</div>${item.exp || ''}`;
      form.appendChild(L.quiz.feedback(ok, extra, rot));
      pronto(ok && tentativas === 0);
    };

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (botao.disabled || !form.contains(botao)) return;
      if (campos().some(c => !c.value.trim())) {
        const vazio = campos().find(c => !c.value.trim());
        vazio.focus();
        return;
      }
      if (aviso) { aviso.remove(); aviso = null; }
      const r = ler();
      if (r.erro && !r.ok) {
        aviso = L.ui.el(`<div class="aviso-leitura">🤔 Não entendi a resposta: ${L.util.esc(r.erro)} ${item.formato ? `<br><span class="sub">${item.formato}</span>` : ''}</div>`);
        form.insertBefore(aviso, botao.parentElement === form ? botao : botao.parentElement);
        return;
      }
      (r.marcas || campos().map(c => [c, r.ok])).forEach(([c, ok]) => {
        c.classList.remove('certo', 'errado');
        c.classList.add(ok ? 'certo' : 'errado');
      });
      if (r.ok) return encerrar(true);
      tentativas++;
      if (tentativas >= 2) return encerrar(false);
      // primeira tentativa errada
      botao.disabled = true;
      campos().forEach(c => (c.disabled = true));
      const tent = L.ui.el(`<div class="tentar"><div class="feedback errado"><b>✗ Ainda não.</b> ${r.msg ? r.msg + ' ' : ''}${item.dica ? 'Que tal abrir a dica?' : (r.msg ? '' : 'Confira as contas.')}</div>
        <div class="botoes"><button type="button" class="btn primario de-novo">↻ Tentar de novo</button><button type="button" class="btn ver-sol">Ver solução</button></div></div>`);
      tent.querySelector('.de-novo').addEventListener('click', () => {
        tent.remove();
        botao.disabled = false;
        campos().forEach(c => { c.disabled = false; c.classList.remove('certo', 'errado'); });
        const d = form.querySelector('details.dica-item');
        if (d) d.open = true;
        const prim = campos().find(c => r.marcas ? r.marcas.some(([x, ok]) => x === c && !ok) : true) || campos()[0];
        prim.focus();
        prim.select();
      });
      tent.querySelector('.ver-sol').addEventListener('click', () => encerrar(false));
      form.appendChild(tent);
    });
  },

  tipos: {
    /** Múltipla escolha. item: { p, op: [...], c: índice certo, exp, fixa } */
    escolha(item, corpo, pronto) {
      const div = L.ui.el(`<div class="item"><div class="pergunta">${item.p}</div>${L.quiz.botaoDica(item)}<div class="opcoes"></div></div>`);
      const ops = div.querySelector('.opcoes');
      let ordem = item.op.map((_, k) => k);
      if (!item.fixa) ordem = L.util.embaralhar(ordem);
      const botoes = [];
      ordem.forEach(k => {
        const b = L.ui.el(`<button class="opcao">${item.op[k]}</button>`);
        botoes[k] = b;
        b.addEventListener('click', () => {
          ops.querySelectorAll('button').forEach(x => (x.disabled = true));
          const ok = k === item.c;
          b.classList.add(ok ? 'certo' : 'errado');
          botoes[item.c].classList.add('certo');
          div.appendChild(L.quiz.feedback(ok, item.exp || ''));
          pronto(ok);
        });
        ops.appendChild(b);
      });
      corpo.appendChild(div);
    },

    /** Verdadeiro ou falso. item: { p, r: true|false, exp } */
    vf(item, corpo, pronto) {
      const div = L.ui.el(`<div class="item"><div class="pergunta"><span class="selo">V ou F?</span> ${item.p}</div>${L.quiz.botaoDica(item)}
        <div class="opcoes vf"><button class="opcao" data-v="1">Verdadeiro</button><button class="opcao" data-v="0">Falso</button></div></div>`);
      const ops = div.querySelector('.opcoes');
      ops.addEventListener('click', e => {
        const b = e.target.closest('button[data-v]');
        if (!b || b.disabled) return;
        ops.querySelectorAll('button').forEach(x => (x.disabled = true));
        const escolha = b.dataset.v === '1';
        const ok = escolha === item.r;
        b.classList.add(ok ? 'certo' : 'errado');
        ops.querySelector(`[data-v="${item.r ? 1 : 0}"]`).classList.add('certo');
        div.appendChild(L.quiz.feedback(ok, `${item.r ? 'É <b>verdadeira</b>.' : 'É <b>falsa</b>.'} ${item.exp || ''}`));
        pronto(ok);
      });
      corpo.appendChild(div);
    },

    /** Resposta numérica (aceita frações e contas). item: { p, r, exp, dica, rot } */
    num(item, corpo, pronto) {
      const form = L.ui.el(`<form class="item" novalidate><div class="pergunta">${item.p}</div>${L.quiz.botaoDica(item)}
        <div class="linha-resp">${item.rot ? `<label class="rot-campo">${item.rot}</label>` : ''}${L.ui.campo(item.ph || 'ex.: -12 ou 3/4')}<button class="btn primario verificar">Verificar</button></div></form>`);
      form.appendChild(L.ui.barraSimbolos());
      const campo = form.querySelector('input');
      L.quiz.formulario(item, form, () => L.expr.compararNumero(campo.value, item.r),
        `$${item.rtex || L.tex.x(item.r instanceof L.Frac ? item.r : (typeof item.r === 'number' ? item.r : item.r))}$`, pronto);
      corpo.appendChild(form);
    },

    /** Expressão algébrica. item: { p, r: 'texto', vars: ['a','b'], rtex, exp } */
    expr(item, corpo, pronto) {
      const form = L.ui.el(`<form class="item" novalidate><div class="pergunta">${item.p}</div>${L.quiz.botaoDica(item)}
        <div class="linha-resp">${item.rot ? `<label class="rot-campo">${item.rot}</label>` : ''}${L.ui.campo(item.ph || 'ex.: (a-b)^2(a+2b)')}<button class="btn primario verificar">Verificar</button></div></form>`);
      form.appendChild(L.ui.barraSimbolos(item.vars));
      const campo = form.querySelector('input');
      L.quiz.formulario(item, form, () => L.expr.compararExpressao(campo.value, item.r, item.vars), `$${item.rtex || item.r}$`, pronto);
      corpo.appendChild(form);
    },

    /** Conjunto de valores. item: { p, r: [valores], rtex, exp } */
    conj(item, corpo, pronto) {
      const form = L.ui.el(`<form class="item" novalidate><div class="pergunta">${item.p}</div>${L.quiz.botaoDica(item)}
        <div class="linha-resp">${L.ui.campo(item.ph || 'ex.: -2; 3   (ou “nenhum”)')}<button class="btn primario verificar">Verificar</button></div>
        <div class="sub formato">Separe os valores com ponto e vírgula. Se não houver nenhum, escreva “nenhum”.</div></form>`);
      form.appendChild(L.ui.barraSimbolos());
      const campo = form.querySelector('input');
      const rtex = item.rtex || (item.r.length ? `\\{${item.r.map(x => L.tex.x(x)).join(',\\ ')}\\}` : '\\varnothing');
      L.quiz.formulario(item, form, () => L.expr.compararConjunto(campo.value, item.r), `$${rtex}$`, pronto);
      corpo.appendChild(form);
    },

    /** Matriz. item: { p, r: [[...]], exp } */
    mat(item, corpo, pronto) {
      const m = item.r.length, n = item.r[0].length;
      const form = L.ui.el(`<form class="item" novalidate><div class="pergunta">${item.p}</div>${L.quiz.botaoDica(item)}
        <div class="matriz-resp">${item.rot ? `<span class="rot-campo">${item.rot}</span>` : ''}<div class="grade-mat" style="grid-template-columns:repeat(${n}, minmax(3.2rem, 4.6rem))">
          ${Array.from({ length: m * n }, () => L.ui.campo('', 'cel')).join('')}</div></div>
        <button class="btn primario verificar largo">Verificar</button></form>`);
      form.insertBefore(L.ui.barraSimbolos(), form.querySelector('.verificar'));
      const cels = [...form.querySelectorAll('input.cel')];
      L.quiz.formulario(item, form, () => {
        const marcas = [];
        let todos = true;
        for (let k = 0; k < cels.length; k++) {
          const r = L.expr.compararNumero(cels[k].value, item.r[Math.floor(k / n)][k % n]);
          if (r.erro) return { ok: false, erro: `${r.erro} (na linha ${Math.floor(k / n) + 1}, coluna ${k % n + 1})` };
          marcas.push([cels[k], r.ok]);
          if (!r.ok) todos = false;
        }
        return { ok: todos, marcas };
      }, `$${L.tex.mat(item.r)}$`, pronto);
      corpo.appendChild(form);
    },

    /** Vários campos numéricos. item: { p, campos: [{ rot, r }], exp } */
    multi(item, corpo, pronto) {
      const form = L.ui.el(`<form class="item" novalidate><div class="pergunta">${item.p}</div>${L.quiz.botaoDica(item)}
        <div class="campos-multi">${item.campos.map(c => `<label class="campo-multi"><span class="rot-campo">${c.rot}</span>${L.ui.campo()}</label>`).join('')}</div>
        <button class="btn primario verificar largo">Verificar</button></form>`);
      form.insertBefore(L.ui.barraSimbolos(item.vars || []), form.querySelector('.verificar'));
      const cs = [...form.querySelectorAll('input.resp')];
      L.quiz.formulario(item, form, () => {
        const marcas = [];
        let todos = true;
        for (let k = 0; k < cs.length; k++) {
          const c = item.campos[k];
          const r = c.vars ? L.expr.compararExpressao(cs[k].value, c.r, c.vars) : L.expr.compararNumero(cs[k].value, c.r);
          if (r.erro) return { ok: false, erro: r.erro };
          marcas.push([cs[k], r.ok]);
          if (!r.ok) todos = false;
        }
        return { ok: todos, marcas };
      }, item.campos.map(c => `${c.rot} $${c.rtex || L.tex.x(c.r)}$`).join('; '), pronto);
      corpo.appendChild(form);
    },

    /**
     * Base de um subespaço (p.ex. um autoespaço). Aceita QUALQUER base correta:
     * cada vetor digitado precisa estar no subespaço gerado por item.base, e os vetores precisam ser LI.
     * item: { p, base: [[...], ...], exp }
     */
    subesp(item, corpo, pronto) {
      const k = item.base.length, n = item.base[0].length;
      const nomes = item.nomes || Array.from({ length: k }, (_, i) => `v_{${i + 1}}`);
      const form = L.ui.el(`<form class="item" novalidate><div class="pergunta">${item.p}</div>${L.quiz.botaoDica(item)}
        <div class="sub formato">${k === 1 ? 'Dê um vetor não nulo do subespaço (qualquer múltiplo serve).' : `O subespaço tem dimensão ${k}: dê ${k} vetores LI dele (qualquer base serve).`}</div>
        <div class="vetores-resp">${nomes.map(nm => `<div class="vetor-resp"><span class="rot-campo">$${nm} =$</span><span class="par">(</span>
          ${Array.from({ length: n }, () => L.ui.campo('', 'cel')).join('<span class="virg">,</span>')}<span class="par">)</span></div>`).join('')}</div>
        <button class="btn primario verificar largo">Verificar</button></form>`);
      form.insertBefore(L.ui.barraSimbolos(), form.querySelector('.verificar'));
      const linhas = [...form.querySelectorAll('.vetor-resp')].map(l => [...l.querySelectorAll('input.resp')]);
      const postoBase = L.mat.postoNum(item.base.map(v => v.map(x => L.expr.gabarito(x))));
      L.quiz.formulario(item, form, () => {
        const vs = [];
        for (const cs of linhas) {
          const v = [];
          for (const c of cs) {
            try { v.push(L.expr.valor(c.value)); } catch (e) { return { ok: false, erro: e.message }; }
          }
          vs.push(v);
        }
        const base = item.base.map(v => v.map(x => L.expr.gabarito(x)));
        const marcas = [];
        let todos = true, msg = '';
        vs.forEach((v, i) => {
          const nulo = v.every(x => Math.abs(x) < 1e-12);
          const dentro = !nulo && L.mat.postoNum([...base, v]) === postoBase;
          if (!dentro) { todos = false; msg = nulo ? 'O vetor nulo não serve (autovetores são não nulos).' : `$${nomes[i]}$ não pertence ao subespaço.`; }
          linhas[i].forEach(c => marcas.push([c, dentro]));
        });
        if (todos && k > 1 && L.mat.postoNum(vs) < k) {
          todos = false; msg = 'Os vetores estão no subespaço, mas são LD: não formam uma base.';
          marcas.forEach(m => (m[1] = false));
        }
        return { ok: todos, marcas, msg };
      }, `$\\operatorname{ger}\\{${item.base.map(v => `(${v.map(x => L.tex.x(x)).join(',')})`).join(',\\,')}\\}$ (ou qualquer outra base dele)`, pronto);
      corpo.appendChild(form);
    },

    /** Exercício guiado: um enunciado comum e etapas que aparecem uma após a outra. */
    etapas(item, corpo, pronto) {
      const div = L.ui.el(`<div class="item etapas"><div class="pergunta">${item.p}</div><div class="lista-etapas"></div></div>`);
      const lista = div.querySelector('.lista-etapas');
      corpo.appendChild(div);
      let k = 0, todas = true;
      const seguinte = () => {
        const sub = item.etapas[k];
        const caixa = L.ui.el(`<div class="etapa"><div class="etapa-num">Etapa ${k + 1} de ${item.etapas.length}</div></div>`);
        lista.appendChild(caixa);
        L.quiz.tipos[sub.t](sub, caixa, ok => {
          if (!ok) todas = false;
          k++;
          if (k < item.etapas.length) {
            const bt = L.ui.el('<button type="button" class="btn continuar-etapa">Continuar ↓</button>');
            bt.addEventListener('click', () => { bt.remove(); seguinte(); });
            caixa.appendChild(bt);
          } else {
            if (item.exp) div.appendChild(L.ui.el(`<div class="fecho">${item.exp}</div>`));
            pronto(todas);
          }
        });
        if (k > 0) caixa.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };
      seguinte();
    },

    /** Questão aberta (demonstração, justificativa) com autoavaliação. item: { p, modelo } */
    aberta(item, corpo, pronto) {
      const div = L.ui.el(`<form class="item"><div class="pergunta">${item.p}</div>${L.quiz.botaoDica(item)}
        <textarea class="resp-longa" rows="3" placeholder="Rascunhe sua resposta aqui (opcional) ou no papel"></textarea>
        <button class="btn primario">Ver resolução</button></form>`);
      div.addEventListener('submit', e => {
        e.preventDefault();
        div.querySelector('textarea').disabled = true;
        div.querySelector('button').remove();
        const modelo = L.ui.el(`<div class="modelo"><div class="rotulo">Resolução:</div><div>${item.modelo}</div>
          <div class="auto">Compare com a sua. Como foi?</div>
          <div class="botoes-auto"><button type="button" class="btn errado" data-ok="0">Não consegui</button><button type="button" class="btn certo" data-ok="1">Consegui</button></div></div>`);
        modelo.addEventListener('click', ev => {
          const b = ev.target.closest('button[data-ok]');
          if (!b) return;
          modelo.querySelector('.botoes-auto').remove();
          pronto(b.dataset.ok === '1');
        });
        div.appendChild(modelo);
      });
      corpo.appendChild(div);
    }
  }
};
