/**
 * @class Taco.view.Growl
 */
 
Ext.define('Taco.view.Growl', {
    extend: 'Taco.core.ux.window.Window',
    alias: 'widget.growl',

    focusOnToFront:false,

    bodyPadding: '30 10 30 10',
    closeAction: 'destroy',
    header: false,
    height: 'auto',
    minHeight: 40,
    overflowY: 'hidden',
    ui: 'modal',
    width: '15%',
    duration: 1000,

    initComponent: function () {
        var tpl;

        this.fadeTimeout = null;
        this.deleteTimeout = null;

        this.cls = 'taco-notifierbar taco-growl';

        tpl = new Ext.XTemplate('<span class="message" style="white-space:normal;">{message}</span>');

        this.items = [{
            xtype: 'component',
            padding: '0 30 0 30',
            tpl: tpl,
            itemId: 'taco-growl',
            data: {
                message: this.message
            },
            listeners: {
                click: {
                    scope: this,
                    element: 'el',
                    fn: function(){
                        this.close();
                    }
                },
                afterrender: {
                    scope: this,
                    fn: function(cmp) {
                        //original call to set the timeout
                        this.debounce(this.doHide, this.duration, cmp)();

                        // need to debounce from body of growl, as well as text component
                        var elements = [cmp.ownerCt.body.dom, cmp.el.dom];

                        elements.forEach(function(el) {
                            el.addEventListener('mouseover', this.debounce(this.doHide, this.duration, cmp));
                        }, this);
                    }

                }
            }
        }];

        this.callParent(arguments);
    },

    debounce: function(cb, duration, cmp) {
        return (function() {
            clearTimeout(this.fadeTimeout);
            clearTimeout(this.deleteTimeout);
            cmp.ownerCt.removeCls('hidden');
            this.fadeTimeout = setTimeout(cb.bind(this, cmp, duration), duration);
        }).bind(this);
    },

    doHide: function(cmp, duration) {

        if (cmp.ownerCt) cmp.ownerCt.addCls('hidden');

        this.deleteTimeout = setTimeout(this.hide.bind(this), 800);
    }

});
