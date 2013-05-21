vpmobile.loadListings = function() {

    $.each( vpmobile.nodes, function(i, marker) {
      //console.log(i);
      //console.log(marker.listing);
      listing_html = '<li data-icon="false"><a href="detail.html?path='+ marker.listing.path +'" class="list-item-link"><h2>'+ marker.listing.title +'</h2><p class="phone">'+ marker.listing.phone +'</p></a></li>';

      switch(marker.listing.term)
      {
      case 'Cafe and Dining':
        $('#list1').append(listing_html);
        break;
      case 'Pubs &#039;n Clubs':
        $('#list2').append(listing_html);
        break;
      case 'Shop':
        $('#list3').append(listing_html);
        break;
      case 'Stay &#039;n Play':
        $('#list4').append(listing_html);
        break;
      case 'Treats':
        $('#list5').append(listing_html);
        break;
      case 'Events':
        $('#list6').append(listing_html);
        break;
      }

    });
    $("#list1").listview("refresh");
    $("#list2").listview("refresh");
    $("#list3").listview("refresh");
    $("#list4").listview("refresh");
    $("#list5").listview("refresh");
    $("#list6").listview("refresh");
  };

vpmobile.getDetailedListing = function(path) {

    //console.log(path);
    if (path == 'null') {
      //console.log(vpmobile.active_listing);
      path = vpmobile.active_listing;
    }
    var thedata = vpmobile.nodes.filter(function (el) {
      //console.log(el);
      return el.listing.path == path;
    });
    //console.log(vpmobile.nodes);
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

    vpmobile.initializeMap(vpmobile.currentListing.latitude, vpmobile.currentListing.longitude, vpmobile.currentListing.term);
    console.log(thedata);

};

vpmobile.initializeMap = function (lat, long, term) {
  var mapOptions = {
    center: new google.maps.LatLng(lat, long),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true
  };

  var map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);
  switch(term)
  {
  case 'Cafe and Dining':
    markerimage = {
      url:'images/map-pin-cafe@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  case 'Pubs &#039;n Clubs':
    markerimage = {
      url:'images/map-pin-pubs@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  case 'Shop':
    markerimage = {
      url:'images/map-pin-shops@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  case 'Stay &#039;n Play':
    markerimage = {
      url:'images/map-pin-stay@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  case 'Treats':
    markerimage = {
      url:'images/map-pin-treats@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  case 'Events':
    markerimage = {
      url:'images/map-pin-special@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  }

  markerobj = new google.maps.Marker({
    position: new google.maps.LatLng(lat, long),
    map: map,
    'icon' : markerimage
  });

  vpmobile.detailMap = map;

  $('#map-canvas').toggle();
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
