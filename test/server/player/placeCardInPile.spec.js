const Player = require('../../../server/game/player');
const DrawCard = require('../../../server/game/drawcard');

describe('Player', function() {
    describe('placeCardInPile', function() {
        beforeEach(function() {
            this.gameSpy = jasmine.createSpyObj('game', ['playerDecked', 'raiseEvent', 'resolveEvent']);
            this.player = new Player('1', {username: 'Player 1', settings: {}}, true, this.gameSpy);
            this.player.initialise();
            this.player.phase = 'marshal';

            this.gameSpy.raiseEvent.and.callFake((name, params, handler) => {
                if(handler) {
                    handler(params);
                }
            });
            this.card = new DrawCard(this.player, { code: '1', name: 'Test' });
        });

        describe('when the card is not in a pile', function() {
            beforeEach(function() {
                this.card.location = '';
            });

            it('should add the card to the player hand', function() {
                this.player.placeCardInPile(this.card, 'hand');
                expect(this.player.hand).toContain(this.card);
                expect(this.card.location).toBe('hand');
            });

            it('should add the card to the player discard pile', function() {
                this.player.placeCardInPile(this.card, 'discard pile');
                expect(this.player.discardPile).toContain(this.card);
                expect(this.card.location).toBe('discard pile');
            });

            it('should add the card to the player dead pile', function() {
                this.player.placeCardInPile(this.card, 'dead pile');
                expect(this.player.deadPile).toContain(this.card);
                expect(this.card.location).toBe('dead pile');
            });

            it('should add the card to the player play area', function() {
                this.player.placeCardInPile(this.card, 'play area');
                expect(this.player.cardsInPlay).toContain(this.card);
                expect(this.card.location).toBe('play area');
            });
        });

        describe('when the card is in a non-play-area pile', function() {
            beforeEach(function() {
                this.player.discardPile.push(this.card);
                this.card.location = 'discard pile';

                this.player.placeCardInPile(this.card, 'hand');
            });

            it('should move it to the target pile', function() {
                expect(this.player.hand).toContain(this.card);
            });

            it('should remove it from the original pile', function() {
                expect(this.player.discardPile).not.toContain(this.card);
            });
        });

        describe('when the card is in the play area', function() {
            beforeEach(function() {
                this.player.cardsInPlay.push(this.card);
                this.card.location = 'play area';
            });

            describe('when the card is an attachment', function() {
                beforeEach(function() {
                    this.attachment = new DrawCard(this.player, {});
                    this.attachment.parent = this.card;
                    this.attachment.location = 'play area';
                    this.card.attachments.push(this.attachment);
                    spyOn(this.player, 'removeAttachment');

                    this.player.placeCardInPile(this.attachment, 'hand');
                });

                it('should place the attachment in the target pile', function() {
                    expect(this.player.hand).toContain(this.attachment);
                    expect(this.attachment.location).toBe('hand');
                });

                it('should remove the attachment from the card', function() {
                    expect(this.card.attachments).not.toContain(this.attachment);
                });
            });
        });

        describe('when the target location is the draw deck', function() {
            beforeEach(function() {
                this.player.drawDeck = [{}, {}, {}];
            });

            it('should add the card to the top of the deck', function() {
                this.player.placeCardInPile(this.card, 'draw deck');
                expect(this.player.drawDeck[0]).toBe(this.card);
            });

            it('should add the card to the bottom of the deck when the option is passed', function() {
                this.player.placeCardInPile(this.card, 'draw deck', { bottom: true });
                expect(this.player.drawDeck.slice(-1)[0]).toBe(this.card);
            });

            it('should be able to move a card from top to bottom of the deck', function() {
                this.player.drawDeck = [this.card, {}, {}, {}];
                this.card.location = 'draw deck';
                this.player.placeCardInPile(this.card, 'draw deck', { bottom: true });
                expect(this.player.drawDeck.length).toBe(4);
                expect(this.player.drawDeck.slice(-1)[0]).toBe(this.card);
            });
        });

        describe('when the card location property and actual location do not match', function() {
            // Game.takeControl used to push the card directly onto cardsInPlay
            // but did not update the location for the card. This caused weird
            // problems where the strength of the card would be doubled for both
            // challenges and dominance.
            beforeEach(function() {
                // Put into play with the wrong location.
                this.card.location = 'discard pile';
                this.player.cardsInPlay = [this.card];

                this.player.placeCardInPile(this.card, 'play area');
            });

            it('should not duplicate the card', function() {
                expect(this.player.cardsInPlay.length).toBe(1);
                expect(this.player.cardsInPlay).toEqual([this.card]);
            });
        });

        describe('when the target location is the active plot', function() {
            it('should set the card as the active plot', function() {
                this.player.placeCardInPile(this.card, 'active plot');
                expect(this.player.activePlot).toBe(this.card);
            });
        });
    });
});
