// -----------------------------------------------------------------------
// <copyright file="SbAuthenticationModule.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Threading.Tasks;
using System.Web.Mvc;
using Autofac.Core.Lifetime;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;
using Mozu.User.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.Security
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class SbAuthenticationModule : IHttpModule
    {
        public void Dispose()
        {
        }

        public void Init(HttpApplication context )
        {
            context.AuthenticateRequest += new EventHandler(this.OnAuthenticate);
            context.AddOnAuthenticateRequestAsync( BeginRequestHandler, EndRequestHandler);
        }

        private IAsyncResult BeginRequestHandler(object sender, EventArgs e, AsyncCallback cb, object extraData)
        {

            var tcs = new TaskCompletionSource<bool>(extraData);

            if (!IsAdmin)
            {



                var apiContext = DependencyResolver.Current.GetService<ISiteBuilderApiContext>();
                var authHelper = DependencyResolver.Current.GetService<IAuthenticationHelper>();
                var settnigs = DependencyResolver.Current.GetService<ISettings>();

                if (apiContext != null && apiContext.UserClaims != null && !apiContext.UserClaims.IsAnonymous && (apiContext.UserClaims.Expiration - DateTime.UtcNow).TotalMinutes < 5 && authHelper.GetAuthTicket() != null)
                {



                    string token = authHelper.GetAuthTicket().RefreshToken;
                    var ticketClient = DependencyResolver.Current.GetService<Mozu.User.Contracts.Clients.IAuthTicketWebApiClient>().CloneWithoutUserClaims();
                    var task = ticketClient.RefreshUserAuthTicket(token);
                    //var task = ticketClient.Handler.SendAsync<Mozu.Core.Api.Contracts.UserAuthTicket>("PUT", "refresh?refreshToken=" + token, ((AuthTicketWebApiClient) ticketClient).ServiceId, ticketClient.Options);

                    task.ConfigureAwait(false);
                    var retTask = task.ContinueWith(serviceClientResponse =>
                        {
                            var resp = serviceClientResponse.Result;
                            if (resp.ResponseMessage.IsSuccessStatusCode)
                            {
                                var ticket = resp.ReadAsSync();
                                var lwuc = LightweightUserClaims.Parse(ticket.AccessToken);
                                authHelper.SaveAuthTicket(ticket);
                                apiContext.SetUser(lwuc);
                            }
                            else
                            {
                                if (apiContext.SiteId.HasValue)
                                {
                                    var uc = LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId, apiContext.SiteId.Value);
                                    var extingTicket = authHelper.GetAuthTicket() ?? new UserAuthTicket();
                                    extingTicket.AccessToken = uc.ToAccessToken();

                                    authHelper.SaveAuthTicket(extingTicket);
                                    apiContext.SetUser(uc);
                                }
                                else
                                {
                                    authHelper.SaveAuthTicket(null);
                                }
                                
                            }

                            tcs.SetResult(true);
                            cb(tcs.Task);
                        });

                    return task;

                }
            }
            tcs.SetResult(true);
            cb(tcs.Task);
            return tcs.Task;

        }

        private void EndRequestHandler (IAsyncResult ar)
        {
            var t = (Task<bool>) ar;
            t.Wait();
        }

   
        //refactor out ... this class shouldnt really be shared between admin and storefront.
        private static object _isAdmin = null;
        public static bool IsAdmin
        {
            get
            {
                if (_isAdmin == null)
                {
                    _isAdmin = string.Equals(HttpRuntime.AppDomainAppVirtualPath, "/admin", StringComparison.OrdinalIgnoreCase);
                }
                return (bool) _isAdmin;
            }
            set { _isAdmin = value; }
        }

        


        void OnAuthenticate(object sender, EventArgs e)
        {
           

             


            
           
            var apiContext = DependencyResolver.Current.GetService<ISiteBuilderApiContext>();
            var authHelper = DependencyResolver.Current.GetService<IAuthenticationHelper >();
            var settnigs = DependencyResolver.Current.GetService<ISettings>();

          

            if (apiContext.UserClaims != null)
            {
                 
                string tmp;
                int tenantId;
                int siteId;
                if (apiContext.UserClaims.Bag.TryGetValue("TenantId", out tmp) && int.TryParse(  tmp, out tenantId  ))
                {
                    tmp = null;
                    if (tenantId != apiContext.TenantId)
                    {
                        apiContext.SetUser(null);
                    }
                    else if (apiContext.SiteId.HasValue && apiContext.UserClaims.Bag.TryGetValue("SiteId", out tmp) && int.TryParse( tmp, out siteId ) && apiContext.SiteId.Value != siteId  )
                    {
                        apiContext.SetUser(null);
                    }
                }
            }


            if (apiContext.UserClaims == null)
            {
                
                var user = LightweightUserClaims.CreateForAnonymousShopper(apiContext.TenantId, apiContext.SiteId ?? -1);
                apiContext.SetUser(user);
                authHelper.SaveAccessToken(  user.ToAccessToken());
            }

          
        }
    }
}
