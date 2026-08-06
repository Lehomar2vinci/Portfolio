# Portfolio — Nathan Chambrette

Version complète corrigée du portfolio.

## Correction du ticker

Le ticker est construit avec deux groupes strictement identiques. JavaScript répète automatiquement la séquence jusqu'à dépasser la largeur visible, clone ensuite le groupe complet, puis CSS déplace la piste de droite vers la gauche sur exactement 50 % de sa largeur. Le raccord entre les deux groupes est donc continu, sans espace ni saut.

Le comportement respecte toujours le mode « réduction des animations » du site et la préférence système `prefers-reduced-motion`.
