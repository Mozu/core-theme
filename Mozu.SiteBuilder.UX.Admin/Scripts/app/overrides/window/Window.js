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
    setRelativeHeight: function () {
        var rh = Ext.Number.constrain(parseFloat(this.relativeHeight), .1, 1);
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

    show: function () {
              
        // call the superclass to get the default behavior
        this.callParent(arguments);
                
        if (this.relativeHeight) {
            this.setRelativeHeight();
        }

        if (this.relativeWidth) {
            this.setRelativeWidth();
        }
    }
});