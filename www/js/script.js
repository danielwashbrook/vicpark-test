var gaPlugin;
var vpmobile = vpmobile || {};


vpmobile = {

  errorLocation: function(error) {
    console.log('failed getUserLocation');
    console.log(error);
  },
  getUserLocationForDetailMap: function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log('started');
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        usermarkerimage = {
          url:'images/user-location.png',
          scaledSize: new google.maps.Size(50, 50)
        };
        vpmobile.userLocationMarker = new google.maps.Marker({
          position: latlng,
          map: vpmobile.detailMap,
          'icon' : usermarkerimage,
          title:"You are here! (at least within a "+position.coords.accuracy+" meter radius)"
        });
        vpmobile.detail_bounds.extend(latlng);
        console.log('done');
      }, vpmobile.errorLocation);
    }
  },
  getUserLocation: function() {
    //console.log('getUserLocation');
    // get the user's GPS location from an HTML5 browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(vpmobile.updateUserLocation, vpmobile.errorLocation);
    }
  },
  updateUserLocation: function(position) {
    //console.log('updateUserLocation');
    //console.log(position);
    // call itself in 1 second
    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    usermarkerimage = {
      url:'images/user-location.png',
      scaledSize: new google.maps.Size(50, 50)
    };

    if (vpmobile.userLocationMarker) {
      vpmobile.userLocationMarker.setMap(null);
    }
    vpmobile.userLocationMarker = new google.maps.Marker({
      position: latlng,
      map: vpmobile.map,
      'icon' : usermarkerimage,
      title:"You are here! (at least within a "+position.coords.accuracy+" meter radius)"
    });
    vpmobile.bounds.extend(latlng);

    if (!vpmobile.boundschanged) {
      vpmobile.map.fitBounds(vpmobile.bounds);
    }

    setTimeout(function(){vpmobile.getUserLocation()}, 60000);
  },
  initialize: function() {
    vpmobile.markers = [];
    // the bounds to control the map by

    var mapOptions = {
      zoom: 16,
      center: new google.maps.LatLng(51.041499,-114.063690),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles:
      [
          {
              featureType: "poi.business",
              elementType: "labels",
              stylers:
              [
                  {
                      visibility: "off"
                  }
              ]
          }
      ],
      disableDefaultUI: true,
      zoomControl:true,
    };
    vpmobile.map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);

    infobox = new InfoBox({
        alignBottom: true,
         content: document.getElementById("infobox"),
         disableAutoPan: false,
         maxWidth: 150,
         pixelOffset: new google.maps.Size(-150, 0),
         zIndex: null,
         boxStyle: {
            //background: "url('images/map-detail-bg@2x.png') no-repeat 0 0",
            width: "300px",
            height:"170px",
            margin:"0 0 40px 0"
        },
        pane: "floatPane",
        closeBoxURL: "images/close.png",
        infoBoxClearance: new google.maps.Size(1, 1),
        enableEventPropagation: true
    });

    vpmobile.boundschanged = false;
    google.maps.event.addListener(vpmobile.map, 'bounds_changed', function() {
      vpmobile.boundschanged = true;
    });


    // initialize the geolocation feature
    vpmobile.getUserLocation();
  },

  setAllMap: function(map) {
    for (var i = 0; i < vpmobile.markers.length; i++) {
      vpmobile.markers[i].setMap(map);
    }
  },

  searchListings: function(){
    var thedata = vpmobile.nodes;
    $.each( thedata, function(i, node) {
      //console.log(i);
      //console.log(node.listing);
      listing_html = '<li data-icon="false" class="'+ node.listing.term +'"><a href="detail.html?path='+ node.listing.path +'" class="list-item-link"><h2>'+ node.listing.title +'</h2><p class="phone">'+ node.listing.phone +'</p></a>';
      listing_html += '<span style="display:none;">'+node.listing.body + '</span></li>';

      $('#search-list').append(listing_html);

    });

    var searchq = getURLParameter('q');
    console.log('searchq: ' + searchq);
    if (searchq !== "null") {
      //$('#search-input-page').val( decodeURIComponent(searchq).replace(/\+/g, ' '));
      $('.ui-input-search input').val(decodeURIComponent(getURLParameter('q')).replace(/\+/g, ' '));
      $('.ui-input-search input').trigger('change');
    }
    $("#search-list").listview("refresh");
  },

  // jsonp results callback from the server
  results : function(data){
    vpmobile.nodes = data.nodes;
  },

  loadNodes: function(callbackfunction, optional_argument) {

    if (vpmobile.nodes === undefined || vpmobile.nodes.length < 1){
      console.log('getting fresh data!');
      $.mobile.loading( 'show' );

      $.ajax({
          url: 'http://victoriapark.org/listings/export.json?callback=?',
          type: 'GET',
          crossDomain: true,
          dataType: 'jsonp',
          success: function() {   callbackfunction(optional_argument);  },
          error: function() { $.mobile.loading( 'hide' );  callbackfunction(optional_argument);  },
      });

    } else {
      console.log('already loaded!');
      callbackfunction(optional_argument);
    }
  },

  loadMarkers: function() {
    console.log('loading markers');
    var markerimage = new Array();

    if (getURLParameter('term') != 'null') {
      var thedata = vpmobile.nodes.filter(function (el) {
        //console.log(el);
        return el.listing.term == getURLParameter('term').replace("''","&#039;");
      });
    } else if (vpmobile.active_category !== undefined) {
      console.log('active category:' + vpmobile.active_category);
      var thedata = vpmobile.nodes.filter(function (el) {
        //console.log(el);
        return el.listing.term == vpmobile.active_category.replace("''","&#039;");
      });
    } else {
      var thedata = vpmobile.nodes;
    }

    // clear current markers
    console.log('clearing markers');

    vpmobile.setAllMap(null);
    vpmobile.markers = [];

    //console.log(thedata);
    $.each( thedata, function(i, marker) {

      //console.log(marker.listing);

      // Marker image from category

      switch(marker.listing.term)
      {
      case 'Cafe and Dining':
        markerimage[i] = {
          url:'images/map-pin-cafe@2x.png',
          scaledSize: new google.maps.Size(45, 60)
        };
        break;
      case 'Pubs &#039;n Clubs':
        markerimage[i] = {
          url:'images/map-pin-pubs@2x.png',
          scaledSize: new google.maps.Size(45, 60)
        };
        break;
      case 'Shop':
        markerimage[i] = {
          url:'images/map-pin-shops@2x.png',
          scaledSize: new google.maps.Size(45, 60)
        };
        break;
      case 'Stay &#039;n Play':
        markerimage[i] = {
          url:'images/map-pin-stay@2x.png',
          scaledSize: new google.maps.Size(45, 60)
        };
        break;
      case 'Treats':
        markerimage[i] = {
          url:'images/map-pin-treats@2x.png',
          scaledSize: new google.maps.Size(45, 60)
        };
        break;
      case 'Events':
        markerimage[i] = {
          url:'images/map-pin-special@2x.png',
          scaledSize: new google.maps.Size(60, 80)
        };
        break;
      }
      //console.log(markerimage[i]);

      // add the marker with the image and the click function
      //vpmobile.addMarker(new google.maps.LatLng(marker.listing.latitude, marker.listing.longitude));
      var markerPosition = new google.maps.LatLng(marker.listing.latitude, marker.listing.longitude);
      markerobj = new google.maps.Marker({
        position: markerPosition,
        map: vpmobile.map,
        'icon' : markerimage[i]
      });
      vpmobile.bounds.extend(markerPosition);

      google.maps.event.addListener(markerobj, 'click', function() {

        infobox.setContent('<div id="infobox" class="'+marker.listing.term+' openedinfobox">'+
          '<a href="detail.html?path='+marker.listing.path+'" class="whole">'+
            '<h4>'+marker.listing.title+'</h4>'+
            '<phone>'+marker.listing.phone+'</phone>'+
            '<p class="path">'+marker.listing.path+'</p>'+
        '</a></div>');
        infobox.open(vpmobile.map, this);
        google.maps.event.addListener(infobox, 'click', function(event) {
          console.log('PIE');
        });

      });

      google.maps.event.addDomListener(infobox, 'click', function(){
        console.log('newclick');
      });
      vpmobile.markers.push(markerobj);
      oldCenter = vpmobile.map.getCenter();
      google.maps.event.trigger(vpmobile.map, 'resize');
      vpmobile.map.setCenter(oldCenter);

    });


    vpmobile.map.fitBounds(vpmobile.bounds);
  },


}


