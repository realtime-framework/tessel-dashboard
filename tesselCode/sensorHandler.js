// Import the interface to Tessel hardware

var tessel = require('tessel');
var led1 = tessel.led[0].output(1);
var led2 = tessel.led[1].output(0);

var camera = require('camera-vc0706').use(tessel.port['A']);

// Set up an LED to notify when we're taking a picture
var notificationLED = tessel.led[3]; 
var name = '';

// Wait for the camera module to say it's ready
camera.on('ready', function() {
  setRealtime();
});

camera.on('error', function(err) {
  console.error(err);
});


function takePhoto(){
  notificationLED.low();
  // Take the picture
  camera.takePicture(function(err, image) {
    if (err) {
      console.log('error taking image', err);
    } else {
      notificationLED.high();
      name = 'picture-' + Math.floor(Date.now()*1000) + '.jpg';
      // Save the image
      console.log('Picture saving as', name, '...');
      process.sendfile(name, image);
      console.log('done.');
      sendingData('{"module":"Camera", "moduleData":"'+name+'"}');
    }
  });
}


var ortcClient;
var channel = 'tessel';
var ortcIsConnected = false;


function sendingData(data){
  if (ortcIsConnected == true) {      
      ortcClient.send(channel, data);
  };
}

function setRealtime(){

  // SET REALTIME
  var ortcNodeclient = require('realtime-tessel').Messaging;
   
  // Create a Realtime Messaging client to communicate with web dashboard
  ortcClient = new ortcNodeclient();  
  ortcClient.setClusterUrl('http://ortc-developers.realtime.co/server/2.1/');
   
  ortcClient.onConnected = function (ortc) {
      console.log("connected");
      ortcIsConnected = true;
      ortc.subscribe('tesselClient', true, function (client, channel, msg) {

        console.log('Received message: ' + msg);

        var parse = JSON.parse(msg);
        if (parse.Action === "takePhoto") {
          takePhoto();
        }
          else if (parse.Action === "servoLeft")
        {
          servoLeft();
        }
        else if (parse.Action === "servoCenter")
        {
          servoCenter();
        }
        else if (parse.Action === "servoRight")
        {
          servoRight();
        }
      });
  };
   
  ortcClient.onSubscribed = function (ortc, channel) {
    console.log("Subscribe channel: " + channel);
  };

  ortcClient.onException = function (ortc, exception) {
    console.log('exception: ' + exception);
  };

  ortcClient.connect('[YOUR_APPLICATION_KEY]', 'myAuthenticationToken');


  // CLIMATE SENSOR
  
  var climatelib = require('climate-si7020');

  var climate = climatelib.use(tessel.port['B']);

  climate.on('ready', function () {
    console.log('Connected to si7020');

    // Loop forever
    setImmediate(function loop () {
      climate.readTemperature('c', function (err, temp) {
        climate.readHumidity(function (err, humid) {
          //console.log('Degrees:', temp.toFixed(4) + 'F', 'Humidity:', humid.toFixed(4) + '%RH');
          var Temperature = parseFloat(temp.toFixed(4))  / 100.0;
          var Humidity = parseFloat(humid.toFixed(4)) / 100.0;
          sendingData('{"module":"Temperature", "moduleData":"'+Temperature.toFixed(2)+'"}');
          sendingData('{"module":"Humidity", "moduleData":"'+Humidity.toFixed(2)+'"}');

          setTimeout(loop, 5000);
        });
      });
    });
  });

  climate.on('error', function(err) {
    console.log('error connecting module', err);
  });



  // AMBIENT SENSOR
  var ambientlib = require('ambient-attx4');

  var ambient = ambientlib.use(tessel.port['D']);

  ambient.on('ready', function () {
     // Get points of light and sound data.
      setInterval( function () {
        ambient.getLightLevel( function(err, ldata) {
          if (err) throw err;
          ldata = ldata * 10;
          sendingData('{"module":"Light", "moduleData":"'+ldata.toFixed(4)+'"}');
      })}, 100);

      setInterval( function () { 
            ambient.getSoundLevel( function(err, sdata) {
            if (err) throw err;
            // console.log("Light level:", ldata.toFixed(8), " ", "Sound Level:", sdata.toFixed(8));
            sdata = sdata * 10;
            sendingData('{"module":"Sound", "moduleData":"'+sdata.toFixed(4)+'"}');
        })}, 100);
    });

    // ACCELEROMETER SENSOR
    var accel = require('accel-mma84').use(tessel.port['B']);

    // Initialize the accelerometer.
    accel.on('ready', function () {

      accel.on('data', function (xyz) {        
        sendingData('{"module":"X", "moduleData":"'+xyz[0].toFixed(2)+'"}');
        sendingData('{"module":"Y", "moduleData":"'+xyz[1].toFixed(2)+'"}');
        sendingData('{"module":"Z", "moduleData":"'+xyz[2].toFixed(2)+'"}');
      });
    });

    accel.on('error', function(err){
      console.log('Error:', err);
    });



    // SERVO MODULE

    var servolib = require('servo-pca9685');
    var servo = servolib.use(tessel.port['C']);

    // We have a servo plugged in at position 1
    var servo1 = 1; 
    var position = 0.50;

    servo.on('ready', function () {
      //  Target position of the servo between 0 (min) and 1 (max).

      //  Set the minimum and maximum duty cycle for servo 1.
      //  If the servo doesn't move to its full extent or stalls out
      //  and gets hot, try tuning these values (0.05 and 0.12).
      //  Moving them towards each other = less movement range
      //  Moving them apart = more range, more likely to stall and burn out
      servo.configure(servo1, 0.05, 0.12, function () {
        servo.move(servo1, position);
      });
    });

    function servoCenter(){
      position = 0.50;
      servo.move(servo1, position);
      sendingData('{"module":"Servo", "moduleData":"'+position+'"}');
    }

    function servoLeft(){
      position = 0;
      servo.move(servo1, position);
      sendingData('{"module":"Servo", "moduleData":"'+position+'"}');
    }

    function servoRight(){
      position = 1;
      servo.move(servo1, position);
      sendingData('{"module":"Servo", "moduleData":"'+position+'"}');
    }
}

