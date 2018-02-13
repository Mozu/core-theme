define(['modules/api',
        'modules/backbone-mozu',
        'underscore',
        'modules/jquery-mozu',
        'hyprlivecontext',
        'hyprlive',
        'modules/modal-dialog',
        'modules/models-location'
      ], function (api, Backbone, _, $, HyprLiveContext, Hypr, modalDialog, LocationModels) {

    var MyStoreView =  Backbone.MozuView.extend({
      templateName: 'modules/common/my-store',
      init: function() {
        initMyStoreControls();
        initMyStoreHeader();
        initMyStoreHeader();
        initLocationPicker();
      }
    });

    var MyStoreModel = Backbone.Model.extend({});

    var _modal;
    var myStoreHeaderText = $('#mz-my-store-header-text');
    var changeMyStoreHeaderLink = $('#mz-my-store-header-change-store-link');

    function hideModal() {
      _modal.hide();
    }

    function showModal() {
      _modal.show();
    }

    // Deprecated
    // function showShoppingMyStore() {
    //   var storeName = getMyStore().locationName;
    //   $('#mz-shopping-my-store-btn').hide();
    //   $('#mz-shopping-my-store-btn-enabled').text('Shop my store - ' + storeName);
    //   $('#mz-shopping-my-store-btn-enabled').show();
    //   $('#mz-shop-my-store-btn').hide();
    //   $('#mz-change-my-store-container').css('display', 'flex');
    // }

    function setMyStore(data, applyFilter) {
      data = JSON.parse(data);
      $.cookie('my-store-code', data.locationCode);
      $.cookie('my-store-name', data.locationName);

      updateMyStoreHeader();
      hideModal();

      $.post('/location/set?code=' + data.locationCode);

      var newUrl = setParam(window.location.href, 'inStockLocation', data.locationCode);
      window.location.href = newUrl;
    }

    function setParam(uri, key, val) {
      return uri
        .replace(new RegExp("([?&]"+key+"(?=[=&#]|$)[^#&]*|(?=#|$))"), "&"+key+"="+encodeURIComponent(val))
        .replace(/^([^?&]+)&/, "$1?");
    }

    function getMyStore() {
      var myStoreName = $.cookie('my-store-name');
      var myStoreCode = $.cookie('my-store-code');

      if (myStoreName && myStoreCode) {
        return {
          locationName: myStoreName,
          locationCode: myStoreCode
        };
      }

      return null;
    }

    function isMyStore(location) {
      var myStoreCode = $.cookie('my-store-code');
      return (myStoreCode && myStoreCode === location.code);
    }

    function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function renderPickerBody(locations, origin) {
      var html = '';
      var outerContainer = $('<div>');
      var myStoreDiv;

      var destinations = [];

      locations.forEach(function(location) {
        var name = location.name;
        var address = location.address;
        var code = location.code;

        var locationContainer = $('<div>', {
          'class': 'mz-location-container',
          "style": "display:flex;flex-direction:column;"
        });

        destinations.push(address.address1 + ' ' + address.cityOrTown+', '+address.stateOrProvince+' '+address.postalOrZipCode);

        var containerStyle = "flex:1;display:flex;justify-content:flex-end;align-items:center";
        var locationSelectDiv = $('<div>', { "class": "location-select-option", "style": "display:flex" });
        var leftSideDiv = $('<div>', { "style": "flex:1" });
        var rightSideDiv = $('<div>', { "style": containerStyle });
        leftSideDiv.append('<h4 class="mz-my-store-name">'+name+'</h4>');

        leftSideDiv.append($('<div>'+address.address1+'</div>'));
        if (address.address2) {
          leftSideDiv.append($('<div>'+address.address2+'</div>'));
        }
        if (address.address3) {
          leftSideDiv.append($('<div>'+address.address3+'</div>'));
        }
        if (address.address4) {
          leftSideDiv.append($('<div>'+address.address4+'</div>'));
        }

        leftSideDiv.append($('<div>'+address.cityOrTown+', '+address.stateOrProvince+' '+address.postalOrZipCode+'</div>'));

        var seeMapToggle = $('<div>', {
          'class': 'mz-see-map-toggle'
        });

        seeMapToggle.text('Map');
        leftSideDiv.append(seeMapToggle);

        var buttonData = {
          locationCode: code,
          locationName: name
        };

        var $selectButton;

        if (isMyStore(location)) {
          $selectButton = $('<button>', {
            "type": "button",
            "class": "mz-button mz-my-store-select-button",
            "aria-hidden": "true",
            "mz-store-select-data": JSON.stringify(buttonData)
          });

          $selectButton.text(Hypr.getLabel('myStore'));
          var $locationPinImg = $('<img>', { 'src': '/resources/images/location-pin.png' });
          $selectButton.prepend($locationPinImg);
          myStoreDiv = locationContainer;
        } else {
          $selectButton = $("<button>", {
            "type": "button",
            "class": "mz-button mz-store-select-button",
            "aria-hidden": "true",
            "mz-store-select-data": JSON.stringify(buttonData)
          });

          $selectButton.text(Hypr.getLabel("selectStore"));
        }

        rightSideDiv.append($selectButton);
        locationSelectDiv.append(leftSideDiv);
        locationSelectDiv.append(rightSideDiv);

        var myStoreMapContainer = $('<div>', {
          'class': 'mz-my-store-map-container',
          'style': 'position: relative'
        });

        var myStoreMap = $('<div>', {
          'class': 'mz-my-store-map',
          'mz-data-address': address.cityOrTown+', ' + address.stateOrProvince + ' ' + address.postalOrZipCode
        });

        myStoreMapContainer.append(myStoreMap);

        locationContainer.append(locationSelectDiv);
        locationContainer.append(myStoreMapContainer);

        if (!isMyStore(location)) {
          outerContainer.append(locationContainer);
        }
      });

      if (myStoreDiv) {
        outerContainer.prepend(myStoreDiv);
      }

      function distanceCallback(response, status) {
        // See Parsing the Results for
        // the basics of a callback function.
        if (status === 'OK') {
          outerContainer.find('.mz-my-store-name').each(function(idx) {
            var distance = response.rows[0].elements[idx].distance.text;
            var distanceDiv = $('<div>', {
              'class': 'mz-my-store-distance',
              'text': distance
            });

            distanceDiv.insertAfter(this);
          });

          _modal.setBody(outerContainer.prop('innerHTML'));
        } else {
          _modal.setBody(outerContainer.prop('innerHTML'));
        }
      }

      if (origin) {
        var service = new google.maps.DistanceMatrixService();

        service.getDistanceMatrix({
          origins: [origin],
          destinations: destinations,
          travelMode: 'DRIVING',
          // transitOptions: TransitOptions,
          // drivingOptions: DrivingOptions,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
          avoidHighways: false
        }, distanceCallback);
      } else {
        _modal.setBody(outerContainer.prop('innerHTML'));
      }
    }

    function setZipcodeError(error) {
      var zipcodeErrorEl = $('#mz-my-store-zipcode-error');

      if (error) {
        zipcodeErrorEl.text('Zipcode cannot be empty');
        zipcodeErrorEl.show();
      } else {
        zipcodeErrorEl.text('');
        zipcodeErrorEl.hide();
      }
    }

    /**
     * @param {integer} radius - radius (in miles) to convert
     * @returns {float} - radius (converted to meters)
     */
    function getRadiusInMeters(radius) {
      return 1.7 * radius * 1000.0;
    }

    function searchLocations() {
      var searchBtn = $('#mz-my-store-search-btn');
      var zipcode = $('#mz-my-store-zipcode-input').val();
      var radius = $('#mz-my-store-radius-select').val();

      if (zipcode === '') {
        return setZipcodeError(true);
      } else {
        setZipcodeError(false);
      }

      searchBtn.attr('disabled', 'disabled');
      setModalLoading();

      var locationsCollection = new LocationModels.LocationCollection();

      // Location service expects radius in meters 1mi = 1.7km
      var meters = getRadiusInMeters(radius);

      // old: locationsCollection.apiGet({ nearZipcode: zipcode, nearZipcodeRadius: meters })
      locationsCollection.apiGetByZipcode({ zipcode: zipcode, radius: meters }).then(function(collection) {
        if (collection.length === 0) {
          _modal.setBody(Hypr.getLabel('noNearbyLocations'));
        } else {
          renderPickerBody(collection.data.items, zipcode);
        }
        searchBtn.removeAttr('disabled');
      }, function(err) {
        // error fetching locations by zipcode and radius
        _modal.setBody(Hypr.getLabel('noNearbyLocations'));
        searchBtn.removeAttr('disabled');
      });
    }

    function initLocations() {
      if (window.isSecureContext && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          getLocations(pos);
        }, function(err) {
          if (err.code !== err.PERMISSION_DENIED) {
            getLocations();
          }
        });
      } else {
          getLocations();
      }
    }

    function setModalLoading() {
      var containerStyle = 'display:flex;justify-content:center;align-items:center;height:100%;width:100%;';
      var container = $('<div>', { style: containerStyle });
      var loadingDiv = $('<img>', { src: '/resources/images/button-loading.gif' });
      container.append(loadingDiv);
      _modal.setBody(container.prop('outerHTML'));
    }

    function getLocations(location) {
      var locationsCollection = new LocationModels.LocationCollection();

      if (location) {
        // todo: get locations by lat/long if geolocation is enabled in the browser
        locationsCollection.apiGetByLatLong({ location: location }).then(function(collection) {
        }, function(err) {
          // error
        });
      } else {
        setZipcodeError(false);
        showModal();
        setModalLoading();

        locationsCollection.apiGet().then(function(collection) {
          if (collection.length === 0) {
            _modal.setBody(Hypr.getLabel('noNearbyLocations'));
          } else {
            renderPickerBody(collection.data.items);
          }
        }, function(err) {
          // error
        });
      }
    }

    function initLocationPicker() {
      var options = {
        elementId: 'mz-my-store-selector',
        body: '',
        hasXButton: true,
        width: "400px",
        scroll: 'auto',
        bodyHeight: "600px",
        backdrop: true
      };

      // Attach click handlers to select store buttons
      $('#mz-my-store-selector').on('click', '.mz-store-select-button', function() {
        var storeData = $(this).attr('mz-store-select-data');
        setMyStore(storeData);
      });

      $('#mz-my-store-selector').on('click', '.mz-my-store-select-button', function() {
        var storeData = $(this).attr('mz-store-select-data');
        setMyStore(storeData);
      });

      $('#mz-my-store-search-btn').click(function() {
        searchLocations();
      });

      $('#mz-shop-my-store-btn').click(function() {
        initLocations();
      });

      $('#mz-change-my-store-container').click(function() {
        initLocations();
      });

      $('#mz-my-store-selector').on('click', '.mz-see-map-toggle', function() {
        var geocoder = new google.maps.Geocoder();

        var locationContainer = $(this).closest('.mz-location-container');
        var mapContainer = locationContainer.find('.mz-my-store-map-container');
        var mapEl = locationContainer.find('.mz-my-store-map');
        var address = mapEl[0].getAttribute('mz-data-address');

        var containerStyle = 'position:absolute;display:flex;justify-content:center;align-items:center;top:0;bottom:0;left:0;right:0;z-index:9999';
        var loadingContainer = $('<div>', { style: containerStyle });
        var loadingDiv = $('<img>', { src: '/resources/images/button-loading.gif' });
        loadingContainer.append(loadingDiv);
        mapContainer.append(loadingContainer);

        mapContainer.css('display', 'flex');

        var map = new google.maps.Map(mapEl[0], {
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            rotateControl: false,
            scaleControl: false
        });

        geocoder.geocode({ 'address': address }, function (results, status) {
          if (status == 'OK') {
            map.setCenter(results[0].geometry.location);

            var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
            });

            loadingContainer.remove();
          } else {
            console.log('Geocode was not successful for the following reason: ' + status);
          }
        });
      });

      $(document).on('submit','#mz-store-search-form', function() {
        searchLocations();
        return false;
      });

      _modal = modalDialog.init(options);
    }

    function initMyStoreControls() {
      var myStore = getMyStore();

      if (myStore) {
        var btn = null;
        var inStockLocation = getParameterByName('inStockLocation');

        if (inStockLocation && inStockLocation === myStore.locationCode) {
          btn = $('#mz-shopping-my-store-btn-enabled').show();
        } else {
          btn = $('#mz-shopping-my-store-btn').show();
        }

        btn.text('Shop my store - ' + myStore.locationName);
        btn.show();
        $('#mz-change-my-store-container').css('display', 'flex');
      } else {
        $('#mz-shop-my-store-btn').show();
      }
    }

    function initMyStoreHeader() {
      var myStore = getMyStore();

      if (myStore) {
        myStoreHeaderText.text(myStore.locationName);
        changeMyStoreHeaderLink.text('Change Store');
      } else {
        changeMyStoreHeaderLink.text('Find Store');
      }

      changeMyStoreHeaderLink.click(function() {
        initLocations();
      });

      $('#mz-my-store-header').show();
    }

    function updateMyStoreHeader() {
      var myStore = getMyStore();
      myStoreHeaderText.text(myStore.locationName);
      changeMyStoreHeaderLink.text('Change Store');
    }

    $(document).ready(function() {
      initMyStoreControls();
      initMyStoreHeader();
      initMyStoreHeader();
      initLocationPicker();

      var myStoreView = new MyStoreView({
        el: $('#mz-my-store-container'),
        model: new MyStoreModel()
      });

      window.myStoreView = myStoreView;
    });
});