function onDeviceReady() {
  console.log('onDeviceReady');

  //gaPlugin = window.plugins.gaPlugin;
  //gaPlugin.init(successHandler, errorHandler, "UA-37498066-1", 10);
  $(document).ready(function() {
    console.log('document ready');
    vpmobile.getUserLocation();
  });
}

$( window ).on( "navigate", function( event, data ) {
  if(typeof infobox != 'undefined') {
    infobox.close();
  }
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

  vpmobile.bounds = new google.maps.LatLngBounds();
  vpmobile.initialize();

});


$('#map').live('pageshow', function() {
  console.log('#map pageshow');
  //$('#map_canvas').gmap('refresh');
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


$('#details').live('pageinit', function() {
  vpmobile.loadNodes(vpmobile.getDetailedListing, getURLParameter('path'));
  vpmobile.detail_bounds = new google.maps.LatLngBounds();
  vpmobile.getUserLocationForDetailMap();

  $('.view_on_map').click(function(){

    $('#map-canvas').toggle();
    google.maps.event.trigger(vpmobile.detailMap, 'resize');
    var position = new google.maps.LatLng(vpmobile.currentListing.latitude, vpmobile.currentListing.longitude);
    vpmobile.detailMap.setCenter(position);
    vpmobile.detail_bounds.extend(position);

    vpmobile.detailMap.fitBounds(vpmobile.detail_bounds);

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

$(function() {
});

/* Phone gap bootstrap */

document.addEventListener("deviceready", onDeviceReady);
