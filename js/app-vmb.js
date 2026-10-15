// App Viva Mais Bella: lógica principal (carregada pelo index.html do app)
/* ═══ CONFIGURAÇÃO ═══ */
const SB_URL = 'https://swavuilayxhrfaswlqtg.supabase.co';
// Chave pública (anon): sozinha não lê nada, as regras do banco exigem login de alguém da equipe
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3YXZ1aWxheXhocmZhc3dscXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0OTcyOTIsImV4cCI6MjEwNzA3MzI5Mn0.Jai6jPHC86vH52dAfr0iz0fVPPJT6kMvV-u9WFXEozA';
const TERAPEUTA = 'Rauana Ferreira';
// Chave pública dos avisos no celular (Web Push). A chave secreta fica só no servidor.
const VAPID_PUBLICA = 'BI4O76RINypnTN4N80eZfgpOMHpmG0aQG3K4V7icBLHPz9w7vlQ_eCvDoBkr1wP4n2aTB-RSVgXNw2g-AUk7nkg';
const PROC_PADRAO = ['Drenagem linfática', 'Massagem modeladora', 'Limpeza de pele', 'Massagem relaxante', 'Liberação miofascial', 'Depilação'];

const sb = supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
const st = { user: null, membro: null, pacientes: [], planos: [], fichas: [], procs: [], pedidos: [], especiais: [], feriados: [], fotos: {}, avisos: '', ui: { busca: '', buscaProc: '', filtro: 'todas' }, recuperando: false };
const nomesProc = () => st.procs.length ? st.procs.map(p => p.nome) : PROC_PADRAO;

/* ═══ UTILIDADES ═══ */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ini = n => String(n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const primeiro = n => String(n || '').trim().split(/\s+/)[0];
const fData = iso => new Date(iso).toLocaleDateString('pt-BR');
const fCurta = iso => { const d = new Date(iso); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); };
const fHora = iso => { const d = new Date(iso); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const diaKey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const paraISO = (dia, hora) => new Date(dia + 'T' + (hora || '09:00')).toISOString();
const telDigitos = t => String(t || '').replace(/\D/g, '');
const tel55 = t => { const d = telDigitos(t); return d.length <= 11 ? '55' + d : d; };
const fTel = t => { const d = telDigitos(t); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d; };
const linkPaciente = pl => location.origin + '/paciente.html?c=' + pl.codigo_publico;
const waLink = (tel, msg) => 'https://wa.me/' + tel55(tel) + (msg ? '?text=' + encodeURIComponent(msg) : '');
const somaDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const lerValor = t => { const s = String(t || '').replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'); const n = s ? Number(s) : NaN; return Number.isFinite(n) ? n : null; };
const ic = {
  home: '<path d="M4 10.4 12 4l8 6.4V19a1.5 1.5 0 0 1-1.5 1.5H15.2v-5.3a1 1 0 0 0-1-1h-4.4a1 1 0 0 0-1 1v5.3H5.5A1.5 1.5 0 0 1 4 19z"/>',
  users: '<circle cx="9.3" cy="8.4" r="3.4"/><path d="M3.3 19.6c.6-3.4 3-5.4 6-5.4s5.4 2 6 5.4"/><path d="M15.6 5.2a3.2 3.2 0 0 1 0 6.3"/><path d="M17.6 14.7c1.7.7 2.8 2.4 3.1 4.9"/>',
  cal: '<rect x="3.6" y="5.2" width="16.8" height="15.2" rx="3"/><path d="M3.6 10h16.8M8.2 3.4v3.4M15.8 3.4v3.4"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.2h.01M12 17.2h.01" stroke-width="2.2"/>',
  cog: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>', back: '<path d="M15 6l-6 6 6 6"/>', chev: '<path d="M9 6l6 6-6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  wa: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  renew: '<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19 4v4h-4"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  tag: '<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-6.6 6.6a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8" cy="8" r="1.5"/>',
  user: '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="10" r="3"/><path d="M6.6 18.5c1.2-2.2 3.1-3.4 5.4-3.4s4.2 1.2 5.4 3.4"/>',
  lotus: '<path d="M12 20.2c-2.7-1.6-4.3-4.4-4.3-7.5 0-2.9 1.5-5.7 4.3-8.2 2.8 2.5 4.3 5.3 4.3 8.2 0 3.1-1.6 5.9-4.3 7.5z"/><path d="M12 20.2c-4.6.4-8.4-2.1-9.5-6.9 1.9-.8 3.9-.9 5.7-.4"/><path d="M12 20.2c4.6.4 8.4-2.1 9.5-6.9-1.9-.8-3.9-.9-5.7-.4"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  alert: '<path d="M12 4.5 21 19.5H3z"/><path d="M12 10v4.2M12 16.9h.01"/>',
  undo: '<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9.5a5 5 0 0 1 0 10H11"/>',
  copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
  clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.5V12l3 2"/>',
  cam: '<path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  img: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8.5 8.5"/>',
};
const I = (n, sw) => `<svg class="i" viewBox="0 0 24 24"${sw ? ` style="stroke-width:${sw}"` : ''}>${ic[n]}</svg>`;

const fDur = m => { m = Number(m) || 60; const h = Math.floor(m / 60), r = m % 60; return h ? `${h}h${r ? pad(r) : ''}` : `${r} min`; };
const durNome = n => { const p = procPorNome(n); return p && p.duracao_min ? p.duracao_min : 60; };
const idadeDe = p => { if (!p) return null; if (p.data_nascimento) { const n = new Date(p.data_nascimento + 'T12:00'), h = new Date(); let i = h.getFullYear() - n.getFullYear(); if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) i--; return i; } return p.idade || null; };
const nascBR = iso => iso ? iso.split('-').reverse().join('/') : '';
const lerNasc = t => { const m = String(t || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/); if (!m) return null; const d = new Date(+m[3], +m[2] - 1, +m[1]); if (d.getDate() !== +m[1] || d.getMonth() !== +m[2] - 1 || d > new Date() || +m[3] < 1900) return null; return `${m[3]}-${m[2]}-${m[1]}`; };
const mascaraNasc = el => { const d = el.value.replace(/\D/g, '').slice(0, 8); el.value = d.length > 4 ? `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}` : d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };
const moeda = n => 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const urlFoto = f => (f && st.fotos[f]) || '';
const av = (nome, foto, cls, estilo) => { const u = urlFoto(foto); return `<div class="av ${cls || ''}"${estilo ? ` style="${estilo}"` : ''}>${u ? `<img src="${esc(u)}" alt="">` : esc(ini(nome))}</div>`; };
const procPorNome = n => st.procs.find(p => p.nome.toLowerCase() === String(n || '').trim().toLowerCase());
const valorSug = (nome, qtd) => { const p = procPorNome(nome); return p && p.valor ? Number(p.valor * qtd).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''; };
function sugerirValor(form) {
  if (!form || form.dataset.valorManual === '1' || !form.elements.valor || !form.elements.qtd) return;
  form.elements.valor.value = valorSug(form.elements.procedimento.value, parseInt(form.elements.qtd.value, 10) || 1);
}
function chipsProc(atual) {
  const nomes = nomesProc(), tem = nomes.some(n => n.toLowerCase() === String(atual || '').toLowerCase());
  return `<div class="chips">${nomes.map(x => `<button type="button" class="chip ${x.toLowerCase() === String(atual || '').toLowerCase() ? 'on' : ''}" data-acao="proc" data-v="${esc(x)}">${esc(x)}</button>`).join('')}<button type="button" class="chip ${tem ? '' : 'on'}" data-acao="proc" data-v="">Outro</button></div>`;
}

// Campo "data e horário": mostra o valor e abre o calendário do app (guarda em dia/hora escondidos)
const txtDH = (dia, hora) => { if (!dia) return ''; const t = new Date(dia + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }); return t.charAt(0).toUpperCase() + t.slice(1) + ' · ' + (hora || '09:00'); };
function campoDH(dia, hora, semData, vazio) {
  return `<div class="campo-wrap" data-sem="${semData ? 1 : ''}" data-vazio="${esc(vazio || 'Escolher data e horário')}"><button type="button" class="inp campo-dh" data-acao="pk-abrir">${I('cal')}<span class="${dia ? '' : 'vazio'}">${dia ? txtDH(dia, hora) : esc(vazio || 'Escolher data e horário')}</span></button><input type="hidden" name="dia" value="${dia || ''}"><input type="hidden" name="hora" value="${hora || '09:00'}"></div>`;
}
let PK = null;
function abrirPicker(campo) {
  const dia = campo.querySelector('[name="dia"]').value, hora = campo.querySelector('[name="hora"]').value || '09:00';
  const base = dia ? new Date(dia + 'T12:00') : new Date();
  PK = { campo, dia, hora, ano: base.getFullYear(), mes: base.getMonth(), semData: campo.dataset.sem === '1' };
  desenharPicker(true);
}
function desenharPicker(rolarHora) {
  const { ano, mes } = PK, hoje = diaKey(new Date());
  const ini0 = new Date(ano, mes, 1).getDay(), nDias = new Date(ano, mes + 1, 0).getDate();
  const nomeMes = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  let dias = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => `<span class="sem">${x}</span>`).join('') + '<span></span>'.repeat(ini0);
  for (let d = 1; d <= nDias; d++) {
    const k = `${ano}-${pad(mes + 1)}-${pad(d)}`;
    dias += `<button type="button" class="${k === PK.dia ? 'on' : ''}${k === hoje ? ' hoje' : ''}${k < hoje ? ' passou' : ''}" data-acao="pk-dia" data-v="${k}" aria-label="${d} de ${nomeMes}">${d}</button>`;
  }
  const horas = []; for (let m = 6 * 60; m <= 21 * 60; m += 30) horas.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60));
  if (!horas.includes(PK.hora)) { horas.push(PK.hora); horas.sort(); }
  const tit = PK.dia ? (t => t.charAt(0).toUpperCase() + t.slice(1))(new Date(PK.dia + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })).replace('-feira', '') : 'Escolha o dia';
  const rolagem = $('#pk-horas') ? $('#pk-horas').scrollLeft : 0;
  let caixa = $('#picker'); if (!caixa) { caixa = document.createElement('div'); caixa.id = 'picker'; document.body.appendChild(caixa); }
  caixa.innerHTML = `<div class="pk-bg" data-acao="pk-fundo"><div class="sheet" role="dialog" aria-modal="true" aria-label="Escolher data e horário"><div class="grip"></div>
    <div class="between" style="align-items:flex-start"><div><span class="tag">Data e horário</span><h2 class="s" style="font-size:24px;margin-top:2px">${tit}</h2>${PK.dia ? `<span class="ink2" style="font-size:14px">às ${PK.hora}</span>` : ''}</div><button type="button" class="icon-btn plain" data-acao="pk-fechar" aria-label="Fechar">${I('x')}</button></div>
    <div class="pk-mes"><button type="button" class="icon-btn" data-acao="pk-mes" data-v="-1" aria-label="Mês anterior">${I('back')}</button><b>${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</b><button type="button" class="icon-btn" data-acao="pk-mes" data-v="1" aria-label="Próximo mês">${I('chev')}</button></div>
    <div class="pk-grade">${dias}</div>
    <div class="stack" style="gap:8px"><span class="tag" style="display:flex;align-items:center;gap:6px">${I('clock').replace('class="i"', 'class="i" style="width:16px;height:16px"')} Horário</span><div class="pk-horas" id="pk-horas">${horas.map(h => `<button type="button" class="chip ${h === PK.hora ? 'on' : ''}" data-acao="pk-hora" data-v="${h}">${h}</button>`).join('')}</div></div>
    <button type="button" class="btn" data-acao="pk-ok">${I('check', 2)} Confirmar</button>
    ${PK.semData ? '<button type="button" class="btn ghost" data-acao="pk-limpar">Deixar sem data</button>' : ''}</div></div>`;
  const faixa = $('#pk-horas');
  if (rolarHora) { const on = faixa.querySelector('.on'); if (on) faixa.scrollLeft = on.offsetLeft - faixa.clientWidth / 2 + on.offsetWidth / 2; }
  else faixa.scrollLeft = rolagem;
}
function fecharPicker() { const c = $('#picker'); if (c) c.innerHTML = ''; PK = null; }
function aplicarPicker(dia) {
  const c = PK.campo, sp = c.querySelector('.campo-dh span');
  c.querySelector('[name="dia"]').value = dia; c.querySelector('[name="hora"]').value = PK.hora;
  sp.textContent = dia ? txtDH(dia, PK.hora) : c.dataset.vazio; sp.className = dia ? '' : 'vazio';
  fecharPicker();
}

const dataLonga = iso => { const t = new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace('-feira', ''); return t.charAt(0).toUpperCase() + t.slice(1); };
/* ═══ PEDIDOS DE HORÁRIO (feitos pela cliente na página dela) ═══ */
function cartaoPedido(ped) {
  const pl = ped.plano_id ? st.planos.find(x => x.id === ped.plano_id) : null; if (ped.plano_id && !pl) return '';
  const p = paciente(pl ? pl.paciente_id : ped.paciente_id); if (!p) return '';
  const s = pl && info(pl).proxima, t = new Date(ped.data_hora).getTime();
  const choque = st.planos.filter(x => x.status === 'ativo' && (!pl || x.id !== pl.id)).flatMap(x => x.sessoes.filter(z => z.status === 'agendada' && z.data_hora && Math.abs(new Date(z.data_hora).getTime() - t) < 3600e3).map(z => ({ x, z })))[0];
  return `<div class="card stack pedido-card">
    <div class="row">${av(p.nome, p.foto)}<div style="flex:1;min-width:0"><b style="font-weight:500">${esc(p.nome)}</b><div class="ink2" style="font-size:13px">${esc(pl ? pl.procedimento : ped.procedimento || 'Primeira sessão')}${s ? ` · ${s.numero}ª sessão` : pl ? '' : ' · 1ª sessão'}</div></div><span class="badge b-warn">${pl ? 'PEDIDO' : 'NOVA'}</span></div>
    <div class="pedido-quando">${I('cal')}<div><b>${dataLonga(ped.data_hora)}</b><span>às ${fHora(ped.data_hora)}</span></div></div>
    ${choque ? `<div class="alerta" style="padding:8px 12px;font-size:13px">Já tem sessão de ${esc(primeiro(paciente(choque.x.paciente_id).nome))} às ${fHora(choque.z.data_hora)} nesse dia.</div>` : ''}
    <div class="row" style="gap:8px"><button class="btn sm" style="flex:1" data-acao="pedido-confirmar" data-id="${ped.id}">${I('check', 2)} Confirmar</button><button class="btn sm ghost" style="flex:1" data-acao="pedido-mudar" data-id="${ped.id}">Mudar data</button></div></div>`;
}
function avisoCliente(pl, numero, dataHora, original) {
  const p = paciente(pl.paciente_id), quando = `${dataLonga(dataHora).toLowerCase()} às ${fHora(dataHora)}`;
  const msg = original
    ? `Olá, ${primeiro(p.nome)}! O horário que você pediu (${dataLonga(original).toLowerCase()} às ${fHora(original)}) não estava disponível, então marquei a sua ${numero}ª sessão de ${pl.procedimento.toLowerCase()} para ${quando}. Se não puder, me avise por aqui. ${TERAPEUTA}, Viva Mais Bella.\n\nAcompanhe seu tratamento: ${linkPaciente(pl)}`
    : `Olá, ${primeiro(p.nome)}! Sua ${numero}ª sessão de ${pl.procedimento.toLowerCase()} está confirmada para ${quando}. Te espero! ${TERAPEUTA}, Viva Mais Bella.\n\nAcompanhe seu tratamento: ${linkPaciente(pl)}`;
  render();
  abrirSheet(`<div style="display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:10px 0">
      <span class="dot d-ok" style="width:56px;height:56px;border-radius:28px">${I('check', 2.4)}</span>
      <h2 class="s" style="font-size:27px">${original ? 'Data alterada' : 'Horário confirmado'}</h2>
      <p class="ink2" style="font-size:14px">${esc(primeiro(p.nome))} · ${numero}ª sessão · ${esc(dataLonga(dataHora))} às ${fHora(dataHora)}</p></div>
    <a class="btn" href="${waLink(p.telefone, msg)}" target="_blank" rel="noopener" data-acao="fechar">${I('wa')} Avisar ${esc(primeiro(p.nome))} no WhatsApp</a>
    <button class="btn ghost" data-acao="fechar">Fechar</button>`);
}
/* ═══ AVISOS NO CELULAR (Web Push) ═══ */
const pushSuportado = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const bytesB64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
async function estadoAvisos() {
  try {
    if (!pushSuportado()) return 'sem-suporte';
    if (Notification.permission === 'denied') return 'bloqueado';
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg && await reg.pushManager.getSubscription();
    return sub && Notification.permission === 'granted' ? 'ativo' : 'inativo';
  } catch (e) { return 'sem-suporte'; }
}
async function gravarInscricao(sub) {
  const j = sub.toJSON();
  const { error } = await sb.rpc('registrar_push', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth });
  if (error) throw error;
}
async function ativarAvisos() {
  if (!pushSuportado()) return toast('Este celular não aceita avisos neste navegador.');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') { st.avisos = await estadoAvisos(); render(); return toast('Sem permissão. Libere as notificações nas configurações do celular.'); }
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytesB64u(VAPID_PUBLICA) });
    await gravarInscricao(sub);
    st.avisos = 'ativo'; render(); toast('Avisos ativados neste celular.');
    sb.functions.invoke('avisos', { body: { acao: 'teste' } }).catch(() => {});
  } catch (e) { console.error(e); toast('Não foi possível ativar os avisos. Tente de novo.'); }
}
async function desativarAvisos() {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg && await reg.pushManager.getSubscription();
    if (sub) { await sb.rpc('remover_push', { p_endpoint: sub.endpoint }); await sub.unsubscribe(); }
  } catch (e) { console.error(e); }
  st.avisos = await estadoAvisos(); render(); toast('Avisos desativados neste celular.');
}
function blocoAvisos() {
  const a = st.avisos;
  const txt = {
    ativo: 'Ativos neste celular. Quando uma cliente pedir horário, chega um aviso aqui, mesmo com o app fechado.',
    inativo: 'Receba um aviso no celular, igual ao do WhatsApp, quando uma cliente pedir horário pela página dela.',
    bloqueado: 'As notificações estão bloqueadas para este app. Libere em Configurações do celular, Notificações, e volte aqui.',
    'sem-suporte': 'Este celular ainda não aceita avisos por aqui. No iPhone, instale o app na Tela de Início (veja abaixo) e abra por ele.',
  }[a] || '';
  return `<section class="card stack"><div class="tag">Avisos de pedidos</div><p class="ink2" style="font-size:14px;line-height:1.55">${txt}</p>
    ${a === 'inativo' ? `<button class="btn sm" style="width:100%" data-acao="avisos-ativar">${I('bell')} Ativar avisos neste celular</button>` : ''}
    ${a === 'ativo' ? `<div class="row" style="gap:8px"><button class="btn sm ghost" style="flex:1" data-acao="avisos-testar">Enviar aviso de teste</button><button class="btn sm ghost" style="flex:1" data-acao="avisos-desativar">Desativar</button></div>` : ''}</section>`;
}

