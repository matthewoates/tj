TJ
=========

TJ is a type safe publish subscribe API in JavaScript.

You can do things like:
```javascript
console.log('hello');

tj.subscribe('ADD_NUMBERS', Number, Number,
    function (a, b) {
        console.log(a + b);
    }
);

tj.publish('ADD_NUMBERS', 1, 2);
tj.publish('ADD_NUMBERS', '1', '2'); // error
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