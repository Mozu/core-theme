window.v2ScriptLoaded = true;

require(["modules/jquery-mozu","modules/backbone-mozu", "modules/eventbus","underscore", 
	"modules/amazonpay-v2","modules/models-amazoncheckout-v2",'hyprlivecontext','modules/preserve-element-through-render'], 
	function ($,Backbone, EventBus, _, AmazonPayV2, AmazonCheckoutModelsV2,hyprlivecontext) {

	var AmazonCheckoutView = Backbone.MozuView.extend({
		// Don't use templateName, render content directly
		autoUpdate: ['overrideItemDestinations'],
		initialize: function() {
			this.listenTo(this.model, "awscheckoutcomplete", function(id){
				var checkoutUrl = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled ? "/checkoutv2" : "/checkout";

				if(this.model.attributes.originalQuoteId)
					window.location = "/checkout/quoteOrder/" + id;
				else
				 	window.location = checkoutUrl +"/"+id;
			});
		},
		render: function() {
			// Manually render V2 content - matches V1 structure
			var v2Content = 
				'<tr id="amazonAddressBookWidgetTR">' +
					'<td colspan="2">' +
						'<div class="aws-step-content">' +
							'<h3>Shipping Address</h3>' +
							'<div id="addressBookWidgetDiv" class="aws-widget"><!-- Amazon Pay V2 Address Widget --></div>' +
						'</div>' +
					'</td>' +
				'</tr>' +
				'<tr id="amazonWalletWidgetTR">' +
					'<td colspan="2">' +
						'<div class="aws-step-content">' +
							'<h3>Payment Method</h3>' +
							'<div id="walletWidgetDiv" class="aws-widget"><!-- Amazon Pay V2 Wallet Widget --></div>' +
						'</div>' +
					'</td>' +
				'</tr>' +
				'<tr id="amazonAddressBookWidgetTD" style="display:none;">' +
					'<td colspan="2">' +
						'<div class="aws-step-content">' +
							'<div id="continue" style="display:none;">' +
								'<button type="button" onclick="if(window.checkoutView){window.checkoutView.submit();}else{alert(\'CheckoutView not available\');}" class="mz-button mz-button-primary">Continue to Review Order</button>' +
							'</div>' +
						'</div>' +
					'</td>' +
				'</tr>';
			
			this.$el.html(v2Content);
		},
		redirectToCart: function() {
			window.location = document.referrer;
		},
		submit: function(){
			this.model.submit();
		}
	});

	$(document).ready(function () {
		window.v2ReadyCalled = true;
		
		AmazonPayV2.init(false);

		var checkoutData = require.mozuData('checkout');
		
		// Use Amazon Pay V2 model
		var checkoutModel = window.order = new AmazonCheckoutModelsV2.AwsCheckoutPage(checkoutData);

		var tableElement = $('#shippingBillingTbl');
		
		if (tableElement.length > 0) {
			
			// Inject V2 content directly - matches V1 structure
			var v2Content = 
				'<tr id="amazonAddressBookWidgetTR">' +
					'<td colspan="2">' +
						'<div class="aws-step-content">' +
							'<h3>Shipping Address</h3>' +
							'<div id="addressBookWidgetDiv" class="aws-widget amazon-loading">Loading address widget...</div>' +
						'</div>' +
					'</td>' +
				'</tr>' +
				'<tr id="amazonWalletWidgetTR">' +
					'<td colspan="2">' +
						'<div class="aws-step-content">' +
							'<h3>Payment Method</h3>' +
							'<div id="walletWidgetDiv" class="aws-widget amazon-loading">Loading payment widget...</div>' +
						'</div>' +
					'</td>' +
				'</tr>' +
				'<tr id="amazonAddressBookWidgetTD" style="display:none;">' +
					'<td colspan="2">' +
						'<div class="aws-step-content">' +
							'<div id="continue" style="display:none;">' +
								'<button type="button" onclick="if(window.submitV2Order){window.submitV2Order();}else{alert(\'submitV2Order not found\');}" class="mz-button mz-button-primary">Continue to Review Order</button>' +
							'</div>' +
						'</div>' +
					'</td>' +
				'</tr>';
			
			tableElement.html(v2Content);
			
			// Create simple checkout view object - same as V1
			window.checkoutView = {
			submit: function() {
					
					if (this.model.getAwsDestination) {
						var awsDest = this.model.getAwsDestination();
					}
					
					// Call model.submit() exactly like V1 does
					this.model.submit();
				},
				model: checkoutModel
			};
			
			// Also add a global function for the button onclick
			window.submitV2Order = function() {
				if (window.checkoutView && window.checkoutView.submit) {
					window.checkoutView.submit();
				} else {
					alert("CheckoutView not available");
				}
			};
			
		} else {
		}

		// Extract Amazon Checkout Session ID from URL after Amazon redirect
		var urlParams = $.deparam();
		
		// Fallback URL parsing
		var sessionIdFromURL = null;
		var urlSearch = window.location.search;
		if (urlSearch) {
			var match = urlSearch.match(/amazonCheckoutSessionId=([^&]*)/);
			sessionIdFromURL = match ? decodeURIComponent(match[1]) : null;
		}
		
		var checkoutSessionId = urlParams.amazonCheckoutSessionId || sessionIdFromURL;
		
		// Ensure it's a string, not an object
		if (checkoutSessionId && typeof checkoutSessionId === 'object') {
			checkoutSessionId = checkoutSessionId.toString();
		}
		
		if (checkoutSessionId) {
			
			// Set up Amazon data for V2 model
			// The model's submit() expects awsData with amazonCheckoutSessionId
			checkoutModel.awsData = {
				amazonCheckoutSessionId: checkoutSessionId
			};
			
			// Also set in fulfillmentInfo.data for backup
			var fulfillmentInfo = checkoutModel.get("fulfillmentInfo");
			if (fulfillmentInfo) {
				fulfillmentInfo.data = {
					amazonCheckoutSessionId: checkoutSessionId
				};
				checkoutModel.set("fulfillmentInfo", fulfillmentInfo);
			}

			// Use displayCheckoutSessionInfo which handles the API call internally
			if (typeof AmazonPayV2.displayCheckoutSessionInfo === 'function') {
				AmazonPayV2.displayCheckoutSessionInfo(checkoutSessionId);
			} else {
				// Fallback: direct API call if function doesn't exist
				AmazonPayV2.getCheckoutSession(checkoutSessionId)
					.then(function(response) {
						// Manual data binding as fallback
						if (response && response.data) {
							var data = response.data;
							
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
						
						$("#continue").show();
					})
					.fail(function(error) {
						$('#addressBookWidgetDiv').html('Error loading address data: ' + (error.statusText || 'Unknown error'));
						$('#walletWidgetDiv').html('Error loading payment data: ' + (error.statusText || 'Unknown error'));
					});
			}

		} else {
		}
	});
});
