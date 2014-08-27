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
    //public class MockProductCategoryRuntimeWebApiClient : IProductCategoryRuntimeWebApiClient
    //{
    //    //Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductRuntime.Contracts.CategoryPagedCollection>> IProductCategoryRuntimeWebApiClient.GetCategories(string filter, int? startIndex, int? pageSize, string sortBy)
    //    //{
    //    //    ProductRuntime.Contracts.CategoryPagedCollection cc = new CategoryPagedCollection();
    //    //    return (new TestResponse<ProductRuntime.Contracts.CategoryPagedCollection>(cc)).Task;
    //    //}

    //    //Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductRuntime.Contracts.Category>> IProductCategoryRuntimeWebApiClient.GetCategory(int? categoryId, bool? allowInactive)
    //    //{
    //    //    ProductRuntime.Contracts.Category cc = new Category();
    //    //    return (new TestResponse<ProductRuntime.Contracts.Category>(cc)).Task;
    //    //}

    //    //Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductRuntime.Contracts.CategoryCollection>> IProductCategoryRuntimeWebApiClient.GetCategoryTree()
    //    //{
    //    //    ProductRuntime.Contracts.CategoryCollection cc = new CategoryCollection()
    //    //                                                         {
    //    //                                                             Items = new List<Category>()
    //    //                                                         };
    //    //    return (new TestResponse<ProductRuntime.Contracts.CategoryCollection>(cc)).Task;
    //    //}



    //    public IServiceClientMessageHandler Handler
    //    {
    //        get
    //        {
    //            throw new NotImplementedException();
    //        }
    //        set
    //        {
    //            throw new NotImplementedException();
    //        }
    //    }

    //    public ConfigOptions Options
    //    {
    //        get
    //        {
    //            throw new NotImplementedException();
    //        }
    //        set
    //        {
    //            throw new NotImplementedException();
    //        }
    //    }

    //    public Task<ServiceClientResponse<CategoryPagedCollection>> GetCategories(string filter = null, int? startIndex = null, int? pageSize = null, string sortBy = null, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public Task<ServiceClientResponse<Category>> GetCategory(int? categoryId, bool? allowInactive = null, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public Task<ServiceClientResponse<CategoryCollection>> GetCategoryTree(Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
    //    {
    //        throw new NotImplementedException();
    //    }
    //}

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
      
        public TestResponse(T entity)
        {
            Result = entity;

            ReadAsAsync = () =>
            {
                    var tcs = new TaskCompletionSource<T>();
                    tcs.SetResult(Result );
                    return tcs.Task;
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
                var tcs = new TaskCompletionSource<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<T>>();
                tcs.SetResult(this);
                return tcs.Task;


                //var task = new Task<ServiceClientResponse<T>>(() => this);
                //task.Start(_testTaskScheduler);
                //return task;
            }
        }

       
    }

}
