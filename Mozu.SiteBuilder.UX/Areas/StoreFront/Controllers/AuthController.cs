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

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [DataViewModeEnforcementAttribute]
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

        public AuthController(IAuthenticationHelper authenticationHelper, ICustomerAccountWebApiClient customerAccountWebApiClient, IOrderWebApiClient orderWebApiClient, IAuthTicketWebApiClient authTicketWebApiClient, ICookieProvider cookieProvider, ISiteBuilderApiContext  apiContext, PageContext pageContext, VisitEventPublisher visitPublisher)
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
        }

        protected void DoLogout() 
        {
            var user = LightweightUserClaims.CreateForAnonymousShopper(_apiContext.TenantId, _apiContext.SiteId.Value);
            _authenticationHelper.ClearStorefrontTokens();
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
                    return new Uri("/", UriKind.Relative);
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
        public HttpResponseMessage LogOut(string returnUrl = null)
        {
            DoLogout();

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
                Message = string.Format("Login as {0} failed. Please try again.", authInfo.Account.EmailAddress)
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
            string email = details.email;
            string password = details.password;
            string returnUrl = details.returnUrl;

            var res = await DoLogin(email, password);

            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var redir = Request.CreateResponse(statusCode: HttpStatusCode.Redirect);
                if (string.IsNullOrEmpty(returnUrl))
                {
                    returnUrl = "/myaccount";
                }
                redir.Headers.Location = MakeRedirectUri(returnUrl);
                return redir;
                
            }
            else
            {
                string errorStr = (email != null) ? string.Format("Login as {0} failed. Please try again.", email) : "Login failed. Please specify a user.";
                return Request.CreateResponse(HttpStatusCode.OK, View("Login", new { email = email, Messages = new List<object> { new { Message = errorStr } } }));
            }
        }

        [HttpPost]
        [SslOnlyActionFilter]
        public async Task<object> AjaxLogin(LoginDetails details)
        {
            string email = details.email;
            string password = details.password;
            string returnUrl = details.returnUrl;
            var res = await DoLogin(email, password);
                    
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return new
                    {
                    Message = string.Format("Logged in as {0}.", email)
                    };
                }
            else
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized, new
                {
                    Message = string.Format("Login as {0} failed. Please try again.", email)
                });
            }
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
            var orderNumber = details.orderNumber;
            var email = details.email;
            var billingZipCode = details.billingZipCode;
            var billingPhoneNumber = details.billingPhoneNumber;

            if (string.IsNullOrEmpty(orderNumber))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, new
                {
                    Message = "orderId is required"
                });
            }

            // make sure one of the three challenges are provided
            if (string.IsNullOrEmpty(email) && string.IsNullOrEmpty(billingZipCode) && string.IsNullOrEmpty(billingPhoneNumber))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, new
                {
                    Message = "One of the following must be provided: email, billingZipCode, or billingPhoneNumber"
                });
            }

            var res = await _orderWebApiClient.CloneWithoutUserClaims().GetOrders(filter:String.Format("orderNumber eq {0}", orderNumber));
            if (res.HasException)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new
                {
                    Message = "An unknown error occured, please try again."
                });
            }

            var order = res.ReadAsSync().Items.FirstOrDefault();
            if (order == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound, new
                {
                    Message = "The order number you provided was not found. Please validate the order number and try again or contact customer service."
                });
            }

            if (!string.IsNullOrEmpty(email))
            {
                if (!order.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
                {
                    return GenerateInvalidChallengeResponse();
                }
            }

            if (!string.IsNullOrEmpty(billingPhoneNumber))
            {
                if (order.BillingInfo == null || order.BillingInfo.BillingContact == null || order.BillingInfo.BillingContact.PhoneNumbers == null)
                {
                    return GenerateInvalidChallengeResponse();
                }

                // see if any of the phone numbers under the billing contact match the provided billingphonenumber
                if (!order.BillingInfo.BillingContact.PhoneNumbers.Home.Equals(billingPhoneNumber, StringComparison.OrdinalIgnoreCase)
                    && !order.BillingInfo.BillingContact.PhoneNumbers.Work.Equals(billingPhoneNumber, StringComparison.OrdinalIgnoreCase)
                    && !order.BillingInfo.BillingContact.PhoneNumbers.Mobile.Equals(billingPhoneNumber, StringComparison.OrdinalIgnoreCase))
                {
                    return GenerateInvalidChallengeResponse();
                }
            }

            if (!string.IsNullOrEmpty(billingZipCode))
            {
                if (order.BillingInfo == null || order.BillingInfo.BillingContact == null || order.BillingInfo.BillingContact.Address == null)
                {
                    return GenerateInvalidChallengeResponse();
                }

                if (!order.BillingInfo.BillingContact.Address.PostalOrZipCode.Equals(billingZipCode, StringComparison.OrdinalIgnoreCase))
                {
                    return GenerateInvalidChallengeResponse();
                }
            }
            var userClaims = _apiContext.UserClaims;
            userClaims.Bag["orderId"] = order.Id;
            var profileToken = _authenticationHelper.GetProfileToken();
            _authenticationHelper.SaveStoreFrontAccessToken(userClaims.ToAccessToken(), profileToken, DateTime.Now.AddMinutes(20));


            return Request.CreateResponse(statusCode: HttpStatusCode.OK);
            
        }

        private HttpResponseMessage GenerateInvalidChallengeResponse()
        {
            return Request.CreateResponse(HttpStatusCode.BadRequest, new
            {
                Message = "Sorry, the information you provided did not match our records. Please check the information that you provided and try again or contact the customer service department"
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
             var accountsResp = await _customerAccountWebApiClient.CloneWithoutUserClaims().GetAccounts(filter: "UserId eq " + u);

            string userName = !accountsResp.ResponseMessage.IsSuccessStatusCode ? null : (accountsResp.ReadAsSync().Items.FirstOrDefault() ?? new CustomerAccount()).UserName;

             var model = new ResetPasswordConfirmDetails()
             {
                 username = userName,
                 validationToken = t,
             };
             return View("Reset-Password", model);
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
             var res = await DoResetPasswordConfirm(info);
             var ex = res.ReadException();
             info.done = res.ResponseMessage.IsSuccessStatusCode;
             info.messages = ex== null ? new object[0] : new object[] { new { message = ex.Message } };
             return Request.CreateResponse(HttpStatusCode.OK, View("Reset-Password", info));
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
