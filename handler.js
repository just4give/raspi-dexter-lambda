'use strict';
const request = require('request');
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
const rekognition = new AWS.Rekognition();

var config = {
  "awsRegion":"us-east-1",
  "s3Bucket":"raspi118528",
  "awsFaceCollection":"raspifacecollection"
}
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
                            var hour = new Date().getHours();
                            var content="";

                            if(hour >= 5 && hour<12){
                              content ="Good morning, "+ body.message+" !. Have a nice day!";
                            }else if(hour >=12 && hour <18){
                              content ="Good afternoon, "+ body.message+" !. Have a nice rest of the day!";
                            }else if(hour >=18 && hour < 21){
                              content ="Good evening, "+ body.message+" !. Talk to you soon!";
                            }else{
                              content ="Hi, "+ body.message+" !. It's been a long day! Good Night!";
                            }

                            callback(null,{
                                sessionAttributes: {key: body.key},
                                dialogAction: {
                                    type: 'Close',
                                    fulfillmentState:'Fulfilled',
                                    message:{
                                        contentType: 'PlainText',
                                        content: content
                                    }

                                },
                            })
                          }else if(body.status ==='error'){
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
                        "CollectionId": config.awsFaceCollection,
                        "DetectionAttributes": [ "ALL" ],
                        "ExternalImageId": name,
                        "Image": {
                          "S3Object": {
                             "Bucket": config.s3Bucket,
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

              case 'ClearAllFacesIntent':
                var params = {
                    "CollectionId": config.awsFaceCollection,
                    "MaxResults": 20
                }

                rekognition.listFaces(params, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                      else     {
                      console.log(data);
                      var faceIds=[];
                      data.Faces.forEach(function(face){
                        faceIds.push(face.FaceId);
                      })

                    if(faceIds.length>0){
                      var params = {
                      CollectionId: config.awsFaceCollection,
                      FaceIds: faceIds
                      };
                      rekognition.deleteFaces(params, function(err, data) {

                        if (err) {
                          callback(null,{
                              sessionAttributes: {key: key},
                              dialogAction: {
                                  type: 'Close',
                                  fulfillmentState:'Fulfilled',
                                  message:{
                                      contentType: 'PlainText',
                                      content: "Something went wrong! I could not delete faces!"
                                  }

                              },
                          })
                        }
                        else   {
                          callback(null,{
                              sessionAttributes: {key: key},
                              dialogAction: {
                                  type: 'Close',
                                  fulfillmentState:'Fulfilled',
                                  message:{
                                      contentType: 'PlainText',
                                      content: "I have deleted all the faces from memory!"
                                  }

                              },
                          })
                        }

                      });
                    }

                    }

                 });

                    break;
          default:

        }




    } catch (err) {
        callback(err);
    }
};
