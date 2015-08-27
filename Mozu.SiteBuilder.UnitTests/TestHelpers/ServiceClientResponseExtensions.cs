using System.Threading.Tasks;
using Mozu.Core.Api.Contracts.Client;

namespace Mozu.SiteBuilder.UnitTests.Extensions
{
    public static class ServiceClientResponseExtensions
    {
        /// <summary>
        /// Wraps an object as the result of a Task<ServiceClientResponse<T>>.
        /// Ideal for mocking the return object of service clients.
        /// </summary>
        public static Task<ServiceClientResponse<T>> AsServiceClientResponseAsync<T>(this T response)
        {
            var serviceResult = new ServiceClientResponse<T> {
                HasException = false,
                ReadAsSync = () => response,
                ReadAsAsync = () => response.AsTaskResult()
            };

            return serviceResult.AsTaskResult();
        }

        /// <summary>
        /// Wraps an object in a TaskResult and returns the Task.
        /// </summary>
        public static Task<T> AsTaskResult<T>(this T wrapped)
        {
            var task = new TaskCompletionSource<T>();
            task.SetResult(wrapped);
            return task.Task;
        }
    }
}
