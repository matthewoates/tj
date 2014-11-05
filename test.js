if (typeof require !== 'undefined') {
    // node.js
    global.expect = require('expect.js');
    global.tj = require('./tj');
}

beforeEach(function () {
    tj.clearAllSubscriptions();
});

describe('sanity check', function () {
    it('tj should be defined', function () {
        expect(tj).to.be.ok();
    });
});

// basic publish / subscribe / unsubscribe mechanism

describe('clearAllSubscriptions() tests', function () {
    it('clearing subscriptions should prevent publishSync() from firing events', function () {
        var ok = true;
        
        tj.subscribe('foo', function () {
            ok = false;
        });
        
        tj.clearAllSubscriptions();
        tj.publishSync('foo');
        
        expect(ok).to.be(true);
    });
    
    it('clearing subscriptions should cause all unsubscribe calls to return false', function () {
        var fn = function () {};
        
        tj.subscribe('foo', fn);
        tj.clearAllSubscriptions();
        
        expect(tj.unsubscribe(fn)).to.be(false);
    });
});

describe('subscribe() and publishSync() tests', function () {
    it('publishSync() with one event', function () {
        var ok = false;
        
        tj.subscribe('foo', function () {
            ok = true;
        });
        
        tj.publishSync('foo');
        
        expect(ok).to.be(true);
    });
});

describe('subscribe() and publish() tests', function () {
    it('calling publish() before subscribe() on the same tick should register', function (done) {
        var ok = false;
        
        tj.subscribe('foo', function () {
            ok = true;
        });
        
        tj.publish('foo');
        
        setTimeout(function () {
            expect(ok).to.be(true);
            
            done();
        }, 0);
    });
    
    it('calling publish() after subscribe() on the same tick should register', function (done) {
        var ok = false;
        
        tj.publish('foo');
        
        tj.subscribe('foo', function () {
            ok = true;
        });
        
        setTimeout(function () {
            expect(ok).to.be(true);
            
            done();
        }, 0);
    });
});

describe('subscribe(), unsubscribe(), and publishSync() tests', function () {
    it('subscribe -> unsubscribe -> publish should not register', function (done) {
        var ok = true;
        var token = tj.subscribe('foo', function () {
            ok = false;
        });
        
        tj.unsubscribe(token);
        
        tj.publish('foo');
        
        setTimeout(function () {
            expect(ok).to.be(true);
            
            done();
        }, 0);
    });
});

// type checking