//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Net.Http;
//using System.Text;
//using System.Threading;
//using System.Threading.Tasks;
//using System.Web.Http.Controllers;
//using Mozu.Core.Actions;
//using Mozu.Core.Actions.Contracts;
//using Mozu.SiteBuilder.Mvc.ActionResults;
//using Mozu.SiteBuilder.Mvc.Catalog;
//using Mozu.SiteBuilder.Mvc.Contexts;
//using Mozu.SiteBuilder.Mvc.Helpers;
//using Mozu.SiteBuilder.Mvc.ViewEngine;
//using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
//using Newtonsoft.Json.Linq;
//using System.Text.RegularExpressions;
//using Mozu.Core.Api.Contracts.Client;
//using Mozu.Core.Api.Client;
//using Mozu.Core;
//using Mozu.SiteBuilder.Mvc.Security;
//using Newtonsoft.Json;

//namespace Mozu.SiteBuilder.Mvc.OAF
//{
//    public class SbActionExtensionFilterAttribute : ActionExtensionFilterAttribute
//    {
//        public SbActionExtensionFilterAttribute(string actionId, ActionExtensionExecutionTypes executionType, Type actionFilterType = null, Type resourceProviderType = null) :
//            base(actionId, executionType, typeof(ISbActionExtensionFilter), resourceProviderType)
//        {
//            this.FunctionActionFilterType = typeof(ISbActionExtensionFilter);
//        }
//        public SbActionExtensionFilterAttribute()
//        {
//            this.FunctionActionFilterType = typeof(ISbActionExtensionFilter);
//        }

//    }
//    public interface ISbActionExtensionFilter : IActionExtensionFilter
//    { }

//    public class SbActionExtensionFilter : ApiActionExtensionFilter, ISbActionExtensionFilter
//    {
//        public override IFunctionCallbackHandler CreateHandler(HttpActionContext actionContext)
//        {
//            return new WrappedFunctionCallbackHandler(DefaultFunctionCallbackHandler.Default)
//            {
//                BeforeExecuteHandler = (handler, fn) =>
//                {

//                    var response = actionContext.Response;
//                    if (response != null)
//                    {
//                        if (response.Content is ObjectContent)
//                        {
//                            var val = ((ObjectContent)response.Content).Value;
//                            if (val is TransferResult || val is RedirectResult)
//                            {
//                                return FunctionContinuationBehavior.Stop;
//                            }
//                        }
//                        else
//                        {
//                            if (response.StatusCode == System.Net.HttpStatusCode.Redirect || response.StatusCode == System.Net.HttpStatusCode.MovedPermanently)
//                            {
//                                return FunctionContinuationBehavior.Stop;
//                            }
//                        }
//                    }

//                    return handler.OnBeforeExecute(fn);
//                }
//            };
//        }

//        protected override ApiActionExtensionFilterContext CreateFunctionContext(HttpActionContext actionContext)
//        {
//            return this.CreateFunctionContextExternal(actionContext);
//        }
//        public ApiActionExtensionFilterContext CreateFunctionContextExternal(HttpActionContext actionContext)
//        {
//            InitSBActionContext(actionContext);
//            var ctx = new SbiActionExtensionFilterContext(this.ResourceFactory, actionContext);
//            ctx.ExecFactory = _ => new SbExecs(_, actionContext);
//            return ctx;
//        }
//        //return new ApiActionExtensionFilterContext(this.ResourceFactory, actionContext);


//        public class SbiActionExtensionFilterContext : ApiActionExtensionFilterContext
//        {
//            public SbiActionExtensionFilterContext(Func<HttpActionContext, Tuple<object, System.Net.HttpStatusCode>> resourceFactory, HttpActionContext actionContext) :
//                base(resourceFactory, actionContext)
//            {

//            }



//            [Newtonsoft.Json.JsonIgnore]
//            [System.Text.Json.Serialization.JsonIgnore]
//            public new SbExecs exec => (SbExecs)base.exec;
//        }

