const GameAction = require('./GameAction');
const MoveCardAction = require('./MoveCardAction');

class SacrificeCard extends GameAction {
    constructor() {
        super('sacrifice');
    }

    canChangeGameState({ card }) {
        return card.location === 'play area';
    }

    createEvent({ card, player }) {
        player = player || card.controller;
        return this.event('onSacrificed', { card, player }, event => {
            event.cardStateWhenSacrificed = event.card.createSnapshot();
        });
    }
}

class SacrificeDescriptor {
    constructor() {
        this.name = 'sacrifice';
        this.targetLocation = 'discard pile';
        this.leavePlayProps = { allowSave: false };
        this.eventName = 'onSacrificed';
    }

    canChangeGameState({ card }) {
        return card.location === 'play area';
    }

    eventHandler(event) {
        event.cardStateWhenSacrificed = event.card.createSnapshot();
    }
}

module.exports = new MoveCardAction({
    internalAction: new SacrificeCard(),
    targetLocation: 'discard pile',
    leavePlayProps: { allowSave: false }
});
