const Alexa = require('ask-sdk-core');
const handlers = require('./handlers.js');

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('うまく聞き取れませんでした。')
      .reprompt('もういちどお願いします。')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    handlers.LaunchRequestHandler,
    handlers.HelpIntentHandler,
    handlers.CancelAndStopIntentHandler,
    handlers.SessionEndedRequestHandler,
    handlers.ReserveRoomIntentHandler,
    handlers.ConfirmReservationIntentHandler,
    handlers.CanselReservationIntentHandler,
    handlers.ReadingSemiLogIntentHandler,
    handlers.ReadingSemiLogIntentHandlerWithKeyword
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
