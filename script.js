const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');
const humanDetect = document.getElementById('humanDetect');


// Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment 
// to get everything needed to run.
// Note: cocoSsd is an external object loaded from our index.html
cocoSsd.load().then( function (loadedModel) {
  model = loadedModel
  // Show demo section now model is ready to use.
  demosSection.classList.remove('invisible');
  console.log('model is loaded, bro!')
  })

// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia)
  }
  
// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will 
// define in the next step.
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam)
    } else {
      console.warn('getUserMedia() is not supported by your browser')
    }
  
  
// Enable the live webcam view and start classification.
  
function enableCam(event) {

  // Only continue if the COCO-SSD has finished loading.
    if (!model) {
      return;
    }
    
  // Hide the button once clicked.
  event.target.classList.add('removed');  
  // or enableWebcamButton.classList.add('removed') 
  // see https://www.w3schools.com/jsref/prop_element_classlist.asp  
    
  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
    }
  
  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    console.log("cam working!")
    video.addEventListener('loadeddata', predictWebcam);
    })

}


// predict with pre-trained model using the function below:

var children = [];

function predictWebcam() {

  // Now let's start classifying a frame in the stream.
  model.detect(video).then ( function (predictions) {

    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
  
  children.splice(0);
      
  // Now lets loop through predictions and draw them to the live view if
  // they have a high confidence score.
  for (let n = 0; n < predictions.length; n++) {

    // If we are over 66% sure we are sure we classified it right, draw it!  
      if (predictions[n].score > 0.66) {

    // instead of the above, if I only wanted the model to detect people, potted plants and books, use: if (predictions[n].score > 0.66 && predictions[n].class==='person' || predictions[n].class==='potted plant' || predictions[n].class==='book')

    // create bounding boxes (deleted script to remove them if necessary):
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
          + Math.round(parseFloat(predictions[n].score) * 100) 
          + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
          + (predictions[n].bbox[1] - 10) + 'px; width: ' 
          + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';
  
        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
          + predictions[n].bbox[1] + 'px; width: ' 
          + predictions[n].bbox[2] + 'px; height: '
          + predictions[n].bbox[3] + 'px;';
  
        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);

        // detect hoomans!
        /**
        if (predictions[n].class === 'person') {
          humanDetect.innerHTML = 'YES!'
        } else if (predictions[n].class !== 'person') {
          humanDetect.innerHTML = 'No' //only says No when a non-person is detected :(
        }  */
        if (predictions[n].class === 'person') {
          humanDetect.innerHTML = 'YES!' 
        } 
      
      }

    }
      
    // Call this function again to keep predicting when the browser is ready.
      window.requestAnimationFrame(predictWebcam);
    })

  }

// Store the resulting model in the global scope of our app.
var model = undefined;


// resources:
// https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd
// https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection#0
// objects it can detect https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts

/*
        
here's my script dump to count the number of people! Failed!
        
//console.log(predictions.length) shows number of detected objects, not just persons

               console.log(predictions[n].bbox.length)
               
            if ( predictions[n].bbox.length == 0) {
                humanCounter += 1;
                humanCounterNum.innerHTML = humanCounter}


          if (predictions[n].class==='person') {
            humanCounter +=1
            humanCounterNum.innerHTML = humanCounter
            }

   predictions.forEach(hey => {
            // check for class
            if (predictions[n].class === 'person' && predictions[n].bbox[0] < 20) {
              humanCounter +=1
              humanCounterNum.innerHTML = humanCounter
            }
        })
        */