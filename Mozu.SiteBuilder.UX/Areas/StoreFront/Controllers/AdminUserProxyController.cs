using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core.Actions;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Session;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Models;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
    public class AdminUserProxyController : BaseApiController
    {
        IMultiScopeAdminUserWebApiClient _multiScopeAdminUserWebApiClient;
        public AdminUserProxyController(IMultiScopeAdminUserWebApiClient multiScopeAdminUserWebApiClient)
        {
            _multiScopeAdminUserWebApiClient = multiScopeAdminUserWebApiClient.CloneWithoutUserClaims();
        }

        /// <summary>
        /// Returning list of admin users based on userid's provided in the request. And returning only limited user's data because of security reasons.
        /// </summary>
        /// <param name="userIds">List of admin user Id's</param>
        /// <returns></returns>
        [HttpPost]
        [Route("adminusers/summaries")]
        public async Task<List<AdminUserSummary>> GetAdminUserSummaries([FromBody]List<string> userIds)
        {
            if (userIds.Count <= 0)
            {
                return null;
            }

            var startIndex = 0;
            var pageSize = 1;
            var pageCount = 0;

            var filter = string.Join(", ", userIds.Select(f => "'" + f + "'"));
            filter = "userid in [" + filter + "]";

            var results = new List<AdminUserSummary>();

            var users = (await _multiScopeAdminUserWebApiClient.GetUsers(startIndex: startIndex, pageSize: pageSize, filter: filter)).ReadAsSync();
            pageCount = users.PageCount;

            results.AddRange(Mapper.Map<List<AdminUserSummary>>(users.Items));

            for (var i = 1; i < pageCount; i++)
            {
                startIndex = pageSize * i;
                users = (await _multiScopeAdminUserWebApiClient.GetUsers(startIndex: startIndex, pageSize: pageSize, filter: filter)).ReadAsSync();
                results.AddRange(Mapper.Map<List<AdminUserSummary>>(users.Items));
            }

            return results;
        }
    }
}
