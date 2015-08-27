StartTest(function(t) {
    var m = {};

    //Bug 28406:SEO fields missing for CMS pages in Site Builder

    m.record = Ext.create('Taco.model.Order', {
        "id": "abc",
        "orderNumber": 2,
        "name": "seo-name",
        "orderStatus": "Processing"
    });

    t.setOnlyMocks();


    t.chain(

        function(next) {
            Taco.app.viewPort.removeAll(true);
            m.panel = Ext.create(
                'Taco.view.order.subform.Payment', { record: m.record, width: 500 }
            );
            Taco.app.viewPort.add(m.panel);

            t.waitForComponentVisible(m.panel, next);

        },
        function(next) {


            t.diag("payment actions should be available when order is processing");

            Ext.Object.each(m.panel.paymentActions, function(k, action) {
                t.notOk(action.isDisabled(), k + " is enabled");
            });



            //t.elementIsVisible(m.panel.down('#paymentGear').getEl(), 'gear shoul be visable on Processing');

            m.record.set('orderStatus', 'PendingReview');
            Taco.app.viewPort.removeAll(true);
            m.panel = Ext.create(
                'Taco.view.order.subform.Payment', { record: m.record, width: 500 }
            );
            Taco.app.viewPort.add(m.panel);

            t.waitForComponentVisible(m.panel, next);
        },
        function(next) {

            t.diag("payment actions should be unavailable when order is pending review");
            Ext.Object.each(m.panel.paymentActions, function(k, action) {
                t.ok(action.isDisabled(), k + " is disabled");
            });
            //t.elementIsNotVisible(m.panel.down('#paymentGear').getEl(), 'gear shoul be hidden  on PendingReview');


        }

    );

});