using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Mozu.Content.Contracts;
using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using System.Web.Routing;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.Tags;
using Autofac;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Checkout;
using Mozu.User.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Controllers
{
    public abstract class BaseController : Controller
    {
        private ILifetimeScope _lifetimeScope;
        protected bool  SuppressMissingContextRedirect = false;
        private IAuthenticationHelper _authenticationHelper;

        public BaseController() //( IComponentContext container)
        {
            LifetimeScope = DependencyResolver.Current.GetService<ILifetimeScope>();
           
        }

        //tbd move to an action filter
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (!filterContext.IsChildAction && this.NeedsTokenRefresh())
            {
                AsyncRefreshToken().Wait();
            }


            if (!SuppressMissingContextRedirect && !filterContext.IsChildAction && (this.ApiContext.TenantId < 0 || !this.ApiContext.SiteId.HasValue))
            {
                var settings = LifetimeScope.Resolve<ISettings>();
                var redirUrl = settings.AppSettings("missingContextRedirect") ?? "/admin";
                filterContext.Result = new RedirectResult(redirUrl);
               

            }
            base.OnActionExecuting(filterContext);
        }

        public ILifetimeScope LifetimeScope
        {
            get { return _lifetimeScope; }
            set { _lifetimeScope = value; }
        }



      
     
        public IAuthenticationHelper AuthHelper
        {
            get
            {
                if (_authenticationHelper == null)
                {
                    _authenticationHelper = LifetimeScope.Resolve<IAuthenticationHelper>();
                }
                return _authenticationHelper;
            }
        } 

        public async Task<bool> AsyncInitData()
        {
            
            CmsHelper helper = new CmsHelper(this.CmsService);
            var ret =await helper.InitCmsPageContext(SiteContext.PageContext.CmsContext);

            
            return ret;

        }

        //public virtual Task<ServiceClientResponse<Mozu.Core.Api.Contracts.UserAuthTicket>> RefreshUserAuthTicket(string refreshToken)
        //{
        //    var relpath = "refresh";
        //    return Handler.SendAsync<Mozu.Core.Api.Contracts.UserAuthTicket, System.String>("PUT", relpath, refreshToken, ServiceId, Options);
        //}
        public Task<bool> AsyncRefreshToken()
        {

            string token = AuthHelper.GetAuthTicket().RefreshToken;
            var ticketClient = LifetimeScope.Resolve<Mozu.User.Contracts.Clients.IAuthTicketWebApiClient>().CloneWithoutUserClaims();
            //var task = ticketClient.RefreshUserAuthTicket(token);
            var task = ticketClient.Handler.SendAsync<Mozu.Core.Api.Contracts.UserAuthTicket>("PUT", "refresh?refreshToken=" + token, ((AuthTicketWebApiClient)ticketClient).ServiceId, ticketClient.Options);

            task.ConfigureAwait(false);
            var retTask =task.ContinueWith(serviceClientResponse =>
                {
                    var resp = serviceClientResponse.Result;
                    if (resp.ResponseMessage.IsSuccessStatusCode)
                    {
                        var ticket = resp.ReadAsSync();
                        var lwuc = LightweightUserClaims.Parse(ticket.AccessToken);
                        this.AuthHelper.SaveAuthTicket(ticket);
                        this.ApiContext.SetUser(lwuc);
                    }
                    else
                    {
                        ClearAccessToken();
                    }
                    return true;
                });
            return retTask;

        }
        public void ClearAccessToken()
        {
            var uc = LightweightUserClaims.CreateForAnonymousShopper(this.ApiContext.TenantId, this.ApiContext.SiteId.Value );
            var extingTicket = AuthHelper.GetAuthTicket() ?? new UserAuthTicket();
            extingTicket.AccessToken = uc.ToAccessToken();

            this.AuthHelper.SaveAuthTicket(extingTicket);
            this.ApiContext.SetUser(uc);
        }
        
        public bool NeedsTokenRefresh()
        {
            return this.ApiContext != null && this.ApiContext.UserClaims != null && !this.ApiContext.UserClaims.IsAnonymous && ( this.ApiContext.UserClaims.Expiration- DateTime.Now  ).TotalMinutes < 5 && AuthHelper.GetAuthTicket() != null ;
        }


        protected override IAsyncResult BeginExecute(RequestContext requestContext, AsyncCallback callback, object state)
        {
            bool isEditModeFlg;

            if (requestContext.HttpContext != null &&
                bool.TryParse(requestContext.HttpContext.Request["isEditMode"] as string, out isEditModeFlg) && isEditModeFlg)
            {
                this.SiteContext.IsEditMode = isEditModeFlg;
            }
            return base.BeginExecute(requestContext, callback, state);
        }
     

 

        protected override void Execute(RequestContext requestContext)
        {
           
           // var isEditMode = ;
            bool isEditModeFlg;
            



            if ( requestContext.HttpContext!= null  &&
                bool.TryParse(requestContext.HttpContext.Request ["isEditMode"] as string, out isEditModeFlg) && isEditModeFlg)
            {
                this.SiteContext.IsEditMode = isEditModeFlg;
            }
            base.Execute(requestContext);
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

        private ISiteBuilderApiContext _apiContext;

        public ISiteBuilderApiContext ApiContext
        {
            get
            {
                if (_apiContext == null)
                {
                    _apiContext = LifetimeScope.Resolve<ISiteBuilderApiContext >();
                }
                return _apiContext;
            }
            set { _apiContext = value; }
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
   

        public RouteValueDictionary DjangoTemplateTagArguments
        {
            get
            {
                if (ControllerContext == null)
                    return null;

                object obj;
                if (this.ControllerContext.RequestContext.RouteData.Values.TryGetValue(ArgumentCollection.ArgumentDictionaryKey, out  obj))
                {
                    return (RouteValueDictionary)obj;
                }
                return null;
            }
        }

        protected override ViewResult View(string viewName, string masterName, object model)
        {
            var args = this.DjangoTemplateTagArguments;

            if ( args != null )
            {
                object overrideViewName;
                if ( args.TryGetValue ( "viewName", out overrideViewName )&& overrideViewName is string )
                {
                    viewName  = (string)overrideViewName;
                }
            }
            return base.View(viewName, masterName, model);
        }

        protected override  PartialViewResult PartialView(string viewName, object model)
        {
            var args = this.DjangoTemplateTagArguments;

            if (args != null)
            {
                object overrideViewName;
                if (args.TryGetValue("viewName", out overrideViewName) && overrideViewName is string)
                {
                    viewName = (string)overrideViewName;
                }
            }
            return base.PartialView(viewName,  model);
        }
       

        
        protected override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            if (this.SiteContext.PageContext != null && this.SiteContext.PageContext.CmsContext != null && !this.SiteContext.PageContext.CmsContext.Initialized)
            {
             //   var task = this.AsyncInitData();
              //  task.Wait();
            }
            var od = this.DjangoTemplateTagArguments;
            if (od != null)
            {
                foreach (var kvp in od)
                {
                    if (!this.ViewData.ContainsKey(kvp.Key))
                    {
                        this.ViewData[kvp.Key] = kvp.Value;
                    }
                }
            }
            base.OnResultExecuting(filterContext);
        }
    }
}
