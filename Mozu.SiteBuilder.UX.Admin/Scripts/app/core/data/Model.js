/**
* @class Taco.core.data.Model
* Taco base class for models
* @extends Ext.data.Model
*/

Ext.define('Taco.core.data.Model', {
    extend: 'Ext.data.Model',
    requires: ['Taco.core.data.AjaxProxy', 'Ext.data.BelongsToAssociation', 'Ext.data.HasManyAssociation'],
    setPhantomOnIdChange: false,
    logMissMappedFields :true,
    statics: {
        nullIfEmpty: function (v) {
            return v || null;
        }
        },
    init:function () {
        if (this.raw && this.logMissMappedFields) {
            Ext.Object.each(this.raw, function (key,value) {
                if (!this.fields.getByKey(key)) {
                    var unmappedFields = this.fields.unmappedFields = this.fields.unmappedFields || {};

                    if (!unmappedFields[key]) {
                        unmappedFields[key] = true;
                        Ext.log({  level: 'warn' , dump:value }, 'unmapped field of [' + key + '] found in ' + this.modelName);
                    }
                }
            }, this);
        }
    },
    inheritableStatics: {
        allowMethod: function (method) {
            if (this.prototype.behaviors && this.prototype.behaviors[method]) {
                return Ext.Array.indexOf(Taco.user.behaviors, this.prototype.behaviors[method]) !== -1;
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
        },

        load: function (id, config) {
            config = Ext.apply({}, config);
            config = Ext.applyIf(config, {
                action: 'read',
                id: id
            });

            var operation = new Ext.data.Operation(config),
                scope = config.scope || this,
                callback;

            callback = function (operation) {
                var record = null,
                    records= null,
                    success = operation.wasSuccessful();

                if (success) {
                    records = operation.getRecords();
                }

                if (success && records.length > 0) {

                    if (records.length > 1) {
                        record = Ext.Array.findBy(records, function (item) { return item.getId() == id; });
                    }
                    
                    if (!record && ! (records.length && operation.request && operation.request.isSimulated )) {
                        
                        record = operation.getRecords()[0];
                    }
                    
                    // If the server didn't set the id, do it here
                    if (record && !record.hasId()) {
                        record.setId(id);
                    }

                    if (!record && operation.request.isSimulated) {
                        operation.setException({
                            data: {
                                errorCode: 'ITEM_NOT_FOUND',
                                message: 'Item not found'
                            },
                            status: 404,
                            statusText: 'Not Found'
                        });
                    }
                    Ext.callback(config.success, scope, [record, operation]);
                } else {
                    Ext.callback(config.failure, scope, [record, operation]);
                }
                Ext.callback(config.callback, scope, [record, operation, success]);
            };

            this.getProxy().read(operation, callback, this);
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
        return record.getProxy().getWriter().getRecordData(record, { operation: 'update' });
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
            data = this.get(associationKey) || [],
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
                    store.loadData(newRrecords, true);
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
    reload: function (config) {
        var me = this,
            config = config || {},
            modifiedNames=[],
            loadConfig = Ext.applyIf(
             {
                 bypassCache: true,
                 success: function (record) {
                     

                     if (record.getId() == me.getId()) {
                         me.beginEdit();
                         modifiedNames = me.copyFrom(record);
                         me.endEdit(false, modifiedNames);
                         me.commit(false, modifiedNames);
                     }
                         
                     if (config.success) {
                         Ext.callback(config.success, config.scope, arguments );
                     }
                     me.fireEvent("reload", me);
                 }
             },
             config
            );

        

      
        //tbd: remove this
        

        this.self.load(me.getLoadParams? me.getLoadParams(): me.getId(), loadConfig);
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
    },
    
    // adds default error handling to the success function of the ajax call;
    // just pass your ajax config to this method to adapt it to contain the boilerplate error handling on successFn and failureFn;
    // optional config paramters:
    //      success : function (response){}
    //      failure : function (response){}
    //      scope: this,  //Note: this is the scope of the class to execute the success and failture. if none is provided, the scope of the success and failure will be the model.
    //      errorMsg : "Your error here"
    addErrorHandling: function (config) {
        var me = this;

        if (config.showMask) {
            Taco.app.viewPort.setLoading(true);
        }

        // store the passed in success method for use after the the error check runs;
        if (config.success) {
            config.success2 = config.success;
            config.scope2 = config.scope;            
        }
        
        // store the passed in failure method for use after the the error check runs;
        if (config.failure) {
            config.failure2 = config.failure;
            config.scope2 = config.scope;
        }
        
        // add the error check to the success fn.
        config.success = function (response) {
            if (config.showMask) {
                Taco.app.viewPort.setLoading(false);
            }
            
            var json = Ext.decode(response.responseText, true);
            if (!json || !json.success) {
                var msg = (config.errorMsg) ? config.errorMsg : "Error";
                Taco.app.fireEvent('setmessage', msg, 'error');
                return;
            }
            // call the passed in success method after having passed the error validation messaging
            if (config.success2) {
                config.success2.apply(config.scope2 || me, arguments);
            }
        };
        
        // add the error check to the failure fn.
        config.failure = function (response) {
            if (config.showMask) {
                Taco.app.viewPort.setLoading(false);
            }
            
            var json = Ext.decode(response.responseText, true),
                msg = (json && json.message) ? json.message : (config.errorMsg) ? config.errorMsg : "Error";
            Taco.app.fireEvent('setmessage', msg, 'error');
            // call the passed in failure method after having passed the error validation messaging
            if (config.failure2) {
                config.failure2.apply(config.scope2 || me, arguments);
            }
        };
    }
});
