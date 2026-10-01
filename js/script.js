/* ─── IMC CALCULATOR ─── */
  function calcIMC() {
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const result = document.getElementById('imcResult');
    const imcVal = document.getElementById('imcValue');
    const imcCls = document.getElementById('imcClass');

    if (peso > 0 && altura > 0) {
      const h = altura / 100;
      const imc = (peso / (h * h)).toFixed(1);
      let cls = '';
      if (imc < 18.5)      cls = 'Abaixo do peso';
      else if (imc < 25)   cls = 'Peso normal';
      else if (imc < 30)   cls = 'Sobrepeso';
      else if (imc < 35)   cls = 'Obesidade I';
      else if (imc < 40)   cls = 'Obesidade II';
      else                 cls = 'Obesidade III';

      imcVal.textContent = imc;
      imcCls.textContent = cls;
      result.style.display = 'flex';
    } else {
      imcVal.textContent = '';
      imcCls.textContent = '';
      result.style.display = 'none';
    }
  }

  /* ─── PILL FIX: nested label workaround ─── */
  function fixPills(root) {
    root.querySelectorAll('.pill').forEach(pill => {
      if (pill.dataset.fixed) return;
      const input = pill.querySelector('input');
      const innerLabel = pill.querySelector('label');
      if (!innerLabel || !input) return;
      innerLabel.setAttribute('for', input.id || (input.id = 'i_' + Math.random().toString(36).slice(2)));
      pill.addEventListener('click', e => {
        if (e.target === pill) input.click();
      });
      pill.dataset.fixed = '1';
    });
  }

  /* ─── HELPERS ─── */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function getRadio(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '—';
  }

  function getCheckboxes(name) {
    const checked = [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(e => e.value);
    return checked.length ? checked.join(', ') : '—';
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? (el.value.trim() || '—') : '—';
  }

  /* ─── SERVIÇOS ─── */
  function servicosEscolhidos() {
    const ids = [...document.querySelectorAll('input[name="servico"]:checked')].map(e => e.value);
    return SERVICOS.filter(s => ids.includes(s.id));
  }

  function renderServicos() {
    document.getElementById('servicosGrid').innerHTML = SERVICOS.map(s => `
      <label class="servico-card">
        <input type="checkbox" name="servico" value="${s.id}" />
        <span class="servico-check"></span>
        <span class="servico-text">
          <span class="servico-nome">${s.nome}</span>
          <span class="servico-desc">${s.descricao}</span>
        </span>
      </label>
    `).join('');
  }

  function atualizarCardsServico() {
    document.querySelectorAll('.servico-card').forEach(card => {
      card.classList.toggle('selected', card.querySelector('input').checked);
    });
  }

  // Perguntas de cada serviço escolhido; uma pergunta com o mesmo id aparece só no primeiro serviço
  function blocosDosServicos() {
    const vistos = new Set(FICHA_GERAL.map(q => q.id));
    return servicosEscolhidos().map(s => ({
      servico: s,
      perguntas: s.perguntas.filter(q => !vistos.has(q.id) && vistos.add(q.id)),
    })).filter(b => b.perguntas.length);
  }

  function mostrarProdutos() {
    return servicosEscolhidos().some(s => s.produtos);
  }

  /* ─── RENDER DE PERGUNTAS ─── */
  function renderPills(q, type) {
    return `<div class="pills">${q.opcoes.map((op, i) => `
      <label class="pill"><input type="${type}" name="${q.id}" id="${q.id}_${i}" value="${escapeHtml(op)}" /><label>${op}</label></label>`).join('')}
    </div>`;
  }

  function renderPergunta(q) {
    const req = q.obrigatoria ? ' <span class="req">*</span>' : '';
    const label = `<label>${q.texto}${req}</label>`;
    const ph = q.placeholder ? ` placeholder="${escapeHtml(q.placeholder)}"` : '';

    switch (q.tipo) {
      case 'texto':
        return `<div class="field">${label}<input type="text" id="${q.id}"${ph} /></div>`;
      case 'texto-longo':
        return `<div class="field">${label}<textarea id="${q.id}"${ph}></textarea></div>`;
      case 'numero':
        return `<div class="field">${label}<input type="number" id="${q.id}"${ph} /></div>`;
      case 'escolha':
        return `<div class="field">${label}${renderPills(q, 'radio')}</div>`;
      case 'multipla':
        return `<div class="field">${label}${renderPills(q, 'checkbox')}</div>`;
      case 'sim-qual': {
        const cond = 'cond_' + q.id;
        const opcoes = q.opcoes || ['Sim', 'Não'];
        const abre = escapeHtml(q.abreEm || 'Sim');
        const dph = q.detalhePlaceholder ? ` placeholder="${escapeHtml(q.detalhePlaceholder)}"` : '';
        const detalhe = q.detalheTipo === 'numero'
          ? `<input type="number" id="${q.id}Detalhe"${dph} />`
          : `<textarea id="${q.id}Detalhe"${dph}></textarea>`;
        return `<div class="field">${label}
          <div class="pills">${opcoes.map((op, i) => `
            <label class="pill"><input type="radio" name="${q.id}" id="${q.id}_${i}" value="${escapeHtml(op)}" data-cond="${cond}" data-abre="${abre}" /><label>${op}</label></label>`).join('')}
          </div>
          <div class="conditional" id="${cond}">
            ${q.mensagem ? `<div class="parabens-msg">${q.mensagem}</div>` : ''}
            ${q.detalheLabel
              ? `<div class="field" style="margin-top: 12px;"><label>${q.detalheLabel}</label>${detalhe}</div>`
              : detalhe}
          </div>
        </div>`;
      }
    }
    return '';
  }

  /* ─── PÁGINAS DE 3 EM 3 ─── */
  const POR_PAGINA = 3;

  function emGrupos(lista) {
    const grupos = [];
    for (let i = 0; i < lista.length; i += POR_PAGINA) grupos.push(lista.slice(i, i + POR_PAGINA));
    return grupos;
  }

  // Perguntas que têm uma opção "Não" (Não, Não fumo, Não bebo...)
  function opcaoNao(q) {
    if (q.tipo !== 'escolha' && q.tipo !== 'sim-qual') return null;
    return (q.opcoes || ['Sim', 'Não']).find(o => /^Não/.test(o)) || null;
  }

  // Cada página guarda o título e a faixa de perguntas, para a barra de progresso
  function renderPagina(perguntas, titulo, inicio, total, cabecalho = '') {
    const fim = inicio + perguntas.length - 1;
    const botaoNenhuma = perguntas.filter(opcaoNao).length >= 2
      ? `<button type="button" class="btn-nenhuma" onclick="marcarNaoNaPagina(this)">Nenhuma das anteriores</button>`
      : '';
    return `
      <div class="pagina" data-titulo="${escapeHtml(titulo)}" data-faixa="${inicio === fim ? inicio : inicio + ' a ' + fim} de ${total}">
        ${cabecalho}
        <div class="fields">${perguntas.map(renderPergunta).join('')}</div>
        ${botaoNenhuma}
      </div>`;
  }

  // Ficha geral: perguntas do mesmo tema ficam juntas, no máximo 3 por tela
  function paginasPorTema(lista) {
    const temas = [];
    lista.forEach(q => {
      const ultimo = temas[temas.length - 1];
      if (ultimo && ultimo.tema === q.tema) ultimo.perguntas.push(q);
      else temas.push({ tema: q.tema, perguntas: [q] });
    });
    return temas.flatMap(t => emGrupos(t.perguntas).map(perguntas => ({ tema: t.tema, perguntas })));
  }

  function marcarNaoNaPagina(botao) {
    botao.closest('.pagina').querySelectorAll('.fields > .field').forEach(field => {
      const radio = [...field.querySelectorAll(':scope > .pills input[type="radio"]')].find(r => /^Não/.test(r.value));
      if (!radio) return;
      radio.checked = true;
      field.classList.remove('em-branco');
      if (radio.dataset.cond) toggleConditional(radio.dataset.cond, radio);
    });
    salvarRascunho();
  }

  // Monta a ficha geral e as perguntas de cada serviço escolhido, em páginas de 3
  function montarEtapas() {
    const escolhidos = servicosEscolhidos();

    let inicio = 1;
    document.getElementById('fichaGeral').innerHTML = paginasPorTema(FICHA_GERAL).map(pg => {
      const html = renderPagina(pg.perguntas, 'Ficha Geral', inicio, FICHA_GERAL.length,
        pg.tema ? `<div class="tema-title">${pg.tema}</div>` : '');
      inicio += pg.perguntas.length;
      return html;
    }).join('');

    document.getElementById('perguntasServicos').innerHTML = blocosDosServicos().map(b =>
      emGrupos(b.perguntas).map((g, i) => renderPagina(
        g, b.servico.nome, i * POR_PAGINA + 1, b.perguntas.length,
        `<div class="servico-bloco-title">${b.servico.nome}</div>`
      )).join('')
    ).join('');

    document.getElementById('produtosField').style.display = mostrarProdutos() ? '' : 'none';
    document.getElementById('headerServicos').textContent = escolhidos.map(s => s.nome).join(' · ');

    fixPills(document.getElementById('formCard'));
    montarTelas();
  }

  /* ─── NAVIGATION ───
     "telas" é a sequência completa: Serviços, Dados Pessoais e cada página de perguntas. */
  let telas = [];
  let current = 0;

  function montarTelas() {
    telas = [
      { step: 'step1', titulo: 'Serviços' },
      { step: 'step2', titulo: 'Dados Pessoais' },
      ...['step3', 'step4'].flatMap(step =>
        [...document.querySelectorAll(`#${step} .pagina`)].map(pagina => ({
          step, pagina, titulo: pagina.dataset.titulo, faixa: pagina.dataset.faixa,
        }))
      ),
    ];
  }

  function mostrarTela(n) {
    current = Math.min(Math.max(n, 0), telas.length - 1);
    const tela = telas[current];
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.pagina').forEach(p => p.classList.remove('active'));
    document.getElementById(tela.step).classList.add('active');
    if (tela.pagina) tela.pagina.classList.add('active');

    atualizarIncentivo(tela);

    const ultima = current === telas.length - 1;
    document.getElementById('btnFinalLabel').textContent = ultima ? 'Revisar respostas' : 'Avançar';

    updateProgress();
    scrollTop();
    salvarRascunho();
  }

  function primeiroNome() {
    return document.getElementById('nome').value.trim().split(/\s+/)[0] || '';
  }

  // Mensagens de acolhimento: no início da ficha geral, no início das perguntas do serviço e na tela final
  function atualizarIncentivo(tela) {
    document.querySelectorAll('.incentivo').forEach(el => { el.textContent = ''; });
    if (!tela.pagina) return;
    const nome = primeiroNome();
    const primeiraDoStep = telas.find(t => t.step === tela.step) === tela;
    let msg = '';
    if (tela.pagina.id === 'paginaFinal') msg = nome ? `Última etapa, ${nome}!` : 'Última etapa!';
    else if (primeiraDoStep && tela.step === 'step3') msg = nome ? `Prazer, ${nome}! Agora, algumas perguntas sobre a sua saúde.` : 'Agora, algumas perguntas sobre a sua saúde.';
    else if (primeiraDoStep && tela.step === 'step4') msg = nome ? `Falta pouco, ${nome}!` : 'Falta pouco!';
    document.querySelector(`#${tela.step} .incentivo`).textContent = msg;
  }

  function avancar() {
    if (!validate(telas[current])) return;
    if (current === 0) {
      guardarRespostas();
      montarEtapas();
      aplicarRespostas(respostas);
    }
    if (current === telas.length - 1) return verificarBrancos();
    mostrarTela(current + 1);
  }

  /* ─── AVISO DE PERGUNTAS EM BRANCO ─── */
  function perguntasAtivas() {
    return [...FICHA_GERAL, ...blocosDosServicos().flatMap(b => b.perguntas)];
  }

  function emBranco(q) {
    if (q.opcional) return false;
    if (q.tipo === 'escolha' || q.tipo === 'sim-qual' || q.tipo === 'multipla') {
      return !document.querySelector(`input[name="${q.id}"]:checked`);
    }
    return getVal(q.id) === '—';
  }

  function elementoDaPergunta(q) {
    return document.querySelector(`input[name="${q.id}"]`) || document.getElementById(q.id);
  }

  function verificarBrancos() {
    const brancos = perguntasAtivas().filter(emBranco);
    if (!brancos.length) return goToConfirm();
    document.getElementById('modalBrancoTexto').textContent = brancos.length === 1
      ? 'Você deixou 1 pergunta sem resposta. Quer voltar e responder, ou continuar assim?'
      : `Você deixou ${brancos.length} perguntas sem resposta. Quer voltar e responder, ou continuar assim?`;
    document.getElementById('modalBranco').classList.add('show');
  }

  function fecharModal() {
    document.getElementById('modalBranco').classList.remove('show');
  }

  function irParaPrimeiraEmBranco() {
    fecharModal();
    const brancos = perguntasAtivas().filter(emBranco);
    document.querySelectorAll('.field.em-branco').forEach(f => f.classList.remove('em-branco'));
    brancos.forEach(q => elementoDaPergunta(q).closest('.field').classList.add('em-branco'));
    const pagina = elementoDaPergunta(brancos[0]).closest('.pagina');
    mostrarTela(telas.findIndex(t => t.pagina === pagina));
  }

  function continuarAssim() {
    fecharModal();
    goToConfirm();
  }

  function voltar() {
    if (document.getElementById('stepConfirm').classList.contains('active')) return mostrarTela(telas.length - 1);
    mostrarTela(current - 1);
  }

  function goToConfirm() {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('stepConfirm').classList.add('active');
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('sectionName').textContent = 'Confirmação';
    document.getElementById('stepCount').textContent = '✓';
    buildSummary();
    scrollTop();
    prepararPDF();
  }

  function updateProgress() {
    const tela = telas[current];
    document.getElementById('progressFill').style.width = ((current + 1) / (telas.length + 1) * 100) + '%';
    document.getElementById('sectionName').textContent = tela.titulo;
    document.getElementById('stepCount').textContent = tela.faixa ? 'Perguntas ' + tela.faixa : '';
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ─── VALIDATION ─── */
  function validate(tela) {
    if (tela.step === 'step1') {
      if (!servicosEscolhidos().length) { showToast('Escolha pelo menos um serviço.'); return false; }
    }
    if (tela.step === 'step2') {
      const nome = document.getElementById('nome').value.trim();
      const idade = document.getElementById('idade').value.trim();
      const tel = document.getElementById('telefone').value.trim();
      if (!nome) { showToast('Por favor, informe seu nome completo.'); return false; }
      if (!idade) { showToast('Por favor, informe sua idade.'); return false; }
      if (!tel) { showToast('Por favor, informe seu telefone/WhatsApp.'); return false; }
    }
    if (tela.pagina && tela.pagina.id === 'paginaFinal') {
      if (!document.getElementById('consentimento').checked) {
        showToast('Para continuar, aceite o termo de consentimento.');
        return false;
      }
      if (!document.getElementById('assinatura').value.trim()) {
        showToast('Digite seu nome completo como assinatura.');
        return false;
      }
    }
    return true;
  }

  /* ─── CONDITIONAL FIELDS ─── */
  function toggleConditional(id, radioEl) {
    const el = document.getElementById(id);
    if (!el) return;
    if (radioEl && radioEl.value === (radioEl.dataset.abre || 'Sim')) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  }

  /* ─── TOAST ─── */
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  /* ─── RESPOSTAS E RASCUNHO ───
     As respostas ficam guardadas no próprio navegador da cliente.
     Se ela fechar a página sem querer, tudo volta quando ela abrir de novo. */
  const DRAFT_KEY = 'anamnese-vmb-rascunho';
  let respostas = {};

  function coletarRespostas() {
    const r = {};
    document.querySelectorAll('#formCard input, #formCard textarea').forEach(el => {
      if (el.type === 'radio') {
        if (el.checked) r[el.name] = el.value;
        else if (!(el.name in r)) r[el.name] = null;
      } else if (el.type === 'checkbox') {
        if (!Array.isArray(r[el.name])) r[el.name] = [];
        if (el.checked) r[el.name].push(el.value);
      } else if (el.id) {
        r[el.id] = el.value;
      }
    });
    return r;
  }

  // Mescla o que está na tela com o que já estava guardado,
  // para não perder respostas de serviços desmarcados e remarcados
  function guardarRespostas() {
    Object.assign(respostas, coletarRespostas());
  }

  function aplicarRespostas(r) {
    document.querySelectorAll('#formCard input, #formCard textarea').forEach(el => {
      if (el.type === 'radio') {
        if (el.name in r) el.checked = r[el.name] === el.value;
      } else if (el.type === 'checkbox') {
        if (Array.isArray(r[el.name])) el.checked = r[el.name].includes(el.value);
      } else if (el.id && el.id in r) {
        el.value = r[el.id];
      }
    });
    document.querySelectorAll('#formCard input[type="radio"][data-cond]:checked').forEach(el => {
      toggleConditional(el.dataset.cond, el);
    });
    atualizarCardsServico();
    calcIMC();
  }

  function salvarRascunho() {
    guardarRespostas();
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ respostas, tela: current }));
    } catch (e) { /* navegador sem armazenamento: segue sem rascunho */ }
  }

  function limparRascunho() {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
  }

  function restaurarRascunho() {
    let salvo = null;
    try { salvo = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch (e) {}
    if (!salvo || !salvo.respostas) return;

    respostas = salvo.respostas;
    aplicarRespostas(respostas);   // marca os serviços
    montarEtapas();                // monta as perguntas desses serviços
    aplicarRespostas(respostas);   // preenche as perguntas

    if (servicosEscolhidos().length && salvo.tela > 0) mostrarTela(salvo.tela);
    showToast('Recuperamos suas respostas anteriores.');
  }

  /* ─── RESUMO (mesmos dados para a tela e o WhatsApp) ─── */
  function linhasDaPergunta(q) {
    switch (q.tipo) {
      case 'escolha':
        return [[q.resumo, getRadio(q.id)]];
      case 'multipla':
        return [[q.resumo, getCheckboxes(q.id)]];
      case 'sim-qual': {
        const v = getRadio(q.id);
        return [[q.resumo, v], ...(v === (q.abreEm || 'Sim') ? [[q.detalheResumo, getVal(q.id + 'Detalhe')]] : [])];
      }
      default:
        return [[q.resumo, getVal(q.id)]];
    }
  }

  // Respostas de risco (perguntas com "alerta: true" respondidas com algo diferente de "Não")
  function pontosDeAtencao() {
    return perguntasAtivas().filter(q => q.alerta).flatMap(q => {
      const v = getRadio(q.id);
      if (v === '—' || /^Não/.test(v)) return [];
      const detalhe = q.tipo === 'sim-qual' && v === (q.abreEm || 'Sim') ? getVal(q.id + 'Detalhe') : '—';
      return [[q.resumo, detalhe !== '—' ? `${v} (${detalhe})` : v]];
    });
  }

  function dataHora() {
    const d = new Date();
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function montarDadosResumo() {
    const escolhidos = servicosEscolhidos();
    const peso = getVal('peso');
    const altura = getVal('altura');
    const imc = document.getElementById('imcValue').textContent;
    const imcClass = document.getElementById('imcClass').textContent;

    const atencao = pontosDeAtencao();

    return [
      {
        title: 'Atenção', icon: '⚠️', destaque: true,
        rows: atencao.length ? atencao : [['Nenhum ponto de atenção informado', '']]
      },
      {
        title: 'Serviços', icon: '💆',
        rows: [['Serviços escolhidos', escolhidos.map(s => s.nome).join(', ')]]
      },
      {
        title: 'Dados Pessoais', icon: '📋',
        rows: [
          ['Nome completo', getVal('nome')],
          ['Idade', getVal('idade')],
          ['Telefone / WhatsApp', getVal('telefone')],
          ...(peso !== '—' ? [['Peso', peso + ' kg']] : []),
          ...(altura !== '—' ? [['Altura', altura + ' cm']] : []),
          ...(imc ? [['IMC', imc + (imcClass ? ' — ' + imcClass : '')]] : []),
        ]
      },
      {
        title: 'Ficha Geral de Saúde', icon: '🏥',
        rows: FICHA_GERAL.flatMap(linhasDaPergunta)
      },
      ...blocosDosServicos().map(b => ({
        title: b.servico.nome, icon: '✨',
        rows: b.perguntas.flatMap(linhasDaPergunta)
      })),
      ...(mostrarProdutos() ? [{
        title: 'Produtos', icon: '💧',
        rows: [['Interesse em produtos', getRadio('interesseProdutos')]]
      }] : []),
      {
        title: 'Termo de Consentimento', icon: '✍️',
        rows: [
          ['Declaração e consentimento (LGPD)', document.getElementById('consentimento').checked ? 'Aceito' : 'Não aceito'],
          ['Assinatura', getVal('assinatura')],
          ['Data', dataHora()],
        ]
      }
    ].filter(section => section.rows.length);
  }

  function buildSummary() {
    const container = document.getElementById('summaryContent');
    container.innerHTML = montarDadosResumo().map(section => `
      <div class="summary-section${section.destaque ? ' summary-destaque' : ''}">
        <div class="summary-section-title">${escapeHtml(section.title)}</div>
        ${section.rows.map(([q, a]) => `
          <div class="summary-row">
            <span class="summary-q">${escapeHtml(q)}</span>
            <span class="summary-a">${escapeHtml(a)}</span>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  /* ─── WHATSAPP ─── */
  function sendWhatsApp() {
    const lines = ['🌸 *Anamnese — Viva Mais Bella*'];
    montarDadosResumo().forEach(section => {
      lines.push('', `*${section.icon} ${section.destaque ? section.title.toUpperCase() : section.title}*`);
      section.rows.forEach(([q, a]) => lines.push(a ? `${q}: ${a}` : q));
    });
    lines.push('', '_Enviado via Anamnese Digital Viva Mais Bela_');

    // ← Troque pelo número do WhatsApp do spa (somente dígitos, com DDI)
    const phone = '5571991158054';
    const msg = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    limparRascunho();
  }

  /* ─── PDF ───
     O PDF é gerado no celular da cliente. A biblioteca e a logo são carregadas
     quando a tela de revisão abre, para o botão responder na hora. */
  let pdfPronto = null;
  let logoPDF = null;

  function carregarScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function carregarLogo() {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const escala = 240 / Math.max(img.width, img.height);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * escala); c.height = Math.round(img.height * escala);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve({ data: c.toDataURL('image/png'), proporcao: c.height / c.width });
      };
      img.onerror = () => resolve(null);
      img.src = 'img/logo-transparent.png';
    });
  }

  function prepararPDF() {
    if (!pdfPronto) {
      pdfPronto = Promise.all([
        window.jspdf ? Promise.resolve() : carregarScript('js/vendor/jspdf.umd.min.js'),
        carregarLogo().then(l => { logoPDF = l; }),
      ]);
    }
    return pdfPronto;
  }

  function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, H = 297, M = 16, CW = W - 2 * M;
    const ROSA = [200, 114, 142], ROSA_CLARO = [253, 240, 245], BORDA = [236, 197, 212], CINZA = [107, 114, 128], ESCURO = [17, 24, 39];
    const limpar = t => String(t).replace(/[—–]/g, '-').replace(/[^\x00-\xFF]/g, '').trim();
    let y = M;
    const garantir = h => { if (y + h > H - M - 6) { doc.addPage(); y = M; } };

    if (logoPDF) {
      const w = 30, h = w * logoPDF.proporcao;
      doc.addImage(logoPDF.data, 'PNG', W / 2 - w / 2, y, w, h);
      y += h + 9;
    }
    doc.setFont('helvetica', 'normal').setFontSize(17).setTextColor(...ESCURO);
    doc.text('Ficha de Anamnese', W / 2, y, { align: 'center' }); y += 6;
    doc.setFontSize(9).setTextColor(...CINZA);
    doc.text(limpar(`Viva Mais Bella - preenchida em ${dataHora()}`), W / 2, y, { align: 'center' }); y += 9;

    montarDadosResumo().forEach(sec => {
      if (sec.destaque) {
        const linhas = sec.rows.flatMap(([q, a]) => doc.splitTextToSize(limpar(a ? `${q}: ${a}` : q), CW - 10));
        const h = 12 + linhas.length * 4.6;
        garantir(h);
        doc.setFillColor(...ROSA_CLARO).setDrawColor(...ROSA).setLineWidth(0.4);
        doc.roundedRect(M, y, CW, h, 2, 2, 'FD');
        doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...ROSA);
        doc.text('ATENÇÃO', M + 5, y + 6.5);
        doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(...ESCURO);
        doc.text(linhas, M + 5, y + 12);
        y += h + 7;
        return;
      }
      garantir(14);
      doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...ROSA);
      doc.text(limpar(sec.title).toUpperCase(), M, y);
      doc.setDrawColor(...BORDA).setLineWidth(0.3).line(M, y + 1.8, W - M, y + 1.8);
      y += 6.5;
      doc.setFontSize(9);
      sec.rows.forEach(([q, a]) => {
        const ql = doc.splitTextToSize(limpar(q), 66);
        const al = doc.splitTextToSize(limpar(a), CW - 70);
        const h = Math.max(ql.length, al.length) * 4 + 1.6;
        garantir(h);
        doc.setFont('helvetica', 'normal').setTextColor(...CINZA).text(ql, M, y);
        doc.setFont('helvetica', 'bold').setTextColor(...ESCURO).text(al, M + 70, y);
        y += h;
      });
      y += 4;
    });

    // Termo completo e assinatura
    const termo = limpar(document.querySelector('.consent > span').textContent.replace('*', ''));
    const tl = doc.splitTextToSize(termo, CW);
    garantir(tl.length * 4 + 24);
    doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...CINZA).text(tl, M, y);
    y += tl.length * 4 + 10;
    doc.setDrawColor(...ESCURO).setLineWidth(0.3).line(M, y, M + 90, y);
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...ESCURO).text(limpar(getVal('assinatura')), M, y - 2);
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...CINZA)
      .text(limpar(`Assinatura digital (nome digitado) - ${dataHora()}`), M, y + 4);

    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...CINZA);
      doc.text(`Viva Mais Bella - Ficha de Anamnese - página ${i} de ${total}`, W / 2, H - 8, { align: 'center' });
    }
    return doc;
  }

  async function enviarPDF() {
    const btn = document.getElementById('btnPdf');
    const label = btn.querySelector('span');
    btn.disabled = true; label.textContent = 'Gerando PDF...';
    try {
      await prepararPDF();
      const doc = gerarPDF();
      const nome = (getVal('nome') === '—' ? 'cliente' : getVal('nome')).replace(/[^\p{L}\p{N} ]/gu, '').trim();
      const arquivo = `Anamnese - ${nome} - ${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      const blob = doc.output('blob');
      const file = new File([blob], arquivo, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Ficha de Anamnese', text: 'Ficha de anamnese - Viva Mais Bella' });
          return;
        } catch (e) {
          if (e.name === 'AbortError') return;
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = arquivo;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      showToast('PDF baixado. Anexe no WhatsApp da clínica.');
    } catch (e) {
      showToast('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      btn.disabled = false; label.textContent = 'Enviar ficha em PDF';
    }
  }

  /* ─── INIT ─── */
  const formCard = document.getElementById('formCard');

  formCard.addEventListener('change', e => {
    const el = e.target;
    if (el.type === 'radio' && el.dataset.cond) toggleConditional(el.dataset.cond, el);
    if (el.name === 'servico') atualizarCardsServico();
    const field = el.closest('.field.em-branco');
    if (field) field.classList.remove('em-branco');
    salvarRascunho();
  });
  formCard.addEventListener('input', salvarRascunho);

  renderServicos();
  fixPills(formCard);
  montarTelas();
  restaurarRascunho();
