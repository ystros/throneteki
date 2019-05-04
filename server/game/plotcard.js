const BaseCard = require('./basecard.js');
const CardWhenRevealed = require('./cardwhenrevealed.js');

class PlotCard extends BaseCard {
    constructor(owner, cardData) {
        super(owner, cardData);

        this.reserveModifier = 0;
        this.goldModifier = 0;
        this.initiativeModifier = 0;
        this.claimModifier = 0;
        this.claimSet = undefined;
    }

    whenRevealed(properties) {
        this.printedAbilityText.whenRevealed(properties);
    }

    getWhenRevealedAbility() {
        return this.printedAbilityText.reactions.find(ability => ability instanceof CardWhenRevealed);
    }

    getInitiative() {
        var baseValue = this.canProvidePlotModifier['initiative'] ? this.getPrintedInitiative() : 0;
        return baseValue + this.initiativeModifier;
    }

    getPrintedInitiative() {
        return this.getPrintedNumberFor(this.cardData.plotStats.initiative);
    }

    getIncome() {
        let baseValue = this.canProvidePlotModifier['gold'] ? (this.baseIncome || this.getPrintedIncome()) : 0;

        return baseValue + this.goldModifier;
    }

    getPrintedIncome() {
        return this.getPrintedNumberFor(this.cardData.plotStats.income);
    }

    getReserve() {
        var baseValue = this.canProvidePlotModifier['reserve'] ? this.getPrintedReserve() : 0;
        return baseValue + this.reserveModifier;
    }

    getPrintedReserve() {
        return this.getPrintedNumberFor(this.cardData.plotStats.reserve);
    }

    getPrintedClaim() {
        return this.getPrintedNumberFor(this.cardData.plotStats.claim);
    }

    getClaim() {
        let baseClaim = this.getPrintedClaim();

        if(typeof(this.claimSet) === 'number') {
            return this.claimSet;
        }

        return Math.max(baseClaim + this.claimModifier, 0);
    }

    flipFaceup() {
        // This probably isn't necessary now
        this.facedown = false;

        // But this is
        this.selected = false;
    }
}

module.exports = PlotCard;
