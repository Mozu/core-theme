/**
 * @author Travis Johnson
 * @class Taco.view.testing.Shim
 */

    Ext.define('Taco.view.testing.Shim', {
        extend: 'Ext.container.Container',

        initComponent: function() {

            this.iframe = Ext.create('Ext.ux.IFrame', {
                src: '/admin/iframe.html',
                name: 'website-editor',
                height: 500,
                width: 600,
                listeners: {
                    load: {
                        fn: this.load,
                        scope: this
                    }
                }
            });
            
            window.i = this.iframe;

            this.callParent(arguments);

            this.add([{
                id: 'blurg',
                html: 'blurg'
            },
            this.iframe]);
        },
        
        load: function () {
            console.log('load iframe', this.iframe);
            this.body = new Ext.dom.Element(this.iframe.getDoc().body);
            
            
        }
    });
