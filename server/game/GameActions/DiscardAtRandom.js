const sample = require('lodash.sample');
const GameAction = require('./GameAction');
const MultiDiscard = require('./MultiDiscard');

class DiscardAtRandom extends GameAction {
    canChangeGameState({ player }) {
        return player.hand.length !== 0;
    }

    createEvent({ player, amount = 1 }) {
        let toDiscard = Math.min(amount, player.hand.length);
        let cards = [];

        while(cards.length < toDiscard) {
            let card = sample(player.hand);
            if(!cards.includes(card)) {
                cards.push(card);
            }
        }

        return MultiDiscard.createEvent({ cards, allowSave: false }).thenExecute(event => {
            player.game.addMessage('{0} discards {1} at random', player, event.cards);
        });
    }
}

module.exports = new DiscardAtRandom();
