/* Capítulo 4 — Determinantes.
   Segue o livro-texto (R. F. de Lima, Álgebra Linear Essencial), seções 4.1 a 4.3,
   sem a subseção 4.3.3 (matrizes diagonais por blocos) e sem a seção 4.4.
   Contas conferidas com sympy. Use R`...` (String.raw) para escrever LaTeX sem duplicar barras;
   nunca escreva o par "cifrão + chave" (é interpolação do JavaScript). */
(function () {
  const T = L.tex;

  /* Diagrama da regra de Sarrus (SVG). */
  const sub = (i, j) => `a<tspan dy="5" font-size="62%">${i}${j}</tspan>`;
  const xs = [32, 82, 132, 182, 232], ys = [34, 74, 114];
  const entradas = ys.map((y, i) => xs.map((x, c) =>
    `<text x="${x}" y="${y}" text-anchor="middle" class="${c > 2 ? 'rep' : ''}">${sub(i + 1, (c % 3) + 1)}</text>`).join('')).join('');
  const mais = [0, 1, 2].map(c => `<line class="mais" x1="${xs[c] - 16}" y1="${ys[0] - 16}" x2="${xs[c + 2] + 16}" y2="${ys[2] + 6}"/>
    <text class="sinal mais-t" x="${xs[c + 2] + 14}" y="${ys[2] + 26}">+</text>`).join('');
  const menos = [2, 3, 4].map(c => `<line class="menos" x1="${xs[c] + 16}" y1="${ys[0] - 16}" x2="${xs[c - 2] - 16}" y2="${ys[2] + 6}"/>
    <text class="sinal menos-t" x="${xs[c] + 14}" y="${ys[0] - 18}">−</text>`).join('');
  const SARRUS = `<svg class="sarrus" viewBox="0 0 270 150" role="img" aria-label="Regra de Sarrus: repetem-se as duas primeiras colunas; as três diagonais descendentes entram com sinal +, as três ascendentes com sinal −.">
    <line class="barra-det" x1="10" y1="14" x2="10" y2="122"/><line class="barra-det" x1="155" y1="14" x2="155" y2="122"/>
    ${mais}${menos}${entradas}</svg>`;

  L.registrarCapitulo({
    num: 4,
    titulo: 'Determinantes',
    subtitulo: 'Cálculo, propriedades e aplicações: invertibilidade, sistemas, inversa e posto.',
    livro: 'Livro-texto, cap. 4, seções 4.1 a 4.3 (sem a 4.3.3)',

    secoes: [
      /* =============================================================== 1 */
      {
        id: 1,
        titulo: 'O determinante de uma matriz 2×2',
        resumo: [
          R`$\det\begin{bmatrix}a&b\\c&d\end{bmatrix}=\begin{vmatrix}a&b\\c&d\end{vmatrix}=ad-bc$.`,
          R`Para $A\in M(2)$: $A$ é invertível $\iff$ $AX=B$ tem solução única para todo $B$ $\iff$ $\det A\neq 0$ (Prop. 4.1).`,
          R`$|\det A|$ é a área do paralelogramo gerado pelas colunas de $A$; o sinal indica a orientação.`,
          R`O determinante é a única função de $\mathbb{R}^2\times\mathbb{R}^2$ que é bilinear, alternada e vale $1$ em $(e_1,e_2)$.`
        ],
        cartoes: [
          { id: 'c4.1a', frente: R`$\det\begin{bmatrix}a&b\\c&d\end{bmatrix}=\ ?$`, verso: R`$ad-bc$ (diagonal principal menos a secundária)` },
          { id: 'c4.1b', frente: R`Para $A\in M(2)$, o que garante $\det A\neq0$?`, verso: R`$A$ é invertível e $AX=B$ tem uma única solução para todo $B$ (Prop. 4.1).` },
          { id: 'c4.1c', frente: R`Qual o significado geométrico de $\det A$, para $A\in M(2)$?`, verso: R`$|\det A|$ = área do paralelogramo gerado pelas colunas de $A$; o sinal diz se a orientação de $(e_1,e_2)$ foi preservada ($+$) ou invertida ($-$).` }
        ],
        blocos: [
          { t: 'html', html: R`
            <p>Comecemos por um sistema $2\times 2$:
            $$\begin{cases} ax+by=e\\ cx+dy=f \end{cases}$$
            ou, na forma matricial, $AX=B$ com $A=\begin{bmatrix}a&b\\c&d\end{bmatrix}$. Escalonando, vê-se que ele tem <b>uma única solução</b>, qualquer que seja o lado direito, exatamente quando o número $ad-bc$ é diferente de zero. Esse número recebe um nome.</p>` },
          { t: 'teo', rotulo: 'Definição', html: R`
            <p>O <b>determinante</b> de $A=\begin{bmatrix}a&b\\c&d\end{bmatrix}\in M(2)$ é o número
            $$\det A=\begin{vmatrix}a&b\\c&d\end{vmatrix}=ad-bc.$$</p>` },
          { t: 'atencao', titulo: 'Notação', html: R`<p>As barras em $\begin{vmatrix}a&b\\c&d\end{vmatrix}$ indicam determinante, <b>não</b> módulo: o determinante pode ser negativo. Por exemplo, $\begin{vmatrix}1&2\\3&4\end{vmatrix}=4-6=-2$.</p>` },
          { t: 'pratica', itens: [
            { t: 'num', p: R`Calcule $\begin{vmatrix}3&5\\2&4\end{vmatrix}$.`, r: 2, exp: R`$3\cdot4-5\cdot2=12-10=2$.` },
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}2&-1\\4&3\end{bmatrix}$.`, r: 10, exp: R`$2\cdot3-(-1)\cdot4=6+4=10$. Cuidado com o sinal: subtrai-se o produto $(-1)\cdot 4=-4$.` },
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}-2&3\\4&-6\end{bmatrix}$.`, r: 0, exp: R`$(-2)(-6)-3\cdot4=12-12=0$. Repare que a 2ª linha é $-2$ vezes a 1ª.` }
          ] },
          { t: 'teo', rotulo: 'Proposição 4.1', html: R`
            <p>Para $A\in M(2)$, são equivalentes:</p>
            <ul><li>para toda matriz coluna $B$, o sistema $AX=B$ tem uma única solução;</li>
            <li>$A$ é invertível;</li>
            <li>$\det A\neq0$.</li></ul>` },
          { t: 'pratica', itens: [
            { t: 'escolha', p: R`Qual destas matrizes <b>não</b> é invertível?`,
              op: [R`$\begin{bmatrix}2&1\\3&2\end{bmatrix}$`, R`$\begin{bmatrix}1&3\\2&6\end{bmatrix}$`, R`$\begin{bmatrix}0&1\\1&0\end{bmatrix}$`, R`$\begin{bmatrix}4&2\\1&1\end{bmatrix}$`], c: 1,
              exp: R`Os determinantes são $1$, $0$, $-1$ e $2$. Só a de determinante $0$ não é invertível; nela, a 2ª coluna é o triplo da 1ª.` },
            { t: 'conj', p: R`Para quais valores de $k$ a matriz $\begin{bmatrix}k&2\\8&k\end{bmatrix}$ <b>não</b> é invertível?`, r: [-4, 4],
              exp: R`$\det = k^2-16=0\iff k=\pm4$.`, dica: R`Calcule o determinante em função de $k$ e iguale a zero.` }
          ] },
          { t: 'html', html: R`
            <h3>Para visualizar</h3>
            <p>As colunas de $A$ são as imagens de $e_1$ e $e_2$ pela transformação $X\mapsto AX$. O quadrado gerado por $e_1$ e $e_2$ (de área $1$) vira o paralelogramo gerado pelas colunas de $A$, e</p>
            <p class="centro"><b>$|\det A|$ = área desse paralelogramo.</b></p>
            <p>O sinal conta outra coisa: se $\det A\lt 0$, a transformação inverteu a orientação (as colunas ficam “na ordem trocada” em relação a $e_1,e_2$). E se $\det A=0$, o quadrado é achatado num segmento: não dá para desfazer a transformação, isto é, $A$ não é invertível.</p>` },
          { t: 'video', src: 'videos/det-area.mp4', legenda: R`O determinante como fator de área (27 s).` },
          { t: 'pratica', itens: [
            { t: 'num', p: R`Qual é a área do paralelogramo de vértices $(0,0)$, $(3,1)$, $(1,2)$ e $(4,3)$?`, r: 5,
              exp: R`É o paralelogramo gerado por $(3,1)$ e $(1,2)$. Área $=\left|\det\begin{bmatrix}3&1\\1&2\end{bmatrix}\right|=|6-1|=5$.`,
              dica: R`Ponha os vetores $(3,1)$ e $(1,2)$ como colunas de uma matriz.` },
            { t: 'vf', p: R`Se $\det A=-2$, o paralelogramo gerado pelas colunas de $A$ tem área $-2$.`, r: false,
              exp: R`Áreas não são negativas: a área é $|\det A|=2$. O sinal negativo só indica que a orientação foi invertida.` }
          ] },
          { t: 'html', html: R`
            <h3>As propriedades que caracterizam o determinante</h3>
            <p>No livro-texto, escrevemos $A=(v_1,v_2)$, em que $v_1,v_2$ são as <b>colunas</b> de $A$, e $D(v_1,v_2)=\det A$. Valem, para quaisquer vetores e qualquer $\lambda\in\mathbb{R}$:</p>
            <ol type="i">
              <li>$D(v_1+\lambda v_2,\,v_3)=D(v_1,v_3)+\lambda D(v_2,v_3)$ (linear na 1ª coluna);</li>
              <li>$D(v_1,\,v_2+\lambda v_3)=D(v_1,v_2)+\lambda D(v_1,v_3)$ (linear na 2ª coluna);</li>
              <li>$D(v,v)=0$ (<b>alternada</b>);</li>
              <li>$D(e_1,e_2)=1$.</li>
            </ol>
            <p>Delas sai que $D$ é <b>antissimétrica</b>: $D(v_1,v_2)=-D(v_2,v_1)$. Basta abrir $0=D(v_1+v_2,\,v_1+v_2)$ por (i) e (ii). E mais: <b>só existe uma</b> função com (i)–(iv), a fórmula $ad-bc$. É essa caracterização que vai nos permitir definir o determinante para matrizes $n\times n$.</p>` },
          { t: 'pratica', titulo: 'Usando as propriedades', itens: [
            { t: 'num', p: R`Sabendo que $D(v_1,v_2)=7$, calcule $D(v_2,v_1)$.`, r: -7, exp: R`Trocar as colunas troca o sinal (antissimetria).` },
            { t: 'num', p: R`Sabendo que $D(v_1,v_2)=7$, calcule $D(3v_1,\,v_2)$.`, r: 21, exp: R`Linearidade na 1ª coluna: $D(3v_1,v_2)=3D(v_1,v_2)=21$.` },
            { t: 'num', p: R`Sabendo que $D(v_1,v_2)=7$, calcule $D(v_1+2v_2,\,v_2)$.`, r: 7,
              exp: R`$D(v_1+2v_2,v_2)=D(v_1,v_2)+2D(v_2,v_2)=7+2\cdot0=7$. Somar a uma coluna um múltiplo da <b>outra</b> não altera o determinante.` },
            { t: 'vf', p: R`Para quaisquer $A,B\in M(2)$, vale $\det(A+B)=\det A+\det B$.`, r: false,
              exp: R`Contraexemplo: $A=B=I$ dá $\det(2I)=4$, mas $\det I+\det I=2$. O determinante é linear em <b>cada coluna separadamente</b>, não como função da matriz inteira.` }
          ] },
          { t: 'reforco', geradores: ['det2'] }
        ]
      },

      /* =============================================================== 2 */
      {
        id: 2,
        titulo: 'Matrizes 3×3 e a regra de Sarrus',
        resumo: [
          R`$\det A=a_{11}a_{22}a_{33}+a_{12}a_{23}a_{31}+a_{13}a_{21}a_{32}-a_{13}a_{22}a_{31}-a_{11}a_{23}a_{32}-a_{12}a_{21}a_{33}$.`,
          R`Cada parcela usa exatamente uma entrada de cada linha e de cada coluna; para $n\times n$ são $n!$ parcelas.`,
          R`A regra de Sarrus vale <b>só</b> para matrizes $3\times3$.`
        ],
        cartoes: [
          { id: 'c4.2a', frente: R`Como funciona a regra de Sarrus?`, verso: R`Repetem-se as duas primeiras colunas à direita; somam-se os produtos das 3 diagonais descendentes e subtraem-se os das 3 ascendentes. Só vale para $3\times3$.` },
          { id: 'c4.2b', frente: R`Quantas parcelas tem a fórmula do determinante de uma matriz $n\times n$?`, verso: R`$n!$ (uma para cada permutação): $2$, $6$, $24$, $120$, …` }
        ],
        blocos: [
          { t: 'html', html: R`
            <p>Para $A=(a_{ij})\in M(3)$, as propriedades do determinante (linear em cada coluna, alternado, valendo $1$ em $I$) obrigam a fórmula
            $$\begin{aligned}\det A={}&a_{11}a_{22}a_{33}+a_{12}a_{23}a_{31}\\&+a_{13}a_{21}a_{32}-a_{13}a_{22}a_{31}\\&-a_{11}a_{23}a_{32}-a_{12}a_{21}a_{33}.\end{aligned}$$
            Observe: cada uma das $6$ parcelas usa <b>exatamente uma entrada de cada linha e de cada coluna</b>.</p>
            <h3>Regra de Sarrus</h3>
            <p>Um jeito de não esquecer a fórmula: repita as duas primeiras colunas à direita. As <span class="cor-mais">três diagonais descendentes</span> entram com sinal $+$ e as <span class="cor-menos">três ascendentes</span> com sinal $-$.</p>
            <div class="figura">${SARRUS}</div>` },
          { t: 'exemplo', enunciado: R`Calcule $\det\begin{bmatrix}2&-1&3\\1&4&0\\-2&1&5\end{bmatrix}$.`, solucao: R`
            <p>Descendentes: $2\cdot4\cdot5+(-1)\cdot0\cdot(-2)+3\cdot1\cdot1=40+0+3=43$.</p>
            <p>Ascendentes: $3\cdot4\cdot(-2)+2\cdot0\cdot1+(-1)\cdot1\cdot5=-24+0-5=-29$.</p>
            <p>Logo $\det A=43-(-29)=72$.</p>` },
          { t: 'pratica', itens: [
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}2&1&0\\1&3&1\\0&1&2\end{bmatrix}$.`, r: 8,
              exp: R`$(12+0+0)-(0+2+2)=12-4=8$.` },
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}1&2&3\\0&1&4\\5&6&0\end{bmatrix}$.`, r: 1,
              exp: R`Descendentes: $0+40+0=40$. Ascendentes: $15+24+0=39$. Logo $40-39=1$.` },
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}1&-1&2\\3&0&1\\2&1&-1\end{bmatrix}$.`, r: 0,
              exp: R`Descendentes: $0-2+6=4$. Ascendentes: $0+1+3=4$. Logo $\det=0$. Não é coincidência: $\ell_2=\ell_1+\ell_3$, e veremos que filas dependentes sempre dão determinante nulo.` },
            { t: 'escolha', p: R`Qual destes produtos <b>não</b> é (a menos de sinal) uma parcela de $\det A$, para $A\in M(3)$?`,
              op: [R`$a_{11}a_{22}a_{33}$`, R`$a_{12}a_{23}a_{31}$`, R`$a_{11}a_{12}a_{33}$`, R`$a_{13}a_{22}a_{31}$`], c: 2,
              exp: R`$a_{11}a_{12}a_{33}$ usa duas entradas da 1ª linha (e nenhuma da 2ª). Toda parcela usa uma entrada de cada linha e de cada coluna.` },
            { t: 'expr', p: R`Calcule $\det\begin{bmatrix}x&1&0\\1&x&1\\0&1&x\end{bmatrix}$ em função de $x$.`, r: 'x^3-2x', vars: ['x'], rtex: R`x^3-2x`, ph: 'ex.: x^3 - 5x',
              exp: R`Descendentes: $x^3+0+0$. Ascendentes: $0+x+x$. Logo $\det=x^3-2x=x(x^2-2)$.` }
          ] },
          { t: 'atencao', titulo: 'Sarrus só serve para 3×3', html: R`<p>Uma matriz $4\times4$ tem $4!=24$ parcelas no determinante; um “Sarrus” com as diagonais daria só $8$. Para ordem $\geq 4$ usaremos o desenvolvimento de Laplace e as operações sobre filas (próximas seções).</p>` },
          { t: 'pratica', itens: [
            { t: 'vf', p: R`Repetindo as três primeiras colunas de uma matriz $4\times4$ e somando/subtraindo os produtos das diagonais, obtém-se o seu determinante.`, r: false,
              exp: R`Esse procedimento dá apenas $8$ das $24$ parcelas. A regra de Sarrus é exclusiva da ordem $3$.` }
          ] },
          { t: 'reforco', geradores: ['det3'] }
        ]
      },

      /* =============================================================== 3 */
      {
        id: 3,
        titulo: 'Multilinear e alternado: as regras do jogo',
        resumo: [
          R`$\det$ é $n$-linear: linear em cada fila separadamente. Logo $\det(\lambda A)=\lambda^n\det A$ para $A\in M(n)$.`,
          R`$\det$ é alternado: fila nula, filas iguais, proporcionais ou, em geral, LD $\Rightarrow\det=0$ (Prop. 4.5).`,
          R`Trocar duas filas: o determinante <b>troca de sinal</b>. Multiplicar uma fila por $\lambda$: <b>multiplica por $\lambda$</b>. Somar a uma fila um múltiplo de <b>outra</b>: <b>não altera</b> (Prop. 4.14).`,
          R`$\det A^*=\det A$ (4.10): tudo o que vale para colunas vale para linhas.`
        ],
        cartoes: [
          { id: 'c4.3a', frente: R`O que acontece com $\det A$ quando trocamos duas filas de $A$?`, verso: R`Troca de sinal (o determinante é antissimétrico).` },
          { id: 'c4.3b', frente: R`O que acontece com $\det A$ quando somamos a uma fila um múltiplo de <b>outra</b> fila?`, verso: R`Nada: o determinante não se altera (Prop. 4.14).` },
          { id: 'c4.3c', frente: R`$A\in M(n)$ e $\lambda\in\mathbb{R}$: quanto vale $\det(\lambda A)$?`, verso: R`$\lambda^n\det A$: cada uma das $n$ linhas foi multiplicada por $\lambda$.` },
          { id: 'c4.3d', frente: R`Por que uma matriz com colunas LD tem determinante zero?`, verso: R`Uma coluna é combinação das outras; abrindo por linearidade, cada parcela tem duas colunas iguais e é nula (Prop. 4.5).` }
        ],
        blocos: [
          { t: 'html', html: R`
            <p>Para matrizes $n\times n$, o livro-texto identifica $A$ com a lista de suas colunas, $A=(v_1,\dots,v_n)$, e define o determinante como a função com as mesmas propriedades do caso $2\times2$.</p>` },
          { t: 'teo', rotulo: 'Definições 4.2, 4.4 e 4.7', html: R`
            <p>Uma função $f(v_1,\dots,v_n)$ é <b>$n$-linear</b> se é linear em cada $v_j$ quando as demais colunas ficam fixas:
            $$\begin{aligned}&f(\dots,\lambda v_j+w_j,\dots)\\&\ =\lambda f(\dots,v_j,\dots)+f(\dots,w_j,\dots).\end{aligned}$$
            Ela é <b>alternada</b> se vale $0$ sempre que duas colunas são iguais. A <b>função determinante</b> é a (única!) $n$-forma alternada com $\det(e_1,\dots,e_n)=\det I=1$.</p>` },
          { t: 'html', html: R`
            <p>Atenção à diferença entre “linear em cada coluna” e “linear”: multiplicar <b>uma</b> coluna por $\lambda$ multiplica o determinante por $\lambda$; multiplicar a <b>matriz toda</b> por $\lambda$ multiplica as $n$ colunas, logo
            $$\det(\lambda A)=\lambda^n\det A,\qquad A\in M(n).$$</p>` },
          { t: 'pratica', itens: [
            { t: 'num', p: R`Seja $A\in M(3)$ com $\det A=2$. Calcule $\det(3A)$.`, r: 54, exp: R`$\det(3A)=3^3\det A=27\cdot2=54$.` },
            { t: 'vf', p: R`Para $A\in M(2)$, vale $\det(2A)=2\det A$.`, r: false, exp: R`$\det(2A)=2^2\det A=4\det A$.` },
            { t: 'num', p: R`Seja $A\in M(4)$ com $\det A=-1$. Calcule $\det(-A)$.`, r: -1,
              exp: R`$\det(-A)=(-1)^4\det A=\det A=-1$. Em ordem par, trocar o sinal da matriz não altera o determinante.` }
          ] },
          { t: 'teo', rotulo: 'Proposições 4.5 e 4.6', html: R`
            <p>Para uma $n$-forma $f$: alternada $\iff$ <b>antissimétrica</b> (trocar duas colunas troca o sinal). E, se $f$ é alternada e $\{v_1,\dots,v_n\}$ é <b>LD</b>, então $f(v_1,\dots,v_n)=0$.</p>` },
          { t: 'html', html: R`
            <p>Como $\det A^*=\det A$ (igualdade (4.10) do livro), tudo isso vale também para as linhas. Chamamos de <b>fila</b> uma linha ou uma coluna. Em particular, $\det A=0$ sempre que $A$ tem:</p>
            <ul><li>uma fila nula;</li><li>duas filas iguais ou proporcionais;</li><li>uma fila que é combinação linear das outras.</li></ul>` },
          { t: 'pratica', itens: [
            { t: 'escolha', p: R`Sem fazer contas: qual destas matrizes tem determinante zero?`,
              op: [R`$\begin{bmatrix}1&2&3\\2&4&6\\1&0&1\end{bmatrix}$`, R`$\begin{bmatrix}1&2&3\\0&1&4\\5&6&0\end{bmatrix}$`, R`$\begin{bmatrix}2&1&0\\1&3&1\\0&1&2\end{bmatrix}$`, R`$\begin{bmatrix}1&0&0\\0&2&0\\0&0&3\end{bmatrix}$`], c: 0,
              exp: R`Na primeira, $\ell_2=2\ell_1$ (linhas proporcionais). As outras têm determinantes $1$, $8$ e $6$.` },
            { t: 'vf', p: R`Se $\det A=0$, então $A$ tem uma fila nula.`, r: false,
              exp: R`Contraexemplo: $\begin{bmatrix}1&2\\2&4\end{bmatrix}$ tem determinante $0$ e nenhuma fila nula. O que $\det A=0$ garante é que as filas são LD.` }
          ] },
          { t: 'tabela', titulo: 'As três operações sobre filas', cab: ['Operação', 'Efeito em det'], linhas: [
            [R`Trocar duas filas: $\ell_i\leftrightarrow\ell_j$`, R`troca o sinal`],
            [R`Multiplicar uma fila por $\lambda$: $\ell_i\to\lambda\ell_i$`, R`multiplica por $\lambda$`],
            [R`Somar a uma fila um múltiplo de <b>outra</b>: $\ell_i\to\ell_i+\lambda\ell_j$, $j\neq i$`, R`<b>não altera</b>`]
          ] },
          { t: 'html', html: R`
            <p>A terceira é a mais útil, e sai das duas regras básicas: por linearidade na fila $i$,
            $$\begin{aligned}&\det(\dots,\ell_i+\lambda\ell_j,\dots,\ell_j,\dots)\\&\ =\det(\dots,\ell_i,\dots,\ell_j,\dots)\\&\ \quad+\lambda\underbrace{\det(\dots,\ell_j,\dots,\ell_j,\dots)}_{=\,0}.\end{aligned}$$</p>` },
          { t: 'pratica', titulo: 'Sem conhecer as entradas', instrucao: R`Em todos os itens, $A\in M(3)$ tem linhas $\ell_1,\ell_2,\ell_3$ e $\det A=-3$.`, itens: [
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}\ell_3\\\ell_2\\\ell_1\end{bmatrix}$.`, r: 3, exp: R`Uma troca ($\ell_1\leftrightarrow\ell_3$): o sinal muda. $-(-3)=3$.` },
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}\ell_1\\4\ell_2\\\ell_3\end{bmatrix}$.`, r: -12, exp: R`Uma linha multiplicada por $4$: $4\cdot(-3)=-12$.` },
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}\ell_1\\\ell_2\\\ell_3-7\ell_1\end{bmatrix}$.`, r: -3, exp: R`Somou-se a $\ell_3$ um múltiplo de outra linha: não muda. $\det=-3$.` },
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}\ell_2\\\ell_1\\2\ell_3+\ell_1\end{bmatrix}$.`, r: 6,
              exp: R`Por linearidade na 3ª linha: $2\det(\ell_2,\ell_1,\ell_3)+\det(\ell_2,\ell_1,\ell_1)=2\cdot3+0=6$ (a troca $\ell_1\leftrightarrow\ell_2$ deu $+3$).`,
              dica: R`Abra a 3ª linha por linearidade. Uma das parcelas tem duas linhas iguais.` },
            { t: 'vf', p: R`A operação $\ell_1\to2\ell_1-\ell_2$ não altera o determinante.`, r: false,
              exp: R`Ela multiplica o determinante por $2$: a própria linha $\ell_1$ foi multiplicada por $2$. Só $\ell_i\to\ell_i+\lambda\ell_j$ (coeficiente $1$ em $\ell_i$) preserva o determinante.` }
          ] },
          { t: 'atencao', titulo: 'Erros comuns', html: R`
            <ul><li>$\det(A+B)\neq\det A+\det B$ em geral.</li>
            <li>$\det(\lambda A)=\lambda^n\det A$, e não $\lambda\det A$.</li>
            <li>Em $\ell_i\to a\ell_i+b\ell_j$, o determinante fica multiplicado por $a$.</li></ul>` },
          { t: 'reforco', geradores: ['filas'] }
        ]
      },

      /* =============================================================== 4 */
      {
        id: 4,
        titulo: 'Desenvolvimento de Laplace',
        resumo: [
          R`$A_{ij}$: matriz obtida de $A$ eliminando a linha $i$ e a coluna $j$. Cofator: $c_{ij}=(-1)^{i+j}\det A_{ij}$.`,
          R`Laplace pela linha $i$: $\det A=\sum_{j=1}^n(-1)^{i+j}a_{ij}\det A_{ij}$; pela coluna $j$: $\det A=\sum_{i=1}^n(-1)^{i+j}a_{ij}\det A_{ij}$.`,
          R`Desenvolva pela fila com <b>mais zeros</b>.`,
          R`Matriz triangular: $\det A=a_{11}a_{22}\cdots a_{nn}$.`
        ],
        cartoes: [
          { id: 'c4.4a', frente: R`O que é o cofator $c_{ij}$ de $A$?`, verso: R`$c_{ij}=(-1)^{i+j}\det A_{ij}$, sendo $A_{ij}$ a matriz sem a linha $i$ e a coluna $j$.` },
          { id: 'c4.4b', frente: R`Escreva o desenvolvimento de Laplace de $\det A$ pela linha $i$.`, verso: R`$\det A=\sum_{j=1}^n(-1)^{i+j}a_{ij}\det A_{ij}$` },
          { id: 'c4.4c', frente: R`Quanto vale o determinante de uma matriz triangular?`, verso: R`O produto das entradas da diagonal principal.` }
        ],
        blocos: [
          { t: 'teo', rotulo: 'Desenvolvimento de Laplace (4.6)', html: R`
            <p>Para $A=(a_{ij})\in M(n)$, seja $A_{ij}$ a matriz $(n-1)\times(n-1)$ obtida de $A$ <b>eliminando a linha $i$ e a coluna $j$</b>. O número $c_{ij}=(-1)^{i+j}\det A_{ij}$ é o <b>cofator</b> de $a_{ij}$. Para qualquer linha $i$,
            $$\begin{aligned}\det A&=\sum_{j=1}^{n}(-1)^{i+j}a_{ij}\det A_{ij}\\&=a_{i1}c_{i1}+\cdots+a_{in}c_{in},\end{aligned}$$
            e, como $\det A^*=\det A$, vale o mesmo para qualquer coluna.</p>` },
          { t: 'html', html: R`
            <p>Os sinais $(-1)^{i+j}$ formam um tabuleiro de xadrez, começando com $+$ no canto superior esquerdo:
            $$\begin{bmatrix}+&-&+&-\\-&+&-&+\\+&-&+&-\\-&+&-&+\end{bmatrix}$$</p>` },
          { t: 'exemplo', titulo: 'Exemplo (livro-texto)', enunciado: R`Calcule $\det A$ para $A=\begin{bmatrix}1&-1&0\\1&2&-3\\2&0&1\end{bmatrix}$ desenvolvendo pela 2ª coluna.`, solucao: R`
            <p>A 2ª coluna é $(-1,2,0)$, com sinais $-,+,-$:</p>
            $$\begin{aligned}\det A&=-(-1)\begin{vmatrix}1&-3\\2&1\end{vmatrix}+2\begin{vmatrix}1&0\\2&1\end{vmatrix}\\&\quad-0\cdot(\dots)=1\cdot7+2\cdot1=9.\end{aligned}$$
            <p>O livro faz o mesmo pelas três linhas e obtém sempre $9$, como deve ser.</p>` },
          { t: 'pratica', itens: [
            { t: 'escolha', p: R`Qual é o sinal $(-1)^{i+j}$ do cofator $c_{23}$?`, op: ['$+$', '$-$'], c: 1, fixa: true, exp: R`$(-1)^{2+3}=(-1)^5=-1$.` },
            { t: 'num', p: R`Seja $A=\begin{bmatrix}2&1&3\\0&4&1\\5&-2&0\end{bmatrix}$. Calcule o cofator $c_{12}$.`, r: 5,
              exp: R`$A_{12}=\begin{bmatrix}0&1\\5&0\end{bmatrix}$, com $\det A_{12}=-5$. Logo $c_{12}=(-1)^{1+2}(-5)=5$.` },
            { t: 'num', p: R`Para a mesma $A=\begin{bmatrix}2&1&3\\0&4&1\\5&-2&0\end{bmatrix}$, calcule $\det A$ por Laplace, escolhendo uma fila com zero.`, r: -51,
              exp: R`Pela 2ª linha $(0,4,1)$, sinais $-,+,-$: $\det A=4\begin{vmatrix}2&3\\5&0\end{vmatrix}-1\begin{vmatrix}2&1\\5&-2\end{vmatrix}=4(-15)-(-9)=-51$.` }
          ] },
          { t: 'html', html: R`
            <h3>Escolha bem a fila</h3>
            <p>Cada zero na fila escolhida elimina uma parcela inteira. Se a fila tem um único elemento não nulo, sobra <b>um só</b> determinante de ordem menor.</p>
            <p>Caso extremo: numa matriz <b>triangular</b>, desenvolvendo sempre pela 1ª coluna (Exemplo 4.13),
            $$\begin{vmatrix}a_{11}&*&\cdots&*\\0&a_{22}&\cdots&*\\\vdots&&\ddots&\vdots\\0&0&\cdots&a_{nn}\end{vmatrix}=a_{11}a_{22}\cdots a_{nn}.$$</p>` },
          { t: 'pratica', itens: [
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}3&1&0&2\\1&0&0&-1\\2&5&4&1\\0&2&0&3\end{bmatrix}$.`, r: 28,
              dica: R`A 3ª coluna tem um só elemento não nulo.`,
              exp: R`Pela 3ª coluna: $\det=(-1)^{3+3}\cdot4\cdot\begin{vmatrix}3&1&2\\1&0&-1\\0&2&3\end{vmatrix}=4\cdot7=28$.` },
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}2&7&-3&8\\0&-1&4&\pi\\0&0&3&-5\\0&0&0&5\end{bmatrix}$.`, r: -30,
              exp: R`É triangular: $2\cdot(-1)\cdot3\cdot5=-30$. As entradas acima da diagonal (até o $\pi$!) não importam.` },
            { t: 'vf', p: R`O determinante de uma matriz diagonal é o produto das entradas da diagonal.`, r: true, exp: R`Uma matriz diagonal é, em particular, triangular.` }
          ] },
          { t: 'reforco', geradores: ['cofator', 'laplace', 'triang'] }
        ]
      },

      /* =============================================================== 5 */
      {
        id: 5,
        titulo: 'Simplificar antes de calcular',
        resumo: [
          R`Roteiro: escolha um pivô (de preferência $1$ ou $-1$), zere o resto da sua fila com $\ell_i\to\ell_i+\lambda\ell_j$, desenvolva por Laplace e repita.`,
          R`Triangularizar: $\det A=(-1)^{\text{nº de trocas}}\cdot(\text{fatores retirados})\cdot(\text{produto da diagonal})$.`
        ],
        cartoes: [
          { id: 'c4.5a', frente: R`Qual o roteiro para calcular um determinante $4\times4$ “na mão”?`, verso: R`Escolher um pivô $\pm1$, zerar sua coluna (ou linha) somando múltiplos dele às outras filas (não altera det), desenvolver por Laplace por essa fila, repetir.` },
          { id: 'c4.5b', frente: R`Posso “tirar um fator comum” de uma linha?`, verso: R`Sim: se todas as entradas de uma fila são múltiplas de $\lambda$, $\det A=\lambda\cdot\det(\text{matriz com essa fila dividida por }\lambda)$.` }
        ],
        blocos: [
          { t: 'html', html: R`
            <p>Pela definição, um determinante $4\times4$ tem $24$ parcelas; por Laplace direto, são quatro determinantes $3\times3$. Mas <b>zeros não custam nada</b>, e a operação $\ell_i\to\ell_i+\lambda\ell_j$ fabrica zeros sem alterar o determinante.</p>` },
          { t: 'teo', rotulo: 'Roteiro', html: R`
            <ol><li>Escolha um <b>pivô</b>: uma entrada igual a $1$ ou $-1$, se houver.</li>
            <li>Some múltiplos da fila do pivô às outras filas até que a coluna (ou linha) do pivô tenha <b>um único</b> elemento não nulo.</li>
            <li>Desenvolva por Laplace por essa coluna: sobra <b>um</b> determinante de ordem menor. Repita até chegar a $2\times2$ ou a uma matriz triangular.</li></ol>` },
          { t: 'exemplo', enunciado: R`Calcule $\det A$, sendo $A=\begin{bmatrix}1&2&0&1\\2&5&1&0\\-1&0&3&2\\3&6&1&4\end{bmatrix}$.`, solucao: R`
            <p>Com o pivô $a_{11}=1$: $\ell_2\to\ell_2-2\ell_1$, $\ell_3\to\ell_3+\ell_1$, $\ell_4\to\ell_4-3\ell_1$:</p>
            $$\begin{aligned}\det A&=\begin{vmatrix}1&2&0&1\\0&1&1&-2\\0&2&3&3\\0&0&1&1\end{vmatrix}\\&=1\cdot\begin{vmatrix}1&1&-2\\2&3&3\\0&1&1\end{vmatrix}.\end{aligned}$$
            <p>Agora o pivô $1$ do canto: $\ell_2\to\ell_2-2\ell_1$ dá</p>
            $$\begin{aligned}\det A&=\begin{vmatrix}1&1&-2\\0&1&7\\0&1&1\end{vmatrix}\\&=\begin{vmatrix}1&7\\1&1\end{vmatrix}=1-7=-6.\end{aligned}$$` },
          { t: 'pratica', itens: [
            { t: 'etapas', p: R`Vamos calcular $\det A$ para $A=\begin{bmatrix}1&1&2&1\\2&3&4&1\\-1&0&1&2\\1&2&3&4\end{bmatrix}$ seguindo o roteiro.`,
              etapas: [
                { t: 'mat', p: R`Use o pivô $a_{11}=1$: faça $\ell_2\to\ell_2-2\ell_1$, $\ell_3\to\ell_3+\ell_1$ e $\ell_4\to\ell_4-\ell_1$. Desenvolvendo pela 1ª coluna, $\det A=\det B$ com $B\in M(3)$. Escreva $B$.`,
                  r: [[1, 0, -1], [1, 3, 3], [1, 1, 3]], rot: '$B=$',
                  exp: R`As novas linhas são $(0,1,0,-1)$, $(0,1,3,3)$ e $(0,1,1,3)$; tirando a 1ª linha e a 1ª coluna, sobra $B$.` },
                { t: 'num', p: R`Calcule $\det B$ (e portanto $\det A$).`, r: 8,
                  exp: R`Por exemplo, pela 1ª linha de $B$: $1\cdot(9-3)-0+(-1)(1-3)=6+2=8$.` }
              ] },
            { t: 'num', p: R`Calcule $\det\begin{bmatrix}1&-1&2&0\\2&-1&5&1\\0&3&1&2\\-1&2&0&3\end{bmatrix}$.`, r: -3,
              dica: R`Pivô $a_{11}=1$: zere a 1ª coluna com $\ell_2\to\ell_2-2\ell_1$ e $\ell_4\to\ell_4+\ell_1$.`,
              exp: R`Depois de $\ell_2\to\ell_2-2\ell_1$ e $\ell_4\to\ell_4+\ell_1$, Laplace pela 1ª coluna deixa $\begin{vmatrix}1&1&1\\3&1&2\\1&2&3\end{vmatrix}$. Com $\ell_2\to\ell_2-3\ell_1$, $\ell_3\to\ell_3-\ell_1$: $\begin{vmatrix}-2&-1\\1&2\end{vmatrix}=-4+1=-3$.` }
          ] },
          { t: 'html', html: R`
            <h3>Triangularizar</h3>
            <p>Outra saída é escalonar até a forma triangular, controlando o que cada operação faz: trocas mudam o sinal, e um fator $\lambda$ comum a uma fila pode ser “posto para fora”. No fim, multiplique a diagonal.</p>
            <p><b>Exemplo.</b> Na matriz abaixo, a 1ª linha tem fator comum $2$:
            $$\begin{aligned}\begin{vmatrix}2&4&-2\\1&3&1\\3&5&0\end{vmatrix}&=2\begin{vmatrix}1&2&-1\\1&3&1\\3&5&0\end{vmatrix}\\&=2\begin{vmatrix}1&2&-1\\0&1&2\\0&-1&3\end{vmatrix}\\&=2\begin{vmatrix}1&2&-1\\0&1&2\\0&0&5\end{vmatrix}=2\cdot5=10,\end{aligned}$$
            usando $\ell_2\to\ell_2-\ell_1$, $\ell_3\to\ell_3-3\ell_1$ e depois $\ell_3\to\ell_3+\ell_2$.</p>` },
          { t: 'pratica', itens: [
            { t: 'num', p: R`Triangularize e calcule $\det\begin{bmatrix}2&6&4\\1&4&3\\3&7&1\end{bmatrix}$.`, r: -6,
              dica: R`Ponha o fator $2$ da 1ª linha para fora.`,
              exp: R`$=2\begin{vmatrix}1&3&2\\1&4&3\\3&7&1\end{vmatrix}=2\begin{vmatrix}1&3&2\\0&1&1\\0&-2&-5\end{vmatrix}=2\begin{vmatrix}1&3&2\\0&1&1\\0&0&-3\end{vmatrix}=2\cdot(-3)=-6$.` },
            { t: 'vf', p: R`Se, ao triangularizar, fizermos uma troca de linhas, o determinante da matriz original é o produto da diagonal com o sinal trocado.`, r: true,
              exp: R`Cada troca multiplica o determinante por $-1$. Com uma troca (e sem tirar fatores), $\det A=-(\text{produto da diagonal})$.` }
          ] },
          { t: 'reforco', geradores: ['escalona'] }
        ]
      },

      /* =============================================================== 6 */
      {
        id: 6,
        titulo: 'A propriedade fundamental: det(AB) = det A · det B',
        resumo: [
          R`$\det(AB)=\det A\cdot\det B$ (Teorema 4.19).`,
          R`$\det(A^k)=(\det A)^k$; $\det(A^{-1})=\dfrac1{\det A}$; $\det(P^{-1}AP)=\det A$.`,
          R`Determinante de um operador: $\det T=\det[T]_\mathcal{B}$, para qualquer base $\mathcal{B}$ (Def. 4.22).`
        ],
        cartoes: [
          { id: 'c4.6a', frente: R`Enuncie a propriedade fundamental dos determinantes.`, verso: R`$\det(AB)=\det A\cdot\det B$ para $A,B\in M(n)$.` },
          { id: 'c4.6b', frente: R`Se $A$ é invertível, quanto vale $\det(A^{-1})$? Por quê?`, verso: R`$1/\det A$, pois $\det A\cdot\det A^{-1}=\det(AA^{-1})=\det I=1$.` },
          { id: 'c4.6c', frente: R`Por que $\det T$ não depende da base escolhida?`, verso: R`Matrizes de $T$ em bases diferentes são semelhantes, $[T]_\mathcal{B}=M^{-1}[T]_{\mathcal{B}'}M$, e matrizes semelhantes têm o mesmo determinante.` }
        ],
        blocos: [
          { t: 'teo', rotulo: 'Teorema 4.19', html: R`<p>Para quaisquer $A,B\in M(n)$, $$\det(AB)=\det A\cdot\det B.$$</p>` },
          { t: 'html', html: R`
            <p>Consequências imediatas:</p>
            <ul><li>$\det(A^k)=(\det A)^k$;</li>
            <li>se $A$ é invertível, $\det A\cdot\det A^{-1}=\det I=1$, logo $\det(A^{-1})=\dfrac{1}{\det A}$;</li>
            <li>matrizes semelhantes têm o mesmo determinante: $\det(P^{-1}AP)=\dfrac{1}{\det P}\det A\det P=\det A$.</li></ul>
            <p>Junte a isso $\det A^*=\det A$ e $\det(\lambda A)=\lambda^n\det A$.</p>` },
          { t: 'pratica', instrucao: R`Em todos os itens, $A,B\in M(3)$, $\det A=-2$ e $\det B=3$.`, itens: [
            { t: 'num', p: R`Calcule $\det(AB)$.`, r: -6, exp: R`$(-2)\cdot3=-6$.` },
            { t: 'num', p: R`Calcule $\det(A^2B^*)$.`, r: 12, exp: R`$(\det A)^2\det B=4\cdot3=12$.` },
            { t: 'num', p: R`Calcule $\det(2A^{-1})$.`, r: -4, exp: R`$2^3\cdot\dfrac{1}{-2}=-4$. (O $2$ multiplica as três linhas.)` },
            { t: 'num', p: R`Calcule $\det(B^{-1}A^3)$.`, r: '-8/3', rtex: R`-\tfrac83`, exp: R`$\dfrac{(-2)^3}{3}=-\dfrac83$.` },
            { t: 'vf', p: R`Se $A,B\in M(n)$ e $AB=0$, então $\det A=0$ ou $\det B=0$.`, r: true, exp: R`$\det A\cdot\det B=\det(AB)=\det 0=0$.` },
            { t: 'vf', p: R`Se $\det A=\det B$, então $A$ e $B$ são semelhantes.`, r: false,
              exp: R`$I$ e $\begin{bmatrix}1&1\\0&1\end{bmatrix}$ têm determinante $1$, mas a única matriz semelhante a $I$ é a própria $I$ ($P^{-1}IP=I$). A recíproca é que vale: semelhantes $\Rightarrow$ mesmo determinante.` }
          ] },
          { t: 'teo', rotulo: 'Definição 4.22', html: R`
            <p>Se $V$ tem dimensão finita e $T:V\to V$ é um operador linear, o <b>determinante de $T$</b> é $\det T=\det[T]_\mathcal{B}$, em que $\mathcal{B}$ é uma base qualquer de $V$.</p>
            <p>Não depende da base: $[T]_\mathcal{B}$ e $[T]_{\mathcal{B}'}$ são semelhantes. E $T$ é invertível se, e somente se, $\det T\neq0$ (Obs. 4.23).</p>` },
          { t: 'exemplo', enunciado: R`Calcule $\det T$ para $T:\mathcal{P}_2\to\mathcal{P}_2$, $T(p)=2p+p'$.`, solucao: R`
            <p>Na base $\{1,t,t^2\}$: $T(1)=2$, $T(t)=1+2t$, $T(t^2)=2t+2t^2$. As coordenadas formam as colunas:
            $$[T]=\begin{bmatrix}2&1&0\\0&2&2\\0&0&2\end{bmatrix},$$ que é triangular. Logo $\det T=2\cdot2\cdot2=8$.</p>` },
          { t: 'pratica', itens: [
            { t: 'num', p: R`Calcule $\det T$ para $T(x,y,z)=(x+2y,\ y-z,\ 3z)$.`, r: 3,
              exp: R`$[T]=\begin{bmatrix}1&2&0\\0&1&-1\\0&0&3\end{bmatrix}$ é triangular: $\det T=1\cdot1\cdot3=3$.` },
            { t: 'escolha', p: R`Quanto vale o determinante da rotação de ângulo $\theta$ no plano, $[R_\theta]=\begin{bmatrix}\cos\theta&-\operatorname{sen}\theta\\\operatorname{sen}\theta&\cos\theta\end{bmatrix}$?`,
              op: ['$1$', '$-1$', R`$\cos 2\theta$`, '$0$'], c: 0,
              exp: R`$\cos^2\theta+\operatorname{sen}^2\theta=1$: rotações preservam áreas e orientação.` },
            { t: 'num', p: R`Seja $T:\mathbb{R}^2\to\mathbb{R}^2$ a reflexão em torno da reta $y=2x$. Quanto vale $\det T$?`, r: -1,
              dica: R`Use uma base adaptada: um vetor da reta e um perpendicular a ela.`,
              exp: R`Na base $\{(1,2),(2,-1)\}$, $T(1,2)=(1,2)$ e $T(2,-1)=-(2,-1)$, logo $[T]_\mathcal{B}=\begin{bmatrix}1&0\\0&-1\end{bmatrix}$ e $\det T=-1$. Como o determinante não depende da base, nem foi preciso achar a matriz na base canônica.` }
          ] },
          { t: 'reforco', geradores: ['produto'] }
        ]
      },

      /* =============================================================== 7 */
      {
        id: 7,
        titulo: 'Determinante, invertibilidade, sistemas e LI',
        resumo: [
          R`$A\in M(n)$ é invertível $\iff\det A\neq0$ (Prop. 4.20).`,
          R`$\det A\neq0\iff$ posto $A=n\iff$ colunas LI $\iff$ linhas LI $\iff AX=0$ só tem a solução trivial $\iff AX=B$ tem solução única para todo $B$.`,
          R`$\det A=0$ <b>não</b> diz se $AX=B$ tem nenhuma ou infinitas soluções: é preciso escalonar.`
        ],
        cartoes: [
          { id: 'c4.7a', frente: R`Para $A\in M(n)$, cite cinco afirmações equivalentes a $\det A\neq0$.`, verso: R`$A$ invertível; posto $A=n$; colunas LI; linhas LI; $AX=0$ só tem a solução trivial; $AX=B$ tem solução única para todo $B$.` },
          { id: 'c4.7b', frente: R`Se $\det A=0$, o sistema $AX=B$ não tem solução?`, verso: R`Não necessariamente: ele não tem solução <b>única</b>. Pode ter nenhuma ou infinitas.` }
        ],
        blocos: [
          { t: 'teo', rotulo: 'Proposição 4.20 e a grande equivalência', html: R`
            <p>$A\in M(n)$ é invertível se, e somente se, $\det A\neq0$; nesse caso $\det A^{-1}=1/\det A$. Juntando com os capítulos anteriores, são <b>equivalentes</b>:</p>
            <ol type="a"><li>$\det A\neq0$;</li><li>$A$ é invertível;</li><li>$\operatorname{posto}A=n$;</li><li>as colunas de $A$ são LI;</li><li>as linhas de $A$ são LI;</li>
            <li>$AX=0$ só tem a solução trivial;</li><li>$AX=B$ tem solução única para todo $B$;</li><li>o operador $X\mapsto AX$ é um isomorfismo.</li></ol>` },
          { t: 'pratica', itens: [
            { t: 'escolha', fixa: true, p: R`Os vetores $(1,2,0)$, $(0,1,1)$ e $(2,0,1)$ de $\mathbb{R}^3$ são:`, op: ['LI', 'LD'], c: 0,
              exp: R`$\det\begin{bmatrix}1&2&0\\0&1&1\\2&0&1\end{bmatrix}=1\cdot1-2\cdot(0-2)+0=5\neq0$, logo são LI (e formam uma base de $\mathbb{R}^3$).` },
            { t: 'conj', p: R`Para quais $k$ a matriz $\begin{bmatrix}1&1&1\\1&k&1\\1&1&k\end{bmatrix}$ <b>não</b> é invertível?`, r: [1],
              exp: R`Com $\ell_2\to\ell_2-\ell_1$ e $\ell_3\to\ell_3-\ell_1$, a matriz fica triangular com diagonal $1,\ k-1,\ k-1$: $\det=(k-1)^2$, que só se anula em $k=1$.` }
          ] },
          { t: 'html', html: R`
            <h3>E os sistemas?</h3>
            <p>Se $\det A\neq0$, o sistema $AX=B$ tem <b>uma única</b> solução. Se $\det A=0$, ele pode ter <b>nenhuma</b> ou <b>infinitas</b>, e o determinante não distingue os dois casos. Compare:
            $$\begin{cases}x+y=2\\2x+2y=4\end{cases}\ \text{(infinitas soluções)}$$ $$\begin{cases}x+y=2\\2x+2y=5\end{cases}\ \text{(nenhuma solução)},$$
            ambos com a mesma matriz de coeficientes, de determinante $0$.</p>` },
          { t: 'pratica', itens: [
            { t: 'escolha', fixa: true, p: R`Sabe-se apenas que a matriz dos coeficientes do sistema $AX=B$ tem $\det A=0$. O que se pode concluir?`,
              op: ['O sistema não tem solução.', 'O sistema tem infinitas soluções.', 'O sistema não tem solução única: pode ter nenhuma ou infinitas.', 'O sistema tem solução única.'], c: 2,
              exp: R`Os dois exemplos acima têm a mesma matriz de coeficientes e comportamentos diferentes. Para decidir, escalone.` },
            { t: 'conj', p: R`Para quais valores de $k$ o sistema $\begin{cases}kx+y=0\\x+ky=0\end{cases}$ tem soluções <b>não triviais</b>?`, r: [-1, 1],
              exp: R`Um sistema homogêneo tem solução não trivial $\iff\det=0$: $k^2-1=0\iff k=\pm1$.` },
            { t: 'aberta', p: R`Mostre que, se $A\in M(n)$ satisfaz $A^2=0$, então $A$ não é invertível.`,
              modelo: R`$(\det A)^2=\det(A^2)=\det 0=0$, logo $\det A=0$ e, pela Prop. 4.20, $A$ não é invertível.` }
          ] },
          { t: 'reforco', geradores: ['param', 'lild'] }
        ]
      },

      /* =============================================================== 8 */
      {
        id: 8,
        titulo: 'Adjunta clássica, inversa e regra de Cramer',
        resumo: [
          R`Matriz dos cofatores $C=(c_{ij})$, $c_{ij}=(-1)^{i+j}\det A_{ij}$; adjunta clássica $\operatorname{adj}A=C^*$.`,
          R`$A\,(\operatorname{adj}A)=(\det A)I$ e, se $\det A\neq0$, $A^{-1}=\dfrac{1}{\det A}\operatorname{adj}A$. Atenção: $(A^{-1})_{ij}=c_{ji}/\det A$.`,
          R`$\begin{bmatrix}a&b\\c&d\end{bmatrix}^{-1}=\dfrac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}$.`,
          R`Cramer: se $\det A\neq0$, a solução de $AX=B$ é $x_i=\dfrac{\det A_i}{\det A}$, sendo $A_i$ a matriz $A$ com a coluna $i$ trocada por $B$.`
        ],
        cartoes: [
          { id: 'c4.8a', frente: R`Fórmula da inversa pela adjunta clássica.`, verso: R`$A^{-1}=\dfrac{1}{\det A}\operatorname{adj}A$, com $\operatorname{adj}A=C^*$ (transposta da matriz dos cofatores).` },
          { id: 'c4.8b', frente: R`Inversa de $\begin{bmatrix}a&b\\c&d\end{bmatrix}$?`, verso: R`$\dfrac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}$ (se $ad-bc\neq0$)` },
          { id: 'c4.8c', frente: R`Enuncie a regra de Cramer.`, verso: R`Se $\det A\neq0$, a única solução de $AX=B$ tem $x_i=\det A_i/\det A$, onde $A_i$ é $A$ com a $i$-ésima coluna substituída por $B$.` }
        ],
        blocos: [
          { t: 'teo', rotulo: 'Adjunta clássica (4.15)–(4.18)', html: R`
            <p>A <b>matriz dos cofatores</b> de $A$ é $C=(c_{ij})$, $c_{ij}=(-1)^{i+j}\det A_{ij}$, e a <b>adjunta clássica</b> é a sua transposta, $\operatorname{adj}A=C^*$. Vale
            $$A\,(\operatorname{adj}A)=(\det A)\,I.$$ Logo, se $\det A\neq0$, $$A^{-1}=\frac{1}{\det A}\operatorname{adj}A.$$</p>` },
          { t: 'html', html: R`
            <p>Por que funciona? Na posição $(i,i)$ do produto aparece $\sum_k a_{ik}c_{ik}$, que é o desenvolvimento de Laplace pela linha $i$: dá $\det A$. Fora da diagonal aparece o desenvolvimento de uma matriz com duas linhas iguais: dá $0$.</p>
            <p>Em $M(2)$, a fórmula vira a famosa regra “troque a diagonal, mude o sinal do resto e divida pelo determinante”:
            $$\begin{bmatrix}a&b\\c&d\end{bmatrix}^{-1}=\frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}.$$</p>` },
          { t: 'pratica', itens: [
            { t: 'mat', p: R`Calcule $\begin{bmatrix}3&1\\5&2\end{bmatrix}^{-1}$.`, r: [[2, -1], [-5, 3]], rot: R`$A^{-1}=$`,
              exp: R`$\det=6-5=1$, logo $A^{-1}=\begin{bmatrix}2&-1\\-5&3\end{bmatrix}$.` },
            { t: 'num', p: R`Seja $A=\begin{bmatrix}1&2&0\\0&1&1\\1&0&1\end{bmatrix}$, com $\det A=3$. Calcule a entrada $(2,3)$ de $A^{-1}$.`, r: '-1/3', rtex: R`-\tfrac13`,
              dica: R`$(A^{-1})_{23}=\dfrac{c_{32}}{\det A}$: por causa da transposição, os índices se invertem!`,
              exp: R`$(A^{-1})_{23}=\dfrac{c_{32}}{\det A}$. Temos $A_{32}=\begin{bmatrix}1&0\\0&1\end{bmatrix}$, $c_{32}=(-1)^{5}\cdot1=-1$, logo a entrada é $-\dfrac13$.` },
            { t: 'vf', p: R`Se $A$ tem entradas inteiras e $\det A=1$, então $A^{-1}$ tem entradas inteiras.`, r: true,
              exp: R`$A^{-1}=\operatorname{adj}A$, e os cofatores são determinantes de matrizes de entradas inteiras.` }
          ] },
          { t: 'teo', rotulo: 'Regra de Cramer (Exercício 4.16 do livro-texto)', html: R`
            <p>Se $\det A\neq0$, a única solução de $AX=B$ é dada por
            $$x_i=\frac{\det A_i}{\det A},\qquad i=1,\dots,n,$$
            em que $A_i$ é a matriz obtida de $A$ trocando a $i$-ésima coluna por $B$.</p>` },
          { t: 'exemplo', enunciado: R`Resolva $\begin{cases}2x+y=5\\x-3y=-1\end{cases}$ pela regra de Cramer.`, solucao: R`
            <p>$\det A=\begin{vmatrix}2&1\\1&-3\end{vmatrix}=-7$, $\det A_1=\begin{vmatrix}5&1\\-1&-3\end{vmatrix}=-14$, $\det A_2=\begin{vmatrix}2&5\\1&-1\end{vmatrix}=-7$.</p>
            <p>Logo $x=\dfrac{-14}{-7}=2$ e $y=\dfrac{-7}{-7}=1$.</p>` },
          { t: 'pratica', itens: [
            { t: 'multi', p: R`Resolva pela regra de Cramer: $\begin{cases}x+2y=7\\3x-y=0\end{cases}$`,
              campos: [{ rot: '$x =$', r: 1 }, { rot: '$y =$', r: 3 }],
              exp: R`$\det A=-1-6=-7$; $\det A_1=\begin{vmatrix}7&2\\0&-1\end{vmatrix}=-7$; $\det A_2=\begin{vmatrix}1&7\\3&0\end{vmatrix}=-21$. Logo $x=1$, $y=3$.` },
            { t: 'num', p: R`No sistema $\begin{cases}x+y+z=6\\x-y+2z=5\\2x+y-z=1\end{cases}$, use Cramer para obter apenas $z$.`, r: 3, rot: '$z =$',
              exp: R`$\det A=7$ e $\det A_3=\det\begin{bmatrix}1&1&6\\1&-1&5\\2&1&1\end{bmatrix}=21$. Logo $z=21/7=3$. (A solução completa é $(1,2,3)$.)` }
          ] },
          { t: 'reforco', geradores: ['inv2', 'cramer'] }
        ]
      },

      /* =============================================================== 9 */
      {
        id: 9,
        titulo: 'O posto por meio de determinantes',
        resumo: [
          R`O posto de $A\in M(m,n)$ é a maior ordem $p$ de uma submatriz quadrada $A'\in M(p)$ de $A$ com $\det A'\neq0$ (Prop. 4.25).`
        ],
        cartoes: [
          { id: 'c4.9a', frente: R`Como obter o posto de $A\in M(m,n)$ com determinantes?`, verso: R`É a maior ordem de uma submatriz quadrada de $A$ com determinante não nulo (Prop. 4.25).` }
        ],
        blocos: [
          { t: 'html', html: R`
            <p>Uma <b>submatriz</b> de $A\in M(m,n)$ é obtida eliminando algumas linhas e/ou colunas de $A$. O posto de uma submatriz nunca supera o de $A$, e, se $\operatorname{posto}A=p$, dá para escolher $p$ linhas e $p$ colunas formando uma submatriz invertível. Daí:</p>` },
          { t: 'teo', rotulo: 'Proposição 4.25', html: R`<p>O posto de $A\in M(m,n)$ é o maior inteiro $p$ para o qual existe uma submatriz $A'\in M(p)$ de $A$ com $\det A'\neq0$.</p>` },
          { t: 'exemplo', enunciado: R`Determine o posto de $A=\begin{bmatrix}1&2&3\\2&4&6\\1&1&1\end{bmatrix}$.`, solucao: R`
            <p>$\det A=0$, pois $\ell_2=2\ell_1$; então o posto é menor que $3$. A submatriz das linhas $1,3$ e colunas $1,2$ é $\begin{bmatrix}1&2\\1&1\end{bmatrix}$, com determinante $-1\neq0$. Logo $\operatorname{posto}A=2$.</p>` },
          { t: 'pratica', itens: [
            { t: 'num', p: R`Qual é o posto de $\begin{bmatrix}1&2&-1&0\\2&4&-2&0\\0&1&1&3\end{bmatrix}$?`, r: 2,
              exp: R`$\ell_2=2\ell_1$, então toda submatriz $3\times3$ tem duas linhas proporcionais e determinante zero. Já $\begin{bmatrix}1&2\\0&1\end{bmatrix}$ (linhas 1 e 3, colunas 1 e 2) tem determinante $1$. Posto $2$.` },
            { t: 'vf', p: R`Se todas as submatrizes $2\times2$ de $A\in M(3,4)$ têm determinante zero, então $\operatorname{posto}A\leq1$.`, r: true,
              exp: R`Pela Prop. 4.25, posto $\geq2$ exigiria uma submatriz $2\times2$ invertível.` },
            { t: 'escolha', fixa: true, p: R`Se $A\in M(3)$ e $\det A=5$, qual é o posto de $A$?`, op: ['$1$', '$2$', '$3$', 'Depende das entradas'], c: 2,
              exp: R`A própria $A$ é uma submatriz $3\times3$ com determinante não nulo.` }
          ] },
          { t: 'reforco', geradores: ['posto'] }
        ]
      },

      /* =============================================================== 10 */
      {
        id: 10,
        titulo: 'Desafio: determinantes de ordem n',
        resumo: [
          R`Estratégia: resolva os casos pequenos ($n=2,3,4$), procure o padrão (uma fórmula ou uma recorrência entre $n$ e $n-1$) e só então justifique o caso geral.`
        ],
        cartoes: [
          { id: 'c4.10a', frente: R`Qual a estratégia para um determinante de ordem $n$ genérica?`, verso: R`Calcular os casos $n=2,3,4$, conjecturar o padrão (fórmula ou recorrência, em geral via Laplace) e depois prová-lo (operações sobre filas ou indução).` }
        ],
        blocos: [
          { t: 'html', html: R`
            <p>Diante de um determinante de ordem grande, ou de ordem $n$ qualquer, quase nunca se ataca o problema de frente. A estratégia é: <b>resolva os casos pequenos</b>, <b>procure o padrão</b> e <b>só então justifique</b> o caso geral. Os três desafios abaixo são guiados.</p>` },
          { t: 'pratica', titulo: 'Desafios', itens: [
            { t: 'etapas', p: R`Seja $M_n\in M(n)$ a matriz com entradas $m_{ij}=\min\{i,j\}$. Por exemplo, $M_3=\begin{bmatrix}1&1&1\\1&2&2\\1&2&3\end{bmatrix}$.`,
              etapas: [
                { t: 'num', p: R`Calcule $\det M_2=\det\begin{bmatrix}1&1\\1&2\end{bmatrix}$.`, r: 1, exp: R`$2-1=1$.` },
                { t: 'num', p: R`Calcule $\det M_3$.`, r: 1, exp: R`Com $\ell_3\to\ell_3-\ell_2$ e depois $\ell_2\to\ell_2-\ell_1$: $\begin{bmatrix}1&1&1\\0&1&1\\0&0&1\end{bmatrix}$, triangular com diagonal $1,1,1$.` },
                { t: 'escolha', fixa: true, p: R`Qual sequência de operações deixa $M_n$ triangular <b>sem alterar o determinante</b>?`,
                  op: [R`$\ell_n\to\ell_n-\ell_{n-1}$, depois $\ell_{n-1}\to\ell_{n-1}-\ell_{n-2}$, …, até $\ell_2\to\ell_2-\ell_1$ (de baixo para cima)`,
                    R`$\ell_k\to k\,\ell_1$ para cada $k$`, R`Trocar $\ell_1$ com $\ell_n$`], c: 0,
                  exp: R`A linha $k$ de $M_n$ é $(1,2,\dots,k-1,k,k,\dots,k)$. Subtraindo a linha anterior (ainda original, por isso de baixo para cima), sobra $(0,\dots,0,1,1,\dots,1)$, com o $1$ começando na posição $k$.` },
                { t: 'num', p: R`Então, quanto vale $\det M_{10}$?`, r: 1, exp: R`A matriz fica triangular superior com todos os elementos da diagonal iguais a $1$: $\det M_n=1$ para todo $n$.` }
              ] },
            { t: 'etapas', p: R`Seja $D_n$ o determinante da matriz $n\times n$ tridiagonal com $2$ na diagonal, $-1$ imediatamente acima e abaixo dela e $0$ no resto. Por exemplo, $D_3=\begin{vmatrix}2&-1&0\\-1&2&-1\\0&-1&2\end{vmatrix}$.`,
              etapas: [
                { t: 'multi', p: R`Calcule os primeiros casos.`, campos: [{ rot: '$D_1=$', r: 2 }, { rot: '$D_2=$', r: 3 }, { rot: '$D_3=$', r: 4 }],
                  exp: R`$D_1=2$, $D_2=4-1=3$ e, por Laplace pela 1ª linha, $D_3=2\cdot3-(-1)\cdot(-2)=6-2=4$.` },
                { t: 'escolha', fixa: true, p: R`Desenvolvendo $D_n$ por Laplace pela 1ª linha (e o segundo menor pela 1ª coluna), que recorrência se obtém?`,
                  op: [R`$D_n=2D_{n-1}-D_{n-2}$`, R`$D_n=2D_{n-1}+D_{n-2}$`, R`$D_n=D_{n-1}+D_{n-2}$`], c: 0,
                  exp: R`Pela 1ª linha, $D_n=2D_{n-1}+(-1)\cdot(-1)^{1+2}\det A_{12}=2D_{n-1}+\det A_{12}$. A 1ª coluna de $A_{12}$ só tem o $-1$ no topo; desenvolvendo por ela, $\det A_{12}=-D_{n-2}$. Logo $D_n=2D_{n-1}-D_{n-2}$. Confira: $D_3=2\cdot3-2=4$.` },
                { t: 'expr', p: R`Conjecture uma fórmula para $D_n$ em função de $n$.`, r: 'n+1', vars: ['n'], rtex: 'n+1', ph: 'ex.: 2n - 1',
                  exp: R`$2,3,4,\dots$: $D_n=n+1$. Por indução: $2n-(n-1)=n+1$.` },
                { t: 'num', p: R`Quanto vale $D_{100}$?`, r: 101, exp: R`$D_{100}=101$.` }
              ] },
            { t: 'etapas', p: R`Seja $J_n\in M(n)$ a matriz com $0$ na diagonal e $1$ em todas as outras posições.`,
              etapas: [
                { t: 'multi', p: R`Calcule os primeiros casos.`, campos: [{ rot: R`$\det J_2=$`, r: -1 }, { rot: R`$\det J_3=$`, r: 2 }],
                  exp: R`$\det\begin{bmatrix}0&1\\1&0\end{bmatrix}=-1$; por Sarrus, $\det J_3=0+1+1-0-0-0=2$.` },
                { t: 'num', p: R`Agora o caso geral. Some à 1ª coluna todas as outras colunas: cada entrada da 1ª coluna vira $n-1$. Pondo $n-1$ para fora e fazendo $\ell_i\to\ell_i-\ell_1$ para $i\geq2$, a matriz fica triangular. Qual é a diagonal? Use isso para calcular $\det J_5$.`, r: 4,
                  dica: R`Depois das operações, a 1ª linha é $(1,1,\dots,1)$ e a linha $i\geq2$ tem $-1$ na posição $(i,i)$.`,
                  exp: R`A diagonal fica $1,-1,-1,\dots,-1$, logo $\det J_n=(n-1)(-1)^{n-1}$. Para $n=5$: $4\cdot(-1)^4=4$.` },
                { t: 'num', p: R`E $\det J_{6}$?`, r: -5, exp: R`$(6-1)(-1)^{5}=-5$.` }
              ] },
            { t: 'aberta', p: R`Prove por indução que $D_n=n+1$ (segundo desafio), usando a recorrência $D_n=2D_{n-1}-D_{n-2}$.`,
              modelo: R`Vale para $n=1$ ($D_1=2$) e $n=2$ ($D_2=3$). Supondo $D_{n-1}=n$ e $D_{n-2}=n-1$, temos $D_n=2n-(n-1)=n+1$. Pelo princípio de indução (forte), $D_n=n+1$ para todo $n\geq1$.` }
          ] }
        ]
      }
    ]
  });
})();
