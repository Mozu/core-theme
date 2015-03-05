using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Exceptions;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public static class TaskHelper
    {
        public static T Result<T>(Task<T> task)
        {
            return task.Result;
        }
    }
}