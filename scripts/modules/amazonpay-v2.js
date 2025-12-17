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
			var apiUrl = "/amazonpay/checkoutsession";
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
				// Return hardcoded response on any failure
			});
		},

		/**
		 * Get checkout session details using the session ID
		 */
		getCheckoutSession: function(checkoutSessionId) {
				var self = this;
				var apiUrl = "/amazonpay/v2/checkout-sessions/" + checkoutSessionId;
			
			return $.ajax({
				method: "GET",
				url: apiUrl,
				contentType: "application/json"
			}).then(function(response) {
				return response;
			}).fail(function(error) {
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
			});
		},

		/**
		 * Initialize Amazon Pay V2 checkout session display (no widgets like V1)
		 */
		initializeWidgets: function(checkoutSessionId) {
			var self = this;
			
			self.showLoadingState();
			
			if (!self.isScriptLoaded) {
				EventBus.on("aws-script-loaded", function() {
					self.displayCheckoutSessionInfo(checkoutSessionId);
				});
				return;
			}
			
			self.displayCheckoutSessionInfo(checkoutSessionId);
		},

		/**
		 * Display Amazon Pay V2 checkout session info (V2 does NOT use widgets like V1)
		 * V2 shows read-only data from checkout session + change buttons that redirect to Amazon
		 */
		displayCheckoutSessionInfo: function(checkoutSessionId) {
			var self = this;
			
			var addressDiv = document.getElementById('addressBookWidgetDiv');
			var walletDiv = document.getElementById('walletWidgetDiv');
			
			self.getCheckoutSession(checkoutSessionId).then(function(response) {
				
				// Extract the actual session data from the response
				var sessionInfo = response.data || response;
				
				// Get shipping address and payment preferences from the correct structure
				var shippingAddress = sessionInfo.shippingAddress;
				var paymentMethod = sessionInfo.paymentPreferences;
				
				
				// Hide loading state
				self.hideLoadingState();
				
				// Display read-only shipping address with Amazon change action
				if (addressDiv) {
					if (shippingAddress) {
						var address = shippingAddress;
						var addressHTML = 
							'<div class="amazon-address-display">' +
							'<strong>Shipping Address</strong>' +
							'<div style="margin-top: 8px;">' +
							(address.name || address.recipientName || 'Name not available') + '<br>' +
							(address.addressLine1 || address.line1 || 'Address not available') + '<br>' +
							(address.addressLine2 || address.line2 ? (address.addressLine2 || address.line2) + '<br>' : '') +
							(address.city || 'City') + ', ' + (address.stateOrRegion || address.state || address.region || 'State') + ' ' + (address.postalCode || address.zipCode || 'ZIP') +
							'</div>' +
							'<button type="button" id="changeAddressBtn" class="mz-button mz-button-small">Change</button>' +
							'</div>';
						
						addressDiv.innerHTML = addressHTML;
							
						// Use Amazon Pay V2 change action - redirects to Amazon hosted page
						setTimeout(function() {
							var addressBtn = document.getElementById('changeAddressBtn');
							if (addressBtn && window.amazon && window.amazon.Pay) {
								if (typeof window.amazon.Pay.changeShippingAddress === 'function') {
									// Newer V2 method (recommended)
									addressBtn.onclick = function() {
										window.amazon.Pay.changeShippingAddress({
											amazonCheckoutSessionId: checkoutSessionId
										});
									};
								} else {
									// Legacy V2 method (fallback)
									window.amazon.Pay.bindChangeAction('#changeAddressBtn', {
										amazonCheckoutSessionId: checkoutSessionId,
										changeAction: 'changeAddress'
									});
								}
							} else {
							}
						}, 100);
					} else {
						// Show placeholder if no address data
						addressDiv.innerHTML = 
							'<div class="amazon-address-display">' +
							'<strong>Shipping Address</strong>' +
							'<div style="margin-top: 8px; color: #666;">' +
							'Please select your shipping address from Amazon Pay' +
							'</div>' +
							'<button type="button" id="changeAddressBtn" class="mz-button mz-button-small">Select Address</button>' +
							'</div>';
							
						// Bind placeholder button
						setTimeout(function() {
							var addressBtn = document.getElementById('changeAddressBtn');
							if (addressBtn && window.amazon && window.amazon.Pay) {
								if (typeof window.amazon.Pay.changeShippingAddress === 'function') {
									addressBtn.onclick = function() {
										window.amazon.Pay.changeShippingAddress({
											amazonCheckoutSessionId: checkoutSessionId
										});
									};
								} else {
									window.amazon.Pay.bindChangeAction('#changeAddressBtn', {
										amazonCheckoutSessionId: checkoutSessionId,
										changeAction: 'changeAddress'
									});
								}
							}
						}, 100);
					}
				}
				
				// Display read-only payment method with Amazon change action
				if (walletDiv) {
					if (paymentMethod && paymentMethod.length > 0) {
						var payment = paymentMethod[0];
						var paymentHTML = 
							'<div class="amazon-payment-display">' +
							'<strong>Payment Method</strong>' +
							'<div style="margin-top: 8px;">' +
							(payment.paymentDescriptor || payment.descriptor || payment.maskedCardNumber || payment.type || 'Payment method selected') +
							'</div>' +
							'<button type="button" id="changePaymentBtn" class="mz-button mz-button-small">Change</button>' +
							'</div>';
							
						walletDiv.innerHTML = paymentHTML;
							
						// Use Amazon Pay V2 change action - redirects to Amazon hosted page
						setTimeout(function() {
							var paymentBtn = document.getElementById('changePaymentBtn');
							if (paymentBtn && window.amazon && window.amazon.Pay) {
								if (typeof window.amazon.Pay.changePaymentMethod === 'function') {
									// Newer V2 method (recommended)
									paymentBtn.onclick = function() {
										window.amazon.Pay.changePaymentMethod({
											amazonCheckoutSessionId: checkoutSessionId
										});
									};
								} else {
									// Legacy V2 method (fallback)
									window.amazon.Pay.bindChangeAction('#changePaymentBtn', {
										amazonCheckoutSessionId: checkoutSessionId,
										changeAction: 'changePayment'
									});
								}
							} else {
							}
						}, 100);
					} else {
						// Show placeholder if no payment data
						walletDiv.innerHTML = 
							'<div class="amazon-payment-display">' +
							'<strong>Payment Method</strong>' +
							'<div style="margin-top: 8px; color: #666;">' +
							'Please select a payment method from Amazon Pay' +
							'</div>' +
							'<button type="button" id="changePaymentBtn" class="mz-button mz-button-small">Select Payment</button>' +
							'</div>';
							
						// Bind placeholder button
						setTimeout(function() {
							var paymentBtn = document.getElementById('changePaymentBtn');
							if (paymentBtn && window.amazon && window.amazon.Pay) {
								if (typeof window.amazon.Pay.changePaymentMethod === 'function') {
									paymentBtn.onclick = function() {
										window.amazon.Pay.changePaymentMethod({
											amazonCheckoutSessionId: checkoutSessionId
										});
									};
								} else {
									window.amazon.Pay.bindChangeAction('#changePaymentBtn', {
										amazonCheckoutSessionId: checkoutSessionId,
										changeAction: 'changePayment'
									});
								}
							}
						}, 100);
					}
				}
				
				// Show continue button wrapper and parent row
				var continueDiv = document.getElementById('continue');
				if (continueDiv) {
					continueDiv.style.display = 'block';
				}
				
				// Show the parent row containing the continue button
				var continueRow = document.getElementById('amazonAddressBookWidgetTD');
				if (continueRow) {
					continueRow.style.display = '';
				}
				
				// Ensure widgets have some content even if API data is missing
				var addrDiv = document.getElementById('addressBookWidgetDiv');
				var payDiv = document.getElementById('walletWidgetDiv');
				
				if (addrDiv && !addrDiv.innerHTML.trim()) {
					addrDiv.innerHTML = '<div class="amazon-address-display"><strong>Shipping Address</strong><div style="margin-top: 8px; color: #666;">Please select your shipping address</div><button type="button" class="mz-button mz-button-small">Select Address</button></div>';
				}
				
				if (payDiv && !payDiv.innerHTML.trim()) {
					payDiv.innerHTML = '<div class="amazon-payment-display"><strong>Payment Method</strong><div style="margin-top: 8px; color: #666;">Please select your payment method</div><button type="button" class="mz-button mz-button-small">Select Payment</button></div>';
				}
				
			}, function(error) {
				
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
		showLoadingState: function() {
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
		hideLoadingState: function() {
			// Loading state is hidden when content is replaced
		},

		/**
		 * Show error state
		 */
		showErrorState: function(message) {
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
		showPlaceholderContent: function(addressDiv, walletDiv, checkoutSessionId) {
			
			if (addressDiv) {
				addressDiv.innerHTML = 
					'<div class="amazon-address-display">' +
					'<strong>Shipping Address</strong>' +
					'<div style="margin-top: 8px; color: #666; font-style: italic;">' +
					'Click "Select Address" to choose your shipping address' +
					'</div>' +
					'<button type="button" id="changeAddressBtn" class="mz-button mz-button-small">Select Address</button>' +
					'</div>';
					
				// Bind change action even for placeholder
				setTimeout(function() {
					var btn = document.getElementById('changeAddressBtn');
					if (btn && window.amazon && window.amazon.Pay) {
						if (typeof window.amazon.Pay.changeShippingAddress === 'function') {
							btn.onclick = function() {
								window.amazon.Pay.changeShippingAddress({
									amazonCheckoutSessionId: checkoutSessionId
								});
							};
						} else {
							window.amazon.Pay.bindChangeAction('#changeAddressBtn', {
								amazonCheckoutSessionId: checkoutSessionId,
								changeAction: 'changeAddress'
							});
						}
					}
				}, 100);
			}
			
			if (walletDiv) {
				walletDiv.innerHTML = 
					'<div class="amazon-payment-display">' +
					'<strong>Payment Method</strong>' +
					'<div style="margin-top: 8px; color: #666; font-style: italic;">' +
					'Click "Select Payment" to choose your payment method' +
					'</div>' +
					'<button type="button" id="changePaymentBtn" class="mz-button mz-button-small">Select Payment</button>' +
					'</div>';
					
				// Bind change action even for placeholder
				setTimeout(function() {
					var btn = document.getElementById('changePaymentBtn');
					if (btn && window.amazon && window.amazon.Pay) {
						if (typeof window.amazon.Pay.changePaymentMethod === 'function') {
							btn.onclick = function() {
								window.amazon.Pay.changePaymentMethod({
									amazonCheckoutSessionId: checkoutSessionId
								});
							};
						} else {
							window.amazon.Pay.bindChangeAction('#changePaymentBtn', {
								amazonCheckoutSessionId: checkoutSessionId,
								changeAction: 'changePayment'
							});
						}
					}
				}, 100);
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
