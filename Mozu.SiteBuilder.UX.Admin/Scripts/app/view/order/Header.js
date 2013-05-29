/**
 * @class Taco.view.order.Header
 */
Ext.define('Taco.view.order.Header', {
    extend: 'Ext.container.Container',
    requires: [],
    config : {
        
    },
    
    //move to scss
    style:"background-color:#333;color:#fff;",
    
    items: [{
        xtype:"container",
        html: "order header here</br></br></br></br>long live the grand creamery"
        }
    ]
});
