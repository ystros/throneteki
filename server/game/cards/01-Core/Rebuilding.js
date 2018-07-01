const PlotCard = require('../../plotcard.js');

class Rebuilding extends PlotCard {
    setupCardAbilities() {
        this.whenRevealed({
            target: {
                numCards: 3,
                activePromptTitle: 'Select up to 3 cards',
                cardCondition: card => this.controller === card.controller && card.location === 'discard pile'
            },
            handler: context => {
                for(let card of context.target) {
                    this.controller.shuffleCardIntoDeck(card);
                }

                this.game.addMessage('{0} uses {1} to shuffle {2} into their deck', this.controller, this, context.target);
            }
        });
    }
}

Rebuilding.code = '01019';

module.exports = Rebuilding;
