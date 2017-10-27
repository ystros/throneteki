const _ = require('underscore');
const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const DiscardToReservePrompt = require('./taxation/discardtoreserveprompt.js');
const ActionWindow = require('./actionwindow.js');
const GameFlowMarker = require('./GameFlowMarker.js');

class TaxationPhase extends Phase {
    constructor(game) {
        super(game, 'taxation');
        this.initialise([
            new GameFlowMarker(this.game, 'return-gold'),
            new SimpleStep(game, () => this.returnGold()),
            new GameFlowMarker(this.game, 'check-reserve'),
            new DiscardToReservePrompt(game),
            new SimpleStep(game, () => this.returnTitleCards()),
            new GameFlowMarker(this.game, 'taxation-actions'),
            new ActionWindow(game, 'After reserve check', 'taxation'),
            new SimpleStep(game, () => this.roundEnded())
        ]);
    }

    returnGold() {
        _.each(this.game.getPlayersInFirstPlayerOrder(), player => {
            if(!player.doesNotReturnUnspentGold) {
                player.taxation();
            }
        });
    }

    returnTitleCards() {
        if(!this.game.isMelee) {
            return;
        }

        _.each(this.game.getPlayers(), player => {
            this.game.titlePool.returnToPool(player, player.title);
        });
    }

    roundEnded() {
        this.game.raiseEvent('onRoundEnded');

        let players = this.game.getPlayers();
        let playerStr = _.map(players, player => `${player.name}: ${player.getTotalPower()}`).join(', ');

        this.game.round++;

        this.game.addAlert('endofround', 'Round {0} has ended {1} totals: {2}', this.game.round, 'power', playerStr);
    }
}

module.exports = TaxationPhase;
