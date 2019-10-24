const SacrificeCard = require('../../../server/game/GameActions/SacrificeCard');

fdescribe('SacrificeCard', function() {
    beforeEach(function() {
        this.cardSpy = jasmine.createSpyObj('card', ['allowGameAction', 'createSnapshot']);
        this.playerSpy = jasmine.createSpyObj('player', ['moveCard']);
        this.props = { card: this.cardSpy, player: this.playerSpy };
    });

    describe('allow()', function() {
        beforeEach(function() {
            this.cardSpy.location = 'play area';
            this.cardSpy.allowGameAction.and.returnValue(true);
        });

        describe('when the card is in play and not immune', function() {
            it('returns true', function() {
                expect(SacrificeCard.allow(this.props)).toBe(true);
            });
        });

        describe('when the card is not in play', function() {
            beforeEach(function() {
                this.cardSpy.location = 'hand';
            });

            it('returns false', function() {
                expect(SacrificeCard.allow(this.props)).toBe(false);
            });
        });

        describe('when the card is immune', function() {
            beforeEach(function() {
                this.cardSpy.allowGameAction.and.returnValue(false);
            });

            it('returns false', function() {
                expect(SacrificeCard.allow(this.props)).toBe(false);
            });
        });
    });

    describe('createEvent()', function() {
        beforeEach(function() {
            const combinedEvent = SacrificeCard.createEvent(this.props);
            this.event = combinedEvent.getConcurrentEvents().find(event => event.name === 'onSacrificed');
        });

        it('creates a onSacrificed event', function() {
            expect(this.event.name).toBe('onSacrificed');
            expect(this.event.card).toBe(this.cardSpy);
            expect(this.event.player).toBe(this.playerSpy);
        });

        describe('the event handler', function() {
            beforeEach(function() {
                this.cardSpy.createSnapshot.and.returnValue('snapshot');
                this.event.executeHandler();
                this.placeEvent = this.event.attachedEvents.find(event => event.name === 'onCardPlaced');
            });

            it('sets the card snapshot on the event', function() {
                console.log(this.event);
                expect(this.event.cardStateWhenSacrificed).toBe('snapshot');
            });

            it('moves the card to discard', function() {
                expect(this.placeEvent.location).toBe('discard pile');
            });
        });
    });
});
