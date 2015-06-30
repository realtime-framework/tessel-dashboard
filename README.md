## Tessel real-time dashboard using Realtime Messaging 
Plug your climate, ambient, accelerometer, camera and servo modules to your Tessel board and see the values change in real-time in the web dashboard.

Remotely control the camera to snap pictures.

## Running the example
To run this example in your Tessel use the following commands:


    cd tesselCode
    npm install
	tessel run sensorHandler.js --upload-dir ./
    

> NOTE: For simplicity these samples assume you're using a Realtime® Framework developers' application key with the authentication service disabled (every connection will have permission to publish and subscribe to any channel). For security guidelines please refer to the [Security Guide](http://messaging-public.realtime.co/documentation/starting-guide/security.html). 
> 
> **Don't forget to replace `YOUR_APPLICATION_KEY` and `YOUR_APPLICATION_PRIVATE_KEY` with your own application key. If you don't already own a free Realtime® Framework application key, [get one now](https://accounts.realtime.co/signup/).**

## Documentation
The Tessel SDK API reference documentation can be found [here](http://messaging-public.realtime.co/documentation/tessel/2.1.0/OrtcClient.html).

The complete Realtime® Messaging SDKs reference documentation is available [here](http://framework.realtime.co/messaging/#documentation)

## About Realtime  
Part of the [The Realtime® Framework](http://framework.realtime.co), Realtime Cloud Messaging (aka ORTC) is a secure, fast and highly scalable cloud-hosted Pub/Sub real-time message broker for web and mobile apps.

When you need to communicate in real-time with your Tessel devices Realtime Cloud Messaging is the reliable, easy, unbelievably fast, “works everywhere” solution.
