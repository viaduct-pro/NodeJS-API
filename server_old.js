require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const { App } = require('@slack/bolt');
const axios = require('axios');

const moment = require('moment-timezone');

const fs = require('fs');
const FileType = require('file-type');
const FormData = require('form-data');

const path = require('path');

const ffmpeg = require('fluent-ffmpeg');

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../unify-storage/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //Appending extension
  },
});

var upload = multer({ storage: storage });

// Read the signing secret from the environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

// Initialize
const slackEvents = createEventAdapter(slackSigningSecret);

// Read the port from the environment variables, fallback to 3000 default.
const port = process.env.PORT || 3030;

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event) => {
  console.log(event);
  console.log(
    `Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`,
  );

  if (event.message == 'hello') {
  }
});

slackEvents.on('reaction_added', (event) => {
  console.log(`reaction_added`);
  console.log(event);

  const conversationId = process.env.CONVERSATION_ID;

  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);

  web.users.profile
    .get({
      user: event.user,
    })
    .then((response) => {
      web.chat.postMessage({
        channel: conversationId,
        text:
          'User ' +
          response.profile.real_name +
          ' reacted with reaction type: ' +
          event.reaction +
          ' (:' +
          event.reaction +
          ':)',
      });
    });

  // console.log(userData);
});

slackEvents.on('app_mention', async (event) => {
  console.log(event);
  const token = process.env.SLACK_ACCESS_TOKEN;
  const web = new WebClient(token);

  // This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
  const conversationId = process.env.CONVERSATION_ID;
  const message = web.chat.postMessage({
    channel: event.channel,
    link_names: true,
    text: `:tada: Received a app_mention event: user <@${event.user}> in channel <#${event.channel}> says ${event.text}`,
  });
  console.log(
    `Received a app_mention event: user @${event.user} in channel ${event.channel} says ${event.text}`,
  );
});

// All errors in listeners are caught here. If this weren't caught, the program would terminate.
slackEvents.on('error', (error) => {
  console.log(error); // TypeError
});

(async () => {
  // Start the built-in server
  const server = await slackEvents.start(port);

  // Log a message when the server is ready
  console.log(`Listening for events on ${server.address().port}`);
})();

const app = express();

app.use('/api/slack/events', slackEvents.requestListener());

var corsOptions = {
  origin: 'http://localhost:3001',
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Plug the adapter in as a middleware

app.post('/api/slack/test', function (request, response) {
  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);

  const conversationId = process.env.CONVERSATION_ID;

  const message = web.chat.postMessage({
    channel: conversationId,
    text: request.body.message,
  });

  return response.status(200).send({
    message: request.body.message,
  });
});

app.post('/api/slack/command', function (request, response) {
  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);

  const conversationId = process.env.CONVERSATION_ID;

  // const message = web.chat.postMessage({ channel: conversationId, text: 'Test command'});

  return response.status(200).send('Response for test command');
});

app.post('/api/slack/joke', async function (request, response) {
  var message = await axios
    .get('http://api.icndb.com/jokes/random/')
    .then((res) => {
      const token = process.env.SLACK_ACCESS_TOKEN;
      const web = new WebClient(token);
      const joke = res.data.value.joke;
      const conversationId = process.env.CONVERSATION_ID;

      const message = web.chat.postMessage({
        channel: conversationId,
        text: joke,
      });

      return joke;
    });
  return response.status(200).send(message);
});

//tell a chuck norris joke
function chuckJoke() {
  axios.get('http://api.icndb.com/jokes/random/').then((res) => {
    const joke = res.data.value.joke;

    return joke;
    // const params = {
    //     icon_emoji: ':laughing:'
    // };
    // bot.postMessageToChannel('general',
    //     `Chuck Norris: ${joke}`,
    //     params);
  });
}

