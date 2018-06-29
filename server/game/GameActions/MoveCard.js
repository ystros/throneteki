const GameAction = require('./GameAction');
const PlaceCard = require('./PlaceCard');
const LeavePlay = require('./LeavePlay');

class MoveCard extends GameAction {
    constructor() {
        super('moveCard');
    }

    isImmune(props) {
        if(['play area', 'active plot'].includes(props.card.location)) {
            return LeavePlay.isImmune(props);
        }

        return super.isImmune(props);
    }

    createEvent({ card, player, location, bottom = false, allowSave = true }) {
        let moveEvent = this.event('onCardMoved', { card: card, originalLocation: card.location, newLocation: location, parentChanged: !!card.parent }, event => {
            event.thenAttachEvent(PlaceCard.createEvent({ card, player, location, bottom }));
        });

        if(['play area', 'active plot'].includes(card.location)) {
            return this.atomic(
                moveEvent,
                LeavePlay.createEvent({ card, player, allowSave })
            );
        }

        return moveEvent;
    }
}

module.exports = new MoveCard();
