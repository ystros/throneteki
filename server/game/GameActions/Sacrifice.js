const GameAction = require('./GameAction');
const LeavePlay = require('./LeavePlay');
const PlaceCard = require('./PlaceCard');

class Sacrifice extends GameAction {
    constructor() {
        super('sacrifice');
    }

    canChangeGameState({ card }) {
        return card.location === 'play area';
    }

    isImmune(props) {
        return super.isImmune(props) || LeavePlay.isImmune({ card: props.card, allowSave: false });
    }

    createEvent({ card }) {
        return this.atomic(
            this.event('onSacrificed', { player: card.controller, card: card }, event => {
                event.cardStateWhenSacrificed = card.createSnapshot();
                event.thenAttachEvent(PlaceCard.createEvent({ card: card, player: card.owner, location: 'discard pile' }));
            }),
            LeavePlay.createEvent({ card: card, allowSave: false })
        );
    }
}

module.exports = new Sacrifice();
