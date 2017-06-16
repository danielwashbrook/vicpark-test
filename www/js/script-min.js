var vpmobile = vpmobile || {};


vpmobile = {


  loadListings: function() {

    // Start by adding the sub-catgories to the parent catgories
    var terms = [];
    $.each(vpmobile.nodes, function(index, item) {
      if (item.listing.childName) {
        var childTerm = item.listing.childName;
        var childTermID = childTerm.replace(/[\$\s\&\/]/g, '-');
        category_html = '<li data-role="collapsible" data-icon="false" class="list-item-link" id="' + childTermID + '" ><div class="sub-collapsible" data-role="collapsible"><h2>'+ childTerm +'</h2>' +
          '<a href="index.html?childName='+ childTermID +'" class="header-link '+ item.listing.term +'" data-link="'+ childTermID +'">View all on map</a></div></li>';
        if ($.inArray(childTermID, terms) < 0) {
          terms.push(childTermID);
          switch (item.listing.term) {
            case 'Explore':
              $('#list1').append(category_html);
              break;
            case 'Eat & Drink':
              $('#list2').append(category_html);
              break;
            case 'Health & Beauty':
              $('#list3').append(category_html);
              break;
            case 'Services':
              $('#list4').append(category_html);
              break;
            case 'Events':
              $('#list6').append(category_html);
              break;
          }
        }
      }
    });

    // Add Locations to the proper Child Category
    $.each( vpmobile.nodes, function(i, marker) {
      if (marker.listing.childName) {
        var childTermID = marker.listing.childName.replace(/[\$\s\&\/]/g, '-').replace('&', '');
        listing_html = '<li data-icon="false"><a href="detail.html?path=' + marker.listing.path + '" class="list-item-link"><h2 class="ui-li-heading">' + marker.listing.title + '</h2><p class="phone">' + marker.listing.phone + '</p><p class="term">' + marker.listing.childName + '</p></a></li>';
        $('#' + childTermID + ' div').append(listing_html);
      }

    });

    // Now refresh/create the jQuery Mobile listing
    $.each(terms, function(i, v) {
      $('#' + v).trigger('create');
    });
    // $("#Shop").trigger('create');
    // $("#list3").listview("refresh");
    // $("#list4").listview("refresh");
    // $("#list6").listview("refresh");
  },

  initializeMap: function (lat, long, term) {
    /*var mapOptions = {
      center: new google.maps.LatLng(lat, long),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };

    vpmobile.detailMap = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);*/

    vpmobile.detailMap = L.map('map-canvas').setView([lat,long], 15);
      L.tileLayer('http://{s}.tiles.mapbox.com/v3/danielwashbrook.i8eb33d5/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: 'Map data &copy; 2014 mapbox'
    }).addTo(vpmobile.detailMap);
    switch(term)
    {
    case 'Explore':

        markerimage = L.icon({
          iconUrl: 'images/map-pin-explore@2x.png',
          iconSize:     [45, 60],
          popupAnchor:  [0, -50],
          iconAnchor:   [22, 60]
        });
        break;
      case 'Eat & Drink':

        markerimage = L.icon({
          iconUrl: 'images/map-pin-eat@2x.png',
          iconSize:     [45, 60],
          popupAnchor:  [0, -50],
          iconAnchor:   [22, 60]
        });
        break;
      case 'Health & Beauty':

        markerimage = L.icon({
          iconUrl: 'images/map-pin-health@2x.png',
          iconSize:     [45, 60],
          popupAnchor:  [0, -50],
          iconAnchor:   [22, 60]
        });
        break;
      case 'Services':

        markerimage = L.icon({
          iconUrl: 'images/map-pin-services@2x.png',
          iconSize:     [45, 60],
          popupAnchor:  [0, -50],
          iconAnchor:   [22, 60]
        });
        break;
      case 'Events':

        markerimage = L.icon({
          iconUrl: 'images/map-pin-special@2x.png',
          iconSize:     [60, 80],
          popupAnchor:  [0, -70],
          iconAnchor:   [30, 80]}
        );
        break;
    }

    markerPosition = [lat, long];
    var markerobj = L.marker(markerPosition,
      {icon: markerimage})
      .addTo(vpmobile.detailMap);

    $('#map-canvas').toggle();
  },

  getDetailedListing: function(path) {

    
    if (path == 'null') {
      log(vpmobile.active_listing);
      path = vpmobile.active_listing;
    }
    log(path);

    var thedata = vpmobile.nodes.filter(function (el) {
      //log(el);
      return el.listing.path == path;
    });
    //log(vpmobile.nodes);
    thedata = thedata[0].listing;
    $('.innertext h2').html(thedata.title);
    $('.innertext h2').attr('class', thedata.term);
    $('.innertext .address').html(thedata.street);
    $('.innertext phone').html(thedata.phone);
    if (thedata.body != '') {
      $('.innertext .description').html(thedata.body);
      $('.innertext .description').show();
      $('.innertext h3').show();
    } else {
      $('.innertext h3').hide();
      $('.innertext .description').hide();
    }

    $('.detail_image').attr('src', thedata.thumbnail);



    vpmobile.currentListing = thedata;

    vpmobile.initializeMap(vpmobile.currentListing.lattitude, vpmobile.currentListing.longitude, vpmobile.currentListing.term);
    log(thedata);

  },

  errorLocation: function(error) {
    log('failed getUserLocation');
    log(error);
  },
  getUserLocation: function() {
    //log('getUserLocation');
    // get the user's GPS location from an HTML5 browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(vpmobile.updateUserLocation, vpmobile.errorLocation);
    }
  },
  updateUserLocation: function(position) {
    //log('updateUserLocation');
    log(position);
    // call itself in 1 second

    var usermarkerimage = L.icon({
        iconUrl: 'images/user-location.png',

        iconSize:     [50, 50], // size of the icon
        iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    if (vpmobile.userLocationMarker == null) {
      vpmobile.userLocationMarker = L.layerGroup();
    } else {
      vpmobile.userLocationMarker.clearLayers();
    }

    var userLocationMarkerObj = L.marker([position.coords.latitude, position.coords.longitude],
      {icon: usermarkerimage});

    vpmobile.userLocationMarker.addLayer(userLocationMarkerObj);

    vpmobile.userLocationMarker.addTo(vpmobile.map);
    //var latlng = new google.maps.LatLng(position.coords.lattitude, position.coords.longitude);

/*
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
    */

    setTimeout(function(){vpmobile.getUserLocation()}, 60000);
  },
  initialize: function() {
    vpmobile.markers = [];
    // the bounds to control the map by


    if (vpmobile.map == null) {
      vpmobile.map = L.map('map_canvas').setView([51.041499,-114.063690], 15);
       L.tileLayer('http://{s}.tiles.mapbox.com/v3/danielwashbrook.i8eb33d5/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; 2014 mapbox'
      }).addTo(vpmobile.map);
    }

    /*infobox = new InfoBox({
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
    });*/

    /*vpmobile.boundschanged = false;
    google.maps.event.addListener(vpmobile.map, 'bounds_changed', function() {
      vpmobile.boundschanged = true;
    });*/

    vpmobile.bounds = new L.LatLngBounds();

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
      //log(i);
      //log(node.listing);
      listing_html = '<li data-icon="false" class="'+ node.listing.term +'"><a href="detail.html?path='+ node.listing.path +'" class="list-item-link"><h2>'+ node.listing.title +'</h2><p class="phone">'+ node.listing.phone +'</p><p class="category">'+ node.listing.childName +'</p></a>';
      listing_html += '<span style="display:none;">'+node.listing.body + '</span></li>';

      $('#search-list').append(listing_html);

    });

    var searchq = getURLParameter('q');
    log('searchq: ' + searchq);
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
      log('getting fresh data!');
      $.mobile.loading( 'show' );

      $.ajax({
          url: 'http://www.victoriapark.org/listings/export-d8.json?callback=?',
          type: 'GET',
          crossDomain: true,
          dataType: 'jsonp',
          success: function() {   callbackfunction(optional_argument);  },
          error: function() { $.mobile.loading( 'hide' );  callbackfunction(optional_argument);  },
      });

    } else {
      log('loading cached data!');
      callbackfunction(optional_argument);
    }
  },

  loadMarkers: function() {
    log('loading markers');
    var markerimage = new Array();
    if (getURLParameter('childName') != 'null') {
      var thedataBefore = vpmobile.nodes.filter(function (el) {
        var modifiedChildName = el.listing.childName.replace(/[\$\s\&\/]/g, '-').replace('&', '');
        return modifiedChildName == getURLParameter('childName').replace("''","&#039;");
      });
    } else if ((vpmobile.active_category !== undefined)) {
      var thedataBefore = vpmobile.nodes.filter(function (el) {
        return el.listing.term == vpmobile.active_category.replace("''","&#039;");
      });
    } else {
      var thedataBefore = vpmobile.nodes;
    }

    var thedataTemp = thedataBefore.filter(function (el) {
      return el.listing.term !== '';
    });
    var thedataTemp2 = thedataTemp.filter(function (el) {
      return el.listing.onmobile != '0';
    });
    var thedata = thedataTemp2.filter(function (el) {
      return el.listing.longitude != '0';
    });


    if (vpmobile.markergroup == null) {
      vpmobile.markergroup = L.layerGroup();
    } else {
      vpmobile.markergroup.clearLayers();
    }


    vpmobile.markers = [];

    //log(thedata);
    $.each( thedata, function(i, marker) {

      //log(marker.listing);

      // Marker image from category


      switch(marker.listing.term)
      {
      case 'Explore':

        markerimage[i] = L.icon({
          iconUrl: 'images/map-pin-explore@2x.png',
          iconSize:     [45, 60],
          popupAnchor:  [0, -50],
          iconAnchor:   [22, 60]
        });
        break;
      case 'Eat & Drink':

        markerimage[i] = L.icon({
          iconUrl: 'images/map-pin-eat@2x.png',
          iconSize:     [45, 60],
          popupAnchor:  [0, -50],
          iconAnchor:   [22, 60]
        });
        break;
      case 'Health & Beauty':

        markerimage[i] = L.icon({
          iconUrl: 'images/map-pin-health@2x.png',
          iconSize:     [45, 60],
          popupAnchor:  [0, -50],
          iconAnchor:   [22, 60]
        });
        break;
      case 'Services':

        markerimage[i] = L.icon({
          iconUrl: 'images/map-pin-services@2x.png',
          iconSize:     [45, 60],
          popupAnchor:  [0, -50],
          iconAnchor:   [22, 60]
        });
        break;
      case 'Events':

        markerimage[i] = L.icon({
          iconUrl: 'images/map-pin-special@2x.png',
          iconSize:     [60, 80],
          popupAnchor:  [0, -70],
          iconAnchor:   [30, 80]}
        );
        break;
      }

      if ((marker.listing.lattitude == undefined) || (marker.listing.longitude == undefined) || (marker.listing.lattitude == 0) || (marker.listing.longitude == 0)) {
        return;
      }

      if (marker.listing.termId == null) {
        return;
      }

      markerPosition = [marker.listing.lattitude, marker.listing.longitude];
      var markerobj = L.marker(markerPosition,
        {icon: markerimage[i]})
      .bindPopup('<div id="infobox" class="'+marker.listing.term+' openedinfobox">'+
          '<a href="detail.html?path='+marker.listing.path+'" class="whole">'+
            '<h4>'+marker.listing.title+'</h4>'+
            '<phone>'+marker.listing.phone+'</phone>'+
            '<p class="category">'+marker.listing.childName+'</p>'+
            '<p class="path">'+marker.listing.path+'</p>'+
        '</a></div>');
      //log(markerimage[i]);


      vpmobile.bounds.extend(markerPosition);


      vpmobile.markers.push(markerobj);
      vpmobile.markergroup.addLayer(markerobj);
      // oldCenter = vpmobile.map.getCenter();
      // google.maps.event.trigger(vpmobile.map, 'resize');
      // vpmobile.map.setCenter(oldCenter);

    });
    vpmobile.markergroup.addTo(vpmobile.map);


    vpmobile.map.fitBounds(vpmobile.bounds);   //fitBounds(vpmobile.bounds);
  },


}


