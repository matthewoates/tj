tj.subscribe('ADD_NUMBERS', Number, Number,
    function (a, b) {
        console.log(a + ' + ' + b + ' = ' + (a + b));
    }
);

tj.publish('ADD_NUMBERS', 1, 2);
tj.publish('ADD_NUMBERS', 1);
tj.publish('ADD_NUMBERS', 1, 2, 3);
tj.publish('ADD_NUMBERS', '1', '2');

tj.subscribe('MAX', Array, function (arr) {

});
tj.publish('MAX', [1, 2, 3]);


function Point(x, y) {
    this.toString = function () {
        console.log('point:', x, y);
    }
}

tj.subscribe('POINT', Point,
    function (p) {
        console.log(p);
    });

tj.publish('POINT', new Point(5, 4));
tj.publish('POINT', {x: 5, y: 4});