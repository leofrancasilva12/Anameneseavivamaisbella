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

  // Junta as perguntas de uma seção de todos os serviços escolhidos, sem repetir ids
  function perguntasDaSecao(secao, base = []) {
    const vistos = new Set();
    const lista = [];
    [...base, ...servicosEscolhidos().flatMap(s => s[secao])].forEach(q => {
      if (vistos.has(q.id)) return;
      vistos.add(q.id);
      lista.push(q);
    });
    return lista;
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
        const dph = q.detalhePlaceholder ? ` placeholder="${escapeHtml(q.detalhePlaceholder)}"` : '';
        const detalhe = q.detalheTipo === 'numero'
          ? `<input type="number" id="${q.id}Detalhe"${dph} />`
          : `<textarea id="${q.id}Detalhe"${dph}></textarea>`;
        return `<div class="field">${label}
          <div class="pills">
            <label class="pill"><input type="radio" name="${q.id}" id="${q.id}_sim" value="Sim" data-cond="${cond}" /><label>Sim</label></label>
            <label class="pill"><input type="radio" name="${q.id}" id="${q.id}_nao" value="Não" data-cond="${cond}" /><label>Não</label></label>
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

  // Monta as seções 3, 4 e 5 de acordo com os serviços escolhidos
  function montarEtapas() {
    const escolhidos = servicosEscolhidos();

    document.getElementById('objetivoServicos').innerHTML = escolhidos
      .filter(s => s.objetivo.length)
      .map(s => `
        <div class="servico-bloco">
          <div class="servico-bloco-title">${s.nome}</div>
          <div class="fields">${s.objetivo.map(renderPergunta).join('')}</div>
        </div>
      `).join('');

    document.getElementById('saudePerguntas').innerHTML =
      perguntasDaSecao('saude', SAUDE_COMUM).map(renderPergunta).join('');

    document.getElementById('contraPerguntas').innerHTML =
      perguntasDaSecao('contraindicacoes').map(renderPergunta).join('');

    document.getElementById('produtosField').style.display = mostrarProdutos() ? '' : 'none';
    document.getElementById('headerServicos').textContent = escolhidos.map(s => s.nome).join(' · ');

    fixPills(document.getElementById('formCard'));
  }

  /* ─── NAVIGATION ─── */
  const sections = ['Serviços', 'Dados Pessoais', 'Objetivo do Atendimento', 'Saúde', 'Contraindicações'];
  const totalSteps = sections.length;
  let current = 1;

  function mostrarEtapa(n) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    current = n;
    document.getElementById('step' + n).classList.add('active');
    updateProgress(n);
    scrollTop();
    salvarRascunho();
  }

  function goTo(n) {
    if (n > current && !validate(current)) return;
    if (current === 1 && n > 1) {
      guardarRespostas();
      montarEtapas();
      aplicarRespostas(respostas);
    }
    mostrarEtapa(n);
  }

  function goToConfirm() {
    if (!validate(totalSteps)) return;
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('stepConfirm').classList.add('active');
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('sectionName').textContent = 'Confirmação';
    document.getElementById('stepCount').textContent = '✓';
    buildSummary();
    scrollTop();
  }

  function updateProgress(n) {
    document.getElementById('progressFill').style.width = (n / totalSteps * 100) + '%';
    document.getElementById('sectionName').textContent = sections[n - 1];
    document.getElementById('stepCount').textContent = n + ' de ' + totalSteps;
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ─── VALIDATION ─── */
  function validate(step) {
    if (step === 1) {
      if (!servicosEscolhidos().length) { showToast('Escolha pelo menos um serviço.'); return false; }
    }
    if (step === 2) {
      const nome = document.getElementById('nome').value.trim();
      const idade = document.getElementById('idade').value.trim();
      const tel = document.getElementById('telefone').value.trim();
      if (!nome) { showToast('Por favor, informe seu nome completo.'); return false; }
      if (!idade) { showToast('Por favor, informe sua idade.'); return false; }
      if (!tel) { showToast('Por favor, informe seu telefone/WhatsApp.'); return false; }
    }
    if (step === 3) {
      const obj = document.getElementById('objetivo').value.trim();
      if (!obj) { showToast('Por favor, descreva seu objetivo.'); return false; }
    }
    if (step === 5) {
      if (!document.getElementById('consentimento').checked) {
        showToast('Para continuar, aceite o termo de consentimento.');
        return false;
      }
    }
    return true;
  }

  /* ─── CONDITIONAL FIELDS ─── */
  function toggleConditional(id, radioEl) {
    const el = document.getElementById(id);
    if (!el) return;
    if (radioEl && radioEl.value === 'Sim') {
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
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ respostas, etapa: current }));
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

    const etapa = servicosEscolhidos().length ? Math.min(Math.max(salvo.etapa || 1, 1), totalSteps) : 1;
    if (etapa > 1) mostrarEtapa(etapa);
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
        return [[q.resumo, v], ...(v === 'Sim' ? [[q.detalheResumo, getVal(q.id + 'Detalhe')]] : [])];
      }
      default:
        return [[q.resumo, getVal(q.id)]];
    }
  }

  function montarDadosResumo() {
    const escolhidos = servicosEscolhidos();
    const peso = getVal('peso');
    const altura = getVal('altura');
    const imc = document.getElementById('imcValue').textContent;
    const imcClass = document.getElementById('imcClass').textContent;

    return [
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
        title: 'Objetivo do Atendimento', icon: '🎯',
        rows: [['Objetivo', getVal('objetivo')]]
      },
      ...escolhidos.filter(s => s.objetivo.length).map(s => ({
        title: s.nome, icon: '✨',
        rows: s.objetivo.flatMap(linhasDaPergunta)
      })),
      {
        title: 'Saúde', icon: '🏥',
        rows: [
          ...perguntasDaSecao('saude', SAUDE_COMUM).flatMap(linhasDaPergunta),
          ...(mostrarProdutos() ? [['Interesse em produtos', getRadio('interesseProdutos')]] : []),
        ]
      },
      {
        title: 'Contraindicações', icon: '⚠️',
        rows: perguntasDaSecao('contraindicacoes').flatMap(linhasDaPergunta)
      },
      {
        title: 'Termo de Consentimento', icon: '✍️',
        rows: [
          ['Declaração de veracidade', document.getElementById('consentimento').checked ? 'Aceito' : 'Não aceito'],
          ['Data', new Date().toLocaleDateString('pt-BR')],
        ]
      }
    ].filter(section => section.rows.length);
  }

  function buildSummary() {
    const container = document.getElementById('summaryContent');
    container.innerHTML = montarDadosResumo().map(section => `
      <div class="summary-section">
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
    const lines = ['🌸 *Anamnese — Viva Mais Bela*'];
    montarDadosResumo().forEach(section => {
      lines.push('', `*${section.icon} ${section.title}*`);
      section.rows.forEach(([q, a]) => lines.push(`${q}: ${a}`));
    });
    lines.push('', '_Enviado via Anamnese Digital Viva Mais Bela_');

    // ← Troque pelo número do WhatsApp do spa (somente dígitos, com DDI)
    const phone = '5571991158054';
    const msg = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    limparRascunho();
  }

  /* ─── INIT ─── */
  const formCard = document.getElementById('formCard');

  formCard.addEventListener('change', e => {
    const el = e.target;
    if (el.type === 'radio' && el.dataset.cond) toggleConditional(el.dataset.cond, el);
    if (el.name === 'servico') atualizarCardsServico();
    salvarRascunho();
  });
  formCard.addEventListener('input', salvarRascunho);

  renderServicos();
  fixPills(formCard);
  restaurarRascunho();
