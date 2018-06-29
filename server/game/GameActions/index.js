const AbilityAdapter = require('./AbilityAdapter');
const MoveCard = require('./MoveCard');
const PlaceCard = require('./PlaceCard');
const Sacrifice = require('./Sacrifice');
const ShuffleIntoDeck = require('./ShuffleIntoDeck');

function actionFactory(action) {
    return function(props) {
        return new AbilityAdapter(action, props);
    };
}

const GameActions = {
    moveCard: actionFactory(MoveCard),
    placeCard: actionFactory(PlaceCard),
    sacrifice: actionFactory(Sacrifice),
    shuffleIntoDeck: actionFactory(ShuffleIntoDeck)
};

module.exports = GameActions;