/* ═══ JANELA DE CONFIRMAÇÃO (no lugar das caixas do sistema) ═══ */
function confirmar({ titulo, texto, ok = 'Confirmar', cancelar = 'Voltar', perigo = false, icone, trava } = {}) {
  return new Promise(resolve => {
    const ant = $('#dialogo'); if (ant) ant.remove();
    const el = document.createElement('div'); el.id = 'dialogo';
    const ic = icone || (perigo ? 'trash' : 'check');
    el.innerHTML = `<div class="dlg-bg"><div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-x">
      <span class="dlg-ic ${perigo ? 'perigo' : ''}">${I(ic, 1.9)}</span>
      <h2 class="s" id="dlg-t">${esc(titulo || 'Confirmar')}</h2>
      ${texto ? `<p class="ink2" id="dlg-x">${texto}</p>` : ''}
      ${trava ? `<label class="dlg-trava"><input type="checkbox" id="dlg-trava"><span>${esc(trava)}</span></label>` : ''}
      <div class="dlg-bts"><button type="button" class="btn ghost" data-r="0">${esc(cancelar)}</button><button type="button" class="btn ${perigo ? 'perigo' : ''}" data-r="1" ${trava ? 'disabled' : ''}>${esc(ok)}</button></div></div></div>`;
    document.body.appendChild(el);
    const fim = v => { document.removeEventListener('keydown', tecla); el.classList.add('sai'); setTimeout(() => el.remove(), 180); resolve(v); };
    const tecla = e => { if (e.key === 'Escape') fim(false); };
    document.addEventListener('keydown', tecla);
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (e.target.classList.contains('dlg-bg')) return fim(false);
      const b = e.target.closest('[data-r]'); if (b && !b.disabled) fim(b.dataset.r === '1');
    });
    const tv = el.querySelector('#dlg-trava'); if (tv) tv.addEventListener('change', () => { el.querySelector('[data-r="1"]').disabled = !tv.checked; });
    setTimeout(() => { const b = el.querySelector(perigo ? '[data-r="0"]' : '[data-r="1"]'); if (b) b.focus(); }, 50);
  });
}
const negrito = t => `<b style="color:var(--ink);font-weight:600">${esc(t)}</b>`;

function toast(msg) {
  const t = $('#toast'); t.innerHTML = `<div class="toast">${esc(msg)}</div>`;
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.innerHTML = ''; }, 3000);
}
function abrirSheet(html) { $('#sheet').innerHTML = `<div class="sheet-bg" data-acao="fechar-fundo"><div class="sheet" role="dialog" aria-modal="true"><div class="grip"></div>${html}</div></div>`; }
function fecharSheet() { $('#sheet').innerHTML = ''; }

/* ═══ DADOS ═══ */
async function carregar() {
  const [p, pl, f, pr, pd, de, fe] = await Promise.all([
    sb.from('pacientes').select('id,nome,telefone,idade,data_nascimento,endereco,foto,criado_em').order('nome'),
    sb.from('planos').select('id,paciente_id,procedimento,total_sessoes,valor,status,codigo_publico,criado_em,sessoes(id,numero,data_hora,status,observacao,concluida_em)').order('criado_em', { ascending: false }),
    sb.from('anamneses').select('id,paciente_id,servicos,pontos_atencao,enviada_em').order('enviada_em', { ascending: false }),
    sb.from('procedimentos').select('id,nome,valor,duracao_min').order('nome'),
    sb.from('pedidos_horario').select('id,plano_id,paciente_id,procedimento,data_hora,criado_em').eq('status', 'pendente').order('data_hora'),
    sb.from('dias_especiais').select('dia,horas').gte('dia', diaKey(new Date())),
    sb.from('feriados').select('dia,nome').gte('dia', diaKey(new Date())).order('dia'),
  ]);
  for (const r of [p, pl, f]) if (r.error) throw r.error;
  st.pacientes = p.data; st.planos = pl.data; st.fichas = f.data;
  st.planos.forEach(x => x.sessoes.sort((a, b) => a.numero - b.numero));
  st.procs = pr.error ? [] : pr.data;
  st.pedidos = pd.error ? [] : pd.data.filter(x => x.plano_id ? st.planos.some(pl => pl.id === x.plano_id && pl.status === 'ativo') : st.pacientes.some(p => p.id === x.paciente_id));
  st.especiais = de.error ? [] : de.data.map(x => ({ dia: x.dia, horas: (x.horas || []).map(h => h.slice(0, 5)) }));
  st.feriados = fe.error ? [] : fe.data;
  st.carregadoEm = Date.now();
  await carregarFotos();
}
// Fotos ficam numa pasta privada: o app pede links temporários só para a equipe logada
async function carregarFotos() {
  const faltam = [...new Set([...st.pacientes.map(p => p.foto), st.membro && st.membro.foto].filter(f => f && !st.fotos[f]))];
  if (!faltam.length) return;
  try {
    const { data } = await sb.storage.from('fotos').createSignedUrls(faltam, 60 * 60 * 24);
    (data || []).forEach(d => { if (d.signedUrl && d.path) st.fotos[d.path] = d.signedUrl; });
  } catch (e) { console.error(e); }
}
const paciente = id => st.pacientes.find(p => p.id === id);
const planosDe = id => st.planos.filter(p => p.paciente_id === id);
const ativoDe = id => st.planos.find(p => p.paciente_id === id && p.status === 'ativo');
const fichaDe = id => st.fichas.find(f => f.paciente_id === id);
function info(pl) {
  const feitas = pl.sessoes.filter(s => s.status === 'concluida').length;
  return { feitas, proxima: pl.sessoes.find(s => s.status !== 'concluida'), falta: pl.total_sessoes - feitas };
}
function situacao(pacId) {
  const a = ativoDe(pacId);
  if (a) return info(a).falta <= 1 ? 'fim' : 'ativas';
  return planosDe(pacId).length ? 'fin' : 'sem';
}

/* ═══ MENSAGEM DO WHATSAPP (modelo da Rauana) ═══ */
function mensagemPlano(pl) {
  const p = paciente(pl.paciente_id);
  const linhas = pl.sessoes.map(s => {
    if (s.status === 'concluida') return `\u2705 ${s.numero}ª Sessão: ${fData(s.data_hora || s.concluida_em)} (Concluída)`;
    if (s.data_hora) return `\u23F3 ${s.numero}ª Sessão: ${fData(s.data_hora)} às ${fHora(s.data_hora)}`;
    return `\u23F3 ${s.numero}ª Sessão: a agendar`;
  });
  return [
    '*Acompanhamento de Tratamento*', '',
    `*Terapeuta*: ${TERAPEUTA}`, '',
    `\u{1F464} *PACIENTE:* ${p ? p.nome : ''}`, '',
    `\u{1F486}\u200D\u2640\uFE0F Plano: ${pl.total_sessoes} Sessões de (${pl.procedimento})`, '',
    '\u{1F5D3}\uFE0F CRONOGRAMA DE SESSÕES', '',
    ...linhas, '',
    `Acompanhe seu tratamento: ${linkPaciente(pl)}`,
  ].join('\n');
}

/* ═══ ROTAS ═══ */
function rota() { return (location.hash || '#/inicio').slice(2).split('/'); }
function ir(h) { if (location.hash === h) render(); else location.hash = h; }
window.addEventListener('hashchange', () => { fecharPicker(); fecharSheet(); if (st.prefill && rota()[0] !== 'novo-plano') st.prefill = null; render(); });

function render() {
  const app = $('#app');
  if (st.recuperando) { document.body.className = 'sem-nav'; app.innerHTML = vNovaSenha(); return; }
  if (!st.user || !st.membro) { document.body.className = 'sem-nav'; app.innerHTML = vLogin(); document.dispatchEvent(new Event('vmb-pronto')); return; }
  const [r, id] = rota();
  const telas = { inicio: vInicio, pacientes: vPacientes, paciente: vPaciente, plano: vPlano, 'novo-plano': vNovoPlano, anamnese: vAnamnese, agenda: vAgenda, horarios: vHorarios, procedimentos: vProcedimentos, usuario: vUsuario, ajustes: vUsuario };
  const fn = telas[r] || vInicio, cheia = r === 'novo-plano' || r === 'anamnese';
  document.body.className = cheia ? 'sem-nav' : '';
  app.innerHTML = fn(id) + (cheia ? '' : nav(r));
  // só anima quando muda de tela (não quando a mesma tela só se atualiza)
  const tela = location.hash || '#/inicio';
  if (st.telaAtual !== tela) { st.telaAtual = tela; if (app.firstElementChild) app.firstElementChild.classList.add('entra'); window.scrollTo(0, 0); }
  if (r === 'pacientes') listarPacientes();
  if (r === 'procedimentos') listarProcs();
  const fa = document.querySelector('form[data-form="anamnese"]'); if (fa && st.anam) aplicarResp(fa, st.anam.r);
  document.dispatchEvent(new Event('vmb-pronto'));
}
function nav(r) {
  const on = { inicio: 'inicio', pacientes: 'pacientes', paciente: 'pacientes', plano: 'pacientes', agenda: 'agenda', horarios: 'agenda', procedimentos: 'procedimentos', usuario: 'usuario', ajustes: 'usuario' }[r] || 'inicio';
  const a = (k, h, n, t, c) => `<a href="#/${h}" class="${on === k ? 'on' : ''}"${on === k ? ' aria-current="page"' : ''}><span class="ic">${I(n)}${c ? `<i class="nbadge" aria-label="${c} pedidos">${c}</i>` : ''}</span>${t}</a>`;
  return `<nav class="tab" aria-label="Navegação principal">${a('inicio', 'inicio', 'home', 'Início', st.pedidos.length)}${a('pacientes', 'pacientes', 'users', 'Pacientes')}${a('procedimentos', 'procedimentos', 'lotus', 'Procedimentos')}${a('agenda', 'agenda', 'cal', 'Agenda')}${a('usuario', 'usuario', 'user', 'Usuário')}</nav>`;
}

/* ═══ TELAS ═══ */
function vLogin() {
  return `<div class="login">
    <img src="img/logo-vmb.png" alt="Viva Mais Bella — Saúde, Beleza, Bem-estar" style="width:250px;max-width:80%;align-self:center">
    <p class="serif" style="text-align:center;font-size:21px;font-style:italic;color:var(--link);margin-bottom:28px">Acompanhamento de tratamentos</p>
    <form data-form="login" class="stack" style="gap:14px">
      <label class="f">E-mail<input class="inp" type="email" name="email" autocomplete="username" required></label>
      <label class="f">Senha<input class="inp" type="password" name="senha" autocomplete="current-password" required></label>
      ${st.erroLogin ? `<div class="alerta">${esc(st.erroLogin)}</div>` : ''}
      <button class="btn" type="submit">Entrar</button>
      <button class="btn ghost" type="button" data-acao="esqueci" style="border:0;text-decoration:underline;min-height:44px">Esqueci minha senha</button>
    </form>
    <p class="tag" style="margin-top:auto;text-align:center;letter-spacing:.3em">Saúde · Beleza · Bem-estar</p>
  </div>`;
}

function vNovaSenha() {
  return `<div class="login"><img src="lotus.svg" alt="" width="56" style="align-self:center">
    <h1 class="t" style="text-align:center">Criar nova senha</h1>
    <form data-form="nova-senha" class="stack" style="gap:14px">
      <label class="f">Nova senha<input class="inp" type="password" name="s1" minlength="6" autocomplete="new-password" required></label>
      <label class="f">Repita a nova senha<input class="inp" type="password" name="s2" minlength="6" autocomplete="new-password" required></label>
      <button class="btn" type="submit">Salvar senha</button>
    </form></div>`;
}

function itemSessao(pl, s, extra) {
  const p = paciente(pl.paciente_id);
  return `<a class="item" href="#/plano/${pl.id}" ${extra || ''}>
    <div class="hora"><b>${s.data_hora ? fHora(s.data_hora) : '--:--'}</b><small>${s.data_hora ? fCurta(s.data_hora) : ''}</small></div>
    <div class="txt"><b>${esc(p ? p.nome : '')}</b><span>${esc(pl.procedimento)}</span><small>Sessão ${s.numero} de ${pl.total_sessoes}</small></div>
    ${s.status === 'concluida' ? '<span class="badge b-ok">FEITA</span>' : s.data_hora && diaKey(new Date(s.data_hora)) > diaKey(new Date()) ? '<span class="badge" style="background:var(--soft);color:var(--ink2)">AGENDADA</span>' : '<span class="badge b-warn">CONCLUIR</span>'}</a>`;
}

