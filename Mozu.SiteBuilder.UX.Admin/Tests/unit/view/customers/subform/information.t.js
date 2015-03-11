StartTest(function(t) {
  var m = {};

  t.setOnlyMocks();

  t.simManager().register([{
    url: '/admin/app/customer/list',
    jsonFile: '/admin/tests/mocks/Mystic1/CustomerAccounts1.json'
  }]);

  t.chain(
    function(next) {

      t.subTest('Load files', function(t) {
        t.requireOk(
          'Taco.view.customers.subform.Information',
          'Taco.model.CustomerAccount',
          next
        );
      });

    },

    function(next) {
      var n = {};

      t.subTest('Test the loading of an existing customer', function(t) {

        t.chain(
          function(next) {
              Taco.model.CustomerAccount.load(1047, {
              success: function(record) {
                t.pass('loaded customer properly');
                n.customer = record;
                next();
              },
              failure: function() {
                t.fail('Failed to load the order');
              }
            });
          },
          function(next) {
            n.form = Ext.create('Ext.form.Panel', {
              items: [
                Ext.create('Taco.view.customers.subform.Information', {
                  record: n.customer
                }),
              ],
              renderTo: Ext.getBody()
            });

            t.waitForComponentVisible(n.form, next);
          },
          function(next) {
              n.form.getForm().setValues(n.customer.getData());
              t.isComponentNotVisible(n.form.down('#createAccountCheckbox'), 'The create account checkbox should be hidden on existing customers');
              t.isHandleHtml(n.form, 'customer-since', '04/14/2014', 'The customer since date is correct');
              t.isHandleHtml(n.form, 'customer-total-spent', '$100.99', 'The customer lifetime value is correct');
              t.isHandleHtml(n.form, 'customer-order-count', '1', 'The customer fulfilled order count is correct');
              t.isHandleHtml(n.form, 'customer-visit-count', '0', 'The customer total visit count is correct');
              t.isComponentVisible(n.form.down('#taxExemptIdField'), 'The Tax ID field should be visible since the customer is tax exempt');


          }
        );

      }, next);
    }
  );
});