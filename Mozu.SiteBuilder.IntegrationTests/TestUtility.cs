using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using UserScope = Mozu.Core.UserScope;

namespace Mozu.SiteBuilder.IntegrationTests
{
    public class TestUtility
    {
        public static UserAuthTicket GetAuthTicket(ISettings settings, UserScope userScope, string email, string pw = "Volusion1!")
        {
            var apiContext = GetApiContext(userScope);
            IServiceClientMessageHandler externalHandler = new ServiceClientMessageHandler(apiContext, settings);
            var authTicketClient = new MultiScopeAdminAuthTicketWebApiClient(externalHandler);
            var result = authTicketClient.CreateUserAuthTicket(
                    new UserAuthInfo()
                        {
                            EmailAddress = email,
                            Password = pw
                        },
                    userScope.Type.ToString(), userScope.Id)
               .Result.ReadAsSync();
            return result;
        }

        #region Privates

        protected static IApiContext GetApiContext(UserScope userScope, bool useAnonymousUser = false, string appId = "4604378B-073A-4D51-86C2-BA4CBADD64D4")
        {
            var userclaims = LightweightUserClaims
                .CreateForAdminUser(Guid.NewGuid().ToString("N"), new int[0], userScope, DateTime.Now.AddDays(3));

            var result = CreateApiContext(appId, userclaims);

            //PutScopeIntoBag(userScope, userclaims, result);
            return result;
        }

        //public static void PutScopeIntoBag(UserScope userScope, LightweightUserClaims userclaims, ApiContext apiContext)
        //{
        //    switch (userScope.Name)
        //    {
        //        case "Tenant":
        //            UpsertBag(userclaims, "TenantId", userScope);
        //            apiContext.TenantId = (userScope.Id.HasValue) ? userScope.Id.Value : -1;
        //            break;
        //        case "Developer":
        //            UpsertBag(userclaims, "DevAccountId", userScope);
        //            break;
        //    }
        //}

        //public static void UpsertBag(LightweightUserClaims userClaims, string key, UserScope userScope)
        //{
        //    if (userClaims.Bag.ContainsKey(key))
        //    {
        //        userClaims.Bag[key] = userScope.Id.ToString();
        //    }
        //    else
        //    {
        //        userClaims.Bag.Add(key, userScope.Id.ToString());
        //    }
        //    userClaims.ScopeType = userScope.Type;
        //}

        public static ApiContext CreateApiContext(string appId, LightweightUserClaims userclaims)
        {
            var result = new ApiContext
            {
                CurrencyCode = "USD",
                LocaleCode = "en-US",
                UserClaims = userclaims,
                AppClaims = LightweightAppClaims.CreateForApp(appId, new int[] { })
            };
            return result;
        }

        #endregion
    }
}