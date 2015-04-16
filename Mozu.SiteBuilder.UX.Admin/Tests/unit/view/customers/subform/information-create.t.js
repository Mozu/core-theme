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

      //return next();

      t.subTest('Test the creation of a new customer', function(t) {

        t.chain(
          function(next) {
            n.form = Ext.create('Ext.form.Panel', {
              items: [
                Ext.create('Taco.view.customers.subform.Information')
              ],
              renderTo: Ext.getBody()
            });

            t.waitForComponentVisible(n.form, next);
          },
          function(next) {
              t.isComponentVisible(n.form.down('#createAccountCheckbox'), 'The create account checkbox should be visible on new customers');
              t.isHandleHtml(n.form, 'customer-since', Ext.Date.format(new Date(), 'm/d/Y'), 'The customer since date is should be today\'s date');
              t.isHandleHtml(n.form, 'customer-total-spent', 'N/A', 'The customer lifetime value is N/A');
              t.isHandleHtml(n.form, 'customer-order-count', 'N/A', 'The customer fulfilled order count is N/A');
              t.isHandleHtml(n.form, 'customer-visit-count', 'N/A', 'The customer total visit count is N/A');

            t.isComponentNotVisible(n.form.down('#taxExemptIdField'), 'Tax ID field should be hidden by default');
            t.click(n.form.down('#taxExemptCheckbox'), next);
          },
          function(next) {
            t.isComponentVisible(n.form.down('#taxExemptIdField'), 'Tax ID field should be visible if tax exempt is checked');
            t.click(n.form.down('#taxExemptCheckbox'), next);
          },
          function(next) {
            t.isComponentNotVisible(n.form.down('#taxExemptIdField'), 'Tax ID field should be hidden by default');
            t.click(n.form.down('#taxExemptCheckbox'), next);
          },
          function(next) {
            t.setFormValues('Enter customer values', n.form, {
              firstName: 'Taco',
              lastName: 'Johnson',
              emailAddress: 'taco@volusion.com',
              taxId: '123090493029409234'
            }, next);
          }
        );

      }, next);
    }
  );
});