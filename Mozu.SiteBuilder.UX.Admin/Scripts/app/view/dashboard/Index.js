/**
 * @class Taco.view.dashboard.Index
 */
    Ext.define('Taco.view.dashboard.Index', {
        extend: 'Taco.core.ux.content.Container',
        
        initComponent: function () {
            var me = this;
            
            me.header = {
                title: Taco.app.context.getCurrent().contextType == 't'?'All Stuff Dashboard': Taco.app.context.getCurrent().contextType == 'c'?Taco.app.context.getCurrent().name +' Site Collection Dashboard': Taco.app.context.getCurrent().name +' Site  Dashboard'
                    
            };
            me.body = {
               
                items: [
                    {
                        html: Taco.dashBoardInstructions
                    },
                    {
                        html: 'dash board content for '
                    }
                ]
                
            };
            me.callParent(arguments);
        }
    });
