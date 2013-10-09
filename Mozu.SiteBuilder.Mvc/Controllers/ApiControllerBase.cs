using System.IO;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Autofac;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.Controllers
{
    public class ApiControllerBase : ApiController, IHyprController
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



        ISiteBuilderContext _sc;
        public ISiteBuilderContext SiteContext
        {
            get
            {
                if (_sc == null)
                {
                    _sc = LifetimeScope.Resolve<ISiteBuilderContext>();
                }
                return _sc;
            }
            set
            {
                _sc = value;
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




        protected internal FileContentResult File(byte[] fileContents, string contentType)
        {
            return File(fileContents, contentType, null /* fileDownloadName */);
        }

        protected internal virtual FileContentResult File(byte[] fileContents, string contentType, string fileDownloadName)
        {
            return new FileContentResult(fileContents, contentType) { FileDownloadName = fileDownloadName };
        }



        protected internal virtual FileStreamResult File(Stream fileStream, string contentType, string fileDownloadName)
        {
            return new FileStreamResult(fileStream, contentType) { FileDownloadName = fileDownloadName };
        }

        protected internal FilePathResult File(string fileName, string contentType)
        {
            return File(fileName, contentType, null /* fileDownloadName */);
        }

        protected internal virtual FilePathResult File(string fileName, string contentType, string fileDownloadName)
        {
            return new FilePathResult(fileName, contentType) { FileDownloadName = fileDownloadName };
        }



        // var cc = new ControllerContext(new HttpContextWrapper(HttpContext.Current), new RouteData(), new FooController());
        protected internal ViewResult View(object model)
        {
            return View(null /* viewName */, model);
        }

        protected internal ViewResult View(string viewName)
        {
            return View(viewName, model: null);
        }

        protected internal virtual RedirectResult Redirect(string url)
        {

            return new RedirectResult(url);
        }



        protected internal ViewResult View(string viewName, object model)
        {
            return View(viewName, null /* masterName */, model);
        }

       

        protected internal virtual ViewResult View(string viewName, string masterName, object model)
        {
            if (model != null)
            {
                ViewData.Model = model;
            }

            if (string.IsNullOrEmpty(viewName))
            {

                viewName = (string)this.ControllerContext.RouteData.Values["action"];

            }
            return new ViewResult
            {
                ViewName = viewName,

                ViewData = ViewData

            };
        }


        protected internal PartialViewResult PartialView()
        {
            return PartialView(null /* viewName */, null /* model */);
        }

        protected internal PartialViewResult PartialView(object model)
        {
            return PartialView(null /* viewName */, model);
        }

        protected internal PartialViewResult PartialView(string viewName)
        {
            return PartialView(viewName, null /* model */);
        }

        protected internal virtual PartialViewResult PartialView(string viewName, object model)
        {
            if (model != null)
            {
                ViewData.Model = model;
            }




            return new PartialViewResult
            {
                ViewName = viewName,
                ViewData = ViewData
            };
        }





        private ViewDataDictionary _viewDataDictionary;
        public ViewDataDictionary ViewData
        {
            get
            {
                if (_viewDataDictionary == null)
                {
                    _viewDataDictionary = new ViewDataDictionary();
                    //_viewDataDictionary["ControllerContext"] = this.MvcControlerContext;
                    _viewDataDictionary["ControllerContext"] = this.ControllerContext;
                }
                return _viewDataDictionary;
            }
            set { _viewDataDictionary = value; }
        }
        public FileStreamResult File(Stream fileStream, string contentType)
        {
            return new FileStreamResult(fileStream, contentType);
        }



        public ContentResult Content(string content, string contentType)
        {
            return new ContentResult()
            {
                Content = content,
                ContentType = contentType
            };
        }
    }
}
