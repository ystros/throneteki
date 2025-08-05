import BaseStep from './basestep.js';
import ChallengeTypes from '../ChallengeTypes.js';

class IconPrompt extends BaseStep {
    constructor(game, player, card, callback) {
        super(game);

        this.player = player;
        this.card = card;
        this.callback = callback;
    }

    continue() {
        console.log(`${Date.now()} Opening prompt for icon`);
        this.game.promptWithMenu(this.player, this, {
            activePrompt: {
                menuTitle: 'Select an icon',
                buttons: ChallengeTypes.asButtons({ method: 'iconSelected' })
            },
            source: this.card
        });
    }

    iconSelected(player, icon) {
        console.log(`${Date.now()} Icon selected in prompt`);
        this.callback(icon);

        return true;
    }
}

export default IconPrompt;
