if (typeof require !== 'undefined') {
    // node.js
    global.expect = require('expect.js');
    global.tj = require('./tj');
    global.is = require('is-simple');
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

describe('subscribe() tests', function () {
    it('subscribe() always returns a different token', function () {
        var token1 = tj.subscribe('foo', function () {});
        var token2 = tj.subscribe('foo', function () {});

        expect(token1).to.not.equal(token2);
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

    it('publishSync() calls run in the proper order', function () {
        var order = [];

        tj.subscribe('bar', function () {
            order.push('bar1');
        });

        tj.subscribe('bar', function () {
            order.push('bar2');
        });

        tj.subscribe('baz', function () {
            order.push('baz1');
        });

        tj.subscribe('baz', function () {
            order.push('baz2');
        });

        tj.subscribe('foo', function () {
            order.push('foo1');
        });

        tj.subscribe('foo', function () {
            order.push('foo2');
        });

        tj.publishSync('foo');
        tj.publishSync('bar');
        tj.publishSync('baz');

        expect(order).to.eql(['foo1', 'foo2', 'bar1', 'bar2', 'baz1', 'baz2']);
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

    it('publish() calls run in the proper order', function (done) {
        var order = [];

        tj.subscribe('bar', function () {
            order.push('bar1');
        });

        tj.subscribe('bar', function () {
            order.push('bar2');
        });

        tj.subscribe('baz', function () {
            order.push('baz1');
        });

        tj.subscribe('baz', function () {
            order.push('baz2');
        });

        tj.subscribe('foo', function () {
            order.push('foo1');
        });

        tj.subscribe('foo', function () {
            order.push('foo2');
        });

        tj.publish('foo');
        tj.publish('bar');
        tj.publish('baz');

        setTimeout(function () {
            expect(order).to.eql(['foo1', 'foo2', 'bar1', 'bar2', 'baz1', 'baz2']);
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

    it('unsubscribe with a bogus token returns false', function () {
        // the empty string will never be a valid token
        expect(tj.unsubscribe('')).to.be(false);
    });
});

// argument passing

describe('arguments are sent to all subscribers', function () {
    it('two arguments are preserved', function () {
        var ok = false;

        tj.subscribe('foo', is.number, is.number, function (a, b) {
            ok = (a === 1 && b === 2);
        });

        tj.publishSync('foo', 1, 2);

        expect(ok).to.be(true);
    });

    it('no extra arguments are passed when you send no arguments', function () {
        var ok = false;

        tj.subscribe('foo', function () {
            ok = (arguments.length === 0);
        });

        tj.publishSync('foo');

        expect(ok).to.be(true);
    });

    it('no extra arguments are passed when you send 2 arguments', function () {
        var ok = false;

        tj.subscribe('foo', is.number, is.number, function (a, b) {
            ok = (arguments.length === 2);
        });

        tj.publishSync('foo', 1, 2);

        expect(ok).to.be(true);
    });
});

// type checking

describe('accepts arguments of correct type', function () {
    it('accepts arguments of varying types', function () {
        var ok = false;

        tj.subscribe('foo', is.object, is.number, is.undefined, is.boolean, function (obj, n, undef, bool) {
            expect(obj).to.eql({});
            expect(n).to.be(5);
            expect(undef).to.be(undefined);
            expect(bool).to.be(true);
            ok = true;
        });

        tj.publishSync('foo', {}, 5, undefined, true);
        expect(ok).to.be(true);
    });
});

describe('does not accept arguments of incorrect type', function () {
    it('does not accept too few arguments', function () {
        var ok = true;

        tj.subscribe('foo', is.number, is.number, is.number, function () {
            ok = false;
        });

        expect(function () {
            tj.publish('foo', 1, 1);
        }).to.throwError();

        expect(function () {
            tj.publish('foo', 1);
        }).to.throwError();

        expect(function () {
            tj.publish('foo');
        }).to.throwError();
    });

    it('does not accept too many arguments', function () {
        var ok = true;

        tj.subscribe('foo', is.number, is.number, is.number, function () {
            ok = false;
        });

        expect(function () {
            tj.publish('foo', 1, 1, 1, 1);
        }).to.throwError();

        expect(function () {
            tj.publish('foo', 1, 1, 1, 1, 1);
        }).to.throwError();

        expect(function () {
            tj.publish('foo', 1, 1, 1, 1, 1, 1);
        }).to.throwError();

        expect(ok).to.be(true);
    });

    it('does not accept switched arguments', function () {
        var ok = true;

        tj.subscribe('foo', is.number, is.string, function () {
            ok = false;
        });

        expect(function () {
            tj.publish('foo', '1', 1);
        }).to.throwError();

        expect(ok).to.be(true);
    });
});
