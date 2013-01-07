using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization.Json;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Document = Mozu.Content.Contracts.Document;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    public class NavigationRepository : INavigationRepository
    {
        private const string NavigationContentCollection = "settings";
        private const string NavigationFileName = "navigation2";
        

        private readonly IDocumentWebApiClient _docWebApiClient;
        private readonly ICmsServiceWrapper _cmsService;
        private readonly IStorefrontCache _cache;

        private readonly DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(NavigationSet), new[] { typeof(object), typeof(List<NavigationNode>), typeof(NavigationNode), typeof(string), typeof(int) });

        public NavigationRepository(IDocumentWebApiClient docWebApiClient, ICmsServiceWrapper cmsService , IStorefrontCache cache )
        {
            _docWebApiClient = docWebApiClient;
            _cmsService = cmsService;
            _cache = cache;
        }

        public virtual DataContractJsonSerializer Serializer
        {
            get { return serializer; }
        }

        public NavigationSet GetSet()
        {
            return ReadNavigation() ?? NavigationSet.Default;
        }

        public void SaveSet(NavigationSet set)
        {
            var docId = GetNavMetaDocumentId();

            UpdateNavigation(set, docId);
        }

        private void UpdateNavigation(NavigationSet navigation, string documentId)
        {
            using (var stream = new MemoryStream())
            {
                Serializer.WriteObject(stream, navigation);
                stream.Position = 0;
                using (var updateTask = _docWebApiClient.UpdateDocumentContent(NavigationContentCollection, documentId/*, stream*/))
                {
                    if (updateTask.Result.HasException)
                        throw updateTask.Result.ReadException();
                }
            }
        }



        private NavigationSet ReadNavigation()
        {
            try
            {
                var docId = GetNavMetaDocumentId();
                //var document = _docWebApiClient.FindByName(NavigationContentCollection, "navigation", null, null, CmsConstants.Documents.doc_state_active).Result.ReadAsSync();

                string key = typeof(NavigationSet) + docId;
                var set = _cache[key] as NavigationSet;
                if ( set != null )
                {
                    return set;
                }

                using (var content = _docWebApiClient.GetDocumentContent(NavigationContentCollection, docId).Result.ResponseMessage.Content)
                using (var stream = content.ReadAsStreamAsync().Result)
                {
                    stream.Position = 0;
                    set = Serializer.ReadObject(stream) as NavigationSet;

                    if (set == null || set.Nodes == null)
                    {
                        set = NavigationSet.Default;
                        UpdateNavigation(set, docId);
                    }
                    _cache[key] = set;
                    return set;
                }
            }
            catch (AggregateException)
            {
                // Collection might not exist yet
                //LoggingService.LoggerFor<NavigationSetApi>().Warn("ReadNavigation", ex.UnwrapAgg()); // TODO: Should this be logged?
                return null;
            }
        }

        string _docId;

        public string GetNavMetaDocumentId()
        {
            if (_docId == null)
            {
                var document =
                    _cmsService.GetByPath(NavigationContentCollection, NavigationFileName, null).Result.ReadAsSync();

                if (document == null)
                {
                    document = new Document
                                      {
                                          Name = NavigationFileName,
                                          DocumentType = "document",
                                          ContentCollection = NavigationContentCollection,
                                      };

                    var response = _docWebApiClient.Create(document.ContentCollection, document).Result;

                    if (response.HasException)
                    {
                        var ex = response.ReadException();
                        throw ex;
                    }

                    if (response.ResponseMessage.IsSuccessStatusCode)
                    {
                        document = response.ReadAsSync();
                        return _docId = document.Id;
                    }

                    return null;
                }
            }
            return _docId;
        }
    }
}