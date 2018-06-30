const GameAction = require('./GameAction');
const PlaceCard = require('./PlaceCard');
const LeavePlay = require('./LeavePlay');

class DiscardCard extends GameAction {
    constructor() {
        super('discard');
    }

    canChangeGameState({ card }) {
        return card.location !== 'discard pile';
    }

    isImmune(props) {
        if(props.card.location === 'play area') {
            return super.isImmune(props) || LeavePlay.isImmune(props);
        }

        return super.isImmune(props);
    }

    createEvent({ card, allowSave = true }) {
        let params = {
            allowSave: allowSave,
            card: card,
            originalLocation: card.location
        };
        let event = this.event('onCardDiscarded', params, event => {
            event.thenAttachEvent(PlaceCard.createEvent({ card: event.card, player: event.card.owner, location: 'discard pile' }));
        });

        if(card.location === 'play area') {
            return this.atomic(
                event,
                LeavePlay.createEvent({ card, allowSave })
            );
        }

        return event;
    }
}

module.exports = new DiscardCard();
