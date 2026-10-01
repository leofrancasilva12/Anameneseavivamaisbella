/* ─── CARDÁPIO DE PERGUNTAS ───
   Para ajustar a anamnese, edite só este arquivo.

   FICHA_GERAL → perguntas que todas as clientes respondem.
   SERVICOS    → cada serviço com sua lista de perguntas.

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
     Só para 'sim-qual': detalhePlaceholder, detalheResumo, detalheLabel, detalheTipo ('numero'), mensagem,
                         opcoes (troca o Sim/Não) e abreEm (a opção que abre o detalhe; padrão 'Sim')

   Outros opcionais:
     tema      → (só na ficha geral) subtítulo da tela; perguntas do mesmo tema ficam juntas
     alerta    → true: resposta diferente de "Não" vai para o bloco ATENÇÃO no topo do resumo, WhatsApp e PDF
     opcional  → true: não entra no aviso de perguntas em branco

   "produtos: true" mostra o banner de produtos (retenção e sobrepeso).
*/

const SIM_NAO = ['Sim', 'Não'];

const FICHA_GERAL = [
  { id: 'tratamentoMedico', tema: 'Medicamentos e alergias', alerta: true, tipo: 'sim-qual', texto: 'Está em algum tratamento médico?', resumo: 'Tratamento médico',
    detalhePlaceholder: 'Qual tratamento?', detalheResumo: 'Qual tratamento' },
  { id: 'medicamentos', tema: 'Medicamentos e alergias', alerta: true, tipo: 'sim-qual', texto: 'Usa medicamentos contínuos? (anticoagulantes, anti-inflamatórios, hormônios, antidepressivos, diuréticos)', resumo: 'Medicamentos contínuos',
    detalhePlaceholder: 'Quais medicamentos?', detalheResumo: 'Quais medicamentos' },
  { id: 'alergias', tema: 'Medicamentos e alergias', alerta: true, tipo: 'sim-qual', texto: 'Tem alergia a medicamentos, cosméticos, óleos, cera ou látex?', resumo: 'Alergias',
    detalhePlaceholder: 'A que você tem alergia?', detalheResumo: 'Alergia a' },
  { id: 'gravidez', tema: 'Gestação, pressão e diabetes', alerta: true, tipo: 'sim-qual', texto: 'Está grávida, amamentando ou há suspeita de gravidez?', resumo: 'Gravidez / amamentação',
    opcoes: ['Não', 'Estou grávida', 'Estou amamentando', 'Suspeita de gravidez'], abreEm: 'Estou grávida',
    mensagem: 'Meus Parabéns 😍', detalheLabel: 'Quantos meses de gestação?', detalheTipo: 'numero',
    detalhePlaceholder: 'Ex: 3', detalheResumo: 'Meses de gestação' },
  { id: 'pressaoArterial', tema: 'Gestação, pressão e diabetes', alerta: true, tipo: 'escolha', texto: 'Tem pressão alta ou baixa?', resumo: 'Pressão arterial',
    opcoes: ['Não', 'Pressão alta', 'Pressão baixa'] },
  { id: 'diabetes', tema: 'Gestação, pressão e diabetes', alerta: true, tipo: 'escolha', texto: 'Tem diabetes?', resumo: 'Diabetes', opcoes: SIM_NAO },
  { id: 'cardiaco', tema: 'Coração, circulação e órgãos', alerta: true, tipo: 'sim-qual', texto: 'Tem problemas cardíacos ou usa marcapasso?', resumo: 'Problema cardíaco / marcapasso',
    detalhePlaceholder: 'Qual? Informe se usa marcapasso.', detalheResumo: 'Detalhe cardíaco' },
  { id: 'tromboseVarizes', tema: 'Coração, circulação e órgãos', alerta: true, tipo: 'sim-qual', texto: 'Já teve trombose, embolia ou tem varizes?', resumo: 'Trombose / embolia / varizes',
    detalhePlaceholder: 'Qual e quando?', detalheResumo: 'Detalhe' },
  { id: 'renalHepatico', tema: 'Coração, circulação e órgãos', alerta: true, tipo: 'sim-qual', texto: 'Tem problemas renais ou hepáticos?', resumo: 'Problema renal / hepático',
    detalhePlaceholder: 'Qual?', detalheResumo: 'Qual problema' },
  { id: 'epilepsia', tema: 'Outras condições', alerta: true, tipo: 'escolha', texto: 'Tem epilepsia ou já teve convulsões?', resumo: 'Epilepsia / convulsões', opcoes: SIM_NAO },
  { id: 'cancer', tema: 'Outras condições', alerta: true, tipo: 'sim-qual', texto: 'Tem ou já teve câncer? Está em tratamento?', resumo: 'Câncer',
    detalhePlaceholder: 'Qual tipo, quando, e se está em tratamento', detalheResumo: 'Detalhe' },
  { id: 'doencaPele', tema: 'Outras condições', alerta: true, tipo: 'sim-qual', texto: 'Tem alguma doença de pele? (psoríase, dermatite, vitiligo, herpes)', resumo: 'Doença de pele',
    detalhePlaceholder: 'Qual?', detalheResumo: 'Qual doença' },
  { id: 'cirurgia6meses', tema: 'Cirurgias e implantes', alerta: true, tipo: 'sim-qual', texto: 'Fez alguma cirurgia nos últimos 6 meses?', resumo: 'Cirurgia nos últimos 6 meses',
    detalhePlaceholder: 'Qual cirurgia e quando?', detalheResumo: 'Qual cirurgia' },
  { id: 'proteseMetal', tema: 'Cirurgias e implantes', alerta: true, tipo: 'sim-qual', texto: 'Possui prótese, implante, placa ou pino metálico?', resumo: 'Prótese / implante / metal',
    detalhePlaceholder: 'Qual e em que região?', detalheResumo: 'Qual e onde' },
  { id: 'alteracaoHormonal', tema: 'Hormônios', tipo: 'sim-qual', texto: 'Tem alteração hormonal? (tireoide, ovário policístico)', resumo: 'Alteração hormonal',
    detalhePlaceholder: 'Qual?', detalheResumo: 'Qual alteração' },
  { id: 'anticoncepcional', tema: 'Hormônios', tipo: 'escolha', texto: 'Usa anticoncepcional?', resumo: 'Anticoncepcional', opcoes: SIM_NAO },
  { id: 'cicloRegular', tema: 'Hormônios', tipo: 'escolha', texto: 'Seu ciclo menstrual é regular?', resumo: 'Ciclo menstrual regular',
    opcoes: ['Sim', 'Não', 'Não menstruo'] },
  { id: 'fuma', tema: 'Hábitos', tipo: 'escolha', texto: 'Fuma? Com que frequência?', resumo: 'Fuma',
    opcoes: ['Não fumo', 'Ocasionalmente', 'Diariamente'] },
  { id: 'alcool', tema: 'Hábitos', tipo: 'escolha', texto: 'Consome bebida alcoólica? Com que frequência?', resumo: 'Bebida alcoólica',
    opcoes: ['Não bebo', 'Socialmente', 'Frequentemente'] },
  { id: 'aguaDia', tema: 'Hábitos', tipo: 'escolha', texto: 'Quanto de água bebe por dia?', resumo: 'Água por dia',
    opcoes: ['Menos de 1 litro', '1 a 2 litros', 'Mais de 2 litros'] },
  { id: 'atividadeFisica', tema: 'Bem-estar', tipo: 'sim-qual', texto: 'Pratica atividade física?', resumo: 'Atividade física',
    detalhePlaceholder: 'Qual e quantas vezes por semana?', detalheResumo: 'Qual e frequência' },
  { id: 'sono', tema: 'Bem-estar', tipo: 'escolha', texto: 'Como avalia seu sono?', resumo: 'Sono', opcoes: ['Bom', 'Regular', 'Ruim'] },
  { id: 'estresse', tema: 'Bem-estar', tipo: 'escolha', texto: 'Como avalia seu nível de estresse?', resumo: 'Nível de estresse', opcoes: ['Baixo', 'Médio', 'Alto'] },
];

