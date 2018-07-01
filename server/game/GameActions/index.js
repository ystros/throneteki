const AbilityAdapter = require('./AbilityAdapter');
const DiscardAtRandom = require('./DiscardAtRandom');
const DiscardTopCards = require('./DiscardTopCards');
const MoveCard = require('./MoveCard');
const MultiDiscard = require('./MultiDiscard');
const PlaceCard = require('./PlaceCard');
const Sacrifice = require('./Sacrifice');
const ShuffleIntoDeck = require('./ShuffleIntoDeck');

function actionFactory(action) {
    return function(props) {
        return new AbilityAdapter(action, props);
    };
}

const GameActions = {
    discardAtRandom: actionFactory(DiscardAtRandom),
    discardCards: actionFactory(MultiDiscard),
    discardTopCards: actionFactory(DiscardTopCards),
    moveCard: actionFactory(MoveCard),
    placeCard: actionFactory(PlaceCard),
    sacrifice: actionFactory(Sacrifice),
    shuffleIntoDeck: actionFactory(ShuffleIntoDeck)
};

module.exports = GameActions;
