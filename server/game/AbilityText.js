const AbilityDsl = require('./abilitydsl');
const CardAction = require('./cardaction');
const CardForcedInterrupt = require('./cardforcedinterrupt');
const CardForcedReaction = require('./cardforcedreaction');
const CardInterrupt = require('./cardinterrupt');
const CardReaction = require('./cardreaction');
const CardWhenRevealed = require('./cardwhenrevealed');
const CustomPlayAction = require('./PlayActions/CustomPlayAction');

class AbilityText {
    constructor(game, source) {
        this.actions = [];
        this.reactions = [];
        this.playActions = [];
        this.persistentEffects = [];
        this.game = game;
        this.source = source;
    }

    plotModifiers(modifiers) {
        if(modifiers.gold) {
            this.persistentEffect({
                condition: () => this.source.canProvidePlotModifier['gold'],
                match: card => card.controller.activePlot === card,
                targetController: 'current',
                effect: AbilityDsl.effects.modifyGold(modifiers.gold)
            });
        }
        if(modifiers.initiative) {
            this.persistentEffect({
                condition: () => this.source.canProvidePlotModifier['initiative'],
                match: card => card.controller.activePlot === card,
                targetController: 'current',
                effect: AbilityDsl.effects.modifyInitiative(modifiers.initiative)
            });
        }
        if(modifiers.reserve) {
            this.persistentEffect({
                condition: () => this.source.canProvidePlotModifier['reserve'],
                match: card => card.controller.activePlot === card,
                targetController: 'current',
                effect: AbilityDsl.effects.modifyReserve(modifiers.reserve)
            });
        }
    }

    action(properties) {
        let action = new CardAction(this.game, this.source, properties);
        this.actions.push(action);
    }

    reaction(properties) {
        let reaction = new CardReaction(this.game, this.source, properties);
        this.reactions.push(reaction);
    }

    forcedReaction(properties) {
        let reaction = new CardForcedReaction(this.game, this.source, properties);
        this.reactions.push(reaction);
    }

    interrupt(properties) {
        let reaction = new CardInterrupt(this.game, this.source, properties);
        this.reactions.push(reaction);
    }

    forcedInterrupt(properties) {
        let reaction = new CardForcedInterrupt(this.game, this.source, properties);
        this.reactions.push(reaction);
    }

    /**
     * Defines a special play action that can occur when the card is outside the
     * play area (e.g. Lady-in-Waiting's dupe marshal ability)
     */
    playAction(properties) {
        this.playActions.push(new CustomPlayAction(properties));
    }

    /**
     * Applies an effect that continues as long as the card providing the effect
     * is both in play and not blank.
     */
    persistentEffect(properties) {
        const allowedLocations = ['active plot', 'agenda', 'any', 'play area', 'revealed plots', 'title'];
        const defaultLocationForType = {
            agenda: 'agenda',
            plot: 'active plot',
            title: 'title'
        };

        let location = properties.location || defaultLocationForType[this.source.getType()] || 'play area';

        if(!allowedLocations.includes(location)) {
            throw new Error(`'${location}' is not a supported effect location.`);
        }

        this.persistentEffects.push(Object.assign({ duration: 'persistent', location: location }, properties));
    }

    /**
     * Applies an effect with the specified properties while the current card is
     * attached to another card. By default the effect will target the parent
     * card, but you can provide a match function to narrow down whether the
     * effect is applied (for cases where the effect only applies to specific
     * characters).
     */
    whileAttached(properties) {
        this.persistentEffect({
            condition: () => !!this.source.parent && (!properties.condition || properties.condition()),
            match: (card, context) => card === this.source.parent && (!properties.match || properties.match(card, context)),
            targetController: 'any',
            effect: properties.effect
        });
    }

    whenRevealed(properties) {
        let whenClause = {
            when: {
                onPlotRevealed: event => event.plot === this.source
            }
        };
        let reaction = new CardWhenRevealed(this.game, this.source, Object.assign(whenClause, properties));
        this.reactions.push(reaction);
    }
}

module.exports = AbilityText;
