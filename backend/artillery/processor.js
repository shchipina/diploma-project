module.exports = {
  randomString: function (context, events, done) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    context.vars.randomString = result;
    return done();
  },

  randomNumber: function (context, events, done) {
    const min = context.vars.min || 1;
    const max = context.vars.max || 10000;
    context.vars.randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return done();
  },

  logMetrics: function (context, events, done) {
    console.log(`
[Artillery Metrics]
  Virtual Users: ${context._uid}
  Requests Completed: ${events.length}
    `);
    return done();
  },


  setTimestampHeader: function (requestParams, context, ee, next) {
    requestParams.headers = requestParams.headers || {};
    requestParams.headers['X-Request-Timestamp'] = Date.now().toString();
    return next();
  }
};
