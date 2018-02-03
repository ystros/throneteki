const DrawCard = require('../../drawcard.js');

class Esgred extends DrawCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: [
                ability.effects.addStealthLimit(1),
                ability.effects.sacrificeIfControl('Asha Greyjoy', () => this.gainPowerForAsha())
            ]
        });
    }

    gainPowerForAsha() {
        let asha = this.controller.findCardByName(this.controller.cardsInPlay, 'Asha Greyjoy');

        if(!asha) {
            return;
        }

        asha.modifyPower(1);
    }
}

Esgred.code = '04111';

module.exports = Esgred;
