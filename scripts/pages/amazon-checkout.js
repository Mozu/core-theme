require(["modules/jquery-mozu","modules/backbone-mozu",'modules/editable-view', "modules/eventbus","underscore", 
	"modules/amazonPay","modules/models-amazoncheckout"], 
	function ($,Backbone, EditableView, EventBus, _, AmazonPay, AmazonCheckoutModels) {
 

	var AmazonCheckoutView = EditableView.extend({
		templateName: 'modules/checkout/amazon-shipping-billing',
		initialize: function() {
			EventBus.on("aws-referenceOrder-created", this.setawsOrderData);
			EventBus.on("aws-card-selected", function() {
				$("#continue").show();
			});

			this.listenTo(this.model, "awscheckoutcomplete", function(id){
				window.location = "/checkout/"+id+"?isAwsCheckout=true&access_token="+$.deparam().access_token;
			});
			
		},
		setawsOrderData: function(data) {
			var awsData = { awsReferenceId: data.orderReferenceId, addressAuthorizationToken:$.deparam().access_token};
			//window.order.addAwsReference(awsData);
			var fulfillmentInfo = window.order.get("fulfillmentInfo");//.set("data", awsData );
			fulfillmentInfo.data = awsData;
			window.order.set("fulfillmentInfo", fulfillmentInfo);
		},
		redirectToCart: function() {
			amazon.Login.logout();
			window.location = document.referrer;
		},
		submit: function(){
			this.model.submit();			
		}
	});


	$(document).ready(function () {
		AmazonPay.init(false);

		var checkoutData = require.mozuData('checkout');
		var checkoutModel = window.order = new AmazonCheckoutModels.AwsCheckoutPage(checkoutData);
		window.checkoutView =  new AmazonCheckoutView({
									el: $('#shippingBillingTbl'),
									model: checkoutModel,
									messagesEl: $('[data-mz-message-bar]')
								});

		AmazonPay.addAddressWidget();
		AmazonPay.addWalletWidget();
	});
});
