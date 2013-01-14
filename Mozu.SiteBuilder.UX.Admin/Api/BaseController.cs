using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public abstract class BaseController : ApiController, IApiController
    {
        public Task<Response<T>> EmptySingle<T>(bool success = true)
        {
            return Task<Response<T>>.Factory.StartNew(() => new Response<T>
            {
                Items = default(T),
                Success = success,
                Total = 0,
            });
        }

        public Task<Response<T>> Single<T>(T single, int? total = null, string message = null)
        {
            return Task<Response<T>>.Factory.StartNew(() => new Response<T>
            {
                Items = single,
                Success = true,
                Total = total ?? 1,
            });
        }

        public Task<Response<List<T>>> List<T>(T single, int? total = null)
        {
            return List(new List<T> { single }, total);
        }

        public Task<Response<List<T>>> List<T>(List<T> list, int? total = null)
        {
            return Task<Response<List<T>>>.Factory.StartNew(() => new Response<List<T>>
            {
                Items = list,
                Success = true,
                Total = total ?? (list == null ? 0 : list.Count),
            });
        }

        public Response<List<T>> List2<T>(List<T> list, int? total = null)
        {
            return new Response<List<T>>
            {
                Items = list,
                Success = true,
                Total = total ?? (list == null ? 0 : list.Count),
            };
        }

        public Task<Response<List<T>>> EmptyList<T>()
        {
            return List(default(List<T>));
        }

        public Task<Response<List<T>, VariantMetaData>> ListWithMetaData<T>(List<T> list, VariantMetaData metaData, int? total = null)
        {
            return Task<Response<List<T>, VariantMetaData>>.Factory.StartNew(() => new Response<List<T>, VariantMetaData>()
            {
                Items = list,
                Success = true,
                Total = total ?? (list == null ? 0 : list.Count),
                MetaData = metaData,
            });
        }

        public Task<Response<List<T>>> FailureList<T>(string errorMessage)
        {
            return Task<Response<List<T>>>.Factory.StartNew(() => new Response<List<T>>
            {
                Items = new List<T>(),
                Success = false,
                Total = 0,
                Message = errorMessage,
            });
        }

        public Task<Response<T>> SuccessWithTotal<T>(int total)
        {
            return Task<Response<T>>.Factory.StartNew(() => new Response<T>
            {
                Items = default(T),
                Success = true,
                Total = total,
            });
        }

        public Task<Response<T>> Message<T>(bool success, string message)
        {
            return Task<Response<T>>.Factory.StartNew(() => new Response<T>
            {
                Success = success,
                Message = message,
            });
        }
    }
}