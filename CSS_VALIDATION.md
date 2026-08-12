# Validation du refactoring CSS

## Garanties vérifiées

- `index.html` inchangé octet pour octet.
- `assets/js/app.js`, `data.js` et `utils.js` inchangés.
- 22 fichiers CSS au total, dont 21 modules importés par `assets/css/index.css`.
- 0 import CSS manquant.
- 0 erreur de parsing CSS avec `tinycss2`.
- 0 erreur de syntaxe JavaScript avec `node --check`.
- 0 groupe de déclaration exactement dupliqué après refactoring.
- 0 override restant pour un même sélecteur / propriété / contexte média dans la feuille finale.

## Régression visuelle

La V3 originale et la version refactorée ont été rendues à partir du même DOM, avec animations figées afin de comparer uniquement le CSS.

### Viewports

- 1440 × 1200 : styles calculés identiques, capture sans différence pixel.
- 900 × 1000 : styles calculés identiques, capture sans différence pixel.
- 390 × 844 : styles calculés identiques, capture sans différence pixel.

### États interactifs comparés

- navigation desktop au survol ;
- CTA principal du hero ;
- IDEA MACHINE ;
- pads ;
- liste du manifeste ;
- cartes Pratique ;
- cartes Projet ;
- cartes Méthode ;
- timeline ;
- CTA Contact ;
- boutons de choix du Studio.

Pour ces états, aucune différence pixel n'a été détectée.

### Préférences / variantes comparées

- `high-contrast` ;
- `palette-studio` ;
- `palette-mono` ;
- `reduce-motion` ;
- menu mobile ouvert : styles calculés identiques.

Le refactoring est donc structurel : il ne modifie pas le rendu CSS attendu.
