using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Modules
{
    public class BetaControlVersionModule : System.Web.IHttpModule
    {

        void System.Web.IHttpModule.Dispose()
        {

        }

        void System.Web.IHttpModule.Init(System.Web.HttpApplication context)
        {
            context.PreSendRequestContent += context_PreSendRequestHeaders;
           
        }

        public void ProcessRequest(HttpContextBase context)
        {
            var bcv = context.Request.QueryString["bcv"];
            if (!string.IsNullOrEmpty(bcv))
            {
                var sbcv = Mozu.Core.Settings.MozuConfigurationManager.Settings.AppSettings("sitebuilder.betaControlVersion");
                if (bcv != sbcv)
                {
                    context.Response.Cache.SetMaxAge(TimeSpan.FromDays(-100));
                    context.Response.Cache.SetExpires(DateTime.Now.AddYears(-1));

                }
                
                var path = context.Request.PhysicalApplicationPath +"\\..\\" + sbcv + context.Request.AppRelativeCurrentExecutionFilePath.Substring(1);
                var file = new FileInfo(path);
                if (file.Exists)
                {
                    context.Response.ClearContent();
                    using (var stream = file.OpenRead())
                    {
                        stream.CopyTo(context.Response.OutputStream);
                    }
                        
                }
                
            }

        }

        

        void context_PreSendRequestHeaders(object sender, System.EventArgs e)
        {
            HttpContext context = ((HttpApplication)sender).Context;

            ProcessRequest(new HttpContextWrapper(context));

        }
    }
}