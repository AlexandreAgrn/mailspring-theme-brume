# Brume

Thème clair pour Mailspring : minimaliste, pastel, aligné sur le langage Liquid Glass de macOS 26.

## Installation

1. Menu Mailspring > Install Theme..., puis choisir le dossier `brume` (Mailspring le copie dans ses paquets).
2. Menu Mailspring > Change Theme..., puis "Brume". En mode automatique (clair/sombre selon le système), le choisir comme thème clair dans Préférences > Apparence.

**Après l'installation, quitter complètement Mailspring (Cmd+Q) et le relancer.** Mailspring garde une fenêtre de composition préchargée qui ne voit que les thèmes présents à son ouverture : sans redémarrage, la première fenêtre "New Message" s'affiche avec le thème par défaut.

Pour itérer : modifier les fichiers copiés dans `~/Library/Application Support/Mailspring/packages/brume/styles`, puis menu Developer > Reload.

## Principes

| Principe Liquid Glass | Traduction dans Brume |
|---|---|
| Le verre est réservé aux calques flottants | Popovers, menus, suggestions de recherche : verre clair flouté. Le contenu (liste, messages) reste opaque. |
| Pas de verre sur du verre | Les fonds internes des menus sont neutralisés dans les calques de verre. |
| Rayons concentriques | Échelle unique 6 / 8 / 10 / 14 / 20pt + capsule ; rayon intérieur = rayon extérieur - marge (calque 14, marge 6, pastille 8 ; plateau 14, marge 4, bouton 10). |
| Contenu jusqu'au bord, pas de séparateurs durs | Chaque segment de la barre d'outils prend la teinte de sa colonne ; plus de filet sous la barre. |
| Contrôles en capsule | Boutons, recherche, jetons, bouton Envoyer, expéditeur du composeur, interrupteurs, toast "annuler". |
| Barres d'outils flottantes | Composeur : mise en forme dans une bulle qui reste visible au défilement (sans sautillement), actions dans une capsule posée en bas. |
| Boutons de fenêtre centrés | Centrés sur l'axe de la barre d'outils, marge gauche égale à la marge verticale (16pt). |
| Accent rare | Pervenche, réservé à la sélection, au bouton principal et aux liens. |
| Réglages d'accessibilité prioritaires | Réduire la transparence, réduire les animations, augmenter le contraste. |

## Palette

| Rôle | Couleur | Contraste |
|---|---|---|
| Texte | `#1f2230` | 15,8:1 sur blanc |
| Texte secondaire | encre à 72% | 5,9:1 |
| Texte tertiaire, icônes | encre à 64% | 4,5:1 sur toutes les surfaces claires |
| Accent (encre) | `#5558c8` | 5,8:1 sur blanc |
| Surface chrome | `#f2f1f8` | |
| Contenu | `#ffffff` | |
| Lecture | `#f7f7fb` | |
| Sauge, pêche, rose, ciel | `#2e7a55`, `#a2561f`, `#b13a4e`, `#2d6c9c` | AA sur blanc |
| Sauge et pêche foncées | `@brume-sage-strong`, `@brume-peach-strong` | AA sur leurs aplats pastel |

Les aplats pastel (sélection, survol) sont calculés à partir de l'accent avec `color-mix()` : changer l'accent recolore tout.

## Personnalisation

