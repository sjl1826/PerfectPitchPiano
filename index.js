'use strict';

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'SSML',
		ssml: output,
		},
	    card: {
            type: 'Simple',
		title: `SessionSpeechlet - ${title}`,
		content: `SessionSpeechlet - ${output}`,
		},
	    reprompt: {
            outputSpeech: {
                type: 'PlainText',
		    text: repromptText,
		    },
		},
	    shouldEndSession,
		};
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
	    sessionAttributes,
	    response: speechletResponse,
	    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = "<speak>Welcome to Perfect Pitch Piano Please request to hear a key simply by saying Play Key Name</speak>";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'Please retry and say for example, ' +
        'play A';
    const shouldEndSession = false;
    callback(sessionAttributes,
	     buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for using Perfect Pitch Piano. Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;
    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function playKey(callback, pianoNote) {
    var ssmlResponse = "<speak> <audio src='https://s3.amazonaws.com/notes-piano/A.mp3'/> </speak>";
    if (pianoNote == 'a sharp') {
        ssmlResponse = "<speak> <audio src='https://s3.amazonaws.com/notes-piano/A#.mp3'/> </speak>";
    } else if (pianoNote == 'b') {
        ssmlResponse = "<speak> <audio src='https://s3.amazonaws.com/notes-piano/B.mp3'/> </speak>";
    } else if (pianoNote == 'c') {
        ssmlResponse = "<speak> <audio src='https://s3.amazonaws.com/notes-piano/C.mp3'/> </speak>";
    } else if (pianoNote == 'c sharp') {
        ssmlResponse = "<speak> <audio src='https://s3.amazonaws.com/notes-piano/C#.mp3'/> </speak>";
    } else if (pianoNote == 'd') {
        ssmlResponse = "<speak> <audio src='https://s3.amazonaws.com/notes-piano/D.mp3'/> </speak>";
    } else if (pianoNote == 'd sharp') {
        ssmlResponse = "<speak> <audio src='https://s3.amazonaws.com/notes-piano/D#.mp3'/> </speak>";
    } else if (pianoNote == 'e') {
        ssmlResponse = "<speak> <audio src='https://s3.amazonaws.com/notes-piano/E.mp3'/> </speak>";
    } else if (pianoNote == 'f') {
        ssmlResponse = "<speak> <audio src='https://s3.amazonaws.com/notes-piano/F.mp3'/> </speak>";
    } else if (pianoNote == 'f sharp') {
        ssmlResponse = "<speak> <audio src='https://s3.amazonaws.com/notes-piano/F#.mp3'/> </speak>";
    } else if (pianoNote == 'g') {
        ssmlResponse = "<speak> <audio src='https://s3.amazonaws.com/notes-piano/G.mp3'/> </speak>";
    }
    callback({}, buildSpeechletResponse('Session Ended', ssmlResponse, null, false));
}


// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'PlaySoundIntent') {
        playKey(callback, intent.slots.type.value)
	    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);
        if (event.session.application.applicationId !== 'amzn1.ask.skill.59db0a43-5120-4f84-9476-85516d3b89e6') {
	    callback('Invalid Application ID');
        }

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
		     event.session,
		     (sessionAttributes, speechletResponse) => {
			 callback(null, buildResponse(sessionAttributes, speechletResponse));
		     });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
		     event.session,
		     (sessionAttributes, speechletResponse) => {
			 callback(null, buildResponse(sessionAttributes, speechletResponse));
		     });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
