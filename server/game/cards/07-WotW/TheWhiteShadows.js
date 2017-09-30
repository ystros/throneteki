const PlotCard = require('../../plotcard.js');

class TheWhiteShadows extends PlotCard {
    setupCardAbilities() {
        this.reaction({
            when: {
                onCharacterKilled: event => this.controller !== event.cardStateWhenKilled.controller
            },
            handler: context => {
                this.atEndOfPhase(ability => ({
                    match: context.event.card,
                    targetLocation: ['dead pile', 'play area'],
                    effect: [
                        ability.effects.blank,
                        ability.effects.moveToDeadPileIfStillInPlay()
                    ]
                }));

                this.controller.putIntoPlay(context.event.card);
                this.game.addMessage('{0} uses {1} to put {2} into play under their control, blank',
                    this.controller, this, context.event.card);
            }
        });
    }
}

TheWhiteShadows.code = '07050';

module.exports = TheWhiteShadows;
