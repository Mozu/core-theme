StartTest(function(t) {
  var m = {};

  t.setOnlyMocks();

  t.simManager().register([{
    url: '/admin/app/order/list',
    jsonFile: '/admin/tests/mocks/Mystic1/Orders1.json'
  }, {
    url: '/admin/app/customer/list',
    jsonFile: '/admin/tests/mocks/Mystic1/CustomerAccounts1.json'
  }, {
    url: '/admin/app/Reference/countries/list',
    jsonFile: '/admin/tests/mocks/Mystic1/Countries1.json'
  }, {
    url: '/admin/app/order/setcustomer',
    getData: function() {},
    doPost: function() {
      return {
        responseText: Ext.encode({
          items: Ext.apply({}, m.setCustomerCfg, m.order.getData())
        }),
        status: 200
      };
    }
  }, {
    url: '/admin/app/order/updatecontactinfo',
    getData: function() {},
    doPost: function() {
      return {
        responseText: Ext.encode({
          items: [{}]
        }),
        status: 200
      };
    }
  }, {
    url: '/admin/app/customer/edit',
    stype: 'json',
    getData: function() {
      return {
        items: [{}]
      };
    },
    doPost: function() {
      return this.doGet.apply(this, arguments);
    }
  }, {
    url: '/admin/app/order/edit',
    stype: 'json',
    getData: function() {
      return {
        items: [{}]
      };
    },
    doPost: function() {
      return this.doGet.apply(this, arguments);
    }
  }]);

  t.chain(
    function(next) {

      t.it('Should have requireable files', function(t) {
        t.requireOk('Taco.view.order.Header', 'Taco.model.Order', next);
      });
    },
    function(next) {

      var n = {};

      t.describe('Header with fully hydrated order', function(t) {
        t.chain(

          function(next) {
            Taco.model.Order.load('0487efc11397e7155443c968000008ed', {
              success: function(record) {
                t.pass('loaded order properly');
                n.order = record;
                next();
              },
              failure: function() {
                t.fail('Failed to load the order');
              }
            });
          },
          function(next) {
            n.header = Ext.create('Taco.view.order.Header', {
              cls: 'order1',
              record: n.order,
              renderTo: Ext.getBody()
            });

            t.waitForComponentVisible(n.header, next);
          },
          function(next) {
            t.isHandleHtml(n.header, 'customerName', 'Jane Doe', 'The customer name display field shows Jane Doe');
            t.isComponentVisible(n.header.down('#addressesContainer'), 'The address templates are visible');
            t.isComponentNotVisible(n.header.down('#customerSelectionContainer'), 'The customer selection is hidden');
            t.isHandleHtml(n.header, 'orderStatus', 'Completed', 'The order status for should be Completed');
            t.isHandleHtml(n.header, 'channelName', 'online', 'The order channel should be Online');
            t.isElementPresent(n.header, '[data-handle="ipAddress"]', 'The IP Address should be visible since this is an Online order');
            next();
          },
          next
        );
      });

    }

    //todo: gm cannot read property isHidden of null
    //function(next) {
    //  var n = {};

    //  t.describe('Header with no customer', function(t) {

    //    t.chain(
    //      function(next) {
    //        Taco.model.Order.load('efdg02340rk203fk02k3r02k3f0', {
    //          success: function(record) {
    //            t.pass('loaded order properly');
    //            n.order = record;
    //            next();
    //          },
    //          failure: function() {
    //            t.fail('Failed to load the order');
    //          }
    //        });
    //      },
    //      function(next) {
    //        n.header = Ext.create('Taco.view.order.Header', {
    //          cls: 'order2',
    //          record: n.order,
    //          renderTo: Ext.getBody()
    //        });

    //        t.waitForComponentVisible(n.header, next);
    //      },
    //      function(next) {
    //        t.isElementNotPresent(n.header, '[data-handle="customerName]', 'The customer link should be hidden');
    //        t.isComponentNotVisible(n.header.down('#addressesContainer'), 'The address templates are hidden');
    //        t.isComponentVisible(n.header.down('#customerSelectionContainer'), 'The customer selection is visible');
    //        t.isElementNotPresent(n.header, '[data-handle="ipAddress"]', 'The IP Address should be hidden since this is not an online order');
    //        t.isHandleHtml(n.header, 'orderSummaryOrderTotal', 'N/A', 'The order summary totals should read N/A until items have been added to order');
    //        next();
    //      },
    //      next
    //    );

    //  });
    //},

    //todo: gm failed to complete within timeframe
    //function(next) {
    //  var n = {};

    //  t.describe('Assign a Customer Account to and order that does not have one', function(t) {
    //    t.chain(
    //      function(next) {
    //        Taco.model.Order.load('efdg02340rk203fk02k3r02k3f0', {
    //          success: function(record) {
    //            t.pass('loaded order properly');
    //            n.order = record;
    //            next();
    //          },
    //          failure: function() {
    //            t.fail('Failed to load the order');
    //          }
    //        });
    //      },
    //      function(next) {
    //        n.header = Ext.create('Taco.view.order.Header', {
    //          cls: 'order3',
    //          record: n.order,
    //          renderTo: Ext.getBody()
    //        });

    //        t.waitForComponentVisible(n.header, next);
    //      },
    //      function(next) {
    //        n.header.on('customerchanged', next);
    //        //t.waitForEvent(n.header, 'customerchanged', next);
    //        m.customerId = 1047;
    //        m.order = n.order;

    //        m.setCustomerCfg = {
    //          customerId: m.customerId,
    //          billingContact: {
    //            "accountId": 1005,
    //            "isShipping": true,
    //            "isPrimaryShipping": false,
    //            "isBilling": true,
    //            "isPrimaryBilling": true,
    //            "id": 1005,
    //            "email": "JackBlack@volusion.com",
    //            "firstName": "Jack",
    //            "middleName": "",
    //            "lastName": "Black",
    //            "companyOrOrganization": "",
    //            "address1": "1308 Horseback Holw",
    //            "address2": "",
    //            "address3": "",
    //            "address4": "",
    //            "cityOrTown": "Austin",
    //            "countryCode": "US",
    //            "postalOrZipCode": "78732",
    //            "stateOrProvince": "Tx",
    //            "addressIsValidated": false,
    //            "addressType": "Residential",
    //            "homePhone": "555-555-5555",
    //            "mobilePhone": "555-555-5555",
    //            "workPhone": ""
    //          },
    //          fulfillmentContact: {
    //            "accountId": 1002,
    //            "isShipping": true,
    //            "isPrimaryShipping": true,
    //            "isBilling": true,
    //            "isPrimaryBilling": false,
    //            "id": 1002,
    //            "firstName": "Jane",
    //            "lastName": "Doe",
    //            "address1": "1835 Kramer Lane",
    //            "address2": "",
    //            "cityOrTown": "Austin",
    //            "countryCode": "US",
    //            "postalOrZipCode": "78759",
    //            "stateOrProvince": "TX",
    //            "addressIsValidated": false,
    //            "addressType": "Residential",
    //            "homePhone": "512-555-2222",
    //            "mobilePhone": "512-555-2222"
    //          }
    //        };
    //        t.clickSelect(n.header.down('#customerSelector'), 1047);
    //      },
    //      function(next, header, record) {
    //        console.log('arguments', arguments.length, arguments);
    //        t.pass('customerchanged fired on the header');
    //        t.is(header, n.header, 'customerchanged event returns the correct header object');
    //        t.is(record.get('emailAddress'), 'janedoe@volusion.com', 'customerchanged event retuns the correct CustomerAccount record');

    //        t.waitForComponentVisible(n.header.down('#addressesContainer'), next);
    //        //t.isComponentVisible(n.header.down('#addressesContainer'), 'The address templates are visible');
    //        //t.isComponentNotVisible(n.header.down('#customerSelectionContainer'), 'The customer selection is hidden');
    //      },
    //      function(next) {
    //        t.isComponentVisible(n.header.down('#addressesContainer'), 'The address templates are visible');
    //        t.isComponentNotVisible(n.header.down('#customerSelectionContainer'), 'The customer selection is hidden');
    //        next();
    //      },
    //      next
    //    );

    //  });

    //}
  );
});