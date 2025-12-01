define(['modules/jquery-mozu','modules/eventbus',"modules/api",'hyprlivecontext','underscore'],
function($,EventBus, Api, hyprlivecontext, _) {
	var AmazonPay = {
		merchantId : "",
		publicKeyId : "",
		//storeId: "",
		ledgerCurrency: "USD",
		checkoutLanguage: "en_US",
		buttonColor: "Gold",
		region: "us",
		environment: "production",
		isEnabled: false,
		isScriptLoaded: false,
		viewName:"amazon-checkout-v2",

		init:function(loadScript) {
			var paymentSettings = _.findWhere(hyprlivecontext.locals.siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PAYWITHAMAZONV2"}) ||
								_.findWhere(hyprlivecontext.locals.siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PayWithAmazonV2"});
			if (!paymentSettings || !paymentSettings.isEnabled) return;

			this.isEnabled = paymentSettings.isEnabled;
			this.environment = this.getValue(paymentSettings, "environment") || "production";
			this.region = this.getValue(paymentSettings, "awsRegion") || this.getValue(paymentSettings, "region") || "us";

			// New Amazon Pay v2 credentials
			this.merchantId = this.getValue(paymentSettings, "merchantId");
			this.publicKeyId = this.getValue(paymentSettings, "publicKeyId");
			//this.storeId = this.getValue(paymentSettings, "storeId");

			// Set ledger currency based on region
			//TODO get it from site setting?
			var currencyMappings = {"us": "USD", "uk": "GBP", "de": "EUR", "jp": "JPY"};
			this.ledgerCurrency = currencyMappings[this.region] || "USD";

			// Set checkout language based on region
			//TODO get it from site setting?
			var languageMappings = {"us": "en_US", "uk": "en_GB", "de": "de_DE", "jp": "ja_JP"};
			this.checkoutLanguage = languageMappings[this.region] || "en_US";

			if (this.merchantId && this.publicKeyId && loadScript) {
				var self = this;
				// New checkout.js URLs per region
				var regionScriptMappings = {
					"us": "https://static-na.payments-amazon.com/checkout.js",
					"uk": "https://static-eu.payments-amazon.com/checkout.js",
					"de": "https://static-eu.payments-amazon.com/checkout.js",
					"jp": "https://static-fe.payments-amazon.com/checkout.js"
				};

				var checkoutScriptUrl = regionScriptMappings[this.region] || regionScriptMappings.us;

				$.getScript(checkoutScriptUrl).done(function(script, textStatus){
					self.isScriptLoaded = true;
					EventBus.trigger("aws-script-loaded");
				}).fail(function(jqxhr, settings, exception) {
					window.console.error("Failed to load Amazon Pay checkout.js:", exception);
				});
			}
		},

		getValue: function(paymentSetting, key) {
			var value = _.findWhere(paymentSetting.credentials, {"apiName" : key});
			if (!value)
				return;
			return value.value;
		},

		/**
		 * Fetch signed checkout session payload from backend
		 */
		getCheckoutSessionConfig: function(cartOrOrderId, isCart) {
			var self = this;
			var apiUrl = "/amazonpay/v2/checkoutsession";
			cartOrOrderId = cartOrOrderId || "1234";

			return $.ajax({
				method: "POST",
				url: apiUrl,
				contentType: "application/json",
				data: JSON.stringify({
					cartOrOrderId: cartOrOrderId,
					isCart: isCart,
					returnUrl: self.getReturnUrl(cartOrOrderId, isCart)
				})
			}).then(function(response) {
				return response;
			}).fail(function(error) {
				window.console.error("Failed to get checkout session config:", error);
				throw error;
			});
		},

		/**
		 * Build the return URL where Amazon will redirect after checkout
		 */
		getReturnUrl: function(id, isCart) {
			var redirectUrl = hyprlivecontext.locals.pageContext.secureHost;
			var checkoutUrl = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled ? "/checkoutv2" : "/checkout";

			if (isCart) {
				redirectUrl += "/cart?cartId=" + id + "&isAwsCheckout=true&view=" + this.viewName;
			} else {
				redirectUrl += checkoutUrl + "/" + id + "?isAwsCheckout=true&view=" + this.viewName;
			}

			return redirectUrl;
		},

		/**
		 * Render Amazon Pay button using new checkout.js
		 */
		addCheckoutButton: function(id, isCart, isQuoteOrder) {
			var self = this;
			if (!self.isEnabled) return;

			// For quote orders, use different flow if needed
			if (isQuoteOrder) {
				// TODO: Implement quote order flow
				window.console.warn("Amazon Pay quote order flow not yet implemented in v2");
				return;
			}

			// Wait for script to load
			if (!self.isScriptLoaded) {
				EventBus.on("aws-script-loaded", function() {
					self.renderButton(id, isCart);
				});
			} else {
				self.renderButton(id, isCart);
			}
		},

		/**
		 * Render the Amazon Pay button
		 */
		renderButton: function(cartOrOrderId, isCart) {
			var self = this;

			// Get signed checkout session from backend
			self.getCheckoutSessionConfig(cartOrOrderId, isCart).then(function(sessionConfig) {

				if (!window.amazon || !window.amazon.Pay) {
					window.console.error("Amazon Pay SDK not loaded");
					return;
				}

				// Render the new Amazon Pay button
				window.amazon.Pay.renderButton('#AmazonPayV2Button', {
					merchantId: self.merchantId,
					publicKeyId: self.publicKeyId,
					ledgerCurrency: self.ledgerCurrency,
					checkoutLanguage: self.checkoutLanguage,
					productType: 'PayAndShip', // PayAndShip, PayOnly, or SignIn
					placement: isCart ? 'Cart' : 'Checkout',
					buttonColor: self.buttonColor,
					sandbox: self.environment === "sandbox",
					createCheckoutSessionConfig: {
						payloadJSON: sessionConfig.payloadJSON,
						signature: sessionConfig.signature,
						publicKeyId: self.publicKeyId,
						algorithm: 'AMZN-PAY-RSASSA-PSS-V2'
					}
				});

			}).fail(function(error) {
				window.console.error("Failed to render Amazon Pay button:", error);
			});
		}
	};

	return AmazonPay;
});
