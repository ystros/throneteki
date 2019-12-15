fdescribe('Dothraki Handmaiden', function() {
    integration(function() {
        beforeEach(function() {
            const deck = this.buildDeck('baratheon', [
                'Loan from the Iron Bank',
                'Dothraki Handmaiden', 'Captain Groleo', 'Xaro Xhoan Daxos', 'Daenerys Targaryen (TFM)', 'Seal of the Hand'
            ]);
            this.player1.selectDeck(deck);
            this.player2.selectDeck(deck);
            this.startGame();
            this.keepStartingHands();

            this.character = this.player1.findCardByName('Dothraki Handmaiden', 'hand');
            this.attachment = this.player1.findCardByName('Seal of the Hand', 'hand');
            this.targetCharacter = this.player1.findCardByName('Daenerys Targaryen', 'hand');
            this.xaro = this.player1.findCardByName('Xaro Xhoan Daxos', 'hand');

            this.player1.clickCard(this.character);
            this.player1.clickCard('Captain Groleo', 'hand');
            this.player1.dragCard(this.xaro, 'play area');

            this.completeSetup();

            this.selectFirstPlayer(this.player1);

            this.player1.clickMenu(this.character, 'Attach facedown attachment');
            this.player1.clickCard(this.attachment);
        });

        describe('when marshalling facedown', function() {
            it('attaches the card facedown', function() {
                expect(this.character.attachments).toContain(this.attachment);
                expect(this.attachment.facedown).toBe(true);
            });

            it('counts as an attachment entering play', function() {
                expect(this.player1).toAllowAbilityTrigger('Captain Groleo');
            });

            it('does NOT count as marshalling a card with certain characteristics', function() {
                expect(this.player1).not.toAllowAbilityTrigger(this.xaro);
            });
        });

        describe('when Daenerys is in play', function() {
            beforeEach(function() {
                this.player1.dragCard(this.targetCharacter, 'play area');

                this.player1.clickCard(this.attachment);
                this.player1.clickCard(this.targetCharacter);
            });

            it('allows to marshal as if from hand', function() {
                expect(this.player1Object.gold).toEqual(7);
                expect(this.character.attachments).toEqual([]);
                expect(this.targetCharacter.attachments).toContain(this.attachment);
                expect(this.attachment.facedown).toBe(false);
            });

            it('does NOT count as the card entering play', function() {
                expect(this.player1).not.toAllowAbilityTrigger('Captain Groleo');
            });

            it('does count as marshalling the card', function() {
                expect(this.player1).toAllowAbilityTrigger(this.xaro);
            });
        });
    });
});