function smart_scroll(el, offset)
{
  offset = offset || 0; // manual correction, if other elem (eg. a header above) should also be visible

  var air         = 15; // above+below space so element is not tucked to the screen edge

  var el_height   = $(el).height()+ 2 * air + offset;
  var el_pos      = $(el).offset();
  var el_pos_top  = el_pos.top - air - offset;

  var vport_height = $(window).height();
  var win_top      = $(window).scrollTop();

  //  alert("el_pos_top:"+el_pos_top+"  el_height:"+el_height+"win_top:"+win_top+"  vport_height:"+vport_height);

  var hidden = (el_pos_top + el_height) - (win_top + vport_height);

  if ( hidden > 0 ) // element not fully visible
      {
      var scroll;

      if(el_height > vport_height) scroll = el_pos_top;       // larger than viewport - scroll to top
      else                         scroll = win_top + hidden; // smaller than vieport - scroll minimally but fully into view

      $('html, body').animate({ scrollTop: (scroll) }, 200);
      }

}



/* **********************************************
     Begin main_script.js
********************************************** */


function onDeviceReady() {
  log('onDeviceReady');
  $(document).ready(function() {
    log('document ready');
    vpmobile.getUserLocation();
  });
}

$( window ).on( "navigate", function( event, data ) {

});

