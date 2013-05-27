var matches = tj._matches;
var typeToString = tj._typeToString;

describe('matches() tests', function () {
    it('testing predefined type recognition', function () {
        expect(matches([], Array)).toEqual(true);
        expect(matches([1, 2, 3], Array)).toEqual(true);
        expect(matches(null, Array)).toEqual(false);
        expect(matches(undefined, Array)).toEqual(false);
        expect(matches(0, Array)).toEqual(false);
        expect(matches(true, Array)).toEqual(false);
        expect(matches(false, Array)).toEqual(false);
        expect(matches('', Array)).toEqual(false);
        expect(matches(function () {}, Array)).toEqual(false);
        expect(matches({}, Array)).toEqual(false);

        expect(matches(0, Number)).toEqual(true);
        expect(matches(Infinity, Number)).toEqual(true);
        expect(matches(NaN, Number)).toEqual(true);
        expect(matches(null, Number)).toEqual(false);
        expect(matches(undefined, Number)).toEqual(false);
        expect(matches([], Number)).toEqual(false);
        expect(matches(true, Number)).toEqual(false);
        expect(matches(false, Number)).toEqual(false);
        expect(matches('5', Number)).toEqual(false);
        expect(matches(function () {}, Number)).toEqual(false);
        expect(matches({}, Number)).toEqual(false);

        expect(matches(true, Boolean)).toEqual(true);
        expect(matches(false, Boolean)).toEqual(true);
        expect(matches(null, Boolean)).toEqual(false);
        expect(matches(undefined, Boolean)).toEqual(false);
        expect(matches([], Boolean)).toEqual(false);
        expect(matches(0, Boolean)).toEqual(false);
        expect(matches('', Boolean)).toEqual(false);
        expect(matches(function () {}, Boolean)).toEqual(false);
        expect(matches({}, Boolean)).toEqual(false);

        expect(matches('', String)).toEqual(true);
        expect(matches('hello', String)).toEqual(true);
        expect(matches(null, String)).toEqual(false);
        expect(matches(undefined, String)).toEqual(false);
        expect(matches([], String)).toEqual(false);
        expect(matches(0, String)).toEqual(false);
        expect(matches(true, String)).toEqual(false);
        expect(matches(false, String)).toEqual(false);
        expect(matches(function () {}, String)).toEqual(false);

        expect(matches(function () {}, Function)).toEqual(true);
        expect(matches(null, Function)).toEqual(false);
        expect(matches(undefined, Function)).toEqual(false);
        expect(matches(Function, Function)).toEqual(true);
        expect(matches([], Function)).toEqual(false);
        expect(matches(0, Function)).toEqual(false);
        expect(matches(true, Function)).toEqual(false);
        expect(matches(false, Function)).toEqual(false);
        expect(matches('', Function)).toEqual(false);
        expect(matches({}, Function)).toEqual(false);

        expect(matches({}, Object)).toEqual(true);
        expect(matches(window, Object)).toEqual(true);
        expect(matches(tj, Object)).toEqual(true);
        expect(matches([], Object)).toEqual(true);
        expect(matches(null, Object)).toEqual(false);
        expect(matches(undefined, Object)).toEqual(false);
        expect(matches(0, Object)).toEqual(false);
        expect(matches(true, Object)).toEqual(false);
        expect(matches(false, Object)).toEqual(false);
        expect(matches('', Object)).toEqual(false);
        expect(matches(function () {}, Object)).toEqual(true);
    });

    it('testing with a user-defined type', function () {
        function Foo() {}
        expect(matches(new Foo(), Foo)).toEqual(true);
        expect(matches(new Foo(), Array)).toEqual(false);
        expect(matches(new Foo(), Number)).toEqual(false);
        expect(matches(new Foo(), Boolean)).toEqual(false);
        expect(matches(new Foo(), String)).toEqual(false);
        expect(matches(new Foo(), Function)).toEqual(false);
        expect(matches(new Foo(), Object)).toEqual(true);
    });

    it('testing with a DOM type', function () {
        var p = document.createElement('p');
        expect(matches(p, HTMLElement)).toEqual(true);
        expect(matches(p, Array)).toEqual(false);
        expect(matches(p, Number)).toEqual(false);
        expect(matches(p, Boolean)).toEqual(false);
        expect(matches(p, String)).toEqual(false);
        expect(matches(p, Function)).toEqual(false);
        expect(matches(p, Object)).toEqual(true);
    });
});

// Array, Number, String, Function, Object, null, undefined

// NOTE:
// typeof null === 'object'

/*tj.subscribe('ADD_NUMBERS', Number, Number,
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
    };
}

tj.subscribe('POINT', Point,
    function (p) {
        console.log(p);
    });

tj.publish('POINT', new Point(5, 4));
//tj.publish('POINT', {x: 5, y: 4});

tj.subscribe('FOO',
    function () {
        console.log('foo1');
    });
tj.subscribe('FOO',
    function () {
        console.log('foo2');
    });
tj.publish('FOO');

//tj.subscribe('MISMATCH', Number, Number, function () {});
//tj.subscribe('MISMATCH', Number, function () {});

tj.subscribe('M', Number, String, function () {});
//tj.subscribe('M', Number, Number, function () {});
tj.subscribe('M', Number, String, function () {});
tj.publish('M', 5, '5');*/