/**
 * @class Taco.view.order.Header
 */
Ext.define('Taco.view.order.subform.Detail', {
    extend: 'Ext.container.Container',
    requires: [],
    config : {
        
    },
    
    // todos:remove border and style info after base class css is setup.
    border: 1,
    style: {
        borderColor: "red",
        borderStyle: "solid",
        //borderWidth: "20px",
        padding: 0
    },
    //move to scss
    items: [{
        html: "order details here<br/><br/><br/><br/><br/><br/>"
        }
    ]
});
