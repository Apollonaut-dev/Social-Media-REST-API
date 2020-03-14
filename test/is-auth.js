const expect = require('chai').expect;
const isAuth = require('../middleware/is-auth');
const JWT = require('jsonwebtoken');
const sinon = require('sinon');

describe('Auth middleware', function() {
  it('should throw an error if no Authorization header is present', function() {
    const req = {
      get: function(authStr) {
        return null;
      }
    };
    expect(isAuth.bind(this, req, {}, () => {})).to.throw('Not authenticated.');
  });

  it('should throw an error if the authorization header is only one string', function() {
    const req = {
      get: function(authStr) {
        return 'xyz';
      }
    };
  
    expect(isAuth.bind(this, req, {}, () => {})).to.throw();
  });

  it('should throw an error if the token cannot be verified', function() {
    const req = {
      get: function(authStr) {
        return 'Bearer xyz';
      }
    };
    expect(isAuth.bind(this, req, {}, () => {})).to.throw();
  });


  it('should yield a userId after decoding the token', function () {
    const req = {
      get: function (authStr) {
        return 'Bearer xyz';
      }
    };
    sinon.stub(JWT, 'verify');
    JWT.verify.returns({ userId: 'xyz' });

    isAuth(req, {}, () => { });
    expect(JWT.verify.called).to.be.true;
    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'xyz');
    JWT.verify.restore();
  });
});
