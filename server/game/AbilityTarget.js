const _ = require('underscore');

const AbilityTargetSelection = require('./AbilityTargetSelection.js');
const CardSelector = require('./CardSelector.js');

class AbilityTarget {
    constructor(name, properties) {
        this.type = properties.type || 'choose';
        this.choosingPlayer = properties.choosingPlayer || 'current';
        this.name = name;
        this.properties = properties;
        this.selector = CardSelector.for(properties);
    }

    getEligibleTargets(context) {
        return this.selector.getEligibleTargets(context);
    }

    canResolve(context) {
        try {
            context.choosingPlayer = this.getChoosingPlayer(context);
            return this.selector.hasEnoughTargets(context);
        } finally {
            context.choosingPlayer = null;
        }
    }

    resolve(context) {
        let choosingPlayer = this.getChoosingPlayer(context);
        let eligibleCards = this.selector.getEligibleTargets(context);
        let otherProperties = _.omit(this.properties, 'cardCondition');
        let result = new AbilityTargetSelection({
            choosingPlayer: choosingPlayer,
            eligibleCards: eligibleCards,
            targetingType: this.type,
            name: this.name
        });
        let promptProperties = {
            context: context,
            source: context.source,
            selector: this.selector,
            onSelect: (player, card) => {
                result.resolve(card);
                return true;
            },
            onCancel: () => {
                result.reject();
                return true;
            }
        };

        context.choosingPlayer = choosingPlayer;

        if(!choosingPlayer) {
            result.reject();
        } else {
            context.game.promptForSelect(choosingPlayer, _.extend(promptProperties, otherProperties));
        }

        context.targets.addSelection(result);
    }

    getChoosingPlayer(context) {
        switch(this.choosingPlayer) {
            case 'attackingPlayer':
                return context.game.currentChallenge && context.game.currentChallenge.attackingPlayer;
            case 'current':
                return context.player;
            case 'defendingPlayer':
                return context.game.currentChallenge && context.game.currentChallenge.defendingPlayer;
            case 'loser':
                return context.game.currentChallenge && context.game.currentChallenge.loser;
            case 'opponent':
                return context.opponent;
            case 'winner':
                return context.game.currentChallenge && context.game.currentChallenge.winner;
        }
    }
}

module.exports = AbilityTarget;
