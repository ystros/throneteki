const BaseStep = require('./basestep.js');
const GamePipeline = require('../gamepipeline.js');
const SimpleStep = require('./simplestep.js');

class InterruptWindow extends BaseStep {
    constructor(game, event, postHandlerFunc = () => true) {
        super(game);

        this.event = event;
        this.pipeline = new GamePipeline();
        this.pipeline.initialise([
            new SimpleStep(game, () => this.openAbilityWindow('cancelinterrupt')),
            new SimpleStep(game, () => this.automaticSaveWithDupes()),
            new SimpleStep(game, () => this.openAbilityWindow('forcedinterrupt')),
            new SimpleStep(game, () => this.openAbilityWindow('interrupt')),
            new SimpleStep(game, () => this.choosePlacementOrder()),
            new SimpleStep(game, () => this.executeHandler()),
            new SimpleStep(game, () => this.openWindowForAttachedEvents()),
            new SimpleStep(game, () => this.executePostHandler()),
            new SimpleStep(game, () => this.openWindowForAttachedEvents())
        ]);
        this.postHandlerFunc = postHandlerFunc;
    }

    queueStep(step) {
        this.pipeline.queueStep(step);
    }

    isComplete() {
        return this.pipeline.length === 0;
    }

    onCardClicked(player, card) {
        return this.pipeline.handleCardClicked(player, card);
    }

    onMenuCommand(player, arg, method, promptId) {
        return this.pipeline.handleMenuCommand(player, arg, method, promptId);
    }

    cancelStep() {
        this.pipeline.cancelStep();
    }

    continue() {
        return this.pipeline.continue();
    }

    automaticSaveWithDupes() {
        if(this.event.cancelled) {
            return;
        }

        for(let event of this.event.getConcurrentEvents()) {
            if(event.allowAutomaticSave() && this.game.saveWithDupe(event.card)) {
                event.cancel();
            }
        }
    }

    openAbilityWindow(abilityType) {
        if(this.event.cancelled) {
            return;
        }

        this.game.openAbilityWindow({
            abilityType: abilityType,
            event: this.event
        });
    }

    choosePlacementOrder() {
        const placeCardEvents = this.event.getConcurrentEvents().filter(event => event.name === 'onCardPlaced' && event.location === 'dead pile');

        for(let player of this.game.getPlayersInFirstPlayerOrder()) {
            const placeCardEventsForPlayer = placeCardEvents.filter(event => event.player === player);

            if(placeCardEventsForPlayer.length < 2) {
                continue;
            }
            const cardsToEvents = new Map();
            for(const event of placeCardEventsForPlayer) {
                cardsToEvents.set(event.card, event);
            }

            this.game.promptForSelect(player, {
                ordered: true,
                mode: 'exactly',
                numCards: placeCardEventsForPlayer.length,
                activePromptTitle: 'Select order to place cards in dead pile (top first)',
                cardCondition: card => cardsToEvents.has(card),
                onSelect: (player, selectedCards) => {
                    let order = 0;
                    for(const card of selectedCards.reverse()) {
                        const event = cardsToEvents.get(card);
                        event.order = order;
                        order += 1;
                    }

                    return true;
                },
                onCancel: () => {
                    return true;
                }
            });
        }
    }

    executeHandler() {
        if(this.event.cancelled) {
            return;
        }

        const events = this.event.getConcurrentEvents().sort((a, b) => a.order > b.order ? 1 : 0);
        for(const event of events) {
            event.executeHandler();
        }
    }

    openWindowForAttachedEvents() {
        if(this.event.cancelled) {
            return;
        }

        this.game.openInterruptWindowForAttachedEvents(this.event);
    }

    executePostHandler() {
        if(this.event.cancelled) {
            return;
        }

        this.event.executePostHandler();
        this.postHandlerFunc();
    }
}

module.exports = InterruptWindow;
