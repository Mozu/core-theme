/**
 * @class Taco.core.data.ReadAheadProxy
 */
Ext.define('Taco.core.data.ReadAheadProxy', {

    extend: 'Taco.core.data.AjaxProxy',
    //alternateClassName: 'Ext.data.DirectProxy',
    statics: {
        resultSets:null
    },
    alias: 'proxy.readahead',
    constructor: function (config) {
        var me = this;
        if (config.unfilteredParam) {
            me.unfilteredFilters = [new Ext.util.Filter({ property: config.unfilteredParam, value: true, filterFn: function () { return true; } })];
        } else {
            me.unfilteredFilters = [];
        }
        
        me.callParent(arguments);
       

    },
    getResultSets:function () {
        var rs = this.statics().resultSets;
        if ( !rs) {
            this.statics().resultSets = rs = new Ext.util.MixedCollection();
        }
        return rs;
    },
    getData: function () {
        
        return this.getResultSets().getByKey(this.getModel().modelName);
    },
    setData: function (data) {
        var me = this, rs = me.getData();
        
        if (rs) {

            Ext.each(data.records, function (record) {
                var foundRecord, idProp = record.idProperty || "id";
                foundRecord=  me.getRecordById(rs.records, record.getId());
                if (foundRecord) {
                    foundRecord.copyFrom(record);
                    foundRecord.commit();
                    Ext.Array.forEach(rs.json, function (item, index) {
                        if (record.getId() == item[idProp]) {
                            rs.json[index] = record.data;
                            return false;
                        }
                    });
                } else {
                   
                    rs.json.push(record.data);
                    rs.records.push(record);
                }
            });
            return rs;
        }
        if (!data.json) {
            
            data.json = [];
            data.nodeStores = [];
            Ext.each(data.records, function (record) {
                 data.json.push(record.data);
            });
            
        }
        this.getResultSets().add(this.getModel().modelName, data);
        return data;
    },
    getRecordById:function (array , id )
    {
        var foundRecord;
        Ext.Array.forEach(array, function (item, index) {
            if (item.getId() == id) {
                foundRecord = item;
                return false;
            }
        });
        return foundRecord;
    },
    read: function (operation, callback, scope) {
       
        var serverOp, cbw, me = this,
            data = me.getData();

        if (!data || operation.bypassCache) {
            
            cbw = function (op, success, response) {
                
                op.start = op._start;
                op.limit = op._limit;
                op.page = op._page;
                op.sorters = op._sorters;
                op.id = op._id;
                op.filters=op._filters;
                operation.filters = op._filters;

                if (op.wasSuccessful()) {
                   // op.resultSet.response = op.response;
                    op.resultSet = me.setData(op.resultSet);
                    op.resultSet = me.createRecordSet(op);
                    op.success = op.resultSet.success;
                }
               
                if (callback) {
                    callback.call(scope || this, op, success, response);
                }

            };
            if (data && operation.bypassCache) {
                serverOp = Ext.applyIf({
                    _id: operation.id,
                    _start: operation.start,
                    _limit: operation.limit,
                    _page: operation.page,
                    _sorters: operation.sorters,
                    _filters: operation.filters
                }, operation);
            }
            else {
                serverOp = Ext.applyIf({
                    start: 0,
                    limit: 1000,
                    page: 1,
                    filters: me.unfilteredFilters,
                    sorters: null,
                    _id: operation.id,
                    _start: operation.start,
                    _limit: operation.limit,
                    _page: operation.page,
                    _sorters: operation.sorters,
                    _filters: operation.filters
                }, operation);
                serverOp.id = undefined;
            }
            
           
            me.doRequest(serverOp, cbw, scope);
        } else {
            this.read2(operation, callback, scope);
        }
        
    },
    createRecordSet: function (operation) {
        var sorterFn,
            records,
            tmpFilter,
            reader = this.getReader(),
            data=this.getData(),
            sorters = operation.sorters || [],
            filters = Ext.Array.clone(operation.filters||[]),
            result = new Ext.data.ResultSet({
                total: data.total,
                records: operation.node ? reader.extractData(data.json) : Ext.Array.clone(data.records),
                success: true
            });
        
       
        if (operation.node && operation.node.stores) {
            Ext.each(operation.node.stores, function (store) {
                if ( data.nodeStores.indexOf(store) ==-1) {
                    data.nodeStores.push(store);
                }
            });
        }


        if (operation.id != undefined  ) {
            if (operation.node) {
                tmpFilter = new Ext.util.Filter({
                    property: 'parentId',
                    value: operation.node.getId(),
                    exactMatch: true,
                    root: 'data'
                });
                tmpFilter.filterFn2 = tmpFilter.filterFn;
                tmpFilter.filterFn = function (item) {
                    //support for null or 0 
                    return (!item.data.parentId && !operation.node.getId()) || tmpFilter.filterFn2(item);
                };
                filters.push(tmpFilter);
                
            } else {
                filters.push(new Ext.util.Filter({
                    property: this.getModel().prototype.idProperty || 'id',
                    value: operation.id,
                    exactMatch: true,
                    root: 'data'
                }));
            }
            
            
        }
        
        
        if (filters && filters.length > 0) {
            //at this point we have an array of  Ext.util.Filter objects to filter with,
            //so here we construct a function that combines these filters by ANDing them together
            records = [];
            
            Ext.each(result.records, function (record) {
                var isMatch = true,
                    length = filters.length,
                    i;

                for (i = 0; i < length; i++) {
                    var filter = filters[i],
                        fn = filter.filterFn,
                        scope = filter.scope;

                    isMatch = isMatch && fn.call(scope, record);
                }
                if (isMatch) {
                    records.push(record);
                }
            }, this);
            
            result.records = records;
            result.totalRecords = result.total = records.length;
            
        }

        // sorting
        
        if (sorters.length > 0) {
            //construct an amalgamated sorter function which combines all of the Sorters passed
            sorterFn = function (r1, r2) {
                var result = sorters[0].sort(r1, r2),
                    length = sorters.length,
                    i;

                //if we have more than one sorter, OR any additional sorter functions together
                for (i = 1; i < length; i++) {
                    result = result || sorters[i].sort.call(this, r1, r2);
                }

                return result;
            };

            result.records.sort(sorterFn);
        }

        // paging (use undefined cause start can also be 0 (thus false))
        if (operation.start !== undefined && operation.limit !== undefined) {
            result.records = result.records.slice(operation.start, operation.start + operation.limit);
        }
        
        result.count = result.records.length;
        if (operation.id && result.records.length == 0) {
            result.success = false;
        }
        return result;
    },
    read2: function (operation, callback, scope) {
        var result;

        scope = scope || this;
        result = this.createRecordSet(operation);
        
        Ext.apply(operation, {
            resultSet: result
        });

        operation.setCompleted();
        operation.setSuccessful();
        operation.success = result.success;
        

        Ext.Function.defer(function () {
            Ext.callback(callback, scope, [operation]);
        }, 10);
    }
    ,
    create: function (operation, callback, scope) {
        var me = this,cbw;
        cbw = function (op, success, response) {
            
            var data = me.getData(),
                rs = op.resultSet;
            if ( op.wasSuccessful( ) && data != null) {
                data.records = data.records.concat(rs.records);
                //tbd
                    data.totalRecords = data.total += rs.records.length;
                    data.count = data.records.length;
            }
            if (callback) {
                callback.call(scope || this, op, success, response);
            }
        };
        me.doRequest(operation, cbw, scope);
        
    },
    update:function ( operation, callback, scope ) {
        var me = this, cbw, nodeRecords = [];
        cbw = function (op, success, response) {
            
            var data = me.getData(),
                rs = op.resultSet;
            if (data != null) {

                Ext.each(rs.records, function(record) {
                    
                    var foundRecord = me.getRecordById(data.records, record.getId());
                    if (foundRecord && nodeRecords.indexOf(foundRecord) == -1) {
                        nodeRecords.push(foundRecord);
                        foundRecord.copyFrom(record);
                        foundRecord.commit();
                    }
                    //todo:maybe reomve
                    Ext.each(data.nodeStores, function (store) {
                        foundRecord = store.getById(record.getId());
                        if (foundRecord && nodeRecords.indexOf(foundRecord) == -1) {
                            nodeRecords.push(foundRecord);
                            foundRecord.copyFrom(record);
                            foundRecord.commit();
                            if (foundRecord.parentNode && foundRecord.parentNode.getId() != foundRecord.data.parentId) {
                                var newParent = store.getById(foundRecord.data.parentId);
                                if (newParent) {
                                    newParent.appendChild(foundRecord);
                                }
                            }
                        }
                    });
                    
                    
                });
               

            }
            if (callback) {
                callback.call(scope || this, op, success, response);
            }
        };
        me.doRequest(operation, cbw, scope);
    },
    destroy:function (operation,callback, scope) {
        var me = this, cbw;
            cbw = function (op, success, response) {
                var data = me.getData(),
                    itemToRemove;
                if (op.wasSuccessful() && data != null) {
                    Ext.each(op.request.records, function(delRec) {
                        itemToRemove = null;
                        Ext.each(data.records, function (rec) {
                            if (delRec.getId() == rec.getId()) {
                                itemToRemove = rec;
                                return true;
                            }
                        });
                        if ( itemToRemove) {
                            Ext.Array.remove(data.records,itemToRemove);
                        }
                    });
                }
                if (callback) {
                    callback.call(scope || this, op, success, response);
                }
            };
            me.doRequest(operation, cbw, scope);
    }
});