// map page
$('#map').on('pageinit', function() {

    log('#map pageinit 2');
    $('a.whole').on('click', function(e) {
        vpmobile.active_listing = $(this).find('.path').html();
        $.mobile.changePage("detail.html?path="+$(this).find('.path').html(), {'transition': 'slide'});
        e.stopPropagation();
        e.preventDefault();
      });
});

$( document ).delegate("#map", "pageinit", function() {
  log('#map pageinit');

  //vpmobile.bounds = new google.maps.LatLngBounds();
  //




});



$('#map').on('pageshow', function() {
  log('#map pageshow');

  vpmobile.initialize();

  vpmobile.loadNodes(vpmobile.loadMarkers);
});


// search page functionality
$('#search').on('pageinit', function() {
  log('#search pageinit');
  $.extend(  $.mobile , {
    ajaxEnabled: false
  });
  vpmobile.loadNodes(vpmobile.searchListings);
});

// pageinit of every page
$(document).on("pageinit", function(){
  log('pageinit');
  $.extend(  $.mobile , {
    ajaxEnabled: false
  });
});


$('#details').on('pageshow', function() {
  log('loading pageshow for details');
  vpmobile.loadNodes(vpmobile.getDetailedListing, getURLParameter('path'));
  $('.view_on_map').click(function(){

    $('#map-canvas').toggle();
    //google.maps.event.trigger(vpmobile.detailMap, 'resize');
    vpmobile.detailMap.setView([vpmobile.currentListing.lattitude, vpmobile.currentListing.longitude], 15);
    smart_scroll($('#map-canvas'));
  });
});


