require(["modules/jquery-mozu","modules/backbone-mozu", "modules/eventbus","underscore", 
	"modules/amazonpay-v2","modules/models-amazoncheckout-v2","modules/models-amazoncheckoutv2-v2",'hyprlivecontext','modules/preserve-element-through-render'], 
	function ($,Backbone, EventBus, _, AmazonPayV2, AmazonCheckoutModels, MultiShipAmazonCheckoutModels, hyprlivecontext) {
 
		
	var AmazonCheckoutView = Backbone.MozuView.extend({
		templateName: 'modules/checkout/amazon-shipping-billing-v2',
		autoUpdate: ['overrideItemDestinations'],
		initialize: function() {
			EventBus.on("aws-referenceOrder-created", this.setawsOrderData);
			EventBus.on("aws-card-selected", function() {
				$("#continue").show();
			});

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

			var isQuoteOrder = window.location.href.indexOf("quoteOrder") > 0;
			if(!isQuoteOrder)
			{				
				$("#amazonAddressBookWidgetTD").show();
			}
				
			// Amazon Pay V2 - Initialize widgets with checkout session ID
			var checkoutSessionId = $.deparam().amazonCheckoutSessionId;
			if (checkoutSessionId) {
				AmazonPayV2.initializeWidgets(checkoutSessionId);
				// Set awsData for V2
				this.setawsOrderData(checkoutSessionId);
			}

		},
		setawsOrderData: function(checkoutSessionId) {
			// Amazon Pay V2 uses checkoutSessionId instead of awsReferenceId
			var awsData = { checkoutSessionId: checkoutSessionId };

			// Set in model directly
			this.model.awsData = awsData;

			if (hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled) {
				var destinations = window.order.get('destinations');
				var existing = _.find(destinations, function(destination){
					if (destination.awsData && destination.awsData.checkoutSessionId) return destination;
				});
				if (existing) {
					existing.data = awsData;
					_.extend(
						_.findWhere(destinations, function(destination) {
							if (destination.awsData && destination.awsData.checkoutSessionId) return destination; 
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
		},
		redirectToCart: function() {
			window.amazon.Login.logout();
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
			checkoutModel = window.order = new MultiShipAmazonCheckoutModels.AwsCheckoutPage(checkoutData);
		else
			checkoutModel = window.order = new AmazonCheckoutModels.AwsCheckoutPage(checkoutData);

		window.checkoutView =  new AmazonCheckoutView({
									el: $('#shippingBillingTbl'),
									model: checkoutModel,
									messagesEl: $('[data-mz-message-bar]')
								});
		window.checkoutView.render();
	});
});
