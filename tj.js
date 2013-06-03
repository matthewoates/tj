(function (tj) {
    'use strict';

    var version = '0.0.1',
        eventSignatures = {},
        eventSubscribers = {},
        events = [];

    tj.any = {};
    tj.defined = {};
    tj.realNumber = {};
    tj.integer = {};

    function isArray(a) {
        return Object.prototype.toString.call(a) === '[object Array]';
    }

    function isNumber(n) {
        return typeof n === 'number';
    }

    function isBoolean(b) {
        return !!b === b;
    }

    function isString(s) {
        return typeof s === 'string';
    }

    function isFunction(f) {
        return typeof f === 'function';
    }

    function isActuallyNaN(x) {
        return isNumber(x) && isNaN(x);
    }

    function isType(t) {
        // In safari things like HTMLElement and Event are objects and not functions.
        // False positives are better than false negatives
        return isFunction(t) || isObject(t);
    }

    function isObject(o) {
        return o !== null &&
            typeof o !== 'undefined' &&
            !isNumber(o) &&
            !isBoolean(o) &&
            !isString(o);
    }

    function matchesSpecialType(arg, type) {
        var result = false;

        if (type === tj.any) {
            result = true;
        } else if (type === tj.defined) {
            result = arg !== null &&
                typeof arg !== 'undefined' &&
                arg !== Infinity &&
                arg !== -Infinity &&
                !isActuallyNaN(arg);
        } else if (type === tj.realNumber) {
            result = isNumber(arg) &&
                arg !== Infinity &&
                arg !== -Infinity &&
                !isActuallyNaN(arg);
        } else if (type === tj.integer) {
            result = isNumber(arg) && arg % 1 === 0;
        }

        return result;
    }

    function matchesPredefinedType(arg, type) {
        return (type === Array && isArray(arg)) ||
            (type === Number && isNumber(arg)) ||
            (type === Boolean && isBoolean(arg)) ||
            (type === String && isString(arg)) ||
            (type === Function && isFunction(arg)) ||
            (type === Object && isObject(arg));
    }

    function matchesType(arg, type) {
        try {
            return arg instanceof type;
        } catch (e) {
            return false;
        }
    }

    function matches(arg, type) {
        return matchesSpecialType(arg, type) ||
            matchesPredefinedType(arg, type) ||
            matchesType(arg, type);
    }

    function typeToString(obj) {
        var result = '';

        if (obj === null) {
            result = 'null';
        } else if (typeof obj === 'undefined') {
            result = 'undefined';
        } else if (obj === tj.any) {
            result = 'tj.any';
        } else if (obj === tj.defined) {
            result = 'tj.defined';
        } else if (obj === tj.realNumber) {
            result = 'tj.realNumber';
        } else if (obj === tj.integer) {
            result = 'tj.integer';
        } else {
            result = obj.name;
        }

        return result;
    }

    function objToTypeString(obj) {
        return obj.constructor && obj.constructor.name;
    }

    function stringify(elements, map) {
        var result = [], i;

        for (i = 0; i < elements.length; i++) {
            result.push(map(elements[i]));
        }

        return '(' + result.join(', ') + ')';
    }

    function pushEvent(eventName, args) {
        events.push({
            name : eventName,
            args : args
        });

        setTimeout(runEvents, 0);
    }

    function runEvents() {
        var readyEvents = events;
        events = [];

        for (var i = 0; i < readyEvents.length; i++) {
            var event = readyEvents[i];
            var callbacks = eventSubscribers[event.name];
            for (var j = 0; j < callbacks.length; j++) {
                callbacks[j].apply(tj, event.args);
            }
        }
    }

    tj.publish = function (eventName) {
        var callbackArguments = [],
            callbacks,
            signature,
            signatureMatches,
            i;

        if (!isString(eventName)) {
            throw new Error('tj.publish(): The event name must be a string');
        }
        if (!eventSubscribers.hasOwnProperty(eventName)) {
            throw new Error('tj.publish(): ' + eventName + ' is not a registered event.');
        }

        for (i = 1; i < arguments.length; i++) {
            callbackArguments.push(arguments[i]);
        }

        signature = eventSignatures[eventName];
        signatureMatches = (signature.length === callbackArguments.length);

        for (i = 0; i < signature.length; i++) {
            signatureMatches = signatureMatches && matches(callbackArguments[i], signature[i]);
        }

        if (signatureMatches) {
            pushEvent(eventName, callbackArguments);
        } else {
            throw new Error('tj.publish(): Argument mismatch in event ' + eventName +
                '\n    expected: ' + stringify(signature, typeToString) +
                '\n    received: ' + stringify(callbackArguments, objToTypeString));
        }
    };

    tj.subscribe = function (eventName) {
        var signature, callback, i, oldSignature, signaturesMatch, arg;

        if (!isString(eventName)) {
            throw new Error('tj.subscribe(): The event name must be a string');
        }
        callback = arguments[arguments.length - 1];
        if (!isFunction(callback)) {
            throw new Error('tj.subscribe(): The last parameter must be a callback function');
        }

        signature = [];
        for (i = 1; i < arguments.length - 1; i++) {
            arg = arguments[i];
            if (!isType(arg)) {
                throw new Error('tj.subscribe(): Signature can only consist of constructors');
            }

            signature.push(arg);
        }

        if (eventSignatures.hasOwnProperty(eventName)) {
            // there is already a subscriber to this event, so check if the signature matches
            oldSignature = eventSignatures[eventName];
            signaturesMatch = signature.length === oldSignature.length;

            for (i = 0; i < signature.length && signaturesMatch; i++) {
                signaturesMatch = signaturesMatch && signature[i] === oldSignature[i];
            }

            if (!signaturesMatch) {
                throw new Error('tj.subscribe(): Event subscriber signature does not match previous subscriber(s) for event ' + eventName +
                    '\n    old signature: ' + stringify(oldSignature, typeToString) +
                    '\n    new signature: ' + stringify(signature, typeToString));
            }
        }

        eventSignatures[eventName] = signature;
        if (!eventSubscribers.hasOwnProperty(eventName)) {
            eventSubscribers[eventName] = [];
        }
        eventSubscribers[eventName].push(callback);
    };

    tj.toString = function () {
        return 'You are running tj ' + version;
    };

    // for testing purposes
    tj._matches = matches;
    tj._typeToString = typeToString;
}(typeof exports === 'undefined' ? this.tj = {} : exports));
