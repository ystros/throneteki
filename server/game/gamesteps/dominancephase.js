const _ = require('underscore');
const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const ActionWindow = require('./actionwindow.js');
const GameFlowMarker = require('./GameFlowMarker.js');

class DominancePhase extends Phase {
    constructor(game) {
        super(game, 'dominance');
        this.initialise([
            new GameFlowMarker(this.game, 'reward-dominance'),
            new SimpleStep(game, () => this.determineWinner()),
            new GameFlowMarker(this.game, 'dominance-actions'),
            new ActionWindow(this.game, 'After dominance determined', 'dominance')
        ]);
    }

    determineWinner() {
        var highestDominance = 0;
        var lowestDominance = 0;
        var dominanceWinner = undefined;

        _.each(this.game.getPlayers(), player => {
            var dominance = player.getDominance();

            lowestDominance = dominance;

            if(dominance === highestDominance) {
                dominanceWinner = undefined;
            }

            if(dominance > highestDominance) {
                lowestDominance = highestDominance;
                highestDominance = dominance;
                dominanceWinner = player;
            } else {
                lowestDominance = dominance;
            }
        });

        if(dominanceWinner) {
            this.game.addMessage('{0} wins dominance ({1} vs {2})', dominanceWinner, highestDominance, lowestDominance);

            this.game.addPower(dominanceWinner, 1);
        } else {
            this.game.addMessage('There was a tie for dominance');
            this.game.addMessage('No one wins dominance');
        }

        this.game.raiseEvent('onDominanceDetermined', { winner: dominanceWinner });
    }
}

module.exports = DominancePhase;
