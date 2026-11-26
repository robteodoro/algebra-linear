/* Capítulo 6 — Decomposição de operadores: autovalores, autovetores, diagonalização e polinômio mínimo.
   Segue o livro-texto (R. F. de Lima, Álgebra Linear Essencial), seções 6.1 a 6.3,
   sem a seção 6.4 (Teorema da Decomposição Primária).
   Notação do livro: L(V), T_W (restrição), W_λ (autoespaço), c(t) = det(tI − T), m (polinômio mínimo).
   Contas conferidas com sympy. Use R`...` (String.raw); nunca escreva o par "cifrão + chave". */
(function () {
  L.registrarCapitulo({
    num: 6,
    titulo: 'Autovalores, autovetores e diagonalização',
    subtitulo: 'Subespaços invariantes, autovalores e autovetores, polinômio característico, diagonalização e polinômio mínimo.',
    livro: 'Livro-texto, cap. 6, seções 6.1 a 6.3 (sem a 6.4)',

    secoes: [
      /* =============================================================== 1 */
      {
        id: 1,
        titulo: 'Subespaços invariantes: a ideia de decompor',
        resumo: [
          R`$W\subset V$ é <b>$T$-invariante</b> quando $T(W)\subset W$, isto é, $v\in W\Rightarrow T(v)\in W$. Então a restrição $T_W\in\mathcal{L}(W)$ está bem definida.`,
          R`Se $V=W_1\oplus\cdots\oplus W_k$ com cada $W_i$ invariante, escreve-se $T=T_{W_1}\oplus\cdots\oplus T_{W_k}$, e numa base adaptada $[T]_\mathcal{B}$ é diagonal por blocos.`,
          R`Caso ideal: todos os $W_i$ de dimensão $1$ ($T$ <b>diagonalizável</b>).`
        ],
        cartoes: [
          { id: 'c6.1a', frente: R`O que significa $W$ ser $T$-invariante?`, verso: R`$T(W)\subset W$: se $v\in W$, então $T(v)\in W$. Assim, $T_W:W\to W$ é um operador.` },
          { id: 'c6.1b', frente: R`Por que interessa decompor $V$ em subespaços invariantes?`, verso: R`$T$ se decompõe em operadores menores, $T=T_{W_1}\oplus\cdots\oplus T_{W_k}$, e $[T]_\mathcal{B}$ fica diagonal por blocos. Com todos os $W_i$ de dimensão 1, $[T]_\mathcal{B}$ é diagonal.` }
        ],
        blocos: [
          { t: 'html', html: R`
            <p>A partir deste capítulo estudamos operadores $T\in\mathcal{L}(V)$, com $\dim V=n$ finita. Os mais simples são os que têm <b>matriz diagonal</b> numa base conveniente: dela se lê tudo sobre $T$.</p>
            <p>Por exemplo, se $[T]=\begin{bmatrix}2&0&0\\0&3&0\\0&0&0\end{bmatrix}$, então $T(e_1)=2e_1$, $T(e_2)=3e_2$ e $T(e_3)=0e_3$: cada reta $W_i=\operatorname{ger}\{e_i\}$ é levada nela mesma. Dá para ler, sem contas, que $\operatorname{nuc}T=\operatorname{ger}\{e_3\}$ e que a imagem é $\operatorname{ger}\{e_1,e_2\}$.</p>` },
          { t: 'teo', rotulo: 'Definição (subespaço invariante)', html: R`
            <p>Um subespaço $W\subset V$ é <b>invariante por $T$</b> (ou $T$-invariante) se $T(W)\subset W$, isto é,
            $$v\in W\ \Rightarrow\ T(v)\in W.$$
            Nesse caso, a restrição $T_W:W\to W$ é um operador linear de $W$.</p>` },
          { t: 'html', html: R`
            <p>Se $V=W_1\oplus\cdots\oplus W_k$ e cada $W_i$ é invariante, todo $v$ se escreve de modo único como $v=w_1+\cdots+w_k$ e
            $$T(v)=T_{W_1}(w_1)+\cdots+T_{W_k}(w_k).$$
            Escrevemos $T=T_{W_1}\oplus\cdots\oplus T_{W_k}$. Juntando bases dos $W_i$, a matriz de $T$ fica <b>diagonal por blocos</b>, um bloco para cada $T_{W_i}$. Quanto menores os blocos, mais simples o estudo; o caso ideal é o de blocos $1\times1$.</p>` },
          { t: 'exemplo', titulo: 'Exemplo (livro-texto)', enunciado: R`Seja $[T]=\begin{bmatrix}0&-1&0\\1&0&0\\0&0&2\end{bmatrix}$. Que subespaços coordenados são invariantes?`, solucao: R`
            <p>$T(e_1)=e_2$, $T(e_2)=-e_1$ e $T(e_3)=2e_3$. A reta $\operatorname{ger}\{e_3\}$ é invariante; as retas $\operatorname{ger}\{e_1\}$ e $\operatorname{ger}\{e_2\}$ não são; mas o plano $\operatorname{ger}\{e_1,e_2\}$ é. Assim $\mathbb{R}^3=\operatorname{ger}\{e_1,e_2\}\oplus\operatorname{ger}\{e_3\}$ decompõe $T$ num bloco $2\times2$ (uma rotação de $90°$) e um bloco $1\times1$.</p>` },
          { t: 'pratica', instrucao: R`Seja $T\in\mathcal{L}(\mathbb{R}^3)$ com $[T]=\begin{bmatrix}1&2&0\\0&3&0\\0&0&4\end{bmatrix}$.`, itens: [
            { t: 'escolha', fixa: true, p: R`A reta $\operatorname{ger}\{e_1\}$ é $T$-invariante?`, op: ['Sim', 'Não'], c: 0, exp: R`$T(e_1)=(1,0,0)=e_1\in\operatorname{ger}\{e_1\}$.` },
            { t: 'escolha', fixa: true, p: R`A reta $\operatorname{ger}\{e_2\}$ é $T$-invariante?`, op: ['Sim', 'Não'], c: 1, exp: R`$T(e_2)=(2,3,0)$ (a 2ª coluna), que não é múltiplo de $e_2$.` },
            { t: 'escolha', fixa: true, p: R`O plano $\operatorname{ger}\{e_1,e_2\}$ é $T$-invariante?`, op: ['Sim', 'Não'], c: 0, exp: R`$T(e_1)=e_1$ e $T(e_2)=2e_1+3e_2$ estão no plano; por linearidade, $T(xe_1+ye_2)$ também está.` },
            { t: 'escolha', fixa: true, p: R`A rotação de $90°$ do plano, $T(x,y)=(-y,x)$, deixa alguma reta pela origem invariante?`, op: ['Sim', 'Não'], c: 1,
              exp: R`Ela gira toda reta em $90°$, levando-a na reta perpendicular. Os únicos subespaços invariantes são $\{0\}$ e $\mathbb{R}^2$.` },
            { t: 'aberta', p: R`Mostre que, para qualquer $T\in\mathcal{L}(V)$, os subespaços $\operatorname{nuc}T$ e $\operatorname{Im}T$ são $T$-invariantes.`,
              modelo: R`Se $v\in\operatorname{nuc}T$, então $T(v)=0\in\operatorname{nuc}T$. Se $w\in\operatorname{Im}T$, então $T(w)$ é imagem de $w$, logo $T(w)\in\operatorname{Im}T$ (aliás, $T(v)\in\operatorname{Im}T$ para todo $v\in V$).` }
          ] },
          { t: 'pratica', itens: [
            { t: 'vf', p: R`Se a reta $W=\operatorname{ger}\{v\}$ ($v\neq0$) é $T$-invariante, então $T(v)=\lambda v$ para algum $\lambda\in\mathbb{R}$.`, r: true,
              exp: R`$T(v)\in W$ significa exatamente que $T(v)$ é múltiplo de $v$. Esses vetores especiais são os <b>autovetores</b>, assunto da próxima seção.` }
          ] }
        ]
      },

      /* =============================================================== 2 */
      {
        id: 2,
        titulo: 'Autovalores e autovetores',
        resumo: [
          R`$v\neq0$ é <b>autovetor</b> de $T$ se $T(v)=\lambda v$ para algum $\lambda\in\mathbb{R}$; $\lambda$ é o <b>autovalor</b> associado.`,
          R`Geometricamente: $T$ não tira $v$ da reta $\operatorname{ger}\{v\}$ (só a estica, encolhe ou inverte).`,
          R`$0$ é autovalor de $T$ $\iff$ $\operatorname{nuc}T\neq\{0\}$ $\iff$ $T$ não é invertível.`,
          R`$T$ é <b>diagonalizável</b> se existe uma base de $V$ formada por autovetores; nela, $[T]_\mathcal{B}=\operatorname{diag}(\lambda_1,\dots,\lambda_n)$.`
        ],
        cartoes: [
          { id: 'c6.2a', frente: R`Definição de autovetor e autovalor.`, verso: R`$v\neq 0$ com $T(v)=\lambda v$. O escalar $\lambda$ é o autovalor associado a $v$.` },
          { id: 'c6.2b', frente: R`O vetor nulo pode ser autovetor? E o número $0$ pode ser autovalor?`, verso: R`O vetor nulo, não (por definição). O número $0$ pode: é autovalor exatamente quando $\operatorname{nuc}T\neq\{0\}$.` },
          { id: 'c6.2c', frente: R`Autovalores de uma reflexão em torno de uma reta do plano?`, verso: R`$1$ (vetores da reta) e $-1$ (vetores perpendiculares à reta).` }
        ],
        blocos: [
          { t: 'teo', rotulo: 'Definição', html: R`
            <p>Seja $T\in\mathcal{L}(V)$. Um vetor <b>não nulo</b> $v\in V$ é <b>autovetor</b> de $T$ se existe $\lambda\in\mathbb{R}$ tal que
            $$T(v)=\lambda v.$$
            O escalar $\lambda$ é o <b>autovalor</b> de $T$ associado a $v$. Os autovalores e autovetores de uma matriz $A\in M(n)$ são os do operador $X\mapsto AX$ de $\mathbb{R}^n$.</p>` },
          { t: 'html', html: R`
            <p>Para verificar se um vetor dado é autovetor, basta aplicar $T$ e ver se o resultado é múltiplo dele. No exemplo do livro, $[T]=\begin{bmatrix}1&2\\2&1\end{bmatrix}$:
            $$\begin{aligned}T(1,1)&=(3,3)=3\,(1,1),\\T(1,-1)&=(-1,1)=-1\,(1,-1).\end{aligned}$$
            Então $(1,1)$ e $(1,-1)$ são autovetores, com autovalores $3$ e $-1$. Na base $\mathcal{B}=\{(1,1),(1,-1)\}$,
            $$[T]_\mathcal{B}=\begin{bmatrix}3&0\\0&-1\end{bmatrix}.$$</p>` },
          { t: 'video', src: 'videos/autovetores.mp4', legenda: R`Autovetores: os vetores que a transformação não tira da própria reta.` },
          { t: 'pratica', instrucao: R`Seja $A=\begin{bmatrix}4&1\\2&3\end{bmatrix}$.`, itens: [
            { t: 'num', p: R`O vetor $(1,1)$ é autovetor de $A$. Qual é o autovalor?`, r: 5, rot: R`$\lambda=$`, exp: R`$A(1,1)^*=(4+1,\ 2+3)^*=(5,5)^*=5\,(1,1)^*$.` },
            { t: 'escolha', fixa: true, p: R`O vetor $(1,2)$ é autovetor de $A$?`, op: ['Sim', 'Não'], c: 1, exp: R`$A(1,2)^*=(6,8)^*$, que não é múltiplo de $(1,2)$: $6/1\neq 8/2$.` },
            { t: 'num', p: R`E o vetor $(1,-2)$? Se for autovetor, dê o autovalor.`, r: 2, rot: R`$\lambda=$`, exp: R`$A(1,-2)^*=(2,-4)^*=2\,(1,-2)^*$. Autovalor $2$.` }
          ] },
          { t: 'html', html: R`
            <h3>Exemplos geométricos no plano</h3>
            <ul>
              <li><b>Projeção</b> sobre o eixo $x$, $T(x,y)=(x,0)$: $T(e_1)=1\cdot e_1$ e $T(e_2)=0\cdot e_2$. Autovalores $1$ e $0$.</li>
              <li><b>Reflexão</b> em torno da reta $y=x$, $T(x,y)=(y,x)$: $(1,1)$ fica fixo (autovalor $1$) e $(1,-1)$ troca de sentido (autovalor $-1$).</li>
              <li><b>Rotação</b> de $90°$: nenhum vetor não nulo fica na própria reta. <b>Não há autovalores.</b></li>
              <li><b>Cisalhamento</b> $T(x,y)=(x+y,\,y)$: só a direção de $e_1$ é preservada, com autovalor $1$.</li>
            </ul>` },
          { t: 'pratica', itens: [
            { t: 'conj', p: R`Quais são os autovalores da reflexão do plano em torno da reta $y=2x$?`, r: [-1, 1],
              exp: R`$(1,2)$, na reta, fica fixo: autovalor $1$. $(2,-1)$, perpendicular, é refletido em $-(2,-1)$: autovalor $-1$.` },
            { t: 'conj', p: R`Quais são os autovalores da projeção ortogonal do plano sobre uma reta $r$ pela origem?`, r: [0, 1],
              exp: R`Vetores de $r$ ficam fixos (autovalor $1$); vetores perpendiculares a $r$ vão para $0$ (autovalor $0$).` },
            { t: 'vf', p: R`O vetor nulo é autovetor de todo operador, com qualquer autovalor.`, r: false,
              exp: R`É verdade que $T(0)=\lambda\cdot0$ para todo $\lambda$, e é justamente por isso que a definição <b>exclui</b> o vetor nulo: senão, todo número seria autovalor.` },
            { t: 'vf', p: R`$0$ é autovalor de $T$ se, e somente se, $T$ não é invertível.`, r: true,
              exp: R`$T(v)=0\cdot v=0$ com $v\neq0$ significa $\operatorname{nuc}T\neq\{0\}$, isto é, $T$ não injetivo; em dimensão finita, isso é o mesmo que $T$ não invertível.` },
            { t: 'aberta', p: R`(Exercício 6.4 do livro-texto) Suponha $T$ invertível e $\lambda$ autovalor de $T$. Mostre que $\lambda\neq0$ e que $1/\lambda$ é autovalor de $T^{-1}$.`,
              modelo: R`Seja $v\neq0$ com $T(v)=\lambda v$. Se fosse $\lambda=0$, teríamos $T(v)=0$ com $v\neq0$, contradizendo a injetividade. Aplicando $T^{-1}$: $v=\lambda T^{-1}(v)$, logo $T^{-1}(v)=\frac{1}{\lambda}v$, ou seja, $v$ é autovetor de $T^{-1}$ com autovalor $1/\lambda$.` }
          ] },
          { t: 'reforco', geradores: ['autovetor'] }
        ]
      },

      /* =============================================================== 3 */
      {
        id: 3,
        titulo: 'Autoespaços',
        resumo: [
          R`$W_\lambda=\{v\in V;\ T(v)=\lambda v\}=\operatorname{nuc}(\lambda I-T)$ é um subespaço: os autovetores de $\lambda$ mais o vetor nulo (Prop. 6.1).`,
          R`$\lambda$ é autovalor $\iff W_\lambda\neq\{0\}$.`,
          R`$W_\lambda\cap W_\mu=\{0\}$ se $\lambda\neq\mu$; $W_\lambda$ é $T$-invariante e $T_{W_\lambda}=\lambda I_{W_\lambda}$ (Prop. 6.2).`
        ],
        cartoes: [
          { id: 'c6.3a', frente: R`O que é o autoespaço $W_\lambda$? Como calculá-lo?`, verso: R`$W_\lambda=\{v;\ T(v)=\lambda v\}=\operatorname{nuc}(\lambda I-T)$: resolve-se o sistema homogêneo $(\lambda I-T)v=0$.` },
          { id: 'c6.3b', frente: R`Dois autoespaços de autovalores diferentes podem ter um vetor não nulo em comum?`, verso: R`Não: se $T(v)=\lambda v=\mu v$ com $\lambda\neq\mu$, então $v=0$ (Prop. 6.2-(i)).` }
        ],
        blocos: [
          { t: 'html', html: R`
            <p>Se $v$ e $w$ são autovetores associados ao mesmo $\lambda$, então
            $$T(v+\mu w)=\lambda v+\mu\lambda w=\lambda(v+\mu w).$$
            Ou seja, combinações de autovetores de um mesmo autovalor continuam sendo autovetores (ou o vetor nulo).</p>` },
          { t: 'teo', rotulo: 'Proposições 6.1 e 6.2', html: R`
            <p>Para cada $\lambda\in\mathbb{R}$, o conjunto
            $$\begin{aligned}W_\lambda&=\{v\in V;\ T(v)=\lambda v\}\\&=\operatorname{nuc}(\lambda I-T)\end{aligned}$$
            é um subespaço de $V$, o <b>autoespaço</b> de $\lambda$. Além disso:</p>
            <ol type="i"><li>$W_\lambda\cap W_\mu=\{0\}$ se $\lambda\neq\mu$;</li>
            <li>$W_\lambda$ é $T$-invariante e $T_{W_\lambda}=\lambda I_{W_\lambda}$: em qualquer base de $W_\lambda$, a matriz de $T_{W_\lambda}$ é $\lambda I$.</li></ol>` },
          { t: 'exemplo', enunciado: R`Encontre os autoespaços de $A=\begin{bmatrix}3&0&0\\0&3&0\\1&2&1\end{bmatrix}$, sabendo que os autovalores são $3$ e $1$.`, solucao: R`
            <p>$3I-A=\begin{bmatrix}0&0&0\\0&0&0\\-1&-2&2\end{bmatrix}$: uma única equação, $x+2y-2z=0$. Duas variáveis livres:
            $$W_3=\operatorname{ger}\{(-2,1,0),\,(2,0,1)\},$$ de dimensão $2$.</p>
            <p>$I-A=\begin{bmatrix}-2&0&0\\0&-2&0\\-1&-2&0\end{bmatrix}$ dá $x=y=0$:
            $$W_1=\operatorname{ger}\{(0,0,1)\}.$$</p>` },
          { t: 'pratica', itens: [
            { t: 'subesp', p: R`Para $A=\begin{bmatrix}4&1\\2&3\end{bmatrix}$, dê uma base do autoespaço $W_5$.`, base: [[1, 1]],
              dica: R`Resolva $(5I-A)v=0$, com $5I-A=\begin{bmatrix}1&-1\\-2&2\end{bmatrix}$.`,
              exp: R`$5I-A=\begin{bmatrix}1&-1\\-2&2\end{bmatrix}$ dá $x=y$: $W_5=\operatorname{ger}\{(1,1)\}$.` },
            { t: 'subesp', p: R`Para a mesma $A=\begin{bmatrix}4&1\\2&3\end{bmatrix}$, dê uma base de $W_2$.`, base: [[1, -2]],
              exp: R`$2I-A=\begin{bmatrix}-2&-1\\-2&-1\end{bmatrix}$ dá $2x+y=0$: $W_2=\operatorname{ger}\{(1,-2)\}$.` },
            { t: 'num', p: R`Seja $A=\begin{bmatrix}1&2&0\\2&1&0\\0&0&3\end{bmatrix}$. Qual é a dimensão de $W_3$?`, r: 2,
              dica: R`Calcule o posto de $3I-A$.`,
              exp: R`$3I-A=\begin{bmatrix}2&-2&0\\-2&2&0\\0&0&0\end{bmatrix}$ tem posto $1$, logo $\dim W_3=3-1=2$ (pelo teorema do núcleo e da imagem). Base: $\{(1,1,0),(0,0,1)\}$.` },
            { t: 'subesp', p: R`Para essa mesma $A=\begin{bmatrix}1&2&0\\2&1&0\\0&0&3\end{bmatrix}$, dê uma base de $W_3$.`, base: [[1, 1, 0], [0, 0, 1]],
              exp: R`A única equação é $x-y=0$, com $y$ e $z$ livres: $W_3=\operatorname{ger}\{(1,1,0),(0,0,1)\}$.` },
            { t: 'vf', p: R`$W_\lambda=\{0\}$ significa que $\lambda$ não é autovalor de $T$.`, r: true, exp: R`$\lambda$ é autovalor exatamente quando existe $v\neq0$ em $W_\lambda$.` }
          ] }
        ]
      },

      /* =============================================================== 4 */
      {
        id: 4,
        titulo: 'O polinômio característico',
        resumo: [
          R`$c(t)=\det(tI-T)$: polinômio mônico de grau $n=\dim V$; não depende da base.`,
          R`$\lambda$ é autovalor de $T$ $\iff$ $c(\lambda)=0$ (Prop. 6.4). O conjunto dos autovalores é o <b>espectro</b> (pode ser vazio).`,
          R`Em $M(2)$: $c(t)=t^2-(\operatorname{traço}A)\,t+\det A$ (Exercício 6.2).`,
          R`Matriz triangular: os autovalores são as entradas da diagonal.`
        ],
        cartoes: [
          { id: 'c6.4a', frente: R`Como se acham os autovalores de $T$?`, verso: R`São as raízes reais de $c(t)=\det(tI-T)$ (Prop. 6.4), pois $T(v)=\lambda v$ com $v\neq0$ $\iff\operatorname{nuc}(\lambda I-T)\neq\{0\}\iff\det(\lambda I-T)=0$.` },
          { id: 'c6.4b', frente: R`Polinômio característico de $A\in M(2)$?`, verso: R`$c(t)=t^2-(\operatorname{traço}A)\,t+\det A$.` },
          { id: 'c6.4c', frente: R`Por que matrizes semelhantes têm o mesmo polinômio característico?`, verso: R`$tI-P^{-1}AP=P^{-1}(tI-A)P$, e matrizes semelhantes têm o mesmo determinante.` }
        ],
        blocos: [
          { t: 'html', html: R`
            <p>Como achar os autovalores? Para $v\neq0$,
            $$\begin{aligned}T(v)=\lambda v&\iff(\lambda I-T)v=0\\&\iff\operatorname{nuc}(\lambda I-T)\neq\{0\}.\end{aligned}$$
            E $\operatorname{nuc}(\lambda I-T)\neq\{0\}$ é o mesmo que $\lambda I-T$ não ser invertível, ou seja, $\det(\lambda I-T)=0$: tudo que aprendemos no capítulo 4 entra aqui.</p>` },
          { t: 'teo', rotulo: 'Polinômio característico e Proposição 6.4', html: R`
            <p>O <b>polinômio característico</b> de $T\in\mathcal{L}(V)$ é
            $$c(t)=\det(tI-T).$$
            É mônico, de grau $n=\dim V$, e $\lambda\in\mathbb{R}$ é autovalor de $T$ se, e somente se, $c(\lambda)=0$.</p>` },
          { t: 'exemplo', titulo: 'Exemplo (livro-texto)', enunciado: R`Autovalores de $[T]=\begin{bmatrix}1&2\\2&1\end{bmatrix}$.`, solucao: R`
            <p>$c(t)=\det\begin{bmatrix}t-1&-2\\-2&t-1\end{bmatrix}=(t-1)^2-4=t^2-2t-3=(t-3)(t+1)$. Autovalores: $3$ e $-1$.</p>` },
          { t: 'dica', titulo: 'Atalhos', html: R`
            <ul><li>Em $M(2)$: $c(t)=t^2-(\operatorname{traço}A)\,t+\det A$ (Exercício 6.2 do livro).</li>
            <li>Se $A$ é triangular, $tI-A$ também é, e $c(t)=(t-a_{11})\cdots(t-a_{nn})$: <b>os autovalores são a diagonal</b>.</li>
            <li>$c(0)=\det(-A)=(-1)^n\det A$.</li></ul>` },
          { t: 'pratica', itens: [
            { t: 'expr', p: R`Calcule o polinômio característico de $A=\begin{bmatrix}2&3\\4&1\end{bmatrix}$.`, r: 't^2-3t-10', vars: ['t'], rtex: R`t^2-3t-10`, ph: 'ex.: t^2 - 5t + 6',
              exp: R`Traço $3$, determinante $2-12=-10$: $c(t)=t^2-3t-10=(t-5)(t+2)$.` },
            { t: 'conj', p: R`Quais são os autovalores dessa matriz $A=\begin{bmatrix}2&3\\4&1\end{bmatrix}$?`, r: [5, -2], exp: R`As raízes de $(t-5)(t+2)$: $5$ e $-2$.` },
            { t: 'conj', p: R`Quais são os autovalores de $\begin{bmatrix}2&7&-1\\0&-3&4\\0&0&2\end{bmatrix}$?`, r: [2, -3],
              exp: R`É triangular: $c(t)=(t-2)^2(t+3)$. Autovalores $2$ (raiz dupla) e $-3$.` },
            { t: 'conj', p: R`Quais são os autovalores (reais) de $\begin{bmatrix}0&-1\\1&0\end{bmatrix}$?`, r: [],
              exp: R`$c(t)=t^2+1$ não tem raízes reais: o espectro é vazio (é a rotação de $90°$).` },
            { t: 'expr', p: R`Calcule o polinômio característico de $A=\begin{bmatrix}1&2&0\\2&1&0\\0&0&3\end{bmatrix}$ (pode deixar fatorado).`, r: '(t-3)^2*(t+1)', vars: ['t'], rtex: R`(t-3)^2(t+1)`, ph: 'ex.: (t-1)(t^2-4)',
              dica: R`Desenvolva $\det(tI-A)$ pela 3ª linha.`,
              exp: R`Pela 3ª linha: $c(t)=(t-3)\left[(t-1)^2-4\right]=(t-3)(t-3)(t+1)=(t-3)^2(t+1)$.` },
            { t: 'num', p: R`O polinômio característico de $A\in M(3)$ é $c(t)=t^3-4t^2+t+6$. Quanto vale $\det A$?`, r: -6,
              dica: R`$c(0)=\det(-A)$.`,
              exp: R`$c(0)=\det(-A)=(-1)^3\det A$, logo $\det A=-c(0)=-6$. Confira: $c(t)=(t+1)(t-2)(t-3)$ e o produto dos autovalores é $(-1)\cdot2\cdot3=-6$.` },
            { t: 'vf', p: R`$A$ e $A^*$ têm o mesmo polinômio característico.`, r: true, exp: R`$\det(tI-A^*)=\det\big((tI-A)^*\big)=\det(tI-A)$ (Exercício 6.13).` }
          ] },
          { t: 'reforco', geradores: ['polcar'] }
        ]
      },

      /* =============================================================== 5 */
      {
        id: 5,
        titulo: 'Calculando autovalores e autovetores',
        resumo: [
          R`Roteiro: (1) calcule $c(t)=\det(tI-A)$; (2) ache as raízes reais $\lambda_1,\dots,\lambda_k$; (3) para cada $\lambda_i$, resolva $(\lambda_iI-A)v=0$ e tire uma base de $W_{\lambda_i}$.`,
          R`$\dim W_\lambda=n-\operatorname{posto}(\lambda I-A)$.`
        ],
        cartoes: [
          { id: 'c6.5a', frente: R`Roteiro para achar autovalores e autoespaços de $A$.`, verso: R`1) $c(t)=\det(tI-A)$; 2) raízes reais de $c$; 3) para cada raiz $\lambda$, base do núcleo de $\lambda I-A$.` },
          { id: 'c6.5b', frente: R`Como saber $\dim W_\lambda$ sem resolver o sistema?`, verso: R`$\dim W_\lambda=n-\operatorname{posto}(\lambda I-A)$ (teorema do núcleo e da imagem).` }
        ],
        blocos: [
          { t: 'teo', rotulo: 'Roteiro', html: R`
            <ol><li>Calcule $c(t)=\det(tI-A)$ e fatore.</li>
            <li>As raízes reais $\lambda_1,\dots,\lambda_k$ são os autovalores.</li>
            <li>Para cada $\lambda_i$, escalone $\lambda_iI-A$ e resolva o sistema homogêneo: uma base das soluções é uma base de $W_{\lambda_i}$, e $\dim W_{\lambda_i}=n-\operatorname{posto}(\lambda_iI-A)$.</li></ol>` },
          { t: 'exemplo', enunciado: R`Encontre autovalores e autoespaços de $A=\begin{bmatrix}2&1&1\\1&2&1\\1&1&2\end{bmatrix}$.`, solucao: R`
            <p><b>1.</b> Em $\det(tI-A)$, somando as colunas 2 e 3 à 1ª, ela vira $(t-4)(1,1,1)$; pondo $t-4$ para fora e fazendo $\ell_2\to\ell_2-\ell_1$, $\ell_3\to\ell_3-\ell_1$:
            $$\begin{aligned}c(t)&=(t-4)\begin{vmatrix}1&-1&-1\\0&t-1&0\\0&0&t-1\end{vmatrix}\\&=(t-4)(t-1)^2.\end{aligned}$$</p>
            <p><b>2.</b> Autovalores: $4$ e $1$.</p>
            <p><b>3.</b> $4I-A=\begin{bmatrix}2&-1&-1\\-1&2&-1\\-1&-1&2\end{bmatrix}$ tem posto 2; as soluções são os múltiplos de $(1,1,1)$: $W_4=\operatorname{ger}\{(1,1,1)\}$.</p>
            <p>$I-A$ tem todas as linhas iguais a $(-1,-1,-1)$: posto 1, equação $x+y+z=0$, e $W_1=\operatorname{ger}\{(1,-1,0),(1,0,-1)\}$.</p>` },
          { t: 'pratica', itens: [
            { t: 'etapas', p: R`Vamos encontrar autovalores e autoespaços de $A=\begin{bmatrix}3&-2\\1&0\end{bmatrix}$.`,
              etapas: [
                { t: 'expr', p: R`Calcule $c(t)$.`, r: 't^2-3t+2', vars: ['t'], rtex: R`t^2-3t+2`, ph: 'ex.: t^2 - 4t + 3', exp: R`Traço $3$ e $\det A=0+2=2$: $c(t)=t^2-3t+2=(t-1)(t-2)$.` },
                { t: 'conj', p: R`Quais são os autovalores?`, r: [1, 2], exp: R`$1$ e $2$.` },
                { t: 'subesp', p: R`Dê uma base de $W_1$.`, base: [[1, 1]], exp: R`$I-A=\begin{bmatrix}-2&2\\-1&1\end{bmatrix}$ dá $x=y$: $W_1=\operatorname{ger}\{(1,1)\}$.` },
                { t: 'subesp', p: R`Dê uma base de $W_2$.`, base: [[2, 1]], exp: R`$2I-A=\begin{bmatrix}-1&2\\-1&2\end{bmatrix}$ dá $x=2y$: $W_2=\operatorname{ger}\{(2,1)\}$.` }
              ] },
            { t: 'etapas', p: R`Agora $A=\begin{bmatrix}1&0&0\\1&2&0\\-1&1&2\end{bmatrix}$.`,
              etapas: [
                { t: 'conj', p: R`Quais são os autovalores?`, r: [1, 2], exp: R`$A$ é triangular: $c(t)=(t-1)(t-2)^2$. Autovalores $1$ e $2$ (este, raiz dupla).` },
                { t: 'num', p: R`Qual é a dimensão de $W_2$?`, r: 1, dica: R`Calcule o posto de $2I-A=\begin{bmatrix}1&0&0\\-1&0&0\\1&-1&0\end{bmatrix}$.`,
                  exp: R`$2I-A$ tem posto $2$ (as linhas 1 e 3 são LI e a 2ª é $-1$ vezes a 1ª), logo $\dim W_2=3-2=1$: $W_2=\operatorname{ger}\{(0,0,1)\}$.` },
                { t: 'subesp', p: R`Dê uma base de $W_1$.`, base: [[1, -1, 2]],
                  exp: R`$I-A=\begin{bmatrix}0&0&0\\-1&-1&0\\1&-1&-1\end{bmatrix}$: $x=-y$ e $z=x-y=-2y$. Com $y=-1$: $W_1=\operatorname{ger}\{(1,-1,2)\}$.` }
              ],
              exp: R`Repare: a raiz dupla $2$ tem um autoespaço de dimensão só $1$. Somando, $\dim W_1+\dim W_2=2<3$. Isso terá consequências na próxima seção.` }
          ] },
          { t: 'reforco', geradores: ['autoesp'] }
        ]
      },

      /* =============================================================== 6 */
      {
        id: 6,
        titulo: 'Diagonalização',
        resumo: [
          R`Autovetores de autovalores distintos são LI (Prop. 6.5).`,
          R`$c(t)$ com $n$ raízes reais distintas $\Rightarrow T$ diagonalizável (Prop. 6.6). A recíproca é falsa (ex.: $I$).`,
          R`$T$ diagonalizável $\iff V=W_{\lambda_1}\oplus\cdots\oplus W_{\lambda_k}$ $\iff\dim W_{\lambda_1}+\cdots+\dim W_{\lambda_k}=n$ (Prop. 6.8).`,
          R`Se $P$ tem por colunas uma base de autovetores de $A$, então $P^{-1}AP=D=\operatorname{diag}(\lambda_1,\dots,\lambda_n)$, na mesma ordem.`
        ],
        cartoes: [
          { id: 'c6.6a', frente: R`Critério de diagonalização (Prop. 6.8).`, verso: R`$T$ é diagonalizável $\iff$ a soma das dimensões dos autoespaços é $n=\dim V$, isto é, $V=W_{\lambda_1}\oplus\cdots\oplus W_{\lambda_k}$.` },
          { id: 'c6.6b', frente: R`Condição suficiente simples para diagonalizar $A\in M(n)$.`, verso: R`$c(t)$ ter $n$ raízes reais distintas (Prop. 6.6).` },
          { id: 'c6.6c', frente: R`Como montar $P$ com $P^{-1}AP$ diagonal?`, verso: R`As colunas de $P$ são autovetores LI de $A$; a diagonal de $D=P^{-1}AP$ traz os autovalores na mesma ordem.` }
        ],
        blocos: [
          { t: 'teo', rotulo: 'Proposições 6.5 e 6.6', html: R`
            <p>Autovetores $v_1,\dots,v_k$ associados a autovalores <b>distintos</b> são LI. Em consequência, se $c(t)$ tem $n=\dim V$ raízes reais distintas, então $T$ é diagonalizável.</p>` },
          { t: 'html', html: R`
            <p>E se houver raízes repetidas? O Exemplo 6.7 do livro mostra dois operadores com o <b>mesmo</b> $c(t)=(t-1)(t-2)^2$: num deles $\dim W_2=1$ e não há base de autovetores; no outro $\dim W_2=2$ e há. O que decide é a soma das dimensões dos autoespaços.</p>` },
          { t: 'teo', rotulo: 'Proposição 6.8', html: R`
            <p>Seja $\{\lambda_1,\dots,\lambda_k\}$ o espectro de $T$. Então $T$ é diagonalizável se, e somente se,
            $$V=W_{\lambda_1}\oplus\cdots\oplus W_{\lambda_k},$$
            ou seja, $\dim W_{\lambda_1}+\cdots+\dim W_{\lambda_k}=n$. Nesse caso, $T=\lambda_1I_{W_{\lambda_1}}\oplus\cdots\oplus\lambda_kI_{W_{\lambda_k}}$.</p>` },
          { t: 'html', html: R`
            <h3>Em termos de matrizes</h3>
            <p>Seja $\mathcal{B}=\{v_1,\dots,v_n\}$ uma base de autovetores de $A$, com $Av_i=\lambda_iv_i$, e $P$ a matriz cujas colunas são $v_1,\dots,v_n$ (a matriz de mudança de base). Pela fórmula de mudança de base, $[T]_\mathcal{B}=P^{-1}[T]P$, isto é,
            $$P^{-1}AP=D=\begin{bmatrix}\lambda_1&&\\&\ddots&\\&&\lambda_n\end{bmatrix}.$$
            Equivalentemente, $A=PDP^{-1}$: “diagonalizável” é o mesmo que “semelhante a uma diagonal” (Exercício 6.8).</p>` },
          { t: 'pratica', itens: [
            { t: 'mat', p: R`Na seção anterior, $A=\begin{bmatrix}3&-2\\1&0\end{bmatrix}$ teve autovetores $(1,1)$ (autovalor $1$) e $(2,1)$ (autovalor $2$). Com $P=\begin{bmatrix}1&2\\1&1\end{bmatrix}$, quanto vale $D=P^{-1}AP$?`,
              r: [[1, 0], [0, 2]], rot: R`$D=$`, exp: R`As colunas de $P$ são autovetores na ordem $(1,1)$, $(2,1)$; logo $D=\operatorname{diag}(1,2)$, sem precisar calcular $P^{-1}$.` },
            { t: 'escolha', fixa: true, p: R`A matriz $\begin{bmatrix}1&0&0\\1&2&0\\-1&1&2\end{bmatrix}$ (também da seção anterior) é diagonalizável?`, op: ['Sim', 'Não'], c: 1,
              exp: R`$\dim W_1+\dim W_2=1+1=2<3$: não existe base de autovetores (Prop. 6.8).` },
            { t: 'escolha', p: R`Qual destas matrizes <b>não</b> é diagonalizável?`,
              op: [R`$\begin{bmatrix}1&1\\0&1\end{bmatrix}$`, R`$\begin{bmatrix}2&0\\0&2\end{bmatrix}$`, R`$\begin{bmatrix}1&2\\3&4\end{bmatrix}$`, R`$\begin{bmatrix}1&5\\0&2\end{bmatrix}$`], c: 0,
              exp: R`$\begin{bmatrix}1&1\\0&1\end{bmatrix}$: $c(t)=(t-1)^2$ e $I-A=\begin{bmatrix}0&-1\\0&0\end{bmatrix}$ tem posto 1, logo $\dim W_1=1<2$. As outras: $2I$ já é diagonal; $t^2-5t-2$ tem duas raízes reais distintas; a última é triangular com autovalores distintos $1$ e $2$.` },
            { t: 'vf', p: R`Se $A$ tem um autovalor repetido, então $A$ não é diagonalizável.`, r: false, exp: R`$I$ tem $c(t)=(t-1)^n$ e é diagonal. Raiz repetida só exige conferir as dimensões dos autoespaços.` },
            { t: 'vf', p: R`Toda $A\in M(3)$ com três autovalores reais distintos é diagonalizável.`, r: true, exp: R`Prop. 6.6: três autovetores de autovalores distintos são LI, logo formam base de $\mathbb{R}^3$.` },
            { t: 'conj', p: R`Para quais $k$ a matriz $\begin{bmatrix}2&k\\0&2\end{bmatrix}$ é diagonalizável?`, r: [0],
              exp: R`O único autovalor é $2$, e $2I-A=\begin{bmatrix}0&-k\\0&0\end{bmatrix}$. Se $k\neq0$, posto 1 e $\dim W_2=1$: não diagonaliza. Só $k=0$ (a matriz $2I$).` },
            { t: 'aberta', p: R`(Exercício 6.3) Mostre que toda matriz simétrica $A=\begin{bmatrix}a&b\\b&d\end{bmatrix}$ é diagonalizável.`,
              dica: R`Olhe o discriminante de $c(t)=t^2-(a+d)t+(ad-b^2)$.`,
              modelo: R`O discriminante é $(a+d)^2-4(ad-b^2)=(a-d)^2+4b^2\geq0$. Se for positivo, há duas raízes reais distintas e $A$ é diagonalizável (Prop. 6.6). Se for zero, então $a=d$ e $b=0$, isto é, $A=aI$, que já é diagonal.` }
          ] },
          { t: 'reforco', geradores: ['diagon'] }
        ]
      },

      /* =============================================================== 7 */
      {
        id: 7,
        titulo: 'Para que serve: potências e diagonalização simultânea',
        resumo: [
          R`Se $A=PDP^{-1}$, então $A^k=PD^kP^{-1}$, e $D^k$ se calcula elevando a diagonal.`,
          R`Operadores diagonalizáveis que comutam ($TT'=T'T$) admitem uma base que diagonaliza os dois ao mesmo tempo (Prop. 6.9).`
        ],
        cartoes: [
          { id: 'c6.7a', frente: R`Como calcular $A^{100}$ se $A$ é diagonalizável?`, verso: R`$A=PDP^{-1}\Rightarrow A^{100}=PD^{100}P^{-1}$ (os $P^{-1}P$ do meio se cancelam).` },
          { id: 'c6.7b', frente: R`Quando dois operadores diagonalizáveis podem ser diagonalizados pela mesma base?`, verso: R`Quando comutam (Prop. 6.9). E, reciprocamente, se uma base diagonaliza os dois, eles comutam (matrizes diagonais comutam).` }
        ],
        blocos: [
          { t: 'html', html: R`
            <p>Se $A=PDP^{-1}$, então
            $$A^2=PD\underbrace{P^{-1}P}_{I}DP^{-1}=PD^2P^{-1}$$ e, em geral, $$A^k=PD^kP^{-1}.$$
            Como $D$ é diagonal, $D^k$ é só elevar cada entrada da diagonal a $k$.</p>` },
          { t: 'exemplo', enunciado: R`Encontre uma fórmula para $A^k$, sendo $A=\begin{bmatrix}4&1\\2&3\end{bmatrix}$.`, solucao: R`
            <p>Já vimos que $(1,1)$ e $(1,-2)$ são autovetores, com autovalores $5$ e $2$. Então $P=\begin{bmatrix}1&1\\1&-2\end{bmatrix}$, $D=\begin{bmatrix}5&0\\0&2\end{bmatrix}$, $P^{-1}=\dfrac13\begin{bmatrix}2&1\\1&-1\end{bmatrix}$ e</p>
            $$A^k=\frac13\begin{bmatrix}2\cdot5^k+2^k&5^k-2^k\\2\cdot5^k-2\cdot2^k&5^k+2\cdot2^k\end{bmatrix}.$$
            <p>Confira com $k=1$.</p>` },
          { t: 'pratica', itens: [
            { t: 'num', p: R`Use a fórmula do exemplo para obter a entrada $(1,2)$ de $A^4$, com $A=\begin{bmatrix}4&1\\2&3\end{bmatrix}$.`, r: 203,
              exp: R`$\dfrac{5^4-2^4}{3}=\dfrac{625-16}{3}=203$.` },
            { t: 'num', p: R`Seja $A=\begin{bmatrix}1&1\\0&2\end{bmatrix}$, com autovetores $(1,0)$ (autovalor $1$) e $(1,1)$ (autovalor $2$). Qual é a entrada $(1,2)$ de $A^{10}$?`, r: 1023,
              dica: R`$P=\begin{bmatrix}1&1\\0&1\end{bmatrix}$, $P^{-1}=\begin{bmatrix}1&-1\\0&1\end{bmatrix}$.`,
              exp: R`$A^{10}=PD^{10}P^{-1}=\begin{bmatrix}1&1\\0&1\end{bmatrix}\begin{bmatrix}1&0\\0&1024\end{bmatrix}\begin{bmatrix}1&-1\\0&1\end{bmatrix}=\begin{bmatrix}1&1023\\0&1024\end{bmatrix}$.` }
          ] },
          { t: 'teo', rotulo: 'Proposição 6.9', html: R`<p>Se $T,T'\in\mathcal{L}(V)$ são diagonalizáveis e comutam ($TT'=T'T$), existe uma base de $V$ que diagonaliza $T$ e $T'$ ao mesmo tempo.</p>` },
          { t: 'html', html: R`<p>A chave da demonstração: se $v\in W_\lambda$ (autoespaço de $T$), então $T(T'v)=T'(Tv)=\lambda\,T'v$, logo $T'v\in W_\lambda$. Cada autoespaço de $T$ é invariante por $T'$, e dentro dele dá para diagonalizar $T'$.</p>` },
          { t: 'pratica', itens: [
            { t: 'escolha', p: R`As matrizes $A=\begin{bmatrix}3&1\\1&3\end{bmatrix}$ e $B=\begin{bmatrix}1&2\\2&1\end{bmatrix}$ comutam. Qual base diagonaliza as duas?`,
              op: [R`$\{(1,1),(1,-1)\}$`, R`$\{(1,0),(0,1)\}$`, R`$\{(1,2),(2,1)\}$`, R`$\{(1,3),(3,1)\}$`], c: 0,
              exp: R`$A(1,1)=4(1,1)$, $A(1,-1)=2(1,-1)$, $B(1,1)=3(1,1)$ e $B(1,-1)=-(1,-1)$.` },
            { t: 'vf', p: R`Se uma mesma base diagonaliza $T$ e $T'$, então $TT'=T'T$.`, r: true,
              exp: R`Nessa base, as matrizes são diagonais, e matrizes diagonais comutam. É a recíproca da Prop. 6.9.` }
          ] },
          { t: 'reforco', geradores: ['potencia'] }
        ]
      },

      /* =============================================================== 8 */
      {
        id: 8,
        titulo: 'Polinômios de operadores e o teorema de Cayley-Hamilton',
        resumo: [
          R`Para $p(t)=a_0+a_1t+\cdots+a_kt^k$: $p(T)=a_0I+a_1T+\cdots+a_kT^k$, e $[p(T)]_\mathcal{B}=p([T]_\mathcal{B})$.`,
          R`$p$ <b>anula</b> $T$ se $p(T)=0$ (Def. 6.11).`,
          R`Se $T(v)=\lambda v$, então $p(T)v=p(\lambda)v$. Logo, todo autovalor de $T$ é raiz de qualquer anulador de $T$ (Exercício 6.9).`,
          R`<b>Cayley-Hamilton:</b> o polinômio característico anula $T$, isto é, $c(T)=0$.`
        ],
        cartoes: [
          { id: 'c6.8a', frente: R`Enuncie o teorema de Cayley-Hamilton.`, verso: R`Todo operador é anulado por seu polinômio característico: $c(T)=0$.` },
          { id: 'c6.8b', frente: R`Se $T(v)=\lambda v$, quanto vale $p(T)v$?`, verso: R`$p(\lambda)v$. Por isso os autovalores de $T$ são raízes de qualquer anulador de $T$.` },
          { id: 'c6.8c', frente: R`Se $A^2=A$, quais são os autovalores possíveis de $A$?`, verso: R`$t^2-t=t(t-1)$ anula $A$, logo os autovalores estão em $\{0,1\}$.` }
        ],
        blocos: [
          { t: 'html', html: R`
            <p>Potências e combinações de $T$ fazem sentido: para $p(t)=a_0+a_1t+\cdots+a_kt^k$, definimos
            $$p(T)=a_0I+a_1T+a_2T^2+\cdots+a_kT^k,$$
            e o mesmo para matrizes. Em qualquer base, $[p(T)]_\mathcal{B}=p([T]_\mathcal{B})$.</p>` },
          { t: 'teo', rotulo: 'Definição 6.11 e Cayley-Hamilton', html: R`
            <p>$p$ é um <b>anulador</b> de $T$ se $p(T)=0$. Por exemplo, $p(t)=t^2+1$ anula a rotação $[T]=\begin{bmatrix}0&-1\\1&0\end{bmatrix}$, pois $[T]^2=-I$.</p>
            <p><b>Teorema de Cayley-Hamilton:</b> o polinômio característico anula o operador: $c(T)=0$. (O livro o demonstra no Apêndice A; em dimensão 2 é o Exercício 6.10.)</p>` },
          { t: 'html', html: R`
            <p>Uma observação simples e poderosa (Exercício 6.9): se $T(v)=\lambda v$, então $T^2v=\lambda^2v$, …, e
            $$p(T)v=p(\lambda)\,v.$$
            Se $p$ anula $T$, então $0=p(\lambda)v$ com $v\neq0$, logo $p(\lambda)=0$: <b>todo autovalor é raiz de qualquer anulador</b>.</p>` },
          { t: 'pratica', itens: [
            { t: 'escolha', fixa: true, p: R`O polinômio $p(t)=t^2-3t+2$ anula $A=\begin{bmatrix}1&1\\0&2\end{bmatrix}$?`, op: ['Sim', 'Não'], c: 0,
              exp: R`$A^2=\begin{bmatrix}1&3\\0&4\end{bmatrix}$ e $A^2-3A+2I=\begin{bmatrix}1-3+2&3-3\\0&4-6+2\end{bmatrix}=0$. Era de esperar: $p$ é o polinômio característico de $A$.` },
            { t: 'multi', p: R`Seja $A=\begin{bmatrix}2&1\\1&3\end{bmatrix}$. Pelo teorema de Cayley-Hamilton, $A^2=\alpha A+\beta I$. Encontre $\alpha$ e $\beta$.`,
              campos: [{ rot: R`$\alpha=$`, r: 5 }, { rot: R`$\beta=$`, r: -5 }],
              exp: R`$c(t)=t^2-5t+5$, logo $A^2-5A+5I=0$, isto é, $A^2=5A-5I$.` },
            { t: 'mat', p: R`Use a igualdade $A^2-5A+5I=0$ para obter $A^{-1}$, com $A=\begin{bmatrix}2&1\\1&3\end{bmatrix}$.`, r: [['3/5', '-1/5'], ['-1/5', '2/5']], rot: R`$A^{-1}=$`,
              dica: R`Multiplique a igualdade por $A^{-1}$.`,
              exp: R`$A-5I+5A^{-1}=0$, logo $A^{-1}=\dfrac15(5I-A)=\dfrac15\begin{bmatrix}3&-1\\-1&2\end{bmatrix}$.` },
            { t: 'conj', p: R`Suponha $A^2=A$. Quais números <b>podem</b> ser autovalores de $A$?`, r: [0, 1],
              exp: R`$p(t)=t^2-t=t(t-1)$ anula $A$, então todo autovalor é raiz de $p$: $0$ ou $1$. (Ambos ocorrem, por exemplo, numa projeção.)` },
            { t: 'conj', p: R`E se $A^3=A$?`, r: [-1, 0, 1], exp: R`$t^3-t=t(t-1)(t+1)$ anula $A$: os autovalores estão em $\{-1,0,1\}$.` },
            { t: 'aberta', p: R`(Exercício 6.9) Prove: se $\lambda$ é autovalor de $T$, então $p(\lambda)$ é autovalor de $p(T)$.`,
              modelo: R`Seja $v\neq0$ com $T(v)=\lambda v$. Por indução, $T^j(v)=\lambda^jv$. Então $p(T)v=\sum a_jT^jv=\sum a_j\lambda^jv=p(\lambda)v$, e $v\neq0$ é autovetor de $p(T)$ com autovalor $p(\lambda)$.` }
          ] },
          { t: 'reforco', geradores: ['cayley'] }
        ]
      },

      /* =============================================================== 9 */
      {
        id: 9,
        titulo: 'O polinômio mínimo',
        resumo: [
          R`O <b>polinômio mínimo</b> $m$ de $T$ é o anulador mônico de menor grau (Def. 6.12); ele é único (Prop. 6.13).`,
          R`$m$ divide todo anulador de $T$ (Prop. 6.14); em particular, $m$ divide $c$.`,
          R`$m$ e $c$ têm as mesmas raízes: os autovalores. Roteiro: teste os divisores de $c$ que têm todos os autovalores como raízes, do menor grau para o maior.`,
          R`$m_v$ (polinômio mínimo de $T$ em $v$) divide $m$; se $v$ é autovetor de $\lambda$, $m_v(t)=t-\lambda$.`,
          R`$T$ é invertível $\iff$ $m(0)\neq0$ (Exercício 6.17).`
        ],
        cartoes: [
          { id: 'c6.9a', frente: R`Definição de polinômio mínimo.`, verso: R`O polinômio mônico de menor grau que anula $T$. É único e divide todo anulador de $T$.` },
          { id: 'c6.9b', frente: R`Como encontrar o polinômio mínimo na prática?`, verso: R`Fatore $c(t)=\prod(t-\lambda_i)^{k_i}$; teste $\prod(t-\lambda_i)^{e_i}$ com $1\leq e_i\leq k_i$, do menor grau para o maior; o primeiro que anular $T$ é $m$.` },
          { id: 'c6.9c', frente: R`Polinômio mínimo de $\lambda I$?`, verso: R`$t-\lambda$. E, reciprocamente, $m$ de grau 1 só acontece para $T=\lambda I$.` }
        ],
        blocos: [
          { t: 'teo', rotulo: 'Definição 6.12 e Proposições 6.13 e 6.14', html: R`
            <p>O <b>polinômio mínimo</b> $m$ de $T$ é o anulador <b>mônico</b> de <b>menor grau</b>. Ele existe (algum anulador sempre existe, pois $\{I,T,\dots,T^{n^2}\}$ é LD), é único, e divide qualquer anulador de $T$ (algoritmo da divisão).</p>` },
          { t: 'html', html: R`
            <h3>Como calcular</h3>
            <p>Juntando o que já sabemos:</p>
            <ul><li>Por Cayley-Hamilton, $c$ anula $T$, logo <b>$m$ divide $c$</b>;</li>
            <li>$m$ anula $T$, logo <b>todo autovalor é raiz de $m$</b>.</li></ul>
            <p>Então, se $c(t)=(t-\lambda_1)^{k_1}\cdots(t-\lambda_r)^{k_r}$, o mínimo é da forma
            $$m(t)=(t-\lambda_1)^{e_1}\cdots(t-\lambda_r)^{e_r},$$ com $1\leq e_i\leq k_i$,
            e basta testar os candidatos do menor grau para o maior.</p>` },
          { t: 'exemplo', titulo: 'Exemplos 6.15 e 6.16 (livro-texto)', enunciado: R`Polinômios mínimos de $\begin{bmatrix}0&-1\\1&0\end{bmatrix}$ e de $\begin{bmatrix}1&0&a\\0&1&b\\0&0&1\end{bmatrix}$ ($a,b\neq0$).`, solucao: R`
            <p>Para a rotação, $t^2+1$ anula; um mínimo de grau 1, $t-\lambda$, exigiria $T=\lambda I$, o que não ocorre. Logo $m(t)=t^2+1$.</p>
            <p>Na segunda, $c(t)=(t-1)^3$. Como a matriz não é $I$, $t-1$ não anula; mas $(A-I)^2=0$. Logo $m(t)=(t-1)^2$.</p>` },
          { t: 'pratica', itens: [
            { t: 'expr', p: R`Polinômio mínimo de $A=\begin{bmatrix}2&0&0\\0&2&0\\0&0&3\end{bmatrix}$?`, r: '(t-2)(t-3)', vars: ['t'], rtex: R`(t-2)(t-3)`, ph: 'ex.: (t-1)^2(t+2)',
              exp: R`$c(t)=(t-2)^2(t-3)$. Candidato de menor grau: $(t-2)(t-3)$, e $(A-2I)(A-3I)=\operatorname{diag}(0,0,1)\operatorname{diag}(-1,-1,0)=0$. Logo $m(t)=(t-2)(t-3)$.` },
            { t: 'expr', p: R`Polinômio mínimo de $A=\begin{bmatrix}2&1&0\\0&2&0\\0&0&3\end{bmatrix}$?`, r: '(t-2)^2*(t-3)', vars: ['t'], rtex: R`(t-2)^2(t-3)`, ph: 'ex.: (t-1)^2(t+2)',
              exp: R`Agora $(A-2I)(A-3I)=\begin{bmatrix}0&1&0\\0&0&0\\0&0&1\end{bmatrix}\begin{bmatrix}-1&1&0\\0&-1&0\\0&0&0\end{bmatrix}=\begin{bmatrix}0&-1&0\\0&0&0\\0&0&0\end{bmatrix}\neq0$. O próximo candidato é o próprio $c$: $m(t)=(t-2)^2(t-3)$.` },
            { t: 'expr', p: R`Polinômio mínimo de $3I\in M(4)$?`, r: 't-3', vars: ['t'], rtex: R`t-3`, exp: R`$3I-3I=0$: $m(t)=t-3$, de grau 1.` },
            { t: 'vf', p: R`O polinômio mínimo e o característico têm exatamente as mesmas raízes.`, r: true,
              exp: R`$m$ divide $c$ (então as raízes de $m$ são raízes de $c$) e todo autovalor é raiz de $m$.` },
            { t: 'expr', p: R`Se $v$ é autovetor de $T$ com autovalor $\lambda=4$, qual é o polinômio mínimo de $T$ em $v$, $m_v$?`, r: 't-4', vars: ['t'], rtex: R`t-4`,
              exp: R`$(T-4I)v=0$, e nenhum polinômio mônico de grau $0$ (a constante $1$) anula $T$ em $v\neq0$. Logo $m_v(t)=t-4$ (Exemplo 6.19).` },
            { t: 'vf', p: R`Se o termo constante de $m$ é zero, então $T$ não é invertível.`, r: true,
              exp: R`$m(0)=0$ significa que $0$ é raiz de $m$, ou seja, autovalor de $T$ (Exercício 6.17).` }
          ] },
          { t: 'livro', html: R`Na seção 6.4 (fora do nosso programa), o livro prova com o Teorema da Decomposição Primária que $T$ é diagonalizável se, e somente se, $m$ é um produto de fatores $(t-\lambda_i)$ distintos (Teorema 6.28). Compare com os exemplos acima.` },
          { t: 'reforco', geradores: ['minimo'] }
        ]
      },

      /* =============================================================== 10 */
      {
        id: 10,
        titulo: 'Revisão: diagonalizando do começo ao fim',
        resumo: [
          R`Diagonalizar: $c(t)$ → autovalores → base de cada $W_\lambda$ → soma das dimensões $=n$? → $P$ (autovetores nas colunas) e $D$ (autovalores).`
        ],
        cartoes: [
          { id: 'c6.10a', frente: R`Uma matriz $n\times n$ com todas as entradas iguais a $1$ é diagonalizável? Quais os autovalores?`, verso: R`Sim. Autovalores $n$ (autovetor $(1,\dots,1)$) e $0$ (autoespaço $x_1+\cdots+x_n=0$, de dimensão $n-1$). $m(t)=t(t-n)$.` }
        ],
        blocos: [
          { t: 'html', html: R`<p>Dois exercícios guiados que reúnem o capítulo. Faça no papel e confira cada etapa.</p>` },
          { t: 'pratica', titulo: 'Revisão guiada', itens: [
            { t: 'etapas', p: R`Seja $A=\begin{bmatrix}1&-3&3\\3&-5&3\\6&-6&4\end{bmatrix}$.`,
              etapas: [
                { t: 'expr', p: R`Calcule $c(t)$ (pode deixar fatorado).`, r: '(t-4)*(t+2)^2', vars: ['t'], rtex: R`(t-4)(t+2)^2`, ph: 'ex.: (t-1)(t+3)^2',
                  dica: R`Em $\det(tI-A)$, faça $\ell_1\to\ell_1-\ell_2$: a 1ª linha vira $(t+2)(1,-1,0)$.`,
                  exp: R`$tI-A=\begin{bmatrix}t-1&3&-3\\-3&t+5&-3\\-6&6&t-4\end{bmatrix}$. Com $\ell_1\to\ell_1-\ell_2$, a 1ª linha fica $(t+2)(1,-1,0)$. Pondo $t+2$ para fora e somando a 1ª coluna à 2ª, a 1ª linha vira $(1,0,0)$:
                    $$c(t)=(t+2)\begin{vmatrix}t+2&-3\\0&t-4\end{vmatrix}=(t-4)(t+2)^2.$$ (Expandindo: $t^3-12t-16$.)` },
                { t: 'conj', p: R`Quais são os autovalores?`, r: [4, -2], exp: R`$4$ e $-2$ (raiz dupla).` },
                { t: 'num', p: R`Qual é a dimensão de $W_{-2}$?`, r: 2, dica: R`Olhe as linhas de $-2I-A$.`,
                  exp: R`$-2I-A=\begin{bmatrix}-3&3&-3\\-3&3&-3\\-6&6&-6\end{bmatrix}$ tem posto $1$: $\dim W_{-2}=2$, com base $\{(1,1,0),(-1,0,1)\}$.` },
                { t: 'subesp', p: R`Dê uma base de $W_4$.`, base: [[1, 1, 2]],
                  exp: R`$4I-A=\begin{bmatrix}3&3&-3\\-3&9&-3\\-6&6&0\end{bmatrix}$: da 3ª linha, $x=y$; da 1ª, $z=x+y=2x$. $W_4=\operatorname{ger}\{(1,1,2)\}$.` },
                { t: 'escolha', fixa: true, p: R`$A$ é diagonalizável?`, op: ['Sim', 'Não'], c: 0,
                  exp: R`$\dim W_4+\dim W_{-2}=1+2=3$. Com $P=\begin{bmatrix}1&1&-1\\1&1&0\\2&0&1\end{bmatrix}$, $P^{-1}AP=\operatorname{diag}(4,-2,-2)$.` },
                { t: 'expr', p: R`E o polinômio mínimo de $A$?`, r: '(t-4)(t+2)', vars: ['t'], rtex: R`(t-4)(t+2)`,
                  exp: R`O candidato de menor grau, $(t-4)(t+2)$, já anula: $(A-4I)(A+2I)=0$ (confira!). Logo $m(t)=(t-4)(t+2)$.` }
              ] },
            { t: 'etapas', p: R`Seja $J\in M(4)$ a matriz com <b>todas</b> as entradas iguais a $1$.`,
              etapas: [
                { t: 'num', p: R`$J(1,1,1,1)^*=\lambda(1,1,1,1)^*$. Quanto vale $\lambda$?`, r: 4, exp: R`Cada linha soma $4$: $J(1,1,1,1)^*=(4,4,4,4)^*$.` },
                { t: 'num', p: R`Qual é a dimensão de $W_0=\operatorname{nuc}J$?`, r: 3, exp: R`$J$ tem posto $1$, então $\dim\operatorname{nuc}J=4-1=3$ (é o hiperplano $x_1+x_2+x_3+x_4=0$).` },
                { t: 'conj', p: R`Quais são todos os autovalores de $J$?`, r: [0, 4],
                  exp: R`$\dim W_0+\dim W_4\geq3+1=4$, então não sobra espaço para outros autovetores: autovalores $0$ e $4$, e $J$ é diagonalizável. De fato, $c(t)=t^3(t-4)$.` },
                { t: 'expr', p: R`Qual é o polinômio mínimo de $J$?`, r: 't(t-4)', vars: ['t'], rtex: R`t(t-4)`,
                  exp: R`$J^2=4J$ (cada entrada de $J^2$ é $1+1+1+1$), logo $J(J-4I)=0$. Grau 1 não serve ($J$ não é múltiplo de $I$). Então $m(t)=t(t-4)$.` }
              ] }
          ] },
          { t: 'pratica', titulo: 'Verdadeiro ou falso', itens: [
            { t: 'vf', p: R`Matrizes semelhantes têm os mesmos autovalores.`, r: true, exp: R`Têm o mesmo polinômio característico (Exercício 6.12).` },
            { t: 'vf', p: R`Se $A$ e $B$ têm o mesmo polinômio característico, então são semelhantes.`, r: false,
              exp: R`$I$ e $\begin{bmatrix}1&1\\0&1\end{bmatrix}$ têm $c(t)=(t-1)^2$, mas só $I$ é semelhante a $I$.` },
            { t: 'vf', p: R`Toda matriz real $2\times2$ tem pelo menos um autovalor real.`, r: false, exp: R`A rotação de $90°$ não tem: $c(t)=t^2+1$.` },
            { t: 'vf', p: R`Toda matriz real $3\times3$ tem pelo menos um autovalor real.`, r: true,
              exp: R`$c(t)$ tem grau $3$ (ímpar), e todo polinômio real de grau ímpar tem uma raiz real (teorema do valor intermediário).` },
            { t: 'vf', p: R`Se $A$ é diagonalizável e invertível, então $A^{-1}$ também é diagonalizável.`, r: true,
              exp: R`$A=PDP^{-1}$ com $D$ invertível dá $A^{-1}=PD^{-1}P^{-1}$, e $D^{-1}$ é diagonal.` }
          ] }
        ]
      }
    ]
  });
})();
