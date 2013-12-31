using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization.Json;
using System.Threading.Tasks;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.TempMocks;
using Mozu.SiteBuilder.UX.Models.Navigation;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    public class NavigationRepository : INavigationRepository
    {
        private const string NavigationContentCollection = "settings";
        private const string NavigationFileName = "navigation";

        private ICmsServiceWrapper _cmsService;
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;
        private readonly DataContractJsonSerializer _serializer = new DataContractJsonSerializer(typeof (NavigationSet), new[] {typeof (object), typeof (List<NavigationNode>), typeof (NavigationNode), typeof (string), typeof (int)});

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
        public Task<NavigationSet> GetSetAsync()
        {



            return _cmsService.GetByPath2(NavigationContentCollection, NavigationFileName)
                .ContinueWith(docResultIntermediate =>
                {
                    var serviceClientResponse = docResultIntermediate.Result;
                    // if the document doesn't exist, create it first.
                    if (serviceClientResponse != null && serviceClientResponse.ResponseMessage != null && serviceClientResponse.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                    {
                        var doc = CreateNavigationDocument(new NavigationSet());
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
                    return new NavigationSet() { ETag = etag };
                });
        }

        private static DC.Document CreateNavigationDocument(NavigationSet set)
        {
            var doc = new DC.Document
                      {
                          Name = NavigationFileName,
                          DocumentType = "document",
                          DocumentListName = NavigationContentCollection,
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
        public Task SaveSetAsync(NavigationSet set)
        {
            return _cmsService.GetByPath2(NavigationContentCollection, NavigationFileName)
                .ContinueWith(docResultIntermediate =>
                {
                    var doc = docResultIntermediate.Result.ReadAsSync();
                    if (doc == null)
                    {
                        doc = CreateNavigationDocument(set);
                        return _cmsService.RawCreate2(doc);
                    }
                    else
                    {
                        UpdateNavigationDocument(doc, set);
                        return _cmsService.Update2(doc);


                    }

                });


        }
    }
}
