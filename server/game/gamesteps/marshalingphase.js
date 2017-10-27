const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const MarshalCardsPrompt = require('./marshaling/marshalcardsprompt.js');
const GameFlowMarker = require('./GameFlowMarker.js');

class MarshalingPhase extends Phase {
    constructor(game) {
        super(game, 'marshal');
        this.initialise([
            new SimpleStep(game, () => this.beginMarshal()),
            new SimpleStep(game, () => this.promptForMarshal())
        ]);
    }

    beginMarshal() {
        this.remainingPlayers = this.game.getPlayersInFirstPlayerOrder();
    }

    promptForMarshal() {
        let currentPlayer = this.remainingPlayers.shift();
        this.game.queueStep(new GameFlowMarker(this.game, 'count-income'));
        currentPlayer.beginMarshal();
        this.game.queueStep(new GameFlowMarker(this.game, 'marshal-actions'));
        this.game.queueStep(new MarshalCardsPrompt(this.game, currentPlayer));
        return this.remainingPlayers.length === 0;
    }
}

module.exports = MarshalingPhase;
