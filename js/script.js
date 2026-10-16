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
    const nota = q.nota ? `<p class="pergunta-nota">${q.nota}</p>` : '';
    const label = `<label>${q.texto}${req}</label>${nota}`;
    const ph = q.placeholder ? ` placeholder="${escapeHtml(q.placeholder)}"` : '';

    switch (q.tipo) {
      case 'texto':
        return `<div class="field">${label}<input type="text" id="${q.id}"${ph} /></div>`;
      case 'lista': {
        const itens = Array.from({ length: q.itens || 3 }, (_, i) => i + 1);
        return `<div class="field">${label}<div class="lista-campos">${itens.map(n =>
          `<input type="text" id="${q.id}_${n}" placeholder="${n}." aria-label="${escapeHtml(q.resumo)} ${n}" />`).join('')}</div></div>`;
      }
      case 'texto-longo':
        return `<div class="field">${label}<textarea id="${q.id}"${ph}></textarea></div>`;
      case 'numero':
        return `<div class="field">${label}<input type="number" id="${q.id}"${ph} /></div>`;
      case 'escolha':
        return `<div class="field">${label}${renderPills(q, 'radio')}</div>`;
      case 'multipla': {
        const outro = q.outro
          ? `<input type="text" id="${q.id}Outro" class="campo-outro" placeholder="${escapeHtml(q.outro)}" aria-label="${escapeHtml(q.outro)}" />`
          : '';
        return `<div class="field">${label}${renderPills(q, 'checkbox')}${outro}</div>`;
      }
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
    if (q.semAtalho) return null;
    if (q.tipo === 'multipla') return q.opcoes.includes('Nenhuma') ? 'Nenhuma' : null;
    if (q.tipo !== 'escolha' && q.tipo !== 'sim-qual') return null;
    return (q.opcoes || ['Sim', 'Não']).find(o => /^Não/.test(o)) || null;
  }

  // "Nenhuma" desmarca as outras opções, e qualquer outra desmarca "Nenhuma"
  function exclusividadeNenhuma(el) {
    if (el.type !== 'checkbox' || el.name === 'servico') return;
    const grupo = document.querySelectorAll(`input[type="checkbox"][name="${el.name}"]`);
    if (![...grupo].some(c => c.value === 'Nenhuma')) return;
    grupo.forEach(c => {
      if (el.value === 'Nenhuma' ? c !== el : c.value === 'Nenhuma') {
        if (el.checked) c.checked = false;
      }
    });
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
      const nenhuma = field.querySelector(':scope > .pills input[type="checkbox"][value="Nenhuma"]');
      if (nenhuma) {
        nenhuma.checked = true;
        exclusividadeNenhuma(nenhuma);
        field.classList.remove('em-branco');
        return;
      }
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

    // Perguntas do serviço: as que têm "tema" ficam agrupadas sob um subtítulo, no máximo 3 por tela
    document.getElementById('perguntasServicos').innerHTML = blocosDosServicos().map(b => {
      let ini = 1;
      return paginasPorTema(b.perguntas).map(pg => {
        const html = renderPagina(
          pg.perguntas, b.servico.nome, ini, b.perguntas.length,
          `<div class="servico-bloco-title">${b.servico.nome}</div>` +
          (pg.tema ? `<div class="tema-title tema-servico">${pg.tema}</div>` : '')
        );
        ini += pg.perguntas.length;
        return html;
      }).join('');
    }).join('');

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
    if (q.tipo === 'multipla' && q.outro && getVal(q.id + 'Outro') !== '—') return false;
    if (q.tipo === 'escolha' || q.tipo === 'sim-qual' || q.tipo === 'multipla') {
      return !document.querySelector(`input[name="${q.id}"]:checked`);
    }
    if (q.tipo === 'lista') return valoresDaLista(q) === '—';
    return getVal(q.id) === '—';
  }

  function elementoDaPergunta(q) {
    return document.querySelector(`input[name="${q.id}"]`) || document.getElementById(q.id) || document.getElementById(q.id + '_1');
  }

  // Itens preenchidos de uma pergunta do tipo "lista", separados por ponto e vírgula
  function valoresDaLista(q) {
    const itens = Array.from({ length: q.itens || 3 }, (_, i) => getVal(`${q.id}_${i + 1}`)).filter(v => v !== '—');
    return itens.length ? itens.join('; ') : '—';
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
      const nasc = lerNascimento();
      const tel = document.getElementById('telefone').value.trim();
      if (!nome) { showToast('Por favor, informe seu nome completo.'); return false; }
      if (!nasc) { showToast('Informe sua data de nascimento (DD/MM/AAAA).'); return false; }
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
      case 'multipla': {
        const outro = q.outro ? getVal(q.id + 'Outro') : '—';
        return [[q.resumo, getCheckboxes(q.id)], ...(outro !== '—' ? [[q.resumo + ' (outro)', outro]] : [])];
      }
      case 'lista':
        return [[q.resumo, valoresDaLista(q)]];
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
      if (q.tipo === 'multipla') {
        const marcados = [...document.querySelectorAll(`input[name="${q.id}"]:checked`)].map(e => e.value).filter(v => v !== 'Nenhuma');
        return marcados.length ? [[q.resumo, marcados.join(', ')]] : [];
      }
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
          ['Data de nascimento', textoNascimento()],
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

  /* ─── BANCO DE DADOS (Supabase) ───
     Quando a cliente toca em "Gerar PDF e enviar", a ficha é gravada no banco da clínica.
     A chave abaixo é a chave PÚBLICA: ela só permite depositar a ficha, nunca ler dados.
     Se a gravação falhar (internet ruim, por exemplo), o PDF e o WhatsApp seguem normalmente. */
  const SUPABASE_URL = 'https://swavuilayxhrfaswlqtg.supabase.co';
  const SUPABASE_CHAVE_PUBLICA = 'sb_publishable_piYI-qmlscPYc-hjeQJ44Q_dKHI5LTc';
  let ultimaFichaGravada = '';

  function montarFichaParaBanco() {
    guardarRespostas();
    const nasc = lerNascimento();
    return {
      p_nome: getVal('nome') === '—' ? '' : getVal('nome'),
      p_telefone: getVal('telefone') === '—' ? '' : getVal('telefone'),
      p_data_nascimento: nasc ? nasc.iso : null,
      p_servicos: servicosEscolhidos().map(s => s.nome),
      p_respostas: respostas,
      p_resumo: montarDadosResumo().map(s => ({ titulo: s.title, destaque: !!s.destaque, linhas: s.rows })),
      p_pontos_atencao: pontosDeAtencao().map(([pergunta, resposta]) => ({ pergunta, resposta })),
      p_consentimento: document.getElementById('consentimento').checked,
      p_assinatura: getVal('assinatura') === '—' ? '' : getVal('assinatura'),
    };
  }

  // Grava a ficha e devolve o código para escolher o horário da primeira sessão
  const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3YXZ1aWxheXhocmZhc3dscXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0OTcyOTIsImV4cCI6MjEwNzA3MzI5Mn0.Jai6jPHC86vH52dAfr0iz0fVPPJT6kMvV-u9WFXEozA';
  let fichaGravada = null;   // { id, codigo }
  async function rpc(nome, corpo) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SUPABASE_CHAVE_PUBLICA }, body: JSON.stringify(corpo) });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw Object.assign(new Error((j && j.message) || 'erro'), { codigo: j && j.message });
    return j;
  }
  function avisarRauana(corpo) {
    fetch(`${SUPABASE_URL}/functions/v1/avisos`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: ANON_JWT, Authorization: 'Bearer ' + ANON_JWT }, body: JSON.stringify(corpo), keepalive: true }).catch(() => {});
  }
  async function gravarFichaNoBanco() {
    const corpo = JSON.stringify(montarFichaParaBanco());
    if (fichaGravada && corpo === ultimaFichaGravada) return fichaGravada;   // mesma ficha: não grava duas vezes
    const r = await rpc('registrar_anamnese', JSON.parse(corpo));
    ultimaFichaGravada = corpo;
    fichaGravada = r;
    avisarRauana({ acao: 'ficha', id: r.id });
    return r;
  }

  async function enviarFicha() {
    const btn = document.getElementById('btnEnviar'), label = btn.querySelector('span');
    btn.disabled = true; label.textContent = 'Enviando...';
    try {
      await gravarFichaNoBanco();
      limparRascunho();
      abrirPacote();
    } catch (e) {
      console.warn('Ficha não gravada:', e);
      showToast('Não foi possível enviar agora. Verifique sua internet e tente de novo.');
    } finally {
      btn.disabled = false; label.textContent = 'Enviar ficha';
    }
  }

  /* ─── DATA DE NASCIMENTO ─── */
  function mascaraData(el) {
    const d = el.value.replace(/\D/g, '').slice(0, 8);
    el.value = d.length > 4 ? `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}` : d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
    const n = lerNascimento();
    document.getElementById('idadeCalc').textContent = n ? `${n.idade} anos` : (d.length === 8 ? 'Confira a data.' : '');
  }
  function lerNascimento() {
    const m = (document.getElementById('nascimento').value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const [dd, mm, aa] = [+m[1], +m[2], +m[3]], dt = new Date(aa, mm - 1, dd);
    if (dt.getFullYear() !== aa || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) return null;
    const hoje = new Date();
    let idade = hoje.getFullYear() - aa; if (hoje.getMonth() < mm - 1 || (hoje.getMonth() === mm - 1 && hoje.getDate() < dd)) idade--;
    if (idade < 1 || idade > 120) return null;
    return { iso: `${aa}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`, idade };
  }
  function textoNascimento() { const n = lerNascimento(); return n ? `${getVal('nascimento')} (${n.idade} anos)` : '—'; }

  /* ─── ESCOLHER HORÁRIO DA PRIMEIRA SESSÃO ─── */
  const AG = { ano: 0, mes: 0, dia: '', hora: '', livres: {}, carregando: false, enviando: false };
  const pad2 = n => String(n).padStart(2, '0');
  const chaveDia = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const horaDe = t => { const d = new Date(t); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); };
  const livresMes = (a, m) => AG.livres[`${a}-${pad2(m + 1)}`] || [];
  const horasDia = dia => livresMes(+dia.slice(0, 4), +dia.slice(5, 7) - 1).filter(t => chaveDia(new Date(t)) === dia).map(horaDe);
  const dataLonga = dia => { const t = new Date(dia + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace('-feira', ''); return t.charAt(0).toUpperCase() + t.slice(1); };
  const SETA_E = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
  const SETA_D = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

  async function carregarLivres(a, m) {
    const k = `${a}-${pad2(m + 1)}`;
    if (AG.livres[k]) return;
    try {
      const lista = await rpc('horarios_ficha', { p_codigo: fichaGravada.codigo, p_de: new Date(a, m, 1).toISOString(), p_ate: new Date(a, m + 1, 1).toISOString() });
      AG.livres[k] = (lista || []).map(x => new Date(x).getTime());
    } catch (e) { AG.livres[k] = []; }
  }
  function mostrarStep(id) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    scrollTop();
  }
  async function abrirAgenda() {
    mostrarStep('stepAgendar');
    document.getElementById('sectionName').textContent = 'Primeira sessão';
    const hoje = new Date(); AG.ano = hoje.getFullYear(); AG.mes = hoje.getMonth(); AG.dia = ''; AG.hora = ''; AG.livres = {};
    AG.carregando = true; desenharAgenda();
    await carregarLivres(AG.ano, AG.mes);
    if (!livresMes(AG.ano, AG.mes).length) { const d = new Date(AG.ano, AG.mes + 1, 1); await carregarLivres(d.getFullYear(), d.getMonth()); if (livresMes(d.getFullYear(), d.getMonth()).length) { AG.ano = d.getFullYear(); AG.mes = d.getMonth(); } }
    AG.carregando = false; desenharAgenda();
  }
  function desenharAgenda() {
    const { ano, mes } = AG, hoje = chaveDia(new Date());
    const ini0 = new Date(ano, mes, 1).getDay(), nDias = new Date(ano, mes + 1, 0).getDate();
    const nomeMes = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const agora = new Date(), limite = new Date(Date.now() + 60 * 864e5);
    const podeVoltar = ano > agora.getFullYear() || (ano === agora.getFullYear() && mes > agora.getMonth());
    const podeIr = new Date(ano, mes + 1, 1) <= limite;
    let dias = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => `<span class="sem">${x}</span>`).join('') + '<span></span>'.repeat(ini0);
    for (let d = 1; d <= nDias; d++) {
      const k = `${ano}-${pad2(mes + 1)}-${pad2(d)}`, ok = !AG.carregando && horasDia(k).length > 0;
      dias += `<button type="button" class="${k === AG.dia ? 'on' : ''}${k === hoje ? ' hoje' : ''}" onclick="agDia('${k}')" ${ok ? '' : 'disabled'} aria-label="${d} de ${nomeMes}${ok ? '' : ', indisponível'}">${d}</button>`;
    }
    const tem = livresMes(ano, mes).length > 0;
    const corpo = AG.carregando ? '<p class="ag-vazio">Vendo os horários livres...</p>'
      : AG.dia ? `<p class="ag-tit">Horários livres · ${escapeHtml(dataLonga(AG.dia))}</p><div class="ag-horas">${horasDia(AG.dia).map(h => `<button type="button" class="${h === AG.hora ? 'on' : ''}" onclick="agHora('${h}')">${h}</button>`).join('')}</div>`
      : `<p class="ag-vazio">${tem ? 'Os dias em destaque têm horário livre. Toque em um deles.' : `Sem horários livres ${podeIr ? 'neste mês. Veja o próximo' : 'por enquanto. A Rauana vai combinar com você'}.`}</p>`;
    document.getElementById('agenda').innerHTML = `<div class="ag-mes"><button type="button" class="ag-seta" onclick="agMes(-1)" ${podeVoltar ? '' : 'disabled'} aria-label="Mês anterior">${SETA_E}</button><b>${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</b><button type="button" class="ag-seta" onclick="agMes(1)" ${podeIr ? '' : 'disabled'} aria-label="Próximo mês">${SETA_D}</button></div>
      <div class="ag-grade">${dias}</div>${corpo}${AG.dia && AG.hora ? `<div class="ag-escolha">${escapeHtml(dataLonga(AG.dia))} às <b>${AG.hora}</b></div>` : ''}`;
    const b = document.getElementById('btnPedir'); b.disabled = !(AG.dia && AG.hora) || AG.enviando; b.querySelector('span').textContent = AG.enviando ? 'Enviando...' : 'Enviar pedido';
  }
  function agDia(k) { AG.dia = k; AG.hora = ''; desenharAgenda(); }
  function agHora(h) { AG.hora = h; desenharAgenda(); }
  async function agMes(n) { const d = new Date(AG.ano, AG.mes + n, 1); AG.ano = d.getFullYear(); AG.mes = d.getMonth(); AG.dia = ''; AG.hora = ''; AG.carregando = true; desenharAgenda(); await carregarLivres(AG.ano, AG.mes); AG.carregando = false; desenharAgenda(); }
  const ERROS_AG = {
    ocupado: 'Esse horário acabou de ser ocupado. Escolha outro, por favor.',
    indisponivel: 'Esse horário não está mais disponível. Escolha outro, por favor.',
    muito_cedo: 'Escolha um horário com pelo menos 2 horas de antecedência.',
    muito_longe: 'Escolha uma data dentro dos próximos 60 dias.',
    ficha_expirada: 'O tempo para escolher pela ficha acabou. A Rauana vai combinar com você pelo WhatsApp.',
    limite: 'Você já fez vários pedidos hoje. A Rauana vai combinar com você pelo WhatsApp.',
  };
  async function pedirHorario() {
    if (!(AG.dia && AG.hora) || AG.enviando) return;
    AG.enviando = true; desenharAgenda();
    const quando = new Date(AG.dia + 'T' + AG.hora + ':00');
    try {
      const r = await rpc('pedir_horario_ficha', { p_codigo: fichaGravada.codigo, p_data_hora: quando.toISOString() });
      avisarRauana({ acao: 'pedido', id: r.id });
      finalizar(true);
    } catch (e) {
      const k = AG.dia.slice(0, 7);
      if (e.codigo === 'ocupado' || e.codigo === 'indisponivel') { delete AG.livres[k]; await carregarLivres(AG.ano, AG.mes); AG.hora = ''; if (!horasDia(AG.dia).length) AG.dia = ''; }
      showToast(ERROS_AG[e.codigo] || 'Não foi possível enviar agora. Tente de novo.');
      if (e.codigo === 'ficha_expirada' || e.codigo === 'limite') finalizar(false);
    } finally { AG.enviando = false; if (document.getElementById('stepAgendar').classList.contains('active')) desenharAgenda(); }
  }
  function combinarDepois() { finalizar(false); }

  /* ─── QUANTAS SESSÕES (logo depois de enviar a ficha) ───
     Preços vêm da aba Procedimentos do app. O banco recalcula tudo ao salvar. */
  const PC = { itens: [], escolha: null, salvando: false };
  const reais = n => 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalItem = it => !it.sel || it.valor == null ? null : it.sel === 10 ? (it.valor10 != null ? it.valor10 : it.valor * 10) : it.valor * it.sel;
  async function abrirPacote() {
    mostrarStep('stepPacote');
    document.getElementById('sectionName').textContent = 'Sessões';
    const servs = servicosEscolhidos().map(x => x.nome);
    PC.itens = servs.map(nome => ({ nome, valor: null, valor10: null, sel: null }));
    PC.escolha = null;
    document.getElementById('pacote').innerHTML = '<p class="ag-vazio">Carregando os valores...</p>';
    try {
      const precos = await rpc('precos_ficha', {});
      PC.itens.forEach(it => {
        const pr = (precos || []).find(x => x.nome.trim().toLowerCase() === it.nome.trim().toLowerCase());
        if (pr) { it.nome = pr.nome; it.valor = pr.valor != null ? Number(pr.valor) : null; it.valor10 = pr.valor_plano10 != null ? Number(pr.valor_plano10) : null; }
      });
    } catch (e) { /* sem internet: mostra sem valores */ }
    if (!PC.itens.length) return abrirAgenda();
    desenharPacote();
  }
  function desenharPacote() {
    const html = PC.itens.map((it, i) => {
      const cheio = it.valor != null ? it.valor * 10 : null, plano = it.valor10 != null ? it.valor10 : cheio;
      const economia = cheio != null && it.valor10 != null && it.valor10 < cheio ? cheio - it.valor10 : 0;
      const qtd = [1, 2, 3, 4, 5].map(n => `<button type="button" class="${it.sel === n ? 'on' : ''}" onclick="pcEscolher(${i},${n})" aria-pressed="${it.sel === n}">${n}<small>${n === 1 ? 'sessão' : 'sessões'}</small></button>`).join('');
      const t = totalItem(it);
      return `<div class="pc-serv"><div class="pc-cab"><b>${escapeHtml(it.nome)}</b><span>${it.valor != null ? reais(it.valor) + ' por sessão' : 'valor a combinar'}</span></div>
        <div class="pc-tit">Quantas sessões?</div><div class="pc-qtd">${qtd}</div>
        <div class="pc-ou">OU</div>
        <button type="button" class="pc-plano${it.sel === 10 ? ' on' : ''}" onclick="pcEscolher(${i},10)" aria-pressed="${it.sel === 10}"><span class="selo">${economia ? 'ECONOMIZE ' + reais(economia).replace(',00', '') : 'MAIS RESULTADO'}</span><span class="n">10<small>SESSÕES</small></span>
          <span style="flex:1"><b>Plano de tratamento</b><span>10 sessões${plano != null ? ' · ' + (economia ? `<s>${reais(cheio)}</s> ` : '') + `<b style="display:inline;font-size:13px;white-space:nowrap">${reais(plano)}</b>` : ''}</span></span></button>
        ${it.sel ? `<div class="pc-preco"><span>${it.sel === 10 ? 'Plano de 10 sessões' : `${it.sel} ${it.sel === 1 ? 'sessão' : 'sessões'}${it.valor != null ? ' × ' + reais(it.valor) : ''}`}</span><b>${t != null ? reais(t) : 'a combinar'}</b></div>` : ''}</div>`;
    }).join('');
    const escolhidos = PC.itens.filter(it => it.sel), todos = escolhidos.length === PC.itens.length;
    const total = escolhidos.reduce((a, it) => a + (totalItem(it) || 0), 0), ns = escolhidos.reduce((a, it) => a + it.sel, 0);
    const semValor = escolhidos.some(it => it.valor == null);
    document.getElementById('pacote').innerHTML = html + (escolhidos.length ? `<div class="pc-total"><div><small>TOTAL · ${ns} ${ns === 1 ? 'SESSÃO' : 'SESSÕES'}</small><b>${reais(total)}${semValor ? '<i> + a combinar</i>' : ''}</b></div><span>valor de<br>referência</span></div>
      <p class="pc-nota">Os valores são de referência. A Rauana confirma tudo com você pelo WhatsApp.</p>` : '');
    const b = document.getElementById('btnPacote');
    b.disabled = !todos || PC.salvando;
    b.querySelector('span').textContent = PC.salvando ? 'Salvando...' : todos ? 'Escolher horário' : (PC.itens.length > 1 ? 'Escolha em cada serviço' : 'Escolha as sessões');
  }
  function pcEscolher(i, n) { PC.itens[i].sel = PC.itens[i].sel === n ? null : n; desenharPacote(); }
  async function confirmarPacote() {
    if (PC.salvando || PC.itens.some(it => !it.sel)) return;
    PC.salvando = true; desenharPacote();
    try {
      PC.escolha = await rpc('escolher_pacote_ficha', { p_codigo: fichaGravada.codigo, p_pacote: PC.itens.map(it => ({ servico: it.nome, sessoes: it.sel })) });
    } catch (e) {
      PC.escolha = null;
      if (e.codigo === 'ficha_expirada') { PC.salvando = false; showToast(ERROS_AG.ficha_expirada); return finalizar(false); }
      showToast('Não foi possível salvar sua escolha agora. Você pode combinar com a Rauana.');
    } finally { PC.salvando = false; }
    abrirAgenda();
  }
  function pularPacote() { PC.escolha = null; abrirAgenda(); }
  function textoPacote() {
    if (!PC.escolha || !PC.escolha.length) return '';
    return PC.escolha.map(x => `${x.plano ? 'Plano de 10 sessões' : x.sessoes + (x.sessoes === 1 ? ' sessão' : ' sessões')} de ${escapeHtml(x.servico)}${x.total != null ? ' · ' + reais(x.total) : ''}`).join('<br>');
  }
  function finalizar(comPedido) {
    const nome = primeiroNome();
    document.getElementById('fimTitulo').textContent = nome ? `Obrigada, ${nome}!` : 'Obrigada!';
    document.getElementById('fimTexto').textContent = (comPedido
      ? 'Sua ficha e seu pedido de horário chegaram para a Rauana. Ela vai confirmar o horário pelo WhatsApp.'
      : 'Sua ficha chegou para a Rauana. Ela vai falar com você pelo WhatsApp para combinar o melhor horário.')
      + ' Obrigada pela confiança em cuidar de você com a Viva Mais Bella. Será um prazer te receber!';
    const box = document.getElementById('fimPedido'), pac = textoPacote();
    box.hidden = !comPedido && !pac;
    box.innerHTML = (comPedido ? `<small>SEU PEDIDO</small><b>${escapeHtml(dataLonga(AG.dia))} às ${AG.hora}</b>` : '')
      + (pac ? `<small${comPedido ? ' style="margin-top:10px"' : ''}>SUAS SESSÕES</small><span class="fim-pac">${pac}</span>` : '');
    document.getElementById('sectionName').textContent = 'Concluído';
    document.querySelector('.progress-wrap').classList.add('concluido');
    mostrarStep('stepFim');
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

  // Foto do topo recortada em círculo, com o mesmo enquadramento da página
  function carregarLogo() {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const T = 320, borda = 8;
        const c = document.createElement('canvas');
        c.width = c.height = T;
        const ctx = c.getContext('2d');
        const lado = Math.min(img.width, img.height);
        const sx = (img.width - lado) / 2;
        const sy = (img.height - lado) * 0.12;
        ctx.save();
        ctx.beginPath(); ctx.arc(T / 2, T / 2, T / 2 - borda, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(img, sx, sy, lado, lado, borda, borda, T - 2 * borda, T - 2 * borda);
        ctx.restore();
        ctx.beginPath(); ctx.arc(T / 2, T / 2, T / 2 - borda / 2, 0, Math.PI * 2);
        ctx.lineWidth = borda; ctx.strokeStyle = '#E6D6C4'; ctx.stroke();
        resolve({ data: c.toDataURL('image/png'), proporcao: 1 });
      };
      img.onerror = () => resolve(null);
      img.src = 'img/foto.jpg';
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
    // Cores da marca (paleta Linho): ROSA = destaque cacau, ROSA_CLARO = fundo do bloco de atenção
    const ROSA = [107, 74, 53], ROSA_CLARO = [241, 226, 207], BORDA = [226, 216, 204], CINZA = [122, 101, 86], ESCURO = [59, 38, 22];
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

  // Baixa uma cópia da ficha em PDF (opcional; a ficha já vai direto para a Rauana)
  async function baixarPDF() {
    const btns = document.querySelectorAll('.btn-pdf');
    btns.forEach(b => { b.disabled = true; b.querySelector('span').textContent = 'Gerando PDF...'; });
    try {
      await prepararPDF();
      const doc = gerarPDF();
      const nome = (getVal('nome') === '—' ? 'cliente' : getVal('nome')).replace(/[^\p{L}\p{N} ]/gu, '').trim();
      const arquivo = `Anamnese - ${nome} - ${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      const url = URL.createObjectURL(doc.output('blob'));
      const a = document.createElement('a');
      a.href = url; a.download = arquivo;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      showToast('PDF baixado.');
    } catch (e) {
      showToast('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      btns.forEach(b => { b.disabled = false; b.querySelector('span').textContent = 'Baixar PDF da ficha'; });
    }
  }

  /* ─── INIT ─── */
  const formCard = document.getElementById('formCard');

  formCard.addEventListener('change', e => {
    const el = e.target;
    if (el.type === 'radio' && el.dataset.cond) toggleConditional(el.dataset.cond, el);
    if (el.name === 'servico') atualizarCardsServico();
    exclusividadeNenhuma(el);
    const field = el.closest('.field.em-branco');
    if (field) field.classList.remove('em-branco');
    salvarRascunho();
  });
  formCard.addEventListener('input', salvarRascunho);

  renderServicos();
  fixPills(formCard);
  montarTelas();
  restaurarRascunho();
