StartTest(function (t) {
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
    getData: function () {
      return {
        items: [{}]
      };
    },
    doPost: function () {
      return this.doGet.apply(this, arguments);
    }
  }, {
    url: '/admin/app/order/updatecontactinfo',
    getData: function () {},
    doPost: function () {
      return {
        responseText: Ext.encode({
          items: [m.orderData],
          success: true
        }),
        status: 200
      };
    }
  }, {
    url: '/admin/app/order/edit',
    stype: 'json',
    getData: function () {
      return {
        items: [{}]
      };
    },
    doPost: function () {
      return this.doGet.apply(this, arguments);
    }
  }]);

  t.chain(
    function (next) {

      t.it('Should have requireable files', function (t) {
        t.requireOk(
          'Taco.view.customers.modal.Contacts',
          'Taco.model.CustomerAccount',
          'Taco.model.Order',
          next
        );
      });

    },


    /**** DESCRIBE: The Contacts Modal with an Order and New Customer ****/

    function (next) {
      var n = {};

      t.describe('The Contacts Modal with an Order and New Customer', function (t) {
        Taco.app.viewPort.removeAll(true);

        t.chain(
          function (next) {
            Taco.model.Order.load('asdf02340rk203fk02k3r02k3f0', {
              success: function (record) {
                n.order = record;
                next();
              },
              failure: function () {
                t.fail('Failed to load the order');
              }
            });
          },
          function (next) {
            n.order.loadCustomer({
              success: function (record) {
                n.customer = record;
                next();
              },
              failure: function () {
                t.fail('Failed to load the customer from the order');
              }
            });
          },
          function (next) {
            n.modal = Ext.create('Taco.view.customers.modal.Contacts', {
              record: n.customer,
              order: n.order,
              callback: function () {
                n.callback();
              },
              isNewCustomer: true,
              listeners: {
                activate: next
              }
            });
          },
          function (next) {

            t.it('Should launch address modal for new contact', function (t) {
              t.chain({
                  waitFor: 5
                },
                function (next) {
                  n.address = Ext.ComponentQuery.query('taco-address-modal')[0];
                  t.isComponentVisible(n.address, 'Address modal automatically popped up');

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
                function (next) {
                  n.address.on('savesuccess', next);
                  t.click(n.address.down('button[text="Save"]'));
                },
                function (next) {
                  t.isHandleHtml(n.modal, 'contact-address1', '123 New Street', 'The new contact was rendered saved and rendered correctly');
                  next();
                },
                next
              )
            });

          },

          function (next) {

            t.it('Should add new address when New Address is clicked', function (t) {
              t.chain(
                function (next) {
                  t.click(n.modal.down('#addNewContact'), next);
                },
                function (next) {
                  n.address = Ext.ComponentQuery.query('taco-address-modal')[0];
                  t.isComponentVisible(n.address, 'Address modal popped up');

                  t.setFormValues('Enter new address data', n.address.down('form'), {
                    firstName: 'New',
                    lastName: 'Customer',
                    email: 'new@contact.com',
                    address1: '123 New Street BBB',
                    cityOrTown: 'Austin',
                    stateOrProvince: 'TX',
                    postalOrZipCode: '78758',
                    homePhone: '123-456-7890'
                  }, next);

                },
                function (next) {
                  n.address.on('savesuccess', next);
                  t.click(n.address.down('button[text="Save"]'));
                },
                function (next) {
                  t.isHandleHtml(n.modal, 'contact-address1', '123 New Street BBB', 'The new contact was rendered saved and rendered correctly', 1);
                  next();
                },
                next
              );


            });
          },

          function (next) {
            t.it('Should fire Callback fn when one is provided', function (t) {
              t.chain(
                function (next) {
                  n.callback = next;
                  m.orderData = n.order.getData();
                  t.click(n.modal.down('button[text="Save"]'));
                },
                function (next) {
                  t.pass('Callback successfully called');
                  next();
                },
                next
              );


            });
          },
          next
        );
      });
    },


    /**** DESCRIBE: The Contacts Modal with an Order that has one matching Contact ****/

    function (next) {
      var n = {};

      t.describe('The Customer Contacts Modal with an Order that has one matching Contact', function (t) {
        t.chain(
          function (next) {
            Taco.model.Order.load('0487efc11397e7155443c968001008ab', {
              success: function (record) {
                n.order = record;
                next();
              },
              failure: function () {
                t.fail('Failed to load the order');
              }
            });
          },
          function (next) {
            n.order.loadCustomer({
              success: function (record) {
                n.customer = record;
                next();
              },
              failure: function () {
                t.fail('Failed to load the customer from the order');
              }
            });
          },
          function (next) {
            n.modal = Ext.create('Taco.view.customers.modal.Contacts', {
              cls: 'address1',
              record: n.customer,
              order: n.order
            });

            t.waitForComponentVisible(n.modal, next);
          },

          function (next) {

            t.it('Should not persist edits to order or customer account if cancel is clicked', function (t) {

              var address1 = '1234 Customer Change St';

              t.chain(
                function (next) {
                  var orderContact = n.modal.down('[isFromOrder="true"]');

                  t.is(n.customer.get('contacts').length, 3, 'The customer has 3 contacts no start with');

                  t.click(orderContact.down('button[text="Edit"]'), next);
                },
                function (next) {
                  n.addressModal = Ext.ComponentQuery.query('taco-address-modal')[0];

                  t.setFormValues('Change the address1 field', n.addressModal.down('form'), {
                    address1: address1
                  }, next);
                },
                function (next) {
                  n.addressModal.on('savesuccess', next);
                  t.click(n.addressModal.down('button[text="Save"]'));
                },
                function (next) {
                  var contact = n.modal.down('[isFromOrder="false"][contactId=0]'),
                    orderContact = n.modal.down('[isFromOrder="true"]');

                  t.is(!!orderContact, false, 'There is no longer an order contact');

                  t.isHandleHtml(contact, 'contact-address1', address1, 'The first contact address should reflect the changed address: ' + address1);

                  t.is(contact.down('radiofield[name="customerBillToAddress"]').getValue(), true, 'The editted address is still selected as the bill to address');

                  t.is(n.modal.query('container[contact]').length, 4, '4 contacts are rendered');

                  t.is(n.customer.get('contacts').length, 4, 'The customer now has 4 contacts');

                  t.click(n.modal.down('button[text="Cancel"]'), next);
                },
                function (next) {
                  t.diag('Cancel button clicked, reverting chanegs to order and customer');
                  t.is(n.customer.get('contacts').length, 3, 'The customer has 3 contacts no that it has been reversed');
                  t.is(n.order.get('billingContact').address1, '123 Kramer Lane', 'The billing contact has been rolled back successfully on the order');
                  next();
                },
                next
              )
            });
          },

          function (next) {
            t.it('Should not persist delete to customer contacts if cancel is clicked', function (t) {
              t.chain(
                function (next) {
                  n.modal = Ext.create('Taco.view.customers.modal.Contacts', {
                    cls: 'address1',
                    record: n.customer,
                    order: n.order
                  });

                  t.waitForComponentVisible(n.modal, next);
                },
                function (next) {
                  t.is(n.customer.get('contacts').length, 3, 'There are 3 existing contacts on the customer');
                  t.click(n.modal.down('#deleteButton:not({isHidden()})'), next);
                },
                function (next) {
                  t.click(Taco.MessageBox.down('button[text="OK"]'), next);
                },
                function (next) {
                  t.is(n.customer.get('contacts').length, 2, 'There are now 2 contacts on the customer');
                  t.click(n.modal.down('button[text="Cancel"]'), next);
                },
                function (next) {
                  t.is(n.customer.get('contacts').length, 3, 'There are now 3 contacts on the customer');
                  next();
                },
                next
              )
            });
          },

          function (next) {
            t.it('Should persist changes to customer and order if Save is clicked', function (t) {
              var address1 = '1234 Customer Change St';

              t.chain(
                function (next) {
                  n.modal = Ext.create('Taco.view.customers.modal.Contacts', {
                    cls: 'address1',
                    record: n.customer,
                    order: n.order
                  });

                  t.waitForComponentVisible(n.modal, next);
                },
                function (next) {
                  var orderContact = n.modal.down('[isFromOrder="true"]');

                  t.is(n.customer.get('contacts').length, 3, 'The customer has 3 contacts no start with');

                  t.click(orderContact.down('button[text="Edit"]'), next);
                },
                function (next) {
                  n.addressModal = Ext.ComponentQuery.query('taco-address-modal')[0];

                  t.setFormValues('Change the address1 field', n.addressModal.down('form'), {
                    address1: address1
                  }, next);
                },
                function (next) {
                  n.addressModal.on('savesuccess', next);
                  t.click(n.addressModal.down('button[text="Save"]'));
                },
                function (next) {
                  t.waitForComponentVisible(n.modal, next);
                },
                function (next) {
                  var contact = n.modal.down('[isFromOrder="false"][contactId=0]'),
                    orderContact = n.modal.down('[isFromOrder="true"]');

                  t.is(!!orderContact, false, 'There is no longer an order contact');

                  t.isHandleHtml(contact, 'contact-address1', address1, 'The first contact address should reflect the changed address: ' + address1);

                  t.is(contact.down('radiofield[name="customerBillToAddress"]').getValue(), true, 'The editted address is still selected as the bill to address');

                  t.is(n.modal.query('container[contact]').length, 4, '4 contacts are rendered');

                  t.is(n.customer.get('contacts').length, 4, 'The customer now has 4 contacts');

                  t.is(n.customer.dirty, true, 'The Customer should be Dirty');
                  t.is(n.order.dirty, true, 'The Order should be Dirty');

                  m.orderData = n.order.getData();

                  n.modal.on('savesuccess', next);

                  t.click(n.modal.down('button[text="Save"]'));
                },
                function (next) {
                  t.diag('Save button clicked, persisting chanegs to order and customer');
                  t.is(n.customer.dirty, false, 'The Customer should be commited');
                  t.is(n.order.dirty, false, 'The Order should be commited');
                  t.is(n.customer.get('contacts').length, 4, 'The customer has 4 contacts now');
                  t.is(n.order.get('billingContact').address1, address1, 'The billing contact has been updated correctly');
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