module.exports.LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const ReserverExecSync = require('child_process').execSync;

    const stdout = ReserverExecSync('node .\\reserver.js');
    console.log(stdout);

    return handlerInput.responseBuilder
      .speak('6-502の予約を行いますか。それとも予約状況の確認を行いますか。')
      .reprompt('stdout')
      .getResponse();
  },
};

module.exports.HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'このスキルでは6-502の予約，および予約状況の確認を行うことができます。';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

module.exports.CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'しょんぼり。';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

module.exports.SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

module.exports.ReserveRoomIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ReserveRoomIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('6-502の予約を行います。時刻を指定してください。')
  }
}

module.exports.ConfirmReservationIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ConfirmReservationIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('6-502の予約状況を確認します。時刻を指定してください。')
  }
}