app.post('/api/slack/testMenu', async function (request, response) {
  //console.log(request);

  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);

  const conversationId = process.env.CONVERSATION_ID;

  let d = new Date();

  let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
  let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);

  let date_string = `${ye}-${mo}-${da}`;

  const message = web.chat.postMessage({
    channel: conversationId,
    text: 'a text fallback for the menu test',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'This is an example menu',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Just a section block with a datepicker, e.g. select an appropriate date for a reminder',
        },
        accessory: {
          type: 'datepicker',
          initial_date: date_string,
          placeholder: {
            type: 'plain_text',
            text: 'Select a date',
            emoji: true,
          },
          action_id: 'datepicker-action',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'A example section with an action-related button',
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Execute action',
            emoji: true,
          },
          value: 'click_me_123',
          action_id: 'button-action',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: "Another section, this time with a link-button, it will open Google's website.",
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Open Google',
            emoji: true,
          },
          value: 'click_me_123',
          url: 'https://google.com',
          action_id: 'button-action',
        },
      },
    ],
  });

  return response.status(200).send(message);
});

app.post('/api/slack/createChanelMenu', async function (request, response) {
  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);

  const conversationId = process.env.CONVERSATION_ID;

  const message = web.chat.postMessage({
    channel: conversationId,
    text: 'a text fallback for the menu test',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Test menu to creating channel for selected users',
        },
      },
      {
        type: 'input',
        element: {
          type: 'plain_text_input',
          action_id: 'plain_text_input-action',
          placeholder: {
            type: 'plain_text',
            text: 'Write here new channel name',
            emoji: true,
          },
        },
        label: {
          type: 'plain_text',
          text: 'Enter new chanel name',
          emoji: true,
        },
      },
      {
        type: 'input',
        element: {
          type: 'multi_users_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select users',
            emoji: true,
          },
          action_id: 'multi_users_select-action',
        },
        label: {
          type: 'plain_text',
          text: 'Choose the users for new channel',
          emoji: true,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Create',
              emoji: true,
            },
            value: 'click_me_123',
            action_id: 'create-channel',
          },
        ],
      },
    ],
  });

  return response.status(200).send(message);
});

app.post('/api/slack/createRemindMenu', async function (request, response) {
  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);

  const conversationId = process.env.CONVERSATION_ID;

  //
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;
  //

  const message = web.chat.postMessage({
    channel: conversationId,
    text: 'reminder',
    title: {
      type: 'plain_text',
      text: 'Reminder modal',
      emoji: true,
    },
    submit: {
      type: 'plain_text',
      text: 'Submit',
      emoji: true,
    },
    type: 'modal',
    close: {
      type: 'plain_text',
      text: 'Cancel',
      emoji: true,
    },
    blocks: [
      {
        type: 'input',
        element: {
          type: 'plain_text_input',
          action_id: 'plain_text_input-action',
        },
        label: {
          type: 'plain_text',
          text: 'What do you want to remind?',
          emoji: true,
        },
      },
      {
        type: 'input',
        element: {
          type: 'datepicker',
          initial_date: today,
          placeholder: {
            type: 'plain_text',
            text: 'Select a date',
            emoji: true,
          },
          action_id: 'datepicker-action',
        },
        label: {
          type: 'plain_text',
          text: 'Date',
          emoji: true,
        },
      },
      {
        type: 'input',
        element: {
          type: 'timepicker',
          initial_time: '16:50',
          placeholder: {
            type: 'plain_text',
            text: 'Select time',
            emoji: true,
          },
          action_id: 'timepicker-action',
        },
        label: {
          type: 'plain_text',
          text: 'Time',
          emoji: true,
        },
      },
      {
        type: 'input',
        element: {
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select a time zone',
            emoji: true,
          },
          initial_option: {
            text: {
              type: 'plain_text',
              text: 'America/Los Angeles',
              emoji: true,
            },
            value: 'America/Los_Angeles',
          },
          options: [
            {
              text: {
                type: 'plain_text',
                text: 'America/Los Angeles',
                emoji: true,
              },
              value: 'America/Los_Angeles',
            },
            {
              text: {
                type: 'plain_text',
                text: 'Europe/Kiev',
                emoji: true,
              },
              value: 'Europe/Kiev',
            },
          ],
          action_id: 'timezoneselect-action',
        },
        label: {
          type: 'plain_text',
          text: 'Time zone',
          emoji: true,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Create reminder',
              emoji: true,
            },
            value: 'remind',
            action_id: 'submit-reminder',
          },
        ],
      },
    ],
  });

  return response.status(200).send(message);
});

