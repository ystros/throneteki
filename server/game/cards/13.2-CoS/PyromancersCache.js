const DrawCard = require('../../drawcard');

class PyromancersCache extends DrawCard {
    setupCardAbilities(ability) {
        this.attachmentRestriction({ type: 'location' });

        this.whileAttached({
            effect: [
                ability.effects.blankExcludingTraits,
                ability.effects.gainText(text => this.setupDrawAbility(ability, text))
            ]
        });
    }

    setupDrawAbility(ability, text) {
        text.action({
            title: 'Draw 1 card',
            condition: context => context.player.canDraw(),
            cost: ability.costs.kneelSelf(),
            message: '{player} kneels {source} to draw 1 card',
            handler: context => {
                context.player.drawCardsToHand(1);
            }
        });
    }
}

PyromancersCache.code = '13030';

module.exports = PyromancersCache;

