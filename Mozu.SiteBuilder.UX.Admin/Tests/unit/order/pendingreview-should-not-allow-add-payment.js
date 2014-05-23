StartTest(function (t) {
    var m = {};

    //Bug 28406:SEO fields missing for CMS pages in Site Builder

    m.record = Ext.create('Taco.model.Order', {
        "id": "abc",
        "orderNumber": 2,
        "name": "seo-name",
        "orderStatus": "PendingReview"
    });
    
    t.setOnlyMocks();



    t.chain(

        function (next) {
            Taco.app.viewPort.removeAll(true);
            m.panel = Ext.create(
                'Taco.view.order.subform.Payment', { record: m.record, width: 500 }
            );
            Taco.app.viewPort.add(m.panel);

            t.waitForComponentVisible(m.panel, next);

        },
        function (next) {

            
            t.elementIsNotVisible(m.panel.down('#paymentGear').getEl(), 'gear shoul be hidden  on PendingReview');
         

            m.record.set('orderStatus', 'Processing');
            m.record.commit();
            t.waitForComponentVisible(m.panel, next);
            //setTimeout(next, 100);
            
        },
        function (next) {
            
            t.elementIsVisible(m.panel.down('#paymentGear').getEl(), 'gear shoul be visable on Processing');

        }
        
    );


});