# raspi-dexter-lambda

This project was genearted using serverless framework. Visit https://serverless.com for details about how to install and use serverless framework.

The lambda function is responsible for full filling Lex Bot ( Tintin ) . Watch the demo video below.

[![Alt text for your video](https://img.youtube.com/vi/OO2m5dOIiR4/0.jpg)](http://www.youtube.com/watch?v=OO2m5dOIiR4)


Once you have serverless installed and AWS cli is configured on your computure , clone this repo and cd into the folder raspi-dexter-lambda. Then simply execute deploy command.

```
serverless deploy
```

![alt tag](https://user-images.githubusercontent.com/9275193/37556298-73b61a10-29ca-11e8-844c-ce0fa6923a26.png)

Note the lambda function name created by serverless. You need to tell your Lex Bot to use this lambda as done in below screen shot.

Please note that my Lex Bot has 4 intents and all are full filled by same lambda function.

- HelloIntent - Notify Raspberry Pi to capture image and then use AWS Recognition to recognize face.
- NameIntent - When face is not matched with already indexed faces, index the new face
- CloseIntent - Simply ternimates conversation
- ClearAllFacesIntent - Remove all indexed faces from collection

![alt tag](https://user-images.githubusercontent.com/9275193/37556373-666c34e2-29cb-11e8-8851-928a77254177.png)


Dependent Repos

https://github.com/just4give/raspi-image-server

https://github.com/just4give/raspi-dexter-lex-ai
