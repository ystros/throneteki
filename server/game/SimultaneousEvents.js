class SimultaneousEvents {
    constructor() {
        this.childEvents = [];
        this.postHandlers = [];
    }

    get activeChildEvents() {
        return this.childEvents.filter(event => !event.cancelled);
    }

    addChildEvent(event) {
        event.parentEvent = this;
        this.childEvents.push(event);
    }

    emitTo(emitter, suffix) {
        for(let event of this.activeChildEvents) {
            event.emitTo(emitter, suffix);
        }
    }

    get resolved() {
        return this.childEvents.every(event => event.resolved);
    }

    get cancelled() {
        return this.childEvents.every(event => event.cancelled);
    }

    cancel() {
        for(let event of this.activeChildEvents) {
            event.cancel();
        }

        if(this.parent) {
            this.parent.onChildCancelled(this);
        }
    }

    executeHandler() {
        for(let event of this.getConcurrentEvents()) {
            event.executeHandler();
        }
    }

    executePostHandler() {
        for(let event of this.activeChildEvents) {
            event.executePostHandler();
        }

        for(let postHandler of this.postHandlers) {
            postHandler(this);
        }
    }

    getConcurrentEvents() {
        const events = this.activeChildEvents.reduce((concurrentEvents, event) => {
            return concurrentEvents.concat(event.getConcurrentEvents());
        }, []);

        return events.sort((a, b) => a.order < b.order ? -1 : 1);
    }

    getPrimaryEvent() {
        return this.activeChildEvents[0];
    }

    thenExecute(func) {
        this.postHandlers.push(func);
        return this;
    }

    toString() {
        return `simultaneous(${this.activeChildEvents.map(e => e.toString()).join(', ')})`;
    }
}

module.exports = SimultaneousEvents;
