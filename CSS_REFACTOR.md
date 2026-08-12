# Refactoring CSS — sans changement visuel

Le CSS a été réorganisé par responsabilité sans modifier le HTML, le JavaScript ni l’identité visuelle.

## Architecture

```text
assets/css/
├── index.css
├── core/
│   ├── tokens.css
│   └── base.css
├── layout/
│   ├── header.css
│   ├── hero.css
│   └── footer.css
├── components/
│   ├── signal-monitor.css
│   ├── instrument.css
│   └── ticker.css
├── sections/
│   ├── profile.css
│   ├── mixer.css
│   ├── practice.css
│   ├── studio.css
│   ├── panels.css
│   ├── shared.css
│   ├── projects.css
│   ├── method.css
│   ├── journey.css
│   └── contact.css
├── overlays/
│   ├── dialogs.css
│   └── accessibility.css
└── responsive.css
```

## Nettoyages sûrs effectués

- suppression du doublon de l’état `.pad.active/.pad:active` dans l’ancienne couche V3 ;
- consolidation du fond final du hero dans son module propriétaire ;
- consolidation de l’espacement final du ticker et suppression de l’override interne `::after` ;
- suppression du fond générique inutile des trois visuels projets, chacun ayant déjà son fond final ;
- suppression du `position: static` responsive du panneau de brief, rendu inopérant par la règle finale V3 ;
- consolidation de l’état actif des boutons `.choice` afin de ne plus dépendre d’un override tardif ;
- suppression du fond jaune intermédiaire inutile de `.brief-output` avant son fond noir final ;
- suppression de `experience.css` : ses règles sont désormais rattachées à leurs modules fonctionnels.

`responsive.css` reste chargé en dernier afin de rendre la cascade explicite.
