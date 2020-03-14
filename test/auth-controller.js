const mocha = require('mocha');
const expect = require('chai').expect;
const sinon = require('sinon');
const User = require('../models/user');
const Mongoose = require('mongoose');

const AuthController = require('../controllers/auth');

describe('Auth controller -- Login', function () {
  let testUserId;
  before(function (done) {
    testUserId = Mongoose.Types.ObjectId();
    Mongoose
      .connect(
        'mongodb+srv://anthony:T00lb0x96@cluster0-w9nbv.mongodb.net/test_db'
      )
      .then(result => {
        const user = new User({
          _id: testUserId,
          email: 'test@dev.com',
          password: 'test',
          name: 'Test',
          posts: []
        });
        return user.save();
      })
      .then(() => done())
      .catch(console.log);
  });

  it('should throw an error if accessing the database fails', function (done) {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@dev.com',
        password: 'password'
      }
    }

    AuthController.login(req, {}, () => { })
      .then(result => {
        expect(result).to.be.an('error');
        expect(result).to.have.property('statusCode', 500);
        done();
      });

    User.findOne.restore();
  });

  it('should send a response with a valid user status for an existing user', function (done) {
    const req = { userId: testUserId };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      }
    };

    AuthController.getUserStatus(req, res, () => { }).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal('I am new!');
      done();
    });
  });

  after(function (done) {
    User.deleteMany({})
      .then(() => {
        return Mongoose.disconnect();
      })
      .then(() => done())
      .catch(console.log);
  });
});
