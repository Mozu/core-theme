window.v2ScriptLoaded = true;

require(["modules/jquery-mozu", "modules/backbone-mozu", "modules/eventbus", "underscore",
	"modules/amazonpay-v2", "modules/models-amazoncheckout-v2", "modules/models-amazoncheckoutv2-v2",'hyprlivecontext', 'modules/preserve-element-through-render'],
	function ($, Backbone, EventBus, _, AmazonPayV2, AmazonCheckoutModelsV2, multishipamzon, hyprlivecontext) {

	$(document).ready(function () {
		window.v2ReadyCalled = true;

		AmazonPayV2.init(true);

		var checkoutData = require.mozuData('checkout');

		// Use Amazon Pay V2 model
		var checkoutModel = null;
		if(hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled) {
		checkoutModel = window.order = new multishipamzon.AwsCheckoutPage(checkoutData);
		}
		else {
			checkoutModel = window.order = new AmazonCheckoutModelsV2.AwsCheckoutPage(checkoutData);
		}

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