function vInicio() {
  const agora = new Date(), hoje = diaKey(agora), fimSemana = somaDias(agora, 7);
  const todas = st.planos.filter(p => p.status === 'ativo').flatMap(pl => pl.sessoes.map(s => ({ pl, s })));
  const deHoje = todas.filter(x => x.s.data_hora && diaKey(new Date(x.s.data_hora)) === hoje).sort((a, b) => a.s.data_hora.localeCompare(b.s.data_hora));
  const semana = todas.filter(x => x.s.data_hora && x.s.status === 'agendada' && new Date(x.s.data_hora) >= agora && new Date(x.s.data_hora) <= fimSemana).length;
  const renovar = st.planos.filter(p => p.status === 'ativo' && info(p).falta <= 1);
  const semPlano = st.pacientes.filter(p => !planosDe(p.id).length && fichaDe(p.id));
  const h = agora.getHours(), saud = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const dataTxt = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return `<div class="wrap">
    <header class="row" style="justify-content:space-between">
      <div class="row" style="gap:10px;min-width:0">${urlFoto(st.membro.foto) ? `<a href="#/usuario" aria-label="Seu perfil" style="text-decoration:none">${av(st.membro.nome, st.membro.foto, '', 'width:46px;height:46px')}</a>` : '<img src="lotus.svg" alt="" width="34">'}
        <div><div class="muted" style="font-size:13px">${esc(dataTxt.charAt(0).toUpperCase() + dataTxt.slice(1))}</div>
        <h1 class="t" style="font-size:28px;white-space:nowrap">${saud}, ${esc(primeiro(st.membro.nome))}</h1></div></div>
      <a class="icon-btn acc" href="#/novo-plano" aria-label="Novo plano">${I('plus', 2)}</a>
    </header>
    <div class="grid3">
      <div class="stat dark"><b>${deHoje.length}</b><span>${deHoje.length === 1 ? 'sessão hoje' : 'sessões hoje'}</span></div>
      <div class="stat"><b>${semana}</b><span>em 7 dias</span></div>
      <div class="stat soft"><b>${renovar.length}</b><span>para renovar</span></div>
    </div>
    ${st.pedidos.length ? `<section class="stack"><div class="between"><h2 class="s">Pedidos de horário</h2><span class="badge b-warn">${st.pedidos.length} ${st.pedidos.length === 1 ? 'NOVO' : 'NOVOS'}</span></div>${st.pedidos.map(cartaoPedido).join('')}</section>` : ''}
    ${st.avisos === 'inativo' && !st.ui.semConvite ? `<div class="card row" style="background:var(--soft);align-items:flex-start">${I('bell')}<div style="flex:1;display:flex;flex-direction:column;gap:8px"><span style="font-size:14px;line-height:1.5">Ative os avisos para saber na hora quando uma cliente pedir horário.</span><div class="row" style="gap:8px"><button class="btn sm" data-acao="avisos-ativar">Ativar avisos</button><button class="btn sm ghost" style="border:0" data-acao="avisos-depois">Agora não</button></div></div></div>` : ''}
    <section class="stack">
      <div class="between"><h2 class="s">Sessões de hoje</h2><a href="#/agenda" style="font-size:13px;text-decoration:none;padding:8px 0">Ver agenda</a></div>
      ${deHoje.length ? deHoje.map(x => itemSessao(x.pl, x.s)).join('') : '<div class="empty">Nenhuma sessão marcada para hoje.</div>'}
    </section>
    ${semPlano.length ? `<section class="stack"><h2 class="s">Fichas recebidas</h2>
      ${semPlano.map(p => { const f = fichaDe(p.id); const n = (f.pontos_atencao || []).length; return `<div class="card stack">
        <a class="row" href="#/paciente/${p.id}" style="text-decoration:none;color:inherit">${av(p.nome, p.foto)}
          <div style="flex:1;min-width:0"><b style="font-weight:500">${esc(p.nome)}</b><div class="ink2" style="font-size:13px">${esc((f.servicos || []).join(', '))} · ficha de ${fCurta(f.enviada_em)}</div></div>
          ${n ? `<span class="badge b-warn">${n} ATENÇÃO</span>` : ''}</a>
        <a class="btn sm" href="#/novo-plano/${p.id}" style="width:100%">Montar plano</a></div>`; }).join('')}</section>` : ''}
    <section class="stack"><h2 class="s">Hora de renovar</h2>
      ${renovar.length ? renovar.map(pl => { const p = paciente(pl.paciente_id); const i = info(pl);
        const msg = `Olá, ${primeiro(p.nome)}! Sua última sessão de ${pl.procedimento.toLowerCase()} está chegando. Que tal já garantir o seu próximo pacote para manter os resultados? Fico à disposição. ${TERAPEUTA}, Viva Mais Bella.`;
        return `<div class="card stack" style="background:var(--soft)">
          <a class="row" href="#/plano/${pl.id}" style="text-decoration:none;color:inherit">${av(p.nome, p.foto, '', 'background:var(--card)')}
          <div><b style="font-weight:500">${esc(p.nome)}</b><div class="ink2" style="font-size:13px">${esc(pl.procedimento)} · ${i.feitas} de ${pl.total_sessoes}${i.proxima && i.proxima.data_hora ? ' · última em ' + fCurta(i.proxima.data_hora) : ''}</div></div></a>
          <a class="btn sm" href="${waLink(p.telefone, msg)}" target="_blank" rel="noopener" style="width:100%">${I('renew')} Oferecer novo pacote</a></div>`; }).join('')
      : '<div class="empty">Nenhuma paciente na última sessão.</div>'}
    </section></div>`;
}

function vPacientes() {
  const f = st.ui.filtro;
  const chips = [['todas', 'Todas'], ['ativas', 'Ativas'], ['fim', 'Última sessão'], ['fin', 'Finalizadas'], ['sem', 'Sem plano']]
    .map(([k, t]) => `<button class="chip ${f === k ? 'on' : ''}" data-acao="filtro" data-v="${k}">${t}</button>`).join('');
  return `<div class="wrap">
    <div class="between"><h1 class="t">Pacientes</h1><span class="muted" style="font-size:13px">${st.pacientes.length} cadastradas</span></div>
    <label class="row card" style="padding:0 14px;border:1px solid var(--field);min-height:50px;color:var(--muted)">${I('search')}<input id="busca" class="inp" style="border:0;box-shadow:none;padding:0;background:transparent" type="search" placeholder="Buscar por nome ou telefone" aria-label="Buscar paciente" value="${esc(st.ui.busca)}"></label>
    <div class="chips" style="flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px">${chips}</div>
    <div id="lista" class="card" style="padding:0;overflow:hidden"></div>
    <div style="height:70px"></div></div>
    <button class="fab" data-acao="nova-paciente" aria-label="Nova paciente">${I('plus', 2)}</button>`;
}
function listarPacientes() {
  const q = st.ui.busca.trim().toLowerCase(), qd = telDigitos(q), f = st.ui.filtro;
  const lista = st.pacientes.filter(p => (!q || p.nome.toLowerCase().includes(q) || (qd && p.telefone.includes(qd))) && (f === 'todas' || situacao(p.id) === f));
  $('#lista').innerHTML = lista.length ? lista.map(p => {
    const a = ativoDe(p.id), s = situacao(p.id);
    let dir = '<span class="muted" style="font-size:13px">Sem plano</span>';
    if (a) { const i = info(a); dir = `<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><b style="font-size:13px">${i.feitas} de ${a.total_sessoes}</b><div class="bar"><i style="width:${Math.round(i.feitas / a.total_sessoes * 100)}%;${s === 'fim' ? 'background:var(--dot)' : ''}"></i></div></div>`; }
    else if (s === 'fin') dir = '<span class="badge b-ok">FINALIZADO</span>';
    return `<a class="item" href="#/paciente/${p.id}" style="border-radius:0;border-bottom:1px solid var(--divider)">${av(p.nome, p.foto)}
      <div class="txt"><b>${esc(p.nome)}</b><span>${esc(a ? a.procedimento : fTel(p.telefone))}</span></div>${dir}</a>`;
  }).join('') : '<div class="empty" style="margin:12px">Nenhuma paciente encontrada.</div>';
}

function vPaciente(id) {
  const p = paciente(id); if (!p) return `<div class="wrap"><div class="empty">Paciente não encontrada.</div></div>`;
  const f = fichaDe(id), pls = planosDe(id), antigas = st.fichas.filter(x => x.paciente_id === id).slice(1);
  return `<div class="wrap">
    <header class="row" style="justify-content:space-between"><a class="icon-btn plain" href="#/pacientes" aria-label="Voltar">${I('back')}</a><span style="font-weight:500">Paciente</span><button class="icon-btn plain" data-acao="editar-paciente" data-id="${id}" aria-label="Editar dados da paciente">${I('edit')}</button></header>
    <div class="row"><button class="av-btn" data-acao="foto" data-tipo="paciente" data-id="${p.id}" aria-label="Foto da paciente">${av(p.nome, p.foto, 'g')}<span class="cam">${I('cam')}</span></button><div style="min-width:0"><h1 class="t" style="font-size:28px">${esc(p.nome)}</h1>
      <div class="ink2" style="font-size:14px">${esc(fTel(p.telefone))}${idadeDe(p) ? ' · ' + idadeDe(p) + ' anos' : ''}${p.data_nascimento ? ' · nasc. ' + nascBR(p.data_nascimento) : ''}</div>
      ${p.endereco ? `<div class="muted" style="font-size:13px">${esc(p.endereco)}</div>` : ''}</div></div>
    <a class="btn soft" href="${waLink(p.telefone)}" target="_blank" rel="noopener">${I('wa')} Conversar no WhatsApp</a>
    <section class="card stack"><div class="tag">Ficha de anamnese</div>
      ${f ? `<div class="ink2" style="font-size:14px">${esc((f.servicos || []).join(', '))} · ${fData(f.enviada_em)}</div>
        ${(f.pontos_atencao || []).length ? `<div class="alerta"><b>ATENÇÃO</b>${f.pontos_atencao.map(x => `<span>${esc(x.pergunta)}: <strong>${esc(x.resposta)}</strong></span>`).join('')}</div>` : '<div class="b-ok badge" style="align-self:flex-start">Nenhum ponto de atenção</div>'}
        <div id="ficha-${f.id}"></div><button class="btn ghost sm" data-acao="ver-ficha" data-id="${f.id}" style="width:100%">${I('file')} Ver ficha completa</button>
        ${antigas.length ? `<div class="tag" style="margin-top:6px">Fichas anteriores</div>${antigas.map(x => `<div class="stack" style="gap:6px"><div class="between"><span class="ink2" style="font-size:14px">${fData(x.enviada_em)} · ${esc((x.servicos || []).join(', '))}</span><button class="btn ghost sm" data-acao="ver-ficha" data-id="${x.id}">Ver</button></div><div id="ficha-${x.id}"></div></div>`).join('')}` : ''}`
      : '<div class="empty">Ainda não tem ficha de anamnese.</div>'}
      <a class="btn sm" href="#/anamnese/${id}" style="width:100%">${I('file')} Fazer anamnese agora</a>
    </section>
    <section class="stack"><div class="between"><h2 class="s">Planos</h2></div>
      ${pls.length ? pls.map(pl => { const i = info(pl); return `<a class="item" href="#/plano/${pl.id}"><div class="txt"><b>${esc(pl.procedimento)}</b><span>${pl.status === 'ativo' ? `${i.feitas} de ${pl.total_sessoes} sessões` : pl.status === 'finalizado' ? 'Finalizado' : 'Cancelado'} · desde ${fCurta(pl.criado_em)}</span></div>
        ${pl.status === 'ativo' ? `<div class="bar"><i style="width:${Math.round(i.feitas / pl.total_sessoes * 100)}%"></i></div>` : ''}${I('chev')}</a>`; }).join('') : '<div class="empty">Nenhum plano ainda.</div>'}
      <a class="btn" href="#/novo-plano/${id}">${I('plus', 2)} Novo plano</a>
    </section></div>`;
}

function vPlano(id) {
  const pl = st.planos.find(x => x.id === id); if (!pl) return `<div class="wrap"><div class="empty">Plano não encontrado.</div></div>`;
  const p = paciente(pl.paciente_id), i = info(pl), C = 207.3, fr = i.feitas / pl.total_sessoes;
  const prox = pl.status === 'ativo' ? i.proxima : null;
  const linhas = pl.sessoes.map(s => {
    const ok = s.status === 'concluida', eh = prox && s.id === prox.id;
    const data = ok ? fData(s.data_hora || s.concluida_em) : s.data_hora ? `${fData(s.data_hora)} · ${fHora(s.data_hora)}` : 'A agendar';
    const obs = s.observacao ? `<small class="muted" style="font-size:12px">${esc(s.observacao)}</small>` : '';
    const acao = ok ? '<span style="font-size:12px;color:var(--oktext);font-weight:500">Concluída</span>'
      : pl.status !== 'ativo' ? '' : eh ? `<button class="btn sm" data-acao="concluir" data-id="${s.id}">Concluir</button>`
      : `<button class="btn sm ghost" data-acao="sessao" data-id="${s.id}">${s.data_hora ? 'Alterar' : 'Agendar'}</button>`;
    return `<div class="ses"><span class="dot ${ok ? 'd-ok' : eh ? 'd-next' : 'd-pend'}">${ok ? I('check', 2.4).replace('class="i"', 'class="i" style="width:16px;height:16px"') : s.numero}</span>
      <button data-acao="sessao" data-id="${s.id}" aria-label="Editar ${s.numero}ª sessão" style="flex:1;display:flex;flex-direction:column;gap:1px;border:0;background:transparent;text-align:left;padding:8px 0;cursor:pointer;min-width:0"><span style="font-size:15px;font-weight:${eh ? 600 : 500}">${s.numero}ª Sessão</span><span class="ink2" style="font-size:13px">${data}</span>${obs}</button>${acao}</div>`;
  }).join('');
  return `<div class="wrap">
    <header class="row" style="justify-content:space-between"><a class="icon-btn plain" href="#/paciente/${pl.paciente_id}" aria-label="Voltar">${I('back')}</a><span style="font-weight:500">Plano de tratamento</span>
      <button class="icon-btn plain" data-acao="menu-plano" data-id="${pl.id}" aria-label="Opções do plano"><svg class="i" viewBox="0 0 24 24" style="fill:currentColor;stroke:none"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></button></header>
    <a class="row" href="#/paciente/${p.id}" style="text-decoration:none;color:inherit">${av(p.nome, p.foto, 'g')}<div><h1 class="t" style="font-size:27px">${esc(p.nome)}</h1>
      ${fichaDe(p.id) ? `<span style="font-size:13px;color:var(--oktext)">Ficha de anamnese recebida</span>` : '<span class="muted" style="font-size:13px">Sem ficha de anamnese</span>'}</div></a>
    ${st.pedidos.filter(x => x.plano_id === pl.id).map(cartaoPedido).join('')}
    <div class="plano-card"><div style="flex:1;display:flex;flex-direction:column;gap:6px"><span style="font-size:11px;letter-spacing:.22em;color:#D9C3AC">${pl.status === 'ativo' ? 'PLANO' : pl.status === 'finalizado' ? 'PLANO FINALIZADO' : 'PLANO CANCELADO'}</span>
      <span class="serif" style="font-size:26px;font-weight:600;line-height:1.05">${esc(pl.procedimento)}</span><span style="font-size:13px;color:var(--soft)">${pl.total_sessoes} sessões · ${TERAPEUTA}${pl.valor ? ' · R$ ' + Number(pl.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}</span></div>
      <div style="position:relative;width:78px;height:78px;flex-shrink:0"><svg width="78" height="78" viewBox="0 0 78 78"><circle cx="39" cy="39" r="33" fill="none" stroke="#5A4231" stroke-width="7"/><circle cx="39" cy="39" r="33" fill="none" stroke="#D9BFA5" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(C * fr).toFixed(1)} 300" transform="rotate(-90 39 39)"/></svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><span class="serif" style="font-size:24px;font-weight:700;line-height:1">${i.feitas}/${pl.total_sessoes}</span><span style="font-size:10px;letter-spacing:.08em;color:var(--soft)">FEITAS</span></div></div></div>
    <section class="card" style="padding:14px 16px 4px"><div class="between" style="margin-bottom:4px"><span class="tag">Cronograma de sessões</span><span class="muted" style="font-size:11px">Toque numa sessão para editar</span></div>${linhas}</section>
    <div class="row" style="gap:10px">
      <a class="btn" href="${waLink(p.telefone, mensagemPlano(pl))}" target="_blank" rel="noopener" style="flex:1">${I('wa')} Enviar no WhatsApp</a>
      <button class="icon-btn" style="width:52px;height:52px;border-radius:16px" data-acao="copiar-link" data-id="${pl.id}" aria-label="Copiar link da paciente">${I('link')}</button></div>
  </div>`;
}

