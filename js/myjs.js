var client;

loadOrtcFactory(IbtRealTimeSJType, function (factory, error) {
 if (error != null) {
  alert("Factory error: " + error.message);
 } else {
 
   if (factory != null) {

    // Create Realtime client to communicate with Tessek    
    client = factory.createClient();    
    client.setConnectionMetadata('Tessel Dashboard');
    client.setClusterUrl('http://ortc-developers.realtime.co/server/2.1/');
 
    client.onConnected = function (theClient) {
       
      theClient.subscribe('tessel', true,
              function (theClient, channel, msg) {                  
                  var parse = JSON.parse(msg);                  

                  if (parse.module === "Camera") {
                    addPhoto(parse.moduleData);
                  }else{
                    var element = document.getElementById(parse.module);
                    var valueData = parseFloat(parse.moduleData) * 100;
                    valueData = valueData.toFixed(2);                    
                    $('.'+parse.module+'Level').kumaGauge('update',{                      
                      value : valueData,
                    });
                  }
              });
    };
 
    client.onSubscribed = function (theClient, channel) {
        console.log("subscribe channel " + channel);
    };
 
    client.connect('[YOUR_APPLICATION_KEY]', 'myAuthenticationToken');
   }
 }
});

function servoCenter(){
  client.send('tesselClient','{"Action":"servoCenter"}');
}

function servoRight(){
  client.send('tesselClient','{"Action":"servoRight"}');
}

function servoLeft(){
  client.send('tesselClient','{"Action":"servoLeft"}');
}

function takePhoto(){
  client.send('tesselClient','{"Action":"takePhoto"}');
}

var photos = [];

function addPhoto(photo){
  photos.push(photo);
  savePhotos();
  drawPhotos();
}

function savePhotos(){
  localStorage.setItem("photos", JSON.stringify(photos));
  console.log("storage photos: " + JSON.stringify(photos));
}

function loadPhotos(){
  var storagePhotos = localStorage.getItem("photos");
  if (storagePhotos != null) {
    console.log("storage photos: " + JSON.stringify(photos));
    photos = JSON.parse(storagePhotos);
  };  
}

function drawPhotos(){
  loadPhotos();
  var element = document.getElementById('Photos');
  var content = '';
  for (var i = 0; i < photos.length; i++) {
    console.log("on images");
    content += '<div class="col-md-3">'+
                  '<img class="frame" alt="Climate-module" src="tesselCode/'+photos[i]+'" />'+
              '</div>'
  };
  element.innerHTML = content;
}

