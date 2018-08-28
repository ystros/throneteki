const DrawCard = require('./drawcard');

const BlankCardData = {
    code: '-',
    type: '-',
    name: 'facedown',
    unique: false,
    faction: '-',
    loyal: false,
    cost: '-',
    icons: {
        military: false,
        intrigue: false,
        power: false
    },
    strength: 0,
    plotStats: {
        income: 0,
        initiative: 0,
        claim: 0,
        reserve: 0
    },
    text: '',
    traits: []
};

class FacedownDrawCard extends DrawCard {
    constructor(wrappedCard, defaultData = {}) {
        super(wrappedCard.owner, Object.assign({}, BlankCardData, defaultData));

        this.facedown = true;
        this.wrappedCard = wrappedCard;
        wrappedCard.moveTo('facedown', this);
        this.game.allCards.push(this);
        this.markAsDirty();
    }

    takeControl(controller, source) {
        super.takeControl(controller, source);

        this.wrappedCard.takeControl(controller, source);
    }

    revertControl(source) {
        super.revertControl(source);
        this.wrappedCard.revertControl(source);
    }

    getPlayActions() {
        return this.wrappedCard.getPlayActions();
    }

    getSummary(activePlayer) {
        if(this.game.isCardVisible(this.wrappedCard, activePlayer)) {
            return Object.assign(this.wrappedCard.getSummary(activePlayer), { facedown: true, uuid: this.uuid });
        }

        return { facedown: true, uuid: this.uuid };
    }
}

module.exports = FacedownDrawCard;
