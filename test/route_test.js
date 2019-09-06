var expect = require('chai').expect;

describe('check_userRoute', 

function () {
    var check_userRoute = require('../routes/routes').check_userRoute;

        users = {
            user: [
                {
                    locations: [[0, 0]]
                }
            ]
        };
    it('should connect to api/users for single user', function() {
        expect(checkForUserRoute(user, [9,9])).to.be.false;
    });
});