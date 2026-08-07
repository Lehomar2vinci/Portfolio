window.PortfolioData = (() => {
  const uiText = {
    fr: {
      play: "Jouer",
      stop: "Stop",
      cleared: "Séquence effacée · composez à nouveau",
      steps: "pas",
      copied: "Adresse e-mail copiée",
      briefCopied: "Brief copié",
      projectShown: "1 projet affiché",
      projectsShown: "projets affichés",
      palette: "Palette",
    },
    en: {
      play: "Play",
      stop: "Stop",
      cleared: "Sequence cleared · compose again",
      steps: "steps",
      copied: "Email address copied",
      briefCopied: "Brief copied",
      projectShown: "1 project shown",
      projectsShown: "projects shown",
      palette: "Palette",
    },
  };
  const palettes = [
    { key: "signal", label: "SIGNAL", className: "" },
    { key: "studio", label: "STUDIO", className: "palette-studio" },
    { key: "mono", label: "MONO", className: "palette-mono" },
  ];
  const mixTexts = {
    fr: {
      balanced: [
        "Profil hybride",
        "Le mix garde un équilibre lisible entre développement, écoute, interface et fiabilité terrain.",
      ],
      code: [
        "Architecture active",
        "La dominante code met l’accent sur la structure, les outils maintenables et les prototypes qui tiennent en production.",
      ],
      audio: [
        "Écoute réactive",
        "La dominante audio renforce les expériences sonores, les visualisations et les interactions pilotées par le signal.",
      ],
      ux: [
        "Geste lisible",
        "La dominante UX privilégie les parcours clairs, l’accessibilité et les interfaces qui se comprennent vite.",
      ],
      live: [
        "Fiabilité directe",
        "La dominante live valorise la précision, la robustesse et la capacité à gérer les contraintes réelles.",
      ],
    },
    en: {
      balanced: [
        "Hybrid profile",
        "The mix keeps a clear balance between development, listening, interface work and field reliability.",
      ],
      code: [
        "Active architecture",
        "The code emphasis highlights structure, maintainable tools and prototypes that can survive production.",
      ],
      audio: [
        "Reactive listening",
        "The audio emphasis strengthens sound experiences, visualizations and signal-driven interactions.",
      ],
      ux: [
        "Readable gesture",
        "The UX emphasis favors clear journeys, accessibility and interfaces that make sense quickly.",
      ],
      live: [
        "Live reliability",
        "The live emphasis values precision, robustness and the ability to handle real constraints.",
      ],
    },
  };
  const tourSteps = [
    {
      target: "#top",
      fr: [
        "Instrument d’entrée",
        "Le premier écran fonctionne comme une carte de visite jouable: pads, tempo et timbre donnent tout de suite la couleur code + son.",
      ],
      en: [
        "Entry instrument",
        "The first screen works like a playable calling card: pads, tempo and tone immediately show the code + sound direction.",
      ],
    },
    {
      target: "#mix",
      fr: [
        "Mixeur de compétences",
        "Les curseurs montrent comment Nathan module son profil selon le besoin: code, audio, UX ou fiabilité terrain.",
      ],
      en: [
        "Skill mixer",
        "The sliders show how Nathan can tune his profile to the need: code, audio, UX or field reliability.",
      ],
    },
    {
      target: "#studio",
      fr: [
        "Studio interactif",
        "Le générateur de brief transforme les besoins en angle concret, copiable pour démarrer une conversation.",
      ],
      en: [
        "Interactive studio",
        "The brief generator turns needs into a concrete angle that can be copied to start a conversation.",
      ],
    },
    {
      target: "#projets",
      fr: [
        "Projets filtrables",
        "Les projets peuvent être explorés par famille: audio, visuel ou jeu, avec une fiche détaillée quand c’est utile.",
      ],
      en: [
        "Filterable projects",
        "Projects can be explored by family: audio, visual or games, with a detailed case view where useful.",
      ],
    },
    {
      target: "#contact",
      fr: [
        "Contact rapide",
        "La fin garde l’action principale visible: écrire, copier l’e-mail ou ouvrir les profils publics.",
      ],
      en: [
        "Fast contact",
        "The ending keeps the main action visible: write, copy the email or open public profiles.",
      ],
    },
  ];
  const cases = {
    pestosc: {
      fr: {
        kicker: "Instrument audio-visuel · p5.js",
        title: "PestOSC",
        lead: "Une expérience où le pointeur devient contrôleur musical et où chaque geste produit en même temps un son et sa trace visuelle.",
        gesture:
          "Le déplacement horizontal règle la fréquence, le vertical règle l’amplitude. Un clic démarre le son et les touches A, S, D, F changent la forme d’onde.",
        system:
          "Un oscillateur Web Audio, quatre timbres, des réglages de volume et de fréquence de base, plus un mode visuel qui réagit en temps réel.",
        explore:
          "La relation immédiate entre geste, perception sonore et feedback graphique, avec une dégradation visuelle quand l’intensité augmente.",
      },
      en: {
        kicker: "Audio-visual instrument · p5.js",
        title: "PestOSC",
        lead: "An experience where the pointer becomes a musical controller and every gesture produces both sound and its visual trace.",
        gesture:
          "Horizontal movement controls frequency, vertical movement controls amplitude. A click starts sound and A, S, D, F switch waveforms.",
        system:
          "A Web Audio oscillator, four timbres, base volume and frequency controls, plus a visual mode reacting in real time.",
        explore:
          "The immediate relationship between gesture, sound perception and visual feedback, with image degradation as intensity rises.",
      },
      link: "https://github.com/Lehomar2vinci/PestOSC",
    },
    visualizer: {
      fr: {
        kicker: "Visualiseur microphone · p5.sound",
        title: "Pesto Visualizer",
        lead: "Une surface audiovisuelle qui écoute le microphone et transforme l’énergie des fréquences en cercles, couleurs et particules.",
        gesture:
          "L’utilisateur lance l’écoute, choisit une palette, règle la sensibilité et active ou coupe les particules.",
        system:
          "L’analyse fréquentielle de p5.sound pilote la taille et la couleur de cercles concentriques ainsi que l’énergie du système de particules.",
        explore:
          "Comment rendre une donnée invisible immédiatement sensible, sans perdre la simplicité des contrôles ni le plaisir de l’expérimentation.",
      },
      en: {
        kicker: "Microphone visualizer · p5.sound",
        title: "Pesto Visualizer",
        lead: "An audio-visual surface that listens to the microphone and turns frequency energy into circles, colors and particles.",
        gesture:
          "The user starts listening, chooses a palette, adjusts sensitivity and toggles particles.",
        system:
          "p5.sound frequency analysis drives the size and color of concentric circles and the energy of the particle system.",
        explore:
          "How to make invisible data immediately tangible without losing simple controls or the pleasure of experimentation.",
      },
      link: "https://github.com/Lehomar2vinci/PestoVIsualizer",
    },
  };
  return { cases, mixTexts, palettes, tourSteps, uiText };
})();
