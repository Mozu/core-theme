/**
 * @class Taco.core.ux.mixins.Permissions 
 * Mixin that provides methods for checking permissions
 * add this to the initComponent of your grid to initilize this mixin
  
    // to include this mixin in your class:

        mixins: {
            permissions: 'Taco.core.ux.mixins.Permissions'
        },

    
    // to initialize the mixing

        < ... code fragment ... >

            initComponent: function (){

                //initialize the grid paging toolbar
                this.mixins.permissions.constructor.apply(this);

                this.callParent(arguments)
            }

        < ... code fragment ... >
 *
 */

Ext.define('Taco.core.ux.mixins.Permissions', {
    requires: [],
    constructor: function () {

    },

    allowCreate: function () {
        return this.allowMethod('create');
    },

    allowDestroy: function () {
        return this.allowMethod('destroy');
    },

    allowUpdate: function () {
        return this.allowMethod('update');
    },

    allowRead: function () {
        return this.allowMethod('read');
    },
    allowMethod: function (method) {
        var me = this,
            res = true,
            model;        

        if (me.behaviors && me.behaviors[method]) {
            Ext.each(me.behaviors[method], function (behavior) {
                if (Taco.user.behaviors.indexOf(behavior) == -1) {
                    res = false;
                    return false;
                }
                return true;
            });
        } else if (me.record && me.record.modelName) {
            model = Ext.ModelManager.getModel(me.record.modelName);            
            res = model.allowMethod(method);
        }

        return res;
    }



});