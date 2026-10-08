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
                 'multipla'    pílulas, várias opções (use "opcoes"); a opção "Nenhuma" desmarca as outras
                 'sim-qual'    Sim/Não; no "Sim" abre um campo de detalhe
     Opcionais: placeholder, obrigatoria (true/false)
     Só para 'sim-qual': detalhePlaceholder, detalheResumo, detalheLabel, detalheTipo ('numero'), mensagem,
                         opcoes (troca o Sim/Não) e abreEm (a opção que abre o detalhe; padrão 'Sim')

   Outros opcionais:
     tema      → (só na ficha geral) subtítulo da tela; perguntas do mesmo tema ficam juntas
     alerta    → true: resposta diferente de "Não" (ou, nas de marcar várias, qualquer item exceto "Nenhuma")
                 vai para o bloco ATENÇÃO no topo do resumo, WhatsApp e PDF
     opcional  → true: não entra no aviso de perguntas em branco
     nota      → texto pequeno logo abaixo da pergunta (observação ou explicação das opções)
     semAtalho → true: a pergunta não conta para o botão "Nenhuma das anteriores"
     tipo 'lista'    → até "itens" campos curtos (padrão 3), ex.: "conte até 3 aspectos"
     outro (só em 'multipla') → texto do campo livre abaixo das opções, para "Outro"
     tema (nos serviços) → subtítulo; perguntas do mesmo tema ficam juntas, no máximo 3 por tela

   "produtos: true" mostra o banner de produtos (retenção e sobrepeso).
*/

const SIM_NAO = ['Sim', 'Não'];

const FICHA_GERAL = [
  { id: 'gravidez', tema: 'Gestação, medicamentos e alergias', alerta: true, tipo: 'sim-qual', texto: 'Está grávida, amamentando ou há suspeita de gravidez?', resumo: 'Gravidez / amamentação',
    opcoes: ['Não', 'Estou grávida', 'Estou amamentando', 'Suspeita de gravidez'], abreEm: 'Estou grávida',
    mensagem: 'Meus Parabéns 😍', detalheLabel: 'Quantos meses de gestação?', detalheTipo: 'numero',
    detalhePlaceholder: 'Ex: 3', detalheResumo: 'Meses de gestação' },
  { id: 'medicamentos', tema: 'Gestação, medicamentos e alergias', alerta: true, tipo: 'sim-qual', texto: 'Usa medicamentos contínuos?', resumo: 'Medicamentos contínuos',
    detalhePlaceholder: 'Quais? (ex: anticoagulante, anti-inflamatório, hormônio, antidepressivo, diurético)', detalheResumo: 'Quais medicamentos' },
  { id: 'alergias', tema: 'Gestação, medicamentos e alergias', alerta: true, tipo: 'sim-qual', texto: 'Tem alergia a medicamentos, cosméticos, óleos, cera ou látex?', resumo: 'Alergias',
    detalhePlaceholder: 'A que você tem alergia?', detalheResumo: 'Alergia a' },
  { id: 'condicoes', tema: 'Condições de saúde e cirurgias', alerta: true, tipo: 'multipla', texto: 'Tem alguma destas condições? Marque todas que se aplicam.', resumo: 'Condições de saúde',
    opcoes: ['Pressão alta', 'Pressão baixa', 'Diabetes', 'Problema cardíaco ou marcapasso', 'Trombose ou embolia', 'Varizes', 'Câncer', 'Epilepsia', 'Problema renal ou hepático', 'Doença de pele', 'Alteração hormonal', 'Nenhuma'] },
  { id: 'cirurgia6meses', tema: 'Condições de saúde e cirurgias', alerta: true, tipo: 'sim-qual', texto: 'Fez alguma cirurgia nos últimos 6 meses?', resumo: 'Cirurgia nos últimos 6 meses',
    detalhePlaceholder: 'Qual cirurgia e quando?', detalheResumo: 'Qual cirurgia' },
  { id: 'proteseMetal', tema: 'Condições de saúde e cirurgias', alerta: true, tipo: 'sim-qual', texto: 'Possui prótese, implante, placa ou pino metálico?', resumo: 'Prótese / implante / metal',
    detalhePlaceholder: 'Qual e em que região?', detalheResumo: 'Qual e onde' },
];

