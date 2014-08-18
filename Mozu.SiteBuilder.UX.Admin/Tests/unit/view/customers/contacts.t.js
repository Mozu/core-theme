StartTest(function (t) {
  var m = {};

  m.skip = function () {
    if (!m.run) {
      m.run = [1, 1, 1, 1];
      m.runCount = 0;
    }

    return !m.run[m.runCount++];
  };

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
  }]);

  t.chain(
    function (next) {

      t.it('Should have requireable files', function (t) {
        t.requireOk(
          'Taco.view.customers.Contacts',
          'Taco.model.CustomerAccount',
          'Taco.model.Order',
          'Taco.store.Countries',
          next
        );
      });

    },


    /**** DESCRIBE: The Customer Contacts with no Order ****/

    function (next) {
      var n = {};

      n.data = {
        firstName: 'Taco',
        lastName: 'Johnson',
        emailAddress: 'taco@volusion.com',
        taxId: '1231234'
      };

      if (m.skip()) {
        return next();
      }

      t.describe('The Customer Contacts with no Order', function (t) {

        t.chain(
          function (next) {
            Taco.model.CustomerAccount.load(1047, {
              success: function (record) {
                n.customer = record;
                next();
              },
              failure: function () {
                t.fail('Failed to load the customer');
              }
            });
          },
          function (next) {
            n.contacts = Ext.create('Taco.view.customers.Contacts', {
              cls: 'address1',
              record: n.customer
            });

            Taco.app.viewPort.add(n.contacts);

            t.waitForComponentVisible(n.contacts, next);

          },
          function (next) {
            t.it('Should hide radiofields', function (t) {
              t.isComponentNotVisible(n.contacts.down('radiofield'), 'Radio input fields hidden by default');
            });

            t.it('Should have Edit buttons that load the contact when clicked', function (t) {
              var tests = [],
                addressContainers = n.contacts.query('[itemType="addressContainer"]');

              Ext.each(addressContainers, function (addressContainer) {
                var button = addressContainer.down('#editButton'),
                  expectedAddress = addressContainer.contact.address1;

                tests.push(function (next) {
                  t.click(button, next);
                });

                tests.push(function (next) {
                  var modal = Ext.ComponentQuery.query('taco-address-modal')[0],
                    actualAddress;

                  t.is(!!modal, true, 'Address modal launched when edit was clicked');

                  actualAddress = modal.down('form').getForm().findField('address1').getValue();

                  t.is(actualAddress, expectedAddress, 'The address in the form matches the contact: ' + expectedAddress);

                  t.click(modal.down('button[text="Cancel"]'), next);
                });
              });

              tests.push(next);

              t.chain(tests);
            });

          },

          function (next) {

            t.it('Should delete the Contact only when the user is prompted and confirms', function (t) {
              var addressContainers = n.contacts.query('[itemType="addressContainer"]'),
                cancelContact = addressContainers[0],
                deleteContact = addressContainers[1];

              t.chain(
                function (next) {
                  t.click(cancelContact.down('#deleteButton'), next);
                },
                function (next) {
                  t.isHandlePresent(n.contacts, 'contact-' + cancelContact.contact.id, 'Found the correct address when delete is clicked');

                  t.click(Taco.MessageBox.down('button[text="Cancel"]'), next);
                },
                function (next) {
                  t.isHandlePresent(n.contacts, 'contact-' + cancelContact.contact.id, 'Contact was not deleted since Cancel was clicked');

                  t.click(deleteContact.down('#deleteButton'), next);
                },
                function (next) {
                  t.isHandlePresent(n.contacts, 'contact-' + deleteContact.contact.id, 'Found the correct address when delete is clicked');

                  t.click(Taco.MessageBox.down('button[text="OK"]'), next);
                },
                function (next) {
                  t.isHandleNotPresent(n.contacts, 'contact-' + deleteContact.contact.id, 'Contact was deleted since OK was clicked');
                  next();
                },
                next
              );
            });
          },


          function (next) {
            t.it('Should show the results of a Contact change after completing an edit', function (t) {
              var currentAddressContainer = n.contacts.down('[itemType="addressContainer"]'),
                currentContact = currentAddressContainer.contact,
                expectedAddress = currentContact.address1,
                newAdress = '1835a Kramer Lane';

              t.chain(
                function (next) {

                  t.click(currentAddressContainer.down('#editButton'), next);
                },
                function (next) {
                  var actualAddress;

                  n.modal = Ext.ComponentQuery.query('taco-address-modal')[0];

                  t.is(!!n.modal, true, 'Found Address Modal when Edit Address was clicked');

                  actualAddress = n.modal.down('form').getForm().findField('address1').getValue();

                  t.is(actualAddress, expectedAddress, 'The address in the form should match the Contact that was clicked for edit');

                  t.setFormValues('Change the address1 field', n.modal.down('form'), {
                    address1: newAdress
                  }, next);
                },
                function (next) {
                  n.modal.on('savesuccess', next);
                  t.click(n.modal.down('button[text="Save"]'));
                },
                function (next) {
                  var address1 = n.contacts.getEl().down('[data-handle="contact-' + currentContact.id + '"] [data-handle="contact-address1"]').getHTML();
                  t.is(address1, newAdress, 'The first contact address should reflect the changed address: ' + newAdress);
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


    /**** DESCRIBE: The Customer Contacts with an Order with no contacts and a customer with no contacts ****/

    function (next) {
      var n = {};

      if (m.skip()) {
        return next();
      }

      t.describe('The Customer Contacts with an Order with no contacts and a customer with no contacts', function (t) {
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
            n.contacts = Ext.create('Taco.view.customers.Contacts', {
              cls: 'address1',
              record: n.customer,
              order: n.order
            });

            Taco.app.viewPort.add(n.contacts);

            t.waitForComponentVisible(n.contacts, next);
          },
          function (next) {
            t.it('Should create a new contact when none are present', function (t) {

              t.chain(
                function (next) {
                  n.contacts.createNewContact();
                  next();
                },
                function (next) {
                  n.modal = Ext.ComponentQuery.query('taco-address-modal')[0];
                  t.isComponentVisible(n.modal, 'The modal should be visible');

                  t.setFormValues('Enter new address data', n.modal.down('form'), {
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
                  t.click(n.modal.down('button[text="Save"]'), next);
                },
                function (next) {
                  t.pass('done');
                  next();
                },
                next
              );
            });
          },

          function (next) {
            t.it('Should select the first contact as shipping and billing if no other contacts', function (t) {
              t.is(n.contacts.down('[name="customerShipToAddress"]').getValue(), true, 'Customer Ship To Address is checked');
              t.is(n.contacts.down('[name="customerBillToAddress"]').getValue(), true, 'Customer Bill To Address is checked');
              next();
            });
          },
          next
        );
      });
    },


    /**** DESCRIBE: The Customer Contacts with an Order that has one matching Contact ****/

    function (next) {
      var n = {};

      if (m.skip()) {
        return next();
      }

      t.describe('The Customer Contacts with an Order that has one matching Contact', function (t) {
        Taco.app.viewPort.removeAll(true);

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
            n.contacts = Ext.create('Taco.view.customers.Contacts', {
              cls: 'address1',
              record: n.customer,
              order: n.order
            });

            Taco.app.viewPort.add(n.contacts);

            t.waitForComponentVisible(n.contacts, next);

            m.contacts = n.contacts;
          },

          function (next) {
            t.it('Should render and be visible', function (t) {
              t.isComponentVisible(n.contacts, 'contacts view is visible');
            });

            t.it('Should display each of the radio boxes', function (t) {
              Ext.each(n.contacts.query('radiofield'), function (radio, i) {
                t.isComponentVisible(radio, 'Radiofield ' + (1 + i) + ' is visible: ' + radio.name);
              });
            });

            t.it('Should merge the order contacts with the customer contacts', function (t) {
              var orderContacts = n.contacts.getEl().query('[data-contact-type="order"]'),
                customerContacts = n.contacts.getEl().query('[data-contact-type="customer"]');

              t.is(orderContacts.length, 1, 'Found 1 order contact');
              t.is(customerContacts.length, 3, 'Found 3 customer contacts');
            });

            t.it('Should select the current Order Billing and Shipping addresses', function (t) {
              var selection = n.contacts.getSelection();
              t.is(selection.customerShipToAddress.id, 1008, 'Correct shipping address is selected');
              t.is(selection.customerBillToAddress.id, 0, 'Correct billing address is selected');
            });

            t.it('Should Hide delete buttons for Order Contacts', function (t) {
              var orderContacts = n.contacts.query('[isFromOrder="true"]');
              t.is(orderContacts.length, 1, 'Expected 1 Order Contact');
              t.isComponentNotVisible(orderContacts[0].down('button[text="Delete"]'), 'Delete button hidden');
            });

            t.it('Should Show delete buttons for Customer Contacts', function (t) {
              var customerContacts = n.contacts.query('[isFromOrder="false"]');

              t.is(customerContacts.length, 3, 'Expected 3 Customer Contacts');

              Ext.each(customerContacts, function (contact, index) {
                t.isComponentVisible(contact.down('button[text="Delete"]'), index + ' Delete button hidden');
              });
            });

            next();
          },
          function (next) {
            var address1 = '1234 Customer Change St';

            t.it('Should add the order contact to the customer after editing an order contact while keeping Address selection state', function (t) {
              var orderContact = n.contacts.down('[isFromOrder="true"]'),
                currentContact = orderContact.contact;

              t.chain(
                function (next) {
                  t.click(orderContact.down('button[text="Edit"]'), next);
                },
                function (next) {

                  n.modal = Ext.ComponentQuery.query('taco-address-modal')[0];

                  t.setFormValues('Change the address1 field', n.modal.down('form'), {
                    address1: address1
                  }, next);
                },
                function (next) {
                  n.modal.on('savesuccess', next);
                  t.click(n.modal.down('button[text="Save"]'));
                },

                function (next) {
                  var customerContacts = n.contacts.query('[isFromOrder="false"]'),
                    orderContact = n.contacts.down('[isFromOrder="true"]'),
                    customerContact;

                  t.is(!!orderContact, false, 'There is no longer an order contact');

                  customerContact = Ext.Array.findBy(customerContacts, function (item) {
                    return item.contact && item.contact.id.toString() === currentContact.id.toString();
                  });

                  t.isHandleHtml(customerContact, 'contact-address1', address1, 'The first contact address should reflect the changed address: ' + address1);

                  t.is(customerContact.down('radiofield[name="customerBillToAddress"]').getValue(), true, 'The editted address is still selected as the bill to address');

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


    /**** DESCRIBE: The Customer Contacts with an Order that has two different Contact ****/

    function (next) {
      var n = {};

      if (m.skip()) {
        return next();
      }

      t.describe('The Customer Contacts with an Order that has two different Contacts', function (t) {
        Taco.app.viewPort.removeAll(true);

        t.chain(
          function (next) {
            Taco.model.Order.load('0487efc11397e7155443c968000008ed', {
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
            n.contacts = Ext.create('Taco.view.customers.Contacts', {
              cls: 'address2',
              record: n.customer,
              order: n.order
            });

            Taco.app.viewPort.add(n.contacts);

            setTimeout(next, 10);
          },

          function (next) {
            t.it('Should select the current Order Billing and Shipping addresses', function (t) {
              var selection = n.contacts.getSelection();
              t.is(selection.customerShipToAddress.id, 0, 'Correct shipping address is selected');
              t.is(selection.customerBillToAddress.id, 0, 'Correct billing address is selected');
              next();
            });
          },

          function (next) {
            var shipping = Ext.Array.findBy(n.contacts.query('[name="customerShipToAddress"]'), function (item) {
                return item.inputValue && item.inputValue.id === 1002;
              }),
              billing = Ext.Array.findBy(n.contacts.query('[name="customerBillToAddress"]'), function (item) {
                return item.inputValue && item.inputValue.id === 1005;
              });

            t.click(shipping);
            t.click(billing, next);
          },

          function () {
            t.it('Should return the correct selection when the user selects a different address', function (t) {
              var selection = n.contacts.getSelection();

              t.is(selection.customerShipToAddress.id, 1002, 'Correct shipping address is selected');
              t.is(selection.customerBillToAddress.id, 1005, 'Correct billing address is selected');
            });
          }
        );
      });

    }


  );
});