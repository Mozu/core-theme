StartTest(function(t) {
  var m = {};

  t.setOnlyMocks();

  t.simManager().register([{
    url: '/admin/app/order/list',
    jsonFile: '/admin/tests/mocks/Mystic1/Orders1.json'
  }, {
    url: '/admin/app/customer/list',
    jsonFile: '/admin/tests/mocks/Mystic1/CustomerAccounts1.json'
  }]);

  t.chain(
    function(next) {

      t.subTest('Load files', function(t) {
        t.requireOk('Taco.view.order.Header', 'Taco.model.Order', next);
      });
    },
    function(next) {

      t.subTest('Test fully hydrated order', function(t) {

        var n = {};
        t.chain(
          function(next) {
            Taco.model.Order.load('0487efc11397e7155443c968000008ed', {
              success: function(record) {
                t.pass('loaded order properly');
                m.order = record;
                next();
              },
              failure: function() {
                t.fail('fucking hell');
              }
            });
          },
          function(next) {
            m.header = Ext.create('Taco.view.order.Header', {
              cls: 'order1',
              record: m.order,
              renderTo: Ext.getBody()
            });

            t.waitForComponentVisible(m.header, next);
          },
          function(next) {
            t.is(m.header.down('#addressesCmp').isHidden(), false, 'The address templates are visible');
            t.is(m.header.down('#customerSelectionContainer').isHidden(), true, 'The customer selection is hidden');
            t.isField(m.header, 'orderStatus', 'Completed', 'The order status for should be Completed');
          }
        );
      }, next);

    }

  );
});