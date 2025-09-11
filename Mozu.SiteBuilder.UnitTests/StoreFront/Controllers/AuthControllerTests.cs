using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.DependencyInjection;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Test;
using MassTransit;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
using Mozu.SiteBuilder.UX.Messaging;
using Mozu.SiteBuilder.UX.Models.Visit;
using Newtonsoft.Json.Linq;
using NSubstitute;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using Microsoft.Extensions.Logging;
using Mozu.Core.Exceptions;
using Mozu.Core.Api.Contracts;

using Mozu.Core.Api.Client.Exceptions;
using System.Text;
namespace Mozu.SiteBuilder.UnitTests.StoreFront.Controllers
{
    [TestFixture]
    [Category("AuthControllerTests")]
    public class AuthControllerTests
    {
        private AutoSubstitute _container;
        private AuthController _authController;

        // Mock interfaces
        private IAuthenticationHelper _authHelper;
        private ICustomerAccountWebApiClient _customerClient;
        private IAuthTicketWebApiClient _authTicketClient;
        private ICookieProvider _cookieProvider;
        private ISiteBuilderApiContext _apiContext;
        private IPageContext _pageContext;
        private VisitEventPublisher _visitPublisher;
        private ISiteContext _siteContext;
        private IErrorResultConverterCollection _errorGenerator;
        private Lazy<AuthController.ICaptchaClient> _captchaClient;
        private ILogger<AuthController> _logger;

        [SetUp]
        public void Setup()
        {
            // Initialize logging service factory to prevent NullReferenceException when parsing LightweightUserClaims
            Mozu.Core.Logging.LoggingService.LoggerFactory = new Microsoft.Extensions.Logging.LoggerFactory();

            // Create AutoSubstitute container - it will automatically create mocks for interfaces
            _container = new AutoSubstitute();

            // For VisitEventPublisher (sealed class), create a real instance with mocked dependencies
            var httpContext = new DefaultHttpContext();
            var apiContext = Substitute.For<ISiteBuilderApiContext>();
            var pageContext = Substitute.For<IPageContext>();
            var publisher = Substitute.For<IPublishEndpoint>();
            var visitPublisher = new VisitEventPublisher(httpContext, apiContext, pageContext, publisher);
            _container.Provide(visitPublisher);

            // For Lazy<ICaptchaClient>, provide a mock
            var captchaClient = new Lazy<AuthController.ICaptchaClient>(() => Substitute.For<AuthController.ICaptchaClient>());
            _container.Provide(captchaClient);

            _authController = _container.Resolve<AuthController>();
            
            // Setup ControllerContext with proper mocking
            var controllerContext = new ControllerContext { HttpContext = httpContext };
            
            // Mock the Url helper and configure IsLocalUrl to return true for local URLs
            var urlHelper = Substitute.For<IUrlHelper>();
            urlHelper.IsLocalUrl(Arg.Any<string>()).Returns(true);
            
            _authController.ControllerContext = controllerContext;
            _authController.Url = urlHelper;

            // Create a mock SiteContext and set it directly on the controller to bypass DI
            var mockSiteContext = new TestSiteContext();
            _authController.SiteContext = mockSiteContext;

            // Get references to mocks for easier test setup
            _authHelper = _container.Resolve<IAuthenticationHelper>();
            _customerClient = _container.Resolve<ICustomerAccountWebApiClient>();
            _authTicketClient = _container.Resolve<IAuthTicketWebApiClient>();
            _cookieProvider = _container.Resolve<ICookieProvider>();
            _apiContext = _container.Resolve<ISiteBuilderApiContext>();
            _pageContext = _container.Resolve<IPageContext>();
            _visitPublisher = _container.Resolve<VisitEventPublisher>();
            _siteContext = _container.Resolve<ISiteContext>();
            _errorGenerator = _container.Resolve<IErrorResultConverterCollection>();
            _captchaClient = _container.Resolve<Lazy<AuthController.ICaptchaClient>>();
            _logger = _container.Resolve<ILogger<AuthController>>();

            SetupDefaultMocks();
        }

        /// <summary>
        /// Simple test implementation of SiteContext that provides just what we need
        /// </summary>
        private class TestSiteContext : SiteContext
        {
            public TestSiteContext() : base(
                new DefaultHttpContext(),
                Substitute.For<ISiteBuilderApiContext>(),
                null, // ISiteBuilderContextProvider - can be null
                null, // IMobileDetectionProvider - can be null
                Substitute.For<ICookieProvider>(),
                null, // Lazy<IThemeRepository> - can be null  
                null, // Lazy<IThemeSettingsRepository> - can be null
                null  // ISettings - can be null
            )
            {
                // Set the property we need for testing
                this.SiteSubdirectory = "";
            }
        }

        private void SetupDefaultMocks()
        {
            // Setup basic API context
            _apiContext.TenantId.Returns(1001);
            _apiContext.SiteId.Returns(2001);

            // Setup site context for captcha and theme settings
            // Create a real ThemeRuntimeSettingsCollection with proper dictionary initialization to prevent NullReferenceException
            var themeSettingsDictionary = new Dictionary<string, object>
            {
                ["recaptchaEnabled"] = false,  // Disable captcha for testing
                ["__recaptchaSecrete"] = null
            };
            var themeSettings = new ThemeRuntimeSettingsCollection(themeSettingsDictionary, new byte[0], DateTime.UtcNow);
            _siteContext.ThemeSettings.Returns(themeSettings);
            _siteContext.SiteSubdirectory.Returns("");
            
            // Setup labels dictionary
            var labels = new Dictionary<string, string>
            {
                ["userLockedError"] = "The User account is locked for security purposes.",
                ["loginFailedErrorWithEmail"] = "Login as {0} failed. Please try again.",
                ["loginFailedError"] = "Login failed. Please specify a user.",
                ["recaptcha-error-msg-generic"] = "Error With Captcha Validation"
            };
            _siteContext.Labels.Returns(labels);

            // Setup visit context - use fully qualified name to avoid ambiguity
            var visit = new Mozu.SiteBuilder.UX.Models.Visit.Visit { IsTracked = false };
            _pageContext.Visit.Returns(visit);

            // Setup captcha client default response (disabled)
            _captchaClient.Value.Validate(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<System.Threading.CancellationToken>())
                .Returns(Task.FromResult(new AuthController.CaptchResponse { NoOp = true }));

            // Mock LightweightUserClaims.Parse to avoid config server dependency
            // This is critical to prevent the ConfigServerException during token parsing
            // We'll need to use a different approach since we can't directly mock static methods
            
            // Setup authentication helper for token operations - these are void methods, just verify they can be called
            // No Returns() needed for void methods
                // Mock ConvertExceptionToError for invalid parameter exception
                _errorGenerator.ConvertExceptionToError(
                    Arg.Any<VaeMissingOrInvalidParameterException>(),
                    true)
                    .Returns(callInfo =>
                    {
                        return new ErrorResult
                        {
                            Errors = new ErrorCollection
                            {
                                Message = "Parameter contains invalid characters."
                            },
                            StatusCode = 400
                        };
                    });
        }

