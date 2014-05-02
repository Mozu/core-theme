using System.Collections.Generic;
using System.Net;
using System.Runtime.Serialization.Json;
using System.Threading.Tasks;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.TempMocks;
using Mozu.SiteBuilder.UX.Models.Navigation;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    /// <summary>
    /// Repository to access the navigation metadocument in CMS.
    /// </summary>
    internal class NavigationRepository : INavigationRepository
    {
        private const string NAVIGATION_CONTENT_COLLECTION = "settings";
        private const string NAVIGATION_FILE_NAME = "navigation";

        private ICmsServiceWrapper _cmsService;
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public NavigationRepository(IDocumentListWebApiClient docWebApiClient, ICmsServiceWrapper cmsService, ISiteBuilderApiContext siteBuilderApiContext)
        {
            _cmsService = cmsService;
            _siteBuilderApiContext = siteBuilderApiContext;

            // TaskExtensions;
        }

        /// <summary>
        /// Gets the navigation set stored for the current site.
        /// </summary>
        public Task<IList<INavigationNode>> GetNavigationSetAsync()
        {
            return _cmsService.GetByPath2(NAVIGATION_CONTENT_COLLECTION, NAVIGATION_FILE_NAME)
                .ContinueWith(docResultIntermediate =>
                {
                    var serviceClientResponse = docResultIntermediate.Result;
                    // if the document doesn't exist, create it first.
                    if (serviceClientResponse != null && serviceClientResponse.ResponseMessage != null && serviceClientResponse.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                    {
                        var ns = new NavigationSet();
                        ns.Add(new SimpleRuntimeNavigationNode { Id = "page^^hi" });
                        var doc = CreateNavigationDocument(ns);
                        var res = new TestResponse<DC.Document>(doc);
                        return res.Task;
                    }

                    // otherwise, pass through the result.
                    return docResultIntermediate;
                })
                .Unwrap()
                .ContinueWith(docResult =>
                {
                    var res = docResult.Result;
                    string etag = res.ETag();
                    var doc = res.ReadAsSync();
                    var jsonString = doc.Get<string>("data");
                    if (!string.IsNullOrEmpty(jsonString))
                    {
                        var navset = Newtonsoft.Json.JsonConvert.DeserializeObject<NavigationSet>(jsonString);
                        navset.ETag = etag;
                        return navset;
                    }
                    else
                    {
                        IList<INavigationNode> navset = new NavigationSet();
                        return navset;
                    }
                });
        }

        private static DC.Document CreateNavigationDocument(NavigationSet set)
        {
            var doc = new DC.Document
                      {
                          Name = NAVIGATION_FILE_NAME,
                          DocumentType = "document",
                          DocumentListName = NAVIGATION_CONTENT_COLLECTION,
                          Properties = new List<DC.PropertyValue>()
                      };

            UpdateNavigationDocument(doc, set);
            return doc;
        }


        private static void UpdateNavigationDocument(DC.Document doc, NavigationSet set)
        {
            doc.Set("data", Newtonsoft.Json.JsonConvert.SerializeObject(set));
        }


        /// <summary>
        /// Saves the navigation set for the current site.
        /// </summary>
        public Task SaveSetAsync(IList<INavigationNode> set)
        {
            NavigationSet navset;
            if (set is NavigationSet)
            {
                navset = (NavigationSet)set;
            }
            else
            {
                navset = new NavigationSet();
                navset.AddRange(set);
            }

            return _cmsService.GetByPath2(NAVIGATION_CONTENT_COLLECTION, NAVIGATION_FILE_NAME)
                .ContinueWith(docResultIntermediate =>
                {
                    var doc = docResultIntermediate.Result.ReadAsSync();
                    if (doc == null)
                    {
                        doc = CreateNavigationDocument(navset);
                        return _cmsService.RawCreate2(doc);
                    }
                    else
                    {
                        UpdateNavigationDocument(doc, navset);
                        return _cmsService.Update2(doc);
                    }
                });
        }
    }
}
