window.v2ScriptLoaded = true;

require(["modules/jquery-mozu", "modules/backbone-mozu", "modules/eventbus", "underscore",
	"modules/amazonpay-v2", "modules/models-amazoncheckoutv2-v2", 'hyprlivecontext', 'modules/preserve-element-through-render'],
	function ($, Backbone, EventBus, _, AmazonPayV2, AmazonCheckoutModelsV2, hyprlivecontext) {

		$(document).ready(function () {
			window.v2ReadyCalled = true;

			AmazonPayV2.init(true);

			var checkoutData = require.mozuData('checkout');

			// Use Amazon Pay V2 model
			var checkoutModel = window.order = new AmazonCheckoutModelsV2.AwsCheckoutPage(checkoutData);

			// Listen for checkout complete event
			checkoutModel.on("awscheckoutcomplete", function (id) {
				var checkoutUrl = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled ? "/checkoutv2" : "/checkout";

				if (checkoutModel.attributes.originalQuoteId)
					window.location = "/checkout/quoteOrder/" + id;
				else
					window.location = checkoutUrl + "/" + id;
			});

			// Add continue button if it doesn't exist
			if ($('#amazon-v2-continue-btn').length === 0) {
				var buttonRow = '<tr><td colspan="2"><div class="amazon-actions"><div class="amazon-button-group">' +
					'<button type="button" onclick="window.history.back();" class="mz-button amazon-cancel-btn">Cancel</button>' +
					'<button type="button" id="amazon-v2-continue-btn" class="mz-button amazon-continue-btn">Continue to Review Order</button>' +
					'</div></div></td></tr>';
				$('#shippingBillingTbl').append(buttonRow);
			}

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
					// Verify model exists
					if (!this.model) {
						window.console.error('Model is null or undefined!');
						return;
					}

					// Verify model has submit method
					if (typeof this.model.submit !== 'function') {
						window.console.error('Model does not have submit method!');
						return;
					}

					try {
						this.model.submit();
					} catch (error) {
						window.console.error('Submit error:', error);
					}
				},
				model: checkoutModel
			};

			// Also add a global function for the button onclick
			window.submitV2Order = function () {
				if (window.checkoutView && window.checkoutView.submit) {
					window.checkoutView.submit();
				}
			};

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
				// Set up Amazon data for V2 model - EXACT SAME as single ship
				// The model's submit() expects awsData with checkoutSessionId
				checkoutModel.awsData = {
					checkoutSessionId: checkoutSessionId
				};

				// Multi-ship needs different data structure - set up fulfillmentInfo properly
				var fulfillmentInfo = checkoutModel.get("fulfillmentInfo") || {};

				// Ensure fulfillmentInfo has required properties for multi-ship
				if (!fulfillmentInfo.shippingMethodCode) {
					fulfillmentInfo.shippingMethodCode = null; // Prevent undefined error
				}

				fulfillmentInfo.data = {
					checkoutSessionId: checkoutSessionId
				};

				checkoutModel.set("fulfillmentInfo", fulfillmentInfo);

				// For multi-ship, ensure destinations array exists and has AWS data
				var destinations = checkoutModel.get("destinations");
				if (!destinations || destinations.length === 0) {
					// Create a default AWS destination if none exist
					destinations = [{
						data: {
							checkoutSessionId: checkoutSessionId,
							amazonCheckoutSessionId: checkoutSessionId
						},
						destinationContact: {}
					}];
				} else {
					// Update existing destinations with AWS data
					destinations.forEach(function(dest, index) {
						if (!dest.data) {
							dest.data = {};
						}
						dest.data.checkoutSessionId = checkoutSessionId;
						dest.data.amazonCheckoutSessionId = checkoutSessionId;
					});
				}
				checkoutModel.set("destinations", destinations);

				// For regular checkout or cart flow: load widgets normally
				if (typeof AmazonPayV2.displayCheckoutSessionInfo === 'function') {
					AmazonPayV2.displayCheckoutSessionInfo(checkoutSessionId);
					} else {
					window.console.error('Amazon checkoutv2-v2: displayCheckoutSessionInfo function not found');
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
					window.console.log('Amazon checkoutv2-v2: No checkoutSessionId found - widgets will show loading state');
				}
			});
		});