function vNovoPlano(pacId) {
  const p = pacId && paciente(pacId), f = p && fichaDe(p.id);
  const pf = st.prefill && p && st.prefill.pedido.paciente_id === p.id ? st.prefill : null;
  const pedProc = pf && pf.pedido.procedimento ? nomesProc().find(x => x.toLowerCase() === pf.pedido.procedimento.toLowerCase()) || pf.pedido.procedimento : null;
  const nomes = nomesProc(), sug = pedProc || (f && (f.servicos || [])[0] ? nomes.find(x => x.toLowerCase() === f.servicos[0].toLowerCase()) : null), proc0 = sug || nomes[0] || '';
  const ops = st.pacientes.map(x => `<option value="${x.id}" ${p && x.id === p.id ? 'selected' : ''}>${esc(x.nome)}</option>`).join('');
  return `<div class="wrap" style="padding-bottom:40px">
    <header class="row" style="justify-content:space-between"><button class="icon-btn plain" data-acao="voltar" aria-label="Cancelar">${I('x')}</button><span style="font-weight:500">Novo plano</span><span style="width:44px"></span></header>
    <h1 class="t">Montar tratamento</h1>
    <form data-form="novo-plano" class="stack" style="gap:18px">
      <label class="f">Paciente<select class="inp" name="paciente" required><option value="">Escolha a paciente</option>${ops}</select></label>
      <button type="button" class="btn ghost sm" data-acao="nova-paciente" data-origem="plano" style="align-self:flex-start">${I('plus')} Cadastrar nova paciente</button>
      ${pf ? `<div class="pedido-quando" style="background:var(--warnbg)">${I('cal')}<div><b>${esc(primeiro(p.nome))} pediu ${esc(dataLonga(pf.pedido.data_hora))}</b><span>às ${fHora(pf.pedido.data_hora)}. Monte o plano para confirmar, ou mude a data da 1ª sessão abaixo.</span></div></div>` : ''}
      ${f ? `<div class="alerta" style="background:var(--okbg);color:var(--oktext)">Ficha de anamnese de ${fData(f.enviada_em)}: ${esc((f.servicos || []).join(', '))}</div>` : ''}
      <div class="stack" style="gap:8px"><span class="tag">Procedimento</span>
        ${chipsProc(proc0)}
        <input class="inp" name="procedimento" value="${esc(proc0)}" aria-label="Procedimento" placeholder="Nome do procedimento" required></div>
      <div class="card row" style="justify-content:space-between"><div><b style="font-weight:500">Número de sessões</b><div class="ink2" style="font-size:12px">Pacote fechado com a paciente</div></div>
        <div class="row" style="gap:4px"><button type="button" class="icon-btn" data-acao="qtd" data-v="-1" aria-label="Menos uma sessão">−</button>
        <input name="qtd" type="number" min="1" max="50" value="5" class="serif" style="width:48px;text-align:center;font-size:30px;font-weight:700;border:0;background:transparent" aria-label="Número de sessões">
        <button type="button" class="icon-btn acc" style="background:var(--ink)" data-acao="qtd" data-v="1" aria-label="Mais uma sessão">+</button></div></div>
      <div class="f">1ª sessão${pf ? '' : ' (opcional)'}${pf ? campoDH(diaKey(new Date(pf.pedido.data_hora)), fHora(pf.pedido.data_hora), false) : campoDH('', '09:00', true, 'Escolher data e horário')}</div>
      <label class="f">Valor do pacote (opcional)<input class="inp" name="valor" inputmode="decimal" placeholder="R$ 0,00" value="${valorSug(proc0, 5)}"><span class="muted" style="font-size:12px;font-weight:400;letter-spacing:0">Calculado pelo valor da sessão vezes o número de sessões. Pode alterar.</span></label>
      <p class="ink2" style="font-size:13px;text-align:center">As demais datas você agenda ao concluir cada sessão.</p>
      <button class="btn" type="submit">Criar plano</button>
    </form></div>`;
}

/* ═══ HORÁRIOS DE ATENDIMENTO
   Padrão: seg a sex 8h às 18h, sábado 8h às 12h, domingo fechado. Feriados fechados.
   A Rauana ajusta um dia específico (abrir, fechar ou mudar horários). */
const GRADE_INI = 7 * 60, GRADE_FIM = 20 * 60 + 30;
function gradeHoras() { const h = []; for (let m = GRADE_INI; m <= GRADE_FIM; m += 30) h.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60)); return h; }
function horasPadrao(dia) { const w = new Date(dia + 'T12:00').getDay(); if (w === 0) return []; const fim = w === 6 ? 11 * 60 + 30 : 17 * 60 + 30, h = []; for (let m = 8 * 60; m <= fim; m += 30) h.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60)); return h; }
const especialDe = dia => st.especiais.find(x => x.dia === dia);
const feriadoDe = dia => st.feriados.find(x => x.dia === dia);
function horasDoDia(dia) { const e = especialDe(dia); if (e) return e.horas; if (feriadoDe(dia)) return []; return horasPadrao(dia); }
function ocupacao(dia, hora) {
  const ini = new Date(paraISO(dia, hora)).getTime(), fim = ini + 30 * 60e3;
  for (const pl of st.planos) {
    if (pl.status !== 'ativo') continue;
    const dur = durNome(pl.procedimento) * 60e3;
    for (const s of pl.sessoes) if (s.status === 'agendada' && s.data_hora) { const a = new Date(s.data_hora).getTime(); if (a < fim && a + dur > ini) return { tipo: 'sessao', nome: primeiro(paciente(pl.paciente_id).nome) }; }
  }
  for (const pd of st.pedidos) { const pl = st.planos.find(x => x.id === pd.plano_id), pac = paciente(pl ? pl.paciente_id : pd.paciente_id); if (!pac) continue; const a = new Date(pd.data_hora).getTime(), dur = durNome(pl ? pl.procedimento : pd.procedimento) * 60e3; if (a < fim && a + dur > ini) return { tipo: 'pedido', nome: primeiro(pac.nome) }; }
  return null;
}
const mesmoConjunto = (a, b) => a.length === b.length && a.every(x => b.includes(x));
(function estilosHorarios() {
  if (document.getElementById('css-horarios')) return;
  const c = document.createElement('style'); c.id = 'css-horarios';
  c.textContent = `
.hor-grade button{position:relative}
.hor-grade button.fechado:not(.on):not(.fer){color:#BBAA9A;text-decoration:line-through;text-decoration-color:rgba(59,38,22,.25)}
.hor-grade button.fer:not(.on){background:#F3DDD3;color:#9A3F1E;font-weight:600;text-decoration:none}
.hor-grade button.fer.on{background:#9A3F1E;color:#fff}
.hor-grade button.tem::after{content:"";position:absolute;left:50%;bottom:5px;width:5px;height:5px;margin-left:-2.5px;border-radius:3px;background:var(--ok)}
.hor-grade button.on.tem::after{background:var(--onink)}
.hor-grade button.fer::before{display:none}
.leg{display:flex;flex-wrap:wrap;gap:8px;padding-top:4px;border-top:1px solid var(--divider)}
.leg span{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--ink2);background:var(--bg);border-radius:20px;padding:6px 11px 6px 8px}
.leg i{width:18px;height:18px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;font-style:normal;font-size:10px;font-weight:600}
.leg .l-aj{background:#fff;position:relative}.leg .l-aj::after{content:"";width:6px;height:6px;border-radius:3px;background:var(--ok)}
.leg .l-fer{background:#F3DDD3;color:#9A3F1E}
.leg .l-fec{color:#BBAA9A;text-decoration:line-through}
.fer-aviso{display:flex;gap:12px;align-items:center;background:#F3DDD3;color:#7A3418;border-radius:16px;padding:12px 14px}
.fer-aviso svg.i{flex-shrink:0;color:#9A3F1E}
.fer-aviso b{display:block;font-size:15px}.fer-aviso span{font-size:13px;opacity:.9}
.fer-lista{display:flex;flex-direction:column;gap:8px}
.fer-item{display:flex;align-items:center;gap:14px;width:100%;background:var(--card);border:0;border-radius:18px;padding:10px 14px 10px 10px;text-align:left;cursor:pointer;color:var(--ink);font:inherit}
.fer-data{width:52px;height:52px;flex-shrink:0;border-radius:14px;background:#F3DDD3;color:#9A3F1E;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.fer-data b{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700}
.fer-data small{font-size:10px;font-weight:600;letter-spacing:.12em;margin-top:2px}
.fer-item.aberto .fer-data{background:var(--okbg);color:var(--oktext)}
.fer-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.fer-txt b{font-weight:500;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fer-txt span{font-size:12px;color:var(--muted)}
.fer-item .badge{flex-shrink:0}
.fer-item svg.i{color:var(--muted);width:18px;height:18px;flex-shrink:0}`;
  document.head.appendChild(c);
})();
function vHorarios() {
  const H = st.hor || (st.hor = { dia: diaKey(new Date()), mes: null, sel: null });
  const base = new Date(H.dia + 'T12:00'); if (!H.mes) H.mes = [base.getFullYear(), base.getMonth()];
  if (!H.sel || H.sel.dia !== H.dia) H.sel = { dia: H.dia, horas: new Set(horasDoDia(H.dia)) };
  const [ano, mes] = H.mes, hoje = diaKey(new Date());
  const ini0 = new Date(ano, mes, 1).getDay(), nDias = new Date(ano, mes + 1, 0).getDate();
  const nomeMes = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  let dias = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(x => `<span class="sem">${x}</span>`).join('') + '<span></span>'.repeat(ini0);
  for (let d = 1; d <= nDias; d++) {
    const k = `${ano}-${pad(mes + 1)}-${pad(d)}`, e = especialDe(k), fer = feriadoDe(k), fechado = !horasDoDia(k).length;
    const cls = [k === H.dia ? 'on' : '', k === hoje ? 'hoje' : '', k < hoje ? 'passou' : '', fechado ? 'fechado' : '', e && !fechado ? 'tem' : '', fer ? 'fer' : ''].join(' ');
    dias += `<button type="button" class="${cls}" data-acao="hor-dia" data-v="${k}" ${k < hoje ? 'disabled' : ''}>${d}</button>`;
  }
  const salvos = horasDoDia(H.dia), atual = [...H.sel.horas], mudou = !mesmoConjunto(atual, salvos);
  const agora = Date.now(), e = especialDe(H.dia), fer = feriadoDe(H.dia);
  const chips = gradeHoras().map(h => {
    const passou = new Date(paraISO(H.dia, h)).getTime() < agora, oc = ocupacao(H.dia, h), on = H.sel.horas.has(h);
    return `<button type="button" class="hchip ${on ? 'on' : ''} ${oc ? 'oc' : ''}" data-acao="hor-hora" data-v="${h}" ${passou ? 'disabled' : ''}><b>${h}</b>${oc ? `<small>${esc(oc.nome)}${oc.tipo === 'pedido' ? ' (pedido)' : ''}</small>` : on ? '<small>aberto</small>' : ''}</button>`;
  }).join('');
  const t = new Date(H.dia + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace('-feira', '');
  const pad0 = horasPadrao(H.dia), descPadrao = pad0.length ? (new Date(H.dia + 'T12:00').getDay() === 6 ? 'sábado, 8h às 12h' : 'dia útil, 8h às 18h') : 'domingo, fechado';
  const situ = e ? (e.horas.length ? 'Horário ajustado por você' : 'Fechado por você') : fer ? 'Feriado' : `Padrão (${descPadrao})`;
  const n = H.sel.horas.size;
  return `<div class="wrap" style="padding-bottom:30px">
    <header class="row" style="justify-content:space-between"><a class="icon-btn plain" href="#/agenda" aria-label="Voltar">${I('back')}</a><span style="font-weight:500">Horários de atendimento</span><span style="width:44px"></span></header>
    <div class="card" style="background:var(--soft);font-size:14px;line-height:1.55"><b style="font-weight:600">Padrão:</b> segunda a sexta das 8h às 18h, sábado das 8h às 12h, domingo e feriados fechados. Toque num dia para mudar só aquele dia.</div>
    <section class="card stack"><div class="pk-mes"><button type="button" class="icon-btn" data-acao="hor-mes" data-v="-1" aria-label="Mês anterior">${I('back')}</button><b>${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</b><button type="button" class="icon-btn" data-acao="hor-mes" data-v="1" aria-label="Próximo mês">${I('chev')}</button></div>
      <div class="pk-grade hor-grade">${dias}</div>
      <div class="leg"><span><i class="l-fer">8</i>Feriado</span><span><i class="l-aj"></i>Horário ajustado</span><span><i class="l-fec">8</i>Fechado</span></div></section>
    ${fer ? `<div class="fer-aviso">${I('cal')}<div><b>Feriado · ${esc(fer.nome)}</b><span>${n ? 'Você abriu este feriado para atendimento.' : 'Fechado para as clientes. Para atender, abra os horários abaixo.'}</span></div></div>` : ''}
    <section class="card stack"><div class="between" style="align-items:flex-start"><div><span class="tag">${situ}</span><h2 class="s" style="font-size:22px;margin-top:2px">${esc(t.charAt(0).toUpperCase() + t.slice(1))}</h2></div><span class="badge ${n ? 'b-ok' : 'b-warn'}">${n ? `${n} ${n === 1 ? 'HORÁRIO' : 'HORÁRIOS'}` : 'FECHADO'}</span></div>
      <div class="hor-horas">${chips}</div>
      <div class="row" style="gap:8px;flex-wrap:wrap">${n ? '<button type="button" class="btn sm ghost" data-acao="hor-fechar">Fechar o dia todo</button>' : ''}${(pad0.length && !fer && !mesmoConjunto(atual, pad0)) ? `<button type="button" class="btn sm ghost" data-acao="hor-padrao">Usar o padrão</button>` : ''}${!pad0.length || fer ? '<button type="button" class="btn sm ghost" data-acao="hor-abrir">Abrir 8h às 18h</button>' : ''}</div>
      <button class="btn" data-acao="hor-salvar" ${mudou ? '' : 'disabled'}>${I('check', 2)} ${mudou ? 'Salvar este dia' : 'Salvo'}</button>
      ${e && !mudou ? '<button class="btn ghost" data-acao="hor-desfazer">Desfazer ajuste (voltar ao padrão)</button>' : ''}
      ${fer ? `<button class="btn ghost" data-acao="hor-tirar-feriado">${I('trash')} Não é feriado</button>` : `<button class="btn ghost" data-acao="hor-feriado">Marcar como feriado</button>`}</section>
    ${st.feriados.length ? `<section class="stack"><div class="between"><h2 class="s" style="font-size:22px">Próximos feriados</h2><span class="muted" style="font-size:12px">Toque para abrir ou editar</span></div><div class="fer-lista">${st.feriados.slice(0, st.ui.todosFer ? 99 : 6).map(f => {
      const d = new Date(f.dia + 'T12:00'), aberto = especialDe(f.dia) && especialDe(f.dia).horas.length;
      const sem = d.toLocaleDateString('pt-BR', { weekday: 'long' }), mesC = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
      return `<button class="fer-item ${aberto ? 'aberto' : ''}" data-acao="hor-dia" data-v="${f.dia}"><span class="fer-data"><b>${d.getDate()}</b><small>${mesC}</small></span><span class="fer-txt"><b>${esc(f.nome)}</b><span>${esc(sem.charAt(0).toUpperCase() + sem.slice(1))}${d.getFullYear() !== new Date().getFullYear() ? ' · ' + d.getFullYear() : ''}</span></span><span class="badge ${aberto ? 'b-ok' : 'b-warn'}">${aberto ? 'ABERTO' : 'FECHADO'}</span>${I('chev')}</button>`;
    }).join('')}</div>${st.feriados.length > 6 && !st.ui.todosFer ? `<button class="btn ghost sm" style="align-self:center" data-acao="hor-todos-fer">Ver todos os ${st.feriados.length} feriados</button>` : ''}</section>` : ''}
  </div>`;
}
async function salvarDia(dia, horas) {
  const ord = [...horas].sort(), padrao = feriadoDe(dia) ? [] : horasPadrao(dia);
  if (mesmoConjunto(ord, padrao)) { const r = await sb.from('dias_especiais').delete().eq('dia', dia); if (r.error) throw r.error; return; }
  const r = await sb.from('dias_especiais').upsert({ dia, horas: ord, atualizado_em: new Date().toISOString() }, { onConflict: 'dia' }); if (r.error) throw r.error;
}

function vAgenda() {
  const agora = new Date(); agora.setHours(0, 0, 0, 0); const fim = somaDias(agora, 21);
  const itens = st.planos.filter(p => p.status === 'ativo').flatMap(pl => pl.sessoes.filter(s => s.data_hora && s.status === 'agendada' && new Date(s.data_hora) >= agora && new Date(s.data_hora) < fim).map(s => ({ pl, s })))
    .sort((a, b) => a.s.data_hora.localeCompare(b.s.data_hora));
  const semData = st.planos.filter(p => p.status === 'ativo' && info(p).proxima && !info(p).proxima.data_hora);
  const grupos = {}; itens.forEach(x => { const k = diaKey(new Date(x.s.data_hora)); (grupos[k] = grupos[k] || []).push(x); });
  const hojeK = diaKey(new Date()), amanhaK = diaKey(somaDias(new Date(), 1));
  const tit = k => { const d = new Date(k + 'T12:00'); const t = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }); return k === hojeK ? 'Hoje, ' + t.split(', ')[1] : k === amanhaK ? 'Amanhã, ' + t.split(', ')[1] : t.charAt(0).toUpperCase() + t.slice(1); };
  const ajustes = st.especiais.length, prxFer = st.feriados[0];
  return `<div class="wrap"><div class="between" style="align-items:center"><h1 class="t">Agenda</h1></div><p class="ink2" style="font-size:14px;margin-top:-10px">Próximas 3 semanas</p>
    <a class="card row" href="#/horarios" style="text-decoration:none;color:inherit;background:var(--soft)"><span class="av" style="background:var(--card);color:var(--ink)">${I('clock')}</span><div style="flex:1;min-width:0"><b style="font-weight:500">Horários de atendimento</b><div class="ink2" style="font-size:13px">Seg a sex 8h às 18h · sáb 8h às 12h${ajustes ? ` · ${ajustes} ${ajustes === 1 ? 'dia ajustado' : 'dias ajustados'}` : ''}</div></div>${I('chev')}</a>
    ${Object.keys(grupos).length ? Object.keys(grupos).map(k => `<section class="stack"><h2 class="s" style="font-size:20px">${esc(tit(k))}</h2>${grupos[k].map(x => itemSessao(x.pl, x.s)).join('')}</section>`).join('') : '<div class="empty">Nenhuma sessão agendada nas próximas semanas.</div>'}
    ${semData.length ? `<section class="stack"><h2 class="s" style="font-size:20px">Próxima sessão sem data</h2>${semData.map(pl => { const p = paciente(pl.paciente_id); const s = info(pl).proxima; return `<a class="item" href="#/plano/${pl.id}">${av(p.nome, p.foto)}<div class="txt"><b>${esc(p.nome)}</b><span>${esc(pl.procedimento)} · sessão ${s.numero} de ${pl.total_sessoes}</span></div>${I('chev')}</a>`; }).join('')}</section>` : ''}</div>`;
}

