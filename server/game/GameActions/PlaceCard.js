const GameAction = require('./GameAction');

class PlaceCard extends GameAction {
    createEvent({ card, location, player, bottom = false }) {
        return this.event('onCardPlaced', { card: card, location: location, player: player }, () => {
            player.placeCardInPile(card, location, { bottom: bottom });
        });
    }
}

module.exports = new PlaceCard();
