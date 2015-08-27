Ext.define('Taco.overrides.window.MessageBox', {
    override: 'Ext.window.MessageBox',

    ui: 'modal',
    cls: ['x-hide-offsets'],
    
    // set the default to false for this config; Will hide the close x in the upper right corner
    

    // button config for the primary button 
    primaryBtnConfig: {
        ui: "action-primary",
        margin: {
            left:10  
        },
        scale: "medium"
    },

    // button config for the secondary button 
    secondaryBtnConfig: {
            ui: "action",
            margin: {
            left: 10
            },
        scale: "medium"
    },

    // Maps which buttons should be styled using the primaryBtnConfig and which should be styled with the secondary button config
    primaryButtonById: {
        "ok": true,
        "yes": true,
        "no": false,
        "cancel": false
    },
    
    initComponent: function () {
        var me = this;
        // add a css class to distinguish this from the default Ext.MessageBox
        // me.cls += " taco-messagebox";
        me.callParent(arguments);
    },

    // overriding default makeButton code for this ext class to add additional primary and secondary button configuration support
    makeButton: function(btnIdx) {
        var btnId = this.buttonIds[btnIdx],
            defaultBtnConfig = (this.primaryButtonById[btnId]) ? this.primaryBtnConfig : this.secondaryBtnConfig;
        
        var btnConfig = Ext.apply({
            handler: this.btnCallback,
            itemId: btnId,
            scope: this,
            text: this.buttonText[btnId],
            minWidth: 75
        }, defaultBtnConfig);
        
        return new Ext.button.Button(btnConfig);
    },
    reconfigure: function (cfg) {
        this.callParent(arguments);
        
        var okButton = this.bottomTb.query("#ok")[0],
            yesButton = this.bottomTb.query("#yes")[0],
            noButton = this.bottomTb.query("#no")[0],
            cancelButton = this.bottomTb.query("#cancel")[0],
            buttonArray = [okButton, yesButton, noButton, cancelButton];
        
        //clear out the toolbar of the buttons without destroying them
        this.bottomTb.removeAll(false);

        //reverse the order of the array
        if (cfg.rightJustifyButtons) {
            buttonArray.reverse();
        }

        // force the buttons to the right;
        if (cfg.rightJustifyButtons) {
            buttonArray.unshift("->");
        }
        
        // insert the buttons back into the toolbar
        this.bottomTb.add(buttonArray);
    }
}, function () {
        /**
     * @class Ext.MessageBox
     * @alternateClassName Ext.Msg
     * @extends Ext.Taco.MessageBox
     * @singleton
     * Singleton instance of {@link Ext.window.MessageBox}.
     */
    
    // clear out the original instance of the messageBox and replace it with this version.
    if (Ext.MessageBox) {
        Ext.MessageBox.destroy();
    }
   
    Ext.MessageBox = Ext.Msg = new this();
});
