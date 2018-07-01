const GameAction = require('./GameAction');
const MoveCard = require('./PlaceCard');
const SimultaneousEvents = require('../SimultaneousEvents');

class ShuffleIntoDeck extends GameAction {
    constructor() {
        super('shuffleIntoDeck');
    }

    isImmune({ cards, allowSave = true }) {
        return cards.every(card => MoveCard.isImmune({ card, allowSave, player: card.owner, location: 'draw deck' }));
    }

    createEvent({ cards, allowSave = true }) {
        let event = new SimultaneousEvents();
        let moveableCards = cards.filter(card => MoveCard.allow({ card, allowSave, player: card.owner, location: 'draw deck' }));

        for(let card of moveableCards) {
            event.addChildEvent(MoveCard.createEvent({ card, allowSave, player: card.owner, location: 'draw deck' }));
        }

        event.thenExecute(() => {
            let owners = [...new Set(moveableCards.map(card => card.owner))];
            for(let owner of owners) {
                owner.shuffleDrawDeck();
            }
        });

        return event;
    }
}

module.exports = new ShuffleIntoDeck();