function vUsuario() {
  return `<div class="wrap"><h1 class="t">Usuário</h1>
    <section class="card row"><button class="av-btn" data-acao="foto" data-tipo="equipe" aria-label="Trocar sua foto">${av(st.membro.nome, st.membro.foto, 'g')}<span class="cam">${I('cam')}</span></button><div><b style="font-weight:500;font-size:17px">${esc(st.membro.nome)}</b><div class="ink2" style="font-size:13px">${esc(st.user.email)} · ${st.membro.papel === 'admin' ? 'Administrador(a)' : 'Terapeuta'}</div></div></section>
    ${blocoAvisos()}
    <section class="card stack"><div class="tag">Seu nome</div>
      <form data-form="meu-nome" class="stack"><input class="inp" name="nome" value="${esc(st.membro.nome)}" maxlength="60" autocomplete="name" aria-label="Seu nome" required><button class="btn sm" type="submit" style="width:100%">Salvar nome</button></form></section>
    <section class="card stack"><div class="tag">Trocar senha</div>
      <form data-form="trocar-senha" class="stack"><input class="inp" type="password" name="s1" minlength="6" placeholder="Nova senha" autocomplete="new-password" required>
      <input class="inp" type="password" name="s2" minlength="6" placeholder="Repita a nova senha" autocomplete="new-password" required><button class="btn sm" type="submit" style="width:100%">Salvar nova senha</button></form></section>
    <section class="card stack"><div class="tag">Instalar no celular</div>
      <p class="ink2" style="font-size:14px;line-height:1.55"><b>iPhone:</b> no Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início".<br><b>Android:</b> no Chrome, toque nos três pontinhos e depois em "Adicionar à tela inicial" ou "Instalar app".</p></section>
    <button class="btn ghost" data-acao="atualizar">${I('renew')} Atualizar dados</button>
    <button class="btn ghost" data-acao="sair">Sair da conta</button>
    <p class="tag" style="text-align:center;letter-spacing:.3em;margin-top:8px">Saúde · Beleza · Bem-estar</p></div>`;
}

function vProcedimentos() {
  return `<div class="wrap">
    <div class="between"><h1 class="t">Procedimentos</h1><span class="muted" style="font-size:13px">${st.procs.length} cadastrados</span></div>
    <label class="row card" style="padding:0 14px;border:1px solid var(--field);min-height:50px;color:var(--muted)">${I('search')}<input id="busca-proc" class="inp" style="border:0;box-shadow:none;padding:0;background:transparent" type="search" placeholder="Buscar procedimento" aria-label="Buscar procedimento" value="${esc(st.ui.buscaProc)}"></label>
    <div id="lista-proc" class="card" style="padding:0;overflow:hidden"></div>
    <p class="ink2" style="font-size:13px;text-align:center;line-height:1.5">Valores por sessão. Ao montar um plano, o app já sugere o valor do pacote.</p>
    <div style="height:70px"></div></div>
    <button class="fab" data-acao="novo-proc" aria-label="Novo procedimento">${I('plus', 2)}</button>`;
}
function listarProcs() {
  const q = st.ui.buscaProc.trim(), ql = q.toLowerCase();
  const lista = st.procs.filter(p => !ql || p.nome.toLowerCase().includes(ql));
  const usos = n => st.planos.filter(pl => pl.status === 'ativo' && pl.procedimento.toLowerCase() === n.toLowerCase()).length;
  $('#lista-proc').innerHTML = lista.length ? lista.map(p => { const u = usos(p.nome); return `<button class="item" data-acao="editar-proc" data-id="${p.id}" style="border-radius:0;border-bottom:1px solid var(--divider)">
      <div class="av" style="background:var(--soft);color:var(--ink2)">${I('lotus')}</div>
      <div class="txt"><b>${esc(p.nome)}</b><span>${u ? `${u} ${u === 1 ? 'plano ativo' : 'planos ativos'}` : 'Nenhum plano ativo'} · ${fDur(p.duracao_min)}</span></div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;flex-shrink:0">${p.valor != null ? `<span class="preco">${moeda(p.valor)}</span><small class="muted" style="font-size:11px">por sessão</small>` : '<span class="badge b-warn">SEM VALOR</span>'}</div></button>`; }).join('')
    : `<div class="empty" style="margin:12px">${q ? `Nenhum procedimento com "${esc(q)}".<br><button class="btn sm" style="margin-top:12px" data-acao="novo-proc" data-nome="${esc(q)}">${I('plus')} Cadastrar "${esc(q)}"</button>` : 'Nenhum procedimento cadastrado.'}</div>`;
}

/* ═══ ANAMNESE NO APP ═══
   Usa o mesmo arquivo de perguntas da ficha do site (js/servicos.js).
   Mudou uma pergunta no GitHub da anamnese? O site e o app mudam juntos. */
let perguntasProntas = null;
const temPerguntas = () => typeof SERVICOS !== 'undefined' && typeof FICHA_GERAL !== 'undefined';
function carregarPerguntas() {
  if (!perguntasProntas) perguntasProntas = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = 'js/servicos.js?v=' + Date.now();
    s.onload = res; s.onerror = () => { perguntasProntas = null; rej(new Error('perguntas')); };
    document.head.appendChild(s);
  });
  return perguntasProntas;
}
function blocosServ() {
  const vistos = new Set(FICHA_GERAL.map(q => q.id));
  return SERVICOS.filter(s => st.anam.servicos.includes(s.id))
    .map(s => ({ servico: s, perguntas: s.perguntas.filter(q => !vistos.has(q.id) && vistos.add(q.id)) }))
    .filter(b => b.perguntas.length);
}
function rq(q) {
  const nota = q.nota ? `<p class="q-nota">${q.nota}</p>` : '';
  const ph = q.placeholder ? ` placeholder="${esc(q.placeholder)}"` : '';
  const pills = (ops, type, extra) => `<div class="chips">${ops.map(op => `<label class="chip-op"><input type="${type}" name="${q.id}" value="${esc(op)}"${extra || ''}><span>${esc(op)}</span></label>`).join('')}</div>`;
  let corpo = '';
  switch (q.tipo) {
    case 'texto': corpo = `<input class="inp" name="${q.id}"${ph}>`; break;
    case 'texto-longo': corpo = `<textarea class="inp" name="${q.id}"${ph}></textarea>`; break;
    case 'numero': corpo = `<input class="inp" type="number" inputmode="decimal" name="${q.id}"${ph}>`; break;
    case 'lista': corpo = `<div class="stack" style="gap:8px">${Array.from({ length: q.itens || 3 }, (_, i) => `<input class="inp" name="${q.id}_${i + 1}" placeholder="${i + 1}." aria-label="${esc(q.resumo)} ${i + 1}">`).join('')}</div>`; break;
    case 'escolha': corpo = pills(q.opcoes, 'radio'); break;
    case 'multipla': corpo = pills(q.opcoes, 'checkbox') + (q.outro ? `<input class="inp" name="${q.id}Outro" placeholder="${esc(q.outro)}" aria-label="${esc(q.outro)}">` : ''); break;
    case 'sim-qual': {
      const abre = q.abreEm || 'Sim';
      const det = q.detalheTipo === 'numero' ? `<input class="inp" type="number" name="${q.id}Detalhe"${q.detalhePlaceholder ? ` placeholder="${esc(q.detalhePlaceholder)}"` : ''}>`
        : `<textarea class="inp" name="${q.id}Detalhe" style="min-height:70px"${q.detalhePlaceholder ? ` placeholder="${esc(q.detalhePlaceholder)}"` : ''}></textarea>`;
      corpo = pills(q.opcoes || ['Sim', 'Não'], 'radio', ` data-abre="${esc(abre)}"`) +
        `<div class="stack" data-cond="${q.id}" hidden style="gap:6px">${q.detalheLabel ? `<span class="ink2" style="font-size:13px">${q.detalheLabel}</span>` : ''}${det}</div>`;
      break;
    }
  }
  return `<div class="stack" style="gap:8px"><b style="font-weight:500;font-size:15px;line-height:1.4">${q.texto}</b>${nota}${corpo}</div>`;
}
function blocoPerguntas(lista) {
  let tema = null;
  return lista.map(q => { const t = q.tema && q.tema !== tema ? `<div class="q-tema">${esc(q.tema)}</div>` : ''; tema = q.tema || tema; return t + rq(q); }).join('');
}
function vAnamnese(pacId) {
  const p = paciente(pacId); if (!p) return `<div class="wrap"><div class="empty">Paciente não encontrada.</div></div>`;
  if (!temPerguntas()) {
    carregarPerguntas().then(() => { if (rota()[0] === 'anamnese') render(); }).catch(() => toast('Não foi possível carregar as perguntas. Verifique a internet.'));
    return `<div class="carregando"><img src="lotus.svg" alt="" width="56">Carregando perguntas...</div>`;
  }
  if (!st.anam || st.anam.pac !== pacId) st.anam = { pac: pacId, servicos: [], r: {} };
  const A = st.anam;
  return `<div class="wrap" style="padding-bottom:40px">
    <header class="row" style="justify-content:space-between"><a class="icon-btn plain" href="#/paciente/${pacId}" aria-label="Voltar">${I('x')}</a><span style="font-weight:500">Anamnese</span><span style="width:44px"></span></header>
    <div><h1 class="t">Ficha de anamnese</h1><p class="ink2" style="font-size:14px;margin-top:4px">${esc(p.nome)} · ${fTel(p.telefone)}</p></div>
    <form data-form="anamnese" data-id="${pacId}" class="stack" style="gap:16px">
      <section class="card stack"><div class="tag">Serviços</div><div class="chips">${SERVICOS.map(s => `<button type="button" class="chip ${A.servicos.includes(s.id) ? 'on' : ''}" data-acao="anam-servico" data-v="${s.id}">${esc(s.nome)}</button>`).join('')}</div>
        ${A.servicos.length ? '' : '<span class="muted" style="font-size:13px">Escolha os serviços para ver as perguntas de cada um.</span>'}</section>
      <section class="card stack"><div class="tag">Medidas (opcional)</div><div class="grid3" style="grid-template-columns:repeat(2,minmax(0,1fr))"><label class="f">Peso (kg)<input class="inp" type="number" inputmode="decimal" name="peso"></label><label class="f">Altura (cm)<input class="inp" type="number" inputmode="numeric" name="altura"></label></div></section>
      <section class="card stack" style="gap:18px"><div class="tag">Ficha geral de saúde</div>${blocoPerguntas(FICHA_GERAL)}</section>
      ${blocosServ().map(b => `<section class="card stack" style="gap:18px"><div class="tag">${esc(b.servico.nome)}</div>${blocoPerguntas(b.perguntas)}</section>`).join('')}
      <section class="card stack"><div class="tag">Termo de consentimento</div>
        <label class="row" style="align-items:flex-start;gap:12px;font-size:14px;line-height:1.55;color:var(--ink2);cursor:pointer"><input type="checkbox" name="consentimento" style="width:22px;height:22px;flex-shrink:0;margin-top:2px;accent-color:var(--ink)">
        <span>Declaro que as informações prestadas são verdadeiras e que não omiti nenhuma condição de saúde. Autorizo a Viva Mais Bella a utilizar estes dados exclusivamente para avaliação e realização do meu atendimento, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</span></label>
        <label class="f">Assinatura (nome completo da cliente)<input class="inp" name="assinatura" value="${esc(p.nome)}"></label></section>
      <button class="btn" type="submit">${I('check', 2)} Salvar ficha</button>
    </form></div>`;
}
const valR = x => x == null || (typeof x === 'string' && !x.trim()) || (Array.isArray(x) && !x.length) ? '—' : Array.isArray(x) ? x.join(', ') : String(x).trim();
function lerResp(form) {
  const r = {};
  form.querySelectorAll('input[name],textarea[name]').forEach(el => {
    if (el.name === 'consentimento' || el.name === 'assinatura') return;
    if (el.type === 'radio') { if (el.checked) r[el.name] = el.value; else if (!(el.name in r)) r[el.name] = null; }
    else if (el.type === 'checkbox') { r[el.name] = r[el.name] || []; if (el.checked) r[el.name].push(el.value); }
    else r[el.name] = el.value;
  });
  return r;
}
function aplicarResp(form, r) {
  form.querySelectorAll('input[name],textarea[name]').forEach(el => {
    if (!(el.name in r) || el.name === 'consentimento' || el.name === 'assinatura') return;
    if (el.type === 'radio') el.checked = r[el.name] === el.value;
    else if (el.type === 'checkbox') el.checked = Array.isArray(r[el.name]) && r[el.name].includes(el.value);
    else el.value = r[el.name] ?? '';
  });
  form.querySelectorAll('[data-cond]').forEach(c => { const m = form.querySelector(`input[name="${c.dataset.cond}"]:checked`); c.hidden = !m || m.value !== m.dataset.abre; });
}
function linhasResp(q, r) {
  if (q.tipo === 'multipla') { const o = valR(r[q.id + 'Outro']); return [[q.resumo, valR(r[q.id])], ...(o !== '—' ? [[q.resumo + ' (outro)', o]] : [])]; }
  if (q.tipo === 'lista') { const it = Array.from({ length: q.itens || 3 }, (_, i) => valR(r[`${q.id}_${i + 1}`])).filter(x => x !== '—'); return [[q.resumo, it.length ? it.join('; ') : '—']]; }
  if (q.tipo === 'sim-qual') { const x = valR(r[q.id]); return [[q.resumo, x], ...(x === (q.abreEm || 'Sim') ? [[q.detalheResumo, valR(r[q.id + 'Detalhe'])]] : [])]; }
  return [[q.resumo, valR(r[q.id])]];
}
function pontosResp(lista, r) {
  return lista.filter(q => q.alerta).flatMap(q => {
    if (q.tipo === 'multipla') { const m = (r[q.id] || []).filter(x => x !== 'Nenhuma'); return m.length ? [{ pergunta: q.resumo, resposta: m.join(', ') }] : []; }
    const x = valR(r[q.id]); if (x === '—' || /^Não/.test(x)) return [];
    const d = q.tipo === 'sim-qual' && x === (q.abreEm || 'Sim') ? valR(r[q.id + 'Detalhe']) : '—';
    return [{ pergunta: q.resumo, resposta: d !== '—' ? `${x} (${d})` : x }];
  });
}

