define(['modules/api',
        'modules/backbone-mozu',
        'underscore',
        'modules/jquery-mozu',
        'hyprlivecontext',
        'hyprlive',
        'modules/modal-dialog',
        'modules/models-location'
      ], function (api, Backbone, _, $, HyprLiveContext, Hypr, modalDialog, LocationModels) {

    var _modal;
    var shopMyStoreBtn = $('#mz-shop-my-store-btn');
    var shoppingMyStoreBtn = $('#mz-shopping-my-store-btn');
    var shoppingMyStoreBtnEnabled = $('#mz-shopping-my-store-btn-enabled');
    var changeMyStoreContainer = $('#mz-change-my-store-container');
    var myStoreHeaderText = $('#mz-my-store-header-text');
    var changeMyStoreHeaderLink = $('#mz-my-store-header-change-store-link');

    function hideModal() {
      _modal.hide();
    }

    function showModal() {
      _modal.show();
    }

    function filterMyStore() {
      // todo: (after tying backbone model to view)
    }

    function showShoppingMyStore() {
      var storeName = getMyStore().locationName;
      shoppingMyStoreBtn.hide();
      shoppingMyStoreBtnEnabled.text('Shop my store - ' + storeName);
      shoppingMyStoreBtnEnabled.show();
      shopMyStoreBtn.hide();
      changeMyStoreContainer.css('display', 'flex');
    }

    function setMyStore(data, applyFilter) {
      data = JSON.parse(data);
      $.cookie('my-store-code', data.locationCode);
      $.cookie('my-store-name', data.locationName);

      showShoppingMyStore();
      updateMyStoreHeader();
      hideModal();

      $.post('/location/set?code=' + data.locationCode);

      if (applyFilter) {
        // todo: apply filter to products
      }
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

    function renderPickerBody(locations) {
      var html = '';
      var myStoreDiv;

      locations.forEach(function(location) {
        var name = location.name;
        var address = location.address;
        var code = location.code;

        var containerStyle = "flex:1;display:flex;justify-content:flex-end;align-items:center";
        var locationSelectDiv = $('<div>', { "class": "location-select-option", "style": "display:flex" });
        var leftSideDiv = $('<div>', { "style": "flex:1" });
        var rightSideDiv = $('<div>', { "style": containerStyle });
        leftSideDiv.append('<h4 style="margin: 6.25px 0 6.25px">'+name+'</h4>');

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
          myStoreDiv = locationSelectDiv;
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

        if (!isMyStore(location)) {
          html += locationSelectDiv.prop('outerHTML');
        }
      });

       if (myStoreDiv) {
        html = myStoreDiv.prop('outerHTML') + html;
       }

      _modal.setBody(html);
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
          renderPickerBody(collection.data.items);
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

      shopMyStoreBtn.click(function() {
        initLocations();
      });

      changeMyStoreContainer.click(function() {
        initLocations();
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
        changeMyStoreContainer.css('display', 'flex');
      } else {
        shopMyStoreBtn.show();
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
    });
});
