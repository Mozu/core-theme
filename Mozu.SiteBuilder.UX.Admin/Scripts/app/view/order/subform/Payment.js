/**
 * @class Taco.view.order.Header
 */
Ext.define('Taco.view.order.subform.Payment', {
    extend: 'Ext.container.Container',
    requires: [],
    config : {
        
    },
    
    // todos:remove border and style info after base class css is setup.
    border: 1,
    style: {
        borderColor: "red",
        borderStyle: "solid",
        margin: "10px 0 0 0",
        //borderWidth: "20px",
        padding: 0
    },
    //move to scss
    items: [{
        html: "order payment here<br/><br/><br/><br/><br/><br/>"
        }
    ]
});
