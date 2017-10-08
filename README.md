# nutritionFactsChatBotServer
Nodejs application with integrated google actions which can give you nutrition table for any given food.
The application uses https://developer.edamam.com/ api to fetch the nutrition facts.
This application is deployed to google cloud functions.
This can be used by any chat bot, api ai is integrated to (examples: google assistant, facebook messenger, slack, twitter, etc)

There is an api ai agent for which this application (webhook) is hooked to. It maintains a map of actions to corresponding 
handlers. It will listen to http requests sent by the agent and in turn process the action's handler to which this request is mapped to.
