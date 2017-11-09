using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Extensions;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Messaging;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.CommerceRuntime.Contracts.Clients;
using System.Web;
using System.Threading;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Linq.Expressions;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [DataViewModeEnforcement]
    [AuthModelValidator]
    public class AuthController : BaseApiController
    {
        
        private readonly ICookieProvider _cookieProvider;
        private readonly ISiteBuilderApiContext _apiContext;
        private IAuthenticationHelper _authenticationHelper;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly IAuthTicketWebApiClient _authTicketWebApiClient;
        private PageContext _pageContext;
        private VisitEventPublisher _visitPublisher;
        ISiteContext _siteContext;

        public AuthController(IAuthenticationHelper authenticationHelper, ICustomerAccountWebApiClient customerAccountWebApiClient, IOrderWebApiClient orderWebApiClient, IAuthTicketWebApiClient authTicketWebApiClient, ICookieProvider cookieProvider, ISiteBuilderApiContext  apiContext, PageContext pageContext, VisitEventPublisher visitPublisher,
            ISiteContext siteContext)
        {
            if (customerAccountWebApiClient == null) throw new ArgumentNullException("customerAccountWebApiClient");
            if (authTicketWebApiClient == null) throw new ArgumentNullException("authTicketWebApiClient");
            _authenticationHelper = authenticationHelper;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _orderWebApiClient = orderWebApiClient;
            _authTicketWebApiClient = authTicketWebApiClient;
         
            _cookieProvider = cookieProvider;
            _apiContext = apiContext;
            _pageContext = pageContext;
            _visitPublisher = visitPublisher;
            _siteContext = siteContext;
        }
       
        protected void DoLogout(bool? saveUserId = false) 
        {
            var user = LightweightUserClaims.CreateForAnonymousShopper(_apiContext.TenantId, _apiContext.SiteId.Value);
            if (saveUserId.HasValue && saveUserId.Value)
            {
                user.Bag["PreviousRegisteredUserId"] = _apiContext.GetUserId();
            }

            _authenticationHelper.ClearStorefrontTokens();
            _authenticationHelper.SaveStoreFrontAccessToken(user.ToAccessToken(), null);
            _apiContext.SetUser(user);
        }

        [SslOnlyActionFilter]
        async Task<ServiceClientResponse<CustomerAuthTicket>> LoginAndTrack(Func<Task<ServiceClientResponse<CustomerAuthTicket>>> loginFunc)
        {
            var response = await loginFunc();
            if (response.ResponseMessage.IsSuccessStatusCode)
            {
                var authTicket = response.ReadAsSync();
                var cust = authTicket.CustomerAccount;
                var profile = new UserProfile()
                {
                    EmailAddress = cust.EmailAddress,
                    FirstName = cust.FirstName,
                    LastName = cust.LastName,
                    UserId = cust.UserId,
                    UserName = cust.UserName,
                };

                _authenticationHelper.SaveStoreFrontAccessToken(authTicket.AccessToken, profile.ToToken());
                _authenticationHelper.SaveStoreFrontRefreshToken(authTicket.RefreshToken, authTicket.RefreshTokenExpiration);
                var userClaim = LightweightUserClaims.Parse(authTicket.AccessToken);
                _apiContext.SetUser(userClaim);

                // iff the visit is already tracked, update the visit with the new user id
                if (_pageContext.Visit.IsTracked)
                {
                    _pageContext.Visit.UserId = userClaim.UserId;
                    _pageContext.Visit.IsUserTracked = true;
                    _visitPublisher.PublishVisit(_pageContext.Visit);
                }
            }

            return response;
        }

        async Task<ServiceClientResponse<CustomerAuthTicket>> DoCreateAccount(CustomerAccountAndAuthInfo accountInfo )
        {
            return await LoginAndTrack(() => _customerAccountWebApiClient.AddAccountAndLogin(accountInfo));
        }

        protected async Task<ServiceClientResponse<CustomerAuthTicket>> DoLogin(string email, string password)
        {
            return await LoginAndTrack(() => _authTicketWebApiClient.CreateUserAuthTicket(new CustomerUserAuthInfo()
            {
                Username = email,
                Password = password
            }));
        }
            
        protected async Task<ServiceClientResponse<StreamContent>> DoResetPassword(ResetPasswordInfo info)
        {
            var res = (await _customerAccountWebApiClient.ResetPassword(info));

            return res;
        }

        protected async Task<ServiceClientResponse<StreamContent>> DoResetPasswordConfirm(ResetPasswordConfirmDetails info)
        {
            var res = (await _customerAccountWebApiClient.UpdateForgottenPassword(new ConfirmationInfo()
            {
                UserName = info.username,
                NewPassword = info.password,
                ConfirmationCode = info.validationToken,
            }));

            return res;
        }

        private Uri MakeRedirectUri(string returnUrl = null)
        {
            if (string.IsNullOrEmpty(returnUrl))
            {
                returnUrl = Request.Headers.Referrer.ToString();
                if (string.IsNullOrEmpty(returnUrl))
                {
                    return new Uri( string.IsNullOrEmpty(this.SiteContext.SiteSubdirectory)? "/": this.SiteContext.SiteSubdirectory, UriKind.Relative);
                }
                else
                {
                    return new Uri(returnUrl, UriKind.Absolute);
                }
            }
            else
            {
                return new Uri(returnUrl, UriKind.Relative);
            }
        }

        [HttpGet]
        [SslOnlyActionFilter]
        public HttpResponseMessage LogOut(string returnUrl = null, bool saveUserId = false)
        {
            DoLogout(saveUserId);

            var redir = this.Request.CreateResponse(statusCode: System.Net.HttpStatusCode.Redirect);
           
            //redir.Headers.AddCookies(
            //    HttpContext.Response.Cookies.AllKeys.Select(x=> HttpContext.Response.Cookies[x]).Select(x=> new CookieHeaderValue(x.Name, x.Value ){Expires =x.Expires,Secure=x.Secure }));
            
            redir.Headers.Location = MakeRedirectUri(returnUrl);
            return redir;

        }

        [HttpGet]
        [SslOnlyActionFilter]
        public ActionResult Login(string returnUrl = null)
        {
            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "login",
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }
            };

            return View("Login", new { ReturnUrl = returnUrl });
        }

        [System.Web.Http.HttpGet]
        [SslOnlyActionFilter]
        public ActionResult OrderStatus(string returnUrl = null)
        {
            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "order-status",
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }
            };

            return View("Order-Status", new { ReturnUrl = returnUrl });
        }

        [System.Web.Http.HttpGet]
        [SslOnlyActionFilter]
        public ActionResult AjaxForgotPassword(string returnUrl = null)
        {
            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "forgot-password",
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }
            };

            return View("Forgot-Password", new { ReturnUrl = returnUrl });
        }

        [System.Web.Http.HttpGet]
        [SslOnlyActionFilter]
        public ActionResult CreateAccount(string returnUrl = null)
        {
            var pc = this.PageContext;
            pc.CmsContext= new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "signup",
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }
            };

            return View("Signup", new { ReturnUrl = returnUrl });
        }

        public class LoginDetails
        {
            public string email { get; set; }
            public string password { get; set; }
            public string returnUrl { get; set; }
        }

        [HttpPost]
        [SslOnlyActionFilter]
        public async Task<HttpResponseMessage> CreateAccount(CustomerAccountAndAuthInfo authInfo)
         {
             var res = await DoCreateAccount(authInfo);
             if (res.ResponseMessage.IsSuccessStatusCode)
             {
                 return res.ResponseMessage;
             }
            return Request.CreateResponse(HttpStatusCode.Unauthorized, new
             {
                Message = string.Format("Login as {0} failed. Please try again.", HttpUtility.HtmlEncode(authInfo.Account.EmailAddress))
            });
        }

        [AcceptVerbs("OPTIONS", "POST")]
        [SslOnlyActionFilter]
        public async Task<HttpResponseMessage> AjaxCreateAccount(CustomerAccountAndAuthInfo authInfo)
         {
            if (Request.Method.Method == "OPTIONS")
             {
                return Request.CreateResponse(HttpStatusCode.OK);
             }
            var res = await DoCreateAccount(authInfo);

             return res.ResponseMessage;
         }

        [System.Web.Http.HttpPost]
        [SslOnlyActionFilter]
        public async Task<HttpResponseMessage> Login(LoginDetails details)
        {
            if (string.IsNullOrWhiteSpace(details?.email))
            {
                return LoginFailed();
            }
            string email = details.email;
            string password = details.password;
            string returnUrl = details.returnUrl;

            var res = await DoLogin(email, password);

            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var redir = Request.CreateResponse(statusCode: HttpStatusCode.Redirect);
                if (string.IsNullOrEmpty(returnUrl))
                {
                    returnUrl = this.SiteContext.SiteSubdirectory + "/myaccount";
                }
                redir.Headers.Location = MakeRedirectUri(returnUrl);
                return redir;
            }
            return LoginFailed(email);
        }

        string GetLabel(string id, string defaultValue)
        {
            string val = null;
            if (_siteContext.Labels.TryGetValue(id, out val))
            {
                return val;
            }
            return defaultValue;
        }



        private HttpResponseMessage LoginFailed(string email = null)
        {
            var errorMsg = GetLoginFailureMessage(email);
            return Request.CreateResponse(HttpStatusCode.Unauthorized,
                View("Login", new { email, Messages = new List<object> { new { Message = errorMsg } } }));
        }

        private string GetLoginFailureMessage(string email, string errorCode = null)
        {
            if (errorCode == "USER_LOCKED")
            {
                return GetLabel(
                    "userLockedError",
                    "The User account is locked for security purposes. To unlock the user account please secure it by resetting your password now."
                );
            }
            return (email != null)
                ? string.Format(GetLabel(
                    "loginFailedErrorWithEmail",
                    "Login as {0} failed. Please try again."
                ), HttpUtility.HtmlEncode(email))
                : GetLabel(
                    "loginFailedError",
                    "Login failed. Please specify a user."
                );
        }

        [HttpPost]
        [SslOnlyActionFilter]
        public async Task<object> AjaxLogin(LoginDetails details)
        {
            if (string.IsNullOrWhiteSpace(details?.email))
            {
                return AjaxLoginFailure();
            }
            string email = details.email;
            string password = details.password;
            var res = await DoLogin(email, password);

            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return new
                {
                    Message = $"Logged in as {HttpUtility.HtmlEncode(email)}."
                };
            }
            var errorCode = default(string);
            var ex = res.ReadException() as Mozu.Core.Api.Client.Exceptions.ApiWebClientException;
            if ( ex != null)
            {
                errorCode = ex.ErrorCode;
            }
            
            return AjaxLoginFailure(email, errorCode);
        }

        private object AjaxLoginFailure(string email=null, string errorCode = null)
        {

            var errorMsg = GetLoginFailureMessage(email, errorCode);
            return Request.CreateResponse(HttpStatusCode.Unauthorized, new
            {
                Message = errorMsg
            });
        }

        public class OrderDetails
        {
            public string orderNumber { get; set; }
            public string email { get; set; }
            public string billingZipCode { get; set; }
            public string billingPhoneNumber { get; set; }
        }

        [System.Web.Http.HttpPost]
        [SslOnlyActionFilter]
        public async Task<HttpResponseMessage> AnonymousOrderLogin(OrderDetails details)
        {
            var orderNumber = details?.orderNumber;
            var email = details?.email;
            var billingZipCode = details?.billingZipCode;
            var billingPhoneNumber = details?.billingPhoneNumber;

            if (string.IsNullOrEmpty(orderNumber))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, new
                {
                    Message = "Order Number is required."
                });
            }

            // make sure one of the three challenges are provided
            if (string.IsNullOrEmpty(email) && string.IsNullOrEmpty(billingZipCode) && string.IsNullOrEmpty(billingPhoneNumber))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, new
                {
                    Message = "Verification field required."
                });
            }

            // The form field is intended to possibly match to two order fields: orderNumber or
            //  externalId. This causes an issue in CommerceRuntime when the form sends something
            //  that isn't a number (IE, 999000999-406). This fails the filter's number conversion
            //  for order's orderNumber field and caused the GetOrder call to return with an
            //  exception. Basic validation needed to happen here so we didn't have number parse
            //  exceptions in CommerceRuntime when the bad filter was being built.

            int orderNumberInt; // This is required for TryParse below. We don't care about it.
            var idFilter = "";
            idFilter = Int32.TryParse(orderNumber, out orderNumberInt)
                ? String.Format("orderNumber eq {0} or externalId eq {0} or parentCheckoutNumber eq {0}", orderNumberInt)
                : String.Format("externalId eq {0}", orderNumber);

            var res = await _orderWebApiClient.CloneWithoutUserClaims().GetOrders(filter: idFilter);
            if (res.HasException)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new
                {
                    Message = "An unknown error occured, please try again."
                });
            }

            var orders = res.ReadAsSync().Items;
            if (orders == null || (orders != null && !orders.Any()))
            {
                return Request.CreateResponse(HttpStatusCode.NotFound, new
                {
                    Message = "anonOrderNumberMissing"
                });
            }

            if (!string.IsNullOrEmpty(email))
            {
                if (!orders.Any(order => order.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
                {
                    return GenerateInvalidChallengeResponse();
                }
            }

            if (!string.IsNullOrEmpty(billingPhoneNumber))
            {
                // see if any of the phone numbers under the billing contact match the provided billingphonenumber
                if (!orders.Any(order => (order.BillingInfo?.BillingContact?.PhoneNumbers?.Home?.Equals(billingPhoneNumber, StringComparison.OrdinalIgnoreCase) ?? false)
                    || (order.BillingInfo?.BillingContact?.PhoneNumbers?.Work?.Equals(billingPhoneNumber, StringComparison.OrdinalIgnoreCase) ?? false)
                    || (order.BillingInfo?.BillingContact?.PhoneNumbers?.Mobile?.Equals(billingPhoneNumber, StringComparison.OrdinalIgnoreCase) ?? false)
                    ))
                {
                    return GenerateInvalidChallengeResponse();
                }
            }

            if (!string.IsNullOrEmpty(billingZipCode))
            {

                if (!orders.Any(order => (order.BillingInfo?.BillingContact?.Address?.PostalOrZipCode.Equals(billingZipCode, StringComparison.OrdinalIgnoreCase)) ?? false))
                {
                    return GenerateInvalidChallengeResponse();
                }
            }

            //Combine orderid To include parentCheckoutNumber
            var userClaims = _apiContext.UserClaims;
 
            var orderId = orders.FirstOrDefault(o => o.OrderNumber == orderNumberInt)?.Id ?? orders.FirstOrDefault().ParentCheckoutId;
            userClaims.Bag["orderId"] = orderId;

            if (orders.Any(order => order.ParentCheckoutNumber == orderNumberInt))
            {
                userClaims.Bag["orderIds"] = String.Join(",", orders.Select(order => order.Id).ToArray());
            }

            var profileToken = _authenticationHelper.GetProfileToken();
            _authenticationHelper.SaveStoreFrontAccessToken(userClaims.ToAccessToken(), profileToken, DateTime.Now.AddMinutes(20));

            return Request.CreateResponse(statusCode: HttpStatusCode.OK);
            
        }

        private HttpResponseMessage GenerateInvalidChallengeResponse()
        {
            return Request.CreateResponse(HttpStatusCode.BadRequest, new
            {
                Message = "anonAuthError"
            });
        }

        [HttpPost, HttpOptions]
        [SslOnlyActionFilter]
        public async Task<HttpResponseMessage> AjaxResetPassword(ResetPasswordInfo info)
         {
            if (Request.Method.Method == "OPTIONS")
             {
                return Request.CreateResponse(HttpStatusCode.OK);
             }
             var res = await DoResetPassword(info);

             return res.ResponseMessage;
         }

        [HttpGet]
        [SslOnlyActionFilter]
        public async Task<ActionResult> ResetPassword(string t, string u)
        {
            if (this.PageContext != null && this.PageContext.User != null && this.PageContext.User.IsAuthenticated)
            {
                return new RedirectResult(string.IsNullOrEmpty(this.SiteContext.SiteSubdirectory) ? "/" : this.SiteContext.SiteSubdirectory);
            }

            var accountsResp = await _customerAccountWebApiClient.CloneWithoutUserClaims().GetAccounts(filter: "UserId eq " + u);

            string userName = !accountsResp.ResponseMessage.IsSuccessStatusCode ? null : (accountsResp.ReadAsSync().Items.FirstOrDefault() ?? new CustomerAccount()).UserName;

            var model = new ResetPasswordConfirmDetails()
            {
                username = userName,
                validationToken = t,
            };

            var template = this.SiteContext.Theme.PageTypes.Where(x => x.Id == "Reset_Password").Select(x => x.Template).FirstOrDefault("Reset-Password");


            PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = template,
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }

            };


            return View(template, model);
        }

         public class ResetPasswordConfirmDetails
         {
             public bool done { get; set; }
             public string username { get; set; }
             public string validationToken { get; set; }
             public string password { get; set; }
             public string passwordConfirm { get; set; }
             public object[] messages { get; set; }
         }

        [HttpPost]
        [SslOnlyActionFilter]
        public async Task<HttpResponseMessage> ResetPassword(ResetPasswordConfirmDetails info)
        {
            if (this.PageContext != null && this.PageContext.User != null && this.PageContext.User.IsAuthenticated)
            {
                var redir = this.Request.CreateResponse(statusCode: System.Net.HttpStatusCode.Redirect);

                redir.Headers.Location = MakeRedirectUri();
                return redir;
            }

            var template = this.SiteContext.Theme.PageTypes.Where(x => x.Id == "Reset_Password").Select(x => x.Template).FirstOrDefault("Reset-Password");

            PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = template,
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }
            };

            // compare the password and passwordConfirm, if they don't match, throw an error!
            if (!info.password.Equals(info.passwordConfirm))
            {
                // Throw an error!
                info.done = false;
                info.messages = new object[] { new {message = "Passwords must match."}};
                return Request.CreateResponse(HttpStatusCode.OK, View("Reset-Password", info));
            }

            var res = await DoResetPasswordConfirm(info);
            var ex = res.ReadException();
            info.done = res.ResponseMessage.IsSuccessStatusCode;
            info.messages = ex== null ? new object[0] : new object[] { new { message = ex.Message } };
            return Request.CreateResponse(HttpStatusCode.OK, View("Reset-Password", info));
        }
    }


    public class AuthModelValidator : ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if ( actionContext.Request.Method != HttpMethod.Post)
            {
                return;
            }
            foreach ( var arg in actionContext.ActionArguments.Values)
            {
                if ( arg == null)
                {
                    continue;
                }
               
                var customerAccountAndAuthInfo = arg as CustomerAccountAndAuthInfo;
                if ( customerAccountAndAuthInfo != null)
                {
                    
                    ValidateField(customerAccountAndAuthInfo?.Account, x => x.EmailAddress);
                    ValidateField(customerAccountAndAuthInfo?.Account, x => x.UserName);
                    return;
                }

                var resetPasswordInfo = arg as ResetPasswordInfo;
                if (resetPasswordInfo != null)
                {
                    ValidateField(resetPasswordInfo, x => x.EmailAddress);
                    return;
                }

                var loginDetails = arg as AuthController.LoginDetails;
                if (loginDetails != null)
                {
                    ValidateField(loginDetails, x => x.email);
                    return;
                }

                var resetPasswordConfirmDetails = arg as AuthController.ResetPasswordConfirmDetails;
                if (resetPasswordConfirmDetails != null)
                {
                    ValidateField(resetPasswordConfirmDetails, x => x.username);
                    return;
                }
                var orderDetails = arg as AuthController.OrderDetails;
                if (orderDetails != null)
                {
                    ValidateField(orderDetails, x => x.email);
                    ValidateField(orderDetails, x => x.orderNumber);
                    ValidateField(orderDetails, x => x.billingZipCode);
                    ValidateField(orderDetails, x => x.billingPhoneNumber);
                    return;
                }
#if DEBUG
                throw new Exception("missing validation routine for type " + arg.GetType().FullName);
#endif
            }
        }
        void ValidateField<T> (T parent , Expression<Func<T,string>> exp )
        {
            if (parent == null)
            {
                return;
            }
            var val = exp.Invoke(parent);

            if (val != null && val != HttpUtility.HtmlEncode(val))
            {
                var name = ((MemberExpression)exp.Body).Member.Name;
                throw new Mozu.Core.Exceptions.VaeValidationConflictException(name, "invalid input for field " + name);
            }
        }
    }
    public class PantsController : BaseApiController
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ICookieProvider _cookieProvider;

        public PantsController(IAuthenticationHelper authenticationHelper,  ICookieProvider cookieProvider)
        {
            _authenticationHelper = authenticationHelper;
            _cookieProvider = cookieProvider;
        }

        [HttpPost]
        public async Task<HttpResponseMessage> Pants(HttpRequestMessage request)
        {
            return await Mvc.Auth.LoginCookieHelper.SetAdminUserCookie(request, _cookieProvider, this.SbApiContext, _authenticationHelper, "/", true);
        }
    }

}
