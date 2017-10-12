process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');
const https = require('https');
const http = require('http');
const rp = require('request-promise');


// [START YourAction]
exports.nutritionFacts = functions.https.onRequest((request, response) => {
    const app = new App({request, response});
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));

// Fulfill action business logic
    function getNutritionValues(app) {
        const req = require('request');

        let host = 'api.edamam.com';

        let path = '/api/food-database/parser?app_id=1f42d8bb&app_key=8ca5e6822e9abfd927289b214749ae7d&ingr=milk';

        console.log('API Request: ' + host + path);

        let {body: {result: {parameters: {food,quantity,unit}}}} = request;
        if (food) {
            rp('https://api.edamam.com/api/food-database/parser?app_id=1f42d8bb&app_key=8ca5e6822e9abfd927289b214749ae7d&ingr=' + food)
                .then(function (response) {
                    response = JSON.parse(response);
                    console.log('response promise body is', response);
                    let hints = response['hints'];
                    if (hints && hints.length > 0) {
                        let {food: {uri}} = hints[0];
                        return uri;
                    }
                })
                .then(function (uri) {
                    if (uri) {
                        let options = {
                            method: 'POST',
                            uri: 'https://api.edamam.com/api/food-database/nutrients?app_id=1f42d8bb&app_key=8ca5e6822e9abfd927289b214749ae7d',
                            body: {
                                ingredients: [
                                    {
                                        quantity: quantity || 1,
                                        measureURI: 'http://www.edamam.com/ontologies/edamam.owl#Measure_' + unit || 'pound',
                                        foodURI: uri

                                    }
                                ]
                            },
                            json: true
                        };
                        console.log('options', options);
                        console.log('options body', options.body.ingredients);
                        rp(options)
                            .then(function (response) {
                                const nutrients = response['totalNutrients'];
                                const nutrients_labels = Object.keys(nutrients);

                                if (nutrients && nutrients_labels.length > 0) {
                                    let message = '';
                                    nutrients_labels.forEach(function(label) {
                                        message += nutrients[label]['label'] + ' ' + nutrients[label]['quantity'].toFixed(2) + nutrients[label]['unit'] + '\n';
                                    });
                                    console.log('message', message);
                                    app.ask(app.buildRichResponse()
                                        .addSimpleResponse(message));

                                } else {
                                    app.ask('sorry could not find, your search should be like one unit of egg or two liters of milk, etc');
                                }
                            })
                            .catch(function (error) {
                                console.log('nutrition values error', error);
                                app.ask(error);
                            });
                    } else {
                        app.ask('sorry could not find. please try by another food item');
                    }
                })
                .catch(function (error) {
                    console.log('error', error);
                    app.ask(error);
                });
        }
    }

    const actionMap = new Map();
    actionMap.set('input.food', getNutritionValues);

    app.handleRequest(actionMap);
});