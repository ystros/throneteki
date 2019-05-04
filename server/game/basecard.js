const uuid = require('uuid');

const AbilityDsl = require('./abilitydsl');
const AbilityText = require('./AbilityText');
const EventRegistrar = require('./eventregistrar');
const KeywordsProperty = require('./PropertyTypes/KeywordsProperty');
const ReferenceCountedSetProperty = require('./PropertyTypes/ReferenceCountedSetProperty');

const ValidKeywords = [
    'ambush',
    'bestow',
    'insight',
    'intimidate',
    'limited',
    'no attachments',
    'pillage',
    'renown',
    'shadow',
    'stealth',
    'terminal'
];

const ValidFactions = [
    'stark',
    'lannister',
    'thenightswatch',
    'tyrell',
    'baratheon',
    'targaryen',
    'martell',
    'greyjoy'
];

const LocationsWithEventHandling = ['play area', 'active plot', 'faction', 'agenda', 'title'];

class BaseCard {
    constructor(owner, cardData) {
        this.owner = owner;
        this.game = this.owner.game;
        this.cardData = cardData;

        this.uuid = uuid.v1();
        this.code = cardData.code;
        this.name = cardData.name;
        this.facedown = false;
        this.keywords = new KeywordsProperty();
        this.traits = new ReferenceCountedSetProperty();
        this.blanks = new ReferenceCountedSetProperty();
        this.losesAspects = new ReferenceCountedSetProperty();
        this.controllerStack = [];
        this.eventsForRegistration = [];

        this.tokens = {};
        this.plotModifierValues = {
            gold: 0,
            initiative: 0,
            reserve: 0
        };

        this.canProvidePlotModifier = {
            gold: true,
            initiative: true,
            reserve: true
        };

        this.abilityRestrictions = [];
        this.events = new EventRegistrar(this.game, this);

        this.abilities = { actions: [], reactions: [], persistentEffects: [], playActions: [] };
        this.printedAbilityText = new AbilityText(this.game, this);
        this.parseKeywords(cardData.text || '');
        for(let trait of cardData.traits || []) {
            this.addTrait(trait);
        }

        this.setupCardAbilities(AbilityDsl);

        this.factions = new ReferenceCountedSetProperty();
        this.cardTypeSet = undefined;
        this.addFaction(cardData.faction);
    }

    parseKeywords(text) {
        let firstLine = text.split('\n')[0] || '';
        let potentialKeywords = firstLine.split('.').map(k => k.toLowerCase().trim());

        this.printedKeywords = potentialKeywords.filter(potentialKeyword => {
            return ValidKeywords.some(keyword => potentialKeyword.indexOf(keyword) === 0);
        });

        if(this.printedKeywords.length > 0) {
            this.persistentEffect({
                match: this,
                location: 'any',
                targetLocation: 'any',
                effect: AbilityDsl.effects.addMultipleKeywords(this.printedKeywords)
            });
        }
    }

    registerEvents(events) {
        this.eventsForRegistration = events;
    }

    setupCardAbilities() {
    }

    plotModifiers(modifiers) {
        this.plotModifierValues = Object.assign(this.plotModifierValues, modifiers);
        this.printedAbilityText.plotModifiers(modifiers);
    }

    action(properties) {
        this.printedAbilityText.action(properties);
    }

    reaction(properties) {
        this.printedAbilityText.reaction(properties);
    }

    forcedReaction(properties) {
        this.printedAbilityText.forcedReaction(properties);
    }

    interrupt(properties) {
        this.printedAbilityText.interrupt(properties);
    }

    forcedInterrupt(properties) {
        this.printedAbilityText.forcedInterrupt(properties);
    }

    /**
     * Defines a special play action that can occur when the card is outside the
     * play area (e.g. Lady-in-Waiting's dupe marshal ability)
     */
    playAction(properties) {
        this.printedAbilityText.playAction(properties);
    }

    /**
     * Applies an effect that continues as long as the card providing the effect
     * is both in play and not blank.
     */
    persistentEffect(properties) {
        this.printedAbilityText.persistentEffect(properties);
    }

