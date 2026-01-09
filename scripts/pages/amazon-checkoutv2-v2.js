window.v2ScriptLoaded = true;

require(["modules/jquery-mozu", "modules/backbone-mozu", "modules/eventbus", "underscore",
	"modules/amazonpay-v2", "modules/models-amazoncheckout-v2", 'hyprlivecontext', 'modules/preserve-element-through-render'],
	function ($, Backbone, EventBus, _, AmazonPayV2, AmazonCheckoutModelsV2, hyprlivecontext) {

	$(document).ready(function () {
		window.v2ReadyCalled = true;

		AmazonPayV2.init(true);

		var checkoutData = require.mozuData('checkout');

		// Check if we need to convert cart to checkout first (for local dev when Arc.js action doesn't run)
		var urlSearchParams = window.location.search.substring(1);
		var urlParamsObj = {};
		if (urlSearchParams) {
			urlSearchParams.split('&').forEach(function(param) {
				var parts = param.split('=');
				urlParamsObj[parts[0]] = decodeURIComponent(parts[1] || '');
			});
		}
		
		var cartId = urlParamsObj.cartId;
		var amazonCheckoutSessionId = urlParamsObj.amazonCheckoutSessionId;
		
		window.console.log('=== Multiship V2 Page Load ===');
		window.console.log('cartId in URL:', cartId);
		window.console.log('amazonCheckoutSessionId:', amazonCheckoutSessionId);
		window.console.log('checkoutData.id:', checkoutData ? checkoutData.id : 'no data');

		// If we have a cartId in the URL, the backend didn't convert it yet (local dev scenario)
		// In this case, checkoutData.id will be the cart ID, not a checkout ID
		if (cartId && checkoutData && checkoutData.id === cartId) {
			window.console.log('=== Cart not yet converted to checkout, converting now ===');
			
			// Create checkout from cart
			var api = require('modules/api');
			var checkoutClient = api.createSync('checkout');
			
			checkoutClient.createCheckoutFromCart({ cartId: cartId }).then(function(newCheckout) {
				window.console.log('=== Checkout created from cart ===');
				window.console.log('New checkout ID:', newCheckout.id);
				
				// Redirect to the checkout page with the new checkout ID
				var newUrl = window.location.pathname.replace('/cart', '/checkoutV2/' + newCheckout.id) + 
					'?view=amazon-checkoutv2-v2&amazonCheckoutSessionId=' + amazonCheckoutSessionId + 
					'&isAwsCheckout=true';
				
				window.console.log('Redirecting to:', newUrl);
				window.location.href = newUrl;
			})['catch'](function(error) {
				window.console.error('=== Failed to create checkout from cart ===', error);
			});
			
			return; // Stop processing until we redirect
		}

		// For multiship, we need to set mozuType to 'checkout' before creating the instance
		// because backend creates a Checkout entity for multiship, not an Order
		
		// Detection: if URL path contains '/checkoutV2/', it's a multiship checkout entity
		var isCheckoutV2Url = window.location.pathname.indexOf('/checkoutV2/') !== -1;
		
		window.console.log('=== Amazon Pay V2 Multiship Checkout ===');
		window.console.log('URL path:', window.location.pathname);
		window.console.log('Is multiship URL:', isCheckoutV2Url);
		window.console.log('Checkout ID:', checkoutData ? checkoutData.id : 'no data');
		
		// Use checkout mozuType if URL is /checkoutV2/ (multiship flow)
		if (isCheckoutV2Url) {
			window.console.log('Setting mozuType = checkout (multiship)');
			AmazonCheckoutModelsV2.AwsCheckoutPage.prototype.mozuType = 'checkout';
		} else {
			window.console.log('Setting mozuType = order (single-ship)');
			AmazonCheckoutModelsV2.AwsCheckoutPage.prototype.mozuType = 'order';
		}

		// Use Amazon Pay V2 model
		var checkoutModel = window.order = new AmazonCheckoutModelsV2.AwsCheckoutPage(checkoutData);
		
		window.console.log('Model created - mozuType:', checkoutModel.mozuType, 'apiModel.type:', checkoutModel.apiModel ? checkoutModel.apiModel.type : 'N/A');

		// Listen for checkout complete event to navigate back to main checkout
		checkoutModel.on("awscheckoutcomplete", function (id) {
				var checkoutUrl = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled ? "/checkoutv2" : "/checkout";

				if (checkoutModel.attributes.originalQuoteId)
					window.location = "/checkout/quoteOrder/" + id;
				else
					window.location = checkoutUrl + "/" + id;
			});

		var tableElement = $('#shippingBillingTbl');

			if (tableElement.length > 0) {

			// Inject V2 content directly - matches V1 structure
			var v2Content =
				'<div class="amazon-checkout-v2-container">' +
				'<div id="addressBookWidgetDiv" class="aws-widget amazon-loading">Loading address widget...</div>' +
				'<div id="walletWidgetDiv" class="aws-widget amazon-loading">Loading payment widget...</div>' +
				'</div>' +
				'<button type="button" id="amazon-v2-continue-btn" class="mz-button amazon-continue-btn">Continue to Review Order</button>' +
				'<button type="button" onclick="window.history.back();" class="mz-button">' +
				'Cancel' +
				'</button>' +
				'</div>' +
				'</div>' +
				'</td>' +
				'</tr>';


		tableElement.html(v2Content);
		
		// Attach click handler with loading state to the continue button
		$('#amazon-v2-continue-btn').on('click', function() {
			var $btn = $(this);
			var originalText = $btn.text();
			
			// Set loading state
			$btn.prop('disabled', true)
				.addClass('is-loading')
				.text('Processing...');
			
			// Function to restore button state
			var restoreButton = function() {
				$btn.prop('disabled', false)
					.removeClass('is-loading')
					.text(originalText);
			};
			
			// Listen for model error event to restore button
			if (checkoutModel) {
				checkoutModel.once('error', function(error) {
					window.console.error('Checkout error:', error);
					restoreButton();
				});
			}
			
			// Call submit function
			if(window.submitV2Order) {
				try {
					window.submitV2Order();
				} catch(e) {
					window.console.error('Error in submitV2Order:', e);
					restoreButton();
				}
			} else {
				window.console.error('submitV2Order not found');
				restoreButton();
			}
		});
				// Create simple checkout view object - same as V1
				window.checkoutView = {
					submit: function () {

						if (this.model.getAwsDestination) {
							var awsDest = this.model.getAwsDestination();
						}

						// Call model.submit() exactly like V1 does
						this.model.submit();
					},
					model: checkoutModel
				};

				// Also add a global function for the button onclick
				window.submitV2Order = function () {
					if (window.checkoutView && window.checkoutView.submit) {
						window.checkoutView.submit();
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
				// The model's submit() expects awsData with checkoutSessionId
				checkoutModel.awsData = {
					checkoutSessionId: checkoutSessionId
				};

				// Also set in fulfillmentInfo.data for backup
				var fulfillmentInfo = checkoutModel.get("fulfillmentInfo");
				if (fulfillmentInfo) {
					fulfillmentInfo.data = {
						checkoutSessionId: checkoutSessionId
					};
					checkoutModel.set("fulfillmentInfo", fulfillmentInfo);
			}

			// For regular checkout or cart flow: load widgets normally
			if (typeof AmazonPayV2.displayCheckoutSessionInfo === 'function') {
						AmazonPayV2.displayCheckoutSessionInfo(checkoutSessionId);
					} else {
						// Fallback: direct API call if function doesn't exist
						AmazonPayV2.getCheckoutSession(checkoutSessionId)
						.then(function (response) {
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
					.fail(function (error) {
						$('#addressBookWidgetDiv').html('Error loading address data: ' + (error.statusText || 'Unknown error'));
						$('#walletWidgetDiv').html('Error loading payment data: ' + (error.statusText || 'Unknown error'));
					});
				}
				} else {
					window.console.log('Amazon checkout-v2: No checkoutSessionId found - widgets will show loading state');
				}
		});
	});