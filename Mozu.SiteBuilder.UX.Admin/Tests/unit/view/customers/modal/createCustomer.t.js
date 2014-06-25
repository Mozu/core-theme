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
    url: '/admin/app/customer/create',
    stype: 'json',
    getData: function() {
      return {
        items: [{
          id: 123456
        }]
      };
    },
    doPost: function() {
      return this.doGet.apply(this, arguments);
    }
  }, {
    url: '/admin/app/order/setcustomer',
    getData: function() {},
    doPost: function() {
      return {
        responseText: Ext.encode({
          items: [{
            customerId: 123456
          }]
        }),
        status: 200
      };
    }
  }]);

  t.chain(
    function(next) {

      t.it('Should have requireable files', function(t) {
        t.requireOk(
          'Taco.view.customers.modal.CreateCustomer',
          'Taco.model.CustomerAccount',
          next
        );
      });

    },

    function(next) {
      var n = {};

      n.data = {
        firstName: 'Taco',
        lastName: 'Johnson',
        emailAddress: 'taco@volusion.com',
        taxId: '1231234'
      };

      t.describe('The Create Customer modal', function(t) {

        t.chain(
          function(next) {
            Taco.model.Order.load('efdg02340rk203fk02k3r02k3f0', {
              success: function(record) {
                n.order = record;
                next();
              },
              failure: function() {
                t.fail('Failed to load the order');
              }
            });
          },
          function(next) {
            n.modal = Ext.create('Taco.view.customers.modal.CreateCustomer', {
              order: n.order,
              callback: function() {
                n.callback();
              }
            });

            t.waitForComponentVisible(n.modal, next);
          },
          function(next) {

            t.it('Should be visible', function(t) {
              t.isComponentVisible(n.modal, 'Modal is visible');
              next();
            });
          },
          function(next) {
            n.form = n.modal.down('#customerCreateForm');
            t.click(n.form.down('#taxExemptCheckbox'), next);
          },
          function(next) {
            t.it('Should Load save customer and append customer to order', function(t) {

              t.chain(
                function(next) {
                  t.setFormValues('Enter customer values', n.form, n.data, next);
                },
                function(next) {
                  n.modal.on('savesuccess', next);
                  t.click(n.modal.down('#primaryAction'));
                },
                function(next) {
                  t.validateRecordValues('Verify customer values', n.order.getCustomer(), n.data, next);
                },
                next
              )

            });
          },
          function(next) {
            t.it('Should load up the Contacts Modal and Address Modal', function(t) {
              n.contacts = Ext.ComponentQuery.query('taco-contacts-modal')[0];
              n.address = Ext.ComponentQuery.query('taco-address-modal')[0];

              t.isComponentVisible(n.contacts, 'The contacts modal was rendered');
              t.isComponentVisible(n.address, 'The address modal was rendered');
            });

            t.it('Should fire the callback method when complete', function(t) {
              t.chain(
                function(next) {
                  t.setFormValues('Enter new address data', n.address.down('form'), {
                    firstName: 'New',
                    lastName: 'Customer',
                    email: 'new@contact.com',
                    address1: '123 New Street',
                    cityOrTown: 'Austin',
                    stateOrProvince: 'TX',
                    postalOrZipCode: '78758',
                    homePhone: '123-456-7890'
                  }, next);
                },
                function(next) {
                  n.address.on('savesuccess', next);
                  t.diag('Click save on Address Modal');
                  t.click(n.address.down('button[text="Save"]'));
                },
                function(next) {
                  t.waitForComponentVisible(n.contacts, next);
                },
                function(next) {
                  n.callback = next;
                  t.diag('Click save on Contacts Modal');
                  t.click(n.contacts.down('button[text="Save"]'));
                },
                function(next) {
                  t.pass('Callback successfully fired');
                  next();
                },
                next
              )
            });
          },
          next
        );

      });
    }
  );
});