//        public static void InitSBActionContext(HttpActionContext actionContext)
//        {
//            AddToActionContext<SiteContext>(actionContext.Request, "siteContext");
//            AddToActionContext<PageContext>(actionContext.Request, "pageContext");
//            AddToActionContext<NavigationContext>(actionContext.Request, "navigation");
//            AddToActionContext<UrlHelper>(actionContext.Request, "urlHelper");
//            //var routeData = new Microsoft.ClearScript.PropertyBag();
//            //foreach (var kvp in actionContext.Request.GetRouteData().Values)
//            //{
//            //    routeData[kvp.Key] = kvp.Value;
//            //}
//            //AddToActionContext<Microsoft.ClearScript.PropertyBag>(actionContext.Request, "routeData", routeData);

//            var catTreeProvider = actionContext.Request.Resolve<ICategoryTreeProvider>();

//            if (catTreeProvider.HasCompleted)
//            {
//                AddToActionContext<ICategoryTree>(actionContext.Request, "categoryHelper", catTreeProvider.GetAllCategories());
//            }
//            else
//            {
//                AddToActionContext<ICategoryTree>(actionContext.Request, "categoryHelper", new CategoryHelper(catTreeProvider));
//            }
//            return;
//        }

//        public static void AddToActionContext<T>(HttpRequestMessage httpRequestMessage, string name, T obj = null) where T : class
//        {
//            obj = obj ?? httpRequestMessage.Resolve<T>();


//            IPropertyBag bag = null;
//            object tmp;
//            if (httpRequestMessage.Properties.TryGetValue(Mozu.Core.Actions.Contracts.ApiActionExtensionFilterContext.ItemsKey, out tmp))
//            {
//                bag = (IPropertyBag)tmp;
//            }
//            else
//            {
//                bag = new PropertyBag();
//                httpRequestMessage.Properties[Mozu.Core.Actions.Contracts.ApiActionExtensionFilterContext.ItemsKey] = bag;
//            }
//            bag[name] = obj;

//        }

//        public class CategoryHelper : ICategoryTree
//        {
//            private readonly ICategoryTreeProvider _provider;
//            Lazy<CategoryTree> _catTask;
//            public CategoryHelper(ICategoryTreeProvider provider)
//            {
//                _provider = provider;
//                _catTask = new Lazy<CategoryTree>(() => _provider.GetAllCategories());
//            }

//            public string ETag
//            {
//                get => _catTask.Value.ETag;
//                set {; }
//            }
//            public List<Category> RootCategories => _catTask.Value.RootCategories;

//            public List<Category> AllCategories
//            {
//                get => _catTask.Value.AllCategories;
//                set { }
//            }

//            public List<Category> Top => _catTask.Value.Top;

//            public List<Category> All => _catTask.Value.All;

//            //todo:cole add script support
//            //[Microsoft.ClearScript.ScriptMember("findById")]
//            public Category FindById(int? categoryId)
//            {
//                return _catTask.Value.FindById(categoryId);
//            }
//            //todo:cole add script support
//            //[Microsoft.ClearScript.ScriptMember("findByCode")]
//            public Category FindByCode(string categoryCode)
//            {
//                return _catTask.Value.FindByCode(categoryCode);
//            }
//            //todo:cole add script support
//            //[Microsoft.ClearScript.ScriptMember("findBySlug")]
//            public IList<Category> FindBySlug(string categorySlug)
//            {
//                return _catTask.Value.FindBySlug(categorySlug).ToList();
//            }
//        }
//    }
//    public class SbExecs : ApiActionExtensionFilterContext.Execs
//    {
//        HttpActionContext _actionContext;
//        public SbExecs(ApiActionExtensionFilterContext ctx, HttpActionContext actionContext) : base(ctx)
//        {
//            _actionContext = actionContext;
//        }

//        //todo:cole add script support
//        //[Microsoft.ClearScript.ScriptMember("logOut")]
//        public void logOut()
//        {
//            var apiContext = _actionContext.Request.Resolve<ISiteBuilderApiContext>();
//            var user = LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId, apiContext.SiteId.Value);
//            var authHelper = _actionContext.Request.Resolve<IAuthenticationHelper>();
//            authHelper.ClearStorefrontTokens();
//            authHelper.SaveStoreFrontAccessToken(user.ToAccessToken(), null);
//            apiContext.SetUser(user);
//        }

