// Copyright 2013 Google Inc. All Rights Reserved.
// You may study, modify, and use this example for any purpose.
// Note that this example is provided "as is", WITHOUT WARRANTY
// of any kind either expressed or implied.

var adsManager;
var adsLoader;
var adDisplayContainer;
var intervalTimer;
var playButton;
var videoContent;

var adsError = false;

function setUpIMA() {
  // Create the ad display container.
  createAdDisplayContainer();
  // Create ads loader.
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  // Listen and respond to ads loaded and error events.
  adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false);
  adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false);

  // Request video ads.
  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?iu=/77049696/RS_Video&description_url=http%3A%2F%2Fasiaray.com&env=vp&impl=s&correlator=&tfcd=0&npa=0&gdfp_req=1&output=vast&sz=896x1724|896x1724&unviewed_position_start=1';

  // adsRequest.adTagUrl =    'https://pubads.g.doubleclick.net/gampad/ads?env=vp&'+
  //                           'gdfp_req=1&'+
  //                           'output=vast&'+
  //                           'iu=/77049696/russell_street&'+
  //                           'sz=896x1724|896x1724'+
  //                           'unviewed_position_start=1&';

  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = 896;
  adsRequest.linearAdSlotHeight = 1724;

  adsRequest.nonLinearAdSlotWidth = 896;
  adsRequest.nonLinearAdSlotHeight = 1724;
  removeCookies();
  adsLoader.requestAds(adsRequest);
  console.log("Cookies:",document.cookie);
}


function createAdDisplayContainer() {
  // We assume the adContainer is the DOM id of the element that will house
  // the ads.
  adDisplayContainer = new google.ima.AdDisplayContainer(
      document.getElementById('adContainer'), videoContent);
}

function playAds() {
  
  // Initialize the container. Must be done via a user action on mobile devices.
  

  try {
    // Initialize the ads manager. Ad rules playlist will start at this time.
    
    // Call play to start showing the ad. Single video and overlay ads will
    // start at this time; the call will be ignored for ad rules.
    adsManager.start();
    socket.emit('Play Ads');

  } catch (adError) {
    // An error may be thrown if there was a problem with the VAST response.
    console.log(adError)
    videoContent.play();
    
  }
}

function initAdsManager(){
  console.log("DOM fully loaded and parsed");
    videoContent.load();
    adDisplayContainer.initialize();
}

document.addEventListener("DOMContentLoaded", initAdsManager);



function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Get the ads manager.
  var adsRenderingSettings = new google.ima.AdsRenderingSettings();

  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  // videoContent should be set to the content video element.
  adsManager = adsManagerLoadedEvent.getAdsManager(
      videoContent, adsRenderingSettings);

  // Add listeners to the required events.
  adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      onAdEvent);

  // Listen to any additional events, if necessary.
  adsManager.addEventListener(
      google.ima.AdEvent.Type.LOADED,
      onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.STARTED,
      onAdEvent);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.COMPLETE,
      onAdEvent);
  //init it
  adsManager.init(896, 1724, google.ima.ViewMode.NORMAL);
  console.log("Ads Manager Loaded")
  
  // setTimeout(videoContent.pause(),1000);
}

function onAdEvent(adEvent) {
  // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
  // don't have ad object associated.
  var ad = adEvent.getAd();
  switch (adEvent.type) {
    case google.ima.AdEvent.Type.LOADED:
    socket.emit("Loaded Ads",adEvent.getAdData());
    
      // This is the first event sent for an ad - it is possible to
      // determine whether the ad is a video ad or an overlay.
      console.log(adEvent.getAdData());
      if (!ad.isLinear()) {
        // Position AdDisplayContainer correctly for overlay.
        // Use ad.width and ad.height.
        videoContent.play();
      }
      break;
    case google.ima.AdEvent.Type.STARTED:
      // This event indicates the ad has started - the video player
      // can adjust the UI, for example display a pause button and
      // remaining time.
      if (ad.isLinear()) {
        // For a linear ad, a timer can be started to poll for
        // the remaining time.
        intervalTimer = setInterval(
            function() {
              var remainingTime = adsManager.getRemainingTime();
            },
            300); // every 300ms
      }
      break;
    case google.ima.AdEvent.Type.COMPLETE:
      // This event indicates the ad has finished - the video player
      // can perform appropriate UI actions, such as removing the timer for
      // remaining time detection.
      
      console.log(document.cookie);
      socket.emit('Ads Complete');
      console.log("COMPLETE");

      if (ad.isLinear()) {
        clearInterval(intervalTimer);
      }
      break;
  }
}

function onAdError(adErrorEvent) {
  // Handle the error logging.
  console.log(adErrorEvent.getError());
  console.log("Ads error");
  adsError = true;

  // adsManager.destroy();
}

function onContentPauseRequested() {
  videoContent.pause();
  // This function is where you should setup UI for showing ads (e.g.
  // display ad timer countdown, disable seeking etc.)
  // setupUIForAds();
}

function onContentResumeRequested() {
  videoContent.play();
  // This function is where you should ensure that your UI is ready
  // to play content. It is the responsibility of the Publisher to
  // implement this function when necessary.
  // setupUIForContent();

}

function init() {
  videoContent = document.getElementById('contentElement');
  // playButton = document.getElementById('playButton');
  // playButton.addEventListener('click', playAds);
   setUpIMA();
   // setTimeout(playAds,1000);
}



function BroadSignPlay(){ //set up
  if(adsError){
    socket.emit('Ads Complete');
  }else{
    playAds();  
  }
  
}
// window.onload(playAds());
// Wire UI element references and UI event listeners.
init();


function removeCookies() {
  var res = document.cookie;
  console.log("Removing cookies")
  var multiple = res.split(";");
  for(var i = 0; i < multiple.length; i++) {
     var key = multiple[i].split("=");
     document.cookie = key[0]+" =; Path=/; Domain=.asiaray.com; expires = Thu, 01 Jan 1970 00:00:00 UTC";
     document.cookie = key[0]+" =; Path=/; expires = Thu, 01 Jan 1970 00:00:00 UTC";
  } 
  console.log(document.cookie);
  console.log("Removed cookies")
}