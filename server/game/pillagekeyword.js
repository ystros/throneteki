const BaseAbility = require('./baseability.js');

class PillageKeyword extends BaseAbility {
    constructor() {
        super({});
        this.title = 'Pillage';
    }

    meetsRequirements() {
        return true;
    }

    executeHandler(context) {
        let {game, challenge, source} = context;
        game.queueSimpleStep(() => {
            challenge.loser.discardFromDraw(1).thenExecute(event => {
                let discarded = event.cards[0];
                game.raiseEvent('onPillage', { challenge: challenge, source: source, discardedCard: discarded });

                game.addMessage('{0} discards {1} from the top of their deck due to Pillage from {2}', challenge.loser, discarded, source);
            });
        });
    }
}

module.exports = PillageKeyword;