/* ═══ FOLHAS (sheets) ═══ */
function sheetConcluir(sesId) {
  const pl = st.planos.find(p => p.sessoes.some(s => s.id === sesId)); const s = pl.sessoes.find(x => x.id === sesId);
  const prox = pl.sessoes.find(x => x.numero > s.numero && x.status !== 'concluida'); const p = paciente(pl.paciente_id);
  const base = s.data_hora ? new Date(s.data_hora) : new Date(); const sug = somaDias(new Date(), 7);
  abrirSheet(`<div class="between" style="align-items:flex-start"><div><h2 class="s" style="font-size:27px">Concluir ${s.numero}ª sessão</h2><div class="ink2" style="font-size:13px">${esc(primeiro(p.nome))} · ${esc(pl.procedimento)}</div></div>
      <button class="icon-btn plain" data-acao="fechar" aria-label="Fechar">${I('x')}</button></div>
    <form data-form="concluir" data-id="${sesId}" class="stack" style="gap:14px">
      <div class="seg"><button type="button" class="on" data-acao="seg" data-v="ok">Realizada</button><button type="button" data-acao="seg" data-v="falta">Paciente faltou</button></div>
      <input type="hidden" name="tipo" value="ok">
      <div id="bloco-prox" class="stack" style="gap:8px">${prox ? `<span class="tag" id="rotulo-data" data-ok="Próxima sessão (${prox.numero}ª)" data-falta="Remarcar a ${s.numero}ª sessão para">Próxima sessão (${prox.numero}ª)</span>
        ${campoDH(prox.data_hora ? diaKey(new Date(prox.data_hora)) : diaKey(sug), prox.data_hora ? fHora(prox.data_hora) : fHora(base.toISOString()), true, 'Ainda sem data')}
        <span class="muted" style="font-size:12px">Ainda não marcou? Toque na data e escolha "Deixar sem data".</span>`
        : `<span class="tag" id="rotulo-data" data-ok="Última sessão do pacote" data-falta="Remarcar a ${s.numero}ª sessão para">Última sessão do pacote</span><span class="muted" style="font-size:12px" id="aviso-ultima">Ao concluir, o plano será finalizado.</span>
        <div id="remarcar" style="display:none">${campoDH('', fHora(base.toISOString()), true, 'Escolher nova data')}</div>`}</div>
      <label class="switch">Atualizar a paciente no WhatsApp<input type="checkbox" name="whats" checked></label>
      <button class="btn" type="submit">${I('check', 2)} Confirmar</button></form>`);
}
function sheetSessao(sesId) {
  const pl = st.planos.find(p => p.sessoes.some(s => s.id === sesId)); const s = pl.sessoes.find(x => x.id === sesId);
  const ok = s.status === 'concluida';
  abrirSheet(`<div class="between" style="align-items:flex-start"><div><h2 class="s" style="font-size:27px">${s.numero}ª sessão</h2><div class="ink2" style="font-size:13px">${esc(pl.procedimento)} · ${ok ? 'realizada' : s.data_hora ? 'agendada' : 'a agendar'}</div></div><button class="icon-btn plain" data-acao="fechar" aria-label="Fechar">${I('x')}</button></div>
    <form data-form="sessao" data-id="${sesId}" class="stack" style="gap:14px">
      <div class="f">Data e horário${campoDH(s.data_hora ? diaKey(new Date(s.data_hora)) : '', s.data_hora ? fHora(s.data_hora) : '09:00', !ok, 'A agendar')}</div>
      <label class="f">Observação<textarea class="inp" name="obs" placeholder="Ex.: paciente pediu pressão mais leve">${esc(s.observacao || '')}</textarea></label>
      <button class="btn" type="submit">Salvar</button>
      ${ok ? `<button class="btn ghost" type="button" data-acao="desfazer-sessao" data-id="${sesId}">Marcar como não realizada</button>
        <p class="muted" style="font-size:12px;text-align:center">Sessões realizadas não podem ser excluídas, para manter o histórico.</p>`
      : `${s.data_hora ? `<button class="btn ghost" type="button" data-acao="limpar-data" data-id="${sesId}">Remover data</button>` : ''}
        ${pl.sessoes.length > 1 ? `<button class="btn ghost" type="button" data-acao="excluir-sessao" data-id="${sesId}" style="color:var(--warntext)">${I('trash')} Excluir esta sessão</button>` : ''}`}</form>`);
}
function sheetEditarPlano(id) {
  const pl = st.planos.find(p => p.id === id), feitas = info(pl).feitas;
  abrirSheet(`<div class="between" style="align-items:flex-start"><h2 class="s" style="font-size:27px">Editar plano</h2><button class="icon-btn plain" data-acao="fechar" aria-label="Fechar">${I('x')}</button></div>
    <form data-form="editar-plano" data-id="${id}" data-valor-manual="${pl.valor ? 1 : ''}" class="stack" style="gap:14px">
      <div class="stack" style="gap:8px"><span class="tag">Procedimento</span>${chipsProc(pl.procedimento)}
        <input class="inp" name="procedimento" value="${esc(pl.procedimento)}" aria-label="Procedimento" placeholder="Nome do procedimento" required></div>
      <div class="card row" style="justify-content:space-between;background:#fff;border:1px solid var(--field)"><div><b style="font-weight:500">Número de sessões</b><div class="ink2" style="font-size:12px">${feitas ? `Mínimo ${feitas}: as já feitas ficam no histórico` : 'Pacote fechado com a paciente'}</div></div>
        <div class="row" style="gap:4px"><button type="button" class="icon-btn" data-acao="qtd" data-v="-1" data-min="${Math.max(1, feitas)}" aria-label="Menos uma sessão">−</button>
        <input name="qtd" type="number" min="${Math.max(1, feitas)}" max="50" value="${pl.total_sessoes}" class="serif" style="width:48px;text-align:center;font-size:30px;font-weight:700;border:0;background:transparent" aria-label="Número de sessões">
        <button type="button" class="icon-btn acc" style="background:var(--ink)" data-acao="qtd" data-v="1" aria-label="Mais uma sessão">+</button></div></div>
      <label class="f">Valor do pacote (opcional)<input class="inp" name="valor" inputmode="decimal" placeholder="R$ 0,00" value="${pl.valor ? Number(pl.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}"></label>
      <button class="btn" type="submit">Salvar alterações</button></form>`);
}
function sheetEditarPaciente(id) {
  const p = paciente(id);
  abrirSheet(`<div class="between" style="align-items:flex-start"><h2 class="s" style="font-size:27px">Dados da paciente</h2><button class="icon-btn plain" data-acao="fechar" aria-label="Fechar">${I('x')}</button></div>
    <form data-form="editar-paciente" data-id="${id}" class="stack" style="gap:14px">
      <button type="button" class="row" data-acao="foto" data-tipo="paciente" data-id="${id}" style="border:0;background:transparent;cursor:pointer;gap:14px;padding:0;text-align:left;color:inherit">${av(p.nome, p.foto, 'g')}<span class="ink2" style="font-size:14px;text-decoration:underline">${p.foto ? 'Trocar foto' : 'Adicionar foto'}</span></button>
      <label class="f">Nome completo<input class="inp" name="nome" value="${esc(p.nome)}" required autocomplete="off"></label>
      <label class="f">Telefone / WhatsApp<input class="inp" name="telefone" type="tel" inputmode="tel" value="${esc(fTel(p.telefone))}" required></label>
      <label class="f">Data de nascimento<input class="inp" name="nascimento" inputmode="numeric" placeholder="DD/MM/AAAA" maxlength="10" value="${nascBR(p.data_nascimento)}" data-mascara="nasc"></label>
      <label class="f">Endereço<textarea class="inp" name="endereco" placeholder="Rua, número, bairro, cidade" style="min-height:70px">${esc(p.endereco || '')}</textarea></label>
      <button class="btn" type="submit">Salvar</button>
      <button class="btn ghost" type="button" data-acao="excluir-paciente" data-id="${id}" style="color:var(--warntext)">${I('trash')} Excluir paciente</button></form>`);
}
function sheetNovaPaciente(origem) {
  abrirSheet(`<div class="between" style="align-items:flex-start"><h2 class="s" style="font-size:27px">Nova paciente</h2><button class="icon-btn plain" data-acao="fechar" aria-label="Fechar">${I('x')}</button></div>
    <p class="ink2" style="font-size:13px">Quem envia a ficha de anamnese já aparece aqui sozinha. Use este cadastro para quem já estava em tratamento.</p>
    <form data-form="nova-paciente" data-origem="${origem || ''}" class="stack" style="gap:14px">
      <label class="f">Nome completo<input class="inp" name="nome" required autocomplete="off"></label>
      <label class="f">Telefone / WhatsApp<input class="inp" name="telefone" type="tel" inputmode="tel" placeholder="(71) 9 0000-0000" required></label>
      <label class="f">Data de nascimento (opcional)<input class="inp" name="nascimento" inputmode="numeric" placeholder="DD/MM/AAAA" maxlength="10" data-mascara="nasc"></label>
      <label class="f">Endereço (opcional)<input class="inp" name="endereco" placeholder="Rua, número, bairro, cidade"></label>
      <button class="btn" type="submit">Cadastrar</button></form>`);
}
function sheetProc(id, nome) {
  const p = id ? st.procs.find(x => x.id === id) : null;
  abrirSheet(`<div class="between" style="align-items:flex-start"><h2 class="s" style="font-size:27px">${p ? 'Editar procedimento' : 'Novo procedimento'}</h2><button class="icon-btn plain" data-acao="fechar" aria-label="Fechar">${I('x')}</button></div>
    <form data-form="proc" data-id="${p ? p.id : ''}" class="stack" style="gap:14px">
      <label class="f">Nome<input class="inp" name="nome" value="${esc(p ? p.nome : nome || '')}" required maxlength="80" autocomplete="off"></label>
      <div class="f">Duração da sessão<div class="chips">${[30, 45, 60, 90, 120].map(m => `<label class="chip-op"><input type="radio" name="duracao" value="${m}" ${(p ? p.duracao_min || 60 : 60) === m ? 'checked' : ''}><span>${fDur(m)}</span></label>`).join('')}</div></div>
      <label class="f">Valor por sessão<input class="inp" name="valor" inputmode="decimal" placeholder="R$ 0,00" value="${p && p.valor != null ? Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}"></label>
      ${p ? '<p class="muted" style="font-size:12px">Mudar o nome ou o valor aqui não altera os planos já criados.</p>' : ''}
      <button class="btn" type="submit">${p ? 'Salvar' : 'Cadastrar'}</button>
      ${p ? `<button class="btn ghost" type="button" data-acao="excluir-proc" data-id="${p.id}" style="color:var(--warntext)">${I('trash')} Excluir procedimento</button>` : ''}</form>`);
}
function sheetFoto(tipo, id) {
  const eu = tipo === 'equipe', p = eu ? st.membro : paciente(id);
  const campo = cap => `<input type="file" accept="image/*"${cap ? ` capture="${cap}"` : ''} class="oculto" data-foto="${tipo}" data-id="${id || ''}">`;
  abrirSheet(`<div class="between" style="align-items:flex-start"><h2 class="s" style="font-size:27px">${eu ? 'Sua foto' : 'Foto da paciente'}</h2><button class="icon-btn plain" data-acao="fechar" aria-label="Fechar">${I('x')}</button></div>
    <div style="align-self:center">${av(p.nome, p.foto, 'xg')}</div>
    <label class="btn">${I('cam')} Tirar foto agora${campo(eu ? 'user' : 'environment')}</label>
    <label class="btn soft">${I('img')} Escolher da galeria${campo('')}</label>
    ${p.foto ? `<button class="btn ghost" data-acao="remover-foto" data-tipo="${tipo}" data-id="${id || ''}" style="color:var(--warntext)">${I('trash')} Remover foto</button>` : ''}
    ${eu ? '' : '<p class="muted" style="font-size:12px;text-align:center">A foto fica visível só para a equipe e é apagada junto se a paciente for excluída.</p>'}`);
}
// Recorta em quadrado e diminui a foto antes de enviar (carrega rápido e ocupa pouco espaço)
function reduzirFoto(arq, lado = 480) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(arq), img = new Image();
    img.onload = () => {
      const m = Math.min(img.naturalWidth, img.naturalHeight), c = document.createElement('canvas'); c.width = c.height = Math.min(lado, m);
      c.getContext('2d').drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); c.toBlob(b => b ? res(b) : rej(new Error('foto')), 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('foto')); };
    img.src = url;
  });
}
const gravarFoto = (eu, id, caminho) => eu ? sb.from('equipe').update({ foto: caminho }).eq('user_id', st.user.id) : sb.from('pacientes').update({ foto: caminho }).eq('id', id);
async function trocarFoto(tipo, id, arq) {
  const eu = tipo === 'equipe', antiga = (eu ? st.membro : paciente(id)).foto;
  let blob; try { blob = await reduzirFoto(arq); } catch { return toast('Não foi possível ler essa imagem. Tente outra.'); }
  const caminho = `${eu ? 'equipe/' + st.user.id : 'pacientes/' + id}-${Date.now()}.jpg`;
  const ok = await salvar(async () => {
    const up = await sb.storage.from('fotos').upload(caminho, blob, { contentType: 'image/jpeg' }); if (up.error) throw up.error;
    const r = await gravarFoto(eu, id, caminho);
    if (r.error) { await sb.storage.from('fotos').remove([caminho]); throw r.error; }
    if (eu) st.membro.foto = caminho;
    if (antiga) await sb.storage.from('fotos').remove([antiga]);
  }, 'Foto atualizada.');
  if (ok) { fecharSheet(); render(); }
}
function sheetMenuPlano(id) {
  const pl = st.planos.find(p => p.id === id);
  abrirSheet(`<div class="between"><h2 class="s">Opções do plano</h2><button class="icon-btn plain" data-acao="fechar" aria-label="Fechar">${I('x')}</button></div>
    <button class="btn ghost" data-acao="editar-plano" data-id="${id}">${I('edit')} Editar plano</button>
    ${pl.status === 'ativo' ? `<button class="btn ghost" data-acao="status-plano" data-id="${id}" data-v="finalizado">Marcar como finalizado</button>
    <button class="btn ghost" data-acao="status-plano" data-id="${id}" data-v="cancelado">Cancelar plano</button>` : `<button class="btn ghost" data-acao="status-plano" data-id="${id}" data-v="ativo">Reabrir plano</button>`}
    <button class="btn ghost" data-acao="excluir-plano" data-id="${id}" style="color:var(--warntext)">${I('trash')} Excluir plano</button>
    <p class="muted" style="font-size:12px;text-align:center">Para pacote que não vai continuar, prefira "Cancelar": ele fica no histórico da paciente.</p>`);
}

/* ═══ AÇÕES ═══ */
async function salvar(fn, ok) {
  try { await fn(); await carregar(); if (ok) toast(ok); return true; }
  catch (e) { console.error(e); if (!e.avisado) toast('Não foi possível salvar. Verifique a internet e tente de novo.'); return false; }
}
const upd = async (tab, vals, id) => { const { error } = await sb.from(tab).update(vals).eq('id', id); if (error) throw error; };

async function entrar(user) {
  st.user = user;
  const { data, error } = await sb.from('equipe').select('nome,papel,foto').eq('user_id', user.id).maybeSingle();
  if (error || !data) { st.membro = null; st.erroLogin = 'Este e-mail não tem acesso ao app.'; await sb.auth.signOut(); st.user = null; render(); return; }
  st.membro = data; st.erroLogin = '';
  try { await carregar(); } catch (e) { console.error(e); toast('Erro ao carregar os dados. Verifique a internet.'); }
  st.avisos = await estadoAvisos();
  render();
  if (st.avisos === 'ativo') navigator.serviceWorker.getRegistration().then(r => r && r.pushManager.getSubscription()).then(sub => sub && gravarInscricao(sub)).catch(() => {});
}

