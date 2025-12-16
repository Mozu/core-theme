console.log("=== V2 SCRIPT FILE LOADING ===");
window.v2ScriptLoaded = true;

require(["modules/jquery-mozu","modules/backbone-mozu", "modules/eventbus","underscore", 
	"modules/amazonpay-v2","modules/models-amazoncheckout","modules/models-amazoncheckoutV2",'hyprlivecontext','modules/preserve-element-through-render'], 
	function ($,Backbone, EventBus, _, AmazonPayV2, AmazonCheckoutModels, AmazonCheckoutModelsV2,hyprlivecontext) {

	var AmazonCheckoutView = Backbone.MozuView.extend({
		// Don't use templateName, render content directly
		autoUpdate: ['overrideItemDestinations'],
		initialize: function() {
			console.log("=== V2 SCRIPT FILE LOADING  initilize===");
			this.listenTo(this.model, "awscheckoutcomplete", function(id){
				var checkoutUrl = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled ? "/checkoutv2" : "/checkout";

				if(this.model.attributes.originalQuoteId)
					window.location = "/checkout/quoteOrder/" + id;
				else
				 	window.location = checkoutUrl +"/"+id;
			});
		},
		render: function() {
			// Manually render V2 content instead of using template
			var v2Content = '<tr id="amazonAddressBookWidgetTR">' +
				'<td colspan="2">' +
					'<div class="aws-step-content">' +
						'<h3>Shipping Address</h3>' +
						'<div id="addressBookWidgetDiv" class="aws-widget">' +
							'<!-- Amazon Pay V2 Address Widget will be rendered here -->' +
						'</div>' +
					'</div>' +
				'</td>' +
			'</tr>' +
			'<tr id="amazonWalletWidgetTR">' +
				'<td colspan="2">' +
					'<div class="aws-step-content">' +
						'<h3>Payment Method</h3>' +
						'<div id="walletWidgetDiv" class="aws-widget">' +
							'<!-- Amazon Pay V2 Wallet Widget will be rendered here -->' +
						'</div>' +
					'</div>' +
				'</td>' +
			'</tr>' +
			'<tr id="amazonContinueButtonTR">' +
				'<td colspan="2">' +
					'<div class="aws-step-content">' +
						'<button id="continue" class="mz-button mz-button-large" onclick="if(window.checkoutView){window.checkoutView.submit();}else{alert(\'CheckoutView not available\');}" style="display:none;">Continu to Review Order2</button>' +
					'</div>' +
				'</td>' +
			'</tr>';
			
			this.$el.html(v2Content);
			console.log("=== V2 content rendered manually ===");
		},
		redirectToCart: function() {
			window.location = document.referrer;
		},
		submit: function(){
			this.model.submit();
		}
	});

	$(document).ready(function () {
		console.log("=== V2 READY FUNCTION CALLED ===");
		window.v2ReadyCalled = true;
		
		AmazonPayV2.init(false);

		var checkoutData = require.mozuData('checkout');
		console.log("=== CHECKOUT DATA ===", checkoutData);
		
		// Use V2 model with proxy-routed API calls
		var checkoutModel = '';
		try {
			// Use V2 model with proxy support
			checkoutModel = window.order = new AmazonCheckoutModelsV2.AwsCheckoutPage(checkoutData);
			console.log("=== Using V2 Amazon checkout model with proxy ===");
		} catch (error) {
			console.error("=== V2 Amazon model creation failed ===", error);
			// Fallback to simple model if Amazon model fails
			checkoutModel = new Backbone.Model(checkoutData || {});
			checkoutModel.submit = function() {
				console.log("=== Simple model submit - V2 model not available ===");
				alert("V2 Amazon checkout model not available");
			};
		}
		
		window.order = checkoutModel;
		console.log("=== SIMPLE MODEL CREATED ===");

		console.log("=== Looking for shippingBillingTbl ===");
		var tableElement = $('#shippingBillingTbl');
		console.log("=== Element exists? ===", tableElement.length > 0);
		
		if (tableElement.length > 0) {
			console.log("=== Using direct HTML injection - avoiding Backbone view ===");
			
			// Inject V2 content directly
			var v2Content = '<tr id="amazonAddressBookWidgetTR">' +
				'<td colspan="2">' +
					'<div class="aws-step-content">' +
						'<h3>Shipping Address</h3>' +
						'<div id="addressBookWidgetDiv" class="aws-widget amazon-loading">' +
							'Loading address widget...' +
						'</div>' +
					'</div>' +
				'</td>' +
			'</tr>' +
			'<tr id="amazonWalletWidgetTR">' +
				'<td colspan="2">' +
					'<div class="aws-step-content">' +
						'<h3>Payment Method</h3>' +
						'<div id="walletWidgetDiv" class="aws-widget amazon-loading">' +
							'Loading payment widget...' +
						'</div>' +
					'</div>' +
				'</td>' +
			'</tr>' +
			'<tr id="amazonContinueButtonTR">' +
				'<td colspan="2">' +
					'<div class="aws-step-content">' +
						'<button id="continue" class="mz-button mz-button-large" onclick="' +
							'console.log(\'Button clicked\');' +
							'console.log(\'CheckoutView exists:\', !!window.checkoutView);' +
							'console.log(\'Submit function exists:\', !!(window.checkoutView && window.checkoutView.submit));' +
							'if(window.submitV2Order) { window.submitV2Order(); } else { alert(\'submitV2Order not found\'); }' +
						'" style="display:none;">Continue to Review Order</button>' +
					'</div>' +
				'</td>' +
			'</tr>';
			
			tableElement.html(v2Content);
			
			// Create simple checkout view object - same as V1
			window.checkoutView = {
			submit: function() {
				console.log("=== V2 Submit called - using V2 model with proxy ===");					// Debug the model state before submit
					console.log("=== Model destinations ===", this.model.get("destinations"));
					console.log("=== Model awsData ===", this.model.awsData);
					
					if (this.model.getAwsDestination) {
						var awsDest = this.model.getAwsDestination();
						console.log("=== getAwsDestination result ===", awsDest);
					}
					
					// Call model.submit() exactly like V1 does
					this.model.submit();
				},
				model: checkoutModel
			};
			
			// Also add a global function for the button onclick
			window.submitV2Order = function() {
				console.log("=== Global V2 submit called ===");
				if (window.checkoutView && window.checkoutView.submit) {
					window.checkoutView.submit();
				} else {
					console.error("CheckoutView not available");
					alert("CheckoutView not available");
				}
			};
			
			console.log("=== Direct V2 content rendered ===");
		} else {
			console.error("=== shippingBillingTbl element not found ===");
		}

		// Extract Amazon Checkout Session ID from URL after Amazon redirect
		var urlParams = $.deparam();
		console.log("=== URL PARAMS (deparam) ===", urlParams);
		console.log("=== urlParams.amazonCheckoutSessionId type ===", typeof urlParams.amazonCheckoutSessionId);
		console.log("=== urlParams.amazonCheckoutSessionId value ===", urlParams.amazonCheckoutSessionId);
		
		// Fallback URL parsing
		var sessionIdFromURL = null;
		var urlSearch = window.location.search;
		if (urlSearch) {
			var match = urlSearch.match(/amazonCheckoutSessionId=([^&]*)/);
			sessionIdFromURL = match ? decodeURIComponent(match[1]) : null;
		}
		console.log("=== amazonCheckoutSessionId (URLSearchParams) ===", sessionIdFromURL);
		console.log("=== Full URL ===", window.location.href);
		
		var checkoutSessionId = urlParams.amazonCheckoutSessionId || sessionIdFromURL;
		console.log("=== Final sessionId ===", checkoutSessionId);
		console.log("=== sessionId type ===", typeof checkoutSessionId);
		
		// Ensure it's a string, not an object
		if (checkoutSessionId && typeof checkoutSessionId === 'object') {
			console.warn("=== sessionId is object, converting ===", checkoutSessionId);
			checkoutSessionId = checkoutSessionId.toString();
		}
		
		if (checkoutSessionId) {
			console.log("=== Amazon Checkout Session ID found ===", checkoutSessionId);
			
			// Set up Amazon data for V2 model (destinations structure)
			if (checkoutModel.get && typeof checkoutModel.get === 'function') {
				var destinations = checkoutModel.get("destinations") || [];
				// Ensure we have at least one destination with V2 data structure
				if (destinations.length === 0) {
					destinations = [{ data: {} }];
				}
				destinations[0].data = {
					amazonCheckoutSessionId: checkoutSessionId
				};
				checkoutModel.set("destinations", destinations);
				console.log("=== V2 destinations set ===", destinations);
			}
			
			// Set awsData property exactly like V1 model expects
			checkoutModel.awsData = {
				amazonCheckoutSessionId: checkoutSessionId
			};

			// Try direct API call to get checkout session data
			console.log("=== Making direct API call ===");
			AmazonPayV2.getCheckoutSession(checkoutSessionId)
				.then(function(response) {
					console.log("=== API Response ===", response);
					
					// Check if displayCheckoutSessionInfo function exists
					if (typeof AmazonPayV2.displayCheckoutSessionInfo === 'function') {
						console.log("=== Calling displayCheckoutSessionInfo ===");
						AmazonPayV2.displayCheckoutSessionInfo(response, checkoutSessionId);
					} else {
						console.error("=== displayCheckoutSessionInfo function not found ===");
						// Manual data binding as fallback
						if (response && response.data) {
							var data = response.data;
							console.log("=== Manual data binding ===", data);
							
							// Update address widget
							if (data.shippingAddress) {
								var addr = data.shippingAddress;
								var addrHTML = '<div><strong>Shipping Address:</strong><br>' +
									(addr.name || 'No Name') + '<br>' +
									(addr.addressLine1 || 'No Address') + '<br>' +
									(addr.city || '') + ', ' + (addr.stateOrRegion || '') + ' ' + (addr.postalCode || '') +
									'</div>';
								$('#addressBookWidgetDiv').html(addrHTML);
							}
							
							// Update payment widget
							if (data.paymentPreferences) {
								$('#walletWidgetDiv').html('<div><strong>Payment Method:</strong><br>Amazon Pay Selected</div>');
							}
						}
					}
					
					$("#continue").show();
					console.log("=== Continue button shown ===");
				})
				.fail(function(error) {
					console.error("=== API Error ===", error);
					$('#addressBookWidgetDiv').html('Error loading address data: ' + (error.statusText || 'Unknown error'));
					$('#walletWidgetDiv').html('Error loading payment data: ' + (error.statusText || 'Unknown error'));
				});

		} else {
			console.warn("=== No Amazon Checkout Session ID found in URL ===");
		}
	});
});