const SERVICOS = [
  {
    id: 'limpeza',
    nome: 'Limpeza de Pele',
    descricao: 'Pele limpa, renovada e sem impurezas',
    perguntas: [
      { id: 'tipoPele', tipo: 'escolha', texto: 'Como você descreve sua pele?', resumo: 'Tipo de pele',
        opcoes: ['Oleosa', 'Seca', 'Mista', 'Normal', 'Sensível'] },
      { id: 'queixasPele', tipo: 'multipla', texto: 'O que mais te incomoda na pele?', resumo: 'Queixas na pele',
        opcoes: ['Acne', 'Manchas ou melasma', 'Cravos', 'Oleosidade', 'Vermelhidão ou sensibilidade'] },
      { id: 'acidos6meses', alerta: true, tipo: 'sim-qual', texto: 'Usa ou usou nos últimos 6 meses ácidos, retinoico ou Roacutan (isotretinoína)?', resumo: 'Ácidos / retinoico / Roacutan (6 meses)',
        detalhePlaceholder: 'Qual e quando?', detalheResumo: 'Qual e quando' },
      { id: 'procedimentoFacial', alerta: true, tipo: 'sim-qual', texto: 'Fez peeling, laser, microagulhamento, preenchimento ou toxina botulínica recentemente?', resumo: 'Procedimento facial recente',
        detalhePlaceholder: 'Qual e quando?', detalheResumo: 'Qual e quando' },
      { id: 'herpesLabial', alerta: true, tipo: 'escolha', texto: 'Tem herpes labial recorrente?', resumo: 'Herpes labial recorrente', opcoes: SIM_NAO },
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
      { id: 'plasticaRegiao', alerta: true, tipo: 'sim-qual', texto: 'Fez cirurgia plástica na região a ser tratada?', resumo: 'Plástica na região',
        detalhePlaceholder: 'Qual cirurgia e quando?', detalheResumo: 'Qual e quando' },
      { id: 'restricoesModeladora', alerta: true, tipo: 'multipla', texto: 'Possui alguma destas?', resumo: 'Restrições',
        opcoes: ['Hérnia abdominal ou umbilical', 'DIU', 'Varizes na área', 'Hematomas com facilidade', 'Nenhuma'] },
    ],
  },
  {
    id: 'drenagem',
    nome: 'Drenagem Linfática',
    descricao: 'Menos inchaço e retenção de líquidos',
    produtos: true,
    perguntas: [
      // ── Histórico e experiência com drenagem linfática
      { id: 'linfedemaLipedema', tema: 'Histórico e experiência', alerta: true, tipo: 'escolha', texto: 'Você possui diagnóstico de linfedema ou lipedema?', resumo: 'Diagnóstico de linfedema / lipedema',
        opcoes: ['Sim, linfedema', 'Sim, lipedema', 'Sim, ambos', 'Não', 'Não sei informar'] },
      { id: 'orientacaoSinais', tema: 'Histórico e experiência', opcional: true, semAtalho: true, tipo: 'escolha',
        texto: 'Caso não possua diagnóstico, você gostaria de receber orientações sobre sinais que possam indicar a necessidade de uma avaliação profissional?',
        resumo: 'Quer orientações sobre sinais para avaliação', opcoes: SIM_NAO,
        nota: 'Importante: a drenagem linfática não substitui avaliação e diagnóstico médico.' },
      { id: 'drenagemAntes', tema: 'Histórico e experiência', semAtalho: true, tipo: 'escolha', texto: 'Você já realizou sessões de drenagem linfática anteriormente?', resumo: 'Já fez drenagem antes',
        opcoes: ['Sim, já realizei', 'Não, será minha primeira experiência'] },
      { id: 'gostouAntes', tema: 'Histórico e experiência', opcional: true, tipo: 'lista', itens: 3,
        texto: 'Se já realizou, conte-nos até 3 aspectos ou experiências que você mais gostou nas drenagens anteriores:', resumo: 'O que mais gostou' },
      { id: 'naoGostouAntes', tema: 'Histórico e experiência', opcional: true, tipo: 'lista', itens: 3,
        texto: 'Agora, conte-nos até 3 aspectos ou experiências que você não gostou ou que gostaria que fossem diferentes:', resumo: 'O que não gostou / mudaria' },

      // ── Cuidados de saúde
      { id: 'tromboseDor', tema: 'Cuidados de saúde', alerta: true, tipo: 'escolha', texto: 'Já teve trombose ou está com dor na panturrilha?', resumo: 'Trombose / dor na panturrilha', opcoes: SIM_NAO },
      { id: 'febreInfeccao', tema: 'Cuidados de saúde', alerta: true, tipo: 'escolha', texto: 'Está com febre, infecção ou inflamação ativa?', resumo: 'Febre / infecção / inflamação', opcoes: SIM_NAO },
      { id: 'linfonodos', tema: 'Cuidados de saúde', alerta: true, tipo: 'escolha', texto: 'Já retirou linfonodos?', resumo: 'Linfonodos retirados', opcoes: SIM_NAO },

      // ── Personalização da sua experiência
      { id: 'bioimpedancia', tema: 'Personalização da sua experiência', semAtalho: true, tipo: 'escolha', texto: 'Você gostaria de ganhar uma avaliação física por bioimpedância?', resumo: 'Quer avaliação por bioimpedância',
        opcoes: ['Sim, gostaria', 'Não, neste momento'] },
      { id: 'tipoCreme', tema: 'Personalização da sua experiência', tipo: 'escolha', texto: 'Durante sua sessão, qual tipo de creme você prefere?', resumo: 'Creme preferido',
        opcoes: ['Creme neutro', 'Creme com termoativador'],
        nota: 'Neutro: sem ação termoativadora. Termoativador: proporciona sensação de aquecimento durante a aplicação.' },
      { id: 'sensibilidadeCosmeticos', tema: 'Personalização da sua experiência', alerta: true, tipo: 'sim-qual',
        texto: 'Possui alguma sensibilidade, alergia ou preferência relacionada a produtos cosméticos?', resumo: 'Sensibilidade / preferência com cosméticos',
        opcoes: ['Não', 'Sim'], detalhePlaceholder: 'Qual?', detalheResumo: 'Qual sensibilidade / preferência' },
      { id: 'expectativaDrenagem', tema: 'Personalização da sua experiência', tipo: 'multipla', texto: 'O que você espera alcançar com a drenagem linfática?', resumo: 'O que espera alcançar',
        opcoes: ['Sensação de leveza', 'Redução da sensação de inchaço', 'Bem-estar e relaxamento', 'Cuidados corporais', 'Auxílio em cuidados pós-operatórios, mediante liberação profissional'],
        outro: 'Outro: escreva aqui (opcional)' },
      { id: 'posOperatorio', tema: 'Personalização da sua experiência', opcional: true, tipo: 'texto-longo', texto: 'Se for pós-operatório: qual cirurgia, em que data, e tem liberação médica?', resumo: 'Pós-operatório',
        placeholder: 'Deixe em branco se não for pós-operatório' },
      { id: 'experienciaPersonalizada', tema: 'Personalização da sua experiência', opcional: true, tipo: 'texto-longo',
        texto: 'Existe algo que você gostaria que eu soubesse para tornar sua experiência mais confortável e personalizada?', resumo: 'Para uma experiência mais confortável',
        placeholder: 'Escreva aqui, se quiser' },
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
      { id: 'pressaoMassagem', tipo: 'escolha', texto: 'Qual pressão prefere?', resumo: 'Pressão preferida',
        opcoes: ['Leve', 'Média', 'Firme'] },
      { id: 'colunaLesao', alerta: true, tipo: 'sim-qual', texto: 'Tem lesão muscular, hérnia de disco ou problema na coluna?', resumo: 'Lesão / hérnia / coluna',
        detalhePlaceholder: 'Qual?', detalheResumo: 'Qual' },
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
      { id: 'lesaoRecente', alerta: true, tipo: 'sim-qual', texto: 'Teve lesão, fratura ou entorse recente?', resumo: 'Lesão / fratura / entorse recente',
        detalhePlaceholder: 'Qual e quando?', detalheResumo: 'Qual e quando' },
      { id: 'restricoesMiofascial', alerta: true, tipo: 'multipla', texto: 'Possui alguma destas?', resumo: 'Restrições',
        opcoes: ['Osteoporose', 'Hérnia de disco', 'Fibromialgia', 'Formigamento ou dormência', 'Nenhuma'] },
    ],
  },
  {
    id: 'depilacao',
    nome: 'Depilação',
    descricao: 'Pele lisa e livre de pelos',
    perguntas: [
      { id: 'areasDepilar', tipo: 'multipla', texto: 'Quais áreas deseja depilar?', resumo: 'Áreas a depilar',
        opcoes: ['Axilas', 'Buço', 'Rosto', 'Braços', 'Pernas inteiras', 'Meia perna', 'Virilha simples', 'Virilha cavada', 'Virilha completa', 'Glúteos', 'Costas', 'Abdome'] },
      { id: 'ultimaDepilacao', tipo: 'escolha', texto: 'Quando foi sua última depilação?', resumo: 'Última depilação',
        opcoes: ['Menos de 15 dias', '15 a 30 dias', 'Mais de 30 dias'] },
      { id: 'reacaoCera', alerta: true, tipo: 'sim-qual', texto: 'Já teve reação à cera? (vermelhidão, bolhas, manchas)', resumo: 'Reação à cera',
        detalhePlaceholder: 'Qual reação?', detalheResumo: 'Qual reação' },
      { id: 'condicaoRegiao', alerta: true, tipo: 'multipla', texto: 'Na região a depilar, você tem:', resumo: 'Na região a depilar',
        opcoes: ['Feridas', 'Cicatriz recente', 'Tatuagem nova', 'Sol ou bronzeamento recente', 'Varizes', 'Pelos encravados', 'Nenhuma'] },
      { id: 'acidosRegiao', alerta: true, tipo: 'escolha', texto: 'Usa ácidos ou retinoides na região?', resumo: 'Ácidos / retinoides na região', opcoes: SIM_NAO },
    ],
  },
];
