const Player = require('../../../server/game/player');
const GameActions = require('../../../server/game/GameActions');

describe('Player', function() {
    describe('moveCard', function() {
        beforeEach(function() {
            this.gameSpy = jasmine.createSpyObj('game', ['resolveGameAction']);
            this.player = new Player('1', {username: 'Player 1', settings: {}}, true, this.gameSpy);

            this.cardSpy = { card: 1 };
            this.actionSpy = { action: 1 };
            this.eventSpy = jasmine.createSpyObj('event', ['']);

            spyOn(GameActions, 'moveCard').and.returnValue(this.actionSpy);
            this.gameSpy.resolveGameAction.and.returnValue(this.eventSpy);
        });

        describe('when moving an owned card', function() {
            beforeEach(function() {
                this.cardSpy.owner = this.player;
                this.result = this.player.moveCard(this.cardSpy, 'hand', { allowSave: true, bottom: true });
            });

            it('should create the move card event correctly', function() {
                expect(GameActions.moveCard).toHaveBeenCalledWith(jasmine.objectContaining({
                    allowSave: true,
                    bottom: true,
                    card: this.cardSpy,
                    location: 'hand',
                    player: this.player
                }));
            });

            it('should resolve the move card action', function() {
                expect(this.gameSpy.resolveGameAction).toHaveBeenCalledWith(this.actionSpy);
            });

            it('should return the move card event', function() {
                expect(this.result).toBe(this.eventSpy);
            });
        });

        describe('when moving a controlled card', function() {
            beforeEach(function() {
                this.ownerSpy = { owner: 1 };
                this.cardSpy.owner = this.ownerSpy;
            });

            describe('from out-of-play to in-play', function() {
                beforeEach(function() {
                    this.cardSpy.location = 'discard pile';
                    this.player.moveCard(this.cardSpy, 'play area');
                });

                it('should use the current player', function() {
                    expect(GameActions.moveCard).toHaveBeenCalledWith(jasmine.objectContaining({
                        player: this.player
                    }));
                });
            });

            describe('from in-play to out-of-play', function() {
                beforeEach(function() {
                    this.cardSpy.location = 'play area';
                    this.player.moveCard(this.cardSpy, 'discard pile');
                });

                it('should use the owner', function() {
                    expect(GameActions.moveCard).toHaveBeenCalledWith(jasmine.objectContaining({
                        player: this.ownerSpy
                    }));
                });
            });

            describe('from out-of-play to out-of-play', function() {
                beforeEach(function() {
                    this.cardSpy.location = 'discard pile';
                    this.player.moveCard(this.cardSpy, 'hand', this.options);
                });

                it('should use the owner', function() {
                    expect(GameActions.moveCard).toHaveBeenCalledWith(jasmine.objectContaining({
                        player: this.ownerSpy
                    }));
                });
            });
        });
    });
});