//        //todo:cole add script support
//        //[Microsoft.ClearScript.ScriptMember("loginUser")]
//        //public void loginUser(object config, Microsoft.ClearScript.V8.IV8ScriptItem callback)
//        //{
//        //    bool? rememberUser = null;
//        //    if (config == null || callback == null)
//        //    {
//        //        throw new InvalidOperationException("config and callback praramters required");
//        //    }
//        //    int? customerId = null;
//        //    string userName = config as string;
//        //    if (userName == null)
//        //    {
//        //        if (config is int)
//        //        {
//        //            customerId = (int?)config;
//        //        }
//        //        else
//        //        {
//        //            var jConfig = JToken.FromObject(config) as JObject;

//        //            customerId = (int?)jConfig["customerId"];
//        //            userName = (string)jConfig["userName"];
//        //            rememberUser = (bool?)jConfig["rememberUser"];
//        //        }

//        //    }

//        //    if (!customerId.HasValue && string.IsNullOrEmpty(userName))
//        //    {
//        //        throw new InvalidOperationException("missing userName or userId");
//        //    }
//        //    Task.Run(() => ProcessCustomerLogin(customerId, userName, rememberUser, callback));



//        //} 

//        //async Task ProcessCustomerLogin(int? customerid, string userName, bool? rememberUser, Microsoft.ClearScript.V8.IV8ScriptItem callback)
//        //{
//        //    var authClient = _actionContext.Request.Resolve<Mozu.Customer.Contracts.Clients.IAuthTicketWebApiClient>().CloneWithoutUserClaims();
//        //    if (!customerid.HasValue)
//        //    {
//        //        var custClient = _actionContext.Request.Resolve<Mozu.Customer.Contracts.Clients.ICustomerAccountWebApiClient>().CloneWithoutUserClaims();
//        //        var custRes = await custClient.GetAccounts(filter: $"username eq \"{userName}\"").ConfigureAwait(false);
//        //        if (custRes.HasException)
//        //        {
//        //            callback.Invoke(new object[] { custRes.ReadException() }, false);
//        //            return;
//        //        }

//        //        var customer = custRes.ReadAsSync().Items.FirstOrDefault();
//        //        if (customer == null)
//        //        {
//        //            callback.Invoke(new object[] { new Exception($"username {userName} not found") }, false);
//        //            return;
//        //        }
//        //        customerid = customer.Id;
//        //    }
//        //    var ticketRes = await authClient.CreateImpersonatedAuthTicket(customerid.Value).ConfigureAwait(false);
//        //    if (ticketRes.HasException)
//        //    {
//        //        callback.Invoke(new object[] { ticketRes.ReadException() }, false);
//        //        return;
//        //    }


//        //    var authTicket = ticketRes.ReadAsSync();
//        //    var cust = authTicket.CustomerAccount;
//        //    var profile = new UserProfile()
//        //    {
//        //        EmailAddress = cust.EmailAddress,
//        //        FirstName = cust.FirstName,
//        //        LastName = cust.LastName,
//        //        UserId = cust.UserId,
//        //        UserName = cust.UserName,
//        //    };



//        //    //todo move this into a common module to share with the storefront.
//        //    var authHelper = _actionContext.Request.Resolve<IAuthenticationHelper>();
//        //    authHelper.SaveStoreFrontAccessToken(authTicket.AccessToken, profile.ToToken());
//        //    var exp = (rememberUser == false) ? (DateTime?)null : authTicket.RefreshTokenExpiration ;
//        //    authHelper.SaveStoreFrontRefreshToken(authTicket.RefreshToken, exp);
//        //    var userClaim = LightweightUserClaims.Parse(authTicket.AccessToken);
//        //    var pageContext = _actionContext.Request.Resolve<PageContext>();
//        //    var visitPub = _actionContext.Request.Resolve<UX.Messaging.IVisitEventPublisher>();
//        //    _actionContext.Request.Resolve<ISiteBuilderApiContext>().SetUser(userClaim);
//        //    if (pageContext.Visit?.IsTracked == true)
//        //    {
//        //        pageContext.Visit.UserId = userClaim.UserId;
//        //        pageContext.Visit.IsUserTracked = true;
//        //        visitPub.PublishVisit(pageContext.Visit);
//        //    }

//        //    callback.Invoke(new object[] { null, userClaim }, false);

//        //}

//    }

//}
