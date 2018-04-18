require(["modules/jquery-mozu","modules/backbone-mozu",'modules/editable-view', "modules/eventbus","underscore", 
	"modules/amazonPay","modules/models-amazoncheckout","modules/models-amazoncheckoutv2",'hyprlivecontext','modules/preserve-element-through-render'], 
	function ($,Backbone, EditableView, EventBus, _, AmazonPay, AmazonCheckoutModels, AmazonCheckoutModelsV2,hyprlivecontext,preserveElements) {
 

	var AmazonCheckoutView = EditableView.extend({
		templateName: 'modules/checkout/amazon-shipping-billing',
		autoUpdate: ['overrideItemDestinations'],
		initialize: function() {
			EventBus.on("aws-referenceOrder-created", this.setawsOrderData);
			EventBus.on("aws-card-selected", function() {
				$("#continue").show();
			});

			this.listenTo(this.model, "awscheckoutcomplete", function(id){
				var checkoutUrl = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled ? "/checkoutv2" : "/checkout";
				window.location = checkoutUrl+"/"+id;
			});
			
		},
		render: function() {
			//preserveElements(this, ['.shippingBillingTbl'], function() {
				Backbone.MozuView.prototype.render.call(this);
			//});
			AmazonPay.addAddressWidget();
			AmazonPay.addWalletWidget();

		},
		setawsOrderData: function(data) {
			var awsData = { awsReferenceId: data.orderReferenceId, addressAuthorizationToken:$.deparam().access_token};

			if (hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled) {
				var destinations = window.order.get('destinations');
				var existing = _.find(destinations, function(destination){
					if (destination.awsData && destination.awsData.awsReferenceId) return destination;
				});
				if (existing) {
					existing.data = awsData;
					_.extend(
						_.findWhere(destinations, function(destination) {
							 if (destination.awsData && destination.awsData.awsReferenceId) return destination; 
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
				var fulfillmentInfo = window.order.get("fulfillmentInfo");//.set("data", awsData );
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
		AmazonPay.init(false);

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
	});
});
