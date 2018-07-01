const AbilityAdapter = require('./AbilityAdapter');
const MoveCard = require('./MoveCard');
const PlaceCard = require('./PlaceCard');
const ShuffleIntoDeck = require('./ShuffleIntoDeck');

function actionFactory(action) {
    return function(props) {
        return new AbilityAdapter(action, props);
    };
}

const GameActions = {
    moveCard: actionFactory(MoveCard),
    placeCard: actionFactory(PlaceCard),
    shuffleIntoDeck: actionFactory(ShuffleIntoDeck)
};

module.exports = GameActions;
