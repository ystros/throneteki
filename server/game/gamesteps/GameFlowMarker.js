const BaseStep = require('./basestep');

class GameFlowMarker extends BaseStep {
    constructor(game, name) {
        super(game);

        this.name = name;
    }

    continue() {
        this.game.currentFlowStep = this.name;
    }
}

module.exports = GameFlowMarker;
