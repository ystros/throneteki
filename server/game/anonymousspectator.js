class AnonymousSpectator {
    constructor() {
        this.name = 'Anonymous';

        this.buttons = [];
        this.menuTitle = 'Spectator mode';
    }

    allowChat() {
        return false;
    }

    getCardSelectionState() {
        return {};
    }

    isSpectator() {
        return true;
    }
}

module.exports = AnonymousSpectator;
