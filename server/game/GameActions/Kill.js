const GameAction = require('./GameAction');
const LeavePlay = require('./LeavePlay');

class Kill extends GameAction {
    constructor() {
        super('kill');
    }

    canChangeGameState({ card }) {
        return card.location === 'play area' && card.getType() === 'character';
    }

    isImmune(props) {
        return super.isImmune(props) || LeavePlay.isImmune({ card: props.card, allowSave: props.allowSave });
    }

    createEvent({ card, allowSave = true, isBurn = false }) {
        let event = this.event('onCharacterKilled', { card, allowSave, isBurn }, event => {
            let player = card.controller;

            if(card.location !== 'play area') {
                event.cancel();
                return;
            }

            event.cardStateWhenKilled = card.createSnapshot();
            player.game.addMessage('{0} kills {1}', player, card);
        });

        return this.atomic(
            event,
            LeavePlay.createEvent({ card: card, allowSave: allowSave })
        );
    }
}

module.exports = new Kill();