    /**
     * Applies an effect with the specified properties while the current card is
     * attached to another card. By default the effect will target the parent
     * card, but you can provide a match function to narrow down whether the
     * effect is applied (for cases where the effect only applies to specific
     * characters).
     */
    whileAttached(properties) {
        this.printedAbilityText.whileAttached(properties);
    }

    /**
     * Applies an immediate effect which lasts until the end of the current
     * challenge.
     */
    untilEndOfChallenge(propertyFactory) {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ duration: 'untilEndOfChallenge', location: 'any' }, properties));
    }

    /**
     * Applies an immediate effect which lasts until the end of the phase.
     */
    untilEndOfPhase(propertyFactory) {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ duration: 'untilEndOfPhase', location: 'any' }, properties));
    }

    /**
     * Applies an immediate effect which expires at the end of the phase. Per
     * game rules this duration is outside of the phase.
     */
    atEndOfPhase(propertyFactory) {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ duration: 'atEndOfPhase', location: 'any' }, properties));
    }

    /**
     * Applies an immediate effect which lasts until the end of the round.
     */
    untilEndOfRound(propertyFactory) {
        var properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ duration: 'untilEndOfRound', location: 'any' }, properties));
    }

    /**
     * Applies a lasting effect which lasts until an event contained in the
     * `until` property for the effect has occurred.
     */
    lastingEffect(propertyFactory) {
        let properties = propertyFactory(AbilityDsl);
        this.game.addEffect(this, Object.assign({ duration: 'custom', location: 'any' }, properties));
    }

    doAction(player, arg) {
        var action = this.printedAbilityText.actions[arg];

        if(!action) {
            return;
        }

        action.execute(player, arg);
    }

    getPrintedNumberFor(value) {
        return (value === 'X' ? 0 : value) || 0;
    }

    translateXValue(value) {
        return value === '-' ? 0 : value;
    }

    getPlayActions() {
        return [];
    }

    get controller() {
        if(this.controllerStack.length === 0) {
            return this.owner;
        }

        return this.controllerStack[this.controllerStack.length - 1].controller;
    }

    takeControl(controller, source) {
        if(!source && controller === this.owner) {
            // On permanent take control by the original owner, revert all take
            // control effects
            this.controllerStack = [];
            return;
        }

        let tracking = { controller: controller, source: source };
        if(!source) {
            // Clear all other take control effects for permanent control
            this.controllerStack = [tracking];
        } else {
            this.controllerStack.push(tracking);
        }
    }

    revertControl(source) {
        this.controllerStack = this.controllerStack.filter(control => control.source !== source);
    }

    loseAspect(aspect) {
        this.losesAspects.add(aspect);
        this.markAsDirty();
    }

    restoreAspect(aspect) {
        this.losesAspects.remove(aspect);
        this.markAsDirty();
    }

    hasKeyword(keyword) {
        if(this.losesAspects.contains('keywords')) {
            return false;
        }

        return this.keywords.contains(keyword);
    }

    hasPrintedKeyword(keyword) {
        return this.printedKeywords.includes(keyword.toLowerCase());
    }

    getPrintedKeywords() {
        return this.printedKeywords;
    }

    hasTrait(trait) {
        if(this.losesAspects.contains('traits')) {
            return false;
        }

        return !this.isFullBlank() && this.traits.contains(trait);
    }

    isFaction(faction) {
        let normalizedFaction = faction.toLowerCase();

        if(this.losesAspects.contains('factions')) {
            return normalizedFaction === 'neutral';
        }

        if(normalizedFaction === 'neutral') {
            return ValidFactions.every(f => !this.factions.contains(f) || this.losesAspects.contains(`factions.${f}`));
        }

        return this.factions.contains(normalizedFaction) && !this.losesAspects.contains(`factions.${normalizedFaction}`);
    }

    isOutOfFaction() {
        return !this.isFaction(this.controller.getFaction()) && !this.isFaction('neutral');
    }

    getFactions() {
        let factions = ValidFactions.filter(faction => this.isFaction(faction));

        if(factions.length === 0) {
            factions.push('neutral');
        }

        return factions;
    }

    getFactionStatus() {
        let gainedFactions = ValidFactions.filter(faction => faction !== this.cardData.faction && this.isFaction(faction));
        let diff = gainedFactions.map(faction => ({ faction: faction, status: 'gained' }));

        if(!this.isFaction(this.cardData.faction) && this.cardData.faction !== 'neutral') {
            return diff.concat({ faction: this.cardData.faction, status: 'lost' });
        }

        return diff;
    }

    isLoyal() {
        return !!this.cardData.loyal;
    }

    applyAnyLocationPersistentEffects() {
        for(let effect of this.printedAbilityText.persistentEffects) {
            if(effect.location === 'any') {
                this.game.addEffect(this, effect);
            }
        }
    }

    getPersistentEffects() {
        return this.printedAbilityText.persistentEffects.filter(effect => effect.location !== 'any');
    }

    applyPersistentEffects() {
        for(let effect of this.getPersistentEffects()) {
            this.game.addEffect(this, effect);
        }
    }

    leavesPlay() {
    }

    clearTokens() {
        this.tokens = {};
    }

    moveTo(targetLocation, parent) {
        let originalLocation = this.location;
        let originalParent = this.parent;

        if(originalParent) {
            originalParent.removeChildCard(this);
        }

        if(originalLocation !== targetLocation) {
            // Clear any tokens on the card unless it is transitioning position
            // within the same area e.g. moving an attachment from one character
            // to another, or a character transferring control between players.
            this.clearTokens();
        }

        this.location = targetLocation;
        this.parent = parent;

        if(LocationsWithEventHandling.includes(targetLocation) && !LocationsWithEventHandling.includes(originalLocation)) {
            this.events.register(this.eventsForRegistration);
        } else if(LocationsWithEventHandling.includes(originalLocation) && !LocationsWithEventHandling.includes(targetLocation)) {
            this.events.unregisterAll();
        }

        for(let action of this.printedAbilityText.actions) {
            if(action.isEventListeningLocation(targetLocation) && !action.isEventListeningLocation(originalLocation)) {
                action.registerEvents();
            } else if(action.isEventListeningLocation(originalLocation) && !action.isEventListeningLocation(targetLocation)) {
                action.unregisterEvents();
            }
        }
        for(let reaction of this.printedAbilityText.reactions) {
            if(reaction.isEventListeningLocation(targetLocation) && !reaction.isEventListeningLocation(originalLocation)) {
                reaction.registerEvents();
            } else if(reaction.isEventListeningLocation(originalLocation) && !reaction.isEventListeningLocation(targetLocation)) {
                reaction.unregisterEvents();
                this.game.clearAbilityResolution(reaction);
            }
        }

        if(targetLocation !== 'play area') {
            this.facedown = false;
        }

        if(originalLocation !== targetLocation || originalParent !== parent) {
            this.game.raiseEvent('onCardMoved', { card: this, originalLocation: originalLocation, newLocation: targetLocation, parentChanged: originalParent !== parent });
        }
    }

    getMenu(player) {
        if(player.isSpectator()) {
            return;
        }

        let actionIndexPairs = this.printedAbilityText.actions.map((action, index) => [action, index]);
        let menuActionPairs = actionIndexPairs.filter(pair => {
            let action = pair[0];
            return action.allowPlayer(player) && !action.isClickToActivate() && action.allowMenu();
        });

        if(menuActionPairs.length === 0) {
            return;
        }

        return [
            { command: 'click', text: 'Select Card' }
        ].concat(menuActionPairs.map(([action, index]) => action.getMenuItem(index, player)));
    }

    isCopyOf(card) {
        return this.name === card.name;
    }

    isUnique() {
        return this.cardData.unique;
    }

    isAnyBlank() {
        return this.isFullBlank() || this.isBlankExcludingTraits();
    }

    isFullBlank() {
        return this.blanks.contains('full');
    }

    isBlankExcludingTraits() {
        return this.blanks.contains('excludingTraits');
    }

    isAttacking() {
        return this.game.currentChallenge && this.game.currentChallenge.isAttacking(this);
    }

    isDefending() {
        return this.game.currentChallenge && this.game.currentChallenge.isDefending(this);
    }

    isParticipating() {
        return this.game.currentChallenge && this.game.currentChallenge.isParticipating(this);
    }

    setCardType(cardType) {
        this.cardTypeSet = cardType;
    }

    getType() {
        return this.cardTypeSet || this.getPrintedType();
    }

    getPrintedType() {
        return this.cardData.type;
    }

    getPrintedFaction() {
        return this.cardData.faction;
    }

    setBlank(type) {
        let before = this.isAnyBlank();
        this.blanks.add(type);
        let after = this.isAnyBlank();

        if(!before && after) {
            this.game.raiseEvent('onCardBlankToggled', { card: this, isBlank: after });
        }
    }

    allowGameAction(actionType, context) {
        let currentAbilityContext = context || this.game.currentAbilityContext;
        return !this.abilityRestrictions.some(restriction => restriction.isMatch(actionType, currentAbilityContext));
    }

    addAbilityRestriction(restriction) {
        this.abilityRestrictions.push(restriction);
        this.markAsDirty();
    }

    removeAbilityRestriction(restriction) {
        this.abilityRestrictions = this.abilityRestrictions.filter(r => r !== restriction);
        this.markAsDirty();
    }

    addKeyword(keyword) {
        this.keywords.add(keyword);
    }

    addTrait(trait) {
        this.traits.add(trait);

        this.markAsDirty();
    }

    getTraits() {
        if(this.losesAspects.contains('traits')) {
            return [];
        }

        return this.traits.getValues();
    }

    addFaction(faction) {
        if(!faction) {
            return;
        }

        let lowerCaseFaction = faction.toLowerCase();
        this.factions.add(lowerCaseFaction);

        this.markAsDirty();
    }

    removeKeyword(keyword) {
        this.keywords.remove(keyword);
    }

    removeTrait(trait) {
        this.traits.remove(trait);
        this.markAsDirty();
    }

    removeFaction(faction) {
        this.factions.remove(faction.toLowerCase());
        this.markAsDirty();
    }

    clearBlank(type) {
        let before = this.isAnyBlank();
        this.blanks.remove(type);
        let after = this.isAnyBlank();

        if(before && !after) {
            this.game.raiseEvent('onCardBlankToggled', { card: this, isBlank: after });
        }
    }

    hasText(text) {
        let cardText = this.cardData.text.toLowerCase();
        return cardText.includes(text.toLowerCase());
    }

    get gold() {
        return this.tokens['gold'] || 0;
    }

    modifyGold(amount) {
        this.modifyToken('gold', amount);
    }

    hasToken(type) {
        return !!this.tokens[type];
    }

    modifyToken(type, number) {
        if(!this.tokens[type]) {
            this.tokens[type] = 0;
        }

        this.tokens[type] += number;

        if(this.tokens[type] < 0) {
            this.tokens[type] = 0;
        }

        if(this.tokens[type] === 0) {
            delete this.tokens[type];
        }

        this.markAsDirty();
    }

    markAsDirty() {
        this.isDirty = true;
    }

    clearDirty() {
        this.isDirty = false;
    }

    onClick(player) {
        var action = this.printedAbilityText.actions.find(action => action.isClickToActivate());
        if(action) {
            return action.execute(player) || action.deactivate(player);
        }

        return false;
    }

    getGameElementType() {
        return 'card';
    }

    getShortSummary() {
        return {
            code: this.cardData.code,
            label: this.cardData.label,
            name: this.cardData.name,
            type: this.getType()
        };
    }

    getSummary(activePlayer) {
        if(!this.game.isCardVisible(this, activePlayer)) {
            return { facedown: true, uuid: this.uuid, tokens: this.tokens };
        }

        let selectionState = activePlayer.getCardSelectionState(this);
        let state = {
            code: this.cardData.code,
            controlled: this.owner !== this.controller && this.getType() !== 'title',
            facedown: this.facedown,
            factionStatus: this.getFactionStatus(),
            menu: this.getMenu(activePlayer),
            name: this.cardData.label,
            new: this.new,
            tokens: this.tokens,
            type: this.getType(),
            uuid: this.uuid
        };

        return Object.assign(state, selectionState);
    }
}

module.exports = BaseCard;
