var resizeTimeout;
  function resizeThrottler() {
   // ignore resize events as long as an actualResizeHandler execution is in the queue
   if ( !resizeTimeout ) {
     resizeTimeout = setTimeout(function() {
      resizeTimeout = null;
      actualResizeHandler();

      // The actualResizeHandler will execute at a rate of 15fps
      }, 66);
   }
  }
function actualResizeHandler() {
   console.log('resize');
   console.log('window innerWidth: ' + window.innerWidth);
   console.log('window innerHeight: ' + window.innerHeight);
};

window.addEventListener('resize', actualResizeHandler);
