using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Runtime.Serialization.Json;
using System.Threading.Tasks;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Models.Navigation;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    public class NavigationRepository : INavigationRepository
    {
        private const string NavigationContentCollection = "settings";
        private const string NavigationFileName = "navigation2";
        private IDocumentWebApiClient _docWebApiClient;
        private ICmsServiceWrapper _cmsService;
        private readonly DataContractJsonSerializer _serializer = new DataContractJsonSerializer(typeof(NavigationSet), new[] { typeof(object), typeof(List<NavigationNode>), typeof(NavigationNode), typeof(string), typeof(int) });
        
        /// <summary>
        /// Public constructor.
        /// </summary>
        public NavigationRepository(IDocumentWebApiClient docWebApiClient, ICmsServiceWrapper cmsService)
        {
            _docWebApiClient = docWebApiClient;
            _cmsService = cmsService;

            // TaskExtensions;
        }

        /// <summary>
        /// Gets the navigation set stored for the current site.
        /// </summary>
        public Task<NavigationSet> GetSetAsync()
        {
            // retrieve the document id
            Task<NavigationSet> set = 
                _cmsService.GetByPath2(NavigationContentCollection, NavigationFileName)
                .ContinueWith(docResultIntermediate =>
                {
                    var serviceClientResponse = docResultIntermediate.Result;
                    // if the document doesn't exist, create it first.
                    if (serviceClientResponse != null && serviceClientResponse.ResponseMessage != null && serviceClientResponse.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                    {
                        var doc = new DC.Document
                        {
                            Name = NavigationFileName,
                            DocumentType = "document",
                            DocumentListName = NavigationContentCollection,
                        };
                        
                        return _docWebApiClient.Create(doc.DocumentListName, doc);
                    }

                    // otherwise, pass through the result.
                    return docResultIntermediate;
                })
                .Unwrap()
                .ContinueWith(docResult => 
                {
                    var doc = docResult.Result.ReadAsSync();
                    // retrieve the document content
                    return _docWebApiClient.GetDocumentContent(doc.DocumentListName, doc.Id);
                })
                .Unwrap()
                .ContinueWith(content =>
                {
                    return content.Result.ResponseMessage.Content.ReadAsStreamAsync();
                })
                .Unwrap()
                .ContinueWith(contentstream =>
                {
                    using (var stream = contentstream.Result)
                    {
                        stream.Position = 0;

                        try
                        {
                            return _serializer.ReadObject(stream) as NavigationSet;
                        }
                        catch
                        {
                            // fuck the world
                            return null;
                        }
                        //if (set == null || set.Nodes == null)
                        //{
                        //    set = NavigationSet.Default;
                        //    UpdateNavigation(set, docId);
                        //}
                    }
                });
            
            return set;
        }

        /// <summary>
        /// Saves the navigation set for the current site.
        /// </summary>
        public Task SaveSetAsync(NavigationSet set)
        {
            return 
                _cmsService.GetByPath2(NavigationContentCollection, NavigationFileName)
                .ContinueWith(r =>
                {
                    var doc = r.Result.ReadAsSync();
                    return SaveSetInternal(set, doc.Id);
                });
        }

        private Task SaveSetInternal(NavigationSet set, string docId)
        {
            var stream = new MemoryStream();
            _serializer.WriteObject(stream, set);
            stream.Position = 0;

            var task = _docWebApiClient.UpdateDocumentContent(NavigationContentCollection, docId, stream);

            return task;
        }
    }
}