const SERVICOS = [
  {
    id: 'limpeza',
    nome: 'Limpeza de Pele',
    descricao: 'Pele limpa, renovada e sem impurezas',
    perguntas: [
      { id: 'tipoPele', tipo: 'escolha', texto: 'Como você descreve sua pele?', resumo: 'Tipo de pele',
        opcoes: ['Oleosa', 'Seca', 'Mista', 'Normal', 'Sensível'] },
      { id: 'acidos6meses', alerta: true, tipo: 'sim-qual', texto: 'Usa ou usou nos últimos 6 meses ácidos, retinoico ou isotretinoína (Roacutan)?', resumo: 'Ácidos / retinoico / Roacutan (6 meses)',
        detalhePlaceholder: 'Qual e quando?', detalheResumo: 'Qual e quando' },
      { id: 'peelingLaser', alerta: true, tipo: 'sim-qual', texto: 'Fez peeling, laser ou microagulhamento recentemente?', resumo: 'Peeling / laser / microagulhamento',
        detalhePlaceholder: 'Qual e quando?', detalheResumo: 'Qual e quando' },
      { id: 'preenchimentoToxina', alerta: true, tipo: 'sim-qual', texto: 'Fez preenchimento ou aplicação de toxina botulínica recente?', resumo: 'Preenchimento / toxina botulínica',
        detalhePlaceholder: 'Qual e quando?', detalheResumo: 'Qual e quando' },
      { id: 'acne', tipo: 'escolha', texto: 'Tem acne? Com que frequência aparecem espinhas?', resumo: 'Acne / frequência de espinhas',
        opcoes: ['Não tenho', 'Raramente', 'Às vezes', 'Com frequência'] },
      { id: 'manchasMelasma', tipo: 'escolha', texto: 'Tem manchas ou melasma?', resumo: 'Manchas / melasma',
        opcoes: ['Não', 'Manchas', 'Melasma', 'Os dois'] },
      { id: 'peleIrritavel', tipo: 'escolha', texto: 'Sua pele fica vermelha ou irritada com facilidade?', resumo: 'Pele irrita com facilidade', opcoes: SIM_NAO },
      { id: 'herpesLabial', alerta: true, tipo: 'escolha', texto: 'Tem herpes labial recorrente?', resumo: 'Herpes labial recorrente', opcoes: SIM_NAO },
      { id: 'protetorSolar', tipo: 'escolha', texto: 'Usa protetor solar diariamente?', resumo: 'Protetor solar diário',
        opcoes: ['Sim', 'Às vezes', 'Não'] },
      { id: 'exposicaoSol', tipo: 'escolha', texto: 'Se expõe ao sol com frequência?', resumo: 'Exposição frequente ao sol',
        opcoes: ['Sim', 'Às vezes', 'Não'] },
      { id: 'rotinaPele', tipo: 'texto-longo', texto: 'Qual é sua rotina de cuidados com a pele?', resumo: 'Rotina de cuidados',
        placeholder: 'Ex: sabonete, hidratante, sérum...' },
      { id: 'maquiagem', tipo: 'escolha', texto: 'Usa maquiagem todos os dias?', resumo: 'Maquiagem diária',
        opcoes: ['Sim', 'Às vezes', 'Não'] },
      { id: 'limpezaAntes', tipo: 'sim-qual', texto: 'Já fez limpeza de pele antes?', resumo: 'Já fez limpeza de pele',
        detalheLabel: 'Teve alguma reação?', detalhePlaceholder: 'Descreva a reação ou escreva "nenhuma"', detalheResumo: 'Reação anterior' },
      { id: 'incomodoPele', tipo: 'texto-longo', texto: 'O que mais te incomoda na sua pele hoje?', resumo: 'Maior incômodo na pele',
        placeholder: 'Conte com suas palavras...' },
    ],
  },
  {
    id: 'modeladora',
    nome: 'Massagem Modeladora',
    descricao: 'Contorno corporal e redução de medidas',
    produtos: true,
    perguntas: [
      { id: 'regioesModelar', tipo: 'multipla', texto: 'Quais regiões deseja trabalhar?', resumo: 'Regiões a trabalhar',
        opcoes: ['Abdome', 'Flancos', 'Coxas', 'Glúteos', 'Braços', 'Costas'] },
      { id: 'incomodoCorporal', tipo: 'multipla', texto: 'Qual seu principal incômodo?', resumo: 'Principal incômodo',
        opcoes: ['Gordura localizada', 'Celulite', 'Flacidez'] },
      { id: 'variacaoPeso', tipo: 'sim-qual', texto: 'Teve variação de peso recente?', resumo: 'Variação de peso recente',
        detalhePlaceholder: 'Quantos kg e em quanto tempo?', detalheResumo: 'Quanto e em quanto tempo' },
      { id: 'plasticaRegiao', alerta: true, tipo: 'sim-qual', texto: 'Fez cirurgia plástica na região a ser tratada?', resumo: 'Plástica na região',
        detalhePlaceholder: 'Qual cirurgia e quando?', detalheResumo: 'Qual e quando' },
      { id: 'herniaAbdominal', alerta: true, tipo: 'escolha', texto: 'Tem hérnia abdominal ou umbilical?', resumo: 'Hérnia abdominal / umbilical', opcoes: SIM_NAO },
      { id: 'diu', alerta: true, tipo: 'escolha', texto: 'Usa DIU?', resumo: 'Usa DIU', opcoes: SIM_NAO },
      { id: 'varizesArea', alerta: true, tipo: 'escolha', texto: 'Tem varizes ou vasinhos nas áreas a trabalhar?', resumo: 'Varizes / vasinhos na área', opcoes: SIM_NAO },
      { id: 'hematomas', alerta: true, tipo: 'escolha', texto: 'Fica com hematomas facilmente?', resumo: 'Hematomas com facilidade', opcoes: SIM_NAO },
      { id: 'toleranciaPressao', tipo: 'escolha', texto: 'Como é sua tolerância a pressão e dor?', resumo: 'Tolerância a pressão e dor',
        opcoes: ['Baixa', 'Média', 'Alta'] },
      { id: 'modeladoraAntes', tipo: 'sim-qual', texto: 'Já fez massagem modeladora antes?', resumo: 'Já fez modeladora',
        detalheLabel: 'Como foi o resultado?', detalhePlaceholder: 'Conte como foi...', detalheResumo: 'Resultado anterior' },
    ],
  },
  {
    id: 'drenagem',
    nome: 'Drenagem Linfática',
    descricao: 'Menos inchaço e retenção de líquidos',
    produtos: true,
    perguntas: [
      { id: 'objetivoDrenagem', tipo: 'multipla', texto: 'Qual seu objetivo?', resumo: 'Objetivo',
        opcoes: ['Pós-operatório', 'Retenção de líquido', 'Gestação', 'Estética'] },
      { id: 'posOperatorio', opcional: true, tipo: 'texto-longo', texto: 'Se pós-operatório: qual cirurgia, em que data, e tem liberação médica?', resumo: 'Pós-operatório',
        placeholder: 'Deixe em branco se não for pós-operatório' },
      { id: 'inchacoPernas', tipo: 'sim-qual', texto: 'Sente inchaço nas pernas ou pés?', resumo: 'Inchaço nas pernas / pés',
        detalheLabel: 'Em que período do dia piora?', detalhePlaceholder: 'Ex: no fim da tarde', detalheResumo: 'Período em que piora' },
      { id: 'tromboseDor', alerta: true, tipo: 'escolha', texto: 'Já teve trombose ou está com dor na panturrilha?', resumo: 'Trombose / dor na panturrilha', opcoes: SIM_NAO },
      { id: 'insuficiencia', alerta: true, tipo: 'escolha', texto: 'Tem insuficiência cardíaca ou renal?', resumo: 'Insuficiência cardíaca / renal', opcoes: SIM_NAO },
      { id: 'febreInfeccao', alerta: true, tipo: 'escolha', texto: 'Está com febre, infecção ou inflamação ativa?', resumo: 'Febre / infecção / inflamação', opcoes: SIM_NAO },
      { id: 'linfonodos', alerta: true, tipo: 'escolha', texto: 'Já retirou linfonodos ou tem linfedema?', resumo: 'Linfonodos retirados / linfedema', opcoes: SIM_NAO },
      { id: 'diuretico', alerta: true, tipo: 'escolha', texto: 'Usa diurético?', resumo: 'Usa diurético', opcoes: SIM_NAO },
      { id: 'hematomas', alerta: true, tipo: 'escolha', texto: 'Fica com hematomas facilmente?', resumo: 'Hematomas com facilidade', opcoes: SIM_NAO },
      { id: 'retencaoMenstrual', tipo: 'escolha', texto: 'Sente mais retenção no período menstrual?', resumo: 'Retenção no período menstrual',
        opcoes: ['Sim', 'Não', 'Não menstruo'] },
    ],
  },
  {
    id: 'relaxante',
    nome: 'Massagem Relaxante',
    descricao: 'Alívio do estresse e das tensões',
    perguntas: [
      { id: 'motivoRelaxante', tipo: 'multipla', texto: 'O que te trouxe aqui?', resumo: 'Motivo',
        opcoes: ['Estresse', 'Dores', 'Insônia', 'Tensão'] },
      { id: 'regiaoTensao', tipo: 'multipla', texto: 'Onde sente mais dor ou tensão?', resumo: 'Regiões de dor / tensão',
        opcoes: ['Pescoço', 'Ombros', 'Costas', 'Lombar', 'Pernas', 'Pés'] },
      { id: 'regiaoEvitar', opcional: true, tipo: 'texto', texto: 'Tem alguma região que prefere que não seja tocada?', resumo: 'Região a evitar',
        placeholder: 'Deixe em branco se não houver' },
      { id: 'pressaoMassagem', tipo: 'escolha', texto: 'Qual pressão prefere?', resumo: 'Pressão preferida',
        opcoes: ['Leve', 'Média', 'Firme'] },
      { id: 'colunaLesao', alerta: true, tipo: 'sim-qual', texto: 'Tem lesão muscular, hérnia de disco ou problema na coluna?', resumo: 'Lesão / hérnia / coluna',
        detalhePlaceholder: 'Qual?', detalheResumo: 'Qual' },
      { id: 'sensibilidadeAromas', alerta: true, tipo: 'sim-qual', texto: 'Tem alergia ou sensibilidade a óleos e aromas?', resumo: 'Sensibilidade a óleos / aromas',
        detalhePlaceholder: 'A quais?', detalheResumo: 'Quais' },
      { id: 'desconfortoPosicao', tipo: 'sim-qual', texto: 'Sente desconforto em alguma posição, como deitar de bruços?', resumo: 'Desconforto em posição',
        detalhePlaceholder: 'Qual posição?', detalheResumo: 'Qual posição' },
      { id: 'ambienteSessao', tipo: 'escolha', texto: 'Prefere conversar, silêncio ou música durante a sessão?', resumo: 'Preferência na sessão',
        opcoes: ['Conversar', 'Silêncio', 'Música'] },
    ],
  },
  {
    id: 'miofascial',
    nome: 'Liberação Miofascial',
    descricao: 'Alívio de dores e rigidez muscular',
    perguntas: [
      { id: 'localDor', tipo: 'multipla', texto: 'Onde sente dor?', resumo: 'Locais de dor',
        opcoes: ['Pescoço', 'Ombros', 'Costas', 'Lombar', 'Quadril', 'Braços', 'Pernas', 'Pés'] },
      { id: 'tempoDor', tipo: 'escolha', texto: 'Há quanto tempo sente essa dor?', resumo: 'Tempo de dor',
        opcoes: ['Menos de 1 mês', '1 a 6 meses', 'Mais de 6 meses'] },
      { id: 'intensidadeDor', tipo: 'escolha', texto: 'De 0 a 10, qual a intensidade da dor?', resumo: 'Intensidade da dor (0–10)',
        opcoes: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
      { id: 'pioraAlivia', tipo: 'texto-longo', texto: 'O que piora ou alivia a dor?', resumo: 'O que piora / alivia',
        placeholder: 'Ex: piora sentada, alivia com calor...' },
      { id: 'diagnosticoOrto', tipo: 'sim-qual', texto: 'Tem diagnóstico ortopédico ou faz fisioterapia?', resumo: 'Diagnóstico ortopédico / fisioterapia',
        detalhePlaceholder: 'Qual?', detalheResumo: 'Qual' },
      { id: 'lesaoRecente', alerta: true, tipo: 'sim-qual', texto: 'Teve lesão, fratura ou entorse recente?', resumo: 'Lesão / fratura / entorse recente',
        detalhePlaceholder: 'Qual e quando?', detalheResumo: 'Qual e quando' },
      { id: 'osteoporose', alerta: true, tipo: 'escolha', texto: 'Tem osteoporose?', resumo: 'Osteoporose', opcoes: SIM_NAO },
      { id: 'herniaDisco', alerta: true, tipo: 'escolha', texto: 'Tem hérnia de disco ou bico de papagaio?', resumo: 'Hérnia de disco / bico de papagaio', opcoes: SIM_NAO },
      { id: 'fibromialgia', alerta: true, tipo: 'escolha', texto: 'Tem fibromialgia?', resumo: 'Fibromialgia', opcoes: SIM_NAO },
      { id: 'formigamento', alerta: true, tipo: 'sim-qual', texto: 'Sente formigamento ou dormência em alguma região?', resumo: 'Formigamento / dormência',
        detalhePlaceholder: 'Onde?', detalheResumo: 'Onde' },
      { id: 'posturaTrabalho', tipo: 'multipla', texto: 'Qual sua postura no trabalho?', resumo: 'Postura no trabalho',
        opcoes: ['Muito tempo sentada', 'Muito tempo em pé', 'Esforço físico'] },
      { id: 'toleranciaPressao', tipo: 'escolha', texto: 'Como é sua tolerância à dor e pressão?', resumo: 'Tolerância a pressão e dor',
        opcoes: ['Baixa', 'Média', 'Alta'] },
      { id: 'restricaoVentosa', alerta: true, tipo: 'sim-qual', texto: 'Tem restrição ao uso de ventosas ou instrumentos?', resumo: 'Restrição a ventosas / instrumentos',
        detalhePlaceholder: 'Qual restrição?', detalheResumo: 'Qual' },
    ],
  },
  {
    id: 'depilacao',
    nome: 'Depilação',
    descricao: 'Pele lisa e livre de pelos',
    perguntas: [
      { id: 'areasDepilar', tipo: 'multipla', texto: 'Quais áreas deseja depilar?', resumo: 'Áreas a depilar',
        opcoes: ['Axilas', 'Buço', 'Rosto', 'Braços', 'Pernas inteiras', 'Meia perna', 'Virilha simples', 'Virilha cavada', 'Virilha completa', 'Glúteos', 'Costas', 'Abdome'] },
      { id: 'metodoAtual', tipo: 'multipla', texto: 'Qual método usa hoje?', resumo: 'Método atual',
        opcoes: ['Cera', 'Lâmina', 'Creme', 'Laser'] },
      { id: 'ultimaDepilacao', tipo: 'escolha', texto: 'Quando foi sua última depilação?', resumo: 'Última depilação',
        opcoes: ['Menos de 15 dias', '15 a 30 dias', 'Mais de 30 dias'] },
      { id: 'pelosEncravados', tipo: 'escolha', texto: 'Tem pelos encravados ou foliculite?', resumo: 'Pelos encravados / foliculite', opcoes: SIM_NAO },
      { id: 'reacaoCera', alerta: true, tipo: 'sim-qual', texto: 'Já teve reação à cera? (vermelhidão, bolhas, manchas)', resumo: 'Reação à cera',
        detalhePlaceholder: 'Qual reação?', detalheResumo: 'Qual reação' },
      { id: 'acidosRegiao', alerta: true, tipo: 'escolha', texto: 'Usa ácidos ou retinoides na região?', resumo: 'Ácidos / retinoides na região', opcoes: SIM_NAO },
      { id: 'solRecente', alerta: true, tipo: 'escolha', texto: 'Tomou sol ou fez bronzeamento recentemente?', resumo: 'Sol / bronzeamento recente', opcoes: SIM_NAO },
      { id: 'varizesDepilar', alerta: true, tipo: 'escolha', texto: 'Tem varizes nas áreas a depilar?', resumo: 'Varizes nas áreas', opcoes: SIM_NAO },
      { id: 'feridasRegiao', alerta: true, tipo: 'sim-qual', texto: 'Tem feridas, cicatrizes recentes ou tatuagem nova na região?', resumo: 'Feridas / cicatrizes / tatuagem nova',
        detalhePlaceholder: 'O que e onde?', detalheResumo: 'O que e onde' },
      { id: 'menstruada', tipo: 'escolha', texto: 'Está menstruada? (a sensibilidade costuma aumentar)', resumo: 'Menstruada', opcoes: SIM_NAO },
    ],
  },
];
