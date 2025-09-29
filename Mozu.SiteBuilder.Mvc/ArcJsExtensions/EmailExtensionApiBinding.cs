using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Mozu.Core.Actions.Contracts;
using Mozu.SiteBuilder.UX.Models.StoreFront.Email;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging; // added

namespace Mozu.SiteBuilder.Mvc.ArcJsExtensions
{
    public static class EmailExtensionApiBinding
    {
        // INTERNAL helper with logging parameter
        private static void RefreshDto(ApiActionExtensionFilterContext ctx, EmailRenderContext ec, ILogger logger)
        {
            if (ctx?.Items == null || ec == null)
            {
                logger?.LogError("RefreshDto skipped - invalid state (ctx null: {CtxNull}, items null: {ItemsNull}, ec null: {EcNull})",
                    ctx == null, ctx?.Items == null, ec == null);
                return;
            }

            ctx.Items["emailRenderContext"] = ec; // preserve live reference

            ctx.Items["getContent"] = ec.Content;
            ctx.Items["getUser"] = ec.User;
            ctx.Items["getSite"] = ec.Site;
            ctx.Items["getModel"] = ec.Model;
            ctx.Items["getRmaLocation"] = ec.RmaLocation;
            ctx.Items["getDomainName"] = ec.DomainName;
            ctx.Items["getSubject"] = ec.Subject;
            ctx.Items["getStorefrontOrderAttributes"] = ec.StoreFrontAttributes;

            if (ctx.Items.TryGetValue("viewData", out var viewDataObj) && viewDataObj is ViewDataDictionary viewData)
            {
                viewData["content"] = ec.Content;
                viewData["User"] = ec.User;
                viewData["site"] = ec.Site;
                viewData["rmaLocation"] = ec.RmaLocation;
                viewData["domainName"] = ec.DomainName;
                viewData["storefrontOrderAttributes"] = ec.StoreFrontAttributes;
                viewData["subject"] = ec.Subject;
                viewData.Model = ec.Model;
            }
        }

        // Existing signature retained for backward compatibility (no logging provided)
        public static void ConfigureEmailApiExtensions(ApiActionExtensionFilterContext context)
        {
            ConfigureEmailApiExtensions(context, null);
        }

        // New overload with logging
        public static void ConfigureEmailApiExtensions(ApiActionExtensionFilterContext context, ILogger logger)
        {
            if (context?.Items == null)
            {
                logger?.LogDebug("ConfigureEmailApiExtensions skipped: context or Items null");
                return;
            }

            var emailContext = context.Items.TryGetValue("emailRenderContext", out var emailCtxObj)
                ? emailCtxObj as EmailRenderContext
                : null;

            var viewData = context.Items.TryGetValue("viewData", out var viewDataObj)
                ? viewDataObj as ViewDataDictionary
                : null;

            if (emailContext == null || viewData == null)
            {
                logger?.LogDebug("ConfigureEmailApiExtensions skipped: emailContext or viewData missing (emailContext null: {EmailNull}, viewData null: {ViewDataNull})", emailContext == null, viewData == null);
                return;
            }

            // If previously populated, clear to avoid stale reuse.
            context.GlobalContext?.Clear();

            RefreshDto(context, emailContext, logger);

            context.ExecDelegates ??= new System.Collections.Generic.Dictionary<string, System.Func<object[], Task>>();

            context.ExecDelegates["setSubject"] = args =>
            {
                if (args?.Length > 0 && args[0] is JArray jarr && jarr.Count > 0)
                {
                    var subject = jarr[0]?.ToString();
                    if (subject != null)
                    {
                        logger?.LogDebug("Exec setSubject invoked. Old: {OldSubject}, New: {NewSubject}", emailContext.Subject, subject);
                        emailContext.Subject = subject;
                        viewData["subject"] = subject;
                        RefreshDto(context, emailContext, logger);
                    }
                }
                return Task.CompletedTask;
            };

            context.ExecDelegates["suppressEmail"] = args =>
            {
                logger?.LogDebug("Exec suppressEmail invoked. Previously Suppressed: {Old}", emailContext.IsSuppressed);
                emailContext.IsSuppressed = true;
                RefreshDto(context, emailContext, logger);
                return Task.CompletedTask;
            };

            context.ExecDelegates["setTemplate"] = args =>
            {
                if (args?.Length > 0 && args[0] is JArray jarr && jarr.Count > 0)
                {
                    var value = jarr[0]?.ToString();
                    if (value != null)
                    {
                        logger?.LogDebug("Exec setTemplate invoked. TemplateChanged: {OldChanged}, NewLength: {Len}", emailContext.TemplateChanged, value.Length);
                        emailContext.CurrentTemplate = value;
                        emailContext.TemplateChanged = true;
                        RefreshDto(context, emailContext, logger);
                    }
                }
                return Task.CompletedTask;
            };

            context.ExecDelegates["setContent"] = args =>
            {
                if (args?.Length > 0 && args[0] is JArray jarr && jarr.Count > 0)
                {
                    var value = jarr[0];
                    logger?.LogDebug("Exec setContent invoked. NewModelType: {Type}", value?.GetType().FullName);
                    emailContext.Content = value;
                    viewData["content"] = value;
                    RefreshDto(context, emailContext, logger);
                }
                return Task.CompletedTask;
            };

            context.ExecDelegates["setModel"] = args =>
            {
                if (args?.Length > 0 && args[0] is JArray jarr && jarr.Count > 0)
                {
                    var value = jarr[0];
                    logger?.LogDebug("Exec setModel invoked. NewModelType: {Type}", value?.GetType().FullName);
                    emailContext.Model = value;
                    viewData.Model = value;
                    RefreshDto(context, emailContext, logger);
                }
                return Task.CompletedTask;
            };

            context.ExecDelegates["setUser"] = objects =>
            {
                if (objects?.Length > 0 && objects[0] != null)
                {
                    if (objects[0] is UX.Models.Customers.User user)
                    {
                        logger?.LogDebug("Exec setUser invoked. NewUserId: {UserId}, OldUserId: {OldUserId}", user.UserId, emailContext.User?.UserId);
                        emailContext.User = user;
                    }
                    viewData["User"] = objects[0];
                    RefreshDto(context, emailContext, logger);
                }
                return Task.CompletedTask;
            };

            logger?.LogDebug("Email API extensions configured successfully. ExecDelegates: {DelegateCount}", context.ExecDelegates.Count);
        }
    }
}
