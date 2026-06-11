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
      result.style.display = 'none';
    }
  }

  /* ─── PILL FIX: nested label workaround ─── */
  document.querySelectorAll('.pill').forEach(pill => {
    const input = pill.querySelector('input');
    const innerLabel = pill.querySelector('label');
    if (!innerLabel || !input) return;
    innerLabel.setAttribute('for', input.id || (input.id = 'i_' + Math.random().toString(36).slice(2)));
    pill.addEventListener('click', e => {
      if (e.target === pill) input.click();
    });
  });

  /* ─── NAVIGATION ─── */
  const sections = ['Dados Pessoais','Objetivo do Atendimento','Saúde Básica','Contraindicações'];
  let current = 1;

  function goTo(n) {
    if (n > current && !validate(current)) return;
    document.getElementById('step' + current).classList.remove('active');
    current = n;
    document.getElementById('step' + current).classList.add('active');
    updateProgress(n);
    scrollTop();
  }

  function goToConfirm() {
    if (!validate(4)) return;
    document.getElementById('step4').classList.remove('active');
    document.getElementById('stepConfirm').classList.add('active');
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('sectionName').textContent = 'Confirmação';
    document.getElementById('stepCount').textContent = '✓';
    buildSummary();
    scrollTop();
  }

  function updateProgress(n) {
    document.getElementById('progressFill').style.width = (n / 4 * 100) + '%';
    document.getElementById('sectionName').textContent = sections[n - 1];
    document.getElementById('stepCount').textContent = n + ' de 4';
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ─── VALIDATION ─── */
  function validate(step) {
    if (step === 1) {
      const nome = document.getElementById('nome').value.trim();
      const idade = document.getElementById('idade').value.trim();
      const tel = document.getElementById('telefone').value.trim();
      if (!nome) { showToast('Por favor, informe seu nome completo.'); return false; }
      if (!idade) { showToast('Por favor, informe sua idade.'); return false; }
      if (!tel) { showToast('Por favor, informe seu telefone/WhatsApp.'); return false; }
    }
    if (step === 2) {
      const obj = document.getElementById('objetivo').value.trim();
      if (!obj) { showToast('Por favor, descreva seu objetivo.'); return false; }
    }
    return true;
  }

  /* ─── CONDITIONAL FIELDS ─── */
  function toggleConditional(id, radioEl) {
    const el = document.getElementById(id);
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

  /* ─── HELPERS ─── */
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

  /* ─── BUILD SUMMARY ─── */
  function buildSummary() {
    const temProblema = getRadio('temProblema');
    const temMed = getRadio('temMed');
    const cirurgia = getRadio('cirurgia');
    const peso = getVal('peso');
    const altura = getVal('altura');
    const imc = document.getElementById('imcValue').textContent;
    const imcClass = document.getElementById('imcClass').textContent;

    const data = [
      {
        title: 'Dados Pessoais',
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
        title: 'Objetivo do Atendimento',
        rows: [
          ['Objetivo', getVal('objetivo')],
          ['Regiões de inchaço', getCheckboxes('regiao')],
          ['Já fez drenagem antes', getRadio('fezentem')],
        ]
      },
      {
        title: 'Saúde Básica',
        rows: [
          ['Problema de saúde', temProblema],
          ...(temProblema === 'Sim' ? [['Qual problema', getVal('qualProblema')]] : []),
          ['Uso de medicamento', temMed],
          ...(temMed === 'Sim' ? [['Qual medicamento', getVal('qualMed')]] : []),
          ['Alergia a cosméticos', getRadio('temAlergia')],
          ...(getRadio('temAlergia') === 'Sim' ? [['Qual alergia', getVal('qualAlergia')]] : []),
          ['Gestante', getRadio('gravida')],
          ...(getRadio('gravida') === 'Sim' ? [['Meses de gestação', getVal('mesesGestacao')]] : []),
          ['Frequência urinária', getRadio('freqUrinaria')],
          ['Consumo de água', getRadio('consumoAgua')],
          ['Interesse em produtos', getRadio('interesseProdutos')],
        ]
      },
      {
        title: 'Contraindicações',
        rows: [
          ['Febre / infecção / trombose', getRadio('contraind')],
          ['Cirurgia recente', cirurgia],
          ...(cirurgia === 'Sim' ? [['Qual cirurgia e quando', getVal('qualCirurgia')]] : []),
        ]
      }
    ];

    const container = document.getElementById('summaryContent');
    container.innerHTML = data.map(section => `
      <div class="summary-section">
        <div class="summary-section-title">${section.title}</div>
        ${section.rows.map(([q, a]) => `
          <div class="summary-row">
            <span class="summary-q">${q}</span>
            <span class="summary-a">${a}</span>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  /* ─── WHATSAPP ─── */
  function sendWhatsApp() {
    const temProblema = getRadio('temProblema');
    const temMed = getRadio('temMed');
    const cirurgia = getRadio('cirurgia');
    const peso = getVal('peso');
    const altura = getVal('altura');
    const imc = document.getElementById('imcValue').textContent;
    const imcClass = document.getElementById('imcClass').textContent;

    const lines = [
      '🌸 *Anamnese — Viva Mais Bela*',
      '',
      '*📋 Dados Pessoais*',
      `Nome: ${getVal('nome')}`,
      `Idade: ${getVal('idade')}`,
      `Telefone: ${getVal('telefone')}`,
      ...(peso !== '—' ? [`Peso: ${peso} kg`] : []),
      ...(altura !== '—' ? [`Altura: ${altura} cm`] : []),
      ...(imc ? [`IMC: ${imc}${imcClass ? ' — ' + imcClass : ''}`] : []),
      '',
      '*🎯 Objetivo do Atendimento*',
      `Objetivo: ${getVal('objetivo')}`,
      `Regiões: ${getCheckboxes('regiao')}`,
      `Já fez drenagem: ${getRadio('fezentem')}`,
      '',
      '*🏥 Saúde Básica*',
      `Problema de saúde: ${temProblema}`,
      ...(temProblema === 'Sim' ? [`Qual: ${getVal('qualProblema')}`] : []),
      `Medicamento contínuo: ${temMed}`,
      ...(temMed === 'Sim' ? [`Qual: ${getVal('qualMed')}`] : []),
      `Alergia a cosméticos: ${getRadio('temAlergia')}`,
      ...(getRadio('temAlergia') === 'Sim' ? [`Qual: ${getVal('qualAlergia')}`] : []),
      `Gestante: ${getRadio('gravida')}`,
      ...(getRadio('gravida') === 'Sim' ? [`Meses de gestação: ${getVal('mesesGestacao')}`] : []),
      `Frequência urinária: ${getRadio('freqUrinaria')}`,
      `Consumo de água: ${getRadio('consumoAgua')}`,
      `Interesse em produtos: ${getRadio('interesseProdutos')}`,
      '',
      '*⚠️ Contraindicações*',
      `Febre/infecção/trombose: ${getRadio('contraind')}`,
      `Cirurgia recente: ${cirurgia}`,
      ...(cirurgia === 'Sim' ? [`Qual e quando: ${getVal('qualCirurgia')}`] : []),
      '',
      '_Enviado via Anamnese Digital Viva Mais Bela_'
    ];

    // ← Troque pelo número do WhatsApp do spa (somente dígitos, com DDI)
    const phone = '5571991158054';
    const msg = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }
