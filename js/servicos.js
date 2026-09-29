/* ─── CARDÁPIO DE PERGUNTAS ───
   Para ajustar a anamnese, edite só este arquivo.

   Cada pergunta tem:
     id        → identificador único (sem espaço). Mesmo id em dois serviços = pergunta aparece uma vez só.
     texto     → a pergunta que a cliente vê.
     resumo    → rótulo curto usado no resumo e no WhatsApp.
     tipo      → 'texto'       caixa de uma linha
                 'texto-longo' caixa grande
                 'numero'      campo numérico
                 'escolha'     pílulas, uma opção só (use "opcoes")
                 'multipla'    pílulas, várias opções (use "opcoes")
                 'sim-qual'    Sim/Não; no "Sim" abre um campo de detalhe
     Opcionais: placeholder, obrigatoria (true/false)
     Só para 'sim-qual': detalhePlaceholder, detalheResumo, detalheLabel, detalheTipo ('numero'), mensagem

   Cada serviço tem três listas: objetivo, saude e contraindicacoes.
   "produtos: true" mostra o banner de produtos (retenção e sobrepeso).
*/

const SAUDE_COMUM = [
  { id: 'temProblema', tipo: 'sim-qual', texto: 'Você tem algum problema de saúde?', resumo: 'Problema de saúde',
    detalhePlaceholder: 'Descreva o problema de saúde...', detalheResumo: 'Qual problema' },
  { id: 'temMed', tipo: 'sim-qual', texto: 'Faz uso contínuo de medicamento?', resumo: 'Uso de medicamento',
    detalhePlaceholder: 'Qual medicamento?', detalheResumo: 'Qual medicamento' },
  { id: 'temAlergia', tipo: 'sim-qual', texto: 'Tem alergia a cremes, óleos ou cosméticos?', resumo: 'Alergia a cosméticos',
    detalhePlaceholder: 'Qual creme, óleo ou cosmético?', detalheResumo: 'Qual alergia' },
  { id: 'gravida', tipo: 'sim-qual', texto: 'Está grávida?', resumo: 'Gestante',
    mensagem: 'Meus Parabéns 😍', detalheLabel: 'Quantos meses de gestação?', detalheTipo: 'numero',
    detalhePlaceholder: 'Ex: 3', detalheResumo: 'Meses de gestação' },
];

