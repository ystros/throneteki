const _ = require('underscore');
const BaseStep = require('./basestep.js');
const GamePipeline = require('../gamepipeline.js');
const GameFlowMarker = require('./GameFlowMarker.js');
const SimpleStep = require('./simplestep.js');

class Phase extends BaseStep {
    constructor(game, name) {
        super(game);
        this.name = name;
        this.pipeline = new GamePipeline();
    }

    initialise(steps) {
        let flowMarkerStep = new GameFlowMarker(this.game, this.name);
        let startStep = new SimpleStep(this.game, () => this.startPhase());
        let endStep = new SimpleStep(this.game, () => this.endPhase());
        this.pipeline.initialise([flowMarkerStep, startStep].concat(steps).concat([endStep]));
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

    onMenuCommand(player, arg, method) {
        return this.pipeline.handleMenuCommand(player, arg, method);
    }

    cancelStep() {
        this.pipeline.cancelStep();
    }

    continue() {
        return this.pipeline.continue();
    }

    startPhase() {
        this.game.currentPhase = this.name;
        _.each(this.game.getPlayers(), player => {
            player.phase = this.name;
        });
        this.game.reapplyStateDependentEffects();
        this.game.raiseEvent('onPhaseStarted', { phase: this.name });
    }

    endPhase() {
        this.game.raiseEvent('onPhaseEnded', { phase: this.name });
        this.game.currentPhase = '';
        _.each(this.game.getPlayers(), player => {
            player.phase = '';
        });
        this.game.raiseEvent('onAtEndOfPhase');
    }
}

module.exports = Phase;