document.addEventListener('click', async e => {
  const el = e.target.closest('[data-acao]'); if (!el) return;
  const a = el.dataset.acao, id = el.dataset.id;
  if (a === 'fechar-fundo') { if (e.target === el) fecharSheet(); return; }
  if (a === 'pk-abrir') return abrirPicker(el.closest('.campo-wrap'));
  if (a === 'pk-fundo') { if (e.target === el) fecharPicker(); return; }
  if (a === 'pk-fechar') return fecharPicker();
  if (a === 'pk-mes') { const d = new Date(PK.ano, PK.mes + Number(el.dataset.v), 1); PK.ano = d.getFullYear(); PK.mes = d.getMonth(); return desenharPicker(); }
  if (a === 'pk-dia') { PK.dia = el.dataset.v; return desenharPicker(); }
  if (a === 'pk-hora') { PK.hora = el.dataset.v; return desenharPicker(); }
  if (a === 'pk-ok') { if (!PK.dia) return toast('Escolha o dia no calendário.'); return aplicarPicker(PK.dia); }
  if (a === 'pk-limpar') return aplicarPicker('');
  if (a === 'fechar') return fecharSheet();
  if (a === 'voltar') return history.length > 1 ? history.back() : ir('#/inicio');
  if (a === 'filtro') { st.ui.filtro = el.dataset.v; document.querySelectorAll('[data-acao="filtro"]').forEach(c => c.classList.toggle('on', c === el)); return listarPacientes(); }
  if (a === 'nova-paciente') return sheetNovaPaciente(el.dataset.origem);
  if (a === 'concluir') return sheetConcluir(id);
  if (a === 'sessao') return sheetSessao(id);
  if (a === 'anam-servico') {
    const form = el.closest('form'); Object.assign(st.anam.r, lerResp(form));
    const s = st.anam.servicos, i = s.indexOf(el.dataset.v); if (i >= 0) s.splice(i, 1); else s.push(el.dataset.v);
    const y = window.scrollY; render(); window.scrollTo(0, y); return;
  }
  if (a === 'menu-plano') return sheetMenuPlano(id);
  if (a && a.startsWith('hor-')) {
    const H = st.hor, y = window.scrollY, redesenha = () => { render(); window.scrollTo(0, y); };
    if (a === 'hor-dia') { H.dia = el.dataset.v; const d = new Date(H.dia + 'T12:00'); H.mes = [d.getFullYear(), d.getMonth()]; H.sel = null; render(); if (el.classList.contains('fer-item')) window.scrollTo(0, 0); else window.scrollTo(0, y); return; }
    if (a === 'hor-mes') { const d = new Date(H.mes[0], H.mes[1] + Number(el.dataset.v), 1); H.mes = [d.getFullYear(), d.getMonth()]; return redesenha(); }
    if (a === 'hor-hora') { const v = el.dataset.v; if (H.sel.horas.has(v)) H.sel.horas.delete(v); else H.sel.horas.add(v); return redesenha(); }
    if (a === 'hor-todos-fer') { st.ui.todosFer = true; return redesenha(); }
    if (a === 'hor-padrao') { H.sel.horas = new Set(horasPadrao(H.dia)); return redesenha(); }
    if (a === 'hor-abrir') { H.sel.horas = new Set(gradeHoras().filter(h => h >= '08:00' && h <= '17:30')); return redesenha(); }
    if (a === 'hor-fechar') {
      const oc = gradeHoras().map(h => ocupacao(H.dia, h)).filter(Boolean);
      if (!await confirmar({ titulo: 'Fechar o dia todo?', texto: `As clientes não vão conseguir pedir horário neste dia.${oc.length ? ` ${negrito('Atenção:')} já tem sessão marcada nesse dia. Ela continua na agenda.` : ''}`, ok: 'Fechar o dia', perigo: true, icone: 'alert' })) return;
      const dia = H.dia; if (await salvar(() => salvarDia(dia, []), 'Dia fechado.')) { H.sel = null; redesenha(); } return;
    }
    if (a === 'hor-salvar') { const dia = H.dia, horas = [...H.sel.horas]; if (await salvar(() => salvarDia(dia, horas), horas.length ? 'Horários do dia salvos.' : 'Dia fechado.')) { H.sel = null; redesenha(); } return; }
    if (a === 'hor-desfazer') { const dia = H.dia; if (await salvar(async () => { const r = await sb.from('dias_especiais').delete().eq('dia', dia); if (r.error) throw r.error; }, 'Dia voltou ao padrão.')) { H.sel = null; redesenha(); } return; }
    if (a === 'hor-tirar-feriado') {
      const f = feriadoDe(H.dia); if (!await confirmar({ titulo: 'Não é feriado?', texto: `${negrito(f.nome)} sai da lista e o dia volta ao horário padrão.`, ok: 'Tirar feriado', icone: 'undo' })) return;
      const dia = H.dia; if (await salvar(async () => { const r = await sb.from('feriados').delete().eq('dia', dia); if (r.error) throw r.error; }, 'Feriado removido.')) { H.sel = null; redesenha(); } return;
    }
    if (a === 'hor-feriado') {
      abrirSheet(`<div class="between" style="align-items:flex-start"><h2 class="s" style="font-size:27px">Marcar feriado</h2><button class="icon-btn plain" data-acao="fechar" aria-label="Fechar">${I('x')}</button></div>
        <form data-form="feriado" data-dia="${H.dia}" class="stack" style="gap:14px"><label class="f">Nome do feriado<input class="inp" name="nome" placeholder="Ex.: Aniversário da cidade" maxlength="60" required></label>
        <p class="muted" style="font-size:13px">O dia fica fechado para as clientes. Se quiser atender mesmo assim, é só abrir os horários depois.</p>
        <button class="btn" type="submit">Salvar feriado</button></form>`);
      return;
    }
  }
  if (a === 'avisos-ativar') return ativarAvisos();
  if (a === 'avisos-desativar') return desativarAvisos();
  if (a === 'avisos-depois') { st.ui.semConvite = true; return render(); }
  if (a === 'avisos-testar') { const { data, error } = await sb.functions.invoke('avisos', { body: { acao: 'teste' } }); return toast(error ? 'Não foi possível enviar o teste.' : data && data.enviados ? 'Aviso de teste enviado. Deve chegar em instantes.' : 'Nenhum celular ativo encontrado. Ative de novo.'); }
  if ((a === 'pedido-confirmar' || a === 'pedido-mudar') && (st.pedidos.find(x => x.id === id) || {}).plano_id === null) {
    const ped = st.pedidos.find(x => x.id === id);
    st.prefill = { pedido: ped, mudar: a === 'pedido-mudar' };
    ir('#/novo-plano/' + ped.paciente_id);
    if (a === 'pedido-mudar') setTimeout(() => { const c = document.querySelector('form[data-form="novo-plano"] .campo-wrap'); if (c) abrirPicker(c); }, 350);
    return;
  }
  if (a === 'pedido-confirmar') {
    const ped = st.pedidos.find(x => x.id === id), pl = ped && st.planos.find(x => x.id === ped.plano_id), s = pl && info(pl).proxima;
    if (!s) return toast('Este plano não tem sessão para agendar.');
    if (await salvar(async () => {
      await upd('sessoes', { data_hora: ped.data_hora, status: 'agendada' }, s.id);
      await upd('pedidos_horario', { status: 'confirmado', respondido_em: new Date().toISOString() }, ped.id);
    })) avisoCliente(st.planos.find(x => x.id === pl.id), s.numero, ped.data_hora, null);
    return;
  }
  if (a === 'pedido-mudar') {
    const ped = st.pedidos.find(x => x.id === id), pl = ped && st.planos.find(x => x.id === ped.plano_id); if (!pl) return;
    const p = paciente(pl.paciente_id);
    return abrirSheet(`<div class="between" style="align-items:flex-start"><h2 class="s" style="font-size:27px">Mudar data</h2><button class="icon-btn plain" data-acao="fechar" aria-label="Fechar">${I('x')}</button></div>
      <p class="ink2" style="font-size:14px;line-height:1.5">${esc(primeiro(p.nome))} pediu <b>${esc(dataLonga(ped.data_hora))} às ${fHora(ped.data_hora)}</b>. Escolha a data que funciona para você:</p>
      <form data-form="pedido-mudar" data-id="${ped.id}" class="stack" style="gap:14px"><div class="f">Nova data e horário${campoDH(diaKey(new Date(ped.data_hora)), fHora(ped.data_hora), false)}</div>
      <button class="btn" type="submit">${I('wa')} Salvar e avisar a cliente</button></form>`);
  }
  if (a === 'foto') return sheetFoto(el.dataset.tipo, id);
  if (a === 'novo-proc') return sheetProc(null, el.dataset.nome);
  if (a === 'editar-proc') return sheetProc(id);
  if (a === 'excluir-proc') {
    const p = st.procs.find(x => x.id === id);
    if (!await confirmar({ titulo: 'Excluir procedimento?', texto: `${negrito(p.nome)} sai da lista. Os planos já criados com ele continuam iguais.`, ok: 'Excluir', perigo: true })) return;
    if (await salvar(async () => { const r = await sb.from('procedimentos').delete().eq('id', id); if (r.error) throw r.error; }, 'Procedimento excluído.')) { fecharSheet(); render(); }
    return;
  }
  if (a === 'remover-foto') {
    const eu = el.dataset.tipo === 'equipe', antiga = (eu ? st.membro : paciente(id)).foto;
    if (!await confirmar({ titulo: 'Remover a foto?', texto: 'Volta a aparecer só as iniciais. Você pode colocar outra foto quando quiser.', ok: 'Remover', perigo: true })) return;
    if (await salvar(async () => {
      const r = await gravarFoto(eu, id, null); if (r.error) throw r.error;
      if (eu) st.membro.foto = null;
      await sb.storage.from('fotos').remove([antiga]);
    }, 'Foto removida.')) { fecharSheet(); render(); }
    return;
  }
  if (a === 'editar-plano') return sheetEditarPlano(id);
  if (a === 'editar-paciente') return sheetEditarPaciente(id);
  if (a === 'excluir-sessao') {
    const pl = st.planos.find(p => p.sessoes.some(s => s.id === id));
    if (!await confirmar({ titulo: 'Excluir esta sessão?', texto: `O pacote passa a ter ${negrito(String(pl.sessoes.length - 1) + ' sessões')}. As sessões já feitas continuam no histórico.`, ok: 'Excluir sessão', perigo: true })) return;
    if (await salvar(async () => {
      const r = await sb.from('sessoes').delete().eq('id', id).neq('status', 'concluida'); if (r.error) throw r.error;
      const a2 = await sb.rpc('ajustar_plano', { p_plano: pl.id }); if (a2.error) throw a2.error;
    }, 'Sessão excluída.')) { fecharSheet(); render(); }
    return;
  }
  if (a === 'desfazer-sessao') {
    if (!await confirmar({ titulo: 'Marcar como não realizada?', texto: 'A sessão volta a ficar agendada e deixa de contar como feita.', ok: 'Marcar como não realizada', icone: 'undo' })) return;
    const pl = st.planos.find(p => p.sessoes.some(s => s.id === id));
    if (await salvar(async () => {
      await upd('sessoes', { status: 'agendada', concluida_em: null }, id);
      const a2 = await sb.rpc('ajustar_plano', { p_plano: pl.id }); if (a2.error) throw a2.error;
    }, 'Sessão reaberta.')) { fecharSheet(); render(); }
    return;
  }
  if (a === 'excluir-plano') {
    const pl = st.planos.find(p => p.id === id);
    if (!await confirmar({ titulo: 'Excluir este plano?', texto: `O plano de ${negrito(pl.procedimento)} e todas as sessões dele serão apagados. Se o pacote só não vai continuar, prefira ${negrito('Cancelar plano')}: ele fica no histórico.`, ok: 'Excluir plano', perigo: true, trava: 'Entendo que não dá para desfazer' })) return;
    if (await salvar(async () => { const r = await sb.from('planos').delete().eq('id', id); if (r.error) throw r.error; }, 'Plano excluído.')) { fecharSheet(); ir('#/paciente/' + pl.paciente_id); }
    return;
  }
  if (a === 'excluir-paciente') {
    const p = paciente(id);
    if (!await confirmar({ titulo: 'Excluir paciente?', texto: `${negrito(p.nome)} será apagada junto com as fichas de anamnese, os planos, as sessões e a foto.`, ok: 'Excluir paciente', perigo: true, trava: 'Entendo que não dá para desfazer' })) return;
    if (await salvar(async () => { const r = await sb.from('pacientes').delete().eq('id', id); if (r.error) throw r.error; if (p.foto) await sb.storage.from('fotos').remove([p.foto]); }, 'Paciente excluída.')) { fecharSheet(); ir('#/pacientes'); }
    return;
  }
  if (a === 'proc') { const form = el.closest('form'); form.querySelectorAll('[data-acao="proc"]').forEach(c => c.classList.toggle('on', c === el)); const inp = form.elements.procedimento; inp.value = el.dataset.v; if (!el.dataset.v) inp.focus(); sugerirValor(form); return; }
  if (a === 'qtd') { const form = el.closest('form'), q = form.querySelector('[name="qtd"]'); const min = parseInt(q.min, 10) || 1; q.value = Math.min(50, Math.max(min, (parseInt(q.value, 10) || 1) + Number(el.dataset.v))); sugerirValor(form); return; }
  if (a === 'seg') {
    el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el));
    const form = el.closest('form'), falta = el.dataset.v === 'falta';
    form.elements.tipo.value = el.dataset.v;
    const rot = form.querySelector('#rotulo-data'); rot.textContent = falta ? rot.dataset.falta : rot.dataset.ok;
    const rem = form.querySelector('#remarcar'), av = form.querySelector('#aviso-ultima');
    if (rem) rem.style.display = falta ? '' : 'none';
    if (av) av.style.display = falta ? 'none' : '';
    return;
  }
  if (a === 'copiar-link') {
    const pl = st.planos.find(p => p.id === id);
    try { await navigator.clipboard.writeText(linkPaciente(pl)); toast('Link da paciente copiado.'); }
    catch { confirmar({ titulo: 'Link da paciente', texto: `Segure o link abaixo para copiar:<input class="inp" readonly value="${esc(linkPaciente(pl))}" onfocus="this.select()" style="margin-top:10px;font-size:14px">`, ok: 'Pronto', cancelar: 'Fechar', icone: 'copy' }); }
    return;
  }
  if (a === 'ver-ficha') {
    el.disabled = true;
    const { data, error } = await sb.from('anamneses').select('resumo,assinatura,enviada_em').eq('id', id).single();
    if (error) { el.disabled = false; return toast('Não foi possível abrir a ficha.'); }
    el.remove();
    document.getElementById('ficha-' + id).innerHTML = (data.resumo || []).filter(s => !s.destaque).map(s => `<div class="secao"><div class="tag">${esc(s.titulo)}</div>${(s.linhas || []).map(([q, r]) => `<div class="lin"><span>${esc(q)}</span><b>${esc(r)}</b></div>`).join('')}</div>`).join('');
    return;
  }
  if (a === 'limpar-data') { if (await salvar(() => upd('sessoes', { data_hora: null, status: 'pendente' }, id), 'Data removida.')) { fecharSheet(); render(); } return; }
  if (a === 'status-plano') {
    const cfg = {
      cancelado: { titulo: 'Cancelar este plano?', texto: 'As sessões que faltam deixam de aparecer na agenda. O plano continua no histórico da paciente e pode ser reaberto.', ok: 'Cancelar plano', cancelar: 'Voltar', perigo: true, icone: 'alert' },
      ativo: { titulo: 'Reabrir este plano?', texto: 'O plano volta a ficar ativo e as sessões que faltam voltam para a agenda.', ok: 'Reabrir plano', icone: 'undo' },
      finalizado: { titulo: 'Finalizar este plano?', texto: 'O plano fica marcado como concluído. Bom momento para oferecer a renovação.', ok: 'Finalizar plano', icone: 'check' },
    }[el.dataset.v];
    if (!await confirmar(cfg)) return;
    if (await salvar(() => upd('planos', { status: el.dataset.v }, id), 'Plano atualizado.')) { fecharSheet(); render(); }
    return;
  }
  if (a === 'atualizar') { await salvar(async () => {}, 'Dados atualizados.'); return render(); }
  if (a === 'sair') { await sb.auth.signOut(); st.user = null; st.membro = null; location.hash = '#/inicio'; return render(); }
  if (a === 'esqueci') {
    const email = (document.querySelector('[name="email"]').value || '').trim();
    if (!email) return toast('Digite seu e-mail primeiro.');
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/' });
    return toast(error ? 'Não foi possível enviar. Tente de novo.' : 'Enviamos um link para o seu e-mail.');
  }
});

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState !== 'visible' || !st.membro || Date.now() - (st.carregadoEm || 0) < 20000) return;
  try { await carregar(); } catch (e) { return; }
  if (!$('#sheet').innerHTML && !$('#picker').innerHTML && ['inicio', 'plano', 'agenda', 'pacientes', ''].includes(rota()[0] || '')) render();
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'busca') { st.ui.busca = el.value; listarPacientes(); }
  if (el.id === 'busca-proc') { st.ui.buscaProc = el.value; listarProcs(); }
  if (el.dataset && el.dataset.mascara === 'nasc') mascaraNasc(el);
  const form = el.closest && el.closest('form[data-form="novo-plano"],form[data-form="editar-plano"]'); if (!form) return;
  if (el.name === 'valor') form.dataset.valorManual = el.value.trim() ? '1' : '';
  if (el.name === 'qtd') sugerirValor(form);
  if (el.name === 'procedimento') {
    const t = el.value.trim().toLowerCase(), conhecido = nomesProc().some(n => n.toLowerCase() === t);
    form.querySelectorAll('[data-acao="proc"]').forEach(c => c.classList.toggle('on', c.dataset.v ? c.dataset.v.toLowerCase() === t : !conhecido));
    sugerirValor(form);
  }
});
// Foto escolhida (câmera ou galeria)
document.addEventListener('change', e => {
  const el = e.target; if (!el.dataset || !el.dataset.foto || !el.files || !el.files[0]) return;
  const arq = el.files[0]; el.value = ''; toast('Enviando foto...');
  trocarFoto(el.dataset.foto, el.dataset.id, arq);
});
// Anamnese: abre o campo de detalhe ("Qual?"), faz "Nenhuma" desmarcar as outras e guarda as respostas
document.addEventListener('change', e => {
  const el = e.target, form = el.closest('form[data-form="anamnese"]'); if (!form || !el.name) return;
  if (el.type === 'checkbox' && el.name !== 'consentimento' && el.checked) {
    form.querySelectorAll(`input[type="checkbox"][name="${el.name}"]`).forEach(c => { if (c !== el && (el.value === 'Nenhuma' || c.value === 'Nenhuma')) c.checked = false; });
  }
  if (el.type === 'radio' && el.dataset.abre !== undefined) { const c = form.querySelector(`[data-cond="${el.name}"]`); if (c) c.hidden = el.value !== el.dataset.abre; }
  if (st.anam) Object.assign(st.anam.r, lerResp(form));
});

