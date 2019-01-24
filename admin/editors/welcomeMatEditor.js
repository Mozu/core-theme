Ext.widget({
  xtype: "mz-form-widget",
  itemId: "welcome-mat-options-editor",
  width: 300,
  height: 250,
  initComponent: function() {
    var me = this;
    var appEntity = window.Taco.customSchema.find(function(element) {
      return element.name == "bfsettings";
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
    if (appEntity && appEntity.nameSpace) {
      Ext.Ajax.request({
        url:
          "/admin/app/entities/read?list=bfsettings@" +
          appEntity.nameSpace +
          "&entityType=mzdb",
        method: "get",
        success: function(res) {
          var response = JSON.parse(res.responseText);
          if (response.items.length > 0) {
            var isValid = me.checkValidation(response.items[0].item);
            if (isValid) {
              try {
                var countryCodeInput = me.down("#countrycode");
                var currencyCodeInput = me.down("#currencycode");
                countryCodeInput.setValue(
                  response.items[0].item.bf_merchant_country_code
                );
                currencyCodeInput.setValue(
                  response.items[0].item.bf_merchant_currency_code
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
    } else {
      var errormessage = me.down("#errormessage");
      errormessage.setVisible(true);
    }
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
