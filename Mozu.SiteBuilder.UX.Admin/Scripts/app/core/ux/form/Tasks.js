Ext.define('Taco.core.ux.form.Tasks', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    constructor: function (config) {

        config = Ext.apply(this, config || {});
        var tasks = config.tasks;
        this.tasks = new Ext.util.MixedCollection();

        this.mixins.observable.constructor.call(this, config);
        if (Ext.isFunction(this.finalCallback)) {
            this.finalCallback = {
                fn: this.finalCallback,
                scope: this.scope
            };
        }
        this.addEvents(
            'complete'
        );

        if (tasks) {
            this.add(tasks);
        }
        if (config.autoExecute) {
            this.execute();
        }
        this.errors = [];
    },

    add: function (task) {

        if (task.key) {
            Ext.log.warn({
                msg: 'You cannot do key!',
                option: task, // whatever was passed into the method
                'error code': 100 // other arbitrary info
            });
        }

        if (task.dependencies) {
            Ext.log.warn({
                msg: 'You cannot do dependencies!',
                option: task, // whatever was passed into the method
                'error code': 200 // other arbitrary info
            });
        }


        if (task.length) {
            Ext.each(task, function (t) {
                this.add(t);
            }, this);
            return;
        }


        Ext.applyIf(task, {
            priority: this.tasks.getCount(),
            status: 0
        });


        if (task.updateRecord) {
            if (this.tasks.findBy(function (item) {
                return task.updateForm == item.updateForm;
            })) {
                return;
            }
            task.fn = function (tasks) {
                if (task.updateForm.persistFormValues) {
                    task.updateForm.persistFormValues();
                } else {
                    task.updateForm.getForm().updateRecord(task.updateRecord);
                }


                tasks.callback();
            };
        } else if (task.saveRecord) {
            if (this.tasks.findBy(function (item) {
                return task.saveRecord == item.saveRecord;
            })) {
                return;
            }
            if (!task.dependencyFilter) {
                task.dependencyFilter = function (item) {
                    return task.saveRecord === item.updateRecord;
                };
            }
            task.fn = function (tasks) {
                if (!task.saveRecord.dirty) {
                    tasks.callback();
                    return;
                }
                task.saveRecord.save({
                    failure: function (record, operation) {
                        var msg = operation.error;
                        if (msg && msg.remoteException) {
                            tasks.errors.push(msg.remoteException.getError());
                            msg = msg.remoteException.getMessage();
                        }

                        if (msg) {
                            Taco.app.fireEvent('setmessage', msg, 'error');
                        }
                        tasks.callback(true);
                    },
                    success: function () {
                        tasks.callback();
                    }
                });
            };

        } else if (task.updateForeignKey) {
            task.fn = function (tasks) {
                var id = task.record.getId();

                Ext.each(task.store.getUpdatedRecords(), function (record) {
                    record.set(task.updateForeignKey, id);
                });
                tasks.callback();
            };
        } else if (task.store) {

            if (this.tasks.findBy(function (item) {
                return task.store == item.store;
            })) {
                return;
            }

            task.fn = function (tasks) {
                if (!task.store.getNewRecords().length && !task.store.getUpdatedRecords().length && !task.store.getRemovedRecords().length) {
                    tasks.callback();
                    return;
                }
                task.store.sync({
                    success: function () {
                        tasks.callback();
                    },
                    failure: function (batch) {
                        var msg = batch.operations[0].error;
                        if (msg.remoteException) {
                            tasks.errors.push(msg.remoteException.getError());
                            msg = msg.remoteException.getMessage();

                        }
                        if (msg) {
                            Taco.app.fireEvent('setmessage', msg, 'error');
                        } else {
                            Taco.app.fireEvent('setmessage', 'store sync failed', 'error');
                        }
                        tasks.callback(true);
                    }
                });
            };
        } else if (task.storeToLoad) {

            if (this.tasks.findBy(function (item) {
                return task.storeToLoad == item.storeToLoad;
            })) {
                return;
            }
            if (!task.storeToLoad.isLoading() && task.storeToLoad.hasLoaded()) {
                return;
            }

            task.fn = function (tasks) {

                if (!task.storeToLoad.isLoading()) {
                    if (task.storeToLoad.hasLoaded()) {
                        tasks.callback();
                        return;
                    } else {
                        task.storeToLoad.load({
                            callback: tasks.callback,
                            scope: tasks,

                        });
                        return;
                    }
                }


                task.storeToLoad.whenLoaded(tasks.callback, tasks);


            };
        } else  if (task.modelToLoad) {
            // require a specific model type and id;
            var type = task.modelToLoad.type,
                id = task.modelToLoad.id;



            
            if (this.tasks.findBy(function (item) {
                return task.modelToLoad == item.modelToLoad;
            })) {
                return;
            }
            if (task.modelToLoad.hasLoaded) {
                return;
            }

            task.fn = function (tasks) {
                    
                
                var model = Ext.ModelManager.getModel(type);

                task.modelToLoad.hasLoaded = false;

                model.load(id, {
                    success: function (data) {
                        
                        task.modelToLoad.hasLoaded = true;

                        task.modelToLoad.record = data;
                        tasks.callback();
                    },
                    scope: tasks,
                    single:true
                });

                return;
                //task.modelToLoad.whenLoaded(tasks.callback, tasks);

            };
        }


        task.id = Ext.Number.randomInt(1, 100000000);

        // TODO: REMOVE


        if (task.fn) {
            this.tasks.add(task.id, task);
        }
    },

    sort: function () {
        this.tasks.sortBy(function (a, b) {
            return a.priority - b.priority;
        });
    },

    execute: function () {
        this.completeCount = 0;
        this.totalCount = this.tasks.getCount();

        this.sort();

        this.tasks.each(function (task) {
            task.status = 0;
        });
        Ext.defer(this.runTasks, 1, this);
    },

    runTasks: function () {
        var task,
            taskJob;
        if (this.tasks.getCount() === 0) {
            this.complete = true;
            this.doFinalCallback();
            return;
        }
        while (true) {
            if (this.complete) {
                return;
            }

            task = this.tasks.findBy(this.workableItemsFilter, this);

            if (!task) {
                return;
            }

            taskJob = Ext.applyIf({
                currentTask: task
            }, this);

            taskJob.currentTask.status = 1;

            Ext.defer(taskJob.currentTask.fn, 1, taskJob.currentTask.scope, [taskJob]);
        }
    },

    workableItemsFilter: function (task) {


        var available = task.status === 0;

        if (available && task.dependencyFilter) {
            available = this.tasks.filterBy(task.dependencyFilter, this).filterBy(function (dependency) {
                return dependency.status !== 3;
            }).getCount() === 0;
        }
        if (available && task.dependencyForFilter) {
            available = this.tasks.filterBy(task.dependencyForFilter, this).filterBy(function (dependency) {
                return dependency == task;
            }).getCount() === 0;
        }
        return available;


    },

    callback: function (stop) {

        this.currentTask.status = 3;

        if (stop === true) {
            this.currentTask.status = 2;
            this.complete = false;
            this.doFinalCallback();
            return;
        }

        if (!this.tasks.findBy(function (task) {
            return task.status !== 3;
        })) {
            this.complete = true;
            this.doFinalCallback();
            return;
        }
        this.runTasks();
    },

    doFinalCallback: function () {

        this.fireEvent('complete', this);
        this.tasks.clear();
        if (!this.finalCallback) {
            return;
        }
        this.finalCallback.fn.call(this.finalCallback.scope || this, this);
    }
});