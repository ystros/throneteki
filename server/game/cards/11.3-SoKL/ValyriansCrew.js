const DrawCard = require('../../drawcard');
const FacedownDrawCard = require('../../FacedownDrawCard');

class ValyriansCrew extends DrawCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            effect: [
                ability.effects.canMarshal(card => this.isFacedownAttachment(card) && card.getPrintedType() !== 'event'),
                ability.effects.canPlay(card => this.isFacedownAttachment(card) && card.getPrintedType() === 'event')
            ]
        });

        this.reaction({
            when: {
                afterChallenge: event => event.challenge.winner === this.controller && this.isAttacking()
            },
            handler: context => {
                let opponent = context.event.challenge.loser;
                let topCard = opponent.drawDeck[0];
                let attachment = new FacedownDrawCard(topCard);

                context.player.attach(context.player, attachment, this, 'play', true);

                // The "as an attachment with terminal" effect is a lasting
                // effect, so the terminal keyword is not part of the facedown
                // card's text and thus cannot be blanked.
                this.lastingEffect(() => ({
                    condition: () => !!attachment.parent,
                    targetLocation: 'any',
                    match: attachment,
                    effect: [
                        ability.effects.setCardType('attachment'),
                        ability.effects.addKeyword('Terminal')
                    ]
                }));

                this.game.addMessage('{0} uses {1} to attach the top card of {2}\'s deck under {1}', context.player, this, opponent);
            }
        });
    }

    isFacedownAttachment(card) {
        return this.attachments.some(attachment => attachment.facedown && attachment.controller === this.controller && attachment.wrappedCard === card);
    }
}

ValyriansCrew.code = '11047';

module.exports = ValyriansCrew;
