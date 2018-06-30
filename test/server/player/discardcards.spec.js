const Player = require('../../../server/game/player');
const DiscardCard = require('../../../server/game/GameActions/DiscardCard');

describe('Player', function() {

    function createCardSpy(num) {
        let spy = jasmine.createSpyObj('card', ['moveTo', 'removeDuplicate']);
        spy.num = num;
        spy.location = 'loc';
        return spy;
    }

    beforeEach(function() {
        this.gameSpy = jasmine.createSpyObj('game', ['resolveEvent']);
        this.player = new Player('1', { username: 'Test 1', settings: {} }, true, this.gameSpy);
        this.childEventSpy = { event: 1 };

        spyOn(DiscardCard, 'allow').and.returnValue(true);
        spyOn(DiscardCard, 'createEvent').and.returnValue(this.childEventSpy);

        this.card1 = createCardSpy(1);
        this.card2 = createCardSpy(2);
    });

    describe('discardCards()', function() {
        describe('when no cards are passed', function() {
            beforeEach(function() {
                this.player.discardCards([], false);
            });

            it('should not resolve an event', function() {
                expect(this.gameSpy.resolveEvent).not.toHaveBeenCalled();
            });
        });

        describe('when cards are passed', function() {
            beforeEach(function() {
                this.player.discardCards([this.card1, this.card2], false, this.callbackSpy);
                this.event = this.gameSpy.resolveEvent.calls.first().args[0];
            });

            it('should resolve the onCardsDiscarded event', function() {
                expect(this.event).toEqual(jasmine.objectContaining({
                    name: 'onCardsDiscarded',
                    cards: [this.card1, this.card2]
                }));
            });

            it('should create individual discard events', function() {
                expect(DiscardCard.createEvent).toHaveBeenCalledWith(jasmine.objectContaining({ card: this.card1 }));
                expect(DiscardCard.createEvent).toHaveBeenCalledWith(jasmine.objectContaining({ card: this.card2 }));
            });
        });
    });
});
