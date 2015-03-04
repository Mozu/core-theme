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
    public class TaskHelper
    {
        public static void ThrowExceptionsIfAny<T>(IEnumerable<Task<ServiceClientResponse<T>>> taskResults)
        {
            var taskExceptions = taskResults.Where(taskResult => taskResult.Result.HasException);
            var exCount = taskExceptions.Count();
            if (exCount == 0)
                return;
            if (exCount == 1)
                throw taskExceptions.First().Result.ReadException();
            ThrowAccumulatedException(taskExceptions);
        }

        private static void ThrowAccumulatedException<T>(IEnumerable<Task<ServiceClientResponse<T>>> taskExceptions)
        {
            var sb = new StringBuilder();
            //var exceptions = new List<Exception>();
            foreach (var taskEx in taskExceptions)
            {
                var ex = taskEx.Result.ReadException();
                if (ex == null)
                    continue;
                //exceptions.Add(ex);
                sb.Append(ex.Message)
                    .Append("; ");
            }
            throw new VaeUnexpectedErrorException(sb.ToString(0, sb.Length - 2));
            //throw new AggregateException(sb.ToString(0, sb.Length - 2), exceptions);
        }
    }
}