app.post('/api/slack/createScheduleMenu', async function (request, response) {
  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);

  const conversationId = process.env.CONVERSATION_ID;

  //
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;
  //

  const message = web.chat.postMessage({
    channel: conversationId,
    text: 'scheduller',
    blocks: [
      {
        type: 'input',
        element: {
          type: 'plain_text_input',
          action_id: 'plain_text_input-action',
        },
        label: {
          type: 'plain_text',
          text: 'What message do you want to schedule?',
          emoji: true,
        },
      },
      {
        type: 'input',
        element: {
          type: 'datepicker',
          initial_date: today,
          placeholder: {
            type: 'plain_text',
            text: 'Select a date',
            emoji: true,
          },
          action_id: 'datepicker-action',
        },
        label: {
          type: 'plain_text',
          text: 'Date',
          emoji: true,
        },
      },
      {
        type: 'input',
        element: {
          type: 'timepicker',
          initial_time: '16:00',
          placeholder: {
            type: 'plain_text',
            text: 'Select time',
            emoji: true,
          },
          action_id: 'timepicker-action',
        },
        label: {
          type: 'plain_text',
          text: 'Time',
          emoji: true,
        },
      },
      {
        type: 'input',
        element: {
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select a time zone',
            emoji: true,
          },
          initial_option: {
            text: {
              type: 'plain_text',
              text: 'America/Los Angeles',
              emoji: true,
            },
            value: 'America/Los_Angeles',
          },
          options: [
            {
              text: {
                type: 'plain_text',
                text: 'America/Los Angeles',
                emoji: true,
              },
              value: 'America/Los_Angeles',
            },
            {
              text: {
                type: 'plain_text',
                text: 'Europe/Kiev',
                emoji: true,
              },
              value: 'Europe/Kiev',
            },
          ],
          action_id: 'timezoneselect-action',
        },
        label: {
          type: 'plain_text',
          text: 'Time zone',
          emoji: true,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Schedule new message',
              emoji: true,
            },
            value: 'click_me_123',
            action_id: 'submit-scheduller',
          },
        ],
      },
    ],
  });

  return response.status(200).send(message);
});

app.post('/api/slack/sendAudio', async function (request, response) {
  let timeInMs = Date.now();

  let decoded_value = Buffer.from(request.body.blob, 'base64');

  //let fileType = FileType.fromBuffer(decoded_value);

  (async () => {
    const fileType = await FileType.fromBuffer(decoded_value);

    const extension = fileType.ext;

    const fileName = timeInMs + '.' + extension;

    await fs.writeFile(
      '../unify-storage/' + fileName,
      decoded_value,
      function (err) {
        console.log(err);
      },
    );

    // let form = new FormData();

    ffmpeg('../unify-storage/' + fileName)
      .audioCodec('libmp3lame')
      .output('../unify-storage/converted/' + timeInMs + '.mp3')
      .on('end', function () {
        let kek = fs.createReadStream(
          '../unify-storage/converted/' + timeInMs + '.mp3',
        );

        const token = process.env.SLACK_ACCESS_TOKEN;

        const web = new WebClient(token);

        const conversationId = process.env.CONVERSATION_ID;

        const message = web.files.upload({
          channels: conversationId,
          filename: timeInMs + '.mp3',
          file: kek,
        });
      })
      .run();

    return response.status(200).send('kek');
  })();
});

app.post(
  '/api/slack/sendAudioNoEncode',
  upload.single('filekek'),
  async function (request, response) {
    let fileName = request.body.filename;

    let nameWithoutExtension = path.parse(fileName).name;

    ffmpeg('../unify-storage/' + request.body.filename)
      .audioCodec('libmp3lame')
      .output('../unify-storage/converted/' + nameWithoutExtension + '.mp3')
      .on('end', function () {
        let kek = fs.createReadStream(
          '../unify-storage/converted/' + nameWithoutExtension + '.mp3',
        );

        const token = process.env.SLACK_ACCESS_TOKEN;

        const web = new WebClient(token);

        const conversationId = process.env.CONVERSATION_ID;

        const message = web.files.upload({
          channels: conversationId,
          filename: nameWithoutExtension + '.mp3',
          title: 'A voice message',
          file: kek,
        });
      })
      .run();
  },
);

