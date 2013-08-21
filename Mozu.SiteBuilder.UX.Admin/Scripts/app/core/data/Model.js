/**
* @class Taco.core.data.Model
* Taco base class for models
* @extends Ext.data.Model
*/

Ext.define('Taco.core.data.Model', {
    extend: 'Ext.data.Model',
    requires: ['Taco.core.data.AjaxProxy', 'Ext.data.BelongsToAssociation', 'Ext.data.HasManyAssociation'],
    setPhantomOnIdChange: false,
    constructor: function () {
        var me = this;

        if (Taco.app && Ext.state.Manager.get('useMocks') && me.mockApi) {
            Ext.apply(me.getProxy().api, me.mockApi);
        }

        return me.callParent(arguments);
    },

    inheritableStatics: {
        allowMethod: function (method) {
            if (this.prototype.behaviors && this.prototype.behaviors[method]) {
                return Taco.User.behaviors.indexOf(this.prototype.behaviors[method]) != -1;
            }
            return true;
        },
        allowCreate: function () {
            return this.allowMethod('create');
        },

        allowDelete: function () {
            return this.allowMethod('delete');
        },

        allowUpdate: function () {
            return this.allowMethod('update');
        },

        allowRead: function () {
            return this.allowMethod('read');
        }
    },

    isEqual: function (a, b) {

        if (Ext.isDate(a) && Ext.isDate(b)) {
            return Ext.Date.isEqual(a, b);
        }


        var ret = this.callParent(arguments);
        if (!ret && Ext.isObject(a) && Ext.isObject(b) && a.$className == undefined && b.$className == undefined) {
            return Ext.encode(a) == Ext.encode(b);
        }
        if (!ret && Ext.isArray(a) && Ext.isArray(b)) {
            return Ext.encode(a) == Ext.encode(b);
        }
        return ret;
    },

    changeId: function (oldId, newId) {
        var me = this,
            phantom = me.phantom;

        this.callParent(arguments);
        if (this.setPhantomOnIdChange === false) {
            me.phantom = phantom;
        }
        
    },
    
    afterEdit: function (modifiedFieldNames) {
        this.callParent(arguments);
        this.fireEvent('afteredit', this, modifiedFieldNames);
    },

    afterCommit: function () {
        this.callParent(arguments);
        this.fireEvent('aftercommit', this);
    },
    afterReject: function () {
        this.callParent(arguments);
        this.callStore("afterreject", this);
    },

    getData2: function (record, includeAssociated) {
        var me = this,
            fields = me.fields.items,
            fLen = fields.length,
            data = {},
            name, f;

        record.fields.each(function (field) {
            if (field.persist) {
                data[field.name] = record.get(field.name);
            }
        });
        //todo
        //if (includeAssociated === true) {
        //    Ext.apply(data, me.getAssociatedData());
        //}
        return data;
    },

    getOrCreateHasManyStore: function (config) {
        var me = this,
            store,
            storeConfig = config.storeConfig || {},
            modelDefaults = config.modelDefaults || {},
            model = config.model,
            storeName = config.storeName || config.associationKey + 'Store',
            associationKey = config.associationKey,
            foreignKey = config.foreignKey || null,
            modelClass = Ext.ModelManager.getModel(model),
            data = this.get(associationKey),
            foreignProperty = config.foreignProperty || this.model;

        this.hasManyStores = this.hasManyStores || {};
        if (this.hasManyStores[storeName] != null) {
            return this.hasManyStores[storeName];
        }
        if (foreignKey) {
            modelDefaults[foreignKey] = this.getId();
        }
        config = Ext.apply({}, storeConfig, {
            model: model,
            remoteFilter: false,
            modelDefaults: modelDefaults            
        });        
        

        this.hasManyStores[storeName] = store = new Ext.data.Store(config);


        store.on('add', function (store, records, index, eOpts) {
            Ext.each(store.records, function (record) {
                record[foreignProperty] = this;

            });
        }, this);
        store.on('update', function (store, record, operation, eOpts) {
            if (operation == Ext.data.Model.COMMIT) {
                return;
            }
            var data = [];
            if (store.isDirty()) {
                Ext.each(store.data.items, function (record) {
                    data.push(this.getData2(record, true));
                });
                this.setThruStore = associationKey;
                this.set(associationKey, data);
                this.setThruStore = null;
            }
        }, this);
        store.on('datachanged', function (store) {
            var data = [];
            if (store.isDirty()) {
                Ext.each(store.data.items, function (record) {
                    data.push(this.getData2(record, true));
                });
                this.setThruStore = associationKey;
                this.set(associationKey, data);
                this.setThruStore = null;
            }
        }, this);
        this.on('afteredit', function (record, modifiedFieldNames) {
            if (!this.setThruStore && modifiedFieldNames && Ext.Array.contains(modifiedFieldNames, associationKey)) {
                var associationData = me.get(associationKey) || [],
                    idProp = modelClass && modelClass.prototype.idProperty ? modelClass.prototype.idProperty : 'id',
                    newRrecords = [],
                    recordsToRemove = [];


                Ext.Array.each(associationData, function (associationDataItem) {
                    var record = store.getById(associationDataItem[idProp]);
                    if (record) {
                        record.set(associationDataItem);
                        //record.commit();
                    } else {
                        newRrecords.push(associationDataItem);
                    }
                });
                store.each(function (record) {
                    var id = record.getId(),
                        foundRecord = Ext.Array.findBy(associationData, function (associationDataItem) {
                            return associationDataItem[idProp] === id;
                        });
                    if (!foundRecord) {
                        recordsToRemove.push(record);
                    }
                });

                if (recordsToRemove.length) {
                    store.remove(recordsToRemove);
                }


                if (newRrecords.length) {
                    store.loadData(newRrecords);
                }


                //store.loadData(me.get(associationKey));
                store.commitChanges();
            }
        });
        this.on('aftercommit', function (model) {
            this.hasManyStores[storeName].commitChanges();
        }, this);
        this.on('afterreject', function (model) {
            this.hasManyStores[storeName].rejectChanges();
        }, this);

        store.add(data);
        return store;

    },

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


    // method that allows you to set the data for a model.
    // typically this is done after the model has already loaded its data and this is an attempt to update that data.
    // Will set the data and its associations unlike calling the set()  on model which doesn't does not update the associations;
    setRawData: function (data) {
        if (data && data.success && data.items) {
            // need to pluck the data out of the wrapped response data object
            if (data.items.length) {
                //items is an array with a single entity data json
                data = data.items[0];
            } else {
                // items is a single object
                data = data.items;
            }
        }

        var me = this;
        me.set(data);
        // do some associations fixing

        me.proxy.reader.readAssociated(me, data);
    },

    copyData: function (sourceModel, add) {

        this.copyFrom(sourceModel);
        this.commit();

    },
    reload: function () {
        var me = this;
        this.self.load(me.getId(), {
            bypassCache: true,
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