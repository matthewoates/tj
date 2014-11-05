if (typeof require !== 'undefined') {
    // node.js
    global.expect = require('expect.js');
    global.tj = require('./tj');
}

describe('sanity check', function () {
    it('tj should be defined', function () {
        expect(tj).to.be.ok();
    });
});