app.get('/api/callback', async function (req, res, next) {
  console.log(req.query);

  const token = process.env.SLACK_ACCESS_TOKEN;

  const clientId = process.env.SLACK_CLIENT_ID;

  const clientSecret = process.env.SLACK_SIGNING_SECRET;

  const web = new WebClient(token);
});

app.post('/api/slack/interactive-endpoint', async function (request, response) {
  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);

  const payload = JSON.parse(request.body.payload);

  const response_url = payload.response_url;

  console.log(payload);

  // console.log(payload.state);
  //
  // console.log(payload.actions);

  const action_from_button = payload?.actions.find(
    (action) => action.action_id == 'button-action',
  );

  if (typeof action_from_button !== 'undefined') {
    const datepicker_block = payload.message.blocks.find(
      (block) =>
        block.hasOwnProperty('accessory') &&
        block.accessory.hasOwnProperty('action_id') &&
        block.accessory.action_id == 'datepicker-action',
    );

    const datepicker_value =
      payload.state.values[datepicker_block.block_id]['datepicker-action']
        .selected_date;

    axios.post(response_url, {
      text:
        'some response text for action, which was sent from the button and processed by the back-end server, the selected date was ' +
        datepicker_value,
    });
  }

  const userMessageAction = payload?.actions.find(
    (action) => action.action_id == 'user-sendmessage',
  );

  if (typeof userMessageAction !== 'undefined') {
    const eventUser = payload.user.name;

    const userListSelectBlock = payload.message.blocks.find(
      (block) =>
        block.hasOwnProperty('accessory') &&
        block.accessory.hasOwnProperty('action_id') &&
        block.accessory.action_id == 'user_select-action',
    );

    const userSelectValue =
      payload.state.values[userListSelectBlock.block_id]['user_select-action']
        .selected_option.value;

    const userSelectText =
      payload.state.values[userListSelectBlock.block_id]['user_select-action']
        .selected_option.text.text;

    const userChannelId = await web.conversations.open({
      users: userSelectValue,
    });

    const userMessage = await web.chat.postMessage({
      channel: userChannelId.channel.id,
      text: 'some stock text message, sent by ' + eventUser,
    });

    axios.post(response_url, {
      text:
        'an event acknowledgement text, user ' +
        eventUser +
        ' triggered a direct message to ' +
        userSelectText,
    });
  }

  const userMessageCancelAction = payload?.actions.find(
    (action) => action.action_id == 'user-cancelmessage',
  );

  if (typeof userMessageCancelAction !== 'undefined') {
    axios.post(response_url, {
      text: 'event sending cancelled',
    });
  }

  const userMessageCreateChannel = payload?.actions.find(
    (action) => action.action_id == 'create-channel',
  );

  if (typeof userMessageCreateChannel !== 'undefined') {
    userCreateChanell(payload);
  }

  const userReminder = payload?.actions.find(
    (action) => action.action_id == 'submit-reminder',
  );

  if (typeof userReminder !== 'undefined') {
    const eventUser = payload.user;

    userCreateReminder(payload, eventUser);
  }

  const userScheduller = payload?.actions.find(
    (action) => action.action_id == 'submit-scheduller',
  );

  if (typeof userScheduller !== 'undefined') {
    userCreateScheduller(payload);
  }

  if (
    typeof payload.callback_id !== 'undefined' &&
    payload.callback_id == 'hello_modal'
  ) {
    callbackModal(payload);
  }

  return response.status(200).send('OK');
});

async function callbackModal(payload) {
  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);
  const conversationId = process.env.CONVERSATION_ID;

  const result = await web.views.open({
    trigger_id: payload.trigger_id,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'My App',
        emoji: true,
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
        emoji: true,
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
        emoji: true,
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Test menu to creating channel for selected users',
          },
        },
        {
          type: 'input',
          element: {
            type: 'plain_text_input',
            action_id: 'plain_text_input-action',
            placeholder: {
              type: 'plain_text',
              text: 'Write here new channel name',
              emoji: true,
            },
          },
          label: {
            type: 'plain_text',
            text: 'Enter new chanel name',
            emoji: true,
          },
        },
        {
          type: 'input',
          element: {
            type: 'multi_users_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select users',
              emoji: true,
            },
            action_id: 'multi_users_select-action',
          },
          label: {
            type: 'plain_text',
            text: 'Choose the users for new channel',
            emoji: true,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Join',
                emoji: true,
              },
              value: 'click_me_123',
              action_id: 'create-channel',
            },
          ],
        },
      ],
    },
  });
}

