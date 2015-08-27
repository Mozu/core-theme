using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Core.Api.Contracts.Client;
using NSubstitute;

namespace Mozu.SiteBuilder.IntegrationTests
{
    public static class WebApiClientTestExtensions
    {
        public static TEntity With<TTasker, TEntity>(this TTasker self, Func<TTasker, Task<TEntity>> func, TEntity entity)
        {
            func(self).Returns(Task<TEntity>.Factory.StartNew(() => entity));
            return entity;
        }

        public static TEntity WithAny<TTasker, TEntity>(this TTasker self, Func<TTasker, Task<TEntity>> func, TEntity entity)
        {
            func(self).ReturnsForAnyArgs(Task<TEntity>.Factory.StartNew(() => entity));
            return entity;
        }

        public static TEntity With<TClient, TEntity>(this TClient self, Func<TClient, Task<ServiceClientResponse<TEntity>>> func, TEntity entity)
        {
            var testResponse = new TestResponse<TEntity>(entity);
            func(self).Returns(testResponse.Task);
            return entity;
        }

        public static IEnumerable<TEntity> With<TClient, TEntity>(this TClient self, Func<TClient, Task<ServiceClientResponse<TEntity>>> func, params TEntity[] entities)
        {
            Task<ServiceClientResponse<TEntity>>[] tasks = entities.Select(e => new TestResponse<TEntity>(e).Task).ToArray();
            func(self).Returns(tasks.First(), tasks.Skip(1).ToArray());
            return entities;
        }

        public static TEntity WithAny<TClient, TEntity>(this TClient self, Func<TClient, Task<ServiceClientResponse<TEntity>>> func, TEntity entity, Action<HttpResponseMessage> responseMessageAction = null)
        {
            var testResponse = new TestResponse<TEntity>(entity);
            if (responseMessageAction != null)
            {
                responseMessageAction(testResponse.ResponseMessage);
            }
            func(self).ReturnsForAnyArgs(testResponse.Task);
            return entity;
        }

        public static TException WithException<TClient, TEntity, TException>(this TClient self, Func<TClient, Task<ServiceClientResponse<TEntity>>> func, TException exception, Action<HttpResponseMessage> responseMessageAction = null) where TException : Exception
        {
            var testResponse = new TestResponse<TEntity>(default(TEntity))
                               {
                                   ReadException = () => exception,
                                   HasException = exception != null
                               };
            if (responseMessageAction != null)
            {
                responseMessageAction(testResponse.ResponseMessage);
            }
            func(self).Returns(testResponse.Task);
            return exception;
        }

        public static void ThrowsAny<TClient, TEntity>(this TClient self, Func<TClient, Task<ServiceClientResponse<TEntity>>> func, Exception exception)
        {
            func(self).ReturnsForAnyArgs(_ => { throw exception; });
        }

        public static void Throws<TClient, TEntity>(this TClient self, Func<TClient, Task<ServiceClientResponse<TEntity>>> func, Exception exception)
        {
            func(self).Returns(_ => { throw exception; });
        }
    }
}