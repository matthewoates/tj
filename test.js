(function () {
    'use strict';

    var matches = tj._matches;
    var typeToString = tj._typeToString;

    describe('matches() tests', function () {
        describe('pure JavaScript type recognition', function () {
            it('Array type', function () {
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
            });

            it('Number type', function () {
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
            });

            it('Boolean type', function () {
                expect(matches(true, Boolean)).toEqual(true);
                expect(matches(false, Boolean)).toEqual(true);
                expect(matches(null, Boolean)).toEqual(false);
                expect(matches(undefined, Boolean)).toEqual(false);
                expect(matches([], Boolean)).toEqual(false);
                expect(matches(0, Boolean)).toEqual(false);
                expect(matches('', Boolean)).toEqual(false);
                expect(matches(function () {}, Boolean)).toEqual(false);
                expect(matches({}, Boolean)).toEqual(false);
            });

            it('String type', function () {
                expect(matches('', String)).toEqual(true);
                expect(matches('hello', String)).toEqual(true);
                expect(matches(null, String)).toEqual(false);
                expect(matches(undefined, String)).toEqual(false);
                expect(matches([], String)).toEqual(false);
                expect(matches(0, String)).toEqual(false);
                expect(matches(true, String)).toEqual(false);
                expect(matches(false, String)).toEqual(false);
                expect(matches(function () {}, String)).toEqual(false);
            });

            it('Function type', function () {
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
            });

            it('Object type', function () {
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
        });

        it('uer-defined type recognition', function () {
            function Foo() {}
            expect(matches(new Foo(), Foo)).toEqual(true);
            expect(matches(new Foo(), Array)).toEqual(false);
            expect(matches(new Foo(), Number)).toEqual(false);
            expect(matches(new Foo(), Boolean)).toEqual(false);
            expect(matches(new Foo(), String)).toEqual(false);
            expect(matches(new Foo(), Function)).toEqual(false);
            expect(matches(new Foo(), Object)).toEqual(true);
        });

        describe('DOM type recognition', function () {
            it('HTMLElement type', function () {
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
    });

    describe('tj.subscribe() tests', function () {
        describe('testing with bogus parameters', function () {
            it('calling subscribe() with zero parameters fails', function () {
                expect(function () {
                    tj.subscribe();
                }).toThrow();
            });

            it('calling subscribe() with something other than a function as the last parameter fails', function () {
                expect(function () {
                    tj.subscribe('BUSTED', 5);
                }).toThrow();
            });

            it('the first parameter must be a string', function () {
                // the first parameter must be a string
                expect(function () {
                    tj.subscribe(1234, function () {});
                }).toThrow();
            });

            it('the signature can only contain constructors (Functions)', function () {
                expect(function () {
                    tj.subscribe('BAD1', 0, function () {});
                }).toThrow();
                expect(function () {
                    tj.subscribe('BAD2', Number, Number, [], function () {});
                }).toThrow();
                expect(function () {
                    tj.subscribe('BAD3', Number, Number, 0, function () {});
                }).toThrow();
                expect(function () {
                    tj.subscribe('BAD4', Number, Number, false, function () {});
                }).toThrow();
                expect(function () {
                    tj.subscribe('BAD5', Number, Number, '', function () {});
                }).toThrow();
                expect(function () {
                    tj.subscribe('BAD6', Number, Number, {}, function () {});
                }).toThrow();
                expect(function () {
                    tj.subscribe('BAD7', Number, Number, null, function () {});
                }).toThrow();
                expect(function () {
                    tj.subscribe('BAD8', Number, Number, undefined, function () {});
                }).toThrow();
            });
        });

        describe('testing with conflicting signatures', function () {
            it('error with conflicting number of arguments', function () {
                expect(function () {
                    tj.subscribe('CONFLICT1', function () {});
                    tj.subscribe('CONFLICT1', Number, function () {});
                }).toThrow();
            });

            it('error with conflicting argument types', function () {
                expect(function () {
                    tj.subscribe('CONFLICT2', Number, Number, Number, function () {});
                    tj.subscribe('CONFLICT2', Number, Object, Number, function () {});
                }).toThrow();

                expect(function () {
                    tj.subscribe('CONFLICT3', Object, function () {});
                    tj.subscribe('CONFLICT3', Function, function () {});
                }).toThrow();

                expect(function () {
                    tj.subscribe('CONFLICT4', Function, function () {});
                    tj.subscribe('CONFLICT4', Object, function () {});
                }).toThrow();
            });
        });

        describe('testing passing cases', function () {
            var Foo = function () {};

            it('subscribe with empty signature', function () {
                expect(function () {
                    tj.subscribe('PASS1', function () {});
                }).not.toThrow();
            });

            it('subscribe with basic JavaScript types', function () {
                expect(function () {
                    tj.subscribe('PASS2', Array, function () {});
                }).not.toThrow();

                expect(function () {
                    tj.subscribe('PASS3', Number, function () {});
                }).not.toThrow();

                expect(function () {
                    tj.subscribe('PASS4', Boolean, function () {});
                }).not.toThrow();
                
                expect(function () {
                    tj.subscribe('PASS5', String, function () {});
                }).not.toThrow();
                
                expect(function () {
                    tj.subscribe('PASS6', Function, function () {});
                }).not.toThrow();
                
                expect(function () {
                    tj.subscribe('PASS7', Object, function () {});
                }).not.toThrow();
            });
            
            it('subscribe with multiple arguments of mixed types', function () {
                expect(function () {
                    tj.subscribe('PASS8', Array, Number, Boolean, String, Object, function () {});
                }).not.toThrow();
                
                expect(function () {
                    tj.subscribe('PASS9', HTMLElement, function () {});
                }).not.toThrow();
                
                expect(function () {
                    tj.subscribe('PASS10', HTMLElement, Foo, Foo, Array, Number, Object, Foo, function () {});
                }).not.toThrow();
                
                expect(function () {
                    tj.subscribe('PASS11', Foo, function () {});
                }).not.toThrow();
            });
        });
    });

    describe('tj.publish() tests', function () {
        it('publishing to an event with no subscribers should error', function () {
            expect(function () {
                tj.publish('BAD_PUBLISH', function () {});
            }).toThrow();
        });
    });

    describe('subscribe and publish tests', function () {
        describe('failing publish and subscribe tests', function () {
            it('error with conflicting signature lengths', function () {
                tj.subscribe('BADPUBSUB1', function () {});
                expect(function () {
                    tj.publish('BADPUBSUB1', 5);
                }).toThrow();

                tj.subscribe('BADPUBSUB6', Number, Number, Number, Number, function () {});
                expect(function () {
                    tj.publish('BADPUBSUB6', 1, 2, 3, 4, 5);
                }).toThrow();
            });

            it('error with conflicting signature types', function () {
                tj.subscribe('BADPUBSUB2', Number, function () {});
                expect(function () {
                    tj.publish('BADPUBSUB2', '5');
                }).toThrow();

                tj.subscribe('BADPUBSUB3', Object, function () {});
                expect(function () {
                    tj.publish('BADPUBSUB3', null);
                }).toThrow();

                tj.subscribe('BADPUBSUB4', Object, function () {});
                expect(function () {
                    tj.publish('BADPUBSUB4', undefined);
                }).toThrow();

                tj.subscribe('BADPUBSUB5', Number, Number, Number, function () {});
                expect(function () {
                    tj.publish('BADPUBSUB5', 5, null, 5);
                }).toThrow();
            });
        });

        it('passing publish subscribe tests (async)', function () {
            // most simple case
            /*runs(function () {
                this.success = false;
                tj.subscribe('SUCCESS1', function () {
                    this.success = true;
                });
                tj.publish('SUCCESS1');
            });

            waits(1);

            runs(function () {
                expect(this.success).toEqual(true);
            });*/

            // multiple subscribers

            // ensure data is being passed correctly

            // ensure events are async
        });
    });
}());


























