var vpmobile = {
  getUserLocation: function() {
    // get the user's GPS location from an HTML5 browser
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(vpmobile.updateUserLocation);
    }
  },
  updateUserLocation: function(position) {
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

    vpmobile.map.fitBounds(vpmobile.bounds);

    setTimeout(function(){vpmobile.getUserLocation()}, 60000);
  },
  initialize: function() {
    // the bounds to control the map by

    //vpmobile.hasbeenpaned = false;

    var mapOptions = {
      zoom: 16,
      center: new google.maps.LatLng(51.041499,-114.063690),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
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

    // initialize the geolocation feature
    //vpmobile.getUserLocation();
  },
  addMarker: function(location) {
    marker = new google.maps.Marker({
      position: location,
      map: vpmobile.map
    });

    google.maps.event.addListener(marker, 'click', function() {
      console.log('clieck');
    });
    vpmobile.markers.push(marker);
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
    //console.log(searchq);
    if (searchq !== "null") {
      //$('#search-input-page').val( decodeURIComponent(searchq).replace(/\+/g, ' '));
      $('.ui-input-search input').val(decodeURIComponent(getURLParameter('q')).replace(/\+/g, ' '));
      $('.ui-input-search input').trigger('change');
    }
    $("#search-list").listview("refresh");
  },

  loadNodes: function(callbackfunction, optional_argument) {

    if (vpmobile.nodes === undefined || vpmobile.nodes.length < 1){
        $.getJSON( 'export.json', function(data) {
          console.log('getting data!');
          vpmobile.nodes = data.nodes;
          callbackfunction(optional_argument);
          //console.log(vpmobile.nodes);
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
      console.log(vpmobile.active_category);
      var thedata = vpmobile.nodes.filter(function (el) {
        //console.log(el);
        return el.listing.term == vpmobile.active_category.replace("''","&#039;");
      });
    } else {
      var thedata = vpmobile.nodes;
    }

    // clear current markers
    //console.log('clearing markers');
    //vpmobile.markers = [];
    //vpmobile.setAllMap(null);

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
          scaledSize: new google.maps.Size(45, 60)
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
        //console.log(marker.listing);
        //console.log($('#infobox h4').html());
        /*$('#infobox h4').html(marker.listing.title);
        $('#infobox').attr('class', marker.listing.term);
        $('#infobox phone').html(marker.listing.phone);
        $('#infobox .path').html(marker.listing.path);*/
        //console.log($('#infobox h4').html());

        infobox.setContent('<div id="infobox" class="'+marker.listing.term+'">'+
            '<h4>'+marker.listing.title+'</h4>'+
            '<phone><a href="tel://'+marker.listing.phone+'">'+marker.listing.phone+'</a></phone>'+
            '<p class="path">'+marker.listing.path+'</p>'+
        '</div>');
        infobox.open(vpmobile.map, this);

      });
      //vpmobile.markers.push(markerobj);
      oldCenter = vpmobile.map.getCenter();
      google.maps.event.trigger(vpmobile.map, 'resize');
      vpmobile.map.setCenter(oldCenter);


        /*$('#map_canvas').gmap('addMarker', {
          'position': new google.maps.LatLng(marker.listing.latitude, marker.listing.longitude),
          'icon' : markerimage[i]
        }).click(function() {
          //$('#map_canvas').gmap('openInfoWindow', { 'content': marker.listing.title }, this);
          //console.log(infobox.content);

          // set the marker content
          $('#infobox h4').html(marker.listing.title);
          $('#infobox phone').html(marker.listing.phone);
          $('#infobox .path').html(marker.listing.path);
          infobox.open(map, this);

          //console.log(infobox);

        });*/
    });

    //vpmobile.map.fitBounds(vpmobile.bounds);
  },


}

function onDeviceReady() {
  console.log('onDeviceReady');
  $(document).ready(function() {
    console.log('document ready');

    // map page
    $('#map').live('pageinit', function() {
      console.log('#map pageinit');
      $('#infobox').live('tap', function(e) {
        //console.log($(this).find('.path').html());
        vpmobile.active_listing = $(this).find('.path').html();
        $.mobile.changePage("detail.html?path="+$(this).find('.path').html(), {reloadPage:true});
        return false;
      });
      vpmobile.bounds = new google.maps.LatLngBounds();
      vpmobile.initialize();
    });


    $('#map').live('pageshow', function() {
      console.log('#map pageshow');
      //$('#map_canvas').gmap('refresh');
      vpmobile.loadNodes(vpmobile.loadMarkers);
      //$.mobile.showPageLoadingMsg();
      //$.mobile.hidePageLoadingMsg();
    });


    // search page functionality
    $('#search').live('pageinit', function() {
      console.log('#search pageinit');
      vpmobile.loadNodes(vpmobile.searchListings);
    });


    $(document).live("pageinit", function(){
      $.extend(  $.mobile , {
        ajaxEnabled: false
      });
    });


    $('#details').live('pageinit', function() {
      vpmobile.loadNodes(vpmobile.getDetailedListing, getURLParameter('path'));
      $('.view_on_map').click(function(){
        console.log('clicked');
        $('#map-canvas').toggle();
        google.maps.event.trigger(vpmobile.detailMap, 'resize');
        vpmobile.detailMap.setCenter(new google.maps.LatLng(vpmobile.currentListing.latitude, vpmobile.currentListing.longitude));
        smart_scroll($('#map-canvas'));
      });
    });

    // explore page, load the listings into the lists
    $('#main').live('pageinit', function() {
      vpmobile.loadNodes(vpmobile.loadListings);
      $("a.header-link").live("click", function (e) {

        console.log($(this)[0].dataset.link);

        vpmobile.active_category = $(this)[0].dataset.link;
        $.mobile.changePage('index.html', {reloadPage:true});//
        return false;

      });
    });

  });
}

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}
$(function() {
});

/* Phone gap bootstrap */

document.addEventListener("deviceready", onDeviceReady);