$('#main').on('pageshow', function() {
  log('#main pageshow');
  //$('#map_canvas').gmap('refresh');
});


// explore page, load the listings into the lists
$('#main').on('pageinit', function() {
  log('#main pageinit');

  vpmobile.loadNodes(vpmobile.loadListings);


});

// page link from the left menu
$('.leftmenu a[href=#map]').on('click', function(e){
  vpmobile.active_category = $(this)[0].dataset.link;
  vpmobile.loadMarkers();
  $.mobile.changePage($("#map")); //'index.html');//
  // infobox.close();
  $('#mypanel').panel( "close" );
  return false;
});

$('.event-linkChange').on('click', function(e) {
  vpmobile.active_category = $(this)[0].dataset.link;
  vpmobile.loadMarkers();
  $.mobile.changePage($("#map"));
})

// explore category list link back to view all on map
$("a.header-link").on("click", function (e) {
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
$('.list-item-link').on('click',function(){
  path = decodeURI(
    (RegExp(name + '=' + '(.+?)(&|$)').exec($(this).attr('href'))||[,null])[1]
  );
  vpmobile.active_listing = path;
  log('clicked on a listing link');
  log(path);
});


$("div.ui-collapsible").on("expand", function(e) {
  smart_scroll(e.target);
});


/* Phone gap bootstrap */

document.addEventListener("deviceready", onDeviceReady);

function log(str){
  console.log(str);
}

