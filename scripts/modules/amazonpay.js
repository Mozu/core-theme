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
			var paymentSettings = _.findWhere(hyprlivecontext.locals.siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PAYWITHAMAZON"}) ||
								_.findWhere(hyprlivecontext.locals.siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PayWithAmazon"});
			if (!paymentSettings || !paymentSettings.isEnabled) return;
			this.isEnabled = paymentSettings.isEnabled;
			var environment = this.getValue(paymentSettings, "environment");
			var isSandbox = environment == "sandbox";
			var region = this.getValue(paymentSettings, "awsRegion") || this.getValue(paymentSettings, "region");
		this.sellerId = this.getValue(paymentSettings, "sellerId");
		this.clientId = this.getValue(paymentSettings, "clientId");
		this.buttonColor = "Gold";
		this.buttonType = "PwA";
		this.usePopUp = true;
			var regionMappings = {"de" : "eu", "uk" : "eu", "us" : "na", "jp" : "jp"};

		if (this.sellerId && this.clientId && loadScript) {
			var self = this;
			var sandboxPath = (isSandbox ? "/sandbox" : "");

			if (region != "us")
				sandboxPath += "/lpa";

			// Suppress known Amazon Pay V1 SDK postMessage bug (for testing/comparison purposes)
			// This is a bug in Amazon's legacy SDK where it uses invalid origin format
			// Remove this when migrating to V2
			var originalError = window.onerror;
			window.onerror = function(message, source, lineno, colno, error) {
				if (typeof message === 'string' && 
					message.indexOf('postMessage') > -1 && 
					message.indexOf('payments.amazon.com') > -1 &&
					source && source.indexOf('amazon') > -1) {
					// Suppress Amazon V1 SDK postMessage error
					return true;
				}
				if (originalError) {
					return originalError(message, source, lineno, colno, error);
				}
				return false;
			};

			var payWithAmazonUrl = "https://static-"+regionMappings[region]+".payments-amazon.com/OffAmazonPayments/"+ region + sandboxPath + "/js/Widgets.js";

			window.onAmazonLoginReady = function() {
				window.amazon.Login.setClientId(self.clientId);
			};

			window.onAmazonPaymentsReady = function() {
				self.isScriptLoaded = true;
				EventBus.trigger("aws-script-loaded");
			};
		
			$.getScript(payWithAmazonUrl).done(function(script, textStatus){
				// Script loaded, widgets will initialize via onAmazonPaymentsReady callback
			}).fail(function(jqxhr, settings, exception) {
				window.console.error("Failed to load Amazon Pay Widgets.js:", exception);
			});
			}
		},
		getValue: function(paymentSetting, key) {
			var value = _.findWhere(paymentSetting.credentials, {"apiName" : key});

			if (!value) 
				return;
			return value.value;
		},
		addCheckoutButton: function(id, isCart, isQuoteOrder) {
			var self = this;
			if (!self.isEnabled) return;
			//var pageContext = require.mozuData('pagecontext');
			var redirectUrl = hyprlivecontext.locals.pageContext.secureHost;
			var checkoutUrl = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled ? "/checkoutv2" : "/checkout";
			var quoteOrderUrl = "/checkout/quoteOrder";

			if (isCart)
				redirectUrl += "/cart?cartId="+id+"&isAwsCheckout=true&view="+self.viewName;
			else if(isQuoteOrder)
				redirectUrl += quoteOrderUrl+"/"+id+"?isAwsCheckout=true&view="+self.viewName;
			else
				redirectUrl += checkoutUrl+"/"+id+"?isAwsCheckout=true&view="+self.viewName;

			var buttonInitialized = false;
			var initButton = function() {
				if (buttonInitialized || !window.OffAmazonPayments) return;
				buttonInitialized = true;
				
				try {
					var authRequest;
					window.OffAmazonPayments.Button("AmazonPayButton", self.sellerId, {
						type:  self.buttonType,
						color: self.buttonColor,
						useAmazonAddressBook: true,
						size: (!isCart ? "small" : "medium"),
						authorization: function() {
							var scope = "profile postal_code payments:widget payments:shipping_address payments:billing_address";
							var loginOptions = {scope: scope, popup: self.usePopUp};
							authRequest = window.amazon.Login.authorize(loginOptions, redirectUrl);
						},
						onError: function(error) {
							window.console.log("AmazonPay widget errorCode: "+error.getErrorCode());
							window.console.log("AmazonPay widget errorMessage: "+error.getErrorMessage());
						}
					});
				} catch(e) {
					window.console.error("Failed to initialize Amazon Pay button:", e);
				}
			};

			EventBus.on("aws-script-loaded", initButton);
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
		var  walletData = {
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