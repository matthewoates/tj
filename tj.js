(function (tj, global) {
    'use strict';

    var is = {};
    tj._is = is;
    global.is = is;

    (function (is) {
        is.array = function (a) {
            return Object.prototype.toString.call(a) === '[object Array]';
        };

        is.arrayOf = function (t) {
            return function (a) {
                var ok = is.array(a);

                for (var i = 0; i < a.length && ok; i++) {
                    ok = t(a[i]);
                }

                return !!ok;
            };
        };

        is.bool = function (b) {
            return !!b === b;
        };

        is.defined = function (x) {
            return x !== null &&
                !is.undefined(x) &&
                x !== Infinity &&
                x !== -Infinity &&
                !is.nan(x);
        }

        is.fn = function (f) {
            return Object.prototype.toString.call(f) === '[object Function]';
        };

        is.integer = function (x) {
            return is.number(x) && x % 1 === 0;
        }

        is.nan = function (n) {
            return is.number(n) && isNaN(n);
        };

        is.number = function (n) {
            return Object.prototype.toString.call(n) === '[object Number]';
        };

        is.object = function (o) {
            return new Object(o) === o;
        };

        is.realNumber = function (n) {
            return is.number(n) &&
                n !== Infinity &&
                n !== -Infinity &&
                !is.nan(n);
        };

        is.string = function (s) {
            return Object.prototype.toString.call(s) === '[object String]';
        };

        is.undefined = function (o) {
            return (typeof o === 'undefined');
        };

        is.any = function (o) {
            return true;
        };

        is.instanceOf = function (constructor) {
            return function (o) {
                return is.fn(constructor) && (o instanceof constructor);
            };
        };
    }(is));




    var invalidSignatureError = new Error('tj.subscribe: Invalid signature');
    var subEventNameError = new Error('tj.subscribe: eventName is not a string');
    var pubEventNameError = new Error('tj.publish: eventName is not a string');
    var noCallbackError = new Error('tj.subscribe: Last paramater must be a callback function');
    var badTokenError = new Error('tj.unsubscribe: bad token, or the subscriber with this token has already been unsubscribed');
    var pubSignatureMismatch = new Error('tj.publish: signature mismatch');
    var queuedEvents = [];

    var setImmediate = global.setImmediate || (function (fn) {
        return setTimeout(fn, 0);
    });

    var queuedEvents = [],
        eventSubscribers = {},
        eventSignatures = {},
        allSubscribers = {}; // token -> subscriber

    // this token is used to unsubscribe
    var getToken = (function () {
        var token = 0;

        return function () {
            token += 1;
            return String(token);
        };
    }());

    function removeElement(arr, index) {
        // element at index <index> is removed and returned
        return arr.splice(index, 1)[0];
    }

    function isValidSignature(signature) {
        var success = true,
            i;

        for (i = 0; i < signature.length && success; i++) {
            success = is.fn(signature[i]);
        }

        return success;
    }

    function matchesSignature(args, signature) {
        // the signature is an array of functions that return truthy values if the input is of the proper type
        var success = (args.length === signature.length),
            i;

        for (i = 0; i < args.length && success; i++) {
            success = signature[i](args[i]);
        }

        return success;
    }

    function throwError(e) {
        //if (canThrowErrors) {
            throw e;
        //}
    }

    function runEvents() {
        var events = queuedEvents,
            event,
            i;
        queuedEvents = [];

        for (i = 0; i < events.length; i++) {
            event = events[i];

            event.fn.apply(global, event.args);
        }
    }

    function publish(eventName /* ... arguments */) {
        var callbackArguments = Array.prototype.slice.call(arguments, 1),
            signature = eventSignatures[eventName],
            subscribers = eventSubscribers[eventName];

        if (!is.string(eventName)) {
            throwError(pubEventNameError);
        }

        if (signature && !matchesSignature(callbackArguments, signature)) {
            throwError(pubSignatureMismatch);
        }

        for (var i = 0; subscribers && i < subscribers.length; i++) {
            queuedEvents.push({
                fn   : subscribers[i].fn,
                args : callbackArguments
            });
        }

        runEvents();
    }

    function subscribe(eventName /* argumentTypes..., fn */) {
        var callback = arguments[arguments.length - 1],
            subscriber;

        if (!is.string(eventName)) {
            throwError(pubEventNameError);
        }

        if (!is.fn(callback)) {
            throwError(noCallbackError);
        }

        subscriber = {
            eventName : eventName,
            fn        : arguments[arguments.length - 1],
            token     : getToken()
        };

        if (!(eventName in eventSubscribers)) {
            // since this is the first time we have seen a subscriber to this event,
            // we must record the specified subscriber signature
            var eventSignature = Array.prototype.slice.call(arguments, 1, arguments.length - 1); // remove first and last element

            if (!isValidSignature(eventSignature)) {
                throwError(invalidSignatureError);
            }

            eventSignatures[eventName] = eventSignature;
            eventSubscribers[eventName] = [];
        }

        eventSubscribers[eventName].push(subscriber);
        allSubscribers[subscriber.token] = subscriber;

        return subscriber.token;
    }

    function unsubscribe(token) {
        var subscriber = allSubscribers[token];

        if (!is.object(subscriber) || !allSubscribers.hasOwnProperty(token)) {
            throwError(badTokenError);
        }

        if (subscriber) {
            var subscribers = eventSubscribers[subscriber.eventName];

            for (var i = 0; i < subscribers.length; i++) {
                if (subscribers[i].token === token) {
                    removeElement(subscribers, i);
                    break;
                }
            }

            delete allSubscribers[token];
        }

        return !!subscriber;
    }

    tj.publish = publish;
    tj.subscribe = subscribe;
    tj.unsubscribe = unsubscribe;
}(typeof exports === 'undefined' ? this.tj = {} : exports, this));
