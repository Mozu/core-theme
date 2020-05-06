using System;
using System.IO;
using System.Web;
using System.Web.Http;
using Mozu.Core.Settings;
using Mozu.MZDB.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Contexts;

namespace Mozu.SiteBuilder.UX.Admin.Modules
{
    public class BetaControlVersionModule : IHttpModule
    {
        void IHttpModule.Dispose()
        {
        }

        void IHttpModule.Init(HttpApplication context)
        {
            context.PreSendRequestContent += context_PreSendRequestHeaders;
        }

        public void ProcessRequest(HttpContextBase context)
        {
            var bcv = context.Request.QueryString["bcv"];
            if (!string.IsNullOrEmpty(bcv))
            {
                var tasc = new TenantAdminSettingsContext(null, null, context, null, null);
                
                if (bcv != tasc.BetaControlVersion)
                {
                    context.Response.Cache.SetExpires(DateTime.Now.AddYears(-1));
                }


                var path = tasc.MapPath(context.Request.AppRelativeCurrentExecutionFilePath.Substring(1));
                var file = new FileInfo(path);
                if (file.Exists)
                {
                    context.Response.Headers.Remove("Content-Encoding");
                    context.Response.ClearContent();
                    using (var stream = file.OpenRead())
                    {
                        stream.CopyTo(context.Response.OutputStream);
                    }
                }
            }
        }


        private void context_PreSendRequestHeaders(object sender, EventArgs e)
        {
            var context = ((HttpApplication) sender).Context;

            ProcessRequest(new HttpContextWrapper(context));
        }
    }
}