const GameAction = require('./GameAction');
const LeavePlay = require('./LeavePlay');
const PlaceCard = require('./PlaceCard');

const inPlayAreas = ['active plot', 'faction', 'play area', 'title'];

class MoveCardAction extends GameAction {
    constructor({ internalAction, targetLocation, leavePlayProps = {} }) {
        super(internalAction.name);
        this.internalAction = internalAction;
        this.targetLocation = targetLocation;
        this.leavePlayProps = leavePlayProps;
    }

    allow(props) {
        const {card} = props;

        if(inPlayAreas.includes(card.location) && !inPlayAreas.includes(this.targetLocation)) {
            return this.internalAction.allow(props) && LeavePlay.allow(props);
        }

        return this.internalAction.allow(props);
    }

    createEvent(props) {
        const {card, allowSave } = props;
        const internalEvent = this.internalAction.createEvent(props);
        const baseEvent = this.event(internalEvent.name, internalEvent.params, event => {
            internalEvent.handler(event);
            event.thenAttachEvent(PlaceCard.createEvent({
                card: event.card,
                location: this.targetLocation
            }));
        });

        if(inPlayAreas.includes(card.location) && !inPlayAreas.includes(this.targetLocation)) {
            return this.atomic(
                baseEvent,
                LeavePlay.createEvent(Object.assign({ card, allowSave }, this.leavePlayProps))
            );
        }

        return baseEvent;
    }
}

module.exports = MoveCardAction;
