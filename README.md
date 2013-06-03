TJ
=========

TJ is a type safe publish subscribe API in JavaScript that works in the browser and Node.js.

You can do things like:
```javascript
tj.subscribe('ADD_NUMBERS', Number, Number,
    function (a, b) {
        console.log(a + b);
    }
);

tj.publish('ADD_NUMBERS', 1, 2);
tj.publish('ADD_NUMBERS', '1', '2'); // error
tj.publish('ADD_NUMBERS'); // error
tj.publish('ADD_NUMBERS', 1, 2, 3); // error
```

User-defined types are also recognized.
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

You can also use DOM objects:
```javascript
tj.subscribe('NEW_P', HTMLElement,
    function (p) {
        document.body.appendChild(p);
    }
);

tj.publish('NEW_P', document.createElement('p'));
tj.publish('NEW_P', {}); // error
```

Installation
--------------
For node.js:
```sh
npm install tj
```
For the browser:
Include tj.js


License
-
MIT