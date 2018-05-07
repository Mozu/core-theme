define(['modules/jquery-mozu','modules/eventbus',"modules/api",'hyprlivecontext','underscore'],
function($,EventBus, Api, hyprlivecontext, _) {
	var AmazonPay = {
		sellerId : "",
		clientId : "",
		buttonColor: "",
		buttonType: "",
		usePopUp: true,
		isEnabled: false,
		isScriptLoaded: false,
		viewName:"amazon-checkout",
		init:function(loadScript) {
			var paymentSettings = _.findWhere(hyprlivecontext.locals.siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PayWithAmazon"});
			if (!paymentSettings || !paymentSettings.isEnabled) return;
			this.isEnabled = paymentSettings.isEnabled;
			var environment = this.getValue(paymentSettings, "environment");
			var isSandbox = environment == "sandbox";
			var region = this.getValue(paymentSettings, "region");
			this.sellerId = this.getValue(paymentSettings, "sellerId");
			this.clientId = this.getValue(paymentSettings, "clientId");
			this.buttonColor = this.getValue(paymentSettings,"buttonColor") || "Gold";
			this.buttonType = this.getValue(paymentSettings,"buttonType") || "PwA";
			this.usePopUp = (this.getValue(paymentSettings, "usepopup") || "true") == "true";
			this.billingType = this.getValue(paymentSettings, "billingAddressOption") ;
			var regionMappings = {"de" : "eu", "uk" : "eu", "us" : "na", "jp" : "jp"};

			if (this.sellerId && this.clientId && loadScript) {
				var self = this;
				window.sandbox = (isSandbox ? "/sandbox" : "");

				if (region != "us")
					window.sandbox += "/lpa";

				var payWithAmazonUrl = "https://static-"+regionMappings[region]+".payments-amazon.com/OffAmazonPayments/"+ region + window.sandbox + "/js/Widgets.js";

				window.onAmazonLoginReady = function() {
					window.amazon.Login.setClientId(self.clientId); //use clientId
				};
			
				$.getScript(payWithAmazonUrl).done(function(scrit, textStatus){
					//console.log(textStatus);
					self.isScriptLoaded = true;
					EventBus.trigger("aws-script-loaded");
				}).fail(function(jqxhr, settings, exception) {
					window.console.log(jqxhr);
				});
			}
		},
		getValue: function(paymentSetting, key) {
			var value = _.findWhere(paymentSetting.credentials, {"apiName" : key});

			if (!value) 
				return;
			return value.value;
		},
		addCheckoutButton: function(id, isCart) {
			var self = this;
			if (!self.isEnabled) return;
			//var pageContext = require.mozuData('pagecontext');
			var redirectUrl = hyprlivecontext.locals.pageContext.secureHost;
			var checkoutUrl = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled ? "/checkoutv2" : "/checkout";

			if (!isCart)
				redirectUrl += checkoutUrl+"/"+id+"?isAwsCheckout=true&view="+self.viewName;
			else
				redirectUrl += "/cart?cartId="+id+"&isAwsCheckout=true&view="+self.viewName;
			EventBus.on("aws-script-loaded", function(){
				var authRequest;
				window.OffAmazonPayments.Button("AmazonPayButton", self.sellerId, { //use seller id
					type:  self.buttonType,
					color: self.buttonColor,
					useAmazonAddressBook: true,
					size: (!isCart ? "small" : "medium"),
					authorization: function() {
						var scope = "profile postal_code payments:widget payments:shipping_address";
						if (self.billingType === "1")
							scope += " payments:billing_address";
						
						var loginOptions = {scope: scope, popup: self.usePopUp};
						authRequest = window.amazon.Login.authorize (loginOptions,redirectUrl);
					},
					onError: function(error) {
						window.console.log("AmazonPay widget errorCode: "+error.getErrorCode());
						window.console.log("AmazonPay widget erorMessage: "+error.getErrorMessage());
					}
				});
			});
		},
		addAddressWidget: function(awsReferenceId) {
			loadAddressWidget(this.sellerId,awsReferenceId);
		},
		addWalletWidget: function(awsReferenceId) {
			loadWalletWidget(this.sellerId, awsReferenceId);
		}
	};
	return AmazonPay;

	function loadWalletWidget(sellerId,awsReferenceId) {
		var divId = "walletWidgetDiv";
		var walletData = {
			sellerId: sellerId,
			onPaymentSelect: function(orderReference) {
				EventBus.trigger("aws-card-selected");
			},
			design : {
				designMode: 'responsive'
			},
			onError: function(error) {
				window.console.log(error.getErrorCode());
				window.console.log(error.getErrorMessage());
			}
		};

		if (awsReferenceId) {
			divId = "readOnlyWalletWidgetDiv";
			walletData.displayMode = "Read";
			walletData.amazonOrderReferenceId = awsReferenceId;
		}
		new window.OffAmazonPayments.Widgets.Wallet(walletData).bind(divId);

	}

	function loadAddressWidget(sellerId,awsReferenceId) {
		var divId = "amazonAddressBookWidgetDiv";
		var addressWalletData = {
			sellerId: sellerId,
			design : {
				designMode: 'responsive'
			},
			onOrderReferenceCreate: function(orderReference) {
				var orderReferenceId = orderReference.getAmazonOrderReferenceId();
				EventBus.trigger("aws-referenceOrder-created", {"orderReferenceId": orderReferenceId});
			},
			onAddressSelect: function(orderReference) {

			},
			onError: function(error) {
				window.console.log("AmazonPay widget errorCode: "+error.getErrorCode());
				window.console.log("AmazonPay widget erorMessage: "+error.getErrorMessage());
			}
		};

		if (awsReferenceId) {
			delete addressWalletData.onOrderReferenceCreate;
			delete addressWalletData.onAddressSelect;
			addressWalletData.displayMode = "Read";
			addressWalletData.amazonOrderReferenceId = awsReferenceId;
		}
		new window.OffAmazonPayments.Widgets.AddressBook(addressWalletData).bind(divId);
	}
	
});