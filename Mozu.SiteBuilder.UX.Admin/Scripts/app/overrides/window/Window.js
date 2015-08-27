// Added by simeon; let me know if you encounter any issues with this enhancement;
// Adds support to the Ext.Window Class so that it can size itself relative to the users browser size.
Ext.define('Taco.overrides.window.Window', {
    override: 'Ext.window.Window',
    
    // Number of pixels to remove from the relative height.
    // defaults to 60 pixels. If relativeHeight is 1 then the calculated height would be 100% of browser height - 60 pixels
    relativeOffSetHeight: 100,

    // Number of pixels to remove from the relative width.
    // defaults to 60 pixels. If relativeWidth is 1 then the calculated width would be 100% of browser width - 60 pixels
    relativeOffSetWidth: 60,

    // Sets the height of the Ext.Window after the window's afterShow event fires.
    // can be called directly and be passed a relative height 
    // rh should be between .1 and 1
    setRelativeHeight: function (rh) {
        
        if (!rh) {
            rh = Ext.Number.constrain(parseFloat(this.relativeHeight), .1, 1);
        }
        
        var ro = Ext.Number.constrain(parseFloat(this.relativeOffSetHeight), 0);

        //var vs = this.container.getViewSize(false);
        var vs = {
            height: Ext.getBody().getHeight(),
            width: Ext.getBody().getWidth()
        };

        // can set a maxHeight in the class to allow the height to shrink to fit but grow to a max.
        var newHeight = vs.height * rh - ro;
        if (newHeight > this.maxHeight) {
            newHeight = this.maxHeight;
        };

        this.setHeight(newHeight);
        this.center();
    },
    
    // compare the viewport to the window height;
    isTallerThanViewport: function () {
        var vp = Taco.app.viewPort.getHeight(),
            ht = (this.rendered) ? this.getHeight() : this.height;
        return (vp < ht);
    },
        // Sets the width of the Ext.Window after the window's afterShow event fires.
    setRelativeWidth: function () {
        var rw = Ext.Number.constrain(parseFloat(this.relativeWidth), .1, 1);
        var ro = Ext.Number.constrain(parseFloat(this.relativeOffSetWidth), 0);

        //var vs = this.container.getViewSize(false);
        var vs = {
            height: Ext.getBody().getHeight(),
            width: Ext.getBody().getWidth()
        };

        // can set a maxHeight in the class to allow the height to shrink to fit but grow to a max.
        var newWidth = vs.width * rw - ro;
        if (newWidth > this.maxWidth) {
            newWidth = this.maxWidth;
        };

        this.setWidth(newWidth);
        this.center();
    },
    
    animateResize: true,
    
    animateSize :function(config) {
        // only animate the resize if the window is rendered;
        if (this.rendered) {
            
            this.animate({
                to: {
                    //    width: (myWindow.getWidth() == 500) ? 700 : 500,
                    height: config.height,
                    width: config.width,
                    y: config.y,
                    x: config.x
                },
                listeners: {
                    afteranimate: function () {
                        //this.center();
                    },
                    scope: this
                }
            });
        }
    },

    animateRelativeSize: function () {
        
        var newHeight,
            newWidth,
            newX,
            newY,
            existingWidth=(this.rendered) ? this.getWidth() : this.width,
            existingHeight=(this.rendered) ? this.getHeight() : this.height;

        var rh = (this.relativeHeight) ? Ext.Number.constrain(parseFloat(this.relativeHeight), .1, 1)  : existingHeight;
        var rw = (this.relativeWidth) ? Ext.Number.constrain(parseFloat(this.relativeWidth), .1, 1) : existingWidth;
        var ro = Ext.Number.constrain(parseFloat(this.relativeOffSetHeight), 0);

        //get viewport size
        var vs = {
            height: Ext.getBody().getHeight(),
            width: Ext.getBody().getWidth()
        };

        if (this.relativeHeight) {
            // can set a maxHeight in the class to allow the height to shrink to fit but grow to a max.
            newHeight = vs.height * rh - ro;

            if (newHeight > this.maxHeight) {
                newHeight = this.maxHeight;
            }
        } else {
            newHeight = existingHeight;
        }

        if (this.relativeWidth) {
            // can set a maxHeight in the class to allow the height to shrink to fit but grow to a max.
            newWidth = vs.width * rw - ro;
            
            
            if (newWidth > this.maxWidth) {
                newWidth = this.maxWidth;
            }
            
            
        } else {
            newWidth = existingWidth
        }
        


        // center the window
        newY = (vs.height - newHeight) / 2;
        newX = (vs.width - newWidth) / 2;
        

        

        this.animateSize({
            height: newHeight,
            width: newWidth,
            x: newX,
            y: newY
        });


    },

    processRelativeSize: function () {
        
        if (this.rendered && this.animateResize && (this.relativeHeight || this.relativeWidth)) {
                this.animateRelativeSize();
            return;
        }

        // shrink any auto size windows that are taller than the viewport
        if (this.rendered && this.isTallerThanViewport()) {
            this.relativeHeight = 1;
            this.animateRelativeSize();
            //this.setRelativeHeight(1);
        }

        // if a relativeHeight is set upate the height;
        
        if (this.relativeHeight) {
            this.setRelativeHeight();
        }

        // if a relativeWidth is set upate the width;
        if (this.relativeWidth) {
            this.setRelativeWidth();
        }

        this.center();
    },
    
    
    
    onDestroy: function () {
        var me = this;
        //remove the on resize listeners;
        if (Taco && Taco.app && Taco.app.viewPort) {
            Taco.app.viewPort.un('resize', this.processRelativeSize);
        }
        me.callParent(arguments);
    },
    
    // turns the overlow class handling on and off;
    enableOverflowCls : true,

    // css class to be added/removed when the overflowTarget has fired an overflowChanged event;
    overflowCls: Ext.baseCSSPrefix + 'window-body-overflow',

    // which dom node should we listen for overflow on, defaults to the window body;
    // override this, to identify some other dom node as your target scrollable area;
    overflowTarget: 'body',
    
    onOverflowChanged: function (e, t, eOpts) {
        var me = this;
        // check for a an overflowCls;
        if (me.enableOverflowCls) {
            // if we have an overflow condition add a css class to the body dom node
            if (t.scrollHeight > t.clientHeight) {
                Ext.fly(t).addCls(me.overflowCls);
            } else {
                Ext.fly(t).removeCls(me.overflowCls);
            }
        }
    },

    show: function () {
        var me = this;

        // onresize of the viewport, update the relative height and width of the window;

        Taco.app.viewPort.on('resize', this.processRelativeSize, this, {
            buffer: 500
        });
        
        // call the superclass to get the default behavior
        this.callParent(arguments);

        // do any relative width and height adjustments if they are enabled; Makeing this a defer to allow the child panels to do their resizing;
        Ext.Function.defer(this.processRelativeSize, 1, me);
    
        if (me.enableOverflowCls) {
            
            var overflowTarget = me[me.overflowTarget];
            if (overflowTarget) {
                
                if (Ext.isWebKit) {
                    // note this event only works in safari and chrome;
                    overflowTarget.on('overflowchanged', me.onOverflowChanged, me);
                } else if (Ext.isGecko) {
                    overflowTarget.on('overflow', me.onOverflowChanged, me);
                    overflowTarget.on('underflow', me.onOverflowChanged, me);
                } else if (Ext.isIE){
                    // no overflow handling for you IE.... 
                    
                    /*
                    overflowTarget.on('resize', function () {
                        
                        me.onOverflowChanged(arguments);

                    }, me);
                    
                    overflowTarget.dom.addEventListener('resize', function () {
                        
                        me.onOverflowChanged(arguments);

                    });
                    
                    overflowTarget.dom.attachEvent('onresize', function () {
                        
                        //me.onOverflowChanged(arguments);

                    });
                    
                    overflowTarget.on('onresize', function () {
                        
                        me.onOverflowChanged(arguments);

                    }, me);
                    */
                }

            }
        }
    }
});