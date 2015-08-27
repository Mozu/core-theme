using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Api.Contracts.Client;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    /// <summary>
    /// A convenience class to aide in dealing with mapping collections that are contained within Tasks.
    /// </summary>
    /// <typeparam name="TClient">The type used in the SiteBuilder API.</typeparam>
    /// <typeparam name="TServer">The type used by the Mozu services API.</typeparam>
    public class CollectionTaskUnMapper<TClient, TServer>
    {
        /// <summary>
        /// This method will Map a collection of SiteBuilder (TClient) objects into a collection of Mozu service contract objects (TServer),
        /// perform an action, then map back to the SiteBuilder (TClient) type. Since a query expression or iterator cannot use await
        /// (because of blocking), this helps get around that problem.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="collection">A collection of SiteBuilder objects.</param>
        /// <param name="action">The action to be performed.</param>
        /// <returns>A Task of Enumerable objects from the SiteBuilder API.</returns>
        public async Task<IEnumerable<TClient>> PerformAction<T>(IEnumerable<TClient> collection, Func<TServer, Task<ServiceClientResponse<T>>> action)
        {
            var tasks = from item in collection.Select(x => Mapper.Map<TServer>(x))
                             let res = action(item)
                             select res.Result.ReadAsAsync();

             return from attr in await Task.WhenAll(tasks).ConfigureAwait(false)
                   select Mapper.Map<TClient>(attr);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="collection">A collection of SiteBuilder objects.</param>
        /// <param name="action">The action to be performed.</param>
        /// <returns>The StreamContent results from void actions performed on the server.</returns>
        public async Task<IEnumerable<TClient>> PerformVoidAction(IEnumerable<TClient> collection, Func<TServer, Task<ServiceClientResponse<StreamContent>>> action)
        {
            var tasks = from item in collection.Select(x => Mapper.Map<TServer>(x))
                        let res = action(item)
                        select res.Result.ReadAsAsync();

            await Task.WhenAll(tasks).ConfigureAwait(false);

            return collection;
        }

        public async Task<IEnumerable<TClient>> PerformAction<T>(IEnumerable<TClient> collection, Func<TServer, TClient, Task<ServiceClientResponse<T>>> action)
        {
            var things = collection.Select(x => new {Server = Mapper.Map<TServer>(x), Client = x});

            var tasks = from item in things
                        let res = action(item.Server, item.Client)
                        select res.Result.ReadAsAsync();

            return from attr in await Task.WhenAll(tasks).ConfigureAwait(false)
                   select Mapper.Map<TClient>(attr);
        }
    }
}