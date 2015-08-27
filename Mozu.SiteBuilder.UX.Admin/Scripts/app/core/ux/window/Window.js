/**
 * @class Taco.core.ux.window.Window
 * @author Jimmy Sanford
 *
 * The base class for a dialog window.
 * 
 * Dialogs are used to display useful information and give feedback to the user. This dialog is not modal; a
 * reponse from the user is not required.
 *
 * This class is extends the Ext class for windows, {@link Ext.window.Window}, applying typical configuration
 * settings as defaults.
 */

Ext.define('Taco.core.ux.window.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.taco-window',

    /**
     * @cfg {Boolean} ghostDisabled
     * If true, sets ghost to false during instantiation of the window. Since the default value of ghost is a
     * function, not a Boolean, ghost should not be modified in the class definition.
     */
    ghostDisabled: true,

    /**
     * @cfg {Boolean} manageOverflow
     * If true, a scroll listener will be attached to the window. Defaults to true.
     */
    manageOverflow: true,

    /**
     * @cfg {"small"/"medium"/"large"} scale
     * The size of the window. Three values are allowed:
     *
     * - 'small' - Results in the window element being 400px in width and 270px in height.
     * - 'medium' - Results in the window element being 600px in width and 400px in height.
     * - 'large' - Results in the window element being 800px in widdth and 600px in height.
     */
    scale: 'medium',

    autoShow: false,
    constrain: true,
    draggable: false,
    minHeight: null,
    minWidth: null,
    modal: false,
    resizable: false,
    shadow: false,

    bodyPadding: '11 19 19',
    //closeAction: 'hide',
    closeAction: 'destroy',
    componentCls: Taco.baseCSSPrefix + 'window',
    overflowX: 'hidden',
    overflowY: 'auto',
    ui: 'dialog',

    header: {
        layout: {
            type: 'hbox',
            align: 'top'
        }
    },

    statics: {
        scales: {
            'small': {
                'width': 400,
                'height': 270
            },
            'medium': {
                'width': 600,
                'height': 400
            },
            'large': {
                'width': 800,
                'height': 600
            }
        }
    },

    initComponent: function () {
        var scales = this.statics().scales,
            scale = this.scale || null;

        if (Ext.Array.contains(['small', 'medium', 'large'], scale)) {
            this.width = this.width || scales[scale]['width'];
            this.height = this.height || scales[scale]['height'];

            this.minWidth = Ext.isNumber(this.minWidth) ? this.minWidth : this.width;
            this.minHeight = Ext.isNumber(this.minHeight) ? this.minHeight : this.height;
        }

        if (this.ghostDisabled) {
            this.ghost = false;
        }

        this.callParent(arguments);

        if (this.manageOverflow) {
            this.attachBodyListeners();
        }
    },
    
    attachBodyListeners: function () {
        this.on({
            // constraintInsets config is buggy, so we set the constraints manually
            show: {
                scope: this,
                fn: function (cmp) {
                    var region = Ext.getBody().getRegion().adjust(100, 0, -100, 0);

                    cmp.constrainTo = region;

                    if (cmp.dd) {
                        cmp.dd.constrainTo = region;
                    }
                }
            },
            // set a class on scroll so we can show body borders in overflow situations
            scroll: {
                scope: this,
                element: 'body',
                fn: function (e, el) {
                    Ext.fly(el).addCls(Ext.baseCSSPrefix + 'scrolled');
                }
            }
        });
    },

    initResizable: function (resizable) {
        var me = this;

        resizable = Ext.apply({
            constrainTo: me.constrainTo || (me.floatParent ? me.floatParent.getTargetEl() : null),
            dynamic: true,
            handles: me.resizeHandles,
            heightIncrement: 1,
            minHeight: me.minHeight,
            minWidth: me.minWidth,
            target: me,
            widthIncrement: 1
        }, resizable);

        resizable.target = me;
        me.resizer = Ext.create('Ext.resizer.Resizer', resizable);

        if (me.maximized) {
            me.resizer.disable();
        }
    },

    setScale: function (scale) {
        var scales = this.statics().scales,
            size = scales[scale || 'na'];

        if (size) {
            this.width = size.width;
            this.height = size.height;
            this.setSize(this.width, this.height);
        }
    }
});
