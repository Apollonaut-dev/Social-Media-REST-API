const mocha = require('mocha');
const expect = require('chai').expect;
const sinon = require('sinon');
const User = require('../models/user');
const Post = require('../models/post');
const Mongoose = require('mongoose');

const FeedController = require('../controllers/feed');

describe('Feed controller', function () {
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
      .then(user => {
        testUser = user;
        done();
      })
      .catch(console.log);
  });

  it('should create a post and add it to the Users post array', function (done) {
    const req = {
      file: { path: '/test/path' },
      body: {
        email: 'test@dev.com',
        title: 'test post',
        content: 'test content',
      },
      userId: testUserId
    }
    const res = {
      status: function (code) {
        return this;
      },
      json: function (data) { }
    };

    FeedController.createPost(req, res, () => { })
      .then(() => {
        return User.findById(testUserId);
      })
      .then(testUser => {
        expect(testUser).to.have.property('posts');
        expect(testUser.posts).to.have.length(1);
        done();
      })
      .catch(console.log);
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
