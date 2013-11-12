Ext.define('Taco.core.ux.form.Tasks', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    constructor: function (config) {
        Ext.apply(this, config || {});
        this.tasks = new Ext.util.MixedCollection();

        this.mixins.observable.constructor.call(this, config);

        this.addEvents(
            'complete'
        );
        this.errors = [];
    },

    add: function (task) {

        if (task.key) {
            Ext.log.warn({
                msg: 'You cannot do key!',
                option: task,   // whatever was passed into the method
                'error code': 100 // other arbitrary info
            });
        }

        if (task.dependencies) {
            Ext.log.warn({
                msg: 'You cannot do dependencies!',
                option: task,   // whatever was passed into the method
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
                // console.log('redundant updateRecord');
                return;
            }
            task.fn = function (tasks) {
                if (task.updateForm.persistFormValues) {
                    task.updateForm.persistFormValues();
                } else {
                    task.updateForm.getForm().updateRecord(task.updateRecord);
                }

                console.log('updateRecord - success');
                tasks.callback();
            };
        } else if (task.saveRecord) {
            if (this.tasks.findBy(function (item) {
                return task.saveRecord == item.saveRecord;
            })) {
                // console.log('redundant saveRecord');
                return;
            }
            if (!task.dependencyFilter) {
                task.dependencyFilter = function (item) {
                    return task.saveRecord === item.updateRecord;
                };
            }
            task.fn = function (tasks) {
                if (!task.saveRecord.dirty) {
                    console.log('saveRecord - not dirty');
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
                        console.log('saveRecord - failure');
                        tasks.callback(true);
                    },
                    success: function () {
                        console.log('saveRecord - sucess');
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
                console.log('redundant store');
                return;
            }

            task.fn = function (tasks) {
                if (!task.store.getNewRecords().length && !task.store.getUpdatedRecords().length && !task.store.getRemovedRecords().length) {
                    tasks.callback();
                    console.log('syncstore - no changes');
                    return;
                }
                task.store.sync({
                    success: function () {
                        console.log('syncstore - success');
                        tasks.callback();
                    },
                    failure: function (batch, options) {
                        var msg = batch.operations[0].error;
                        if (msg.remoteException) {
                            msg = msg.remoteException.getMessage();
                            tasks.errors.push(msg.remoteException.getError());
                        }
                        if (msg) {
                            Taco.app.fireEvent('setmessage', msg, 'error');
                        } else {
                            Taco.app.fireEvent('setmessage', 'store sync failed', 'error');
                        }
                        console.log('syncstore - failure');
                        tasks.callback(true);
                    }
                });
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
        console.log('tasks - execute');
        this.completeCount = 0;
        this.totalCount = this.tasks.getCount();

        //this.validateDependencies();

        this.sort();

        this.tasks.each(function (task) {
            task.status = 0;
        });

        this.runTasks();
    },

    runTasks: function () {
        var task,
            taskJob;

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

        //return task.status === 0 && !Ext.Array.some(task.dependencies, function (key) {
        //    var dependency = this.tasks.getByKey(key);
        //    return dependency && dependency.status !== 3;
        //}, this);
        var notStarted = task.status === 0;

        if (notStarted && task.dependencyFilter) {
            return this.tasks.filterBy(task.dependencyFilter, this).filterBy(function (dependency) {
                return dependency.status !== 3;
            }).getCount() === 0;
        }
        return notStarted;


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
        console.log('final callback');

        this.fireEvent('complete', this);
        this.tasks.clear();
        if (!this.finalCallback) {
            return;
        }
        this.finalCallback.fn.call(this.finalCallback.scope || this, this);
    }
});