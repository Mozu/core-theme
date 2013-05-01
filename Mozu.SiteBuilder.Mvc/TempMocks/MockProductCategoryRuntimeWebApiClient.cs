using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductRuntime.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.TempMocks
{
    public class MockProductCategoryRuntimeWebApiClient : IProductCategoryRuntimeWebApiClient
    {
        Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductRuntime.Contracts.CategoryPagedCollection>> IProductCategoryRuntimeWebApiClient.GetCategories(string filter, int? startIndex, int? pageSize, string sortBy)
        {
            ProductRuntime.Contracts.CategoryPagedCollection cc = new CategoryPagedCollection();
            return (new TestResponse<ProductRuntime.Contracts.CategoryPagedCollection>(cc)).Task;
        }

        Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductRuntime.Contracts.Category>> IProductCategoryRuntimeWebApiClient.GetCategory(int? categoryId, bool? allowInactive)
        {
            ProductRuntime.Contracts.Category cc = new Category();
            return (new TestResponse<ProductRuntime.Contracts.Category>(cc)).Task;
        }

        Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductRuntime.Contracts.CategoryCollection>> IProductCategoryRuntimeWebApiClient.GetCategoryTree()
        {
            ProductRuntime.Contracts.CategoryCollection cc = new CategoryCollection()
                                                                 {
                                                                     Items = new List<Category>()
                                                                 };
            return (new TestResponse<ProductRuntime.Contracts.CategoryCollection>(cc)).Task;
        }



        public IServiceClientMessageHandler Handler
        {
            get
            {
                throw new NotImplementedException();
            }
            set
            {
                throw new NotImplementedException();
            }
        }

        public ConfigOptions Options
        {
            get
            {
                throw new NotImplementedException();
            }
            set
            {
                throw new NotImplementedException();
            }
        }
    }

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
                return entity;
            };
            ResponseMessage = new HttpResponseMessage();
        }

        protected T Result { get; private set; }

        public Task<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<T>> Task
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
