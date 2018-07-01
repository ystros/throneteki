const GameAction = require('./GameAction');
const MultiDiscard = require('./MultiDiscard');

class DiscardTopCards extends GameAction {
    canChangeGameState({ player }) {
        return player.drawDeck.length !== 0;
    }

    createEvent({ player, amount = 1 }) {
        let cards = player.drawDeck.slice(0, Math.min(amount, player.drawDeck.length));
        return MultiDiscard.createEvent({ cards, allowSave: false }).thenExecute(() => {
            if(player.drawDeck.length === 0) {
                player.game.playerDecked(player);
            }
        });
    }
}

module.exports = new DiscardTopCards();
