using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using AutoMapper;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using System.Globalization;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.PublishSets;
using Mozu.SiteBuilder.UX.Admin.Helpers.DiscountHelpers;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.Core.Api.Contracts.Client;
using System.Net.Http;
using System.Web.Http;
using Mozu.Content.Contracts.Clients;
using Mozu.ScheduledEvent.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for publish sets.
	/// </summary>
    [WebApi("app/publishsets", SuppressDescriptorGeneration = true)]
    public class PublishSetController : BaseController
    {
        private readonly IDocumentPublishSetWebApiClient _cmsItemPublishingClient;
        private readonly IProductWebApiClient _productWebApiClient;
        private readonly Mozu.ProductAdmin.Contracts.Clients.IPublishingWebApiClient _productItemPublishingClient;
        private readonly Mozu.ScheduledEvent.Contracts.Clients.IPublishSetWebApiClient _publishSetWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public PublishSetController(
            Mozu.Content.Contracts.Clients.IDocumentPublishSetWebApiClient cmsItemPublishingClient,
            Mozu.ProductAdmin.Contracts.Clients.IProductWebApiClient productWebApiClient, 
           Mozu.ScheduledEvent.Contracts.Clients.IPublishSetWebApiClient publishSetWebApiClient,
            Mozu.ProductAdmin.Contracts.Clients.IPublishingWebApiClient productItemPublishingClient
            )
        {
            _cmsItemPublishingClient = cmsItemPublishingClient;
            _productWebApiClient = productWebApiClient;
            _publishSetWebApiClient = publishSetWebApiClient;
            _productItemPublishingClient = productItemPublishingClient;
        }

        /// <summary>
        /// Get a list of discounts.
        /// </summary>
        [HttpGetRoute(UriTemplate = "items/list")]
        public async Task<Response<List<PublishSetItem>>> ListItems([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, string code, string type)
        {
            
            if (type == null) throw new ArgumentNullException("type");
     
            if (code == null) throw new ArgumentNullException("code");

            if (string.Equals("cms", type, StringComparison.OrdinalIgnoreCase))
            {
                var res = (await _cmsItemPublishingClient.GetPublishSetItems(code: code, pageSize: pagingParams.pageSize, startIndex: pagingParams.startIndex).ConfigureAwait(false)).ReadAsSync();
                var returnItems = Mapper.Map<List<PublishSetItem>>(res.Items);

                var codes = res.Items.Select(x => x.PublishSetCode).Where(x => !string.IsNullOrEmpty(x)).Distinct().ToList();

                if (codes.Count > 0)
                {

                    var query = string.Join(" or ", codes.Select(x => string.Format("Code eq {0}", x)));
                    var resultSet = _publishSetWebApiClient.GetPublishSets(filter: query, pageSize: 100).Result.ReadAsSync();
                    foreach (var draft in returnItems)
                    {
                        var correctPublishSet = resultSet.Items.Where(x => x.Code == draft.PublishSetCode).FirstOrDefault();

                        if (correctPublishSet != null)
                        {
                            draft.PublishSetName = correctPublishSet.Name;
                            draft.PublishDate = correctPublishSet.PublishDate;
                        }

                    }
                }


                return List2(returnItems, (int)res.TotalCount);
            }
            else if ( string.Equals( "product", type, StringComparison.OrdinalIgnoreCase ))
            {
                extFilter.Add(new FilterCollectionItem() { property= "publishedstate", value = "Pending" });
                if (!string.Equals("all", code, StringComparison.OrdinalIgnoreCase)) {
                    extFilter.Add(new FilterCollectionItem() { property = "publishsetcode", value = code });
                }

                //sanatizing query stuff
                sanitizeProductSortQuery(pagingParams, "productdraft");

                var filter = ProductFilterExtensions.ToFilterString(extFilter, false);
                var q = extFilter.ToQString();
                var res = (await _productWebApiClient.GetProducts(
                    startIndex: pagingParams.startIndex, 
                    q: q, 
                    sortBy: pagingParams.sort.ToSortString(),
                    pageSize: pagingParams.pageSize, 
                    filter: filter).ConfigureAwait(false)).ReadAsSync();

                var returnItems = Mapper.Map<List<PublishSetItem>>(res.Items);

                var codes = res.Items.Select(x => x.PublishingInfo.PublishSetCode).Where(x => !string.IsNullOrEmpty(x)).Distinct().ToList();

                if (codes.Count > 0)
                {
                    var query = string.Join(" or ", codes.Select(x => string.Format("Code eq {0}", x)));
                    var resultSet = _publishSetWebApiClient.GetPublishSets(filter: query, pageSize: 100).Result.ReadAsSync();
                    foreach (var draft in returnItems)
                    {
                        var correctPublishSet = resultSet.Items.Where(x => x.Code == draft.PublishSetCode).FirstOrDefault();

                        if (correctPublishSet != null)
                        {
                            draft.PublishSetName = correctPublishSet.Name;
                            draft.PublishDate = correctPublishSet.PublishDate;
                        }
                        
                    }
                }

                return List2(returnItems, (int)res.TotalCount);
            }

            throw new NotImplementedException(type);

        }


        /// <summary>
        /// Get a list of discounts.
        /// </summary>
        [HttpPostRoute(UriTemplate = "items/create")]
        public async Task<Response<List<PublishSetItem>>> AddItems(List<PublishSetItem> items)
        {
            var type = items.First().Type ;
            var code = items.First().PublishSetCode;

            if (type == "cms")
            {
                var pubSetItems = items.Select(i => new Mozu.Content.Contracts.AddOrDeletePublishItem { DocumentId = i.Id, DocListFQN = i.ListFQN }).ToList(); 
                var res = (await _cmsItemPublishingClient.AddPublishSetItems(code: code, itemsToPublish: pubSetItems).ConfigureAwait(false)).ReadAsSync();
                return List2(items);
            }

            else if (type == "product")
            {
                var productPublishSet = new Mozu.ProductAdmin.Contracts.PublishSet {
                    Code = code,
                    ProductCodes = items.Select(x => x.Id).ToList()
                };

                var res = (await _productItemPublishingClient.AssignProductsToPublishSet (productPublishSet).ConfigureAwait(false)).ReadAsSync();

                return List2(items);
            }

            throw new NotImplementedException(type);

        }


        [HttpGetRoute(UriTemplate = "getBy/{id}")]
        public async Task<Response<List<Mozu.ScheduledEvent.Contracts.PublishSet>>> GetPublishSetById(string id)
        {
            var x = new PublishSet();
            var pub = (await _publishSetWebApiClient.GetPublishSet(id).ConfigureAwait(false)).ReadAsSync();

            return List2(pub);
        }

        /// <summary>
        /// Get a list of publish sets.
        /// </summary>
        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<PublishSet>>> ListPublishSets([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri]bool includeCounts = false, [FromUri]bool includeDynamic = false)
        {

            sanitizeProductSortQuery(pagingParams, "publishset");

            var result = (await _publishSetWebApiClient.GetPublishSets(
                startIndex: pagingParams.startIndex, 
                pageSize: pagingParams.pageSize, 
                sortBy: pagingParams.sort.ToSortString(),
                filter: null).ConfigureAwait(false)).ReadAsSync();


           var items = result.Items.Map <List<PublishSet>>();
            if (includeDynamic)
            {
                items.Add(new PublishSet()
                {
                    Code ="ALL",
                    Name = "All"
                });
                items.Add(new PublishSet()
                {
                    Code = "UNASSIGNED",
                    Name = "unassigned"
                });
            }
           // items.AddRange(tempstore);
            //todo call pub set service..
            if (includeCounts)
            {
                var cmsItemTask = _cmsItemPublishingClient.GetPublishSets();
                var productTask = _productItemPublishingClient.GetPublishSets();
                //todo call product pub sets

                await Task.WhenAll(cmsItemTask, productTask).ConfigureAwait(false);

                var cmsItems = cmsItemTask.Result.ReadAsSync();

                cmsItems.Items.ForEach(x =>
                {
                    var pubSet = items.FirstOrDefault(y => string.Equals(x.PublishSetCode, y.Code, StringComparison.OrdinalIgnoreCase));
                    if (pubSet == null)
                    {
                        //todo remove this?  shouldnt be a thing?
                        pubSet = new PublishSet()
                        {
                            Code = x.PublishSetCode
                        };

                        if (!string.Equals(pubSet.Code, "unassigned",StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(pubSet.Name))
                        {
                            items.Add(pubSet);
                        }
                        
                    }
                    pubSet.ContentCount = x.Count;
                });

                var prodItems = productTask.Result.ReadAsSync();

                prodItems.Items.ForEach(x =>
                {
                    var pubSet = items.FirstOrDefault(y => string.Equals(x.Code, y.Code, StringComparison.OrdinalIgnoreCase));
                    if (pubSet != null)
                    {
                        pubSet.ProductCount = x.ProductCount;
                    }
                });

            }

            return List2(Mapper.Map<List<PublishSet>>(items), result.TotalCount);
        
        }
       // static List<PublishSet> tempstore = new List<PublishSet>();
        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<PublishSet>>> CreatePublishSet(List<PublishSet> newPublishSet)
        {
            List<PublishSet> retList = new List<PublishSet>();
            foreach ( PublishSet pubSet in newPublishSet)
            {
                var toDc = pubSet.Map<Mozu.ScheduledEvent.Contracts.PublishSet>();

                var ret = (await _publishSetWebApiClient.AddPublishSet(toDc).ConfigureAwait(false)).ReadAsSync();

                retList.Add(ret.Map<PublishSet>());
        }
            return this.List2(retList);

        }

       
       
        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<PublishSet>>> UpdatePublishSet(List<PublishSet> newPublishSet)
        {
        

            List<PublishSet> retList = new List<PublishSet>();
            foreach (PublishSet pubSet in newPublishSet)
            {
                var toDc = pubSet.Map<Mozu.ScheduledEvent.Contracts.PublishSet>();

                var ret = (await _publishSetWebApiClient.UpdatePublishSet(toDc, toDc.Code).ConfigureAwait(false)).ReadAsSync();

                retList.Add(ret.Map<PublishSet>());
            }
            return this.List2(retList);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<PublishSet>>> DeletePublishSet(List<PublishSet> newPublishSet)
        {
            List<PublishSet> retList = new List<PublishSet>();
            foreach (PublishSet pubSet in newPublishSet)
            {
                var toDc = pubSet.Map<Mozu.ScheduledEvent.Contracts.PublishSet>();
            
                var resp = (await _publishSetWebApiClient.DeletePublishSet( toDc.Code).ConfigureAwait(false));
                if ( resp.HasException)
                {
                    throw resp.ReadException();
                }
                retList.Add(pubSet);
            }
            return this.List2(retList);
        }

        [HttpPostRoute(UriTemplate = "publishAll")]
        public async Task<Response<List<PublishSet>>> PublishAll(List<PublishSet> newPublishSetList)
        {
            var tasks = 
                newPublishSetList
               
                .Select(x => _publishSetWebApiClient.PublishPublishSet(x.Code ));

            var results = await Task.WhenAll(tasks).ConfigureAwait(false);

            foreach (ServiceClientResponse res in results)
            {
                if (res.HasException)
                {
                    throw res.ReadException();
                }
            }

            return this.List2(newPublishSetList);
        }

        public class DeletePublishSetObject
        {
            public string method { get; set; }
            public List<PublishSet> data { get; set; }
        }


        /// <summary>
        /// Delete method has option to discard all drafts or set them to unassigned
        /// 'method' is either unassign or discard
        /// </summary>
        [HttpPostRoute(UriTemplate = "deleteWithContent")]
        public async Task<Response<List<PublishSet>>> UnassignAll(DeletePublishSetObject deletedSet)
        {
            List<PublishSet> retList = new List<PublishSet>();
            var publishSetToDelete = deletedSet.data.First();
            var shouldDiscard = string.Equals(deletedSet.method, "discard");

            var tasks = new List<Task<ServiceClientResponse>>() {
                _publishSetWebApiClient.DeletePublishSet(publishSetToDelete.Code).ContinueWith(t=>t.Result as ServiceClientResponse),
                _productItemPublishingClient.DeletePublishSet(publishSetToDelete.Code, shouldDiscard).ContinueWith(t=>t.Result as ServiceClientResponse),
                _cmsItemPublishingClient.DeletePublishSet(publishSetToDelete.Code, shouldDiscard).ContinueWith(t=>t.Result as ServiceClientResponse)
            };

            var results = await Task.WhenAll(tasks).ConfigureAwait(false);

            foreach (ServiceClientResponse task in results)
            {
               if (task.HasException)
               {
                   throw task.ReadException();
               }
            }

            retList.Add(publishSetToDelete);
         
            return this.List2(retList);
        }

        private PagingParamaters sanitizeProductSortQuery(PagingParamaters pagingParams, string type)
        {
            if (pagingParams.sort.Count > 0)
            {
                if (type.Equals("productdraft"))
                {
                    var productCodeStort = pagingParams.sort.FirstOrDefault(x => x.property == "id");
                    var lastModifiedSort = pagingParams.sort.FirstOrDefault(x => x.property == "draftUpdateDate");

                    if (productCodeStort != null)
                    {
                        productCodeStort.property = "productcode";
                    }

                    if (lastModifiedSort != null)
                    {
                        lastModifiedSort.property = "updatedate";
                    }
                }

                else if (type.Equals("publishset"))
                {
                    var publishsetName = pagingParams.sort.FirstOrDefault(x => x.property == "name");

                    if (publishsetName != null)
                    {
                        publishsetName.property = "publishSetName";
                    }
                }
               
            }

            return pagingParams;
       }
    }
}
