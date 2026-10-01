/* OilSkill prototype – sample content (simulates WordPress CPTs + ACF fields + taxonomies).
   All organisations in opportunities/suppliers are FICTIONAL SAMPLE records.
   Project facts on the homepage summarise public operator information and must be
   verified/approved by OilSkill before launch. */
(function () {
  function d(n) { var x = new Date(); x.setUTCHours(8, 0, 0, 0); /* 10:00 CAT */ x.setDate(x.getDate() + n); return x.toISOString(); }
  function T(en, pt, fr) { return { en: en, pt: pt, fr: fr }; }

  var TAX = {
    sector: {
      upstream: T('Upstream E&P', 'Exploração e Produção', 'Exploration-production'),
      lng: T('LNG', 'GNL', 'GNL'),
      midstream: T('Pipelines & Midstream', 'Gasodutos e Midstream', 'Pipelines et midstream'),
      downstream: T('Downstream & Fuels', 'Downstream e Combustíveis', 'Aval et carburants'),
      services: T('Oilfield Services', 'Serviços Petrolíferos', 'Services pétroliers'),
      logistics: T('Logistics & Ports', 'Logística e Portos', 'Logistique et ports'),
      construction: T('Engineering & Construction', 'Engenharia e Construção', 'Ingénierie et construction'),
      hse: T('HSE & Environment', 'HSE e Ambiente', 'HSE et environnement'),
      local: T('Skills & Local Content', 'Competências e Conteúdo Local', 'Compétences et contenu local')
    },
    location: {
      'cabo-delgado': T('Cabo Delgado', 'Cabo Delgado', 'Cabo Delgado'),
      rovuma: T('Rovuma Basin (offshore)', 'Bacia do Rovuma (offshore)', 'Bassin de la Rovuma (offshore)'),
      inhambane: T('Inhambane', 'Inhambane', 'Inhambane'),
      maputo: T('Maputo', 'Maputo', 'Maputo'),
      sofala: T('Sofala (Beira)', 'Sofala (Beira)', 'Sofala (Beira)'),
      nampula: T('Nampula (Nacala)', 'Nampula (Nacala)', 'Nampula (Nacala)'),
      national: T('Mozambique (national)', 'Moçambique (nacional)', 'Mozambique (national)'),
      regional: T('Regional / International', 'Regional / Internacional', 'Régional / International')
    },
    intelCat: {
      market: T('Market analysis', 'Análise de mercado', 'Analyse de marché'),
      project: T('Project update', 'Atualização de projeto', 'Point projet'),
      regulatory: T('Regulatory & policy', 'Regulação e políticas', 'Réglementation et politiques'),
      supply: T('Supply chain', 'Cadeia de abastecimento', 'Chaîne d’approvisionnement'),
      skills: T('Skills & workforce', 'Competências e mão de obra', 'Compétences et main-d’œuvre')
    },
    reportType: {
      report: T('Report', 'Relatório', 'Rapport'),
      brief: T('Briefing note', 'Nota informativa', 'Note de synthèse'),
      guide: T('Guide', 'Guia', 'Guide'),
      dataset: T('Data snapshot', 'Resumo de dados', 'Données clés')
    },
    oppType: {
      tender: T('Tender', 'Concurso', 'Appel d’offres'),
      rfq: T('Request for quotation', 'Pedido de cotação', 'Demande de prix'),
      eoi: T('Expression of interest', 'Manifestação de interesse', 'Manifestation d’intérêt'),
      subcontract: T('Subcontract', 'Subcontratação', 'Sous-traitance'),
      partnership: T('Partnership', 'Parceria', 'Partenariat'),
      job: T('Recruitment', 'Recrutamento', 'Recrutement')
    },
    service: {
      logistics: T('Logistics & transport', 'Logística e transporte', 'Logistique et transport'),
      marine: T('Marine services', 'Serviços marítimos', 'Services maritimes'),
      catering: T('Catering & camp services', 'Catering e serviços de acampamento', 'Restauration et base-vie'),
      training: T('HSE training', 'Formação HSE', 'Formation HSE'),
      inspection: T('Inspection & NDT', 'Inspeção e END', 'Inspection et CND'),
      fabrication: T('Fabrication & engineering', 'Fabrico e engenharia', 'Fabrication et ingénierie'),
      fuel: T('Fuel supply & storage', 'Fornecimento e armazenamento de combustível', 'Approvisionnement et stockage de carburant'),
      environmental: T('Environmental consulting', 'Consultoria ambiental', 'Conseil environnemental'),
      telecom: T('IT & telecoms', 'TI e telecomunicações', 'Informatique et télécoms'),
      manpower: T('Manpower & recruitment', 'Mão de obra e recrutamento', 'Main-d’œuvre et recrutement'),
      equipment: T('Equipment & maintenance', 'Equipamento e manutenção', 'Équipement et maintenance')
    },
    newsCat: {
      industry: T('Industry', 'Indústria', 'Industrie'),
      oilskill: T('OilSkill updates', 'Novidades OilSkill', 'Nouvelles d’OilSkill'),
      policy: T('Policy', 'Políticas', 'Politiques'),
      events: T('Events', 'Eventos', 'Événements')
    },
    webCat: {
      procurement: T('Procurement', 'Aquisições', 'Achats'),
      local: T('Local content', 'Conteúdo local', 'Contenu local'),
      hse: T('HSE', 'HSE', 'HSE'),
      sector: T('Sector overview', 'Visão do setor', 'Panorama du secteur')
    }
  };

  var PLANS = [
    { id: 'free', name: T('Registered', 'Registado', 'Inscrit'), price: 0, cycle: null,
      features: [T('Free intelligence & news', 'Inteligência e notícias gratuitas', 'Veille et actualités gratuites'), T('Opportunity listings', 'Listagem de oportunidades', 'Liste des opportunités'), T('Public webinars', 'Webinars públicos', 'Webinaires publics'), T('Weekly briefing email', 'Resumo semanal por e-mail', 'Note hebdomadaire par e-mail')] },
    { id: 'pro_monthly', group: 'pro', name: T('Professional', 'Profissional', 'Professionnel'), price: 250, cycle: 'month',
      features: [T('Everything in Registered', 'Tudo do plano Registado', 'Tout le contenu Inscrit'), T('All premium reports & downloads', 'Todos os relatórios premium e downloads', 'Tous les rapports premium et téléchargements'), T('Tender documents & buyer contacts', 'Documentos de concurso e contactos', 'Dossiers d’appels d’offres et contacts acheteurs'), T('Supplier contact details', 'Contactos de fornecedores', 'Coordonnées des fournisseurs'), T('Member-only webinars & recordings', 'Webinars e gravações exclusivos', 'Webinaires et replays réservés')] },
    { id: 'pro_annual', group: 'pro', name: T('Professional', 'Profissional', 'Professionnel'), price: 2500, cycle: 'year', features: null },
    { id: 'corporate', name: T('Corporate / Supplier', 'Empresarial / Fornecedor', 'Entreprise / Fournisseur'), price: 7500, cycle: 'year',
      features: [T('Everything in Professional', 'Tudo do plano Profissional', 'Tout le contenu Professionnel'), T('Enhanced supplier directory profile', 'Perfil destacado no diretório', 'Fiche annuaire mise en avant'), T('Up to 5 team accounts', 'Até 5 contas de equipa', 'Jusqu’à 5 comptes d’équipe'), T('Featured placement on homepage', 'Destaque na página inicial', 'Mise en avant sur la page d’accueil'), T('Quarterly sector briefing call', 'Reunião trimestral sobre o setor', 'Point trimestriel sur le secteur')] }
  ];

  /* Image register. Files go in assets/img/photos/. Missing files fall back to an illustrated panel. */
  var IMAGES = {
    hero: { file: 'assets/img/photos/coral-sul-flng.jpg', subject: T('Coral Sul FLNG facility at sea', 'Unidade flutuante Coral Sul FLNG', 'Unité flottante Coral Sul FLNG'), place: 'Coral Sul FLNG, Area 4, Rovuma Basin, offshore Cabo Delgado', source: 'Eni media library (request permission)', credit: '© Eni', status: 'to-source' },
    mozlng: { file: 'assets/img/photos/afungi-mozambique-lng.jpg', subject: T('Mozambique LNG site, Afungi Peninsula', 'Local do Mozambique LNG, Península de Afungi', 'Site de Mozambique LNG, péninsule d’Afungi'), place: 'Afungi Peninsula, Palma district, Cabo Delgado', source: 'TotalEnergies media (request permission)', credit: '© TotalEnergies', status: 'to-source' },
    rovuma: { file: 'assets/img/photos/rovuma-lng.jpg', subject: T('Rovuma LNG project area', 'Área do projeto Rovuma LNG', 'Zone du projet Rovuma LNG'), place: 'Area 4 / Afungi, Cabo Delgado', source: 'ExxonMobil Mozambique media (request permission)', credit: '© ExxonMobil', status: 'to-source' },
    pande: { file: 'assets/img/photos/temane-cpf.jpg', subject: T('Temane Central Processing Facility', 'Central de Processamento de Temane', 'Usine de traitement centrale de Temane'), place: 'Temane, Inhambane province', source: 'Sasol media (request permission)', credit: '© Sasol', status: 'to-source' },
    pemba: { file: 'assets/img/photos/port-of-pemba.jpg', subject: T('Port of Pemba logistics base', 'Base logística do Porto de Pemba', 'Base logistique du port de Pemba'), place: 'Pemba, Cabo Delgado', source: 'Wikimedia Commons (CC BY-SA, verify) or OilSkill', credit: 'To be confirmed', status: 'to-source' },
    people: { file: 'assets/img/photos/oilskill-professionals.jpg', subject: T('Mozambican professionals at an OilSkill session', 'Profissionais moçambicanos numa sessão OilSkill', 'Professionnels mozambicains lors d’une session OilSkill'), place: 'OilSkill event, Maputo (OilSkill to supply)', source: 'OilSkill Co. own photography', credit: '© OilSkill Co.', status: 'to-source' }
  };

  var PROJECTS = [
    { id: 'coral', img: 'hero', name: 'Coral Sul FLNG', operator: 'Eni (Area 4)', loc: 'rovuma',
      text: T('Floating LNG facility in the offshore Rovuma Basin; Mozambique’s first LNG export project, with first cargo shipped in 2022.', 'Unidade flutuante de GNL na bacia offshore do Rovuma; primeiro projeto de exportação de GNL de Moçambique, com a primeira carga exportada em 2022.', 'Unité flottante de GNL dans le bassin offshore de la Rovuma ; premier projet d’exportation de GNL du Mozambique, avec une première cargaison expédiée en 2022.') },
    { id: 'mozlng', img: 'mozlng', name: 'Mozambique LNG', operator: 'TotalEnergies (Area 1)', loc: 'cabo-delgado',
      text: T('Onshore LNG development on the Afungi Peninsula, Palma district, supplied from offshore Area 1 fields.', 'Projeto de GNL em terra na Península de Afungi, distrito de Palma, abastecido pelos campos offshore da Área 1.', 'Projet de GNL à terre sur la péninsule d’Afungi, district de Palma, alimenté par les champs offshore de la zone 1.') },
    { id: 'rovuma', img: 'rovuma', name: 'Rovuma LNG', operator: 'ExxonMobil (Area 4)', loc: 'cabo-delgado',
      text: T('Planned onshore LNG development for Area 4 resources, adjacent to the Afungi site.', 'Projeto planeado de GNL em terra para os recursos da Área 4, junto ao local de Afungi.', 'Projet de GNL à terre prévu pour les ressources de la zone 4, à proximité du site d’Afungi.') },
    { id: 'pande', img: 'pande', name: 'Pande & Temane', operator: 'Sasol', loc: 'inhambane',
      text: T('Onshore gas fields in Inhambane province producing since 2004; gas is exported to South Africa through the ROMPCO pipeline.', 'Campos de gás em terra na província de Inhambane, em produção desde 2004; o gás é exportado para a África do Sul pelo gasoduto ROMPCO.', 'Champs gaziers à terre dans la province d’Inhambane, en production depuis 2004 ; le gaz est exporté vers l’Afrique du Sud par le gazoduc ROMPCO.') }
  ];

  var INTEL = [
    { id: 'i1', date: d(-6), cat: 'market', type: 'report', sector: 'lng', loc: 'rovuma', premium: true, img: 'hero', sample: true,
      title: T('Rovuma Basin LNG outlook 2026–2030: project pipeline and supply-chain demand', 'Perspetivas do GNL da Bacia do Rovuma 2026–2030: carteira de projetos e procura na cadeia de abastecimento', 'Perspectives du GNL du bassin de la Rovuma 2026–2030 : portefeuille de projets et demande de la chaîne d’approvisionnement'),
      summary: T('How the sequencing of offshore and onshore LNG developments shapes demand for local goods and services over the next five years.', 'Como a sequência dos projetos de GNL offshore e onshore determina a procura de bens e serviços locais nos próximos cinco anos.', 'Comment l’enchaînement des projets de GNL offshore et à terre façonne la demande de biens et services locaux sur les cinq prochaines années.'),
      points: [T('Construction-phase demand peaks for logistics, camp services and civil works', 'Pico de procura na fase de construção para logística, acampamentos e obras civis', 'Pic de demande en phase de construction pour la logistique, les bases-vie et le génie civil'), T('Operations phase shifts demand to maintenance, inspection and marine support', 'A fase de operação desloca a procura para manutenção, inspeção e apoio marítimo', 'La phase d’exploitation déplace la demande vers la maintenance, l’inspection et le soutien maritime'), T('Supplier registration and certification lead times are a key constraint', 'Os prazos de registo e certificação de fornecedores são uma limitação importante', 'Les délais d’enregistrement et de certification des fournisseurs constituent une contrainte majeure')] },
    { id: 'i2', date: d(-12), cat: 'regulatory', type: 'guide', sector: 'local', loc: 'national', premium: false, img: 'people', sample: true,
      title: T('Local content in Mozambique’s gas sector: what suppliers need to know', 'Conteúdo local no setor do gás em Moçambique: o que os fornecedores devem saber', 'Contenu local dans le secteur gazier mozambicain : ce que les fournisseurs doivent savoir'),
      summary: T('A practical guide to registration, partnering and compliance expectations for Mozambican and international suppliers.', 'Guia prático sobre registo, parcerias e requisitos de conformidade para fornecedores moçambicanos e internacionais.', 'Guide pratique sur l’enregistrement, les partenariats et les exigences de conformité pour les fournisseurs mozambicains et internationaux.'),
      points: [T('Register with operator and EPC supplier portals early', 'Registe-se cedo nos portais de fornecedores dos operadores e EPCs', 'Inscrivez-vous tôt sur les portails fournisseurs des opérateurs et EPC'), T('Joint ventures with Mozambican companies are frequently expected', 'Parcerias com empresas moçambicanas são frequentemente esperadas', 'Les coentreprises avec des sociétés mozambicaines sont souvent attendues'), T('Keep HSE, quality and tax documentation current', 'Mantenha atualizada a documentação de HSE, qualidade e fiscal', 'Tenez à jour vos documents HSE, qualité et fiscaux')] },
    { id: 'i3', date: d(-18), cat: 'supply', type: 'report', sector: 'logistics', loc: 'cabo-delgado', premium: true, img: 'pemba', sample: true,
      title: T('Cabo Delgado logistics: port, road and airstrip capacity for project support', 'Logística em Cabo Delgado: capacidade portuária, rodoviária e aeroportuária para apoio aos projetos', 'Logistique dans le Cabo Delgado : capacités portuaires, routières et aériennes au service des projets'),
      summary: T('Capacity, bottlenecks and service gaps along the Pemba–Palma corridor.', 'Capacidade, estrangulamentos e lacunas de serviço no corredor Pemba–Palma.', 'Capacités, goulets d’étranglement et besoins non couverts sur le corridor Pemba–Palma.'),
      points: [T('Pemba port remains the main supply base for northern projects', 'O porto de Pemba continua a ser a principal base de abastecimento dos projetos do norte', 'Le port de Pemba reste la principale base d’approvisionnement des projets du nord'), T('Heavy-haul road transport requires escorts and permits', 'O transporte rodoviário pesado exige escoltas e licenças', 'Le transport routier lourd nécessite escortes et autorisations'), T('Opportunities in warehousing, fleet maintenance and fuel supply', 'Oportunidades em armazenagem, manutenção de frotas e combustível', 'Opportunités dans l’entreposage, la maintenance de flotte et le carburant')] },
    { id: 'i4', date: d(-25), cat: 'project', type: 'brief', sector: 'upstream', loc: 'inhambane', premium: false, img: 'pande', sample: true,
      title: T('Onshore gas in Inhambane: domestic gas-to-power and industrial use', 'Gás onshore em Inhambane: produção de energia e uso industrial no país', 'Gaz à terre dans l’Inhambane : production d’électricité et usages industriels nationaux'),
      summary: T('Briefing on the role of onshore gas production in Mozambique’s domestic energy and industrial plans.', 'Nota sobre o papel da produção de gás onshore nos planos energéticos e industriais de Moçambique.', 'Note sur le rôle de la production de gaz à terre dans les projets énergétiques et industriels du Mozambique.'),
      points: [T('Gas supports power generation and industrial users', 'O gás apoia a produção de energia e utilizadores industriais', 'Le gaz alimente la production d’électricité et l’industrie'), T('Processing facility services and maintenance contracts', 'Serviços e contratos de manutenção nas instalações de processamento', 'Services et contrats de maintenance des installations de traitement'), T('Regional pipeline links to South Africa', 'Ligações regionais por gasoduto à África do Sul', 'Liaisons régionales par gazoduc vers l’Afrique du Sud')] },
    { id: 'i5', date: d(-33), cat: 'supply', type: 'guide', sector: 'services', loc: 'national', premium: true, img: 'mozlng', sample: true,
      title: T('Procurement calendars: how operators and EPC contractors buy in Mozambique', 'Calendários de aquisições: como compram os operadores e EPCs em Moçambique', 'Calendriers d’achats : comment opérateurs et EPC achètent au Mozambique'),
      summary: T('Typical procurement stages, prequalification and evaluation criteria used on major projects.', 'Etapas típicas de aquisição, pré-qualificação e critérios de avaliação usados nos grandes projetos.', 'Étapes types d’achat, préqualification et critères d’évaluation utilisés sur les grands projets.'),
      points: [T('Prequalification usually precedes tender invitations', 'A pré-qualificação antecede normalmente os convites para concurso', 'La préqualification précède généralement les appels d’offres'), T('Technical and HSE scores often carry high weighting', 'As pontuações técnicas e de HSE têm geralmente peso elevado', 'Les notes techniques et HSE sont souvent fortement pondérées'), T('Late or incomplete submissions are rarely accepted', 'Propostas tardias ou incompletas raramente são aceites', 'Les offres tardives ou incomplètes sont rarement acceptées')] },
    { id: 'i6', date: d(-41), cat: 'regulatory', type: 'brief', sector: 'hse', loc: 'national', premium: false, img: 'people', sample: true,
      title: T('HSE and certification requirements for suppliers to LNG projects', 'Requisitos de HSE e certificação para fornecedores de projetos de GNL', 'Exigences HSE et de certification pour les fournisseurs des projets de GNL'),
      summary: T('Which certifications buyers ask for most and how long they take to obtain.', 'Que certificações os compradores pedem mais e quanto tempo demoram a obter.', 'Quelles certifications les acheteurs demandent le plus et combien de temps il faut pour les obtenir.'),
      points: [T('ISO 9001, 14001 and 45001 are commonly requested', 'ISO 9001, 14001 e 45001 são frequentemente pedidas', 'Les normes ISO 9001, 14001 et 45001 sont souvent exigées'), T('Site-specific HSE induction is mandatory', 'A formação de HSE específica do local é obrigatória', 'L’accueil HSE propre au site est obligatoire'), T('Plan 6–12 months for first certification', 'Preveja 6 a 12 meses para a primeira certificação', 'Prévoyez 6 à 12 mois pour une première certification')] },
    { id: 'i7', date: d(-52), cat: 'skills', type: 'report', sector: 'local', loc: 'national', premium: true, img: 'people', sample: true,
      title: T('Skills demand forecast: technical trades for LNG construction and operations', 'Previsão da procura de competências: profissões técnicas para construção e operação de GNL', 'Prévision des besoins en compétences : métiers techniques pour la construction et l’exploitation du GNL'),
      summary: T('Estimated demand for welders, electricians, instrument technicians and operators.', 'Procura estimada de soldadores, eletricistas, técnicos de instrumentação e operadores.', 'Besoins estimés en soudeurs, électriciens, techniciens instrumentation et opérateurs.'),
      points: [T('Construction trades dominate near-term demand', 'As profissões de construção dominam a procura a curto prazo', 'Les métiers de la construction dominent la demande à court terme'), T('Operations roles require longer training pathways', 'As funções de operação exigem percursos de formação mais longos', 'Les postes d’exploitation exigent des parcours de formation plus longs'), T('Certification of trainers is a bottleneck', 'A certificação de formadores é um estrangulamento', 'La certification des formateurs est un goulet d’étranglement')] },
    { id: 'i8', date: d(-64), cat: 'market', type: 'dataset', sector: 'downstream', loc: 'sofala', premium: false, img: 'pemba', sample: true,
      title: T('Fuel imports and storage: Beira, Nacala and Maputo terminals', 'Importação e armazenamento de combustíveis: terminais da Beira, Nacala e Maputo', 'Importations et stockage de carburants : terminaux de Beira, Nacala et Maputo'),
      summary: T('Data snapshot of downstream fuel logistics serving Mozambique and its inland neighbours.', 'Resumo de dados da logística de combustíveis que serve Moçambique e os países vizinhos do interior.', 'Données clés sur la logistique des carburants desservant le Mozambique et ses voisins enclavés.'),
      points: [T('Ports act as fuel gateways for landlocked neighbours', 'Os portos servem de entrada de combustível para países vizinhos sem litoral', 'Les ports servent de portes d’entrée du carburant pour les pays voisins enclavés'), T('Storage expansion creates construction and O&M work', 'A expansão do armazenamento gera trabalho de construção e O&M', 'L’extension des capacités de stockage génère des travaux de construction et d’exploitation-maintenance'), T('Road and rail corridors determine onward distribution', 'Os corredores rodoviários e ferroviários determinam a distribuição', 'Les corridors routiers et ferroviaires déterminent la distribution')] }
  ];

  var OPPS = [
    { id: 'o1', date: d(-3), close: d(21), type: 'tender', sector: 'services', loc: 'cabo-delgado', premium: true, org: 'Afungi Site Services JV (sample)', sample: true,
      title: T('Camp catering and housekeeping services: Afungi construction camp', 'Serviços de catering e limpeza: acampamento de construção de Afungi', 'Restauration et entretien : base-vie de construction d’Afungi'),
      desc: T('Provision of catering, laundry and housekeeping for a construction workforce camp. Bidders must demonstrate food-safety certification and local employment plans.', 'Fornecimento de catering, lavandaria e limpeza para um acampamento de trabalhadores. Os concorrentes devem comprovar certificação de segurança alimentar e planos de emprego local.', 'Fourniture de restauration, blanchisserie et entretien pour une base-vie de chantier. Les soumissionnaires doivent justifier d’une certification en sécurité alimentaire et d’un plan d’emploi local.') },
    { id: 'o2', date: d(-5), close: d(9), type: 'rfq', sector: 'downstream', loc: 'cabo-delgado', premium: false, org: 'Northern Supply Base Operator (sample)', sample: true,
      title: T('RFQ: Marine fuel and lubricants delivery, Pemba logistics base', 'Pedido de cotação: fornecimento de combustível marítimo e lubrificantes, base logística de Pemba', 'Demande de prix : livraison de carburant marin et lubrifiants, base logistique de Pemba'),
      desc: T('Quotation for scheduled delivery of marine gas oil and lubricants to support vessels operating from Pemba.', 'Cotação para fornecimento programado de gasóleo marítimo e lubrificantes a embarcações que operam a partir de Pemba.', 'Demande de prix pour la livraison planifiée de gazole marin et lubrifiants aux navires opérant depuis Pemba.') },
    { id: 'o3', date: d(-8), close: d(35), type: 'eoi', sector: 'construction', loc: 'cabo-delgado', premium: true, org: 'LNG EPC Consortium (sample)', sample: true,
      title: T('EOI: Local fabrication of secondary steel structures', 'Manifestação de interesse: fabrico local de estruturas metálicas secundárias', 'Manifestation d’intérêt : fabrication locale de structures métalliques secondaires'),
      desc: T('Mozambican fabricators are invited to express interest in supplying platforms, ladders, handrails and pipe supports.', 'Fabricantes moçambicanos são convidados a manifestar interesse no fornecimento de plataformas, escadas, corrimãos e suportes de tubagem.', 'Les fabricants mozambicains sont invités à manifester leur intérêt pour la fourniture de plateformes, échelles, garde-corps et supports de tuyauterie.') },
    { id: 'o4', date: d(-10), close: d(4), type: 'subcontract', sector: 'logistics', loc: 'cabo-delgado', premium: false, org: 'Regional Heavy Haul Contractor (sample)', sample: true,
      title: T('Heavy-haul transport subcontract: Pemba to Palma corridor', 'Subcontratação de transporte pesado: corredor Pemba–Palma', 'Sous-traitance de transport lourd : corridor Pemba–Palma'),
      desc: T('Subcontractors with low-bed trailers and escort capability required for oversized equipment moves.', 'São necessários subcontratados com reboques de plataforma baixa e capacidade de escolta para transporte de equipamento de grandes dimensões.', 'Recherche de sous-traitants disposant de porte-engins surbaissés et de capacités d’escorte pour le transport d’équipements hors gabarit.') },
    { id: 'o5', date: d(-2), close: d(28), type: 'tender', sector: 'hse', loc: 'maputo', premium: false, org: 'Energy Training Fund (sample)', sample: true,
      title: T('Framework agreement: HSE training providers', 'Acordo-quadro: prestadores de formação em HSE', 'Accord-cadre : organismes de formation HSE'),
      desc: T('Accredited providers sought for first aid, working at height, confined space and fire-safety training.', 'Procuram-se prestadores acreditados para formação em primeiros socorros, trabalho em altura, espaços confinados e segurança contra incêndios.', 'Recherche d’organismes agréés pour les formations premiers secours, travail en hauteur, espaces confinés et sécurité incendie.') },
    { id: 'o6', date: d(-4), close: d(14), type: 'rfq', sector: 'midstream', loc: 'inhambane', premium: false, org: 'Onshore Gas Operator (sample)', sample: true,
      title: T('RFQ: NDT inspection services for onshore gas pipeline', 'Pedido de cotação: serviços de inspeção END para gasoduto onshore', 'Demande de prix : contrôles non destructifs d’un gazoduc terrestre'),
      desc: T('Radiographic and ultrasonic inspection for pipeline maintenance campaigns.', 'Inspeção radiográfica e por ultrassons para campanhas de manutenção do gasoduto.', 'Contrôles radiographiques et ultrasonores pour les campagnes de maintenance du gazoduc.') },
    { id: 'o7', date: d(-1), close: d(45), type: 'tender', sector: 'hse', loc: 'rovuma', premium: true, org: 'Offshore Area Operator (sample)', sample: true,
      title: T('Marine environmental baseline survey', 'Levantamento ambiental marinho de referência', 'Étude environnementale marine de référence'),
      desc: T('Water quality, benthic and marine mammal monitoring for an offshore development area.', 'Monitorização da qualidade da água, bentos e mamíferos marinhos numa área de desenvolvimento offshore.', 'Suivi de la qualité de l’eau, du benthos et des mammifères marins dans une zone de développement offshore.') },
    { id: 'o8', date: d(-40), close: d(-5), type: 'rfq', sector: 'services', loc: 'cabo-delgado', premium: false, org: 'Site Facilities Contractor (sample)', sample: true,
      title: T('RFQ: IT and telecom site connectivity', 'Pedido de cotação: conectividade de TI e telecomunicações no local', 'Demande de prix : connectivité informatique et télécoms sur site'),
      desc: T('VSAT and LTE connectivity for remote site offices. This opportunity has closed.', 'Conectividade VSAT e LTE para escritórios remotos. Esta oportunidade encerrou.', 'Connectivité VSAT et LTE pour des bureaux de chantier isolés. Cette opportunité est clôturée.') },
    { id: 'o9', date: d(-6), close: d(60), type: 'partnership', sector: 'services', loc: 'maputo', premium: false, org: 'International Valve OEM (sample)', sample: true,
      title: T('Partnership: Mozambican partner for valve maintenance workshop', 'Parceria: parceiro moçambicano para oficina de manutenção de válvulas', 'Partenariat : partenaire mozambicain pour un atelier de maintenance de vannes'),
      desc: T('An equipment manufacturer seeks a local partner to establish an authorised service workshop.', 'Um fabricante de equipamento procura um parceiro local para criar uma oficina de assistência autorizada.', 'Un fabricant d’équipements recherche un partenaire local pour créer un atelier de service agréé.') },
    { id: 'o10', date: d(-2), close: d(12), type: 'job', sector: 'local', loc: 'inhambane', premium: false, org: 'Gas Processing Contractor (sample)', sample: true,
      title: T('Recruitment: instrument technicians (Mozambican nationals)', 'Recrutamento: técnicos de instrumentação (cidadãos moçambicanos)', 'Recrutement : techniciens instrumentation (ressortissants mozambicains)'),
      desc: T('Experienced instrument technicians for a gas processing facility maintenance team.', 'Técnicos de instrumentação experientes para a equipa de manutenção de uma instalação de processamento de gás.', 'Techniciens instrumentation expérimentés pour l’équipe de maintenance d’une installation de traitement de gaz.') }
  ];

  var SUPPLIERS = [
    { id: 'sp1', name: 'Pemba Marine & Logistics Lda', services: ['marine', 'logistics'], sector: 'logistics', loc: 'cabo-delgado', city: 'Pemba', founded: 2014, staff: '50–100', certs: ['ISO 9001', 'ISO 45001'], local: true, color: '#1D1336', featured: true,
      overview: T('Vessel agency, crew transfer and quayside logistics for projects operating from Pemba.', 'Agência de navios, transferência de tripulações e logística portuária para projetos que operam a partir de Pemba.', 'Agence maritime, transfert d’équipages et logistique portuaire pour les projets opérant depuis Pemba.') },
    { id: 'sp2', name: 'Rovuma Camp Services', services: ['catering'], sector: 'services', loc: 'cabo-delgado', city: 'Palma', founded: 2017, staff: '100–250', certs: ['ISO 22000'], local: true, color: '#E4572E', featured: true,
      overview: T('Remote camp catering, accommodation management and laundry services.', 'Catering em acampamentos remotos, gestão de alojamento e lavandaria.', 'Restauration en base-vie isolée, gestion de l’hébergement et blanchisserie.') },
    { id: 'sp3', name: 'Maputo Safety Training Centre', services: ['training'], sector: 'hse', loc: 'maputo', city: 'Maputo', founded: 2011, staff: '10–50', certs: ['ISO 9001'], local: true, color: '#F28936', featured: true,
      overview: T('Accredited HSE courses including first aid, working at height and confined space entry.', 'Cursos acreditados de HSE, incluindo primeiros socorros, trabalho em altura e espaços confinados.', 'Formations HSE agréées : premiers secours, travail en hauteur et espaces confinés.') },
    { id: 'sp4', name: 'Inhambane Inspection & NDT', services: ['inspection'], sector: 'midstream', loc: 'inhambane', city: 'Vilankulo', founded: 2016, staff: '10–50', certs: ['ISO 9001', 'ISO 17020'], local: true, color: '#3B2F6B',
      overview: T('Non-destructive testing, corrosion monitoring and pipeline inspection.', 'Ensaios não destrutivos, monitorização de corrosão e inspeção de gasodutos.', 'Contrôles non destructifs, suivi de la corrosion et inspection de pipelines.') },
    { id: 'sp5', name: 'Zambeze Engineering & Fabrication', services: ['fabrication'], sector: 'construction', loc: 'sofala', city: 'Beira', founded: 2009, staff: '100–250', certs: ['ISO 9001', 'ISO 3834'], local: true, color: '#1D1336', featured: true,
      overview: T('Structural steel fabrication, piping spools and mechanical installation.', 'Fabrico de estruturas metálicas, tubagem pré-fabricada e montagem mecânica.', 'Charpente métallique, préfabrication de tuyauterie et montage mécanique.') },
    { id: 'sp6', name: 'Nacala Fuel Logistics', services: ['fuel', 'logistics'], sector: 'downstream', loc: 'nampula', city: 'Nacala', founded: 2012, staff: '50–100', certs: ['ISO 14001'], local: true, color: '#E4572E',
      overview: T('Fuel storage, road tanker distribution and site refuelling services.', 'Armazenamento de combustível, distribuição por camião-cisterna e abastecimento no local.', 'Stockage de carburant, distribution par camion-citerne et avitaillement sur site.') },
    { id: 'sp7', name: 'Ilha Environmental Consultants', services: ['environmental'], sector: 'hse', loc: 'maputo', city: 'Maputo', founded: 2015, staff: '10–50', certs: ['ISO 14001'], local: true, color: '#2E7D5B',
      overview: T('Environmental and social impact studies, marine surveys and monitoring.', 'Estudos de impacto ambiental e social, levantamentos marinhos e monitorização.', 'Études d’impact environnemental et social, campagnes marines et suivi.') },
    { id: 'sp8', name: 'CaboTech Site Communications', services: ['telecom'], sector: 'services', loc: 'cabo-delgado', city: 'Pemba', founded: 2019, staff: '10–50', certs: [], local: true, color: '#3B2F6B',
      overview: T('VSAT, LTE and site network installation for remote project locations.', 'Instalação de VSAT, LTE e redes em locais de projeto remotos.', 'Installation VSAT, LTE et réseaux de site pour des projets isolés.') },
    { id: 'sp9', name: 'Moz Skilled Manpower Solutions', services: ['manpower'], sector: 'local', loc: 'maputo', city: 'Maputo', founded: 2013, staff: '250+', certs: ['ISO 9001'], local: true, color: '#F28936',
      overview: T('Recruitment and supply of certified Mozambican technical personnel.', 'Recrutamento e fornecimento de pessoal técnico moçambicano certificado.', 'Recrutement et mise à disposition de personnel technique mozambicain certifié.') },
    { id: 'sp10', name: 'Indico Valves & Rotating Equipment', services: ['equipment'], sector: 'services', loc: 'maputo', city: 'Matola', founded: 2010, staff: '50–100', certs: ['ISO 9001'], local: false, color: '#1D1336',
      overview: T('Valve overhaul, pump and compressor maintenance, and spare parts supply.', 'Revisão de válvulas, manutenção de bombas e compressores e fornecimento de peças.', 'Révision de vannes, maintenance de pompes et compresseurs, et fourniture de pièces détachées.') }
  ];
  SUPPLIERS.forEach(function (s) { s.sample = true; });

  var NEWS = [
    { id: 'n1', date: d(-1), cat: 'oilskill', img: 'people', sample: true,
      title: T('OilSkill previews its new multilingual intelligence platform', 'A OilSkill apresenta a sua nova plataforma multilingue de inteligência', 'OilSkill présente sa nouvelle plateforme de veille multilingue'),
      summary: T('The platform brings intelligence, opportunities, suppliers and webinars together in English, Portuguese and French.', 'A plataforma reúne inteligência, oportunidades, fornecedores e webinars em inglês, português e francês.', 'La plateforme réunit veille, opportunités, fournisseurs et webinaires en anglais, portugais et français.') },
    { id: 'n2', date: d(-7), cat: 'oilskill', img: 'pemba', sample: true,
      title: T('Supplier listing drive: Mozambican SMEs invited to join the directory', 'Campanha de listagem: PME moçambicanas convidadas a aderir ao diretório', 'Campagne de référencement : les PME mozambicaines invitées à rejoindre l’annuaire'),
      summary: T('Companies can create a profile describing services, certifications and locations.', 'As empresas podem criar um perfil com serviços, certificações e localizações.', 'Les entreprises peuvent créer une fiche présentant leurs services, certifications et implantations.') },
    { id: 'n3', date: d(-15), cat: 'events', img: 'people', sample: true,
      title: T('Webinar recap: understanding local content requirements', 'Resumo do webinar: compreender os requisitos de conteúdo local', 'Retour sur le webinaire : comprendre les exigences de contenu local'),
      summary: T('Key takeaways and the recording are now available to members.', 'Os principais pontos e a gravação já estão disponíveis para membros.', 'Les points clés et l’enregistrement sont désormais disponibles pour les membres.') },
    { id: 'n4', date: d(-22), cat: 'industry', img: 'mozlng', sample: true,
      title: T('Sample article: suppliers prepare for the next wave of LNG procurement', 'Artigo de amostra: fornecedores preparam-se para a próxima vaga de aquisições de GNL', 'Article exemple : les fournisseurs se préparent à la prochaine vague d’achats GNL'),
      summary: T('Illustrative article showing the news template. Not a factual report.', 'Artigo ilustrativo que mostra o modelo de notícia. Não é uma notícia factual.', 'Article illustratif présentant le modèle d’actualité. Il ne s’agit pas d’une information factuelle.') },
    { id: 'n5', date: d(-30), cat: 'policy', img: 'pande', sample: true,
      title: T('Sample article: what new procurement rules could mean for SMEs', 'Artigo de amostra: o que novas regras de aquisição podem significar para as PME', 'Article exemple : ce que de nouvelles règles d’achat pourraient signifier pour les PME'),
      summary: T('Illustrative article showing policy category content. Not a factual report.', 'Artigo ilustrativo da categoria de políticas. Não é uma notícia factual.', 'Article illustratif de la catégorie Politiques. Il ne s’agit pas d’une information factuelle.') },
    { id: 'n6', date: d(-44), cat: 'events', img: 'hero', sample: true,
      title: T('Sample article: training centres expand technical courses', 'Artigo de amostra: centros de formação alargam cursos técnicos', 'Article exemple : les centres de formation élargissent leur offre technique'),
      summary: T('Illustrative article showing event coverage. Not a factual report.', 'Artigo ilustrativo sobre cobertura de eventos. Não é uma notícia factual.', 'Article illustratif sur la couverture d’événements. Il ne s’agit pas d’une information factuelle.') }
  ];

  var WEBINARS = [
    { id: 'w1', start: d(14), dur: 60, cat: 'procurement', premium: false, mode: 'form', platform: 'Zoom', img: 'mozlng', sample: true,
      speakers: [{ name: 'Speaker A (sample)', role: T('Procurement Lead, EPC contractor', 'Responsável de Aquisições, empresa EPC', 'Responsable achats, entreprise EPC') }, { name: 'Speaker B (sample)', role: T('OilSkill Industry Analyst', 'Analista do Setor, OilSkill', 'Analyste sectoriel, OilSkill') }],
      title: T('How to win work on Mozambique’s LNG projects', 'Como conquistar contratos nos projetos de GNL de Moçambique', 'Comment remporter des contrats sur les projets GNL du Mozambique'),
      summary: T('Prequalification, bid preparation and common mistakes, with Q&A.', 'Pré-qualificação, preparação de propostas e erros comuns, com perguntas e respostas.', 'Préqualification, préparation des offres et erreurs fréquentes, avec questions-réponses.') },
    { id: 'w2', start: d(28), dur: 45, cat: 'local', premium: true, mode: 'external', platform: 'Microsoft Teams', url: 'https://teams.microsoft.com/', img: 'people', sample: true,
      speakers: [{ name: 'Speaker C (sample)', role: T('Local Content Adviser', 'Consultor de Conteúdo Local', 'Conseiller contenu local') }],
      title: T('Local content requirements: members’ Q&A', 'Requisitos de conteúdo local: sessão de perguntas para membros', 'Exigences de contenu local : questions-réponses membres'),
      summary: T('Members-only session on registration, partnering and reporting.', 'Sessão exclusiva para membros sobre registo, parcerias e relatórios.', 'Session réservée aux membres sur l’enregistrement, les partenariats et le reporting.') },
    { id: 'w3', start: d(42), dur: 60, cat: 'hse', premium: false, mode: 'form', platform: 'Zoom', img: 'pemba', sample: true,
      speakers: [{ name: 'Speaker D (sample)', role: T('HSE Manager', 'Gestor de HSE', 'Responsable HSE') }],
      title: T('HSE certification pathways for SMEs', 'Percursos de certificação HSE para PME', 'Parcours de certification HSE pour les PME'),
      summary: T('Which certifications to prioritise and how to prepare for audits.', 'Que certificações priorizar e como preparar auditorias.', 'Quelles certifications privilégier et comment préparer les audits.') },
    { id: 'w4', start: d(-30), dur: 60, cat: 'sector', premium: true, mode: 'form', platform: 'Zoom', img: 'pemba', recording: 'https://example.com/recording', sample: true,
      speakers: [{ name: 'Speaker E (sample)', role: T('Logistics Consultant', 'Consultor de Logística', 'Consultant logistique') }],
      title: T('Logistics in Cabo Delgado: challenges and opportunities', 'Logística em Cabo Delgado: desafios e oportunidades', 'Logistique dans le Cabo Delgado : défis et opportunités'),
      summary: T('Recording available to members.', 'Gravação disponível para membros.', 'Enregistrement disponible pour les membres.') },
    { id: 'w5', start: d(-60), dur: 50, cat: 'sector', premium: false, mode: 'form', platform: 'Zoom', img: 'hero', recording: 'https://example.com/recording', sample: true,
      speakers: [{ name: 'Speaker B (sample)', role: T('OilSkill Industry Analyst', 'Analista do Setor, OilSkill', 'Analyste sectoriel, OilSkill') }],
      title: T('Introduction to Mozambique’s gas value chain', 'Introdução à cadeia de valor do gás em Moçambique', 'Introduction à la chaîne de valeur gazière du Mozambique'),
      summary: T('From reservoir to export: an overview for newcomers to the sector.', 'Do reservatório à exportação: uma visão geral para quem chega ao setor.', 'Du gisement à l’exportation : un panorama pour les nouveaux venus dans le secteur.') }
  ];

  window.DATA = { TAX: TAX, PLANS: PLANS, IMAGES: IMAGES, PROJECTS: PROJECTS, intel: INTEL, opp: OPPS, supplier: SUPPLIERS, news: NEWS, webinar: WEBINARS, T: T, d: d };

  /* ---------- Content repository: base data + admin edits + approved imports ---------- */
  var TYPES = ['intel', 'opp', 'supplier', 'news', 'webinar'];
  window.Repo = {
    types: TYPES,
    all: function (type, includeDrafts) {
      var over = (Store.get('content', {})[type]) || {};
      var base = DATA[type].map(function (x) { return over[x.id] ? Object.assign({}, x, over[x.id]) : x; });
      var added = Object.keys(over).filter(function (id) { return !DATA[type].some(function (x) { return x.id === id; }); }).map(function (id) { return over[id]; });
      var list = added.concat(base);
      if (!includeDrafts) list = list.filter(function (x) { return (x.status || 'publish') === 'publish'; });
      return list;
    },
    get: function (type, id) { return Repo.all(type, true).filter(function (x) { return x.id === id; })[0] || null; },
    save: function (type, item) {
      var c = Store.get('content', {}); c[type] = c[type] || {};
      c[type][item.id] = Object.assign({}, c[type][item.id] || {}, item, { modified: Store.now() });
      Store.set('content', c);
    },
    remove: function (type, id) { Repo.save(type, { id: id, status: 'trash' }); }
  };
})();

