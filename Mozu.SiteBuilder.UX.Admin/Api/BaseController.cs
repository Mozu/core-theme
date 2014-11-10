using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Autofac;
using Mozu.Core.Api;
using Mozu.Core.Api.Authorization;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Controllers;
using Mozu.Core.ErrorHandling;
using Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Filters;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [Resource(PrimaryResourceType =typeof( Product))]
	[BehaviorAuthorization("No security here")]
    [SiteBuilderAdminAuthorizeAttribute]
    public abstract class BaseController : WebApiController
    {


        private ILifetimeScope _lifetimeScope;
        public ILifetimeScope LifetimeScope
        {
            get
            {
                if (_lifetimeScope == null)
                {
                    _lifetimeScope = (ILifetimeScope)this.ControllerContext.Request.GetDependencyScope().GetService(typeof(ILifetimeScope));


                }
                return _lifetimeScope;
            }
            set { _lifetimeScope = value; }
        }

        private ISiteBuilderApiContext _siteBuilderApiContext;
        private HttpContextBase _httpContextBase;
        public ISiteBuilderApiContext SbApiContext
        {
            get
            {
                if (_siteBuilderApiContext == null)
                {
                    _siteBuilderApiContext = LifetimeScope.Resolve<ISiteBuilderApiContext>();

                }

                return _siteBuilderApiContext;
            }
            set { _siteBuilderApiContext = value; }
        }



        private ICmsServiceWrapper _cmsService;
        public ICmsServiceWrapper CmsService
        {
            get
            {
                if (_cmsService == null)
                {
                    _cmsService = LifetimeScope.Resolve<ICmsServiceWrapper>();
                }
                return _cmsService;
            }
            set
            {
                _cmsService = value;
            }
        }


        public HttpContextBase HttpContext
        {
            get
            {
                if (_httpContextBase == null)
                {
                    _httpContextBase = LifetimeScope.Resolve<HttpContextBase>();
                }
                return _httpContextBase;
            }
            set { _httpContextBase = value; }
        }

        public HttpRequestBase HttpRequestBase
        {
            get { return HttpContext.Request; }
        }
        public HttpResponseBase Response
        {
            get { return HttpContext.Response; }
        }



        [Obsolete]
        public Task<Response<T>> EmptySingle<T>(bool success = true)
        {
            return Task<Response<T>>.Factory.StartNew(() => new Response<T>
            {
                Items = default(T),
                Success = success,
                Total = 0,
            });
        }

        public Response<T> EmptySingle2<T>(bool success = true)
        {
            return new Response<T>
            {
                Items = default(T),
                Success = success,
                Total = 0,
            };
        }

        [Obsolete]
        public Task<Response<T>> Single<T>(T single, int? total = null, string message = null)
        {
            return Task<Response<T>>.Factory.StartNew(() => new Response<T>
            {
                Items = single,
                Success = true,
                Total = total ?? 1,
            });
        }

        public Response<T> Single2<T>(T single, int? total = null, string message = null)
        {
            return new Response<T>
            {
                Items = single,
                Success = true,
                Total = total ?? 1,
            };
        }

        public Task<Response<List<T>>> List<T>(T single, int? total = null)
        {
            #pragma warning disable 612
            return List(new List<T> {single}, total);
            #pragma warning restore 612

        }

        public Response<List<T>> List2<T>(T single, int? total = null)
        {
            var items = new List<T> {single};
            return new Response<List<T>>
                {
                    Items = items,
                    Success = true,
                    Total = total ?? items.Count,
                };
        }


        [Obsolete]
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

        public Response<List<T>, M> List2<T, M>(List<T> list, int? total, M metaData)
        {
            return new Response<List<T>, M>
            {
                Items = list,
                Success = true,
                MetaData = metaData,
                Total = total ?? (list == null ? 0 : list.Count),
            };
        }

        [Obsolete]
        public Task<Response<List<T>>> EmptyList<T>()
        {
            return List(default(List<T>));
        }

        public Response<List<T>> EmptyList2<T>()
        {
            return List2(default(List<T>));
        }

        //public Task<Response<List<T>, VariantMetaData>> ListWithMetaData<T>(List<T> list, VariantMetaData metaData, int? total = null)
        //{
        //    return Task<Response<List<T>, VariantMetaData>>.Factory.StartNew(() => new Response<List<T>, VariantMetaData>()
        //    {
        //        Items = list,
        //        Success = true,
        //        Total = total ?? (list == null ? 0 : list.Count),
        //        MetaData = metaData,
        //    });
        //}

        [Obsolete]
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

        public Response<List<T>> FailureList2<T>(string errorMessage)
        {
            return new Response<List<T>>
                {
                    Items = new List<T>(),
                    Success = false,
                    Total = 0,
                    Message = errorMessage
                };
        }

        /// <summary>
        /// This method is a hacky workaround to extracting the "friendly" error message
        /// out of the MozuApplicationException's Message.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="exception"></param>
        /// <returns></returns>
        public Response<List<T>> FriendlyMozuFailure<T>(MozuApplicationException exception)
        {
            // TODO: One day, maybe the mozu service will return some sort of "FriendlyError" property. Then we won't have to use this BetweenStrings hack. Also there will be unicorns and robots that fly cars.
            string error = exception.Message.BetweenStrings("ErrorMessage: \"", "\"") ?? exception.Message;
            return FailureList2<T>(error);
        }

        [Obsolete]
        public Task<Response<T>> SuccessWithTotal<T>(int total)
        {
            return Task<Response<T>>.Factory.StartNew(() => new Response<T>
            {
                Items = default(T),
                Success = true,
                Total = total,
            });
        }

        public Response<T> SuccessWithTotal2<T>(int total)
        {
            return new Response<T>
            {
                Items = default(T),
                Success = true,
                Total = total
            };
        }

        public Task<Response<T>> Message<T>(bool success, string message)
        {
            return Task<Response<T>>.Factory.StartNew(() => new Response<T>
            {
                Success = success,
                Message = message,
            });
        }
        public Response<T> Message3<T>(bool success, string message)
        {
           return  new Response<T>
                {
                    Success = success,
                    Message = message,
                };
        }

        protected void AnyExceptionsThenThrow<T>(IEnumerable<Task<ServiceClientResponse<T>>> taskResults)
        {
            foreach (var taskResult in taskResults.Where(taskResult => taskResult.Result.HasException))
            {
                throw taskResult.Result.ReadException();
            }
        }
    }
}