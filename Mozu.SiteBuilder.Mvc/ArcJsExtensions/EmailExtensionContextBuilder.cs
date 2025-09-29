using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Mozu.Core;
using Mozu.Core.Actions;
using Mozu.Core.Actions.Contracts;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.Core.Observability;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.SiteBuilder.UX.Models.StoreFront.Email;
using Mozu.Tenant.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.ArcJsExtensions
{
    public interface IEmailExtensionContextBuilder
    {
        EmailRenderContext BuildContext(EmailNotification notification, object model, User user, Site site, SiteContext siteContext, List<Core.Extensible.Contracts.Attribute> shopperAttributes, Location.Contracts.Location location, string emailTitle);
        ApiActionExtensionFilterContext CreateExtensionContext(EmailRenderContext emailContext);
        Task<EmailRenderContext> ExecuteEmailRenderExtension(EmailRenderContext emailContext, string functionId);
    }

    public class EmailExtensionContextBuilder : FunctionRunner<ApiActionExtensionFilterContext>, IEmailExtensionContextBuilder
    {
        private readonly IFunctionProvider _functionProvider;
        private readonly ILogger _logger;

        public EmailExtensionContextBuilder(IFunctionProvider functionProvider,
            ILoggerFactory loggingService,
            ISecureAppDataHandler secureAppDataHandler,
            IApiContext apiContext,
            NodePoolManager nodePoolManager,
            IMozuSettings mozuSettings,
            IApiExceptionHandlerService apiExceptionHandlerService,
            IHttpContextAccessor httpContextAccessor,
            IObservabilityOptions observabilityOptions) :
            base(functionProvider,
            loggingService,
            secureAppDataHandler,
            apiContext,
            nodePoolManager,
            mozuSettings,
            apiExceptionHandlerService,
            httpContextAccessor,
            observabilityOptions)
        {
            _functionProvider = functionProvider;
            _logger = loggingService.CreateLogger<EmailExtensionContextBuilder>();
        }

        public EmailRenderContext BuildContext(EmailNotification notification, object model, User user, Site site, SiteContext siteContext, List<Core.Extensible.Contracts.Attribute> shopperAttributes, Location.Contracts.Location location, string emailTitle)
        {
            return new EmailRenderContext
            {
                Notification = notification,
                Model = model,
                User = user,
                Site = site,
                OriginalTemplate = GetEmailTemplate(notification.Topic, siteContext),
                CurrentTemplate = GetEmailTemplate(notification.Topic, siteContext),
                IsSuppressed = false,
                TemplateChanged = false,
                Subject = emailTitle ?? notification.Topic,
                Template = GetEmailTemplate(notification.Topic, siteContext),
                Content = model,
                RmaLocation = location,
                DomainName = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault(),
                StoreFrontAttributes = shopperAttributes                
            };
        }

        public ApiActionExtensionFilterContext CreateExtensionContext(EmailRenderContext emailContext)
        {
            // Create fresh ViewDataDictionary for each context to avoid stale data
            var viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            {
                Model = emailContext.Model
            };

            // Populate ViewData with fresh context data
            viewData["content"] = emailContext.Content;
            viewData["User"] = emailContext.User;
            viewData["site"] = emailContext.Site;
            viewData["rmaLocation"] = emailContext.RmaLocation;
            viewData["domainName"] = emailContext.DomainName;
            viewData["storefrontOrderAttributes"] = emailContext.StoreFrontAttributes;
            viewData["subject"] = emailContext.Subject;

            // Create a fresh ActionContext to avoid context pollution
            var dummyActionContext = new Microsoft.AspNetCore.Mvc.ActionContext(
                 new DefaultHttpContext(), // non-null HttpContext
                 new RouteData(),
                 new ActionDescriptor()
             );
            var filterMetadata = new List<Microsoft.AspNetCore.Mvc.Filters.IFilterMetadata>();
            var actionArguments = new Dictionary<string, object>();
            //object controllerInstance = null;
            var actionContext = new Microsoft.AspNetCore.Mvc.Filters.ActionExecutingContext(
                dummyActionContext,
                filterMetadata,
                actionArguments,
                emailContext
            );

            // Create extension context with email-specific items - ensure fresh instances
            var extensionContext = new ApiActionExtensionFilterContext(null, actionContext, null, null);
            
            // Always create fresh dictionaries to prevent stale data
            extensionContext.Items = new Dictionary<string, object>();
            extensionContext.ExecDelegates = new Dictionary<string, Func<object[], Task>>();
            extensionContext.GlobalContext = new Dictionary<string, GlobalContextItem>();

            // Add fresh context data
            extensionContext.Items["emailRenderContext"] = emailContext;
            extensionContext.Items["viewData"] = viewData;

            // pass logger to new overload so we can trace configuration
            EmailExtensionApiBinding.ConfigureEmailApiExtensions(extensionContext, _logger);

            return extensionContext;
        }

        private string GetEmailTemplate(string topic, SiteContext siteContext)
        {
            // Logic to determine the email template based on the topic
            var emailTemplate = siteContext.Theme.EmailTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(topic));
            return emailTemplate?.Template;
        }

        public async Task<EmailRenderContext> ExecuteEmailRenderExtension(EmailRenderContext emailContext, string functionId)
        {
            try
            {
                var functions = await _functionProvider.GetFunctions(functionId);

                if (functions?.Any() == true)
                {
                    // Create fresh extension context for each execution to prevent stale data
                    var extensionContext = CreateExtensionContext(emailContext);

                    // Log context creation for debugging
                    _logger.LogDebug("Created fresh extension context for email render extension. EmailContext: {EmailContextId}", 
                        emailContext.GetHashCode());

                    // IMPORTANT: wire up internal runner plumbing (was missing)
                    this.InitContext(extensionContext, functions.ToList());

                    await this.RunFunctions(extensionContext, functions.ToList(), new EmailExtensionCallbackHandler());

                    // Get the modified context from the extension execution
                    if (extensionContext.Items.TryGetValue("emailRenderContext", out var modifiedContextObj)
                        && modifiedContextObj is EmailRenderContext modifiedEc)
                    {
                        _logger.LogDebug("Extension execution completed. Modified context: {ModifiedContextId}", 
                            modifiedEc.GetHashCode());
                        emailContext = modifiedEc;
                    }
                    else
                    {
                        _logger.LogWarning("Extension execution did not return a modified EmailRenderContext. Using original context.");
                    }
                }
                else
                {
                    _logger.LogDebug("No email render extensions found for execution.");
                }
            }
            catch (TimeoutException ex)
            {
                _logger.LogWarning(ex, "Email extension timed out, proceeding with original context");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in email extension, proceeding with original context");
            }

            return emailContext;
        }
    }

    public class EmailExtensionCallbackHandler : IFunctionCallbackHandler
    {
        FunctionContinuationBehavior IFunctionCallbackHandler.OnBeforeExecute(CustomFunctionBase function)
        {
            return FunctionContinuationBehavior.Continue;
        }

        FunctionContinuationBehavior IFunctionCallbackHandler.OnError(Exception ex, CustomFunctionBase function)
        {
            return FunctionContinuationBehavior.Continue;
        }

        Task IFunctionCallbackHandler.OnExe<T>(string key, object[] value, T context)
        {
            if (context.ExecDelegates != null && context.ExecDelegates.TryGetValue(key, out var fn))
            {
                return fn(value);
            }
            return Task.CompletedTask;
        }

        FunctionContinuationBehavior IFunctionCallbackHandler.OnResult(object result, CustomFunctionBase function,
            FunctionContextBase context)
        {
            return FunctionContinuationBehavior.Continue;
        }

        FunctionContinuationBehavior IFunctionCallbackHandler.OnTimeout(CustomFunctionBase function)
        {
            return FunctionContinuationBehavior.Stop;
        }
    }
}