- **Largeur de la barre latérale** : `@brume-sidebar-min-width` et `@brume-sidebar-max-width` (200 à 420pt, contre 165 à 250pt d'origine). **Hauteur des lignes** de la liste : `@brume-thread-row-wide` et `@brume-thread-row-narrow`. Mailspring lit ces valeurs au démarrage : il faut le relancer après les avoir changées.

- **Accent** : `@brume-accent` dans `styles/ui-variables.less`.
- **Suivre l'accent de macOS** : dans `styles/index.less`, remplacer `--brume-accent: @brume-accent;` par `--brume-accent: var(--system-accent, @{brume-accent});`. Aplats, bouton principal et anneaux de focus suivront.
- **Opacité du verre** : `@brume-glass-fill` (72% par défaut).

## Design system

Toutes les règles (`styles/partials/`) n'utilisent que des jetons définis dans `styles/ui-variables.less`. Une variante de couleur ne redéfinit que des jetons : c'est ainsi qu'est construit Brume Ardoise, dont les règles sont strictement celles de Brume.

| Famille | Jetons |
|---|---|
| Palette | `@brume-ink`, `@brume-canvas`, `@brume-paper`, `@brume-mist`, `@brume-accent`, `@brume-accent-ink`, `@brume-on-accent`, encres pastel (`@brume-sage`, `@brume-rose`...) |
| Neutres | `@brume-fill-subtle` (4%), `@brume-fill` (6%), `@brume-fill-opaque`, `-opaque-strong`, `-opaque-pressed`, `@brume-hairline` (8%), `@brume-hairline-strong` (14%), `@brume-icon` (64%), `@brume-control-border` (30%), `@brume-scroll` |
| Accent dérivé | `@brume-accent-soft`, `@brume-accent-softer`, `@brume-accent-sidebar`, `@brume-accent-ring` (calculés à l'exécution depuis `--brume-accent`) |
| Rayons | `@brume-radius-xs` 6, `-s` 8, `-m` 10, `-l` 14, `-xl` 20, `@brume-capsule` |
| Pictogrammes | `@brume-glyph-*` : trait fin de 1,2pt à la taille d'affichage, grille 24, en masque (la couleur vient du fond de l'élément) |
| Ombres | `@brume-ring`, `@brume-card-shadow`, `@brume-card-shadow-down`, `@brume-capsule-edge`, `@brume-glass-*` |
| Barre latérale | `@brume-sidebar-*` (fond, texte, icônes, compteurs, survol, sélection, glisser-déposer, carte d'activité, roue de progression, alerte hors ligne), `@brume-toolbar-bg`, `@brume-compose-*` |
| Menus | `@brume-menu-selected-bg`, `-text`, `-secondary` |
| Dimensions | `@brume-sidebar-gutter` 16, `-pill-inset` 8, `-row-height` 32, bornes de largeur, hauteurs de lignes de la liste |

## Structure

```
lib/
  main.js                  désélection au clic, bouton de relève du courrier
styles/
  ui-variables.less        jetons uniquement (importé par tout Mailspring)
  theme-colors.less        couleurs de l'aperçu dans le sélecteur de thèmes
  index.less               point d'entrée
  partials/
    glass.less             calques flottants, menus
    surfaces.less          dimensions, teintes des colonnes, défilement
    toolbar.less           barre d'outils, boutons de fenêtre, bouton de composition
    sidebar.less           barre latérale, rail, sélecteur de compte
    thread-list.less       pastilles, séparateurs, cases, point "non lu", balayage
    message-list.less      cartes de message, zone de réponse, fiche contact
    controls.less          boutons, champs, focus, recherche
    composer.less          fenêtre "New Message" et réponses intégrées
    components.less        suggestions, jetons, pièces jointes, toasts, bandeaux,
                           reporter, interrupteurs, préférences, calendrier
    glyphs.less            pictogrammes au trait fin (généré, une variable par taille)
    icons.less             remplacement des icônes de Mailspring par ces pictogrammes
    features.less          fonctions de Mailspring : invitations, bandeaux, recherche
                           dans le fil, correcteur, envoi différé, dossiers vides
    preferences.less       listes et panneaux des Préférences, choix du thème,
                           fenêtres Pro, didacticiel
    accessibility.less     préférences système
```

## Comportement

Un clic dans la zone vide de la liste ferme le message ouvert et décoche la sélection ; un clic ailleurs dans la fenêtre retire le cadre du curseur clavier. Mailspring ne gère pas ces clics.

Un bouton "Sync New Mail Now" s'ajoute en haut à droite de la fenêtre (au bout du ruban de la recherche en disposition liste) : il envoie la même commande que F5.

Dans les indésirables (Spam, Junk), et seulement là, l'adresse de l'expéditeur s'affiche sous son nom : partie avant l'arobase atténuée, domaine en gras. Trop longue, l'adresse s'efface en fondu par son début et la fin du domaine reste lisible ; l'adresse complète est dans l'infobulle. Uniquement en affichage large (mode liste, ou liste de plus de 540pt) : l'affichage étroit de Mailspring n'a pas d'emplacement pour elle.

Ces trois comportements sont les seuls qui passent par du code (`lib/main.js`, chargé à l'activation du thème et retiré quand on en change).

## Limites connues

- La fenêtre de Mailspring est opaque : le bureau ne transparaît pas derrière la barre latérale, contrairement aux apps natives. Un thème ne peut pas activer la vibrance d'Electron.
- Pas de réfraction (effet "lentille") : CSS ne sait faire que du flou, ce qui reste plus lisible de toute façon.
- Corps des e-mails non retouchés : Mailspring les affiche dans un cadre isolé que les thèmes n'atteignent pas.
- Fenêtre de configuration d'un compte : Mailspring y désactive volontairement les thèmes.
- Pensé pour macOS. Sous Windows et Linux, il fonctionne mais les capsules de la barre d'outils sont propres à macOS.
