const GameAction = require('./GameAction');
const DiscardCard = require('./DiscardCard');
const GroupedCardEvent = require('../GroupedCardEvent');

class MultiDiscard extends GameAction {
    canChangeGameState({ cards }) {
        return cards.some(card => DiscardCard.canChangeGameState({ card }));
    }

    isImmune({ cards }) {
        return cards.every(card => DiscardCard.isImmune({ card }));
    }

    createEvent({ cards, allowSave = true, force = false }) {
        let discardableCards = cards.filter(card => DiscardCard.allow({ card, allowSave, force }));

        let params = {
            cards: discardableCards,
            player: discardableCards[0].controller,
            allowSave: allowSave,
            automaticSaveWithDupe: true,
            originalLocation: discardableCards[0].location
        };
        let event = new GroupedCardEvent('onCardsDiscarded', params);
        for(let card of discardableCards) {
            event.addChildEvent(DiscardCard.createEvent({ card, allowSave }));
        }
        return event;
    }
}

module.exports = new MultiDiscard();