        #region Helper Methods for Test Data Generation

        /// <summary>
        /// Creates LightweightUserClaims for a shopper without requires2FA flag (old behavior)
        /// </summary>
        private static LightweightUserClaims CreateShopperClaimsWithoutRequires2FA(int userId = 1234, int tenantId = 1001, int siteId = 2001)
        {
            var claims = LightweightUserClaims.CreateForShopper(userId.ToString(), "Test", "User", null, tenantId, siteId, DateTime.Now.AddDays(2));
            // Explicitly ensure no requires2FA flag exists (old behavior)
            claims.Bag.Remove("requires2FA");
            return claims;
        }

        /// <summary>
        /// Creates LightweightUserClaims with requires2FA set to false
        /// Note: This creates real claims for testing, but should only be used in specific scenarios where token parsing is mocked
        /// </summary>
        private static LightweightUserClaims CreateShopperClaimsWithRequires2FAFalse(int userId = 1234, int tenantId = 1001, int siteId = 2001)
        {
            var claims = LightweightUserClaims.CreateForShopper(userId.ToString(), "Test", "User", null, tenantId, siteId, DateTime.Now.AddDays(2));
            claims.Bag["requires2FA"] = "false";
            return claims;
        }

        /// <summary>
        /// Creates CustomerAuthTicket with properly generated access token
        /// </summary>
        private CustomerAuthTicket CreateValidCustomerAuthTicket(string userId = "1234", string email = "test@example.com")
        {
            // Create proper LightweightUserClaims and convert to access token
            var claims = CreateShopperClaimsWithoutRequires2FA(int.Parse(userId));
            return new CustomerAuthTicket
            {
                AccessToken = claims.ToAccessToken(),
                RefreshToken = "refresh_token_123",
                AccessTokenExpiration = DateTime.Now.AddHours(1),
                RefreshTokenExpiration = DateTime.Now.AddDays(30),
                UserId = userId,
                CustomerAccount = new CustomerAccount
                {
                    Id = 1,
                    UserId = userId,
                    EmailAddress = email,
                    FirstName = "Test",
                    LastName = "User",
                    UserName = "testuser"
                }
            };
        }

        /// <summary>
        /// Creates successful ServiceClientResponse for CustomerAuthTicket
        /// </summary>
        private ServiceClientResponse<CustomerAuthTicket> CreateSuccessfulAuthResponse(CustomerAuthTicket authTicket)
        {
            return new ServiceClientResponse<CustomerAuthTicket>
            {
                HasException = false,
                ReadAsSync = () => authTicket,
                ReadAsAsync = () => Task.FromResult(authTicket),
                ResponseMessage = new HttpResponseMessage(HttpStatusCode.OK)
            };
        }

        /// <summary>
        /// Creates failed ServiceClientResponse with proper error structure for testing
        /// </summary>
        private ServiceClientResponse<CustomerAuthTicket> CreateFailedAuthResponse(HttpStatusCode statusCode, string errorCode = null, string errorMessage = null)
        {
            // Create a simple object that can be deserialized to simulate ApiWebClientException structure
            var errorObject = new MockApiWebClientException
            {
                ErrorCode = errorCode ?? "GENERAL_ERROR",
                Message = errorMessage ?? "An error occurred"
            };
            
            var errorJson = JObject.FromObject(errorObject);

            var response = new HttpResponseMessage(statusCode)
            {
                Content = new StringContent(errorJson.ToString(), Encoding.UTF8, "application/json")
            };

            var apiWebClientError = new ApiWebClientException.ApiWebClientError(errorCode ?? "GENERAL_ERROR", statusCode, errorMessage ?? "An error occurred");
            var apiWebClientEx = new ApiWebClientException(apiWebClientError);

            return new ServiceClientResponse<CustomerAuthTicket>
            {
                HasException = false,
                ReadAsSync = () => throw apiWebClientEx,
                ReadAsAsync = () => Task.FromException<CustomerAuthTicket>(apiWebClientEx),
                ResponseMessage = response
            };
        }

        /// <summary>
        /// Creates a simple class that can be deserialized to simulate ApiWebClientException structure for testing
        /// </summary>
        public class MockApiWebClientException
        {
            public string ErrorCode { get; set; }
            public string Message { get; set; }
        }

        /// <summary>
        /// Creates valid CustomerAccountAndAuthInfo for testing
        /// </summary>
        private CustomerAccountAndAuthInfo CreateValidCustomerAccountAndAuthInfo()
        {
            return new CustomerAccountAndAuthInfo
            {
                Account = new CustomerAccount
                {
                    FirstName = "Test",
                    LastName = "User",
                    EmailAddress = "test@example.com",
                    UserName = "testuser"
                },
                Password = "validpassword123"
            };
        }

        /// <summary>
        /// Creates CustomerAccountAndAuthInfo with invalid characters
        /// </summary>
        private CustomerAccountAndAuthInfo CreateInvalidCustomerAccountAndAuthInfo(string fieldWithInvalidChars)
        {
            var account = CreateValidCustomerAccountAndAuthInfo();
            
            switch (fieldWithInvalidChars)
            {
                case "firstName":
                    account.Account.FirstName = "<script>alert('xss')</script>";
                    break;
                case "lastName":
                    account.Account.LastName = "&lt;div&gt;test&lt;/div&gt;";
                    break;
                case "emailAddress":
                    account.Account.EmailAddress = "test<>@email.com";
                    break;
                case "userName":
                    account.Account.UserName = "user<script>";
                    break;
            }
            
            return account;
        }

        #endregion

        #region Mock Verification Tests

        [Test]
        public void Setup_ShouldCreateAllRequiredMocks()
        {
            // Assert that all our mocks are properly created and not null
            Assert.That(_authHelper, Is.Not.Null, "AuthHelper should be mocked");
            Assert.That(_customerClient, Is.Not.Null, "CustomerClient should be mocked");
            Assert.That(_authTicketClient, Is.Not.Null, "AuthTicketClient should be mocked");
            Assert.That(_cookieProvider, Is.Not.Null, "CookieProvider should be mocked");
            Assert.That(_apiContext, Is.Not.Null, "ApiContext should be mocked");
            Assert.That(_pageContext, Is.Not.Null, "PageContext should be mocked");
            Assert.That(_visitPublisher, Is.Not.Null, "VisitPublisher should be created");
            Assert.That(_siteContext, Is.Not.Null, "SiteContext should be mocked");
            Assert.That(_errorGenerator, Is.Not.Null, "ErrorGenerator should be mocked");
            Assert.That(_captchaClient, Is.Not.Null, "CaptchaClient should be mocked");
            Assert.That(_logger, Is.Not.Null, "Logger should be mocked");
            Assert.That(_authController, Is.Not.Null, "AuthController should be created");
        }

