/**
 * @author  thomas_phipps
 * @class  Taco.core.EventChain
 * Chain tasks into a queue, describe their dependencies, place tasks on desk, clean desk.
 */

/*globals console*/
/*global Ext, Taco */
/*jslint sloppy: true */

    Ext.define('Taco.core.EventChain', {

        constructor: function (config) {

            Ext.apply(this, config || {});
        },
        tasks: new Ext.util.MixedCollection(),

        /**
         * Add an item.
         * @param {Object} item A task to do.
         */
        add: function (item) {
            Ext.applyIf(item, {
                priority: this.tasks.getCount(),
                depends: [],
                status:0
            });
            this.tasks.add(item.key, item);
        },
        state:{},
        /**
         * Remove an item.
         * @param  {Number} key Key of the item to remove.
         * @return {undefined} 
         */
        remove: function (key) {
            this.tasks.removeAtKey(key);
        },
        /**
         * Sort the tasks by priority.
         * @return {undefined} 
         */
        sort: function () {

            this.tasks.sortBy(
                function (a, b) {
                    return a.priority - b.priority;
                }
            );


        },
        /**
         * Validate that all dependencies for all tasks are present in the chain. **NOTE:** Does not return Boolean--instead raises an Ext.Error.
         * @return {undefined} 
         */
        validateDepends: function () {
            var t = this.tasks;
            t.each(function (item) {
                Ext.Array.each(item.depends, function (dep, idx, arr) {
                    if (!t.containsKey(dep))
                    {
                        Ext.Error.raise({
                            msg: 'missing dependancy [' + dep + ']',
                            code: 2
                        });
                    }
                });


            });
        },
        /**
         * @cfg
         * True to log activity to the console.
         * @type {Boolean}
         */
        shouldLog: false,
        /**
         * @private
         * Log to the console, if #shouldLog is true.
         * @return {undefined}
         */
        log: function () {
            if (this.shouldLog)
            {
                console.log(arguments);
            }
        },
        /**
         * @property
         * True when all tasks are complete.
         * @type {Boolean}
         */
        complete: false,
        /**
         * Check whether a given task is ready to execute.
         * @param  {Object} item The task to check.
         * @return {Boolean}      
         */
        workableItemsFilter: function (item) {
            var me = this;
            return item.status === 0 && !item.depends.some(function (key) {
                var dep = me.tasks.getByKey(key);
                return dep && dep.status !== 3;
            });
        },
        /**
         * Add a task to save any changes to a Taco.core.data.Model.
         * @param {Object} eOpts Config for task.
         */
        addModelSaveTask: function (eOpts) {
            var model = eOpts.model,
                taskKey = eOpts.key,
                //errorMsg = eOpts.errorMsg,
                depends = eOpts.depends || [],
                fn = function (chain) {
                    if (!model.dirty)
                    {
                        chain.callback();
                        return;
                    }
                    model.save({
                       failure: function (record, operation) {
                            var msg = record.getMessage();
                            if (msg)
                            {
                                Taco.app.fireEvent('setmessage', msg, 'error');
                            }
                            chain.callback(false);
                        },
                        success: function (record, operation) {

                            chain.callback();

                        }
                    });
                };
            this.add(
            {
                key: taskKey,
                depends: depends,
                fn: fn
            });

            
            
            
        },
        /**
         * Add a task to synchronize all stores with updated models.
         * @param {Objects} eOpts Config for task.
         */
        addSyncStoreTask: function (eOpts) {
            var store = eOpts.store,
                taskKey = eOpts.key,
                errorMsg = eOpts.errorMsg,
                depends = eOpts.depends || [],
                fn = function (chain) {
                if (store.getNewRecords().length === 0 &&
                     store.getUpdatedRecords().length === 0 &&
                     store.getRemovedRecords().length === 0)
                {
                    chain.callback();
                    return;
                }

                store.sync({
                    success: function () {
                        chain.callback();
                    }
                    ,
                    failure: function () {
                        if (errorMsg)
                        {
                            Taco.app.fireEvent('setmessage', errorMsg, 'error');
                        }
                        chain.log('failed to sync store ', arguments, this);
                        chain.callback(false);
                    }
                });
            };
            this.add(
            {
                key: taskKey,
                depends: depends,
                fn: fn
            });

        },
        /**
         * Do the needful. Execute all tasks available according to dependency chain.
         * @return {undefined} 
         */
        runTasks: function () {
            var task,
                    taskJob,
                    me = this;

            while (true)
            {
                if (me.complete === true)
                {
                    return;
                }

                task = me.tasks.findBy(me.workableItemsFilter, me);

                if (!task)
                {
                    return;
                }

                taskJob = Ext.applyIf({ task: task , parent:me }, me);

                me.log('starting task-' + taskJob.task.key, taskJob);
                taskJob.task.status = 1;
                Ext.defer(taskJob.task.fn, 1, taskJob.task.scope, [taskJob]);

            }
        },
        /**
         * Execute the next task in the chain. This method is supposed to be called from inside the callback of an asynchronous task. A chain involves repeated calls to #callback.
         * @param  {XMLHttpRequest}   res A server response, if appropriate.
         * @return {undefined}
         */
        callback: function (res) {

            this.log('finished task-' + this.task.key, this);
            this.task.status = 3;
            
            Ext.applyIf(this.me, this);

            if (res === false)
            {
                this.task.status = 2;
                this.complete = false;
                this.log('aborted tasks', this);
                this.doFinalCallback();
                return;
            }

            if (!this.tasks.findBy(function (t) {
                return t.status !== 3;
            }))
            {
                this.complete = true;
                this.log('finished tasks', this);
                this.doFinalCallback();
                return;
            }
            this.runTasks();
        },
        /**
         * Do the very last thing in the chain.
         * @return {undefined} 
         */
        doFinalCallback: function () {
            if (this.finalCallback)
            {
                this.finalCallback.fn.call(this.finalCallback.scope || this, this);
            }
        }
        ,
        /**
         * Do work, obviously. Shouldn't you be working?
         * @param  {Object} cfg Config to apply to this object.
         * @return {undefined}     
         */
        doWork: function (cfg) {
            this.validateDepends();
            this.sort();

            this.tasks.each(function (t) { t.status = 0; });


            Ext.apply(this, cfg || {});
            this.runTasks();
        }

    });
