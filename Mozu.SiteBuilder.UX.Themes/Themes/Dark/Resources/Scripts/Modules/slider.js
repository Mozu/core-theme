
define(["jquery"], function($){
  if($(".mz-slider-wrap").length > 0){
   var t = $(".mz-slider-wrap").eq(0),
   slideTimerInterval = 3000,
   slideTimer = null,
   paginationNodes,
   lis = $(".mz-slider-li", t);

   function init() {
    assignBannerIds();
    generateNodes();
    paginationNodes = $(".mz-pagination-a"),
    advancing = false;
    paginationNodes.eq(0).addClass("mz-pn-active");
    attachNodeClicks();
    pauseSetup();
  }
  function generateNodes() {
    $(".mz-pagination-ul").html(generatePaginationNodes());
  }
  function attachNodeClicks(){
    paginationNodes.each(function(){
      var t = $(this);
      if (!advancing) {
        t.click(function(){
          var matchingSlideNo = t.attr("data-matching-slide");
          selectSpecificSlide(matchingSlideNo);
          clearPaginationClass();
          t.addClass("mz-pn-active");
          
        })
      }
    })
  }
  function pauseSetup(){
    t.hover(function(){
      stopBanner();
    },
    function(){
      playBanner();
    })
  }
  function advanceSlide(){
    advancing = true;
    $("[data-slider-status='onDeck']", t)
    .attr("data-slider-status", "active")
    .next()
    .attr("data-slider-status", "onDeck");
    $("[data-slider-status='current']", t).removeAttr("data-slider-status");
    $("[data-slider-status='active']", t).attr("data-slider-status", "current");
    checkIfItHasNext();       
    syncPagination();
    advancing = false;
  }
  function checkIfItHasNext(){
    if (t.find($("[data-slider-status='current']")).next().length == 0){
      lis.eq(0).attr("data-slider-status", "onDeck");
    }
  }
  function selectSpecificSlide(slide){
    clearInterval(slideTimer);
    if (advancing) {
      setTimeout(function(){selectSpecificSlide(slide)}, 100);
    }else{
      var $slide = $("[data-banner-id = '" + slide + "']");
      var nextSlide = $slide.next();
      if (nextSlide.length >0) {
        nextSlide.attr("data-slider-status", "onDeck");
      } else {
        lis.eq(0).attr("data-slider-status", "onDeck");
      };
      
      $("[data-slider-status='active']").removeAttr("data-slider-status");
      $slide.attr("data-slider-status", "active");
    }
    
    
  }
  function syncPagination(){
    var current =  $("[data-slider-status='current']", t),
    currentId = current.attr("data-banner-id"),
    activeNode = $("[data-matching-slide = '" + currentId + "']");
    clearPaginationClass();
    activeNode.addClass("mz-pn-active");
  }
  function clearPaginationClass (){
    paginationNodes.each(function(){
      $(this).removeClass("mz-pn-active");
    }); 
  }

  function assignBannerIds() {
    lis.each(function(i){
      $(this).attr("data-banner-id", i);
    })
  }

  function generatePaginationNodes() {
    var c = 0,
    output = [];
    for (var i = lis.length - 1; i >= 0; i--) {
      output[c] = '<li class="mz-pagination-li"><a href="#" class="mz-pagination-a" data-matching-slide="' + c + '"></a></li>';
      c++;
    }
    return output.join("\n");
  }
  function playBanner() {
    slideTimer = setInterval(function(){advanceSlide()}, slideTimerInterval);
  }
  function stopBanner() {
    clearInterval(slideTimer);
  }
  init();
  playBanner();
}

function adjustBodyHeight () {
  if( $("body").height() < $(".mj-main-container").outerHeight() ){
    $("body").height($(".mj-main-container").outerHeight());
  }
}
adjustBodyHeight();
});