const SERVICOS = [
  {
    id: 'limpeza',
    nome: 'Limpeza de Pele',
    descricao: 'Pele limpa, renovada e sem impurezas',
    objetivo: [
      { id: 'tipoPele', tipo: 'escolha', texto: 'Qual é o seu tipo de pele?', resumo: 'Tipo de pele',
        opcoes: ['Seca', 'Mista', 'Oleosa', 'Sensível', 'Não sei'] },
      { id: 'queixasPele', tipo: 'multipla', texto: 'Quais são suas principais queixas na pele?', resumo: 'Queixas na pele',
        opcoes: ['Acne', 'Cravos', 'Manchas', 'Poros dilatados', 'Oleosidade', 'Linhas finas'] },
      { id: 'fezLimpeza', tipo: 'escolha', texto: 'Já fez limpeza de pele antes?', resumo: 'Já fez limpeza de pele',
        opcoes: ['Sim', 'Não'] },
    ],
    saude: [
      { id: 'rotinaSkincare', tipo: 'sim-qual', texto: 'Tem uma rotina de cuidados com a pele (skincare)?', resumo: 'Rotina de skincare',
        detalhePlaceholder: 'Quais produtos você usa?', detalheResumo: 'Produtos da rotina' },
      { id: 'usaAcidos', tipo: 'sim-qual', texto: 'Usa ácidos, retinoides ou Roacutan (isotretinoína)?', resumo: 'Ácidos / retinoides / Roacutan',
        detalhePlaceholder: 'Qual e há quanto tempo?', detalheResumo: 'Qual e há quanto tempo' },
      { id: 'protetorSolar', tipo: 'escolha', texto: 'Usa protetor solar?', resumo: 'Protetor solar',
        opcoes: ['Todos os dias', 'Às vezes', 'Não uso'] },
      { id: 'exposicaoSol', tipo: 'escolha', texto: 'Como é sua exposição ao sol?', resumo: 'Exposição ao sol',
        opcoes: ['Pouca', 'Moderada', 'Muita'] },
    ],
    contraindicacoes: [
      { id: 'procedimentoFacial', tipo: 'sim-qual', texto: 'Fez peeling, laser ou outro procedimento facial recente?', resumo: 'Procedimento facial recente',
        detalhePlaceholder: 'Qual procedimento e quando?', detalheResumo: 'Qual e quando' },
      { id: 'lesoesFace', tipo: 'escolha', texto: 'Está com herpes labial ativa, feridas ou lesões no rosto?', resumo: 'Herpes / lesões no rosto',
        opcoes: ['Sim', 'Não'] },
    ],
  },
  {
    id: 'modeladora',
    nome: 'Massagem Modeladora',
    descricao: 'Contorno corporal e redução de medidas',
    produtos: true,
    objetivo: [
      { id: 'regiaoModelar', tipo: 'multipla', texto: 'Quais regiões você deseja modelar?', resumo: 'Regiões a modelar',
        opcoes: ['Abdome', 'Flancos', 'Coxas', 'Glúteos', 'Braços', 'Costas'] },
      { id: 'queixaCorporal', tipo: 'multipla', texto: 'Quais são suas principais queixas?', resumo: 'Queixas corporais',
        opcoes: ['Gordura localizada', 'Celulite', 'Flacidez', 'Retenção de líquido'] },
      { id: 'fezModeladora', tipo: 'escolha', texto: 'Já fez massagem modeladora antes?', resumo: 'Já fez modeladora',
        opcoes: ['Sim', 'Não'] },
    ],
    saude: [
      { id: 'atividadeFisica', tipo: 'escolha', texto: 'Pratica atividade física?', resumo: 'Atividade física',
        opcoes: ['Não pratico', '1 a 2x por semana', '3x ou mais por semana'] },
      { id: 'alimentacao', tipo: 'escolha', texto: 'Como você avalia sua alimentação?', resumo: 'Alimentação',
        opcoes: ['Boa', 'Regular', 'Ruim'] },
      { id: 'consumoAgua', tipo: 'escolha', texto: 'Você bebe muita ou pouca água?', resumo: 'Consumo de água',
        opcoes: ['Muita', 'Média', 'Pouca'] },
    ],
    contraindicacoes: [
      { id: 'varizes', tipo: 'escolha', texto: 'Tem varizes ou fragilidade capilar?', resumo: 'Varizes / fragilidade capilar',
        opcoes: ['Sim', 'Não'] },
      { id: 'hematomas', tipo: 'escolha', texto: 'Tem facilidade para formar hematomas (manchas roxas)?', resumo: 'Facilidade para hematomas',
        opcoes: ['Sim', 'Não'] },
      { id: 'cirurgia', tipo: 'sim-qual', texto: 'Já fez cirurgia recente (inclusive plástica)?', resumo: 'Cirurgia recente',
        detalhePlaceholder: 'Qual cirurgia e quando foi realizada?', detalheResumo: 'Qual cirurgia e quando' },
    ],
  },
  {
    id: 'drenagem',
    nome: 'Drenagem Linfática',
    descricao: 'Menos inchaço e retenção de líquidos',
    produtos: true,
    objetivo: [
      { id: 'regiao', tipo: 'multipla', texto: 'Em qual região você sente mais inchaço ou desconforto?', resumo: 'Regiões de inchaço',
        opcoes: ['Abdome', 'Pernas', 'Braços', 'Costas', 'Rosto', 'Outro'] },
      { id: 'fezDrenagem', tipo: 'escolha', texto: 'Já fez drenagem linfática antes?', resumo: 'Já fez drenagem',
        opcoes: ['Sim', 'Não'] },
    ],
    saude: [
      { id: 'freqUrinaria', tipo: 'escolha', texto: 'Como está sua frequência urinária?', resumo: 'Frequência urinária',
        opcoes: ['Ruim', 'Média', 'Boa'] },
      { id: 'consumoAgua', tipo: 'escolha', texto: 'Você bebe muita ou pouca água?', resumo: 'Consumo de água',
        opcoes: ['Muita', 'Média', 'Pouca'] },
    ],
    contraindicacoes: [
      { id: 'contraind', tipo: 'escolha', texto: 'Você está com febre, infecção, inflamação, trombose ou liberação médica pendente?', resumo: 'Febre / infecção / trombose',
        opcoes: ['Sim', 'Não'] },
      { id: 'cirurgia', tipo: 'sim-qual', texto: 'Já fez cirurgia recente (inclusive plástica)?', resumo: 'Cirurgia recente',
        detalhePlaceholder: 'Qual cirurgia e quando foi realizada?', detalheResumo: 'Qual cirurgia e quando' },
    ],
  },
  {
    id: 'relaxante',
    nome: 'Massagem Relaxante',
    descricao: 'Alívio do estresse e das tensões',
    objetivo: [
      { id: 'nivelEstresse', tipo: 'escolha', texto: 'Como está seu nível de estresse?', resumo: 'Nível de estresse',
        opcoes: ['Baixo', 'Médio', 'Alto'] },
      { id: 'qualidadeSono', tipo: 'escolha', texto: 'Como está a qualidade do seu sono?', resumo: 'Qualidade do sono',
        opcoes: ['Boa', 'Regular', 'Ruim'] },
      { id: 'regiaoTensao', tipo: 'multipla', texto: 'Em quais regiões você sente mais tensão?', resumo: 'Regiões de tensão',
        opcoes: ['Pescoço', 'Ombros', 'Costas', 'Lombar', 'Pernas', 'Pés'] },
      { id: 'pressaoMassagem', tipo: 'escolha', texto: 'Qual pressão você prefere na massagem?', resumo: 'Pressão preferida',
        opcoes: ['Leve', 'Média', 'Firme'] },
      { id: 'aromaPreferido', tipo: 'texto', texto: 'Tem preferência de aroma ou óleo?', resumo: 'Aroma / óleo preferido',
        placeholder: 'Ex: lavanda, sem cheiro...' },
    ],
    saude: [],
    contraindicacoes: [
      { id: 'lesaoRecente', tipo: 'sim-qual', texto: 'Tem alguma lesão ou dor recente?', resumo: 'Lesão ou dor recente',
        detalhePlaceholder: 'Onde e desde quando?', detalheResumo: 'Onde e desde quando' },
    ],
  },
  {
    id: 'miofascial',
    nome: 'Liberação Miofascial',
    descricao: 'Alívio de dores e rigidez muscular',
    objetivo: [
      { id: 'localDor', tipo: 'multipla', texto: 'Onde você sente dor ou rigidez?', resumo: 'Locais de dor / rigidez',
        opcoes: ['Pescoço', 'Ombros', 'Costas', 'Lombar', 'Quadril', 'Braços', 'Pernas', 'Pés'] },
      { id: 'tempoDor', tipo: 'escolha', texto: 'Há quanto tempo sente essa dor?', resumo: 'Tempo de dor',
        opcoes: ['Menos de 1 mês', '1 a 6 meses', 'Mais de 6 meses'] },
      { id: 'intensidadeDor', tipo: 'escolha', texto: 'Qual a intensidade da dor, de 0 (nenhuma) a 10 (máxima)?', resumo: 'Intensidade da dor (0–10)',
        opcoes: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
    ],
    saude: [
      { id: 'atividadeFisica', tipo: 'escolha', texto: 'Pratica atividade física?', resumo: 'Atividade física',
        opcoes: ['Não pratico', '1 a 2x por semana', '3x ou mais por semana'] },
    ],
    contraindicacoes: [
      { id: 'lesoesOsseas', tipo: 'sim-qual', texto: 'Tem lesões, hérnias ou fraturas?', resumo: 'Lesões / hérnias / fraturas',
        detalhePlaceholder: 'Quais e onde?', detalheResumo: 'Quais e onde' },
      { id: 'osteoporose', tipo: 'escolha', texto: 'Tem osteoporose?', resumo: 'Osteoporose',
        opcoes: ['Sim', 'Não'] },
      { id: 'anticoagulante', tipo: 'escolha', texto: 'Usa anticoagulante (remédio para afinar o sangue)?', resumo: 'Uso de anticoagulante',
        opcoes: ['Sim', 'Não'] },
    ],
  },
];
