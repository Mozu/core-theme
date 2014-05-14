using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NSubstitute;
using NSubstitute.Core;
using Mozu.Core.Api.Contracts.Client;

namespace Mozu.SiteBuilder.UnitTests.Extensions
{
    public static class NSubstituteExtensions
    {
        public static Task<ServiceClientResponse<T>> AsServiceClientResponseAsync<T>(this T response)
        {
            var serviceResult = Substitute.For<ServiceClientResponse<T>>();
            serviceResult.HasException.Returns(false);
            serviceResult.ReadAsSync().Returns(response);
            serviceResult.ReadAsAsync().Returns(_ => { var t = new TaskCompletionSource<T>(); t.SetResult(response); return t.Task; });

            var task = new TaskCompletionSource<ServiceClientResponse<T>>();
            task.SetResult(serviceResult);
            return task.Task;
        }
    }
}
