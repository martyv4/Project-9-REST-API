const expect = require ('chai').expect;
//var chai = require('chai');
//var expect = chai.expect;



/* //gives the AssertionError
expect(true).to.be.false; */


/* //titleCase is not defined
expect(titleCase('the great mouse detective')).to.be.a('string'); */

/* no error
function titleCase(title) {
    return title;
}
expect(titleCase('the great mouse detective')).to.be.a('string'); */

//AssertionError: expected undefined to be a string
expect(true).to.be.true;

function titleCase() {
}
expect(titleCase('the great mouse detective')).to.be.a('string');
