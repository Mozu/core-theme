require(["modules/jquery-mozu","modules/backbone-mozu", "modules/eventbus","underscore",
	"modules/amazonpay-v2","modules/models-amazoncheckout-v2","modules/models-amazoncheckoutV2-v2",'hyprlivecontext','modules/preserve-element-through-render'],
	function ($,Backbone, EventBus, _, AmazonPayV2, AmazonCheckoutModels, AmazonCheckoutModelsV2,hyprlivecontext) {


	var AmazonCheckoutView = Backbone.MozuView.extend({
		templateName: 'modules/checkout/amazon-shipping-billing-v2',
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
			Backbone.MozuView.prototype.render.call(this);
		},
		redirectToCart: function() {
			window.location = document.referrer;
		},
		submit: function(){
			this.model.submit();
		}
	});


	$(document).ready(function () {
		AmazonPayV2.init(false);

		var checkoutData = require.mozuData('checkout');
		var checkoutModel = '';

		if (hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled)
			checkoutModel = window.order = new AmazonCheckoutModelsV2.AwsCheckoutPage(checkoutData);
		else
			checkoutModel = window.order = new AmazonCheckoutModels.AwsCheckoutPage(checkoutData);

		window.checkoutView =  new AmazonCheckoutView({
									el: $('#shippingBillingTbl'),
									model: checkoutModel,
									messagesEl: $('[data-mz-message-bar]')
								});
		window.checkoutView.render();

		// Extract Amazon Checkout Session ID from URL after Amazon redirect
		var urlParams = $.deparam();
		if (urlParams.amazonCheckoutSessionId) {
			// Store the checkout session ID
			var awsData = {
				amazonCheckoutSessionId: urlParams.amazonCheckoutSessionId
			};

			if (hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled) {
				var destinations = window.order.get('destinations');
				var existing = _.find(destinations, function(destination){
					if (destination.awsData && destination.awsData.amazonCheckoutSessionId) return destination;
				});
				if (existing) {
					existing.data = awsData;
					_.extend(
						_.findWhere(destinations, function(destination) {
							if (destination.awsData && destination.awsData.amazonCheckoutSessionId) return destination;
						}), existing);
				}
				else {
					if (destinations)
						destinations.push({ data: awsData});
					else
						destinations= [{data: awsData}];
					window.order.set("destinations", destinations);
				}
			}
			else {
				var fulfillmentInfo = window.order.get("fulfillmentInfo");
				fulfillmentInfo.data = awsData;
				window.order.set("fulfillmentInfo", fulfillmentInfo);
			}

			// Initialize Amazon Pay V2 widgets to display session info
			window.console.log("=== Initializing Amazon Pay V2 widgets with session ID:", urlParams.amazonCheckoutSessionId, "===");
			AmazonPayV2.initializeWidgets(urlParams.amazonCheckoutSessionId);

			// Show continue button
			$("#continue").show();
		}
	});
});
