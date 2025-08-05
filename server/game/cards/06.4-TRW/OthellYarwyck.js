import DrawCard from '../../drawcard.js';

class OthellYarwyck extends DrawCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Give icon',
            cost: ability.costs.kneel(
                (card) => card.isFaction('thenightswatch') && card.getType() === 'location'
            ),
            target: {
                cardCondition: (card) =>
                    card.location === 'play area' &&
                    card.isFaction('thenightswatch') &&
                    card.getType() === 'character'
            },
            handler: async (context) => {
                const icon = await this.game.promptForIcon(this.controller, this);
                this.untilEndOfPhase((ability) => ({
                    match: context.target,
                    effect: ability.effects.addIcon(icon)
                }));

                this.game.addMessage(
                    '{0} uses {1} and kneels {2} to give {3} {4} {5} icon until the end of the phase',
                    this.controller,
                    this,
                    context.costs.kneel,
                    context.target,
                    icon === 'intrigue' ? 'an' : 'a',
                    icon
                );
            }
        });
    }
}

OthellYarwyck.code = '06065';

export default OthellYarwyck;
