window.v2ScriptLoaded = true;

require(["modules/jquery-mozu", "modules/backbone-mozu", "modules/eventbus", "underscore",
	"modules/amazonpay-v2", "modules/models-amazoncheckoutv2-v2", 'hyprlivecontext', 'modules/preserve-element-through-render'],
	function ($, Backbone, EventBus, _, AmazonPayV2, AmazonCheckoutModelsV2, hyprlivecontext) {

		$(document).ready(function () {
			window.v2ReadyCalled = true;
			window.console.log('Amazon checkoutv2-v2: Document ready');

			AmazonPayV2.init(true);
			window.console.log('Amazon checkoutv2-v2: AmazonPayV2 initialized');

			var checkoutData = require.mozuData('checkout');

			// Use Amazon Pay V2 model - EXACT SAME as single ship
			var checkoutModel = window.order = new AmazonCheckoutModelsV2.AwsCheckoutPage(checkoutData);

			// Listen for checkout complete event to navigate back to main checkout
			checkoutModel.on("awscheckoutcomplete", function (id) {
				var checkoutUrl = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled ? "/checkoutv2" : "/checkout"; // EXACT SAME as single ship

				if (checkoutModel.attributes.originalQuoteId)
					window.location = "/checkout/quoteOrder/" + id;
				else
					window.location = checkoutUrl + "/" + id;
			});

			// Check what elements exist
			window.console.log('Amazon checkoutv2-v2: Found elements:', {
				table: $('#shippingBillingTbl').length,
				form: $('#checkout-form').length,
				addressDiv: $('#addressBookWidgetDiv').length,
				walletDiv: $('#walletWidgetDiv').length
			});

			// DON'T replace template content - use existing structure!
			// Template already has addressBookWidgetDiv and walletWidgetDiv with proper styling

			// Just add continue button if it doesn't exist
			if ($('#amazon-v2-continue-btn').length === 0) {
				var buttonRow = '<tr><td colspan="2"><div class="amazon-actions"><div class="amazon-button-group">' +
					'<button type="button" onclick="window.history.back();" class="mz-button amazon-cancel-btn">Cancel</button>' +
					'<button type="button" id="amazon-v2-continue-btn" class="mz-button amazon-continue-btn">Continue to Review Order</button>' +
					'</div></div></td></tr>';
				$('#shippingBillingTbl').append(buttonRow);
				window.console.log('Amazon checkoutv2-v2: Added continue button');
			}

			// FIX CSS VISIBILITY ISSUES - Force form to be visible and fix fades-in class
			$('#checkout-form').css('opacity', '1').removeClass('fades-in');
			$('#checkout-form').css({
				'visibility': 'visible',
				'opacity': '1',
				'display': 'block'
			});
			window.console.log('Amazon checkoutv2-v2: Fixed form visibility and removed fades-in class');

			// Check visibility after changes
			setTimeout(function() {
				window.console.log('Amazon checkoutv2-v2: Visibility check:', {
					formVisible: $('#checkout-form').is(':visible'),
					formOpacity: $('#checkout-form').css('opacity'),
					tableVisible: $('#shippingBillingTbl').is(':visible'),
					addressVisible: $('#addressBookWidgetDiv').is(':visible'),
					walletVisible: $('#walletWidgetDiv').is(':visible')
				});

				// Check CSS classes for alignment issues
				window.console.log('Amazon checkoutv2-v2: CSS debugging:', {
					formClasses: $('#checkout-form').attr('class'),
					tableClasses: $('#shippingBillingTbl').attr('class'),
					addressDivClasses: $('#addressBookWidgetDiv').attr('class'),
					addressParentClasses: $('#addressBookWidgetDiv').parent().attr('class')
				});
			}, 100);

			// FIX ALIGNMENT ISSUES - Add single ship styling classes
			$('#checkout-form').addClass('amazon-pay-checkout-form');
			$('#shippingBillingTbl').addClass('amazon-pay-table');
			$('.amazon-pay-container').css({
				'max-width': '600px',
				'margin': '0 auto',
				'padding': '20px'
			});
			$('.amazon-section').css({
				'margin-bottom': '20px',
				'border': '1px solid #ddd',
				'border-radius': '4px',
				'padding': '15px'
			});
			$('.amazon-actions').css({
				'text-align': 'right',
				'padding': '20px 0',
				'margin-top': '20px'
			});
			$('.amazon-button-group button').css({
				'margin-left': '10px',
				'padding': '10px 20px'
			});

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
					window.console.log('Amazon checkoutv2-v2: Submit called');

					// Debug model data before submit
					var fulfillmentInfo = this.model.get("fulfillmentInfo");
					var destinations = this.model.get("destinations");
					window.console.log('Amazon checkoutv2-v2: Model data:', {
						fulfillmentInfo: fulfillmentInfo,
						destinations: destinations ? destinations.length : 0,
						awsData: this.model.awsData
					});

					if (this.model.getAwsDestination) {
						var awsDest = this.model.getAwsDestination();
						window.console.log('Amazon checkoutv2-v2: AWS destination:', awsDest);
					}

					try {
						// Call model.submit() exactly like V1 does
						this.model.submit();
					} catch (error) {
						window.console.error('Amazon checkoutv2-v2: Submit error:', error);
						window.console.error('Amazon checkoutv2-v2: Error stack:', error.stack);
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
				window.console.log('Amazon checkoutv2-v2: Loading session data for ID:', checkoutSessionId);

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

				// For multi-ship, also set on destinations if they exist
				var destinations = checkoutModel.get("destinations");
				if (destinations && destinations.length > 0) {
					destinations.forEach(function(dest, index) {
						if (!dest.data) {
							dest.data = {};
						}
						dest.data.checkoutSessionId = checkoutSessionId;
						dest.data.amazonCheckoutSessionId = checkoutSessionId;
					});
					checkoutModel.set("destinations", destinations);
				}

				// Use displayCheckoutSessionInfo which handles the API call internally
				if (typeof AmazonPayV2.displayCheckoutSessionInfo === 'function') {
					window.console.log('Amazon checkoutv2-v2: Calling displayCheckoutSessionInfo with ID:', checkoutSessionId);
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