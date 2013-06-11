# TJ


TJ is a type safe publish subscribe API in JavaScript that works in the browser and Node.js.


# usage

```javascript
var tj = require('tj'); // use require() for node.js only

tj.subscribe('ADD_NUMBERS', Number, Number,
    function (a, b) {
        console.log(a + b);
    }
);

tj.publish('ADD_NUMBERS', 1, 2);
```

When the callback function runs, you know that `a` and `b` are of type `Number`.





# Methods
### subscribe
```javascript
tj.subscribe(eventName, argType1, argType2, argType3, ..., callbackFunction);
```
A call to `tj.subscribe()` will create a listener for events of type `eventName` from `tj.publish()`. You can assume that each argument passed to `callbackFunction` will be of type `argTypeN`.

For a successful call to `tj.subscribe()`, the following criteria must be met:
- `eventName` must be of type String
- each `argType` must be of type Function or Object
- `callbackFunction` must be of type Function
- if an event has already been published with the same `eventName`, the signature cannot conflict


### publish
```javascript
tj.publish(eventName, arg1, arg2, arg3, ...);
```
A call to `tj.publish()` will call all subscribers of `eventName` asynchronously with the data that was passed in to `tj.publish()`.

For a successful call to `tj.publish()`, the following criteria must be met:
- `eventName` must be of type String
- there must be at least 1 subscriber to `eventName`
- each `arg` must be of type `argType` respectively as specified in the subscriber



# Types
TJ supports the basic JavaScript types, as well as a few special types. Rows are example values, and columns are types.

### JavaScript Types
|matches                                 | **Array** | **Number** | **Boolean** | **String** | **Function** | **Object** |
| -------------------------------------- | --------- | ---------- | ----------- | ---------- | ------------ | ---------- |
|null, undefined                         |   no      |   no       |   no        |   no       |   no         |   no       |
|NaN, Infinity                           |   no      |   yes      |   no        |   no       |   no         |   no       |
|0, 2, -5                                |   no      |   yes      |   no        |   no       |   no         |   no       |
|0.5, Math.PI                            |   no      |   yes      |   no        |   no       |   no         |   no       |
|true, false                             |   no      |   no       |   yes       |   no       |   no         |   no       |
|"", "hello"                             |   no      |   no       |   no        |   yes      |   no         |   no       |
|[], [1, 2, 3]                           |   yes     |   no       |   no        |   no       |   no         |   yes      |
|{}                                      |   no      |   no       |   no        |   no       |   no         |   yes      |
|function () {}, console, window, Object |   no      |   no       |   no        |   no       |   yes        |   yes      |

### Special Types
|matches                                 | **tj.any** | **tj.defined** | **tj.realNumber** | **tj.integer** |
| -------------------------------------- | ---------- | -------------- | ----------------- | -------------- |
|null, undefined                         |   yes      |   no           |   no              |   no           |
|NaN, Infinity                           |   yes      |   no           |   no              |   no           |
|0, 2, -5                                |   yes      |   yes          |   yes             |   yes          |
|0.5, Math.PI                            |   yes      |   yes          |   yes             |   no           |
|true, false                             |   yes      |   yes          |   no              |   no           |
|"", "hello"                             |   yes      |   yes          |   no              |   no           |
|[], [1, 2, 3]                           |   yes      |   yes          |   no              |   no           |
|{}                                      |   yes      |   yes          |   no              |   no           |
|function () {}, console, window, Object |   yes      |   yes          |   no              |   no           |

*Note: Arrays are considered Objects, and null is not considered an Object*
*This is because properties can be assigned to Arrays but cannot be assigned to null*

# Examples
Here is a simple example:
```javascript
tj.subscribe('ADD_NUMBERS', Number, Number,
    function (a, b) {
        alert(a + b);
    }
);

tj.publish('ADD_NUMBERS', 1, 2);
tj.publish('ADD_NUMBERS', '1', '2'); // error
tj.publish('ADD_NUMBERS'); // error
tj.publish('ADD_NUMBERS', 1, 2, 3); // error
```

Arguments are optional:
```javascript
tj.subscribe('HELLO_WORLD',
    function () {
        alert('hello world!');
    }
);

tj.publish('HELLO_WORLD');
```

User-defined types are recognized.
```javascript
function Point(x, y) {
    this.x = x;
    this.y = y;
}

tj.subscribe('NEW_POINT', Point,
    function (p) {
        console.log(p.x, p.y);
    }
);

tj.publish('NEW_POINT', new Point(1, 2));
tj.publish('NEW_POINT', {x: 1, y: 2}); // error
```

You can use DOM objects:
```javascript
tj.subscribe('NEW_P', HTMLElement,
    function (p) {
        p.innerHTML = 'hi';
        document.body.appendChild(p);
    }
);

tj.publish('NEW_P', document.createElement('p'));
```

As well as many others:
```javascript
tj.subscribe('MATCHES', String, String, RegExp,
    function (str, rep, exp) {
        alert(str.replace(exp, rep));
    }
);

tj.publish('MATCHES', 'this is cool', 'awesome', /cool/);
```

Don't forget about the special types:
```javascript
tj.subscribe('RANDOM', tj.any, tj.defined, tj.realNumber, tj.integer,
    function (a, b, c, d) {
        if (b && (c || c !== 0) && d % 1 === 0) {
            alert('This function is pretty useless, but this if will always pass');
        }
    }
);
```

# Installation
For node.js:
```sh
npm install tj
```
For the browser:
Include tj.js

# Testing
To run the automated tests, open test.html
Tests passing in IE7+, Chrome, Firefox, Safari, and Opera

# License
MIT
