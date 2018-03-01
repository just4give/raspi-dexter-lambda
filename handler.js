'use strict';
const request = require('request');
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
const rekognition = new AWS.Rekognition();

module.exports.bot = (event, context, callback) => {
  try {
        // By default, treat the user request as coming from the America/New_York time zone.

        var intentName= event.currentIntent.name;
        console.log('intentName',intentName);

        switch (intentName) {
          case 'HelloIntent':
                  request(
                    {
                      url : process.env.URL_CAPTURE,
                      method:'POST',
                      headers : {
                      "Authorization" : "Basic " + new Buffer( "raspi:secret").toString("base64")
                    }
                    },
                    function (error, response, body) {

                        if(error){
                          callback(error);
                        }else{
                          body = JSON.parse(body);
                          console.log('body',body);

                          if(body.status ==='matched' || body.status ==='error'){
                            callback(null,{
                                sessionAttributes: {key: body.key},
                                dialogAction: {
                                    type: 'Close',
                                    fulfillmentState:'Fulfilled',
                                    message:{
                                        contentType: 'PlainText',
                                        content: body.message
                                    }

                                },
                            })
                          }else{
                            callback(null,{
                                sessionAttributes: {key: body.key},
                                dialogAction: {
                                    type: 'ElicitIntent',
                                    //fulfillmentState:'Fulfilled',
                                    message:{
                                        contentType: 'PlainText',
                                        content: body.message
                                    }

                                },
                            })
                          }


                        }
                    }
                  );

              break;

          case 'NameIntent':
                    var name = event.currentIntent.slots.name;
                    var key = event.sessionAttributes.key;
                    var params = {
                        "CollectionId": "raspifacecollection",
                        "DetectionAttributes": [ "ALL" ],
                        "ExternalImageId": name,
                        "Image": {
                          "S3Object": {
                             "Bucket": "raspi118528",
                             "Name": key
                          }
                        }
                      }

                    rekognition.indexFaces(params, function(err, data) {
                        if (err) {
                          console.log(err, err.stack);
                        }else{
                          console.log(data);           // successful response
                          callback(null,{
                              sessionAttributes: {key: key},
                              dialogAction: {
                                  type: 'Close',
                                  fulfillmentState:'Fulfilled',
                                  message:{
                                      contentType: 'PlainText',
                                      content: "I stored your picture "+name+" . Have a nice day!"
                                  }

                              },
                          })
                        }

                    });

              break;
          default:

        }




    } catch (err) {
        callback(err);
    }
};
