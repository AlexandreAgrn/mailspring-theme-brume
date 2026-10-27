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
// fils (voir SyncNowButton) et, dans les indésirables, l'adresse de l'expéditeur sous son
// nom (voir SenderAddress, en fin de fichier).

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

// Adresse de l'expéditeur, dans les indésirables uniquement : pour trier d'un coup d'oeil,
// le domaine compte plus que le nom affiché, que l'expéditeur choisit librement.
//
// Mailspring n'écrit que le nom dans la liste. Le seul emplacement prévu pour un module
// dans une ligne est celui des icônes (rôle ThreadListIcon, première colonne) ; le
// composant y reçoit le fil, donc ses messages et leurs expéditeurs. La feuille de style
// (thread-list.less) déplace ensuite l'adresse sous le nom.
//
// Le composant n'est enregistré que pendant l'affichage des indésirables, et retiré dès
// qu'on en sort. Raison : en affichage étroit, Mailspring ne rend qu'un seul composant de
// cet emplacement (le premier enregistré). Le thème est activé avant les modules de
// Mailspring : enregistré en permanence, il prendrait la place de l'icône de suivi
// d'ouverture (Open Tracking) dans toutes les vues, même en ne rendant rien.
//
// Pas de barrière d'erreur autour de cet emplacement (containersRequired={false}) :
// une exception casserait la ligne, d'où le try/catch.

// Expéditeurs distincts du fil, dans l'ordre des messages (le premier est celui que
// Mailspring nomme en tête de ligne). Repli sur les participants si les messages
// manquent.
function sendersOf(thread) {
  const senders = [];
  const seen = new Set();
  const add = (contact) => {
    const email = contact && typeof contact.email === 'string' ? contact.email.trim() : '';
    if (!email || seen.has(email.toLowerCase())) return;
    seen.add(email.toLowerCase());
    senders.push({ email, name: typeof contact.name === 'string' ? contact.name : '' });
  };
  for (const message of Array.isArray(thread.__messages) ? thread.__messages : []) {
    if (message.draft) continue;
    (message.from || []).forEach(add);
  }
  if (senders.length === 0) {
    (thread.participants || []).filter((c) => !(c.isMe && c.isMe())).forEach(add);
  }
  return senders;
}

function describeSender(thread) {
  const senders = sendersOf(thread);
  if (senders.length === 0) return null;
  const { email, name } = senders[0];
  // Sans nom affiché, Mailspring écrit déjà l'adresse à la place du nom : rien à ajouter.
  if (!name.trim() || name.trim().toLowerCase() === email.toLowerCase()) return null;
  const at = email.lastIndexOf('@');
  const local = at > 0 ? email.slice(0, at) : email;
  const domain = at > 0 ? email.slice(at + 1) : '';
  return { email, local, domain, others: senders.length - 1 };
}

function isSpamPerspective() {
  try {
    const perspective = ms().FocusedPerspectiveStore.current();
    return (
      !!perspective &&
      typeof perspective.categoriesSharedRole === 'function' &&
      perspective.categoriesSharedRole() === 'spam'
    );
  } catch (err) {
    return false;
  }
}

let SenderAddress = null;
let senderAddressRegistered = false;
let unlistenPerspective = null;

// Troncature : un fondu sur le bord coupé plutôt que des points de suspension, qui
// laissent un blanc variable contre l'arobase. Le fondu ne doit apparaître que si le texte
// déborde, ce qu'une feuille de style ne sait pas détecter : le composant mesure après
// chaque rendu et pose une classe (local-clipped, domain-clipped).
function buildSenderAddress() {
  const { React } = ms();
  const h = React.createElement;

  class BrumeSenderAddress extends React.Component {
    constructor(props) {
      super(props);
      this.state = { localClipped: false, domainClipped: false };
      this.localRef = React.createRef();
      this.domainClipRef = React.createRef();
      this.domainTextRef = React.createRef();
    }
    componentDidMount() {
      this.measure();
    }
    componentDidUpdate() {
      this.measure();
    }
    measure() {
      try {
        const local = this.localRef.current;
        const clip = this.domainClipRef.current;
        const text = this.domainTextRef.current;
        const localClipped = !!local && local.scrollWidth > local.clientWidth + 0.5;
        const domainClipped = !!clip && !!text && text.offsetWidth > clip.clientWidth + 0.5;
        if (
          localClipped !== this.state.localClipped ||
          domainClipped !== this.state.domainClipped
        ) {
          this.setState({ localClipped, domainClipped });
        }
      } catch (err) {
        // mesure impossible : texte simplement coupé, sans fondu
      }
    }
    render() {
      let sender = null;
      try {
        sender = this.props.thread ? describeSender(this.props.thread) : null;
      } catch (err) {
        sender = null;
      }
      if (!sender) return null;

      const { email, local, domain, others } = sender;
      const { localClipped, domainClipped } = this.state;
      const className = ['brume-sender']
        .concat(localClipped ? ['local-clipped'] : [])
        .concat(domainClipped ? ['domain-clipped'] : [])
        .join(' ');
      return h(
        'span',
        { className, title: email },
        h('span', { className: 'brume-sender-local', ref: this.localRef }, local),
        domain ? h('span', { className: 'brume-sender-at' }, '@') : null,
        domain
          ? h(
              'span',
              { className: 'brume-sender-domain' },
              h(
                'span',
                { className: 'brume-sender-domain-clip', ref: this.domainClipRef },
                h('bdi', { ref: this.domainTextRef }, domain)
              )
            )
          : null,
        others > 0 ? h('span', { className: 'brume-sender-more' }, `+${others}`) : null
      );
    }
  }
  BrumeSenderAddress.displayName = 'BrumeSenderAddress';
  BrumeSenderAddress.containerRequired = false;
  return BrumeSenderAddress;
}

function syncSenderAddress() {
  if (!SenderAddress) return;
  const wanted = isSpamPerspective();
  if (wanted === senderAddressRegistered) return;
  const { ComponentRegistry } = ms();
  if (wanted) {
    ComponentRegistry.register(SenderAddress, { role: 'ThreadListIcon' });
  } else {
    ComponentRegistry.unregister(SenderAddress);
  }
  senderAddressRegistered = wanted;
}

module.exports = {
  activate() {
    if (!AppEnv.isMainWindow()) return;
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('click', onClick);

    const { ComponentRegistry, WorkspaceStore, FocusedPerspectiveStore } = ms();
    SyncNowButton = buildSyncNowButton();
    ComponentRegistry.register(SyncNowButton, {
      location: WorkspaceStore.Sheet.Threads.Toolbar.Right,
    });

    SenderAddress = buildSenderAddress();
    unlistenPerspective = FocusedPerspectiveStore.listen(syncSenderAddress);
    syncSenderAddress();
  },
  deactivate() {
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('click', onClick);
    const { ComponentRegistry } = ms();
    if (SyncNowButton) {
      ComponentRegistry.unregister(SyncNowButton);
      SyncNowButton = null;
    }
    if (unlistenPerspective) {
      unlistenPerspective();
      unlistenPerspective = null;
    }
    if (senderAddressRegistered) {
      ComponentRegistry.unregister(SenderAddress);
      senderAddressRegistered = false;
    }
    SenderAddress = null;
  },
};
