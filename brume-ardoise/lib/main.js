// Brume : désélection au clic, comme dans Mail.
//
// 1. Clic dans la zone vide de la liste (sous la dernière ligne) : plus de fil ouvert
//    dans le volet de lecture, plus de cases cochées, plus de curseur clavier.
// 2. Clic ailleurs dans la fenêtre (barre latérale, volet de lecture...) : le curseur
//    clavier de la liste (le cadre autour de la dernière ligne cliquée) disparaît.
//    Les cases cochées et le fil ouvert sont conservés.
//
// Seul comportement du thème qui demande du code : Mailspring ne gère pas ces clics, et
// une feuille de style ne peut pas modifier une sélection. Le module est chargé à
// l'activation du thème et retiré quand on en change.
//
// Le module ajoute aussi un bouton "relever le courrier" en haut à droite de la liste des
// fils (voir SyncNowButton, en fin de fichier).

const LISTS = [
  { selector: '.thread-list', collection: 'thread' },
  { selector: '.draft-list', collection: 'draft' },
];

// Zones de la liste qui ne sont pas du vide : lignes, barre de défilement, en-têtes,
// contrôles éventuels.
const NOT_EMPTY = '.list-item, .scrollbar-track, .list-tabular-header, button, input, a';

// Zones qui agissent sur la liste : un clic dedans ne doit rien désélectionner (barre
// d'outils et sa barre de sélection multiple, menus et popovers ouverts depuis la liste).
const ACTS_ON_LIST = '.sheet-toolbar-container, .fixed-popover-container, .modal-container';

function ms() {
  return require('mailspring-exports');
}

function clearKeyboardCursor(collection) {
  const { Actions, FocusedContentStore } = ms();
  if (FocusedContentStore.keyboardCursor(collection)) {
    Actions.setCursorPosition({ collection, item: null });
  }
}

// Élément sous le pointeur à l'appui. Chromium envoie le "click" à l'ancêtre commun de
// l'appui et du relâchement : un clic qui glisse d'une ligne à l'autre (ou des lignes qui
// bougent pendant le clic, à l'arrivée d'un message) tomberait sur le conteneur de la
// liste et passerait pour un clic dans le vide. On n'agit que si les deux coïncident.
let pointerDownTarget = null;

function onPointerDown(event) {
  pointerDownTarget = event.target;
}

function onClick(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (pointerDownTarget !== target) return;

  const list = LISTS.find((l) => target.closest(l.selector));

  // 2. Clic hors de la liste.
  if (!list) {
    if (target.closest(ACTS_ON_LIST)) return;
    for (const l of LISTS) {
      if (document.querySelector(`${l.selector} .keyboard-cursor`)) {
        clearKeyboardCursor(l.collection);
      }
    }
    return;
  }

  // 1. Clic dans la zone vide de la liste.
  if (!target.closest('.list-container') || target.closest(NOT_EMPTY)) return;

  const { Actions, FocusedContentStore, WorkspaceStore } = ms();

  // Cases cochées (sélection multiple).
  AppEnv.commands.dispatch('multiselect-list:deselect-all');

  // Fil affiché dans le volet de lecture (disposition en colonnes uniquement : en mode
  // liste, la liste n'est pas visible quand un fil est ouvert).
  if (WorkspaceStore.layoutMode() === 'split' && FocusedContentStore.focused(list.collection)) {
    Actions.setFocus({ collection: list.collection, item: null });
  }

  clearKeyboardCursor(list.collection);
}

// Bouton "relever le courrier", en haut à droite de la fenêtre sur l'écran des fils :
// au bout du ruban de la recherche en disposition liste, au bout de la barre du volet de
// lecture en colonnes (Mailspring place toujours les éléments "Toolbar.Right" d'une feuille
// dans sa dernière colonne). Il envoie la même commande que F5 (window:sync-mail-now :
// réveil des processus de synchronisation de chaque compte). La commande est écoutée sur
// document.body ; dispatch la lance depuis l'élément actif et elle remonte jusque-là.
// L'icône fait un tour au clic : Mailspring ne signale pas la fin d'un relevé.
let SyncNowButton = null;

function buildSyncNowButton() {
  // React vient de mailspring-exports : seul src/global/ est ajouté aux chemins de
  // recherche des modules, un require('react') échouerait depuis le dossier du thème.
  const { React, localized } = ms();
  const label = localized('Sync New Mail Now');

  class BrumeSyncNowButton extends React.Component {
    constructor(props) {
      super(props);
      this.state = { spinning: false };
      this.timer = null;
      this.onClick = () => {
        AppEnv.commands.dispatch('window:sync-mail-now');
        clearTimeout(this.timer);
        this.setState({ spinning: false }, () => {
          this.setState({ spinning: true });
          this.timer = setTimeout(() => this.setState({ spinning: false }), 700);
        });
      };
    }
    componentWillUnmount() {
      clearTimeout(this.timer);
    }
    render() {
      const cls = `btn btn-toolbar brume-sync-now${this.state.spinning ? ' spinning' : ''}`;
      return React.createElement(
        'button',
        {
          tabIndex: -1,
          className: cls,
          title: `${label} (F5)`,
          'aria-label': label,
          style: { order: 400 }, // avant la bascule de la barre latérale (500)
          onClick: this.onClick,
        },
        React.createElement('span', { className: 'brume-sync-now-icon', 'aria-hidden': 'true' })
      );
    }
  }
  BrumeSyncNowButton.displayName = 'BrumeSyncNowButton';
  return BrumeSyncNowButton;
}

module.exports = {
  activate() {
    if (!AppEnv.isMainWindow()) return;
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('click', onClick);

    const { ComponentRegistry, WorkspaceStore } = ms();
    SyncNowButton = buildSyncNowButton();
    ComponentRegistry.register(SyncNowButton, {
      location: WorkspaceStore.Sheet.Threads.Toolbar.Right,
    });
  },
  deactivate() {
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('click', onClick);
    if (SyncNowButton) {
      ms().ComponentRegistry.unregister(SyncNowButton);
      SyncNowButton = null;
    }
  },
};
