const _ = require('underscore');

const AbilityMessage = require('./AbilityMessage');
const AbilityTarget = require('./AbilityTarget.js');

/**
 * Base class representing an ability that can be done by the player. This
 * includes card actions, reactions, interrupts, playing a card, marshaling a
 * card, or ambushing a card.
 *
 * Most of the methods take a context object. While the structure will vary from
 * inheriting classes, it is guaranteed to have at least the `game` object, the
 * `player` that is executing the action, and the `source` card object that the
 * ability is generated from.
 */
class BaseAbility {
    /**
     * Creates an ability.
     *
     * @param {Object} properties - An object with ability related properties.
     * @param {Object|Array} properties.cost - optional property that specifies
     * the cost for the ability. Can either be a cost object or an array of cost
     * objects.
     */
    constructor(properties) {
        this.cost = this.buildCost(properties.cost);
        this.targets = this.buildTargets(properties);
        this.limit = properties.limit;
        this.message = AbilityMessage.create(properties.message);
        this.cannotBeCanceled = !!properties.cannotBeCanceled;
        this.chooseOpponentFunc = properties.chooseOpponent;
        this.abilitySourceType = properties.abilitySourceType || 'card';
    }

    buildCost(cost) {
        if(!cost) {
            return [];
        }

        if(!_.isArray(cost)) {
            return [cost];
        }

        return cost;
    }

    buildTargets(properties) {
        if(properties.target) {
            return [new AbilityTarget('target', properties.target)];
        }

        if(properties.targets) {
            let targetPairs = Object.entries(properties.targets);
            return targetPairs.map(([name, properties]) => new AbilityTarget(name, properties));
        }

        return [];
    }

    /**
     * Return whether all costs are capable of being paid for the ability.
     *
     * @returns {Boolean}
     */
    canPayCosts(context) {
        return this.executeWithTemporaryContext(context, 'cost', () => _.all(this.cost, cost => cost.canPay(context)));
    }

    /**
     * Executes the specified callback using the passed ability context and
     * resolution stage. This allows functions to be executed with the proper
     * ability context for immunity / cannot restrictions prior to the ability
     * context being pushed on the game's stack during the full resolution of
     * the ability.
     *
     * @param {AbilityContext} context
     * @param {string} stage
     * @param {Function} callback
     * @returns {*}
     * The return value of the callback function.
     */
    executeWithTemporaryContext(context, stage, callback) {
        let originalResolutionStage = context.resolutionStage;

        try {
            context.game.pushAbilityContext(context);
            context.resolutionStage = stage;
            return callback();
        } finally {
            context.resolutionStage = originalResolutionStage;
            context.game.popAbilityContext();
        }
    }

    /**
     * Resolves all costs for the ability prior to payment. Some cost objects
     * have a `resolve` method in order to prompt the user to make a choice,
     * such as choosing a card to kneel. Consumers of this method should wait
     * until all costs have a `resolved` value of `true` before proceeding.
     *
     * @returns {Array} An array of cost resolution results.
     */
    resolveCosts(context) {
        return _.map(this.cost, cost => {
            if(cost.resolve) {
                return cost.resolve(context);
            }

            return { resolved: true, value: cost.canPay(context) };
        });
    }

    /**
     * Pays all costs for the ability simultaneously.
     */
    payCosts(context) {
        _.each(this.cost, cost => {
            cost.pay(context);
        });
    }

    /**
     * Return whether when unpay is implemented for the ability cost and the
     * cost can be unpaid.
     *
     * @returns {boolean}
     */
    canUnpayCosts(context) {
        return _.all(this.cost, cost => cost.unpay && cost.canUnpay(context));
    }

    /**
     * Unpays each cost associated with the ability.
     */
    unpayCosts(context) {
        _.each(this.cost, cost => {
            cost.unpay(context);
        });
    }

    /**
     * Returns whether the ability requires an opponent to be chosen.
     */
    needsChooseOpponent() {
        return !!this.chooseOpponentFunc;
    }

    opponentGenerator(context) {
        if(!this.needsChooseOpponent()) {
            return this.targetGenerator(context);
        }

        let opponents = context.game.getPlayers().filter(player => player !== context.player && this.canChooseOpponent(context));
        let result = [];

        for(let opponent of opponents) {
            try {
                context.opponent = opponent;
                result = result.concat(this.targetGenerator(context).map(targetResult => Object.assign({ opponent: opponent }, targetResult)));
            } finally {
                context.opponent = null;
            }
        }

        return result;
    }

    targetGenerator(context) {
        if(this.targets.length === 0) {
            return [{}];
        }

        return this.targetGeneratorUtil(context, 0);
    }

    targetGeneratorUtil(context, i) {
        if(i >= this.targets.length) {
            return [{}];
        }

        let targetDefinition = this.targets[i];
        let eligibleCards = targetDefinition.getEligibleTargets(context);

        let result = [];

        for(let card of eligibleCards) {
            try {
                context.targets[targetDefinition.name] = card;
                if(targetDefinition.name === 'target') {
                    context.target = card;
                }
                let nextTargetResults = this.targetGeneratorUtil(context, i + 1);
                for(let nextTargetResult of nextTargetResults) {
                    let copy = Object.assign({ targets: {} }, nextTargetResult);
                    copy.targets[targetDefinition.name] = card;
                    result.push(copy);
                }
            } finally {
                context.target = null;
                context.targets[targetDefinition.name] = null;
            }
        }

        return result;
    }

    /**
     * Returns whether there are opponents that can be chosen, if the ability
     * requires that an opponent be chosen.
     */
    canResolveOpponents(context) {
        if(!this.needsChooseOpponent()) {
            return true;
        }

        return _.any(context.game.getPlayers(), player => {
            return player !== context.player && this.canChooseOpponent(player);
        });
    }

    /**
     * Returns whether a specific player can be chosen as an opponent.
     */
    canChooseOpponent(opponent) {
        if(_.isFunction(this.chooseOpponentFunc)) {
            return this.chooseOpponentFunc(opponent);
        }

        return this.chooseOpponentFunc === true;
    }

    /**
     * Returns whether there are eligible cards available to fulfill targets.
     *
     * @returns {Boolean}
     */
    canResolveTargets(context) {
        return this.executeWithTemporaryContext(context, 'effect', () => this.targets.every(target => target.canResolve(context)));
    }

    /**
     * Prompts the current player to choose each target defined for the ability.
     *
     * @returns {Array} An array of target resolution objects.
     */
    resolveTargets(context) {
        for(let target of this.targets) {
            target.resolve(context);
        }
    }

    /**
     * Increments the usage of the ability toward its limit, if it has one.
     */
    incrementLimit() {
        if(this.limit) {
            this.limit.increment();
        }
    }

    outputMessage(context) {
        this.message.output(this.game, context);
    }

    /**
     * Executes the ability once all costs have been paid. Inheriting classes
     * should override this method to implement their behavior; by default it
     * does nothing.
     */
    executeHandler() {
        throw new Error('Abstract method executeHandler must be overridden');
    }

    isAction() {
        return false;
    }

    isPlayableEventAbility() {
        return false;
    }

    isCardAbility() {
        return this.abilitySourceType === 'card';
    }

    isTriggeredAbility() {
        return false;
    }

    isForcedAbility() {
        return false;
    }

    hasMax() {
        return false;
    }
}

module.exports = BaseAbility;
