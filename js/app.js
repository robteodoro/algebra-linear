/* Aplicativo: cartões, progresso, rotas e telas. */
'use strict';

/* ============================================================
   CARTÕES DE REVISÃO (definidos em cada seção do conteúdo)
   ============================================================ */
L.cartoes = {};
L.construirCartoes = function () {
  for (const cap of L.capitulos) {
    for (const s of cap.secoes) {
      for (const c of s.cartoes || []) {
        L.cartoes[c.id] = { cap: cap.num, sec: s.id, frente: c.frente, verso: c.verso };
      }
    }
  }
};

/* ============================================================
   PROGRESSO
   ============================================================ */
L.prog = {
  chave: (cap, sec) => `${cap}/${sec}`,
  concluida(cap, sec) { return !!L.db.estado.secoes[this.chave(cap, sec)]; },

  concluir(cap, secObj) {
    const est = L.db.estado;
    const k = this.chave(cap.num, secObj.id);
    const primeira = !est.secoes[k];
    est.secoes[k] = L.util.hoje();
    const novos = L.srs.desbloquear((secObj.cartoes || []).map(c => c.id));
    if (primeira) L.db.hist().secoes = (L.db.hist().secoes || 0) + 1;
    L.db.salvar();
    return novos;
  },

  continuar() {
    const u = L.db.estado.ultima;
    if (u && L.capitulos.find(c => c.num === u.cap) && !this.concluida(u.cap, u.sec)) return u;
    for (const cap of L.capitulos) {
      for (const s of cap.secoes) if (!this.concluida(cap.num, s.id)) return { cap: cap.num, sec: s.id };
    }
    return null;
  },

  pctCapitulo(cap) {
    const feitas = cap.secoes.filter(s => this.concluida(cap.num, s.id)).length;
    return Math.round(100 * feitas / cap.secoes.length);
  },

  /** Desempenho nas práticas de uma seção: { acertos, total } somando os blocos já feitos. */
  praticaSecao(cap, sec) {
    let a = 0, t = 0;
    for (const [k, v] of Object.entries(L.db.estado.praticas)) {
      if (k.startsWith(`${cap}/${sec}/`)) { a += v.acertos; t += v.total; }
    }
    return t ? { acertos: a, total: t } : null;
  },

  diasAtivos() {
    const h = L.db.estado.historico;
    return Object.keys(h).filter(d => h[d].revisoes || h[d].exercicios || h[d].secoes).sort();
  },

  sequencia() {
    const h = L.db.estado.historico;
    const ativo = d => h[d] && (h[d].revisoes || h[d].exercicios || h[d].secoes);
    let dia = L.util.hoje();
    if (!ativo(dia)) dia = L.util.somarDias(dia, -1);
    let n = 0;
    while (ativo(dia)) { n++; dia = L.util.somarDias(dia, -1); }
    return n;
  }
};

/* ============================================================
   ROTAS E TELAS
   ============================================================ */
const $main = () => document.getElementById('principal');

