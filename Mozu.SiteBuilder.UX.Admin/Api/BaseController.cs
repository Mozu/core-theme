using System.Collections.Generic;
using System.Web.Http;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public abstract class BaseController : ApiController, IApiController
    {
        public Response<T> EmptySingle<T>(bool success = true)
        {
            return new Response<T>
            {
                Items = default(T),
                Success = success,
                Total = 0,
            };
        }

        public Response<T> Single<T>(T single, int? total = null)
        {
            return new Response<T>
            {
                Items = single,
                Success = true,
                Total = total ?? 1,
            };
        }

        public Response<List<T>> List<T>(T single, int? total = null)
        {
            return List(new List<T> { single }, total);
        }

        public Response<List<T>> List<T>(List<T> list, int? total = null)
        {
            return new Response<List<T>>
            {
                Items = list,
                Success = true,
                Total = total ?? (list == null ? 0 : list.Count),
            };
        }

        public Response<List<T>> EmptyList<T>()
        {
            return List(default(List<T>));
        }

        public Response<List<T>, VariantMetaData> ListWithMetaData<T>(List<T> list, VariantMetaData metaData, int? total = null)
        {
            return new Response<List<T>, VariantMetaData>()
            {
                Items = list,
                Success = true,
                Total = total ?? (list == null ? 0 : list.Count),
                MetaData = metaData,
            };
        }

        public Response<List<T>> FailureList<T>(string errorMessage)
        {
            return new Response<List<T>>
            {
                Items = new List<T>(),
                Success = false,
                Total = 0,
                Message = errorMessage,
            };
        }

        public Response<T> SuccessWithTotal<T>(int total)
        {
            return new Response<T>
            {
                Items = default(T),
                Success = true,
                Total = total,
            };
        }

        public Response<T> Message<T>(bool success, string message)
        {
            return new Response<T>
            {
                Success = success,
                Message = message,
            };
        }
    }
}