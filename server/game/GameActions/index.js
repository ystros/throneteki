const AbilityAdapter = require('./AbilityAdapter');
const MoveCard = require('./MoveCard');
const PlaceCard = require('./PlaceCard');

function actionFactory(action) {
    return function(props) {
        return new AbilityAdapter(action, props);
    };
}

const GameActions = {
    moveCard: actionFactory(MoveCard),
    placeCard: actionFactory(PlaceCard)
};

module.exports = GameActions;
