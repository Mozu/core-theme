

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Exceptions;
using Mozu.Core;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public static class UserHelper
    {
        public static bool IsFulfillerUserWithOrderAccess(this IApiContext _apiContext)
        {
            var IsFulfillerUser = _apiContext?.UserClaims?.Bag?.Any(x => x.Key.Equals("FulfillerOnly", StringComparison.OrdinalIgnoreCase) && x.Value.Equals("1")) ?? false;
            return IsFulfillerUser;
        }
    }
}