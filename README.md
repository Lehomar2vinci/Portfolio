# Portfolio — Nathan Chambrette · V3

Portfolio statique HTML/CSS/JavaScript orienté code créatif, audio et interaction.

## V3 — développement et design

Cette version conserve l'identité graphique existante et ajoute une couche d'expérience plus poussée :

- ticker horizontal réellement infini, recalculé selon la largeur disponible ;
- navigation compacte au scroll et moniteur de section/progression ;
- hero enrichi par une grille de signal, un éclairage réactif au pointeur et des repères rapides ;
- IDEA MACHINE complétée avec un affichage de séquence 16 pas et un générateur de motif aléatoire ;
- correction du double enregistrement des pads ;
- micro-interactions et profondeur renforcées sur projets, méthode, mixeur, studio et contact ;
- menu mobile verrouillant proprement le scroll et fermeture avec Échap ;
- animations toujours compatibles avec le mode `MOTION` et `prefers-reduced-motion`.

## Architecture

```text
index.html
assets/
├── css/
│   ├── index.css
│   ├── base.css
│   ├── shell.css
│   ├── sections.css
│   ├── projects.css
│   ├── overlays.css
│   ├── responsive.css
│   └── experience.css
└── js/
    ├── data.js
    ├── utils.js
    └── app.js
```

Le site ne dépend d'aucune bibliothèque JavaScript externe et peut être servi comme site statique, notamment avec GitHub Pages.