/* ---------- Homepage content (simulates the Home page + ACF flexible-content fields in WordPress).
   Edited in admin.html → Pages → Home; defaults come from the interface strings. ---------- */
(function () {
  function tri(key) { var o = {}; I18N.langs.forEach(function (l) { o[l] = I18N.t(key, null, l); }); return o; }
  function same(s) { return { en: s, pt: s, fr: s }; }
  function defaults() {
    return {
      hero: {
        eyebrow: tri('site.descriptor'), title: tri('home.hero.title'), text: tri('home.hero.text'),
        cta1: tri('home.hero.cta1'), cta1Link: 'opps', cta2: tri('home.hero.cta2'), cta2Link: 'membership',
        showSearch: true, search: tri('home.search.placeholder'), img: 'hero', imgUrl: '', caption: { en: '', pt: '', fr: '' }
      },
      sections: [
        { id: 'stats', show: true },
        { id: 'opps', show: true, eyebrow: tri('nav.opportunities'), heading: tri('home.opps.title'), count: 4 },
        { id: 'projects', show: true, eyebrow: same('Mozambique · Moçambique'), heading: tri('home.projects.title'), intro: tri('home.projects.text') },
        { id: 'intel', show: true, eyebrow: tri('nav.intelligence'), heading: tri('home.intel.title'), count: 3, mode: 'latest', pick: [] },
        { id: 'audience', show: true, eyebrow: tri('nav.about'), heading: tri('home.audience.title') },
        { id: 'suppliers', show: true, eyebrow: tri('nav.suppliers'), heading: tri('home.suppliers.title'), count: 4 },
        { id: 'newsweb', show: true, heading: tri('home.news.title'), heading2: tri('home.webinars.title'), count: 3 },
        { id: 'cta', show: true, eyebrow: tri('nav.membership'), heading: tri('home.member.title'), intro: tri('home.member.text'), btn: tri('home.hero.cta2'), showNewsletter: true, heading2: tri('home.newsletter.title'), intro2: tri('home.newsletter.text') }
      ],
      projects: DATA.PROJECTS.map(function (p) { return { name: p.name, operator: p.operator, loc: p.loc, img: p.img, text: Object.assign({}, p.text) }; })
    };
  }
  window.HomeCfg = {
    defaults: defaults,
    get: function () {
      var def = defaults(), saved = Store.get('home');
      if (!saved) return def;
      var secs = (saved.sections || []).slice();
      def.sections.forEach(function (d) { if (!secs.some(function (s) { return s.id === d.id; })) secs.push(d); });
      return { hero: Object.assign({}, def.hero, saved.hero || {}), sections: secs, projects: saved.projects || def.projects, updated: saved.updated, updatedBy: saved.updatedBy };
    },
    save: function (cfg) { Store.set('home', cfg); },
    reset: function () { Store.set('home', null); }
  };
})();
