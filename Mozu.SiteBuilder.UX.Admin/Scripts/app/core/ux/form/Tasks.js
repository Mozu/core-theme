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
    },

    add: function (task) {
        if (task.length) {
            Ext.each(task, function (t) {
                this.add(t);
            }, this);
            return;
        }

        if (typeof task.dependencies === 'string') {
            task.dependencies = [task.dependencies];
        }

        Ext.applyIf(task, {
            priority: this.tasks.getCount(),
            dependencies: [],
            status: 0
        });

        if (task.updateRecord) {
            task.fn = function (tasks) {
                task.updateForm.getForm().updateRecord(task.updateRecord);
                console.log('updateRecord - success');
                tasks.callback();
            };
        } else if (task.saveRecord) {
            task.fn = function (tasks) {
                if (!task.saveRecord.dirty) {
                    console.log('saveRecord - not dirty');
                    tasks.callback();
                    return;
                }
                task.saveRecord.save({
                    failure: function (record) {
                        var msg = record.getMessage();
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
        } else if (task.store) {
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
                    failure: function () {
                        Taco.app.fireEvent('setmessage', 'store sync failed', 'error');
                        console.log('syncstore - failure');
                        chain.callback(false);
                    }
                });
            };
        }

        this.tasks.add(task.key, task);
    },

    validateDependencies: function () {
        this.tasks.each(function (task) {
            Ext.each(task.dependencies, function (dependency) {
                if (this.tasks.containsKey(dependency)) {
                    return;
                }
                Ext.Error.raise({
                    msg: 'missing dependency [' + dependency + ']',
                    code: 2
                });
            }, this);
        }, this);
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

        this.validateDependencies();

        this.sort();

        this.tasks.each(function (task) {
            task.status = 0;
        });

        this.runTasks();
    },

    runTasks: function () {
        var task,
            taskJob;

        while(true) {
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
            console.log('defering task', taskJob.currentTask.key);
            Ext.defer(taskJob.currentTask.fn, 1, taskJob.currentTask.scope, [taskJob]);
        }
    },

    workableItemsFilter: function (task) {
        return task.status === 0 && !task.dependencies.some(function (key) {
            var dependency = this.tasks.getByKey(key);
            return dependency && dependency.status !== 3;
        }, this);
    },

    callback: function (stop) {
        console.log('callback', this.currentTask.key, 'stop = ' + stop);
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
        this.complete = true;
        this.fireEvent('complete');
        if (!this.finalCallback) {
            return;
        }
        this.finalCallback.fn.call(this.finalCallback.scope || this, this);
    }
});