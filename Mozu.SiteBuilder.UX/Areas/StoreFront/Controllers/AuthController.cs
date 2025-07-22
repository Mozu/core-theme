using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Exceptions;
//using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionConstraints;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Messaging;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Middleware;
using Newtonsoft.Json.Linq;
using Sprache;
using static QRCoder.PayloadGenerator;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcement]
    [AuthModelValidator]
    public class AuthController : BaseApiController
    {
        
        private readonly ICookieProvider _cookieProvider;
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly IAuthTicketWebApiClient _authTicketWebApiClient;
        private readonly IPageContext _pageContext;
        private readonly VisitEventPublisher _visitPublisher;
        readonly ISiteContext _siteContext;
        IErrorResultConverterCollection _errorGenerator;
        readonly Lazy<ICaptchaClient> _captchaClient;
        ILogger _logger;

        public AuthController(IAuthenticationHelper authenticationHelper, ICustomerAccountWebApiClient customerAccountWebApiClient, IOrderWebApiClient orderWebApiClient, IAuthTicketWebApiClient authTicketWebApiClient, ICookieProvider cookieProvider, ISiteBuilderApiContext  apiContext, IPageContext pageContext, VisitEventPublisher visitPublisher,
            ISiteContext siteContext,
            IErrorResultConverterCollection errorGenerator,
           Lazy<ICaptchaClient> captchaClient,
           ILogger<AuthController> logger)
        {
            _authenticationHelper = authenticationHelper;
            _customerAccountWebApiClient = customerAccountWebApiClient ?? throw new ArgumentNullException(nameof(customerAccountWebApiClient));
            _orderWebApiClient = orderWebApiClient;
            _authTicketWebApiClient = authTicketWebApiClient ?? throw new ArgumentNullException(nameof(authTicketWebApiClient));
         
            _cookieProvider = cookieProvider;
            _apiContext = apiContext;
            _pageContext = pageContext;
            _visitPublisher = visitPublisher;
            _siteContext = siteContext;
            _errorGenerator = errorGenerator;
            _logger = logger;
            _captchaClient = captchaClient;
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

        // NOTE: 2FA won't affect the CreateAccount flow
        [SslOnlyActionFilter]
        async Task<(int Satus, object body)> LoginAndTrackForCreateAccount(Func<Task<ServiceClientResponse<CustomerAuthTicket>>> loginFunc)
        {
            var response = await loginFunc();
            object body = null;
            if (response.ResponseMessage.IsSuccessStatusCode)
            {
                var authTicket = response.ReadAsSync();

                var cust = authTicket.CustomerAccount;
                body = authTicket;
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
            else
            {
                body = response.ResponseMessage;
                try
                {
                    var strCnt = await response.ResponseMessage.Content.ReadAsStringAsync();
                    if (!string.IsNullOrEmpty(strCnt))
                    {
                        body = JObject.Parse(strCnt);
                    }

                }
                catch
                {
                }
            }
            return ((int)response.ResponseMessage.StatusCode, body);
        }

        [SslOnlyActionFilter]
        async Task<TryLoginResult> ReadCustomerAuthTicket(Func<Task<ServiceClientResponse<CustomerAuthTicket>>> loginFunc)
        {
            var response = await loginFunc();
            object body = null;
            var requires2FA = false;
            CustomerAuthTicket authTicket = null;
            LightweightUserClaims userClaims = null;
            if (response.ResponseMessage.IsSuccessStatusCode)
            {
                authTicket = response.ReadAsSync();

                userClaims = LightweightUserClaims.Parse(authTicket.AccessToken);

                if (userClaims.Bag.ContainsKey("requires2FA"))
                    requires2FA = string.Equals(userClaims.Bag["requires2FA"], "true", StringComparison.OrdinalIgnoreCase);

                var cust = authTicket.CustomerAccount;
                body = authTicket;
            }
            else
            {
                body = await ReadClientErrorMsg(response);
            }

            return new TryLoginResult()
            {
                Status = (int)response.ResponseMessage.StatusCode,
                Body = body,
                Requires2FA = requires2FA,
                AuthTicket = authTicket,
                UserClaims = userClaims
            };
        }

        private void ApplyLogin(CustomerAuthTicket authTicket, LightweightUserClaims userClaim, CustomerAccount cust)
        {
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

            _apiContext.SetUser(userClaim);

            // iff the visit is already tracked, update the visit with the new user id
            if (_pageContext.Visit.IsTracked)
            {
                _pageContext.Visit.UserId = userClaim.UserId;
                _pageContext.Visit.IsUserTracked = true;
                _visitPublisher.PublishVisit(_pageContext.Visit);
            }
        }

        async Task<IActionResult> DoCreateAccount(CustomerAccountAndAuthInfo accountInfo)
        {
            if (
                HasInvalidCharecters(accountInfo.Account?.FirstName, "firstName", out var ret) ||
                HasInvalidCharecters(accountInfo.Account?.LastName, "lastName", out ret) ||
                HasInvalidCharecters(accountInfo.Account?.EmailAddress, "emailAddress", out ret) ||
                HasInvalidCharecters(accountInfo.Account?.UserName, "userName", out ret) 
                )
            {
                return ret;
            }

            // ISSUE: CustomerService received the wrong userId during signup instead of the new user's ID
            // Use client without user claims to ensure the CustomerService gets anonymous context during signup
            var (status, body) = (await LoginAndTrackForCreateAccount(() => _customerAccountWebApiClient.CloneWithoutUserClaims().AddAccountAndLogin(accountInfo)));
            
            return StatusCode(status, body);
        }

        bool HasInvalidCharecters(string str, string fieldName, out IActionResult resp)
        {
            resp = null;
            str = (str ?? "").Trim();
            if (str == HttpUtility.HtmlEncode(str)) return false;
            var errorObj = _errorGenerator.ConvertExceptionToError(new VaeMissingOrInvalidParameterException(fieldName, "contains invalid characters"), true);
            resp = new BadRequestObjectResult(new ObjectContent(errorObj.GetType(), errorObj, new JsonMediaTypeFormatter()));
            return true;
        }

        public class TryLoginResult
        {
            public int Status { get; set; }
            public object Body { get; set; }
            public bool Requires2FA { get; set; }
            public CustomerAuthTicket AuthTicket { get; set; }
            public LightweightUserClaims UserClaims { get; set; }
        }

        protected async Task<TryLoginResult> TryLogin(string email, string password,string token)
        {
            //add token header for arcjs integration.
            var extraHeader = new System.Collections.Specialized.NameValueCollection {["racaptchaToken"] = token};

            ExtractDetailsFromHeaders(out string fingerprint, out string region);

            return await ReadCustomerAuthTicket(() => _authTicketWebApiClient
            .CloneWithHeaders(extraHeader)
            .CreateUserAuthTicket(new CustomerUserAuthInfo()
            {
                Username = email,
                Password = password,
                Fingerprint = fingerprint,
                Region = region
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
            if (!string.IsNullOrEmpty(returnUrl))
            {
                return Url.IsLocalUrl(returnUrl)
                    ? new Uri(returnUrl, UriKind.Relative)
                    : new Uri(
                        string.IsNullOrEmpty(this.SiteContext.SiteSubdirectory)
                            ? "/"
                            : this.SiteContext.SiteSubdirectory, UriKind.Relative);
            }

            returnUrl = Request.GetTypedHeaders().Referer?.ToString();
            return string.IsNullOrEmpty(returnUrl) ? new Uri( string.IsNullOrEmpty(this.SiteContext.SiteSubdirectory)? "/": this.SiteContext.SiteSubdirectory, UriKind.Relative) : new Uri(returnUrl, UriKind.Absolute);

        }

        [HttpGet]
        [SslOnlyActionFilter]
        [AcceptHeader("application/json", false)]
        public IActionResult LogOut(string returnUrl = null, bool saveUserId = false)
        {
            DoLogout(saveUserId);
            //var redir = this.Request.CreateResponse(statusCode: System.Net.HttpStatusCode.Redirect);

            ////redir.Headers.AddCookies(
            ////    HttpContext.Response.Cookies.AllKeys.Select(x=> HttpContext.Response.Cookies[x]).Select(x=> new CookieHeaderValue(x.Name, x.Value ){Expires =x.Expires,Secure=x.Secure }));
            var uri = MakeRedirectUri(returnUrl);
            if (uri.IsAbsoluteUri)
            {
                returnUrl = uri.GetComponents(UriComponents.PathAndQuery, UriFormat.Unescaped);
            }
            else
            {
                returnUrl = uri.ToString();
            }
            return new RedirectResult(returnUrl);
        }

        [HttpGet]
        [SslOnlyActionFilter]
        [AcceptHeader("application/json", false)]
        public IActionResult Login(string returnUrl = null)
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

        [HttpGet]
        [SslOnlyActionFilter]
        [AcceptHeader("application/json", false)]
        public IActionResult OrderStatus(string returnUrl = null)
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

        [HttpGet]
        [SslOnlyActionFilter]
        [AcceptHeader("application/json", false)]
        public IActionResult AjaxForgotPassword(string returnUrl = null)
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

        [HttpGet]
        [SslOnlyActionFilter]
        public IActionResult CreateAccount(string returnUrl = null)
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
            public string token { get;  set; }
        }

        
        [HttpPost]
        [SslOnlyActionFilter]
        [AcceptHeader("application/json", false)]
        public async Task<IActionResult> CreateAccount([FromBody]CustomerAccountAndAuthInfo authInfo)
        {
            var res =  await DoCreateAccount(authInfo);
            if (!(res is OkResult))
            {
                return  StatusCode(401, new { message = string.Format("Login as {0} failed. Please try again.", HttpUtility.HtmlEncode(authInfo.Account.EmailAddress)) }); 
            }

            return res;
        }

        [AcceptVerbs("OPTIONS", "POST")]
        [SslOnlyActionFilter]
        [AcceptHeader("application/json")]
        public async Task<IActionResult> AjaxCreateAccount([FromBody]CustomerAccountAndAuthInfo authInfo)
         {
            if (Request.Method == HttpMethod.Options.Method)
            {
                return Ok();
            }

            return await DoCreateAccount(authInfo);
        }

        Task<CaptchResponse> ValidateToken( string token)
        {
            var captchaEnabled = _siteContext.ThemeSettings.Get<bool>("recaptchaEnabled", false);
            var secret = _siteContext.ThemeSettings.Get<string>("__recaptchaSecrete", null);
            if (!captchaEnabled || secret == null)
            {
                return Task.FromResult(new CaptchResponse { NoOp = true });
            } 
            return _captchaClient.Value.Validate(token, secret, _apiContext.RequestCancellationToken);
        }

        public interface ICaptchaClient
        {
            Task<CaptchResponse> Validate(string token, string secret, CancellationToken cancellationToken);
        }

        public class CaptchaClient: ICaptchaClient
        {
            readonly ISettings _settings;
            readonly ILogger _logger;
            public CaptchaClient(
                ISettings settings,
                ILogger<CaptchaClient> logger)
            {
                _settings = settings;
                _logger = logger;
            }

            static readonly Lazy<HttpMessageHandler> _clientHandler = new Lazy<HttpMessageHandler>(() =>
            {
                var handler = new HttpClientHandler
                {
                    UseCookies = false,
                    AutomaticDecompression = DecompressionMethods.Deflate | DecompressionMethods.GZip
                };
                //handler.UnsafeAuthenticatedConnectionSharing = true;
                return (HttpMessageHandler)handler;
            }, LazyThreadSafetyMode.ExecutionAndPublication);


            const string DefaultRecaptchaEndpoint = "https://www.google.com/recaptcha/api/siteverify";

            HttpClient GetClient()
            {
                return new HttpClient(_clientHandler.Value, false);
            }
            public async Task<CaptchResponse> Validate(string token , string secret, CancellationToken cancellationToken)
            {
                if (string.IsNullOrEmpty(token))
                {
                    return new CaptchResponse()
                    {
                        errorCodes = new List<string>() { "token-missing" }
                    };
                }
                var captchaUrl = _settings.AppSettings("recaptcha_endpoint");
                captchaUrl = string.IsNullOrEmpty(captchaUrl) ? DefaultRecaptchaEndpoint : captchaUrl;
                var client = GetClient();
                var res = await client.GetAsync($"{captchaUrl}?secret={secret}&response={token}", cancellationToken).ConfigureAwait(false);
                if (res.IsSuccessStatusCode)
                {
                    try
                    {
                        return await res.Content.ReadAsAsync<CaptchResponse>().ConfigureAwait(false);
                    }
                    catch (Exception ex)
                    {
                        _logger.Error("error deserilizing captcha response", ex);
                        return new CaptchResponse()
                        {
                            errorCodes = new List<string>() { "connection-error" }
                        };
                    }
                }
                return new CaptchResponse()
                {
                    errorCodes = new List<string>() { "connection-error" }
                };
            }
         
        }
        public class CaptchResponse
        {
            public bool? NoOp { get; set; }
            public bool? success { get; set; }
            public DateTime challenge_ts { get; set; }
            public string hostname { get; set; }
            [Newtonsoft.Json.JsonProperty("error-codes")]
            [System.Text.Json.Serialization.JsonPropertyName("error-codes")]
            public List<string> errorCodes { get; set; }
            public string GetErrorCode()
            {
                if (errorCodes == null || errorCodes.Count ==0)
                {
                    return null;
                }
                return $"Recaptcha-{errorCodes.First()}";
            }
           
            public decimal? score { get; set; }
   
        }

        #region Login APIs

        [HttpPost]
        [SslOnlyActionFilter]
        [AcceptHeader("application/json")]
        public async Task<IActionResult> AjaxLogin([FromBody] LoginDetails details)
        {
            if (string.IsNullOrWhiteSpace(details?.email))
            {
                return AjaxLoginFailure();
            }
            var email = details.email;
            var password = details.password;
            var token = details.token;

            var tokenRes = await ValidateToken(token);

            if (!tokenRes.NoOp.GetValueOrDefault(false) &&
                !tokenRes.success.GetValueOrDefault(false))
            {
                return AjaxLoginFailure(email, tokenRes.GetErrorCode());
            }

            var res = await TryLogin(email, password, token);

            if (res.Status < 300)
            {
                ApplyLogin(res.AuthTicket, res.UserClaims, res.AuthTicket.CustomerAccount);

                if (res.Requires2FA)
                {
                    FourHundredHandlerFilterAttribute.BypassErrorHandler(HttpContext);
                    return StatusCode(401, new { message = "Two Factor Authentication is required.", res.Requires2FA });
                }

                return new OkObjectResult($"Logged in as {HttpUtility.HtmlEncode(email)}.");
            }


            var errorCode = default(string);
            if (res.Body is JObject)
            {
                try
                {
                    var ex = ((JObject)res.Body).ToObject<ApiWebClientException>();
                    errorCode = ex.ErrorCode;
                }
                catch
                {
                }
            }

            return AjaxLoginFailure(email, errorCode);
        }

        [HttpPost]
        [SslOnlyActionFilter]
        [AcceptHeader("application/json", false)]
        public async Task<IActionResult> Login([FromBody]LoginDetails details)
        {
            if (string.IsNullOrWhiteSpace(details?.email))
            {
                return LoginFailed();
            }
            var email = details.email;
            var password = details.password;
            var returnUrl = details.returnUrl;
            var token = details.token;

            var tokenRes = await ValidateToken(token);

            if (!tokenRes.NoOp.GetValueOrDefault(false) &&
                !tokenRes.success.GetValueOrDefault(false))
            {
                return LoginFailed(email, tokenRes.GetErrorCode());
            }

            var res = await TryLogin(email, password, token);

            if (res.Status < 200 || res.Status > 300)
                return LoginFailed(email);

            ApplyLogin(res.AuthTicket, res.UserClaims, res.AuthTicket.CustomerAccount);

            if (res.Requires2FA)
            {
                FourHundredHandlerFilterAttribute.BypassErrorHandler(HttpContext);
                return StatusCode(401, new { message = "Two Factor Authentication is required.", res.Requires2FA });
            }

            returnUrl = RedirectToCustomerAccount(returnUrl);

            return new RedirectResult(this.MakeRedirectUri(returnUrl).ToString());
        }

        #endregion


        #region 2FA APIs

        [HttpPost]
        [SslOnlyActionFilter]
        public async Task<IActionResult> Validate2FAAndCreateAuthTicket([FromBody] AuthTicket2FAInfoUI authTicket2FAInfo)
        {
            if (authTicket2FAInfo == null || string.IsNullOrEmpty(authTicket2FAInfo.OtpCode))
            {
                return StatusCode(400, new { message = "Invalid parameters supplied." });
            }
            
            var response = await _authTicketWebApiClient.Validate2FAAndCreateAuthTicket(
            new AuthTicket2FAInfo()
            {
                UserId = _apiContext.GetUserId(),
                OtpCode = authTicket2FAInfo.OtpCode
            });

            return HandleValidateResponse(authTicket2FAInfo.returnUrl, response);
        }

        [HttpGet]
        [SslOnlyActionFilter]
        public async Task<IActionResult> GenerateAndSend2FAOtp()
        {
            if (PageContext?.User != null && this.PageContext.User.IsAuthenticated)
            {
                return new RedirectResult(string.IsNullOrEmpty(this.SiteContext.SiteSubdirectory) ? "/" : this.SiteContext.SiteSubdirectory);
            }

            var response = await _authTicketWebApiClient.GenerateAndSend2faOtp();

            if (!response.ResponseMessage.IsSuccessStatusCode)
            {
                return StatusCode((int)response.ResponseMessage.StatusCode, ReadClientErrorMsg(response));
            }

            return Ok(new { message = "2FA OTP sent successfully." });
        }

        #endregion


        #region OTP APIs

        [HttpPost]
        [SslOnlyActionFilter]
        public async Task<IActionResult> ValidateOtpAndCreateAuthTicket([FromBody] AuthTicketOtpInfoUI authTicketOtpInfo)
        {
            if (authTicketOtpInfo == null || string.IsNullOrEmpty(authTicketOtpInfo.OtpCode))
            {
                return StatusCode(400, new { message = "Invalid parameters supplied." });
            }

            ExtractDetailsFromHeaders(out string fingerprint, out string region);

            var response = await _authTicketWebApiClient.CloneWithoutUserClaims().ValidateOtpAndCreateAuthTicket(
            new AuthTicketOtpInfo()
            {
                Email = authTicketOtpInfo.Email,
                OtpCode = authTicketOtpInfo.OtpCode,
                Region = region,
                Fingerprint = fingerprint
            });

            return HandleValidateResponse(authTicketOtpInfo.returnUrl, response);
        }
        
        [HttpPost]
        [SslOnlyActionFilter]
        public async Task<IActionResult> GenerateAndSendOtp([FromBody]OtpRequest request)
        {
            if (PageContext?.User != null && this.PageContext.User.IsAuthenticated)
            {
                return new RedirectResult(string.IsNullOrEmpty(this.SiteContext.SiteSubdirectory) ? "/" : this.SiteContext.SiteSubdirectory);
            }

            if (request == null || string.IsNullOrEmpty(request.Email))
            {
                return StatusCode(400, new { message = "Invalid parameters supplied." });
            }

            var response = await _authTicketWebApiClient.CloneWithoutUserClaims().GenerateAndSendOtp(request);    

            if (!response.ResponseMessage.IsSuccessStatusCode)
            {
                return StatusCode((int)response.ResponseMessage.StatusCode, ReadClientErrorMsg(response));
            }

            return Ok(new { message = "2FA OTP sent successfully." });
        }

        #endregion


        #region 2FA And OTP Helper Methods and Models

        private static async Task<object> ReadClientErrorMsg<T>(ServiceClientResponse<T> response)
        {
            object body = response.ResponseMessage;
            try
            {
                var strCnt = await response.ResponseMessage.Content.ReadAsStringAsync();
                if (!string.IsNullOrEmpty(strCnt))
                {
                    body = JObject.Parse(strCnt);
                }

            }
            catch
            {
            }

            return body;
        }

        private string RedirectToCustomerAccount(string returnUrl)
        {
            if (string.IsNullOrEmpty(returnUrl))
            {
                returnUrl = SiteContext.SiteSubdirectory + "/myaccount";
            }

            return returnUrl;
        }

        private IActionResult HandleValidateResponse(string incomingUrl, ServiceClientResponse<CustomerAuthTicket> response)
        {
            if (!response.ResponseMessage.IsSuccessStatusCode)
            {
                return StatusCode((int)response.ResponseMessage.StatusCode, ReadClientErrorMsg(response));
            }

            var authTicket = response.ReadAsSync();

            var userClaim = LightweightUserClaims.Parse(authTicket.AccessToken);

            var requires2FA = false;
            if (userClaim.Bag.ContainsKey("requires2FA"))
                requires2FA = string.Equals(userClaim.Bag["requires2FA"], "true", StringComparison.OrdinalIgnoreCase);

            if (requires2FA)
            {
                return StatusCode(401, new { message = "Two Factor Authentication is required.", requires2FA });
            }

            ApplyLogin(authTicket, userClaim, authTicket.CustomerAccount);

            var returnUrl = RedirectToCustomerAccount(incomingUrl);

            //return new RedirectResult(this.MakeRedirectUri(returnUrl).ToString());
            return new OkObjectResult($"Logged in.");//Following AjaxLogin pattern
        }

        private void ExtractDetailsFromHeaders(out string fingerprint, out string region)
        {
            var headers = this.Request.Headers;
            fingerprint = null;
            region = null;

            if (headers.ContainsKey("cf-region"))
            {
                region = headers["cf-region"];
            }

            if (headers.ContainsKey("true-client-ip"))
            {
                fingerprint = headers["true-client-ip"];
            }
        }

        public class AuthTicket2FAInfoUI : AuthTicket2FAInfo
        {
            public string returnUrl { get; set; }
            public string token { get; set; }
        }

        public class AuthTicketOtpInfoUI : AuthTicketOtpInfo
        {
            public string returnUrl { get; set; }
            public string token { get; set; }
        }

        #endregion

        string GetLabel(string id, string defaultValue)
        {
            return _siteContext.Labels.TryGetValue(id, out var val) ? val : defaultValue;
        }

        private ActionResult LoginFailed(string email = null, string code = null)
        {
            var errorMsg = GetLoginFailureMessage(email, code);
            FourHundredHandlerFilterAttribute.BypassErrorHandler(HttpContext);
            return StatusCode(401, new { message = errorMsg }); 
            //Request.CreateResponse(HttpStatusCode.Unauthorized,
            //    View("Login", new { email, Messages = new List<object> { new { Message = errorMsg  , ErrorCode = code } } }));
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

            if (errorCode?.StartsWith("Recaptcha-") != true)
                return (email != null)
                    ? string.Format(GetLabel(
                        "loginFailedErrorWithEmail",
                        "Login as {0} failed. Please try again."
                    ), HttpUtility.HtmlEncode(email))
                    : GetLabel(
                        "loginFailedError",
                        "Login failed. Please specify a user."
                    );
            errorCode = errorCode.Substring("Recaptcha-".Length);
            return GetLabel(
                $"recaptcha-error-msg-{errorCode}",
                GetLabel("recaptcha-error-msg-generic", "Erorr With Captcha Validation"));

        }

        private ActionResult AjaxLoginFailure(string email=null, string errorCode = null)
        {
            var errorMsg = GetLoginFailureMessage(email, errorCode);
            
            return  StatusCode((int)HttpStatusCode.Unauthorized, new { message = errorMsg });
        }

        public class OrderDetails
        {
            public string orderNumber { get; set; }
            public string email { get; set; }
            public string billingZipCode { get; set; }
            public string billingPhoneNumber { get; set; }
        }

        [HttpPost]
        [SslOnlyActionFilter]
        [AcceptHeader("application/json")]
        public async Task<IActionResult> AnonymousOrderLogin([FromBody]OrderDetails details)
        {
            var orderNumber = details?.orderNumber;
            var email = details?.email;
            var billingZipCode = details?.billingZipCode;
            var billingPhoneNumber = details?.billingPhoneNumber;

            if (string.IsNullOrEmpty(orderNumber))
            {
                return new BadRequestObjectResult("Order Number is required.");
            }

            // make sure one of the three challenges are provided
            if (string.IsNullOrEmpty(email) && string.IsNullOrEmpty(billingZipCode) && string.IsNullOrEmpty(billingPhoneNumber))
            {
                return new BadRequestObjectResult("Verification field required.");
            }

            // The form field is intended to possibly match to two order fields: orderNumber or
            //  externalId. This causes an issue in CommerceRuntime when the form sends something
            //  that isn't a number (IE, 999000999-406). This fails the filter's number conversion
            //  for order's orderNumber field and caused the GetOrder call to return with an
            //  exception. Basic validation needed to happen here so we didn't have number parse
            //  exceptions in CommerceRuntime when the bad filter was being built.

            var idFilter = "";
            idFilter = int.TryParse(orderNumber, out var orderNumberInt)
                ? $"orderNumber eq {orderNumberInt} or externalId eq {orderNumberInt} or parentCheckoutNumber eq {orderNumberInt}"
                : $"externalId eq {orderNumber}";

            var res = await _orderWebApiClient.CloneWithoutUserClaims().GetOrders(filter: idFilter);
            if (res.HasException)
            {
                return new ObjectResult(new
                {
                    statusCode = (int) HttpStatusCode.InternalServerError,
                    message = "An unknown error occured, please try again."
                }) {StatusCode = (int) HttpStatusCode.InternalServerError};
            }

            var orders = res.ReadAsSync().Items;
            if (orders == null || !Enumerable.Any(orders))
            {
                return new NotFoundObjectResult("anonOrderNumberMissing");
            }

            if (!string.IsNullOrEmpty(email))
            {
                if (!orders.Any(order => order.Email?.Equals(email, StringComparison.OrdinalIgnoreCase) ?? false))
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
                userClaims.Bag["orderIds"] = string.Join(",", orders.Select(order => order.Id).ToArray());
            }

            var profileToken = _authenticationHelper.GetProfileToken();
            _authenticationHelper.SaveStoreFrontAccessToken(userClaims.ToAccessToken(), profileToken, DateTime.Now.AddMinutes(20));

            return new OkResult();
        }

        private IActionResult GenerateInvalidChallengeResponse()
        {
            return BadRequest(new
            {
                Message = "anonAuthError",
                ErrorMessage = "No matching records found for the provided information."
            });
        }

        [HttpPost, HttpOptions]
        [SslOnlyActionFilter]
        [AcceptHeader("application/json")]
        public async Task<IActionResult> AjaxResetPassword([FromBody]ResetPasswordInfo info)
        {
            if (Request.Method.ToUpper() == "OPTIONS")
                return new OkResult();

            var res = await DoResetPassword(info);

            if (res.ResponseMessage.IsSuccessStatusCode)
                return new OkResult();

            var err = _errorGenerator.ConvertExceptionToError(res.ReadException(), false);

            return new ObjectResult(err) { StatusCode = (int)HttpStatusCode.InternalServerError };
        }

        [HttpGet]
        [SslOnlyActionFilter]
        public async Task<IActionResult> ResetPassword(string t, string u)
        {
            if (PageContext?.User != null && this.PageContext.User.IsAuthenticated)
            {
                return new RedirectResult(string.IsNullOrEmpty(this.SiteContext.SiteSubdirectory) ? "/" : this.SiteContext.SiteSubdirectory);
            }

            var accountsResp = await _customerAccountWebApiClient.CloneWithoutUserClaims().GetAccounts(filter: "UserId eq " + u);

            var userName = !accountsResp.ResponseMessage.IsSuccessStatusCode ? null : (accountsResp.ReadAsSync().Items.FirstOrDefault() ?? new CustomerAccount()).UserName;

            var model = new ResetPasswordConfirmDetails()
            {
                username = userName,
                validationToken = t,
            };

            var template = Enumerable.FirstOrDefault(this.SiteContext.Theme.PageTypes.Where(x => x.Id == "Reset_Password").Select(x => x.Template), "Reset-Password");


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
        public async Task<IActionResult> ResetPassword([FromBody]ResetPasswordConfirmDetails info)
        {
            if (PageContext?.User != null && this.PageContext.User.IsAuthenticated)
            {
                return new RedirectResult(MakeRedirectUri().ToString());
            }

            var template = Enumerable.FirstOrDefault(this.SiteContext.Theme.PageTypes.Where(x => x.Id == "Reset_Password").Select(x => x.Template), "Reset-Password");

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
                return View("Reset-Password", info);
            }

            var res = await DoResetPasswordConfirm(info);
            var ex = res.ReadException();
            info.done = res.ResponseMessage.IsSuccessStatusCode;
            info.messages = ex== null ? new object[0] : new object[] { new { message = ex.Message } };
            return View("Reset-Password", info);
        }
    }

    public class AuthModelValidator : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            if ( actionContext.HttpContext.Request.Method != HttpMethod.Post.Method)
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

                var authTicket2FAInfo = arg as AuthController.AuthTicket2FAInfoUI;
                if (authTicket2FAInfo != null)
                {
                    ValidateField(authTicket2FAInfo, x => x.OtpCode);
                    return;
                }

                var authTicketOtpInfo = arg as AuthController.AuthTicketOtpInfoUI;
                if (authTicketOtpInfo != null)
                {
                    ValidateField(authTicketOtpInfo, x => x.OtpCode);
                    ValidateField(authTicketOtpInfo, x => x.Email);
                    return;
                }

                var otpRequest = arg as OtpRequest;
                if (otpRequest != null)
                {
                    ValidateField(otpRequest, x => x.Email);
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

            
            var val = exp.Compile()(parent);

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

        public PantsController(IAuthenticationHelper authenticationHelper, ICookieProvider cookieProvider)
        {
            _authenticationHelper = authenticationHelper;
            _cookieProvider = cookieProvider;
        }

        [HttpPost]
        public  IActionResult Pants()
        {
            Mvc.Auth.LoginCookieHelper.SetAdminUserCookie(this.HttpContext, _cookieProvider, this.SbApiContext, _authenticationHelper, "/", true);
            return Redirect("/");
        }
    }

}
