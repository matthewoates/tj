(function (global) {
    'use strict';

    var version = "0.0.1",
        tj = {},
        eventSignatures = {},
        eventSubscribers = {},
        events = [];

    function isArray(a) {
        return Array.isArray(a);
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

    function isObject(o) {
        // typeof null === 'object'
        return o instanceof Object;
    }

    function matchesPredefinedType(arg, type) {
        return (type === Array && isArray(arg)) ||
            (type === Number && isNumber(arg)) ||
            (type === Boolean && isBoolean(arg)) ||
            (type === String && isString(arg)) ||
            (type === Function && isFunction(arg));
    }

    function matchesType(arg, type) {
        return arg instanceof type;
    }

    function matches(arg, type) {
        return matchesPredefinedType(arg, type) || matchesType(arg, type);
    }

    function typeToString(obj) {
        var result = '';

        if (obj === null) {
            result = 'null';
        } else if (typeof obj === 'undefined') {
            result = 'undefined';
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
                callbacks[j].apply(global, event.args);
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
            throw new Error('tj.publish(): ' + eventName + 'is not a registered event.');
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
        var signature, callback, i, oldSignature, signaturesMatch;

        if (!isString(eventName)) {
            throw new Error('tj.subscribe(): The event name must be a string');
        }
        callback = arguments[arguments.length - 1];
        if (!isFunction(callback)) {
            throw new Error('tj.subscribe(): The last parameter must be a callback function');
        }

        signature = [];
        for (i = 1; i < arguments.length - 1; i++) {
            signature.push(arguments[i]);
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
        return "You are running tj " + version;
    };

    // for testing purposes
    tj._matches = matches;
    tj._typeToString = typeToString;

    global.tj = tj;
}(window));