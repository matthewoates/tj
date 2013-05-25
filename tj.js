(function (global) {
    'use strict';

    var version = "0.0.1",
        tj = {},
        eventSignatures = {},
        eventSubscribers = {};

    function isString(s) {
        return typeof s === 'string';
    }

    function isFunction(f) {
        return typeof f === 'function';
    }

    function matchesPredefinedType(arg, type) {
        return (type === Array && Array.isArray(arg)) ||
            (type === Number && typeof arg === 'number') ||
            (type === String && isString(arg)) ||
            (type === Function && isFunction(arg));
    }

    function matchesUserDefinedType(arg, type) {
        return arg instanceof type;
    }

    function matches(arg, type) {
        return matchesPredefinedType(arg, type) || matchesUserDefinedType(arg, type);
    }

    function typeToString(obj) {
        /*var result = '';

        if (obj === Number) {
            result = 'Number';
        } else if (obj === String) {
            result = 'String';
        } else if (obj === Array) {
            result = 'Array';
        } else if (obj === Boolean) {
            result = 'Boolean';
        } else if (obj === Object) {
            result = 'Object';
        } else if (obj === null) {
            result = 'null';
        } else if (typeof obj === 'undefined') {
            result = 'undefined';
        }

        return result;*/
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
            callbacks = eventSubscribers[eventName];

            for (i = 0; i < callbacks.length; i++) {
                callbacks[i].apply(global, callbackArguments);
            }
        } else {
            console.log('tj.publish(): Argument mismatch in event ' + eventName +
                '\n    expected: ' + stringify(signature, typeToString) +
                '\n    received: ' + stringify(callbackArguments, objToTypeString));
        }
    };

    tj.subscribe = function (eventName) {
        var signature, callback, i;

        // TODO: allow multiple subscribers
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

        eventSignatures[eventName] = signature;
        if (!eventSubscribers.hasOwnProperty(eventName)) {
            eventSubscribers[eventName] = [];
        }
        eventSubscribers[eventName].push(callback);
    };

    tj.toString = function () {
        return "You are running tj " + version;
    };

    global.tj = tj;
}(window));