async function userCreateScheduller(payload) {
  // const token = process.env.SLACK_USER_ACCESS_TOKEN;

  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);
  const conversationId = process.env.CONVERSATION_ID;

  const schedullerTextBlock = payload.message.blocks.find(
    (block) =>
      block.hasOwnProperty('element') &&
      block.element.hasOwnProperty('action_id') &&
      block.element.action_id == 'plain_text_input-action',
  );

  const schedullerText =
    payload.state.values[schedullerTextBlock.block_id][
      'plain_text_input-action'
    ].value;

  const schedullerDateBlock = payload.message.blocks.find(
    (block) =>
      block.hasOwnProperty('element') &&
      block.element.hasOwnProperty('action_id') &&
      block.element.action_id == 'datepicker-action',
  );

  const schedullerDate =
    payload.state.values[schedullerDateBlock.block_id]['datepicker-action']
      .selected_date;

  const schedullerTimeBlock = payload.message.blocks.find(
    (block) =>
      block.hasOwnProperty('element') &&
      block.element.hasOwnProperty('action_id') &&
      block.element.action_id == 'timepicker-action',
  );

  const schedullerTime =
    payload.state.values[schedullerTimeBlock.block_id]['timepicker-action']
      .selected_time;

  const schedullerTimeZoneBlock = payload.message.blocks.find(
    (block) =>
      block.hasOwnProperty('element') &&
      block.element.hasOwnProperty('action_id') &&
      block.element.action_id == 'timezoneselect-action',
  );

  const schedullerTimeZone =
    payload.state.values[schedullerTimeZoneBlock.block_id][
      'timezoneselect-action'
    ].selected_option.value;

  let timestamp = Date.parse(schedullerDate + ' ' + schedullerTime + ':00');

  let timestamp_timezone = moment
    .tz(schedullerDate + ' ' + schedullerTime, schedullerTimeZone)
    .unix();

  console.log(timestamp_timezone);
  console.log(timestamp);

  const result = await web.chat.scheduleMessage({
    channel: conversationId,
    text: schedullerText,
    // Time to post message, in Unix Epoch timestamp format
    post_at: timestamp_timezone,
  });
  const eventUser = payload.user.name;

  const message = await web.chat.postMessage({
    channel: conversationId,
    text: 'User <@' + eventUser + '> create scheduled message.',
  });

  console.log(result);

  return result;
}

async function userCreateReminder(payload, eventUser) {
  const token = process.env.SLACK_USER_ACCESS_TOKEN;

  console.log('eventUser');
  console.log(eventUser);

  const web = new WebClient(token);

  const conversationId = process.env.CONVERSATION_ID;

  const reminderTextBlock = payload.message.blocks.find(
    (block) =>
      block.hasOwnProperty('element') &&
      block.element.hasOwnProperty('action_id') &&
      block.element.action_id == 'plain_text_input-action',
  );

  const reminderText =
    payload.state.values[reminderTextBlock.block_id]['plain_text_input-action']
      .value;

  const reminderDateBlock = payload.message.blocks.find(
    (block) =>
      block.hasOwnProperty('element') &&
      block.element.hasOwnProperty('action_id') &&
      block.element.action_id == 'datepicker-action',
  );

  const reminderDate =
    payload.state.values[reminderDateBlock.block_id]['datepicker-action']
      .selected_date;

  const reminderTimeBlock = payload.message.blocks.find(
    (block) =>
      block.hasOwnProperty('element') &&
      block.element.hasOwnProperty('action_id') &&
      block.element.action_id == 'timepicker-action',
  );

  const reminderTime =
    payload.state.values[reminderTimeBlock.block_id]['timepicker-action']
      .selected_time;

  const reminderTimeZoneBlock = payload.message.blocks.find(
    (block) =>
      block.hasOwnProperty('element') &&
      block.element.hasOwnProperty('action_id') &&
      block.element.action_id == 'timezoneselect-action',
  );

  const reminderTimeZone =
    payload.state.values[reminderTimeZoneBlock.block_id][
      'timezoneselect-action'
    ].selected_option.value;

  console.log(reminderText);
  console.log(reminderDate);
  console.log(reminderTime);

  let timestamp_timezone = moment
    .tz(reminderDate + ' ' + reminderTime, reminderTimeZone)
    .unix();

  console.log(Date.parse(reminderDate + ' ' + reminderTime + ':00'));

  let timestamp = Date.parse(reminderDate + ' ' + reminderTime + ':00');

  var fixedTimestamp = timestamp.toString().slice(0, -3);

  let reminder = await web.reminders.add({
    text: reminderText,
    time: timestamp_timezone,
    user: eventUser.id,
  });
  console.log(reminder);

  const message = await web.chat.postMessage({
    channel: conversationId,
    text:
      'User <@' +
      eventUser.name +
      '> create reminder. You can check you remind list with the command - /remind list',
  });
}

