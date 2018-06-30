const _ = require('underscore');

const BaseStep = require('./basestep');
const GroupedCardEvent = require('../GroupedCardEvent');
const Kill = require('../GameActions/Kill');

class KillCharacters extends BaseStep {
    constructor(game, cards, options) {
        super(game);

        this.cards = cards;
        this.options = options;
    }

    continue() {
        let killable = this.cards.filter(card => Kill.allow({
            allowSave: this.options.allowSave,
            card: card,
            force: this.options.force,
            isBurn: this.options.isBurn
        }));

        if(killable.length === 0) {
            return;
        }

        for(let card of killable) {
            card.markAsInDanger();
        }

        let params = {
            allowSave: this.options.allowSave,
            automaticSaveWithDupe: true,
            cards: killable,
            isBurn: this.options.isBurn,
            snapshots: killable.map(card => card.createSnapshot())
        };
        this.event = new GroupedCardEvent('onCharactersKilled', params);
        let childEvents = killable.map(card => Kill.createEvent({
            allowSave: this.options.allowSave,
            card: card,
            isBurn: this.options.isBurn
        }));
        for(let childEvent of childEvents) {
            this.event.addChildEvent(childEvent);
        }
        this.event.thenExecute(() => this.promptForDeadPileOrder())
            .thenExecute(() => {
                for(let card of killable) {
                    card.clearDanger();
                }
            });
        this.game.resolveEvent(this.event);
    }

    promptForDeadPileOrder() {
        _.each(this.game.getPlayersInFirstPlayerOrder(), player => {
            this.promptPlayerForDeadPileOrder(player);
        });
    }

    promptPlayerForDeadPileOrder(player) {
        let cardsOwnedByPlayer = this.event.cards.filter(card => card.owner === player && card.location === 'play area');

        if(_.size(cardsOwnedByPlayer) <= 1) {
            this.moveCardsToDeadPile(cardsOwnedByPlayer);
            return;
        }

        this.game.promptForSelect(player, {
            ordered: true,
            mode: 'exactly',
            numCards: _.size(cardsOwnedByPlayer),
            activePromptTitle: 'Select order to place cards in dead pile (top first)',
            cardCondition: card => cardsOwnedByPlayer.includes(card),
            onSelect: (player, selectedCards) => {
                this.moveCardsToDeadPile(selectedCards.reverse());

                return true;
            },
            onCancel: () => {
                this.moveCardsToDeadPile(cardsOwnedByPlayer);
                return true;
            }
        });
    }

    moveCardsToDeadPile(cards) {
        for(let card of cards) {
            card.owner.moveCard(card, 'dead pile');
        }
    }
}

module.exports = KillCharacters;