L.telas = {
  /* ---------------- Início ---------------- */
  painel() {
    const fila = L.srs.filaDoDia();
    const pendentes = fila.devidos.length + fila.novos.length;
    const cont = L.prog.continuar();
    const seq = L.prog.sequencia();
    const h = L.db.hist();
    const nome = L.db.estado.config.nome.trim().split(/\s+/)[0];
    let contHtml;
    if (cont) {
      const cap = L.capitulos.find(c => c.num === cont.cap);
      const sec = cap.secoes.find(s => s.id === cont.sec);
      const comecou = Object.keys(L.db.estado.secoes).length > 0;
      contHtml = `<a class="cartao destaque" href="#/cap/${cont.cap}/${cont.sec}">
        <div class="rotulo">${comecou ? 'Continuar de onde parou' : 'Comece por aqui'}</div>
        <div class="titulo-cartao">${cap.num}.${sec.id} ${sec.titulo}</div>
        <div class="sub">Cap. ${cap.num}: ${cap.titulo}</div></a>`;
    } else {
      contHtml = `<div class="cartao destaque"><div class="titulo-cartao">Você concluiu todo o conteúdo disponível! 🎉</div>
        <div class="sub">Continue com a revisão diária e os treinos. Novos capítulos serão adicionados.</div></div>`;
    }
    $main().innerHTML = `
      <h1 class="saudacao">Olá${nome ? `, ${L.util.esc(nome)}` : ''}! 👋</h1>
      ${contHtml}
      <div class="grade2">
        <a class="cartao ${pendentes ? 'chamativo' : ''}" href="#/revisar">
          <div class="rotulo">Revisão do dia</div>
          <div class="numero">${pendentes}</div>
          <div class="sub">${fila.devidos.length} para revisar · ${fila.novos.length} novos</div></a>
        <a class="cartao" href="#/treino">
          <div class="rotulo">Treino</div>
          <div class="numero">🎯</div>
          <div class="sub">exercícios novos a cada vez</div></a>
      </div>
      <div class="grade2">
        <div class="cartao"><div class="rotulo">Sequência</div><div class="numero">${seq} 🔥</div><div class="sub">dia(s) seguidos</div></div>
        <div class="cartao"><div class="rotulo">Hoje</div><div class="numero">${(h.exercicios || 0) + h.revisoes}</div><div class="sub">exercícios e cartões</div></div>
      </div>
      <h2>Progresso</h2>
      ${L.capitulos.map(c => `<a class="barra-cap" href="#/cap/${c.num}">
        <span>Cap. ${c.num}</span><div class="barra"><div style="width:${L.prog.pctCapitulo(c)}%"></div></div><span>${L.prog.pctCapitulo(c)}%</span></a>`).join('')}
      ${L.instalacao.htmlBotao()}`;
    L.instalacao.ligarBotao();
  },

  /* ---------------- Lista de capítulos ---------------- */
  curso() {
    const disp = new Set(L.capitulos.map(c => c.num));
    $main().innerHTML = `<h1>Conteúdo</h1>
      <p class="sub">Segue o livro-texto <i>Álgebra Linear Essencial</i> (R. F. de Lima).</p>
      <div class="lista-caps">${L.planoCurso.map(([n, t]) => disp.has(n)
        ? `<a class="cap-item" href="#/cap/${n}"><span class="cap-num">${n}</span><span class="cap-tit">${t}</span><span class="cap-pct">${L.prog.pctCapitulo(L.capitulos.find(c => c.num === n))}%</span></a>`
        : `<div class="cap-item bloqueado"><span class="cap-num">${n}</span><span class="cap-tit">${t}</span><span class="cap-pct">em breve</span></div>`).join('')}</div>`;
  },

  /* ---------------- Capítulo ---------------- */
  capitulo(num) {
    const cap = L.capitulos.find(c => c.num === num);
    if (!cap) return L.telas.naoEncontrado();
    $main().innerHTML = `<a class="voltar" href="#/curso">← Conteúdo</a>
      <h1>Capítulo ${cap.num}</h1><h2 class="cap-titulo">${cap.titulo}</h2>
      <p class="sub">${cap.subtitulo}<br>📖 ${cap.livro}</p>
      <ol class="lista-secoes">${cap.secoes.map(s => {
        const feita = L.prog.concluida(cap.num, s.id);
        const p = L.prog.praticaSecao(cap.num, s.id);
        return `<li><a href="#/cap/${cap.num}/${s.id}" class="${feita ? 'feita' : ''}">
          <span class="marca">${feita ? '✓' : s.id}</span><span class="sec-tit">${s.titulo}</span>
          ${p ? `<span class="sec-nota">${p.acertos}/${p.total}</span>` : ''}</a></li>`;
      }).join('')}</ol>`;
  },

  /* ---------------- Seção ---------------- */
  secao(num, id) {
    const cap = L.capitulos.find(c => c.num === num);
    const idx = cap ? cap.secoes.findIndex(s => s.id === id) : -1;
    if (idx < 0) return L.telas.naoEncontrado();
    const sec = cap.secoes[idx];
    L.db.estado.ultima = { cap: num, sec: id };
    L.db.salvar();

    const m = $main();
    m.innerHTML = `<a class="voltar" href="#/cap/${num}">← Cap. ${num}</a>
      <div class="sec-cab"><span class="sec-num">${num}.${sec.id}</span><h1>${sec.titulo}</h1></div>`;
    sec.blocos.forEach((b, k) => m.appendChild(L.blocos.render(b, cap, { sec, idx: k })));

    const prox = cap.secoes[idx + 1];
    const proxCap = L.capitulos[L.capitulos.indexOf(cap) + 1];
    const proxRota = prox ? `#/cap/${num}/${prox.id}`
      : (proxCap ? `#/cap/${proxCap.num}/${proxCap.secoes[0].id}` : `#/cap/${num}`);
    const feita = L.prog.concluida(num, id);
    const rodape = L.ui.el(`<div class="rodape-secao">
      ${idx > 0 ? `<a class="btn" href="#/cap/${num}/${cap.secoes[idx - 1].id}">← Anterior</a>` : '<span></span>'}
      <button class="btn primario concluir">${feita ? (prox ? 'Próxima seção →' : (proxCap ? `Cap. ${proxCap.num} →` : 'Fim do capítulo ✓')) : 'Concluir seção ✓'}</button></div>`);
    rodape.querySelector('.concluir').addEventListener('click', () => {
      const novos = L.prog.concluir(cap, sec);
      if (novos) L.toast(`${novos} cartões adicionados à revisão diária.`);
      location.hash = proxRota;
    });
    m.appendChild(rodape);
  },

  /* ---------------- Revisão espaçada ---------------- */
  revisar() {
    const fila = L.srs.filaDoDia();
    const sessao = fila.devidos.slice();
    fila.novos.forEach((id, k) => sessao.splice(Math.min(sessao.length, k * 3 + 2), 0, id));
    const m = $main();
    if (!sessao.length) {
      const total = Object.keys(L.db.estado.cartoes).length;
      m.innerHTML = `<h1>Revisão do dia</h1><div class="cartao destaque">
        <div class="titulo-cartao">${total ? 'Nada pendente por hoje. ✨' : 'Ainda não há cartões.'}</div>
        <div class="sub">${total ? `Você tem ${total} cartões no total${fila.totalNovos ? `, ${fila.totalNovos} novos aguardando (limite diário atingido)` : ''}.` : 'Cada seção concluída libera cartões com as definições e os resultados principais. Eles voltam em intervalos crescentes, para você não esquecer.'}</div></div>
        <a class="btn primario largo" href="#/treino">Fazer um treino →</a>`;
      return;
    }
    let feitos = 0, acertos = 0;
    const inicial = sessao.length;

    const mostrar = () => {
      if (!sessao.length) {
        m.innerHTML = `<h1>Revisão concluída</h1><div class="resultado"><div class="placar">${acertos} / ${feitos}</div>
          <div class="sub">cartões lembrados</div></div><a class="btn primario largo" href="#/">Voltar ao início</a>`;
        return;
      }
      const id = sessao[0];
      const c = L.cartoes[id];
      const est = L.db.estado.cartoes[id];
      const cap = L.capitulos.find(x => x.num === c.cap);
      const sec = cap && cap.secoes.find(s => s.id === c.sec);
      m.innerHTML = `<div class="rev-cab"><a class="voltar" href="#/">← Sair</a><span>${Math.max(0, inicial - feitos)} restantes</span></div>
        <div class="barra fina"><div style="width:${Math.min(100, 100 * feitos / Math.max(inicial, feitos + sessao.length))}%"></div></div>
        <div class="flash">${est.fase === 'novo' ? '<span class="selo novo">novo</span>' : ''}
          <div class="flash-origem sub">${sec ? `${cap.num}.${sec.id} ${sec.titulo}` : ''}</div>
          <div class="flash-frente">${c.frente}</div><div class="flash-area"></div></div>`;
      const area = m.querySelector('.flash-area');
      const bt = L.ui.el('<button class="btn primario largo">Mostrar resposta</button>');
      bt.addEventListener('click', () => {
        bt.remove();
        area.appendChild(L.ui.el(`<div class="flash-verso">${c.verso}</div>`));
        const nomes = ['Errei', 'Difícil', 'Bom', 'Fácil'];
        const div = L.ui.el(`<div class="notas">${nomes.map((n, k) => `<button class="btn nota n${k}" data-n="${k}">${n}<small>${L.srs.rotuloIntervalo(id, k)}</small></button>`).join('')}</div>`);
        div.addEventListener('click', e => {
          const b = e.target.closest('button[data-n]');
          if (!b) return;
          const n = Number(b.dataset.n);
          L.srs.responder(id, n);
          feitos++;
          if (n > 0) acertos++;
          sessao.shift();
          if (n === 0) sessao.push(id);
          mostrar();
        });
        area.appendChild(div);
      });
      area.appendChild(bt);
    };
    mostrar();
  },

  /* ---------------- Treino (exercícios gerados) ---------------- */
  treino(id) {
    const m = $main();
    const gs = Object.values(L.geradores);
    if (!id) {
      const est = L.db.estado.treino;
      const porSecao = {};
      for (const g of gs) (porSecao[`${g.cap}/${g.sec}`] = porSecao[`${g.cap}/${g.sec}`] || []).push(g);
      const grupos = Object.entries(porSecao).map(([k, lista]) => {
        const [c, s] = k.split('/').map(Number);
        const cap = L.capitulos.find(x => x.num === c);
        const sec = cap && cap.secoes.find(x => x.id === s);
        return `<h3 class="grupo-treino">${c}.${s} ${sec ? sec.titulo : ''} ${L.prog.concluida(c, s) ? '<span class="selo st-ok">estudada</span>' : ''}</h3>
          <div class="lista-treinos">${lista.map(g => {
            const st = est[g.id];
            return `<a class="treino-item" href="#/treino/${g.id}"><span class="treino-nome">${g.titulo}</span>
              <span class="treino-st">${st ? `${st.acertos}/${st.feitos}` : 'novo'}</span></a>`;
          }).join('')}</div>`;
      }).join('');
      m.innerHTML = `<h1>Treino</h1>
        <p class="sub">Exercícios gerados na hora, com correção imediata e solução comentada. Nunca acabam: faça quantos quiser.</p>
        <a class="btn primario largo" href="#/treino/misto">🔀 Treino misto (seções estudadas)</a>
        ${grupos}`;
      return;
    }
    let escolhidos;
    let titulo;
    if (id === 'misto') {
      const estudados = gs.filter(g => L.prog.concluida(g.cap, g.sec));
      escolhidos = estudados.length ? estudados : gs;
      titulo = estudados.length ? 'Treino misto' : 'Treino misto (todas as seções)';
    } else {
      const g = L.geradores[id];
      if (!g) return L.telas.naoEncontrado();
      escolhidos = [g];
      titulo = g.titulo;
    }
    const n = L.db.estado.config.itensPorTreino;
    const ordem = L.util.embaralhar(escolhidos); // no misto, percorre os geradores em ordem aleatória
    const itens = [];
    for (let k = 0; k < n; k++) {
      const g = ordem[k % ordem.length];
      const item = g.gerar();
      item.gerador = g.id;
      itens.push(item);
    }
    const um = escolhidos.length === 1 ? escolhidos[0] : null;
    m.innerHTML = `<a class="voltar" href="#/treino">← Treino</a><h1>${titulo}</h1>
      ${um ? `<p class="sub">Da seção <a href="#/cap/${um.cap}/${um.sec}">${um.cap}.${um.sec}</a>. Errou? Você pode tentar de novo antes de ver a solução.</p>` : ''}
      <div class="bloco pratica"><div class="pratica-cab"><h3>🎯 Sessão</h3><span class="pratica-cont"></span></div><div class="pratica-corpo"></div></div>`;
    L.quiz.iniciar(itens, m.querySelector('.pratica-corpo'), m.querySelector('.pratica-cont'), () => {
      const bt = L.ui.el('<button class="btn primario">Nova sessão</button>');
      bt.addEventListener('click', () => L.telas.treino(id));
      m.querySelector('.pratica-corpo .resultado').after(bt);
    }, {
      aoResponder(item, ok) {
        const t = L.db.estado.treino;
        const st = t[item.gerador] || (t[item.gerador] = { feitos: 0, acertos: 0 });
        st.feitos++;
        if (ok) st.acertos++;
      }
    });
  },

  /* ---------------- Resumo (fórmulas e resultados) ---------------- */
  resumo() {
    $main().innerHTML = `<h1>Resumo</h1><p class="sub">Os resultados principais de cada seção, para consulta rápida.</p>
      ${L.capitulos.map(cap => `<h2>Cap. ${cap.num}: ${cap.titulo}</h2>
        ${cap.secoes.map(s => `<div class="bloco resumo-sec"><a class="resumo-tit" href="#/cap/${cap.num}/${s.id}">${cap.num}.${s.id} ${s.titulo}</a>
          <ul>${(s.resumo || []).map(r => `<li>${r}</li>`).join('')}</ul></div>`).join('')}`).join('')}`;
  },

  /* ---------------- Ajustes ---------------- */
  ajustes() {
    const cfg = L.db.estado.config;
    const m = $main();
    m.innerHTML = `<h1>Ajustes</h1>
      <div class="bloco form">
        <label>Seu nome <input type="text" id="cfg-nome" value="${L.util.esc(cfg.nome)}" placeholder="opcional" autocomplete="name"></label>
        <label>Exercícios por treino <input type="number" min="3" max="30" id="cfg-treino" value="${cfg.itensPorTreino}"></label>
        <label>Cartões novos por dia <input type="number" min="0" max="100" id="cfg-novos" value="${cfg.novosPorDia}"></label>
        <label>Tema <select id="cfg-tema">
          <option value="auto" ${cfg.tema === 'auto' ? 'selected' : ''}>Automático</option>
          <option value="claro" ${cfg.tema === 'claro' ? 'selected' : ''}>Claro</option>
          <option value="escuro" ${cfg.tema === 'escuro' ? 'selected' : ''}>Escuro</option></select></label>
      </div>
      <h2>Como digitar respostas</h2>
      <div class="bloco texto sub">
        <p>Números: <code>-12</code>, frações: <code>3/4</code>, decimais: <code>0,5</code>. Potências: <code>x^3</code>. Multiplicação: <code>2*x</code> ou só <code>2x</code>. Conjuntos de valores: <code>-2; 3</code>.</p>
      </div>
      <h2>Relatório para o professor</h2>
      <div class="bloco">
        <p class="sub">Gera um resumo do seu uso do app (seções, exercícios, acertos e dias de estudo) para enviar ao professor.</p>
        <button class="btn primario" id="relatorio">📤 Gerar e compartilhar relatório</button>
        <textarea id="txt-relatorio" class="resp-longa" rows="9" readonly hidden></textarea>
      </div>
      <h2>Seu progresso</h2>
      <div class="bloco">
        <p>O progresso fica salvo <b>neste aparelho</b>. Faça cópias de segurança de vez em quando e use-as para levar o progresso de um aparelho para outro.</p>
        <p id="persist" class="sub"></p>
        <div class="botoes"><button class="btn" id="exportar">⬇ Exportar progresso</button>
        <label class="btn">⬆ Importar progresso<input type="file" accept="application/json,.json" id="importar" hidden></label></div>
      </div>
      ${L.instalacao.htmlBotao()}
      <h2>Zona de perigo</h2>
      <button class="btn errado" id="resetar">Apagar todo o progresso</button>
      <p class="sub rodape-app">Álgebra Linear I · UFRN · Prof. Roberto Teodoro. Material de apoio ao livro-texto.</p>`;
    L.instalacao.ligarBotao();

    const salvar = () => {
      cfg.nome = m.querySelector('#cfg-nome').value.trim();
      cfg.itensPorTreino = Math.min(30, Math.max(3, Number(m.querySelector('#cfg-treino').value) || 8));
      cfg.novosPorDia = Math.max(0, Number(m.querySelector('#cfg-novos').value) || 0);
      cfg.tema = m.querySelector('#cfg-tema').value;
      L.db.salvar();
      L.aplicarTema();
    };
    m.querySelectorAll('.form input, .form select').forEach(e => e.addEventListener('change', salvar));

    m.querySelector('#relatorio').addEventListener('click', async () => {
      salvar();
      const txt = L.relatorio();
      const ta = m.querySelector('#txt-relatorio');
      ta.value = txt;
      ta.hidden = false;
      if (navigator.share) {
        try { await navigator.share({ title: 'Álgebra Linear I: relatório', text: txt }); return; } catch (e) { /* cancelado */ }
      }
      try { await navigator.clipboard.writeText(txt); L.toast('Relatório copiado. Cole numa mensagem ao professor.'); }
      catch (e) { ta.select(); L.toast('Copie o texto abaixo e envie ao professor.'); }
    });

    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(p => {
        m.querySelector('#persist').textContent = p
          ? '✓ O navegador marcou estes dados como persistentes.'
          : 'O navegador ainda não marcou os dados como persistentes. Instalar o app costuma resolver; ainda assim, exporte de vez em quando.';
      });
    }
    m.querySelector('#exportar').addEventListener('click', () => {
      const blob = new Blob([L.db.exportar()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `algebra-linear-progresso-${L.util.hoje()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    m.querySelector('#importar').addEventListener('change', async e => {
      const f = e.target.files[0];
      if (!f) return;
      if (!confirm('Substituir o progresso deste aparelho pelo do arquivo?')) return;
      try {
        L.db.importar(await f.text());
        L.aplicarTema();
        L.toast('Progresso importado.');
        location.hash = '#/';
      } catch (err) { alert('Não foi possível importar: ' + err.message); }
    });
    m.querySelector('#resetar').addEventListener('click', () => {
      if (confirm('Apagar TODO o progresso? Isso não pode ser desfeito (a não ser que você tenha exportado uma cópia).')) {
        L.db.resetar();
        L.toast('Progresso apagado.');
        location.hash = '#/';
      }
    });
  },

  naoEncontrado() {
    $main().innerHTML = '<h1>Página não encontrada</h1><a class="btn" href="#/">Voltar ao início</a>';
  }
};

/* ============================================================
   RELATÓRIO DE USO (texto simples para o estudante enviar)
   ============================================================ */
L.relatorio = function () {
  const est = L.db.estado;
  const dias = L.prog.diasAtivos();
  let ex = 0, certos = 0;
  for (const d of dias) { ex += est.historico[d].exercicios || 0; certos += est.historico[d].certos || 0; }
  const linhas = [
    'Álgebra Linear I (UFRN): relatório de estudo no app',
    `Estudante: ${est.config.nome || '(sem nome; preencha em Ajustes)'}`,
    `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    `Começou em: ${new Date(est.criadoEm).toLocaleDateString('pt-BR')}`,
    `Dias de estudo: ${dias.length}${dias.length ? ` (${dias.map(d => d.slice(8, 10) + '/' + d.slice(5, 7)).join(', ')})` : ''}`,
    `Exercícios resolvidos: ${ex} (acertos de primeira: ${ex ? Math.round(100 * certos / ex) : 0}%)`,
    `Cartões de revisão: ${Object.keys(est.cartoes).length}`,
    ''
  ];
  for (const cap of L.capitulos) {
    linhas.push(`Cap. ${cap.num}: ${cap.titulo}`);
    for (const s of cap.secoes) {
      const p = L.prog.praticaSecao(cap.num, s.id);
      linhas.push(`  ${L.prog.concluida(cap.num, s.id) ? '[x]' : '[ ]'} ${cap.num}.${s.id} ${s.titulo}${p ? ` (fixação: ${p.acertos}/${p.total})` : ''}`);
    }
  }
  const tr = Object.entries(est.treino);
  if (tr.length) {
    linhas.push('', 'Treinos (acertos de primeira / feitos):');
    for (const [id, st] of tr) linhas.push(`  ${L.geradores[id] ? L.geradores[id].titulo : id}: ${st.acertos}/${st.feitos}`);
  }
  return linhas.join('\n');
};

/* ============================================================
   INSTALAÇÃO (PWA)
   ============================================================ */
L.instalacao = {
  evento: null,
  instalado() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  },
  htmlBotao() {
    if (this.instalado()) return '';
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (this.evento) return '<div class="bloco instalar"><button class="btn primario largo" id="instalar">📲 Instalar o app neste aparelho</button></div>';
    if (ios) return '<div class="bloco instalar sub">📲 Para instalar no iPhone/iPad: toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</div>';
    return '';
  },
  ligarBotao() {
    const b = document.getElementById('instalar');
    if (!b) return;
    b.addEventListener('click', async () => {
      if (!this.evento) return;
      this.evento.prompt();
      await this.evento.userChoice;
      this.evento = null;
      L.roteador();
    });
  }
};

/* ============================================================
   INFRAESTRUTURA
   ============================================================ */
L.toast = function (msg) {
  const t = L.ui.el(`<div class="toast">${L.util.esc(msg)}</div>`);
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('saindo'), 2500);
  setTimeout(() => t.remove(), 3000);
};

L.aplicarTema = function () {
  document.documentElement.dataset.tema = L.db.estado.config.tema;
};

L.roteador = function () {
  const partes = (location.hash || '#/').slice(2).split('/').filter(Boolean);
  const [r, a, b] = partes;
  const nav = r || 'inicio';
  document.querySelectorAll('.nav a').forEach(x => x.classList.toggle('ativo', x.dataset.rota === (nav === 'cap' ? 'curso' : nav)));
  if (!r) L.telas.painel();
  else if (r === 'curso') L.telas.curso();
  else if (r === 'cap' && b) L.telas.secao(Number(a), Number(b));
  else if (r === 'cap') L.telas.capitulo(Number(a));
  else if (r === 'revisar') L.telas.revisar();
  else if (r === 'treino') L.telas.treino(a);
  else if (r === 'resumo') L.telas.resumo();
  else if (r === 'ajustes') L.telas.ajustes();
  else L.telas.naoEncontrado();
  window.scrollTo(0, 0);
};

L.iniciar = function () {
  L.db.carregar();
  L.aplicarTema();
  L.construirCartoes();
  L.ui.instalarCampos();
  L.formulas.instalar();
  window.addEventListener('hashchange', L.roteador);
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    L.instalacao.evento = e;
    if (['', '#/', '#/ajustes'].includes(location.hash)) L.roteador();
  });
  L.roteador();
  L.db.pedirPersistencia();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker não registrado:', err));
  }
};

document.addEventListener('DOMContentLoaded', L.iniciar);