async function userCreateChanell(payload) {
  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);

  const userSelectedBlock = payload.message.blocks.find(
    (block) =>
      block.hasOwnProperty('element') &&
      block.element.hasOwnProperty('action_id') &&
      block.element.action_id == 'multi_users_select-action',
  );

  const usersSelected =
    payload.state.values[userSelectedBlock.block_id][
      'multi_users_select-action'
    ].selected_users;

  const chanelNameBlock = payload.message.blocks.find(
    (block) =>
      block.hasOwnProperty('element') &&
      block.element.hasOwnProperty('action_id') &&
      block.element.action_id == 'plain_text_input-action',
  );

  const chanelName =
    payload.state.values[chanelNameBlock.block_id]['plain_text_input-action']
      .value;

  let channel = await web.conversations.create({
    name: chanelName,
    users: usersSelected,
  });

  let channelId = channel.channel.id;

  let inviteToChanel = await web.conversations.invite({
    channel: channelId,
    users: usersSelected.join(', '),
  });

  return inviteToChanel;
}

app.post('/api/slack/testUserMessage', async function (request, response) {
  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);

  const conversationId = process.env.CONVERSATION_ID;

  /* get the full list of users */
  const usersList = await web.users.list();

  /* get the user list into an appropriate form for the select menu */
  /* also remove all of the bot type users */
  const usersListProcessed = usersList.members
    .filter((userItem) => userItem.is_bot == false)
    .map((userItem) => {
      return {
        text: {
          type: 'plain_text',
          text: userItem.name,
          emoji: true,
        },
        value: userItem.id,
      };
    });

  /* send the menu message */
  const message = web.chat.postMessage({
    channel: conversationId,
    text: 'a text fallback for the menu test',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Please choose the user, who will receive the message',
        },
        accessory: {
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select a user',
            emoji: true,
          },
          options: usersListProcessed,
          action_id: 'user_select-action',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Send message',
              emoji: true,
            },
            value: 'user-sendmessage-value',
            action_id: 'user-sendmessage',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Cancel',
              emoji: true,
            },
            value: 'user-sendmessage-cancel',
            action_id: 'user-cancelmessage',
          },
        ],
      },
    ],
  });

  return response.status(200).send('OK');
});

app.post('/api/slack/test_get_users', async function (request, response) {
  const token = process.env.SLACK_ACCESS_TOKEN;

  const web = new WebClient(token);

  const conversationId = process.env.CONVERSATION_ID;

  let message = await web.users.list();

  //console.log(token);

  //console.log(web);

  console.log(message);

  return response.status(200).send('OK');
});

app.post(
  '/api/slack/test_personal_message',
  async function (request, response) {
    const token = process.env.SLACK_ACCESS_TOKEN;

    const web = new WebClient(token);

    const conversationId = process.env.CONVERSATION_ID;

    let message = await web.conversations.open({
      users: 'U025U6X0GQ0',
    });

    const message1 = await web.chat.postMessage({
      channel: message.channel.id,
      text: 'some stock text message',
    });

    //console.log(token);

    //console.log(web);

    console.log(message1);

    return response.status(200).send('OK');
  },
);

// set port, listen for requests
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.get('/', (req, res) => {
  res.json({ message: 'Launching the application' });
});
