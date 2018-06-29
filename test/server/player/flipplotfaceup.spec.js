const Player = require('../../../server/game/player');
const GameActions = require('../../../server/game/GameActions');

describe('Player', function() {
    beforeEach(function() {
        this.gameSpy = jasmine.createSpyObj('game', ['on', 'raiseEvent', 'playerDecked', 'resolveGameAction']);

        this.player = new Player('1', { username: 'Player 1', settings: {} }, true, this.gameSpy);
        this.player.initialise();

        this.selectedPlotSpy = jasmine.createSpyObj('plot', ['flipFaceup', 'moveTo', 'applyPersistentEffects']);
        this.selectedPlotSpy.uuid = '111';
        this.selectedPlotSpy.location = 'plot deck';
        this.selectedPlotSpy.controller = this.player;
        this.selectedPlotSpy.owner = this.player;
        this.anotherPlotSpy = jasmine.createSpyObj('plot', ['flipFaceup', 'moveTo', 'applyPersistentEffects']);
        this.anotherPlotSpy.uuid = '222';
        this.anotherPlotSpy.location = 'plot deck';
        this.anotherPlotSpy.controller = this.player;
        this.anotherPlotSpy.owner = this.player;

        this.player.selectedPlot = this.selectedPlotSpy;
        this.player.plotDeck = [this.selectedPlotSpy, this.anotherPlotSpy];

        spyOn(GameActions, 'moveCard');
    });

    describe('flipPlotFaceup()', function() {
        describe('on any flip', function() {
            beforeEach(function() {
                this.player.flipPlotFaceup();
            });

            it('should flip the selected plot face up', function() {
                expect(this.selectedPlotSpy.flipFaceup).toHaveBeenCalled();
            });

            it('should move the plot to the active plot slot', function() {
                expect(GameActions.moveCard).toHaveBeenCalledWith(jasmine.objectContaining({
                    card: this.selectedPlotSpy,
                    location: 'active plot'
                }));
            });

            it('should unselect the plot', function() {
                expect(this.player.selectedPlot).toBeFalsy();
            });
        });
    });

    describe('removeActivePlot()', function() {
        beforeEach(function() {
            this.activePlotSpy = jasmine.createSpyObj('plot', ['leavesPlay', 'moveTo']);
            this.activePlotSpy.location = 'active plot';
            this.activePlotSpy.controller = this.player;
            this.activePlotSpy.owner = this.player;
            this.player.activePlot = this.activePlotSpy;

            this.player.removeActivePlot();
        });

        it('should move the plot to the revealed plots pile', function() {
            expect(GameActions.moveCard).toHaveBeenCalledWith(jasmine.objectContaining({
                card: this.activePlotSpy,
                location: 'revealed plots'
            }));
        });

        it('should raise the onPlotDiscarded event', function() {
            expect(this.gameSpy.raiseEvent).toHaveBeenCalledWith('onPlotDiscarded', { player: this.player, card: this.activePlotSpy });
        });
    });

    describe('recyclePlots()', function() {
        describe('when there are no plots left', function() {
            beforeEach(function() {
                this.player.activePlot = this.selectedPlotSpy;
                this.player.plotDeck = [];
                this.player.plotDiscard = [this.anotherPlotSpy];
                this.anotherPlotSpy.location = 'revealed plots';

                this.player.recyclePlots();
            });

            it('should move the contents of the used plots pile back to the plots pile', function() {
                expect(GameActions.moveCard).toHaveBeenCalledWith(jasmine.objectContaining({
                    card: this.anotherPlotSpy,
                    location: 'plot deck'
                }));
            });

            it('should not move the just revealed plot to any of the piles', function() {
                expect(GameActions.moveCard).not.toHaveBeenCalledWith(jasmine.objectContaining({
                    card: this.selectedPlotSpy,
                    location: 'plot deck'
                }));
                expect(GameActions.moveCard).not.toHaveBeenCalledWith(jasmine.objectContaining({
                    card: this.selectedPlotSpy,
                    location: 'revealed plots'
                }));
            });
        });

        describe('when there are plots left', function() {
            beforeEach(function() {
                this.player.plotDeck = [this.selectedPlotSpy];
                this.player.plotDiscard = [this.anotherPlotSpy];
                this.anotherPlotSpy.location = 'revealed plots';

                this.player.recyclePlots();
            });

            it('should not move the contents of the used plots pile back to the plots pile', function() {
                expect(GameActions.moveCard).not.toHaveBeenCalledWith(jasmine.objectContaining({
                    card: this.anotherPlotSpy,
                    location: 'plot deck'
                }));
            });
        });
    });
});
