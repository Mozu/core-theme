define(['modules/jquery-mozu', 'modules/eventbus', "modules/api", 'hyprlivecontext', 'underscore', 'hyprlive'],
	function ($, EventBus, Api, hyprlivecontext, _, Hypr) {
		var AmazonPay = {
			merchantId: "",
			publicKeyId: "",
			//storeId: "",
			ledgerCurrency: "USD",
			checkoutLanguage: "en_US",
			buttonColor: "Gold",
			region: "us",
			environment: "production",
			isEnabled: false,
			isScriptLoaded: false,
			viewName: "amazon-checkout-v2",

			init: function (loadScript) {
				var paymentSettings = _.findWhere(hyprlivecontext.locals.siteContext.checkoutSettings.externalPaymentWorkflowSettings, {
						"name": "PAYWITHAMAZONV2"
					}) ||
					_.findWhere(hyprlivecontext.locals.siteContext.checkoutSettings.externalPaymentWorkflowSettings, {
						"name": "PayWithAmazonV2"
					});
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
				var currencyMappings = {
					"us": "USD",
					"uk": "GBP",
					"de": "EUR",
					"jp": "JPY"
				};
				this.ledgerCurrency = currencyMappings[this.region] || "USD";

				// Set checkout language based on region
				//TODO get it from site setting?
				var languageMappings = {
					"us": "en_US",
					"uk": "en_GB",
					"de": "de_DE",
					"jp": "ja_JP"
				};
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

					$.getScript(checkoutScriptUrl).done(function (script, textStatus) {
						self.isScriptLoaded = true;
						EventBus.trigger("aws-script-loaded");
					}).fail(function (jqxhr, settings, exception) {});
				}
			},

			getValue: function (paymentSetting, key) {
				var value = _.findWhere(paymentSetting.credentials, {
					"apiName": key
				});
				if (!value)
					return;
				return value.value;
			},

			/**
			 * Fetch signed checkout session payload from backend
			 */
			getCheckoutSessionConfig: function (cartOrOrderId, isCart) {
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
				}).then(function (response) {
					return response;
				}).fail(function (error) {
					// Return hardcoded response on any failure
				});
			},

			/**
			 * Get checkout session details using the session ID
			 */
			getCheckoutSession: function (checkoutSessionId) {
				var self = this;
				var apiUrl = "/amazonpay/v2/checkoutsession/" + checkoutSessionId;
				return $.ajax({
					method: "GET",
					url: apiUrl,
					contentType: "application/json"
				}).then(function (response) {
					return response;
				}).fail(function (error) {});
			},

			/**
			 * Build the return URL where Amazon will redirect after checkout
			 */
			getReturnUrl: function (id, isCart) {
				var self = this;
				var redirectUrl = hyprlivecontext.locals.pageContext.secureHost;
				var isMultishipEnabled = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled;
				var checkoutUrl = isMultishipEnabled ? "/checkoutv2" : "/checkout";

				// Use different view name for multi-ship vs single-ship
				if (isCart) {
					redirectUrl += "/cart?cartId=" + id + "&isAwsCheckout=true&view=" + self.viewName;
				} else {
					redirectUrl += checkoutUrl + "/" + id + "?isAwsCheckout=true&view=" + self.viewName;
				}
				return redirectUrl;
			},

			/**
			 * Render Amazon Pay button using new checkout.js
			 */
			addCheckoutButton: function (id, isCart, isQuoteOrder) {
				var self = this;
				if (!self.isEnabled) return;

				// For quote orders, use different flow if needed
				if (isQuoteOrder) {
					return;
				}

				// Wait for script to load
				if (!self.isScriptLoaded) {
					EventBus.on("aws-script-loaded", function () {
						self.renderButton(id, isCart);
					});
				} else {
					self.renderButton(id, isCart);
				}
			},

			/**
			 * Render the Amazon Pay button
			 */
			renderButton: function (cartOrOrderId, isCart) {
				var self = this;

				// Get signed checkout session from backend
				self.getCheckoutSessionConfig(cartOrOrderId, isCart).then(function (sessionConfig) {

					if (!window.amazon || !window.amazon.Pay) {
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

				}).fail(function (error) {});
			},

			/**
			 * Initialize Amazon Pay V2 checkout session display (no widgets like V1)
			 */
			initializeWidgets: function (checkoutSessionId) {
				var self = this;
				
				// Prevent re-initialization with same session ID
				if (self.currentSessionId === checkoutSessionId) {
					return;
				}
				self.currentSessionId = checkoutSessionId;
				
				// Ensure script is loaded for change button bindings
				if (!self.isScriptLoaded) {
					self.init(true);
				}
				
				self.showLoadingState();
				self.displaySessionInfoWithData(checkoutSessionId);
			},

			/**
			 * Render address using Hypr template
			 */
			renderAddressWidget: function (address) {
				var template = Hypr.getTemplate('modules/amazonpay/address-widget');
				var data = address || {};
				data.hasData = !!address;
				return template.render(data);
			},

			/**
			 * Render payment using Hypr template
			 */
			renderPaymentWidget: function (payment) {
				var template = Hypr.getTemplate('modules/amazonpay/payment-widget');
				var data = payment || {};
				data.hasData = !!payment;
				return template.render(data);
			},

			/**
			 * Bind Amazon Pay change actions to buttons
			 */
			bindChangeActions: function (checkoutSessionId) {
				// Bind address change button
				var addressBtn = document.getElementById('changeAddressBtn');
				if (addressBtn && window.amazon && window.amazon.Pay) {
					addressBtn.onclick = function () {
						window.amazon.Pay.changeShippingAddress({
							amazonCheckoutSessionId: checkoutSessionId
						});
					};
				}

				// Bind payment change button
				var paymentBtn = document.getElementById('changePaymentBtn');
				if (paymentBtn && window.amazon && window.amazon.Pay) {
					paymentBtn.onclick = function () {
						window.amazon.Pay.changePaymentMethod({
							amazonCheckoutSessionId: checkoutSessionId
						});
					};
				}
			},

			displaySessionInfoWithData: function (checkoutSessionId) {
				var self = this;

				var addressDiv = document.getElementById('addressBookWidgetDiv');
				var walletDiv = document.getElementById('walletWidgetDiv');

				self.getCheckoutSession(checkoutSessionId).then(function (response) {
					// Extract session data
					var sessionInfo = response.data || response;
					var shippingAddress = sessionInfo.shippingAddress;
					var paymentMethod = sessionInfo.paymentPreferences;

					// Hide loading state
					self.hideLoadingState();

					// Render address widget
					if (addressDiv) {
						addressDiv.innerHTML = self.renderAddressWidget(shippingAddress);
					}

					// Render payment widget
					if (walletDiv) {
						var payment = paymentMethod && paymentMethod.length > 0 ? paymentMethod[0] : null;
						walletDiv.innerHTML = self.renderPaymentWidget(payment);
					}

					// Bind buttons after rendering
					if (self.isScriptLoaded) {
						self.bindChangeActions(checkoutSessionId);
					} else {
						EventBus.once("aws-script-loaded", function () {
							self.bindChangeActions(checkoutSessionId);
						});
					}

					// Show continue button
					var continueDiv = document.getElementById('continue');
					if (continueDiv) {
						continueDiv.style.display = 'block';
					}

					var continueRow = document.getElementById('amazonAddressBookWidgetTD');
					if (continueRow) {
						continueRow.style.display = '';
					}

				}, function (error) {
					// Hide loading and show error
					self.hideLoadingState();
					self.showErrorState(error.message || "Failed to load Amazon Pay information");

					// Fallback to placeholder content
					self.showPlaceholderContent(addressDiv, walletDiv, checkoutSessionId);
				});
			},

			/**
			 * Show loading state
			 */
			showLoadingState: function () {
				var addressDiv = document.getElementById('addressBookWidgetDiv');
				var walletDiv = document.getElementById('walletWidgetDiv');

				if (addressDiv) {
					addressDiv.innerHTML = '<div class="amazon-loading">Loading shipping address...</div>';
				}

				if (walletDiv) {
					walletDiv.innerHTML = '<div class="amazon-loading">Loading payment method...</div>';
				}
			},

			/**
			 * Hide loading state
			 */
			hideLoadingState: function () {
				// Loading state is hidden when content is replaced
			},

			/**
			 * Show error state
			 */
			showErrorState: function (message) {
				var addressDiv = document.getElementById('addressBookWidgetDiv');
				var walletDiv = document.getElementById('walletWidgetDiv');

				if (addressDiv) {
					addressDiv.innerHTML = '<div class="amazon-error">Error: ' + message + '</div>';
				}

				if (walletDiv) {
					walletDiv.innerHTML = '<div class="amazon-error">Error: ' + message + '</div>';
				}
			},

			/**
			 * Show placeholder content if API call fails
			 */
			showPlaceholderContent: function (addressDiv, walletDiv, checkoutSessionId) {
				var self = this;

				// Render placeholder templates
				if (addressDiv) {
					addressDiv.innerHTML = self.renderAddressWidget(null);
				}

				if (walletDiv) {
					walletDiv.innerHTML = self.renderPaymentWidget(null);
				}

				// Show continue button
				var continueBtn = document.getElementById('continue');
				if (continueBtn) {
					continueBtn.style.display = 'block';
				}
			}
		};

		return AmazonPay;
	});