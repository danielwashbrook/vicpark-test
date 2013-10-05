
function onDeviceReady() {
  console.log('onDeviceReady');
  $(document).ready(function() {
    console.log('document ready');
    vpmobile.getUserLocation();
  });
}

$( window ).on( "navigate", function( event, data ) {

});

// map page
$('#map').live('pageinit', function() {

    $('a.whole').live('click', function(e) {
        vpmobile.active_listing = $(this).find('.path').html();
        $.mobile.changePage("detail.html?path="+$(this).find('.path').html(), {'transition': 'slide'});
        e.stopPropagation();
        e.preventDefault();
      });
});

$( document ).delegate("#map", "pageinit", function() {
  console.log('#map pageinit');

  //vpmobile.bounds = new google.maps.LatLngBounds();
  //




});


$('#map').live('pageshow', function() {
  console.log('#map pageshow');

  vpmobile.bounds = new L.LatLngBounds();

  vpmobile.initialize();

  vpmobile.loadNodes(vpmobile.loadMarkers);
});


// search page functionality
$('#search').live('pageinit', function() {
  console.log('#search pageinit');
  $.extend(  $.mobile , {
    ajaxEnabled: false
  });
  vpmobile.loadNodes(vpmobile.searchListings);
});

// pageinit of every page
$(document).live("pageinit", function(){
  console.log('pageinit');
  $.extend(  $.mobile , {
    ajaxEnabled: true
  });
});


$('#details').live('pageshow', function() {
  vpmobile.loadNodes(vpmobile.getDetailedListing, getURLParameter('path'));
  $('.view_on_map').click(function(){

    $('#map-canvas').toggle();
    //google.maps.event.trigger(vpmobile.detailMap, 'resize');
    vpmobile.detailMap.setView([vpmobile.currentListing.latitude, vpmobile.currentListing.longitude], 15);
    smart_scroll($('#map-canvas'));
  });
});


$('#main').live('pageshow', function() {
  console.log('#main pageshow');
  //$('#map_canvas').gmap('refresh');
});


// explore page, load the listings into the lists
$('#main').live('pageinit', function() {
  console.log('#main pageinit');

  vpmobile.loadNodes(vpmobile.loadListings);


});

// page link from the left menu
$('.leftmenu a[href=#map]').live('click', function(e){
  //console.log($(this).attr("href"));
  //$.mobile.loading( 'show' );
  //console.log($(this)[0].dataset.link);
  vpmobile.active_category = $(this)[0].dataset.link;
  vpmobile.loadMarkers();
  $.mobile.changePage($("#map")); //'index.html');//
  infobox.close();
  $('#mypanel').panel( "close" );
  return false;
});

// explore category list link back to view all on map
$("a.header-link").live("click", function (e) {
  //console.log($(this)[0].dataset.link);
  vpmobile.active_category = $(this)[0].dataset.link;
  $.mobile.changePage($("#map")); //'index.html');//
  return false;
});

// function for parsing the url
function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}


// click on link in the list, set the active listing variable
$('.list-item-link').live('click',function(){
  path = decodeURI(
    (RegExp(name + '=' + '(.+?)(&|$)').exec($(this).attr('href'))||[,null])[1]
  );
  vpmobile.active_listing = path;
});


$("div.ui-collapsible").live("expand", function(e) {
  smart_scroll(e.target);
});


/* Phone gap bootstrap */

document.addEventListener("deviceready", onDeviceReady);

function log(str){
  console.log(str);
}

