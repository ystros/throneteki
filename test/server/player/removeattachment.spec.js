const Player = require('../../../server/game/player');
const DrawCard = require('../../../server/game/drawcard');
const GameActions = require('../../../server/game/GameActions');

describe('Player', function() {
    beforeEach(function() {
        this.gameSpy = jasmine.createSpyObj('game', ['addMessage', 'playerDecked', 'queueSimpleStep', 'raiseEvent', 'resolveGameAction']);
        this.gameSpy.queueSimpleStep.and.callFake(step => step());
        this.player = new Player('1', {username: 'Player 1', settings: {}}, true, this.gameSpy);
        this.player.deck = {};
        this.player.initialise();
        this.player.phase = 'marshal';
        this.attachmentOwner = new Player('2', {username: 'Player 2', settings: {}}, false, this.gameSpy);
        this.attachmentOwner.initialise();
        this.attachment = new DrawCard(this.attachmentOwner, {});
        spyOn(this.attachment, 'canAttach').and.returnValue(true);
        this.card = new DrawCard(this.player, {});
        this.card.location = 'play area';
        this.player.cardsInPlay.push(this.card);
        this.player.attach(this.player, this.attachment, this.card);

        spyOn(GameActions, 'moveCard');
        this.gameSpy.resolveGameAction.and.returnValue(jasmine.createSpyObj('event', ['thenExecute']));
    });

    describe('removeAttachment', function() {
        beforeEach(function() {
            spyOn(this.attachment, 'leavesPlay');
            spyOn(this.attachment, 'isTerminal');
        });

        describe('when the attachment is terminal', function() {
            beforeEach(function() {
                this.attachment.isTerminal.and.returnValue(true);
                this.player.removeAttachment(this.attachment);
            });

            it('should return the attachment to its owners discard pile', function() {
                expect(GameActions.moveCard).toHaveBeenCalledWith(jasmine.objectContaining({
                    card: this.attachment,
                    player: this.attachmentOwner,
                    location: 'discard pile'
                }));
            });
        });

        describe('when the attachment is not terminal', function() {
            beforeEach(function() {
                this.attachment.isTerminal.and.returnValue(false);
                this.player.removeAttachment(this.attachment);
            });

            it('should return the attachment to its owners hand', function() {
                expect(GameActions.moveCard).toHaveBeenCalledWith(jasmine.objectContaining({
                    card: this.attachment,
                    player: this.attachmentOwner,
                    location: 'hand'
                }));
            });
        });
    });
});
