require([
  "underscore",
  "modules/jquery-mozu",
  "hyprlive",
  "modules/modal-dialog",
  "modules/backbone-mozu",
  "modules/api"
], function(_, $, Hypr, modelDialog, Backbone, api) {
  //set base url
  var baseURL = window.location.origin + "/borderFree/";
  //Welcome mat widget template
  var WelcomeMatWidgetView = Backbone.MozuView.extend({
    templateName: "modules/borderFree/welcome-mat-widget",
    additionalEvents: {
      "change #country-select": "setCountry",
      "click #btnCountrySelect": "openWelcomeMatWidget"
    },
    initialize: function() {},
    render: function() {
      Backbone.MozuView.prototype.render.apply(this);
      return this;
    },
    openWelcomeMatWidget: function() {
      $("#countryModal").modal("show");
    },
    getCountries: function(e) {
      // e.prevntDefault();
      var self = this;
      var hasCountries = JSON.parse(window.sessionStorage.getItem("countries")),
        hasCurrencies = JSON.parse(window.sessionStorage.getItem("currencies"));
      if (hasCountries !== null && hasCurrencies !== null) {
        var appConfig = $("[data-mz-welcome-mat-request]").data(
            "mzWelcomeMatRequest"
          ),
          selectedCurrency = $.cookie("currency_code_override"),
          selectedCountry = $.cookie("selected_country"),
          selectedCountryCode = $.cookie("currency_country_code");
        if (_.isUndefined($.cookie("selected_country"))) selectedCountry = "";
        if (_.isUndefined($.cookie("currency_code_override")))
          selectedCurrency = appConfig.currency;
        self.model.set({
          country: hasCountries,
          selectedCountry: selectedCountry,
          selectedCurrency: selectedCurrency,
          selectedCountryCode: selectedCountryCode,
          currency: hasCurrencies,
          defaultCountry: appConfig.country,
          appConfig: appConfig
        });
        window.view.render();
        if (self.$el.find(".welcome-mat-wrapper").hasClass("hidden")) {
          self.$el.find(".welcome-mat-wrapper").removeClass("hidden");
        }
      } else {
        api.request("GET", baseURL + "getBorderFreeCountries").then(
          function(resp) {
            //Check if there is some resp
            if (!_.isUndefined(resp.message)) {
              //check if its success and has resp data
              if (
                !_.isUndefined(resp.message.payload.getLocalizationDataResponse)
              ) {
                var rawRespData =
                  resp.message.payload.getLocalizationDataResponse;
                //Filter responseData and make countriesData
                var borderFreeCountries = _.map(
                  _.where(rawRespData.countries.country, {}),
                  function(item) {
                    return {
                      name: item.name,
                      currencyCode: item.currencyCode,
                      locale: item.locale,
                      languageCode: item.languageCode,
                      countryCode: item.$.code,
                      isShipToEnabled: item.isShipToEnabled
                    };
                  }
                );
                borderFreeCountries = _.sortBy(borderFreeCountries, 'name' );
                //Filter responseData and make currenciesData
                var borderFreeCurrencies = _.map(
                  _.where(rawRespData.currencies.currency, {}),
                  function(item) {
                    return {
                      name: item.name,
                      symbol: item.$.code,
                      isCurrencyEnabled: item.isCurrencyEnabled
                    };
                  }
                );
                borderFreeCurrencies = _.sortBy(borderFreeCurrencies, 'name' );
                //save countries in localStorage
                self.setSessionStorage("countries", borderFreeCountries);
                //save currencies
                self.setSessionStorage("currencies", borderFreeCurrencies);

                //call getLocaleByIpAddress to set default country and currency
                self.getLocaleByIpAddress(
                  borderFreeCountries,
                  borderFreeCurrencies
                );
              }
            }
          },
          function(e) {}
        );
      }
    },
    setSessionStorage: function(name, data) {
      window.sessionStorage.setItem(name, JSON.stringify(data));
    },
    saveCookie: function(e) {
      var btnSave = $(e.currentTarget);
      btnSave.addClass("is-loading");
      var self = this;
      var selectedCountry = self.$el.find("#country-select"),
        selectedCurrency = self.$el.find("#currency-select"),
        appConfig = $("[data-mz-welcome-mat-request]").data(
          "mzWelcomeMatRequest"
        );
      var postData = {
        currencyCode: appConfig.currency,
        toCurrencyCode: selectedCurrency.val()
      };
      api
        .request("POST", baseURL + "getBorderFreeExchangeRates", postData)
        .then(
          function(resp) {
            var selectedCountryName = $(selectedCountry).find(
              "option:selected"
            );
            var exchangeRates = (!_.isEmpty(resp) && typeof(resp) === "string") ? JSON.parse(resp) : resp;
            self.setCookies(
              "currency_code_override",
              selectedCurrency.val(),
              1
            );
            self.setCookies(
              "selected_country",
              $.trim(selectedCountryName.text()),
              1
            );
            self.setCookies(
              "currency_country_code",
              selectedCountryName.attr("data-code"),
              1
            );
            self.setCookies("currency_QuoteId", exchangeRates.referenceData, 1);
            window.location.reload();
          },
          function(e) {}
        );
    },
    setCookies: function(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      var expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    setCountry: function(e) {
      var self = this,
        currentTarget = $(e.currentTarget),
        currencySelect = self.$el.find("#currency-select");
      //Update currency value with selected country
      currencySelect.val(currentTarget.val());

      //check if USA is selected
      if (currentTarget.find("option:selected").attr("data-code") == "US") {
        currencySelect.prop("disabled", true);
      } else {
        currencySelect.prop("disabled", false);
      }
    },
    getLocaleByIpAddress: function(borderFreeCountries, borderFreeCurrencies) {
      var self = this,
        pageContext = require.mozuData("pagecontext"),
        postData = {
          buyerIpAddress: pageContext.ipAddress
        };
      api.request("POST", baseURL + "getGeoLocaleByIpAddress", postData).then(
        function(resp) {
          if (
            resp &&
            resp.message &&
            resp.message.payload &&
            resp.message.payload.getLocalizationParamsResponse
          ) {
            var rawRespData =
              resp.message.payload.getLocalizationParamsResponse;
            //Filter responseData and make countriesData
            var defaultCountryData = {
              countryName: rawRespData.country.name,
              countryCodeName: rawRespData.country.$.code,
              currencyCode: rawRespData.country.currencyCode,
              locale: rawRespData.country.locale,
              currencyQuoteId: rawRespData.fxRate.quote.$.id
            };
            //set IP Address base data into cookies and reload page
            self.setCookies(
              "currency_code_override",
              defaultCountryData.currencyCode,
              1
            );
            self.setCookies(
              "selected_country",
              defaultCountryData.countryName,
              1
            );
            self.setCookies(
              "currency_country_code",
              defaultCountryData.countryCodeName,
              1
            );
            self.setCookies(
              "currency_QuoteId",
              defaultCountryData.currencyQuoteId,
              1
            );
            //reload the page to reflect the currency exchange rates
            window.location.reload();
          } else {
            var appConfig = $("[data-mz-welcome-mat-request]").data(
                "mzWelcomeMatRequest"
              );
        
            self.model.set({
              country: borderFreeCountries,
              selectedCountry: '',
              selectedCurrency: appConfig.currency,
              selectedCountryCode: appConfig.country,
              currency: borderFreeCurrencies,
              defaultCountry: appConfig.country
            });
            window.view.render();
            if (self.$el.find(".welcome-mat-wrapper").hasClass("hidden")) {
              self.$el.find(".welcome-mat-wrapper").removeClass("hidden");
            }
          }
        },
        function(e) {
          
        }
      );
    }
  });

  $(document).ready(function() {
    var welcomeMatViewModel = Backbone.MozuModel.extend();
    var welcomeMatWidgetModel = new welcomeMatViewModel();
    var welcomeMatWidgetView = (window.view = new WelcomeMatWidgetView({
      el: $(".welcome-mat-widget"),
      model: welcomeMatWidgetModel
    }));
    welcomeMatWidgetView.getCountries();
  });
});
