Ext.widget({
  xtype: "mz-form-widget",
  itemId: "borderfree-order-tracking-options",
  width: 300,
  height: 250,
  initComponent: function() {
    var me = this;
    Ext.Ajax.request({
      url: "/admin/app/entities/read?list=bfsettings@mozuadmin&entityType=mzdb",
      method: "get",
      success: function(res) {
        var response = JSON.parse(res.responseText);
        if (response.items.length > 0) {
          var isValid = me.checkValidation(response.items[0].item);
          if (isValid) {
            try {
              var countryCodeInput = me.down("#countrycode"),
              currencyCodeInput = me.down("#currencycode"),
              environment = me.down("#environment");
              countryCodeInput.setValue(
                response.items[0].item.bf_merchant_country_code
              );
              currencyCodeInput.setValue(
                response.items[0].item.bf_merchant_currency_code
              );
              environment.setValue(
                response.items[0].item.bf_environment
              );
            } catch (e) {
              console.log(e);
            }
          } else {
            var errormessage = me.down("#errormessage");
            errormessage.setVisible(true);
          }
        } else {
          var errormessage = me.down("#errormessage");
          errormessage.setVisible(true);
        }
      }
    });
    this.items = [
      {
        xtype: "panel",
        items: [
          {
            xtype: "mz-input-text",
            fieldLabel: "Country",
            itemId: "countrycode",
            name: "country",
            readOnly: true,
            anchor: "100%",
            allowBlank: false
          },
          {
            xtype: "mz-input-text",
            fieldLabel: "Currency Code",
            itemId: "currencycode",
            name: "currency",
            readOnly: true,
            anchor: "100%",
            allowBlank: false
          },
          {
            xtype: "mz-input-text",
            fieldLabel: "Environment",
            itemId: "environment",
            name: "environment",
            readOnly: true,
            hidden:true,
            anchor: "100%",
            allowBlank: false
          },
          {
            xtype: "label",
            html: "<p>Please complete the borderfree App configuration!</p>",
            itemId: "errormessage",
            hidden: true,
            style: "color:#ff4400"
          }
        ]
      }
    ];
    this.superclass.initComponent.apply(this, arguments);
  },
  checkValidation: function(configData) {
    var isValid = true;
    for (var i in configData) {
      if (!configData[i]) {
        isValid = false;
        break;
      }
    }
    return isValid;
  }
});
