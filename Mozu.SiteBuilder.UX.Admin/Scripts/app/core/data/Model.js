/**
* @class Taco.core.data.Model
* Taco base class for models
* @extends Ext.data.Model
*/

Ext.define('Taco.core.data.Model', {
    extend: 'Ext.data.Model',
    requires: ['Taco.core.data.AjaxProxy', 'Ext.data.BelongsToAssociation', 'Ext.data.HasManyAssociation'],

    constructor: function () {
        var me = this;

        if (Taco.app && Ext.state.Manager.get('useMocks') && me.mockApi) {
            Ext.apply(me.getProxy().api, me.mockApi);
        }

        return me.callParent(arguments);
    },

    //setProxy: function () {
    //    console.log('set proxy');
    //},


    getMessage: function () {
        var proxy = this.getProxy(),
            reader;
        if (proxy) {
            reader = proxy.getReader();
            if (reader && reader.rawData) {
                return reader.rawData.message;
            }
        }

    },

    copyData: function (sourceModel,add) {

        this.copyFrom(sourceModel);
        this.commit();

    },
    reload : function(){
        var me = this;
        this.self.load(me.getId(), {
            bypassCache:true,
            success: function (record, operation) {

                me.copyFrom(record);
                me.commit();
            }
        });
    },


    ///**
    //* Appends events to the save method of a model.
    //* @param {Object} The options config.
    //* @return {Object} the model
    //* @method
    //*/
    //save: function (options) {
    //    var config = {};
    //    options = Ext.apply({}, options);

    //    Ext.apply(config, {
    //        success: function (model) {
    //            Taco.app.eventbus.fireEvent(this.modelName + ".savesuccess", model);
    //            //add config
    //            if (Ext.state.Manager.get('showSaveMessages') === true) {
    //                Taco.app.fireEvent('setmessage', this.modelName + 'saved successfully.', 'status');
    //            }
    //            Ext.callback(options.success, options.scope, [model, options]);
    //            Ext.callback(options.callback, options.scope, [options]);
    //        },

    //        failure: function (model) {
    //            Taco.app.eventbus.fireEvent(this.modelName + ".savefailure", model);
    //            Taco.app.fireEvent('setmessage', 'There was an error while saving the ' + (this.modelName + '.'), 'error');
    //            Ext.callback(options.failure, options.scope, [model, options]);
    //            Ext.callback(options.callback, options.scope, [options]);
    //        }
    //    });

    //    this.callParent([config]);
    //},

    ///**
    //* Appends events to the destroy method of a model.
    //* @param {Object} The options config.
    //* @return {Object} the model
    //* @method
    //*/
    //destroy: function (options) {
    //    var config = {};
    //    options = Ext.apply({}, options);

    //    Ext.apply(config, {
    //        success: function (model) {
    //            Taco.app.eventbus.fireEvent(this.modelName + ".destroysuccess", model);
    //            Ext.callback(options.success, options.scope, [model, options]);
    //            Ext.callback(options.callback, options.scope, [options]);
    //        },

    //        failure: function (model) {
    //            Taco.app.eventbus.fireEvent(this.modelName + ".destroyfailure", model);
    //            Ext.callback(options.failure, options.scope, [model, options]);
    //            Ext.callback(options.callback, options.scope, [options]);
    //        }
    //    });

    //    this.callParent([config]);
    //},

    //execute: function (config) {
    //    var operation = new Ext.data.Operation(config),
    //    callback = function (operation) {
    //        if (operation.wasSuccessful()) {
    //            record = operation.getRecords()[0];
    //            Ext.callback(config.success, scope, [record, operation]);
    //        } else {
    //            Ext.callback(config.failure, scope, [record, operation]);
    //        }
    //        Ext.callback(config.callback, scope, [record, operation]);
    //    };

    //    this.proxy.doRequest(operation, callback, this);

    //},
    /**
    * Duplicates the model on the server using the configured proxy.
    * NOTE: We might want to just attach this as an override to the Ext Ajax Proxy at some point.
    * @param {Object} options Options to pass to the proxy. Config object for {@link Ext.data.Operation}.
    * @return {Ext.data.Model} The Model instance
    */
    duplicate: function (config) {
        
        config = Ext.apply({}, config);
        config = Ext.applyIf(config, {
            action: 'duplicate',
            id: this.getId()
        });

        var operation = new Ext.data.Operation(config),
                scope = config.scope || this,
                record = null,
                callback;

        callback = function (operation) {
            if (operation.wasSuccessful()) {
                record = operation.getRecords()[0];
                Ext.callback(config.success, scope, [record, operation]);
            } else {
                Ext.callback(config.failure, scope, [record, operation]);
            }
            Ext.callback(config.callback, scope, [record, operation]);
        };

        this.proxy.duplicate(operation, callback, this);
    }
});