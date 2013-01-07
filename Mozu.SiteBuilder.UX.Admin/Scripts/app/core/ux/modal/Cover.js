/**
* @class Taco.core.ux.modal.Cover
*/

Ext.define('Taco.core.ux.modal.Cover', {
    extend: 'Ext.Component',

    cls: 'taco-cover',
   
    opacity: 0.7,
    easing: 'linear',
    duration: 300,
    destroyOnHide: true,

    initComponent: function () {
        this.renderTo = Ext.getBody();
        var me = this;
       
        Ext.apply(me, {
            listeners: {
                click: {
                    element: 'el',
                    fn: function() {
                        me.fireEvent('click');
                    }
                }
            }
        });

        me.callParent(arguments);

        me.animation = {
            opacity: me.opacity,
            easing: me.easing,
            duration: me.duration
        };


    },

    show: function() {
        
        this.callParent(arguments);

        this.el.setStyle('display', 'block').animate({
            to: {
                opacity: this.opacity
            },
            easing: this.easing,
            duration: this.duration
        });

    },

    hide: function() {
        var me = this;
        if ( this.isHiding ||  this.destroying || this.isDestroyed){
            return ;
        }
        this.isHiding = true;
        me.el.fadeOut(Ext.apply(me.animation, {
            listeners: {
                afteranimate: {
                    scope: me,
                    fn: function (){
                        me.isHiding = false;
                        
                        if (me.destroyOnHide) {
                            me.destroy()
                        }
                    }
                }
            },
            opacity: 0
        }));
    }
});

