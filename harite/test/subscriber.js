var Subscriber = require('../lib/subscriber');

var should = require('should'),
  events = require('events'),
  util = require('util');

function MockRequest() {
};
util.inherits(MockRequest, events.EventEmitter);

describe ('Subscriber', function () {

  describe ('handleRequest()', function () {
    it ('should parse SNS message and emit message event', function (done) {
      var subscriber = new Subscriber();
      should.exist(subscriber.client);

      var req = new MockRequest();
      var res = { end: function () {} };

      subscriber.handleRequest(req, res);

      var data = {
        "Type" : "Notification",
        "MessageId" : "0612bdf2-92b6-467c-b82e-55d64d1c7b3c",
        "TopicArn" : "arn:aws:sns:ap-northeast-1:505212892390:sns_test",
        "Message" : "{\"key\":\"appId:channel:event\",\"message\":\"test1\"}",
        "Timestamp" : "2012-08-04T08:12:38.023Z",
        "SignatureVersion" : "1",
        "Signature" : "g5/CLdAnKFMbADD0GT6VYenZiQQfuWwG38whXMSR++6aJX6gUBr25y5r894Cd8oMRZ0JQ05tn/KJWsonZsL1OmVFSQAd9uVR34MtXWvklGgL6QCdBXkGhjgPhxNkw/wguD4jDbsFVoPyiTGDXRURo+4zgyEhIWFnoyA6xEQXB4c=",    SigningCertURL: 'https://sns.ap-northeast-1.amazonaws.com/SimpleNotificationService-f3ecfb7224c7233fe7bb5f59f96de52f.pem',
        "SigningCertURL" : "https://sns.ap-northeast-1.amazonaws.com/SimpleNotificationService-f3ecfb7224c7233fe7bb5f59f96de52f.pem",
        "UnsubscribeURL" : "https://sns.ap-northeast-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:ap-northeast-1:505212892390:sns_test:e2e8760e-440a-4c55-95cb-bafeab286817"
      };

      req.emit('data', JSON.stringify(data));
      req.emit('end');

      subscriber.on('message', function (key, message) {
        done();
      });
    })

    it ('should ignore invalid message', function (done) {
      var subscriber = new Subscriber();
      should.exist(subscriber.client);

      var req = new MockRequest();
      var res = { end: function () { setTimeout(done, 500); } };

      subscriber.handleRequest(req, res);

      req.emit('data', 'invalid data');
      req.emit('end');

      subscriber.on('message', function (key, message) {
        done(new Error('Never call this'));
      });
    })
  })

});