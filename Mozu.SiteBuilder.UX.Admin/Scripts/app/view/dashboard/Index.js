/**
 * @class Taco.view.dashboard.Index
 */
    Ext.define('Taco.view.dashboard.Index', {
        extend: 'Taco.core.ux.content.Container',
        
        initComponent: function () {
            var me = this;
            me.header = {
                title: ''
            };
            me.body = {
               
                items: [
                    {
                        html: Taco.dashBoardInstructions
                    }
                ]
                
            };
            me.callParent(arguments);
        }
    });
