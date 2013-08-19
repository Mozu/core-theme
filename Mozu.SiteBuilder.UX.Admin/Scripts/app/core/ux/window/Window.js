

Ext.define('Taco.core.ux.window.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.taco.window',

    /**
     * @cfg {"small"/"medium"/"large"} scale
     * The size of the Window. Three values are allowed:
     *
     * - 'small' - Results in the window element being 400px in width and 270px in height.
     * - 'medium' - Results in the window element being 600px in width and 400px in height.
     * - 'large' - Results in the window element being 800px in widdth and 600px in height.
     */
    scale: 'medium',

    autoScroll: true,
    autoShow: false,
    constrain: true,
    draggable: false,
    ghost: false,
    modal: false,
    resizable: false,
    shadow: false,

    bodyPadding: '11 19 19',
    closeAction: 'hide',
    componentCls: Taco.baseCSSPrefix + 'window',
    ui: 'modal',
    
    header: {
        layout: {
            type: 'hbox',
            align: 'top'
        }
    },

    initComponent: function () {
        var scales = this.getScales(),
            scale = this.scale || null;

        if (Ext.Array.contains(['small', 'medium', 'large'], scale)) {
            this.width = this.width || scales[scale]['width'];
            this.height = this.height || scales[scale]['height'];
        }

        this.callParent(arguments);

        this.attachBodyListeners();
    },

    attachBodyListeners: function () {
        this.on({
            // constraintInsets config is buggy, so we set the constraints manually
            boxready: {
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

    getScales: function () {
        return {
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
        };
    }
});
