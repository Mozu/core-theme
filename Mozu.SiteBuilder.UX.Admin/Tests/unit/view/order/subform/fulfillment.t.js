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
  }]);

  t.chain(
    function(next) {

      t.it('Should have requireable files', function(t) {
        t.requireOk(
          'Taco.view.order.subform.Fulfillment',
          'Taco.model.Order',
          next
        );
      });
    },
    function(next) {

      var n = {};

      t.describe('The fulfillment subform with an order', function(t) {
        t.chain(

          function(next) {
            Taco.model.Order.load('04b8a8934fdce07924878c5400001777', {
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
            n.header = Ext.create('Taco.view.order.subform.Fulfillment', {
              cls: 'order1',
              record: n.order,
              renderTo: Ext.getBody()
            });

            t.waitForComponentVisible(n.header, next);
          },
          function(next) {

            next();
          },
          next
        );
      });

    }
  );
});