# Portfolio — Nathan Chambrette

Refonte éditoriale et interactive du portfolio de Nathan Chambrette, autour du code, du son et des expériences numériques.

## Prévisualisation locale

Le site peut être ouvert directement avec `index.html` ou lancé avec un serveur statique :

```sh
python3 -m http.server 4173
```

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
│   └── responsive.css
└── js/
    ├── app.js
    ├── data.js
    └── utils.js
```

- `index.html` contient la structure sémantique.
- `assets/css/index.css` centralise l’ordre de chargement des styles.
- `assets/js/data.js` expose les textes et données via `window.PortfolioData`.
- `assets/js/utils.js` expose les services partagés via `window.PortfolioUtils`.
- `assets/js/app.js` orchestre les interactions dans une portée isolée.

Les scripts classiques sont chargés dans l’ordre pour rester compatibles avec une ouverture locale en `file://`.

## Artifact Sites

```sh
bash scripts/build.sh
node scripts/validate-artifact.mjs
```
