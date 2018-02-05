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

    var myStoreEnabled = false;
    var shopMyStoreBtn = $('#mz-shop-my-store-btn');
    var shoppingMyStoreBtn = $('#mz-shopping-my-store-btn');
    var changeMyStoreContainer = $('#mz-change-my-store-container');

    function setMyStoreEnabled() {

    }

    function getMyStoreEnabled() {

    }

    function setMyStore(data) {
      data = JSON.parse(data);
      sessionStorage.setItem('myStoreName', data.locationName);
      sessionStorage.setItem('myStoreCode', data.locationCode);

      // todo: only if logged in
      localStorage.setItem('myStoreName', data.locationName);
      localStorage.setItem('myStoreCode', data.locationCode);

      shoppingMyStoreBtn.text('Shop my store - ' + data.locationName);
      shopMyStoreBtn.hide();
      shoppingMyStoreBtn.show();
      changeMyStoreContainer.css('display', 'flex');

      // todo: load new products with my store filter added
      toggleMyStore();
      showMyStoreHeader();
      _modal.hide();
    }

    function isMyStore(location) {
      var myStoreCode = sessionStorage.getItem('myStoreCode');

      if (myStoreCode && myStoreCode === location.code) {
        return true;
      }

      return false;
    }

    function getMyStore() {
      var myStoreName = sessionStorage.getItem('myStoreName');
      var myStoreCode = sessionStorage.getItem('myStoreCode');

      if (myStoreName && myStoreCode) {
        return {
          locationName: myStoreName,
          locationCode: myStoreCode
        }
      }

      var isLoggedIn = document.getElementById('mz-logged-in-notice') !== null;

      if (isLoggedIn) {
        if (localStorage.getItem('myStoreName')) {
          myStoreName = localStorage.getItem('myStoreName');
          myStoreCode = localStorage.getItem('myStoreCode');

          if (myStoreName && myStoreCode) {
            sessionStorage.setItem('myStoreName', myStoreName);
            sessionStorage.setItem('myStoreCode', myStoreCode);

            return {
              locationName: myStoreName,
              locationCode: myStoreCode
            }
          }
        } else {
          return null;
        }
      }

      return null;
    }

    function toggleMyStore() {
      if (myStoreEnabled) {
        // display products without filters
        shoppingMyStoreBtn.removeClass('mz-shopping-my-store-enabled');
      } else {
        // display products with my store filtered
        shoppingMyStoreBtn.addClass('mz-shopping-my-store-enabled');
      }

      myStoreEnabled = !myStoreEnabled;

      // todo: filter/unfilter on my store
    }

    function renderPickerBody(locations) {
      var html = "";

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
          $selectButton = $("<button>", {"type": "button", "class": "mz-button mz-my-store-select-button", "aria-hidden": "true", "mz-store-select-data": JSON.stringify(buttonData) });
          $selectButton.text(Hypr.getLabel('myStore'));
          var $locationPinImg = $('<img>', { 'src': '/resources/images/location-pin.png' });
          $selectButton.prepend($locationPinImg);
        } else {
          $selectButton = $("<button>", {"type": "button", "class": "mz-button mz-store-select-button", "aria-hidden": "true", "mz-store-select-data": JSON.stringify(buttonData) });
          $selectButton.text(Hypr.getLabel("selectStore"));
        }

        rightSideDiv.append($selectButton);
        locationSelectDiv.append(leftSideDiv);
        locationSelectDiv.append(rightSideDiv);
        html += locationSelectDiv.prop('outerHTML');
      });

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

      // todo: search locations using zipcode and radius filter
      locationsCollection.apiGet().then(function(collection) {
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

    function initializeLocations() {
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
        locationsCollection.apiGetByLatLong({ location: location }).then(function(collection) {
          // todo:
        }, function(err) {
          // error
        });
      } else {
        setZipcodeError(false);
        _modal.show();
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

    function initializeLocationPicker() {
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
        // todo: handle clicking my store button
      });

      $('#mz-my-store-search-btn').click(function() {
        searchLocations();
      });

      _modal = modalDialog.init(options);

      shopMyStoreBtn.click(function() {
        initializeLocations();
      });

      changeMyStoreContainer.click(function() {
        initializeLocations();
      });

      shoppingMyStoreBtn.click(function() {
        toggleMyStore();
      });

      $(document).on('submit','#mz-store-search-form', function() {
        searchLocations();
        return false;
      });
    }

    function showMyStoreHeader() {
      var myStore = getMyStore();
      var loggedInContainer = document.getElementById('mz-logged-in-notice');

      if (!loggedInContainer) {
        return;
      }

      var myStoreHeaderText = $('#mz-my-store-header-text');
      var changeMyStoreHeaderLink = $('#mz-my-store-header-change-store-link');
      var searchbox = $('#searchbox');

      if (myStore && myStore.locationName) {
        myStoreHeaderText.text(myStore.locationName);
        changeMyStoreHeaderLink.text('Change Store');
        searchbox.css('top', '80px');
      } else {
        changeMyStoreHeaderLink.text('Find Store');
        searchbox.css('top', '65px');
      }

      changeMyStoreHeaderLink.click(function() {
        initializeLocations();
      });

      $('#mz-my-store-header').show();
    }

    $(document).ready(function() {
      showMyStoreHeader();
      var myStore = getMyStore();

      if (myStore) {
        shoppingMyStoreBtn.addClass('mz-shopping-my-store-enabled');
        shoppingMyStoreBtn.text('Shop my store - ' + myStore.locationName);
        shoppingMyStoreBtn.show();
        changeMyStoreContainer.css('display', 'flex');
        myStoreEnabled = true;
      } else {
        shopMyStoreBtn.show();
      }

      initializeLocationPicker();
    });
});
