using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
using AutoMapper;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.Settings;
using Mozu.InstalledApplications.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.Tenant.Contracts.Clients;
using AdminUser2 = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.User;
using ApiRole = Mozu.Core.Api.Contracts.Role;

using IInvitationWebApiClient = Mozu.AdminUser.Contracts.Clients.IMultiScopeInvitationWebApiClient ;
using Invitation = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.Invitation;
using IMultiScopeRoleWebApiClient = Mozu.AdminUser.Contracts.Clients.IMultiScopeRoleWebApiClient;
//using DC = Mozu.Core.Api.Contracts;
using PasswordInfo = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.PasswordInfo;
using Role = Mozu.SiteBuilder.UX.Models.Users.Role;
using Mozu.InstalledApplications.Contracts;
using Mozu.Core.Actions.ExtensionRuntime;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [AllowAnonymous]
    [WebApi("app/actionconfiguration", SuppressDescriptorGeneration = true)]
    public class ActionConfigurationController : BaseController, IHttpController
    {
        private readonly Mozu.InstalledApplications.Contracts.Clients.IExtensionsWebApiClient _extensionsWebApiClient;

        public ActionConfigurationController(Mozu.InstalledApplications.Contracts.Clients.IExtensionsWebApiClient extensionsWebApiClient)
        {
          
            _extensionsWebApiClient = extensionsWebApiClient;
        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<TenantExtensions>> GetConfigurattion()
        {
            var configuredTask = await _extensionsWebApiClient.GetExtensions();
            if (configuredTask.ResponseMessage.IsSuccessStatusCode)
            {
                return this.Single2(configuredTask.ReadAsSync());
            }
            if (configuredTask.ResponseMessage.StatusCode  == HttpStatusCode.NotFound)
            {
                return this.Single2(new TenantExtensions() );
            }
            throw configuredTask.ReadException();
        }

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<TenantExtensions>> UpdateConfiguration(TenantExtensions data)
        {
            var resp = await _extensionsWebApiClient.UpdateExtensions(data);
            if (resp.HasException)
            {
                throw resp.ReadException();
            }
            return await this.GetConfigurattion();
        }

    }
}