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

function onClick(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  const target = event.target;
  if (!(target instanceof Element)) return;

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

module.exports = {
  activate() {
    if (!AppEnv.isMainWindow()) return;
    document.addEventListener('click', onClick);
  },
  deactivate() {
    document.removeEventListener('click', onClick);
  },
};
