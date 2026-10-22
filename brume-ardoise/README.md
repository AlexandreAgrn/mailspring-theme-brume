# Brume Ardoise

Variante de couleur de Brume pour Mailspring : la barre latérale ardoise et l'accent corail de Darkside. Les règles sont strictement celles de Brume ; seuls des jetons de couleur changent.

## Installation

1. Menu Mailspring > Install Theme..., puis choisir le dossier `brume-ardoise`.
2. Menu Mailspring > Change Theme..., puis "Brume Ardoise".
3. **Quitter complètement Mailspring (Cmd+Q) et le relancer**, sinon la première fenêtre "New Message" garde le thème par défaut.

Brume et Brume Ardoise s'installent côte à côte : on bascule de l'un à l'autre depuis Change Theme....

## Ce qui change par rapport à Brume

Uniquement des couleurs, toutes redéfinies dans le bloc "Ardoise" à la fin de `styles/ui-variables.less` :

- barre latérale et sa portion de barre d'outils en ardoise `#2f2e42` (Darkside), texte clair, sélection blanche sur pastille translucide, icône sélectionnée et compteurs en corail (compteur de la ligne sélectionnée en blanc) ;
- accent corail : pastel pour les aplats, profond pour le texte sur fond clair ;
- barre d'outils blanche comme la liste, lecture teintée d'ardoise (`#f5f5f7`) ;
- menus : sélection en aplat corail doux et texte encre (le corail pastel ne supporte pas le texte blanc).

Géométrie, typographie, marges, rayons, ombres et comportement sont identiques à Brume, élément par élément.

## Palette

| Rôle | Couleur | Contraste |
|---|---|---|
| Barre latérale | `#2f2e42` | |
| Texte de la barre latérale | `#b9b8cc` | 6,8:1 sur la barre latérale |
| Intitulés de la barre latérale | `#b9b8cc` à 78% | 4,5:1 sur la barre latérale |
| Sélection | blanc | 13,2:1 |
| Corail pastel (aplats) | `#f0937a` | 5,8:1 avec le texte ardoise posé dessus |
| Corail profond (texte sur clair) | `#b24e37` | 5,2:1 sur blanc |
| Lecture | `#f5f5f7` | |

Le corail pastel ne porte jamais de texte blanc (2,3:1, illisible) : le bouton Envoyer, les compteurs pleins et les menus utilisent le texte ardoise.

## Personnalisation

- **Largeur de la barre latérale** : `@brume-sidebar-min-width` et `@brume-sidebar-max-width` (200 à 420pt, contre 165 à 250pt d'origine). **Hauteur des lignes** de la liste : `@brume-thread-row-wide` et `@brume-thread-row-narrow`. Mailspring lit ces valeurs au démarrage : il faut le relancer après les avoir changées.

Couleurs : bloc "Ardoise" à la fin de `styles/ui-variables.less`. Le reste des jetons (géométrie, rayons, ombres) est documenté dans le README de Brume.

Le comportement (désélection au clic, `lib/main.js`) est le même que dans Brume.

## Limites connues

- Pas de suivi de l'accent macOS.
- Les limites de Brume s'appliquent (fenêtre opaque, pas de réfraction).
