const MoveCardAction = require('../../../server/game/GameActions/MoveCardAction');
const Event = require('../../../server/game/event');

describe('MoveCardAction', function() {
    beforeEach(function() {
        this.createAction = (props = {}) => {
            return new MoveCardAction(Object.assign({
                internalAction: this.internalActionSpy,
                targetLocation: 'discard pile'
            }, props));
        };

        this.descriptorSpy = jasmine.createSpyObj('descriptor', ['canChangeGameState', 'eventHandler']);
        this.descriptorSpy.canChangeGameState.and.returnValue(true);
        this.descriptorSpy.name = 'actionName';
        this.descriptorSpy.eventName = 'BASE_EVENT';
        this.descriptorSpy.targetLocation = 'discard pile';

        this.cardSpy = jasmine.createSpyObj('card', ['allowGameAction', 'leavesPlay']);
        this.cardSpy.allowGameAction.and.returnValue(true);
        this.cardSpy.attachments = [];
        this.cardSpy.dupes = [];

        this.internalActionSpy = jasmine.createSpyObj('internalAction', ['allow', 'createEvent']);
        this.internalActionSpy.allow.and.returnValue(true);

        this.action = this.createAction();
        this.props = { card: this.cardSpy };
    });

    describe('allow()', function() {
        describe('when moving from in-play to out-of-play', function() {
            beforeEach(function() {
                this.cardSpy.location = 'play area';
                this.action = this.createAction({ targetLocation: 'discard pile'});
            });

            describe('when allowed to move', function() {
                it('returns true', function() {
                    expect(this.action.allow(this.props)).toEqual(true);
                });
            });

            describe('when the internal action is not allowed', function() {
                beforeEach(function() {
                    this.internalActionSpy.allow.and.returnValue(false);
                });

                it('returns false', function() {
                    expect(this.action.allow(this.props)).toEqual(false);
                });
            });

            describe('when the card cannot leave play', function() {
                beforeEach(function() {
                    this.cardSpy.allowGameAction.and.callFake(action => action !== 'leavePlay');
                });

                it('returns false', function() {
                    expect(this.action.allow(this.props)).toEqual(false);
                });
            });
        });

        describe('when moving between out-of-play areas', function() {
            beforeEach(function() {
                this.cardSpy.location = 'draw deck';
                this.action = this.createAction({ targetLocation: 'discard pile'});
            });

            describe('when allowed to move', function() {
                it('returns true', function() {
                    expect(this.action.allow(this.props)).toEqual(true);
                });
            });

            describe('when the internal action is not allowed', function() {
                beforeEach(function() {
                    this.internalActionSpy.allow.and.returnValue(false);
                });

                it('returns false', function() {
                    expect(this.action.allow(this.props)).toEqual(false);
                });
            });

            describe('when the card cannot leave play', function() {
                beforeEach(function() {
                    this.cardSpy.allowGameAction.and.callFake(action => action !== 'leavePlay');
                });

                it('returns true', function() {
                    expect(this.action.allow(this.props)).toEqual(true);
                });
            });
        });

        describe('when moving between in-play areas', function() {
            beforeEach(function() {
                this.cardSpy.location = 'play area';
                this.action = this.createAction({ targetLocation: 'play area'});
            });

            describe('when allowed to move', function() {
                it('returns true', function() {
                    expect(this.action.allow(this.props)).toEqual(true);
                });
            });

            describe('when the internal action is not allowed', function() {
                beforeEach(function() {
                    this.internalActionSpy.allow.and.returnValue(false);
                });

                it('returns false', function() {
                    expect(this.action.allow(this.props)).toEqual(false);
                });
            });

            describe('when the card cannot leave play', function() {
                beforeEach(function() {
                    this.cardSpy.allowGameAction.and.callFake(action => action !== 'leavePlay');
                });

                it('returns true', function() {
                    expect(this.action.allow(this.props)).toEqual(true);
                });
            });
        });
    });

    describe('createEvent()', function() {
        beforeEach(function() {
            this.internalActionSpy.createEvent.and.returnValue(new Event('BASE_EVENT', { card: this.cardSpy }));
        });

        describe('when moving from in-play to out-of-play', function() {
            beforeEach(function() {
                this.cardSpy.location = 'play area';
                this.action = this.createAction({ targetLocation: 'discard pile' });
                this.event = this.action.createEvent(this.props);
            });

            it('creates the base event', function() {
                expect(this.event.getConcurrentEvents()).toContain(jasmine.objectContaining({
                    name: 'BASE_EVENT'
                }));
            });

            it('creates the leaves play event', function() {
                expect(this.event.getConcurrentEvents()).toContain(jasmine.objectContaining({
                    name: 'onCardLeftPlay',
                    card: this.cardSpy
                }));
            });

            describe('the event handler', function() {
                beforeEach(function() {
                    this.event.executeHandler();
                    this.attachedEvents = this.event.getConcurrentEvents().reduce((attachedEvents, event) => attachedEvents.concat(event.attachedEvents), []);
                });

                it('attaches the appropriate place card event', function() {
                    expect(this.attachedEvents).toContain(jasmine.objectContaining({
                        name: 'onCardPlaced',
                        card: this.cardSpy,
                        location: 'discard pile'
                    }));
                });
            });
        });

        describe('when moving between out-of-play areas', function() {
            beforeEach(function() {
                this.cardSpy.location = 'draw deck';
                this.action = this.createAction({ targetLocation: 'discard pile' });
                this.event = this.action.createEvent(this.props);
            });

            it('creates the base event', function() {
                expect(this.event.getConcurrentEvents()).toContain(jasmine.objectContaining({
                    name: 'BASE_EVENT'
                }));
            });

            it('does not create the leaves play event', function() {
                expect(this.event.getConcurrentEvents()).not.toContain(jasmine.objectContaining({
                    name: 'onCardLeftPlay',
                    card: this.cardSpy
                }));
            });

            describe('the event handler', function() {
                beforeEach(function() {
                    this.event.executeHandler();
                });

                it('attaches the appropriate place card event', function() {
                    expect(this.event.attachedEvents).toContain(jasmine.objectContaining({
                        name: 'onCardPlaced',
                        card: this.cardSpy,
                        location: 'discard pile'
                    }));
                });
            });
        });
    });
});