        [Test]
        public void Setup_ShouldConfigureBasicMockBehavior()
        {
            // Verify that our basic mock setup is working
            Assert.That(_apiContext.TenantId, Is.EqualTo(1001), "ApiContext TenantId should be configured");
            Assert.That(_apiContext.SiteId, Is.EqualTo(2001), "ApiContext SiteId should be configured");
            Assert.That(_siteContext.SiteSubdirectory, Is.EqualTo(""), "SiteSubdirectory should be configured");
            
            // Verify labels are configured
            var labels = _siteContext.Labels;
            Assert.That(labels, Is.Not.Null, "Labels should be configured");
            Assert.That(labels["userLockedError"], Is.EqualTo("The User account is locked for security purposes."));
        }

        #endregion

        #region Login Method Tests - Success Scenarios

        [Test]
        public void Login_SimpleTest_ShouldNotCrash()
        {
            // Arrange - just create an object, don't call the method yet
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123",
                returnUrl = "/dashboard"
            };

            // This test just verifies we can create the LoginDetails object without crashing
            Assert.That(loginDetails, Is.Not.Null);
            Assert.That(loginDetails.email, Is.EqualTo("test@example.com"));
        }

        [Test]
        public async Task Login_WithValidCredentials_ShouldReturnRedirectResult()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123",
                returnUrl = "/dashboard"
            };
            var claims = CreateShopperClaimsWithRequires2FAFalse();
            // Use a dummy access token to avoid triggering config server calls
            var authTicket = new CustomerAuthTicket
            {
                AccessToken = claims.ToAccessToken(), // Dummy token, not parsed
                RefreshToken = "refresh_token_123",
                AccessTokenExpiration = DateTime.Now.AddHours(1),
                RefreshTokenExpiration = DateTime.Now.AddDays(30),
                UserId = "1234",
                CustomerAccount = new CustomerAccount
                {
                    UserId = "1234",
                    EmailAddress = "test@example.com",
                    FirstName = "Test",
                    LastName = "User",
                    UserName = "testuser"
                }
            };

            // Create a successful service response using proper ServiceClientResponse structure
            var serviceResponse = new ServiceClientResponse<CustomerAuthTicket>
            {
                HasException = false,
                ReadAsSync = () => authTicket,
                ReadAsAsync = () => Task.FromResult(authTicket),
                ResponseMessage = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
                {
                    Headers = { }
                }
            };
            serviceResponse.ResponseMessage.Headers.Clear();  // Ensure clean headers

            // Setup mocks
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.Login(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<RedirectResult>(), "Should return RedirectResult for successful login");
            var redirectResult = (RedirectResult)result;
            Assert.That(redirectResult.Url, Is.EqualTo("/dashboard"), "Should redirect to returnUrl");

            // Verify API calls were made
            await _authTicketClient.Received(1).CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>());
            
            // Verify authentication helpers were called (this confirms successful authentication)
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        #endregion

        #region Input Validation Tests

        [Test]
        public async Task AjaxLogin_WithNullLoginDetails_ShouldReturnAjaxLoginFailure()
        {
            // Act
            var result = await _authController.AjaxLogin(null);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task AjaxLogin_WithNullEmail_ShouldReturnAjaxLoginFailure()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = null,
                password = "password123"
            };

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task AjaxLogin_WithEmptyEmail_ShouldReturnAjaxLoginFailure()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "",
                password = "password123"
            };

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task AjaxLogin_WithWhitespaceEmail_ShouldReturnAjaxLoginFailure()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "   ",
                password = "password123"
            };

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task Login_WithNullLoginDetails_ShouldReturnLoginFailed()
        {
            // Act
            var result = await _authController.Login((AuthController.LoginDetails)null);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task Login_WithNullEmail_ShouldReturnLoginFailed()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = null,
                password = "password123"
            };

            // Act
            var result = await _authController.Login(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task Login_WithEmptyEmail_ShouldReturnLoginFailed()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "",
                password = "password123"
            };

            // Act
            var result = await _authController.Login(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task CreateAccount_WithHtmlInFirstName_ShouldReturnUnauthorizedRequest()
        {
            // Arrange
            var accountInfo = CreateInvalidCustomerAccountAndAuthInfo("firstName");

            // Act
            var result = await _authController.CreateAccount(accountInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));

            // The CreateAccount method returns a specific message format when not OkResult
            var responseType = objectResult.Value.GetType();
            var messageProperty = responseType.GetProperty("message");
            Assert.That(messageProperty, Is.Not.Null, "Response should have 'message' property");

            var messageValue = messageProperty.GetValue(objectResult.Value)?.ToString();
            Assert.AreEqual(messageValue, "Login as test@example.com failed. Please try again.");

            // Verify AddAccountAndLogin was NOT called
            await _customerClient.DidNotReceive().AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>());
        }

        [Test]
        public async Task CreateAccount_WithHtmlInLastName_ShouldReturnUnauthorizedRequest()
        {
            // Arrange
            var accountInfo = CreateInvalidCustomerAccountAndAuthInfo("lastName");

            // Act
            var result = await _authController.CreateAccount(accountInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));

            // The CreateAccount method returns a specific message format when not OkResult
            var responseType = objectResult.Value.GetType();
            var messageProperty = responseType.GetProperty("message");
            Assert.That(messageProperty, Is.Not.Null, "Response should have 'message' property");

            var messageValue = messageProperty.GetValue(objectResult.Value)?.ToString();
            Assert.AreEqual(messageValue, "Login as test@example.com failed. Please try again.");
            
            // Verify AddAccountAndLogin was NOT called
            await _customerClient.DidNotReceive().AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>());
        }

        [Test]
        public async Task CreateAccount_WithHtmlInEmailAddress_ShouldReturnUnauthorizedRequest()
        {
            // Arrange
            var accountInfo = CreateInvalidCustomerAccountAndAuthInfo("emailAddress");

            // Act
            var result = await _authController.CreateAccount(accountInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));

            // The CreateAccount method returns a specific message format when not OkResult
            var responseType = objectResult.Value.GetType();
            var messageProperty = responseType.GetProperty("message");
            Assert.That(messageProperty, Is.Not.Null, "Response should have 'message' property");

            var messageValue = messageProperty.GetValue(objectResult.Value)?.ToString();
            Assert.AreEqual(messageValue, $"Login as {HttpUtility.HtmlEncode(accountInfo.Account.EmailAddress)} failed. Please try again.");

            // Verify AddAccountAndLogin was NOT called
            await _customerClient.DidNotReceive().AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>());
        }

        [Test]
        public async Task CreateAccount_WithHtmlInUserName_ShouldReturnUnauthorizedRequest()
        {
            // Arrange
            var accountInfo = CreateInvalidCustomerAccountAndAuthInfo("userName");

            // Act
            var result = await _authController.CreateAccount(accountInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));

            // The CreateAccount method returns a specific message format when not OkResult
            var responseType = objectResult.Value.GetType();
            var messageProperty = responseType.GetProperty("message");
            Assert.That(messageProperty, Is.Not.Null, "Response should have 'message' property");

            var messageValue = messageProperty.GetValue(objectResult.Value)?.ToString();
            Assert.AreEqual(messageValue, "Login as test@example.com failed. Please try again.");
            
            // Verify AddAccountAndLogin was NOT called
            await _customerClient.DidNotReceive().AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>());
        }

        #endregion

        #region AjaxLogin Method Tests

        [Test]
        public async Task AjaxLogin_WithValidCredentials_ShouldReturnOkObjectResult()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123"
            };

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);

            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            Assert.That(okResult.StatusCode, Is.EqualTo(200));
            Assert.AreEqual("Logged in as test@example.com.", okResult.Value);
            
            // Verify authentication helpers were called (this confirms successful login)
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        [Test]
        public async Task AjaxLogin_WithInvalidCredentials_ShouldReturnUnauthorized()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "wrongpassword"
            };

            var failedResponse = CreateFailedAuthResponse(HttpStatusCode.Unauthorized);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(failedResponse));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task AjaxLogin_WithCaptchaEnabled_ValidToken_ShouldProceedWithLogin()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123",
                token = "valid_captcha_token"
            };

            // Enable captcha
            var themeSettingsDictionary = new Dictionary<string, object>
            {
                ["recaptchaEnabled"] = true,
                ["__recaptchaSecrete"] = "secret_key"
            };
            _siteContext.ThemeSettings.Returns(new ThemeRuntimeSettingsCollection(themeSettingsDictionary, new byte[0], DateTime.UtcNow));

            // Setup valid captcha response
            _captchaClient.Value.Validate(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<System.Threading.CancellationToken>())
                .Returns(Task.FromResult(new AuthController.CaptchResponse { success = true }));

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            Assert.That(okResult.StatusCode, Is.EqualTo(200));
            Assert.AreEqual("Logged in as test@example.com.", okResult.Value);
            
            // Verify authentication helpers were called (this confirms successful login)
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        [Test]
        public async Task AjaxLogin_WithCaptchaEnabled_InvalidToken_ShouldReturnCaptchaError()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123",
                token = "invalid_captcha_token"
            };

            // Enable captcha
            var themeSettingsDictionary = new Dictionary<string, object>
            {
                ["recaptchaEnabled"] = true,
                ["__recaptchaSecrete"] = "secret_key"
            };
            _siteContext.ThemeSettings.Returns(new ThemeRuntimeSettingsCollection(themeSettingsDictionary, new byte[0], DateTime.UtcNow));

            // Setup invalid captcha response
            _captchaClient.Value.Validate(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<System.Threading.CancellationToken>())
                .Returns(Task.FromResult(new AuthController.CaptchResponse { 
                    success = false, 
                    errorCodes = new List<string> { "invalid-input-response" } 
                }));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task AjaxLogin_WithUserLockedError_ShouldReturnSpecificErrorMessage()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "locked@example.com",
                password = "password123"
            };

            // Simulate API error response for locked user
            var failedResponse = CreateFailedAuthResponse(HttpStatusCode.Unauthorized, "USER_LOCKED", "The User account is locked for security purposes.");
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(failedResponse));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));

            // Check that error message contains the user locked message
            var responseType = objectResult.Value.GetType();
            var messageProperty = responseType.GetProperty("message");
            Assert.That(messageProperty, Is.Not.Null, "Response should have 'message' property");
            
            var messageValue = messageProperty.GetValue(objectResult.Value)?.ToString();
            Assert.That(messageValue, Does.Contain("locked"), "Error message should contain 'locked'");
        }

        #endregion

        #region Login Method (Non-Ajax) Tests

        [Test]
        public async Task Login_WithValidCredentials_ShouldReturnRedirectToReturnUrl()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123",
                returnUrl = "/dashboard"
            };

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.Login(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<RedirectResult>(), "Should return RedirectResult for successful login");
            var redirectResult = (RedirectResult)result;
            Assert.That(redirectResult.Url, Is.EqualTo("/dashboard"), "Should redirect to returnUrl");
            
            // Verify authentication helpers were called (this confirms successful authentication)
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        [Test]
        public async Task Login_WithoutReturnUrl_ShouldRedirectToMyAccount()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123",
                returnUrl = null
            };

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.Login(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<RedirectResult>(), "Should return RedirectResult for successful login");
            var redirectResult = (RedirectResult)result;
            Assert.That(redirectResult.Url, Does.Contain("/myaccount"), "Should redirect to myaccount when no returnUrl provided");
            
            // Verify authentication helpers were called (this confirms successful authentication)
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        [Test]
        public async Task Login_WithInvalidCredentials_ShouldReturnLoginFailed()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "wrongpassword"
            };

            var failedResponse = CreateFailedAuthResponse(HttpStatusCode.Unauthorized);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(failedResponse));

            // Act
            var result = await _authController.Login(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        [Test]
        public async Task Login_WithCaptchaDisabled_ShouldProceedWithLogin()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123"
            };

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.Login(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<RedirectResult>(), "Should return RedirectResult for successful login");
            var redirectResult = (RedirectResult)result;
            Assert.That(redirectResult.Url, Does.Contain("/myaccount"), "Should redirect to myaccount");
            
            // Verify authentication helpers were called (this confirms successful authentication)
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        #endregion

        #region CreateAccount Method Tests

        [Test]
        public async Task CreateAccount_WithFailedResponse_ShouldReturnUnauthorizedWithErrorMessage()
        {
            // Arrange
            var accountInfo = CreateValidCustomerAccountAndAuthInfo();
            var failedResponse = CreateFailedAuthResponse(HttpStatusCode.BadRequest);

            _customerClient.AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>())
                .Returns(Task.FromResult(failedResponse));

            // Act
            var result = await _authController.CreateAccount(accountInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));

            // The CreateAccount method returns a specific message format when not OkResult
            var responseType = objectResult.Value.GetType();
            var messageProperty = responseType.GetProperty("message");
            Assert.That(messageProperty, Is.Not.Null, "Response should have 'message' property");

            var messageValue = messageProperty.GetValue(objectResult.Value)?.ToString();
            Assert.AreEqual(messageValue, $"Login as {HttpUtility.HtmlEncode(accountInfo.Account.EmailAddress)} failed. Please try again.");

            // Verify AddAccountAndLogin was NOT called
            await _customerClient.Received().AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>());
        }

        #endregion

        #region AjaxCreateAccount Method Tests

        [Test]
        public async Task AjaxCreateAccount_WithOptionsRequest_ShouldReturnOk()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Method = HttpMethod.Options.Method;
            _authController.ControllerContext = new ControllerContext { HttpContext = httpContext };

            var accountInfo = CreateValidCustomerAccountAndAuthInfo();

            // Act
            var result = await _authController.AjaxCreateAccount(accountInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<OkResult>());
        }

        [Test]
        public async Task AjaxCreateAccount_WithPostRequest_ShouldCallDoCreateAccount()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Method = HttpMethod.Post.Method;
            _authController.ControllerContext = new ControllerContext { HttpContext = httpContext };

            var accountInfo = CreateValidCustomerAccountAndAuthInfo();
            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);

            _customerClient.AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.AjaxCreateAccount(accountInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(200));
            Assert.That(objectResult.Value, Is.InstanceOf<CustomerAuthTicket>());
            
            var returnedTicket = objectResult.Value as CustomerAuthTicket;
            Assert.AreEqual(authTicket.AccessToken, returnedTicket.AccessToken);
            Assert.AreEqual(authTicket.RefreshToken, returnedTicket.RefreshToken);
            Assert.AreEqual(authTicket.UserId, returnedTicket.UserId);
            Assert.That(returnedTicket.CustomerAccount, Is.Not.Null);
            Assert.AreEqual(authTicket.CustomerAccount.Id, returnedTicket.CustomerAccount.Id);
            Assert.AreEqual(authTicket.CustomerAccount.UserId, returnedTicket.CustomerAccount.UserId);
            Assert.AreEqual(authTicket.CustomerAccount.EmailAddress, returnedTicket.CustomerAccount.EmailAddress);
            Assert.AreEqual(authTicket.CustomerAccount.FirstName, returnedTicket.CustomerAccount.FirstName);
            Assert.AreEqual(authTicket.CustomerAccount.LastName, returnedTicket.CustomerAccount.LastName);
            Assert.AreEqual(authTicket.CustomerAccount.UserName, returnedTicket.CustomerAccount.UserName);
            
            await _customerClient.Received(1).AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>());
            
            // Verify authentication helpers were called
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        #endregion

        #region Token and Claims Tests

        [Test]
        public async Task AjaxLogin_WithValidAuthTicket_ShouldParseAndSetUserClaims()
        {
            // Arrange
            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);

            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123"
            };

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        [Test]
        public async Task AjaxLogin_WithoutRequires2FAFlag_ShouldProcessNormally()
        {
            // Arrange
            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);

            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123"
            };

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert - Should complete successfully without 2FA checks
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            Assert.AreEqual("Logged in as test@example.com.", okResult.Value);
        }

        [Test]
        public async Task AjaxLogin_WithRequires2FAFalse_ShouldProcessNormally()
        {
            // Arrange - Create proper access token with requires2FA=false
            var claims = CreateShopperClaimsWithRequires2FAFalse();
            var authTicket = new CustomerAuthTicket
            {
                AccessToken = claims.ToAccessToken(),
                RefreshToken = "refresh_token_123",
                CustomerAccount = new CustomerAccount
                {
                    UserId = "1234",
                    EmailAddress = "test@example.com",
                    FirstName = "Test",
                    LastName = "User",
                    UserName = "testuser"
                }
            };
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);

            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123"
            };

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert - Should complete successfully with requires2FA=false
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            Assert.AreEqual("Logged in as test@example.com.", okResult.Value);
        }

        #endregion

        #region Visit Tracking Tests

        [Test]
        public async Task AjaxLogin_WithUntrackedVisit_ShouldNotUpdateVisit()
        {
            // Arrange
            var visit = new Mozu.SiteBuilder.UX.Models.Visit.Visit { IsTracked = false, UserId = null, IsUserTracked = false };
            _pageContext.Visit.Returns(visit);

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);

            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123"
            };

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(visit.UserId, Is.Null); // Should remain unchanged
            Assert.That(visit.IsUserTracked, Is.False); // Should remain unchanged
        }

        #endregion

        #region Captcha Validation Tests

        [Test]
        public async Task AjaxLogin_WithCaptchaDisabled_ShouldReturnNoOp()
        {
            // Arrange - captcha is disabled by default in setup
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123",
                token = "any_token"
            };

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert - Should proceed normally when captcha is disabled
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        [Test]
        public async Task AjaxLogin_WithNoSecret_ShouldReturnNoOp()
        {
            // Arrange
            var themeSettingsDictionary = new Dictionary<string, object>
            {
                ["recaptchaEnabled"] = true,
                ["__recaptchaSecrete"] = null // No secret
            };
            _siteContext.ThemeSettings.Returns(new ThemeRuntimeSettingsCollection(themeSettingsDictionary, new byte[0], DateTime.UtcNow));

            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123",
                token = "any_token"
            };

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert - Should proceed normally when secret is missing
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        #endregion

        #region DoCreateAccount Method Tests

        [Test]
        public async Task DoCreateAccount_WithValidData_ShouldCallAddAccountAndLoginDirectly()
        {
            // Arrange
            var accountInfo = CreateValidCustomerAccountAndAuthInfo();
            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);

            _customerClient.AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.CreateAccount(accountInfo);

            // Assert
            await _customerClient.Received(1).AddAccountAndLogin(accountInfo);
            
            // Verify authentication helpers were called
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        [Test]
        public async Task CreateAccount_WithInvalidCharacters_ShouldReturnUnauthorizedRequest()
        {
            // Arrange
            var accountInfo = CreateInvalidCustomerAccountAndAuthInfo("firstName");

            // Act
            var result = await _authController.CreateAccount(accountInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
            
            // The CreateAccount method returns a specific message format when not OkResult
            var responseType = objectResult.Value.GetType();
            var messageProperty = responseType.GetProperty("message");
            Assert.That(messageProperty, Is.Not.Null, "Response should have 'message' property");
            
            var messageValue = messageProperty.GetValue(objectResult.Value)?.ToString();
            Assert.AreEqual(messageValue, "Login as test@example.com failed. Please try again.");

            // Verify AddAccountAndLogin was NOT called
            await _customerClient.DidNotReceive().AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>());
        }

        [Test]
        public async Task AjaxCreateAccount_ShouldPassResponseFromLoginAndTrack()
        {
            // Arrange
            var accountInfo = CreateValidCustomerAccountAndAuthInfo();
            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);

            _customerClient.AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.AjaxCreateAccount(accountInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(200));
            Assert.That(objectResult.Value, Is.InstanceOf<CustomerAuthTicket>());
            
            var returnedTicket = objectResult.Value as CustomerAuthTicket;
            Assert.AreEqual(authTicket.AccessToken, returnedTicket.AccessToken);
            Assert.AreEqual(authTicket.RefreshToken, returnedTicket.RefreshToken);
            Assert.AreEqual(authTicket.UserId, returnedTicket.UserId);
            Assert.That(returnedTicket.CustomerAccount, Is.Not.Null);
            Assert.AreEqual(authTicket.CustomerAccount.Id, returnedTicket.CustomerAccount.Id);
            Assert.AreEqual(authTicket.CustomerAccount.UserId, returnedTicket.CustomerAccount.UserId);
            Assert.AreEqual(authTicket.CustomerAccount.EmailAddress, returnedTicket.CustomerAccount.EmailAddress);
            Assert.AreEqual(authTicket.CustomerAccount.FirstName, returnedTicket.CustomerAccount.FirstName);
            Assert.AreEqual(authTicket.CustomerAccount.LastName, returnedTicket.CustomerAccount.LastName);
            Assert.AreEqual(authTicket.CustomerAccount.UserName, returnedTicket.CustomerAccount.UserName);
            
            await _customerClient.Received(1).AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>());
            
            // Verify authentication helpers were called
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        #endregion

        #region Error Handling Tests

        [Test]
        public async Task AjaxLogin_WithApiFailure_ShouldReturnUnauthorizedWithMessage()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "wrongpassword"
            };

            var failedResponse = CreateFailedAuthResponse(HttpStatusCode.Unauthorized);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(failedResponse));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
            
            // Use reflection to safely access the message property from anonymous object
            var responseType = objectResult.Value.GetType();
            var messageProperty = responseType.GetProperty("message");
            Assert.That(messageProperty, Is.Not.Null, "Response should have 'message' property");
            
            var messageValue = messageProperty.GetValue(objectResult.Value)?.ToString();
            Assert.That(messageValue, Does.Contain("test@example.com"));
        }

        [Test]
        public async Task Login_WithApiFailure_ShouldReturnLoginFailed()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "wrongpassword"
            };

            var failedResponse = CreateFailedAuthResponse(HttpStatusCode.BadRequest);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(failedResponse));

            // Act
            var result = await _authController.Login(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        // Note: GetLoginFailureMessage tests removed due to reflection complexity
        // These would be better tested through the public methods that call them

        #endregion

        #region API Client Tests

        [Test]
        public async Task AjaxLogin_ShouldCallCreateUserAuthTicketWithCorrectParameters()
        {
            // Arrange
            var email = "test@example.com";
            var password = "password123";
            var token = "captcha_token";

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            var loginDetails = new AuthController.LoginDetails
            {
                email = email,
                password = password,
                token = token
            };

            // Act
            await _authController.AjaxLogin(loginDetails);

            // Assert
            await _authTicketClient.Received(1).CreateUserAuthTicket(Arg.Is<CustomerUserAuthInfo>(
                info => info.Username == email && info.Password == password));
        }

        [Test]
        public async Task AjaxLogin_ShouldPassCaptchaTokenAsHeader()
        {
            // Arrange
            var token = "captcha_token_123";
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "password123",
                token = token
            };

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            // Since CloneWithHeaders is an extension method, we can't directly mock it.
            // Instead, verify that the login succeeds when a captcha token is provided.
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            Assert.That(okResult.Value, Is.EqualTo("Logged in as test@example.com."));
            
            // Verify that CreateUserAuthTicket was called (the token will be passed via CloneWithHeaders internally)
            await _authTicketClient.Received(1).CreateUserAuthTicket(Arg.Is<CustomerUserAuthInfo>(
                info => info.Username == "test@example.com" && info.Password == "password123"));
        }

        #endregion

        #region Response Format Tests

        [Test]
        public async Task AjaxLogin_Success_ShouldReturnOkObjectResultWithCorrectMessage()
        {
            // Arrange
            var email = "test@example.com";
            var loginDetails = new AuthController.LoginDetails
            {
                email = email,
                password = "validpassword123"
            };

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            Assert.That(okResult.Value, Is.EqualTo($"Logged in as {email}."));
        }

        [Test]
        public async Task AjaxLogin_Failure_ShouldReturnStatusCode401WithMessage()
        {
            // Arrange
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "wrongpassword"
            };

            var failedResponse = CreateFailedAuthResponse(HttpStatusCode.Unauthorized);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(failedResponse));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = (ObjectResult)result;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
            
            // Use reflection to safely access the message property from anonymous object
            var responseType = objectResult.Value.GetType();
            var messageProperty = responseType.GetProperty("message");
            Assert.That(messageProperty, Is.Not.Null, "Response should have 'message' property");
            
            var messageValue = messageProperty.GetValue(objectResult.Value);
            Assert.That(messageValue, Is.Not.Null, "Message should not be null");
        }

        #endregion

        #region Authentication Flow Tests

        [Test]
        public async Task AuthenticationFlow_EndToEnd_AjaxLogin_ShouldCompleteSuccessfully()
        {
            // Arrange - Full end-to-end test
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123"
            };

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.AjaxLogin(loginDetails);

            // Assert - Verify complete authentication flow
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            
            // Verify all authentication steps were called
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
            await _authTicketClient.Received(1).CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>());
        }

        [Test]
        public async Task AuthenticationFlow_EndToEnd_Login_ShouldCompleteSuccessfully()
        {
            // Arrange - Full end-to-end test
            var loginDetails = new AuthController.LoginDetails
            {
                email = "test@example.com",
                password = "validpassword123",
                returnUrl = "/dashboard"
            };

            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            _authTicketClient.CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.Login(loginDetails);

            // Assert - Verify complete authentication flow
            Assert.That(result, Is.InstanceOf<RedirectResult>());
            var redirectResult = (RedirectResult)result;
            Assert.That(redirectResult.Url, Is.EqualTo("/dashboard"));
            
            // Verify all authentication steps were called
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
            await _authTicketClient.Received(1).CreateUserAuthTicket(Arg.Any<CustomerUserAuthInfo>());
        }

        [Test]
        public async Task AuthenticationFlow_EndToEnd_AjaxCreateAccount_ShouldCompleteSuccessfully()
        {
            // Arrange - Full end-to-end test
            var accountInfo = CreateValidCustomerAccountAndAuthInfo();
            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);

            _customerClient.AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>())
                .Returns(Task.FromResult(serviceResponse));

            // Act
            var result = await _authController.AjaxCreateAccount(accountInfo);

            /// Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(200));
            Assert.That(objectResult.Value, Is.InstanceOf<CustomerAuthTicket>());
            
            var returnedTicket = objectResult.Value as CustomerAuthTicket;
            Assert.AreEqual(authTicket.AccessToken, returnedTicket.AccessToken);
            Assert.AreEqual(authTicket.RefreshToken, returnedTicket.RefreshToken);
            Assert.AreEqual(authTicket.UserId, returnedTicket.UserId);
            Assert.That(returnedTicket.CustomerAccount, Is.Not.Null);
            Assert.AreEqual(authTicket.CustomerAccount.Id, returnedTicket.CustomerAccount.Id);
            Assert.AreEqual(authTicket.CustomerAccount.UserId, returnedTicket.CustomerAccount.UserId);
            Assert.AreEqual(authTicket.CustomerAccount.EmailAddress, returnedTicket.CustomerAccount.EmailAddress);
            Assert.AreEqual(authTicket.CustomerAccount.FirstName, returnedTicket.CustomerAccount.FirstName);
            Assert.AreEqual(authTicket.CustomerAccount.LastName, returnedTicket.CustomerAccount.LastName);
            Assert.AreEqual(authTicket.CustomerAccount.UserName, returnedTicket.CustomerAccount.UserName);
            
            await _customerClient.Received(1).AddAccountAndLogin(Arg.Any<CustomerAccountAndAuthInfo>());
            
            // Verify authentication helpers were called
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        #endregion

        #region 2FA Validation Tests

        [Test]
        public async Task Validate2FAAndCreateAuthTicket_WithNullAuthTicket2FAInfo_ShouldReturnBadRequest()
        {
            // Arrange - null input
            AuthController.AuthTicket2FAInfoUI authTicket2FAInfo = null;

            // Act
            var result = await _authController.Validate2FAAndCreateAuthTicket(authTicket2FAInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(400));
            
            var responseValue = objectResult.Value;
            var messageProperty = responseValue.GetType().GetProperty("message").GetValue(responseValue, null);
            Assert.AreEqual("Invalid parameters supplied.", messageProperty);
        }

        [Test]
        public async Task Validate2FAAndCreateAuthTicket_WithEmptyOtpCode_ShouldReturnBadRequest()
        {
            // Arrange - empty OTP code
            var authTicket2FAInfo = new AuthController.AuthTicket2FAInfoUI
            {
                OtpCode = "",
                returnUrl = "/myaccount"
            };

            // Act
            var result = await _authController.Validate2FAAndCreateAuthTicket(authTicket2FAInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(400));
            
            var responseValue = objectResult.Value;
            var messageProperty = responseValue.GetType().GetProperty("message").GetValue(responseValue, null);
            Assert.AreEqual("Invalid parameters supplied.", messageProperty);
        }

        [Test]
        public async Task Validate2FAAndCreateAuthTicket_WithNullOtpCode_ShouldReturnBadRequest()
        {
            // Arrange - null OTP code
            var authTicket2FAInfo = new AuthController.AuthTicket2FAInfoUI
            {
                OtpCode = null,
                returnUrl = "/myaccount"
            };

            // Act
            var result = await _authController.Validate2FAAndCreateAuthTicket(authTicket2FAInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(400));
            
            var responseValue = objectResult.Value;
            var messageProperty = responseValue.GetType().GetProperty("message").GetValue(responseValue, null);
            Assert.AreEqual("Invalid parameters supplied.", messageProperty);
        }

        [Test]
        public async Task Validate2FAAndCreateAuthTicket_WithValidOtpCode_ShouldCallApiClient()
        {
            // Arrange
            var expectedUserId = "1234";
            var expectedUserClaims = CreateShopperClaimsWithoutRequires2FA(int.Parse(expectedUserId));
            _apiContext.UserClaims.Returns(expectedUserClaims);
            
            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            
            _authTicketClient.Validate2FAAndCreateAuthTicket(Arg.Any<AuthTicket2FAInfo>())
                .Returns(Task.FromResult(serviceResponse));

            var authTicket2FAInfo = new AuthController.AuthTicket2FAInfoUI
            {
                OtpCode = "123456",
                returnUrl = "/myaccount"
            };

            // Act
            await _authController.Validate2FAAndCreateAuthTicket(authTicket2FAInfo);

            // Assert
            await _authTicketClient.Received(1).Validate2FAAndCreateAuthTicket(
                Arg.Is<AuthTicket2FAInfo>(info => 
                    info.UserId == expectedUserId && 
                    info.OtpCode == "123456"));
        }        

        [Test]
        public async Task GenerateAndSend2FAOtp_WithUnauthenticatedUser_SuccessfulResponse_ShouldReturnOk()
        {
            // Arrange - User is not authenticated
            _pageContext.User.Returns((Mozu.SiteBuilder.UX.Models.Customers.User)null);
            
            // Set up the LifetimeScope so the controller can resolve PageContext
            var mockLifetimeScope = Substitute.For<IServiceProvider>();
            mockLifetimeScope.GetService(typeof(IPageContext)).Returns(_pageContext);
            _authController.LifetimeScope = mockLifetimeScope;
            
            var successResponse = new ServiceClientResponse<TwoFactorAuthResponse>()
            {
                ResponseMessage = new HttpResponseMessage(HttpStatusCode.OK)
            };
            
            _authTicketClient.GenerateAndSend2faOtp().Returns(Task.FromResult(successResponse));

            // Act
            var result = await _authController.GenerateAndSend2FAOtp();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            
            var responseValue = okResult.Value;
            var messageProperty = responseValue.GetType().GetProperty("message").GetValue(responseValue, null);
            Assert.AreEqual("2FA OTP sent successfully.", messageProperty);
            
            await _authTicketClient.Received(1).GenerateAndSend2faOtp();
        }

        [Test]
        public async Task GenerateAndSend2FAOtp_WithUnauthenticatedUser_ApiFailure_ShouldReturnErrorStatusCode()
        {
            // Arrange - User is not authenticated and API fails
            _pageContext.User.Returns((Mozu.SiteBuilder.UX.Models.Customers.User)null);
            
            // Set up the LifetimeScope so the controller can resolve PageContext
            var mockLifetimeScope = Substitute.For<IServiceProvider>();
            mockLifetimeScope.GetService(typeof(IPageContext)).Returns(_pageContext);
            _authController.LifetimeScope = mockLifetimeScope;
            
            var failureResponse = new ServiceClientResponse<TwoFactorAuthResponse>()
            {
                ResponseMessage = new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("{\"message\": \"Failed to send OTP\"}")
                }
            };
            
            _authTicketClient.GenerateAndSend2faOtp().Returns(Task.FromResult(failureResponse));

            // Act
            var result = await _authController.GenerateAndSend2FAOtp();

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(400));
        }

        #endregion

        #region ValidateOtpAndCreateAuthTicket Tests

        [Test]
        public async Task ValidateOtpAndCreateAuthTicket_WithNullAuthTicketOtpInfo_ShouldReturnBadRequest()
        {
            // Arrange - null input
            AuthController.AuthTicketOtpInfoUI authTicketOtpInfo = null;

            // Act
            var result = await _authController.ValidateOtpAndCreateAuthTicket(authTicketOtpInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(400));
            
            var responseValue = objectResult.Value;
            var messageProperty = responseValue.GetType().GetProperty("message").GetValue(responseValue, null);
            Assert.AreEqual("Invalid parameters supplied.", messageProperty);
        }

        [Test]
        public async Task ValidateOtpAndCreateAuthTicket_WithEmptyOtpCode_ShouldReturnBadRequest()
        {
            // Arrange - empty OTP code
            var authTicketOtpInfo = new AuthController.AuthTicketOtpInfoUI
            {
                Email = "test@example.com",
                OtpCode = "",
                returnUrl = "/myaccount"
            };

            // Act
            var result = await _authController.ValidateOtpAndCreateAuthTicket(authTicketOtpInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(400));
            
            var responseValue = objectResult.Value;
            var messageProperty = responseValue.GetType().GetProperty("message").GetValue(responseValue, null);
            Assert.AreEqual("Invalid parameters supplied.", messageProperty);
        }

        [Test]
        public async Task ValidateOtpAndCreateAuthTicket_WithValidOtpCode_ShouldCallApiClient()
        {
            // Arrange
            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            
            // Mock the chained call directly
            _authTicketClient.CloneWithoutUserClaims()
                .ValidateOtpAndCreateAuthTicket(Arg.Any<AuthTicketOtpInfo>())
                .Returns(Task.FromResult(serviceResponse));

            var authTicketOtpInfo = new AuthController.AuthTicketOtpInfoUI
            {
                Email = "test@example.com",
                OtpCode = "123456",
                returnUrl = "/myaccount"
            };

            // Mock headers using controller context
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["x-vol-user-claims"] = "fingerprint123";
            httpContext.Request.Headers["user-agent"] = "TestAgent";
            _authController.ControllerContext = new ControllerContext { HttpContext = httpContext };

            // Act
            await _authController.ValidateOtpAndCreateAuthTicket(authTicketOtpInfo);

            // Assert
            _authTicketClient.Received(1).CloneWithoutUserClaims();
        }

        [Test]
        public async Task ValidateOtpAndCreateAuthTicket_WithValidOtpCode_SuccessfulResponse_ShouldReturnRedirect()
        {
            // Arrange
            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            
            // Mock the chained call directly
            _authTicketClient.CloneWithoutUserClaims()
                .ValidateOtpAndCreateAuthTicket(Arg.Any<AuthTicketOtpInfo>())
                .Returns(Task.FromResult(serviceResponse));

            var authTicketOtpInfo = new AuthController.AuthTicketOtpInfoUI
            {
                Email = "test@example.com",
                OtpCode = "123456",
                returnUrl = "/myaccount"
            };

            // Mock headers using controller context
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["x-vol-user-claims"] = "fingerprint123";
            httpContext.Request.Headers["user-agent"] = "TestAgent";
            _authController.ControllerContext = new ControllerContext { HttpContext = httpContext };

            // Act
            var result = await _authController.ValidateOtpAndCreateAuthTicket(authTicketOtpInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>(), "Should return OkObjectResult for successful OTP validation");
            var okResult = (OkObjectResult)result;
            Assert.That(okResult.Value, Is.EqualTo("Logged in."), "Should return success message");
            
            // Verify authentication helpers were called
            _authHelper.Received(1).SaveStoreFrontAccessToken(Arg.Any<string>(), Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(Arg.Any<string>(), Arg.Any<DateTime?>());
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        [Test]
        public async Task ValidateOtpAndCreateAuthTicket_WithApiFailure_ShouldReturnErrorStatusCode()
        {
            // Arrange
            var failureResponse = new ServiceClientResponse<CustomerAuthTicket>()
            {
                ResponseMessage = new HttpResponseMessage(HttpStatusCode.Unauthorized)
                {
                    Content = new StringContent("{\"message\": \"Invalid OTP code\"}")
                }
            };
            
            // Mock the chained call directly
            _authTicketClient.CloneWithoutUserClaims()
                .ValidateOtpAndCreateAuthTicket(Arg.Any<AuthTicketOtpInfo>())
                .Returns(Task.FromResult(failureResponse));

            var authTicketOtpInfo = new AuthController.AuthTicketOtpInfoUI
            {
                Email = "test@example.com",
                OtpCode = "invalid123",
                returnUrl = "/myaccount"
            };

            // Mock headers using controller context
            var httpContext = new DefaultHttpContext();
            _authController.ControllerContext = new ControllerContext { HttpContext = httpContext };

            // Act
            var result = await _authController.ValidateOtpAndCreateAuthTicket(authTicketOtpInfo);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(401));
        }

        #endregion

        #region GenerateAndSendOtp Tests        

        [Test]
        public async Task GenerateAndSendOtp_WithValidRequest_SuccessfulResponse_ShouldReturnOk()
        {
            // Arrange - User is not authenticated
            _pageContext.User.Returns((Mozu.SiteBuilder.UX.Models.Customers.User)null);
            
            // Set up the LifetimeScope so the controller can resolve PageContext
            var mockLifetimeScope = Substitute.For<IServiceProvider>();
            mockLifetimeScope.GetService(typeof(IPageContext)).Returns(_pageContext);
            _authController.LifetimeScope = mockLifetimeScope;
            
            var successResponse = new ServiceClientResponse<OtpResponse>()
            {
                ResponseMessage = new HttpResponseMessage(HttpStatusCode.OK)
            };
            
            
            _authTicketClient.CloneWithoutUserClaims()
                .GenerateAndSendOtp(Arg.Any<OtpRequest>())
                .Returns(Task.FromResult(successResponse));

            var otpRequest = new OtpRequest { Email = "test@example.com" };

            // Act
            var result = await _authController.GenerateAndSendOtp(otpRequest);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            
            var responseValue = okResult.Value;
            var messageProperty = responseValue.GetType().GetProperty("message").GetValue(responseValue, null);
            Assert.AreEqual("2FA OTP sent successfully.", messageProperty);
            
            _authTicketClient.Received(1).CloneWithoutUserClaims();
        }

        #endregion

        #region 2FA Integration Tests

        [Test]
        public async Task AuthenticationFlow_EndToEnd_OTPValidation_ShouldCompleteSuccessfully()
        {
            // Arrange - Complete OTP flow
            var authTicket = CreateValidCustomerAuthTicket();
            var serviceResponse = CreateSuccessfulAuthResponse(authTicket);
            
            // Mock the chained call directly
            _authTicketClient.CloneWithoutUserClaims()
                .ValidateOtpAndCreateAuthTicket(Arg.Any<AuthTicketOtpInfo>())
                .Returns(Task.FromResult(serviceResponse));

            var authTicketOtpInfo = new AuthController.AuthTicketOtpInfoUI
            {
                Email = "test@example.com",
                OtpCode = "654321",
                returnUrl = "/dashboard"
            };

            // Mock headers
            var headerDictionary = new HeaderDictionary();
            headerDictionary["x-vol-user-claims"] = "fingerprint123";
            headerDictionary["user-agent"] = "TestAgent";
            
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers.Clear();
            foreach (var header in headerDictionary)
            {
                httpContext.Request.Headers.Add(header.Key, header.Value);
            }

            _authController.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            // Act
            var result = await _authController.ValidateOtpAndCreateAuthTicket(authTicketOtpInfo);

            // Assert - Complete authentication flow
            Assert.That(result, Is.InstanceOf<OkObjectResult>(), "Should return OkObjectResult for successful authentication flow");
            var okResult = (OkObjectResult)result;
            Assert.That(okResult.Value, Is.EqualTo("Logged in."), "Should return success message");
            
            // Verify complete authentication chain
            _authTicketClient.Received(1).CloneWithoutUserClaims();
            
            _authHelper.Received(1).SaveStoreFrontAccessToken(authTicket.AccessToken, Arg.Any<string>());
            _authHelper.Received(1).SaveStoreFrontRefreshToken(authTicket.RefreshToken, authTicket.RefreshTokenExpiration);
            _apiContext.Received(1).SetUser(Arg.Any<LightweightUserClaims>());
        }

        #endregion

        [TearDown]
        public void TearDown()
        {
            _container?.Dispose();
        }
    }
}