document.addEventListener('submit', async e => {
  const form = e.target.closest('form[data-form]'); if (!form) return;
  e.preventDefault();
  const btn = form.querySelector('[type="submit"]'); btn.disabled = true;
  try { await enviarForm(form.dataset.form, form); } finally { if (document.body.contains(btn)) btn.disabled = false; }
});

async function enviarForm(tipo, form) {
  const v = n => (form.elements[n] ? form.elements[n].value.trim() : '');
  if (tipo === 'login') {
    st.erroLogin = '';
    const { data, error } = await sb.auth.signInWithPassword({ email: v('email'), password: form.elements.senha.value });
    if (error) { st.erroLogin = 'E-mail ou senha incorretos.'; return render(); }
    return entrar(data.user);
  }
  if (tipo === 'nova-senha' || tipo === 'trocar-senha') {
    if (form.elements.s1.value !== form.elements.s2.value) return toast('As senhas não são iguais.');
    const { error } = await sb.auth.updateUser({ password: form.elements.s1.value });
    if (error) return toast('Não foi possível trocar a senha.');
    toast('Senha atualizada.'); form.reset();
    if (tipo === 'nova-senha') { st.recuperando = false; const { data } = await sb.auth.getSession(); if (data.session) return entrar(data.session.user); render(); }
    return;
  }
  if (tipo === 'nova-paciente') {
    const tel = telDigitos(v('telefone'));
    if (tel.length < 10 || tel.length > 13) return toast('Confira o telefone, com DDD.');
    const nasc = v('nascimento') ? lerNasc(v('nascimento')) : null;
    if (v('nascimento') && !nasc) return toast('Confira a data de nascimento (DD/MM/AAAA).');
    const idade = idadeDe({ data_nascimento: nasc });
    let novo = null;
    const ok = await salvar(async () => {
      const { data, error } = await sb.from('pacientes').insert({ nome: v('nome'), telefone: tel, data_nascimento: nasc, idade: idade > 0 ? idade : null, endereco: v('endereco') || null }).select('id').single();
      if (error) { if (error.code === '23505') { toast('Já existe uma paciente com esse telefone.'); throw Object.assign(error, { avisado: true }); } throw error; }
      novo = data;
    }, 'Paciente cadastrada.');
    if (!ok) return;
    fecharSheet();
    return ir(form.dataset.origem === 'plano' ? '#/novo-plano/' + novo.id : '#/paciente/' + novo.id);
  }
  if (tipo === 'novo-plano') {
    const pac = v('paciente'), proc = v('procedimento'), qtd = parseInt(v('qtd'), 10);
    if (!pac) return toast('Escolha a paciente.');
    if (!proc) return toast('Escreva o procedimento.');
    if (!(qtd >= 1 && qtd <= 50)) return toast('Número de sessões entre 1 e 50.');
    const valor = lerValor(v('valor'));
    let novo = null;
    const ok = await salvar(async () => {
      const { data, error } = await sb.from('planos').insert({ paciente_id: pac, procedimento: proc, total_sessoes: qtd, valor }).select('id').single();
      if (error) throw error; novo = data;
      if (v('dia')) { const r = await sb.from('sessoes').update({ data_hora: paraISO(v('dia'), v('hora')), status: 'agendada' }).eq('plano_id', data.id).eq('numero', 1); if (r.error) throw r.error; }
      const pf = st.prefill && st.prefill.pedido.paciente_id === pac ? st.prefill : null;
      if (pf) { const quando = v('dia') ? paraISO(v('dia'), v('hora')) : null; await upd('pedidos_horario', { status: quando === new Date(pf.pedido.data_hora).toISOString() ? 'confirmado' : 'alterado', respondido_em: new Date().toISOString(), plano_id: data.id }, pf.pedido.id); }
    }, 'Plano criado.');
    if (!ok) return;
    const pf = st.prefill && st.prefill.pedido.paciente_id === pac ? st.prefill : null;
    st.prefill = null;
    ir('#/plano/' + novo.id);
    if (pf && v('dia')) { const quando = paraISO(v('dia'), v('hora')), igual = quando === new Date(pf.pedido.data_hora).toISOString(); setTimeout(() => avisoCliente(st.planos.find(x => x.id === novo.id), 1, quando, igual ? null : pf.pedido.data_hora), 50); }
    return;
  }
  if (tipo === 'anamnese') {
    const A = st.anam; Object.assign(A.r, lerResp(form)); const r = A.r, p = paciente(form.dataset.id);
    if (!A.servicos.length) return toast('Escolha pelo menos um serviço.');
    if (!form.elements.consentimento.checked) return toast('A cliente precisa aceitar o termo de consentimento.');
    if (!v('assinatura')) return toast('Digite o nome da cliente como assinatura.');
    const servs = SERVICOS.filter(s => A.servicos.includes(s.id)), blocos = blocosServ();
    const pontos = pontosResp([...FICHA_GERAL, ...blocos.flatMap(b => b.perguntas)], r);
    const peso = parseFloat(r.peso), alt = parseFloat(r.altura);
    let imc = ''; if (peso > 0 && alt > 0) { const n = peso / ((alt / 100) ** 2); imc = n.toFixed(1) + ' — ' + (n < 18.5 ? 'Abaixo do peso' : n < 25 ? 'Peso normal' : n < 30 ? 'Sobrepeso' : n < 35 ? 'Obesidade I' : n < 40 ? 'Obesidade II' : 'Obesidade III'); }
    const resumo = [
      { titulo: 'Atenção', destaque: true, linhas: pontos.length ? pontos.map(x => [x.pergunta, x.resposta]) : [['Nenhum ponto de atenção informado', '']] },
      { titulo: 'Serviços', linhas: [['Serviços escolhidos', servs.map(s => s.nome).join(', ')]] },
      { titulo: 'Dados Pessoais', linhas: [['Nome completo', p.nome], ['Data de nascimento', p.data_nascimento ? `${nascBR(p.data_nascimento)} (${idadeDe(p)} anos)` : (p.idade ? `${p.idade} anos` : '—')], ['Telefone / WhatsApp', fTel(p.telefone)],
        ...(peso > 0 ? [['Peso', peso + ' kg']] : []), ...(alt > 0 ? [['Altura', alt + ' cm']] : []), ...(imc ? [['IMC', imc]] : [])] },
      { titulo: 'Ficha Geral de Saúde', linhas: FICHA_GERAL.flatMap(q => linhasResp(q, r)) },
      ...blocos.map(b => ({ titulo: b.servico.nome, linhas: b.perguntas.flatMap(q => linhasResp(q, r)) })),
      { titulo: 'Termo de Consentimento', linhas: [['Declaração e consentimento (LGPD)', 'Aceito'], ['Assinatura', v('assinatura')], ['Data', new Date().toLocaleString('pt-BR')], ['Preenchida no app por', st.membro.nome]] },
    ].map(s => ({ destaque: false, ...s }));
    const ok = await salvar(async () => {
      const { error } = await sb.from('anamneses').insert({ paciente_id: p.id, servicos: servs.map(s => s.nome), respostas: { ...r, origem: 'app' }, resumo, pontos_atencao: pontos, consentimento: true, assinatura: v('assinatura') });
      if (error) throw error;
    }, 'Ficha salva.');
    if (ok) { st.anam = null; ir('#/paciente/' + p.id); }
    return;
  }
  if (tipo === 'pedido-mudar') {
    const ped = st.pedidos.find(x => x.id === form.dataset.id), pl = ped && st.planos.find(x => x.id === ped.plano_id), s = pl && info(pl).proxima;
    if (!s) return toast('Este plano não tem sessão para agendar.');
    if (!v('dia')) return toast('Escolha a nova data.');
    const nova = paraISO(v('dia'), v('hora'));
    if (await salvar(async () => {
      await upd('sessoes', { data_hora: nova, status: 'agendada' }, s.id);
      await upd('pedidos_horario', { status: 'alterado', respondido_em: new Date().toISOString() }, ped.id);
    })) avisoCliente(st.planos.find(x => x.id === pl.id), s.numero, nova, ped.data_hora);
    return;
  }
  if (tipo === 'feriado') {
    const dia = form.dataset.dia, nome = v('nome').replace(/\s+/g, ' ');
    if (nome.length < 2) return toast('Escreva o nome do feriado.');
    if (await salvar(async () => { const r = await sb.from('feriados').upsert({ dia, nome }, { onConflict: 'dia' }); if (r.error) throw r.error; }, 'Feriado salvo.')) { st.hor.sel = null; fecharSheet(); render(); }
    return;
  }
  if (tipo === 'meu-nome') {
    const nome = v('nome').replace(/\s+/g, ' ');
    if (nome.length < 2) return toast('Escreva seu nome.');
    if (await salvar(async () => { const r = await sb.from('equipe').update({ nome }).eq('user_id', st.user.id); if (r.error) throw r.error; st.membro.nome = nome; }, 'Nome atualizado.')) render();
    return;
  }
  if (tipo === 'proc') {
    const nome = v('nome').replace(/\s+/g, ' '), valor = lerValor(v('valor')), id = form.dataset.id;
    const sel = form.querySelector('input[name="duracao"]:checked'), duracao_min = sel ? Number(sel.value) : 60;
    if (nome.length < 2) return toast('Escreva o nome do procedimento.');
    if (await salvar(async () => {
      const r = id ? await sb.from('procedimentos').update({ nome, valor, duracao_min, atualizado_em: new Date().toISOString() }).eq('id', id) : await sb.from('procedimentos').insert({ nome, valor, duracao_min });
      if (r.error) { if (r.error.code === '23505') { toast('Já existe um procedimento com esse nome.'); throw Object.assign(r.error, { avisado: true }); } throw r.error; }
    }, id ? 'Procedimento atualizado.' : 'Procedimento cadastrado.')) { fecharSheet(); render(); }
    return;
  }
  if (tipo === 'sessao') {
    const s = st.planos.flatMap(p => p.sessoes).find(x => x.id === form.dataset.id), ok = s.status === 'concluida';
    const vals = { observacao: v('obs') || null, data_hora: v('dia') ? paraISO(v('dia'), v('hora')) : (ok ? s.data_hora : null) };
    if (!ok) vals.status = v('dia') ? 'agendada' : 'pendente';
    if (await salvar(() => upd('sessoes', vals, form.dataset.id), 'Sessão atualizada.')) { fecharSheet(); render(); }
    return;
  }
  if (tipo === 'editar-plano') {
    const pl = st.planos.find(p => p.id === form.dataset.id), novo = parseInt(v('qtd'), 10), feitas = info(pl).feitas;
    if (!v('procedimento')) return toast('Escreva o procedimento.');
    if (!(novo >= Math.max(1, feitas) && novo <= 50)) return toast(`O número de sessões precisa ficar entre ${Math.max(1, feitas)} e 50.`);
    const valor = lerValor(v('valor'));
    if (await salvar(async () => {
      await upd('planos', { procedimento: v('procedimento'), valor }, pl.id);
      const dif = novo - pl.sessoes.length;
      if (dif > 0) {
        const r = await sb.from('sessoes').insert(Array.from({ length: dif }, (_, i) => ({ plano_id: pl.id, numero: 900 + i }))); if (r.error) throw r.error;
      } else if (dif < 0) {
        const tirar = pl.sessoes.filter(s => s.status !== 'concluida').sort((x, y) => y.numero - x.numero).slice(0, -dif).map(s => s.id);
        const r = await sb.from('sessoes').delete().in('id', tirar).neq('status', 'concluida'); if (r.error) throw r.error;
      }
      if (dif) { const a2 = await sb.rpc('ajustar_plano', { p_plano: pl.id }); if (a2.error) throw a2.error; }
    }, 'Plano atualizado.')) { fecharSheet(); render(); }
    return;
  }
  if (tipo === 'editar-paciente') {
    const tel = telDigitos(v('telefone'));
    if (tel.length < 10 || tel.length > 13) return toast('Confira o telefone, com DDD.');
    const nasc = v('nascimento') ? lerNasc(v('nascimento')) : null;
    if (v('nascimento') && !nasc) return toast('Confira a data de nascimento (DD/MM/AAAA).');
    const idade = idadeDe({ data_nascimento: nasc });
    if (await salvar(async () => {
      const { error } = await sb.from('pacientes').update({ nome: v('nome'), telefone: tel, data_nascimento: nasc, idade: idade > 0 ? idade : null, endereco: v('endereco') || null, atualizado_em: new Date().toISOString() }).eq('id', form.dataset.id);
      if (error) { if (error.code === '23505') { toast('Já existe outra paciente com esse telefone.'); throw Object.assign(error, { avisado: true }); } throw error; }
    }, 'Dados atualizados.')) { fecharSheet(); render(); }
    return;
  }
  if (tipo === 'concluir') {
    const sesId = form.dataset.id, falta = v('tipo') === 'falta', whats = form.elements.whats.checked;
    const pl = st.planos.find(p => p.sessoes.some(s => s.id === sesId)); const s = pl.sessoes.find(x => x.id === sesId);
    const prox = pl.sessoes.find(x => x.numero > s.numero && x.status !== 'concluida');
    const ok = await salvar(async () => {
      if (falta) {
        const obs = [s.observacao, `Faltou em ${fData(s.data_hora || new Date().toISOString())}`].filter(Boolean).join(' · ');
        await upd('sessoes', { observacao: obs, data_hora: v('dia') ? paraISO(v('dia'), v('hora')) : null, status: v('dia') ? 'agendada' : 'pendente' }, sesId);
      } else {
        await upd('sessoes', { status: 'concluida', concluida_em: new Date().toISOString(), data_hora: s.data_hora || new Date().toISOString() }, sesId);
        if (prox && v('dia')) await upd('sessoes', { data_hora: paraISO(v('dia'), v('hora')), status: 'agendada' }, prox.id);
        const restantes = pl.sessoes.filter(x => x.id !== sesId && x.status !== 'concluida').length;
        if (!restantes) await upd('planos', { status: 'finalizado' }, pl.id);
      }
    });
    if (!ok) return;
    render();
    const novo = st.planos.find(p => p.id === pl.id), pac = paciente(pl.paciente_id);
    abrirSheet(`<div style="display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:10px 0">
      <span class="dot d-ok" style="width:56px;height:56px;border-radius:28px">${I('check', 2.4)}</span>
      <h2 class="s" style="font-size:27px">${falta ? 'Falta registrada' : 'Sessão concluída'}</h2>
      <p class="ink2" style="font-size:14px">${falta ? 'A sessão continua no pacote da paciente.' : novo.status === 'finalizado' ? 'Pacote finalizado. Bom momento para oferecer a renovação.' : 'Cronograma atualizado.'}</p></div>
      ${whats ? `<a class="btn" href="${waLink(pac.telefone, mensagemPlano(novo))}" target="_blank" rel="noopener" data-acao="fechar">${I('wa')} Enviar atualização no WhatsApp</a>` : ''}
      <button class="btn ghost" data-acao="fechar">Fechar</button>`);
  }
}

/* ═══ INÍCIO ═══ */
sb.auth.onAuthStateChange((ev) => { if (ev === 'PASSWORD_RECOVERY') { st.recuperando = true; render(); } });
(async () => {
  const { data } = await sb.auth.getSession();
  if (data.session && !st.recuperando) await entrar(data.session.user); else render();
})();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
