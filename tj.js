(function (tj, global) {
    'use strict';

    var numTokensRequested = 0;
    var is = require('is-simple');
    var allSubscribers = {}; // event -> {token: <string>, fn: <Function>}

    var getUniqueToken = (function () {
        numTokensRequested += 1;

        return String(numTokensRequested);
    });

    var emit = (function (event, args) {
        if (allSubscribers.hasOwnProperty(event)) {
            var eventSubscribers = allSubscribers[event];

            for (var i = 0; i < eventSubscribers.length; i++) {
                var fn = eventSubscribers[i].fn;

                try {
                    fn.apply(global, args)
                } catch (e) {
                    setTimeout(function () {
                        throw e;
                    }, 0);
                }
            }
        }
    });

    var checkArgs = (function (event, args) {
        if (allSubscribers.hasOwnProperty(event)) {
            var eventSubscribers = allSubscribers[event];
            var valid = true;

            for (var i = 0; i < eventSubscribers.length && valid; i++) {
                var signature = eventSubscribers[i].signature;

                valid = signature.length === args.length;

                for (var j = 0; j < signature.length && valid; j++) {
                    valid = signature[j](args[j]);
                }
            }

            if (!valid) {
                throw new Error('Invalid args for event ' + event);
            }
        }
    });

    tj.clearAllSubscriptions = (function () {
        allSubscribers = {};
    });

    tj.publish = (function (event) {
        var args = [].slice.call(arguments, 1, arguments.length);

        checkArgs(event, args);

        setTimeout(function () {
            emit(event, args);
        }, 0);
    });

    tj.publishSync = (function (event) {
        var args = [].slice.call(arguments, 1, arguments.length);

        checkArgs(event, args);

        emit(event, args);
    });

    tj.subscribe = (function (event) {
        var token = getUniqueToken();
        var fn = arguments[arguments.length - 1];
        var signature = [].slice.call(arguments, 1, arguments.length - 1);

        if (!allSubscribers.hasOwnProperty(event)) {
            // this is the first subscriber to this event
            allSubscribers[event] = [];
        }

        allSubscribers[event].push({
            token: token,
            signature: signature,
            fn: fn
        });

        return token;
    });

    tj.unsubscribe = (function (token) {
        var event;

        for (event in allSubscribers) {
            if (allSubscribers.hasOwnProperty(event)) {
                var eventSubscribers = allSubscribers[event];

                for (var i = 0; i < eventSubscribers.length; i++) {
                    var eventSubscriber = eventSubscribers[i];

                    if (eventSubscriber.token === token) {
                        eventSubscribers.splice(i, 1); // remove the subscriber
                        return true; // nothing else to do
                    }
                }
            }
        }

        return false;
    });
}(typeof exports === 'undefined' ? this.tj = {} : exports, this));
