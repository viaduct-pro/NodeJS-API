// import { App, ExpressReceiver } from '@slack/bolt';
// import { AppMiddleware } from './app.middleware';
//
// const receiver = new ExpressReceiver({
//   signingSecret: process.env.SLACK_SIGNING_SECRET,
// });
//
// const app = new App({
//   receiver,
//   token: process.env.SLACK_ACCESS_TOKEN,
//   signingSecret: process.env.SLACK_SIGNING_SECRET,
// });
//
// receiver.app.use((req, res, next) => {
//   const nest = new AppMiddleware(app).use(req, res, next);
//   nest
//     .then(() => {
//       next();
//     })
//     .catch((err) => {
//       next();
//     });
// });
//
// app.start(8080);
// console.log('⚡️ Bolt app is running! on port ' + 8080);
