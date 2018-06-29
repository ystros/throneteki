const Event = require('../event');
const GameAction = require('./GameAction');

class LeavePlay extends GameAction {
    constructor() {
        super('leavePlay');
    }

    canChangeGameState({ card }) {
        return ['play area', 'active plot'].includes(card.location);
    }

    createEvent({ card, player, allowSave = true }) {
        let params = {
            player: player || card.controller,
            card: card,
            allowSave: allowSave,
            automaticSaveWithDupe: card.location === 'play area'
        };
        return new Event('onCardLeftPlay', params, event => {
            // TODO: Attachment and dupe removal should be simultaneous to the
            // left play event.
            if(['attachment', 'character', 'location'].includes(card.getType())) {
                for(const attachment of card.attachments) {
                    event.player.removeAttachment(attachment, false);
                }

                if(card.dupes.length !== 0) {
                    event.player.discardCards(card.dupes, false);
                }
            }

            card.leavesPlay();
        });
    }
}

module.exports = new LeavePlay();
