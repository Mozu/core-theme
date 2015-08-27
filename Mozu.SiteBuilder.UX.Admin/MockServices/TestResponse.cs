using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Core.Api.Contracts.Client;

namespace Mozu.SiteBuilder.UX.Admin.MockServices
{
    /// <summary>
    /// TestResponse class, borrowed verbatim from the IntegrationTests project.
    /// </summary>
    public class TestResponse : ServiceClientResponse<StreamContent>
    {
        public static StreamContent Void
        {
            get { return new StreamContent(new MemoryStream()); }
        }
    }

    public class TestResponse<T> : ServiceClientResponse<T>
    {
        private readonly TaskScheduler _testTaskScheduler = new CurrentThreadTaskScheduler();

        public TestResponse(T entity)
        {
            Result = entity;

            ReadAsAsync = () =>
            {
                var task = new Task<T>(() => Result);
                task.Start(_testTaskScheduler);
                return task;
            };

            ReadAsSync = () =>
            {
                throw new Exception("You probably want to use ReadAsAsync here... Just sayin.");
            };
            ResponseMessage = new HttpResponseMessage();
        }

        protected T Result { get; private set; }

        public Task<ServiceClientResponse<T>> Task
        {
            get
            {
                var task = new Task<ServiceClientResponse<T>>(() => this);
                task.Start(_testTaskScheduler);
                return task;
            }
        }

        private class CurrentThreadTaskScheduler : TaskScheduler
        {
            protected override void QueueTask(Task task)
            {
                TryExecuteTask(task);
            }

            protected override bool TryExecuteTaskInline(Task task, bool taskWasPreviouslyQueued)
            {
                return true;
            }

            protected override IEnumerable<Task> GetScheduledTasks()
            {
                return Enumerable.Empty<Task>();
            }
        }
    }
}