describe('The White Shadows', function() {
    integration(function() {
        beforeEach(function() {
            const deck1 = this.buildDeck('thenightswatch', [
                'The White Shadows',
                'Old Forest Hunter'
            ]);
            const deck2 = this.buildDeck('thenightswatch', [
                'A Noble Cause',
                'Steward at the Wall', 'Craster'
            ]);

            this.player1.selectDeck(deck1);
            this.player2.selectDeck(deck2);
            this.startGame();
            this.keepStartingHands();

            this.character = this.player1.findCardByName('Old Forest Hunter', 'hand');
            this.opponentCharacter = this.player2.findCardByName('Steward at the Wall', 'hand');
            this.craster = this.player2.findCardByName('Craster', 'hand');

            this.player1.clickCard(this.character);
            this.player2.clickCard(this.opponentCharacter);
            this.player2.clickCard(this.craster);

            this.completeSetup();

            this.player1.selectPlot('The White Shadows');
            this.player2.selectPlot('A Noble Cause');
            this.selectFirstPlayer(this.player1);

            this.completeMarshalPhase();

            this.unopposedChallenge(this.player1, 'Military', this.character);
            this.player1.clickPrompt('Apply Claim');
        });

        describe('when a character is killed', function() {
            beforeEach(function() {
                this.player2.clickCard(this.opponentCharacter);
                this.player1.clickPrompt('The White Shadows');
            });

            it('should control the character', function() {
                expect(this.opponentCharacter).toBeControlledBy(this.player1);
            });

            it('should put the character into play', function() {
                expect(this.opponentCharacter.location).toBe('play area');
            });

            it('should blank the character', function() {
                expect(this.opponentCharacter.isBlank()).toBe(true);
            });
        });

        describe('when Craster is killed', function() {
            beforeEach(function() {
                this.player2.clickCard(this.craster);
                this.player1.clickPrompt('The White Shadows');
            });

            it('should control the character', function() {
                expect(this.craster).toBeControlledBy(this.player1);
            });

            it('should put the character into play', function() {
                expect(this.craster.location).toBe('play area');
            });

            it('should blank the character', function() {
                expect(this.craster.isBlank()).toBe(true);
            });
        });
    });
});
