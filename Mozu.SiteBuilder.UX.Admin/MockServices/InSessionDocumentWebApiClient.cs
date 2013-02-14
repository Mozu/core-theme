using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Caching;
using AutoMapper;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.MockServices
{
    public interface IMoreAwesomeDocumentWebApiClient : IDocumentWebApiClient
    {
        bool IsAwesome { get; }
    }

    /// <summary>
    /// Mocks IProductWebApiClient to store Published documents in the current session.
    /// </summary>
    public class InSessionDocumentWebApiClient : IMoreAwesomeDocumentWebApiClient
    {
        private IApiContext _ctx;
        private ICookieProvider _cookieMonster;

        private const string COOKIE_NAME = "published_ids";
        private const string MOCK_0_NAME = "Hey Zetlen";

        private List<Document> _mocks = new List<Document>
        {
            new Document {
                Name = MOCK_0_NAME,
                Id = "b69564d8-9211-46f3-99b3-b020a20afa4c",
                Items = new List<DocumentProperty> {
                    new DocumentProperty {
                        Key = "title",
                        Value = MOCK_0_NAME
                    },
                    new DocumentProperty {
                        Key = "meta_title",
                        Value = MOCK_0_NAME
                    },
                    new DocumentProperty {
                        Key = "page_type_definition",
                        Value = "blank_page1"
                    }
                }
            }
        };
        
        /// <summary>
        /// Implements IMoreAwesomeDocumentWebApiClient
        /// </summary>
        public bool IsAwesome { get { return true; } }

        /// <summary>
        /// List of ids already "published".
        /// </summary>
        private List<string> PublishedIds
        {
            get
            {
                HttpCookie oldCookie = _cookieMonster.GetRequestCookie(COOKIE_NAME);

                if (oldCookie != null && !String.IsNullOrEmpty(oldCookie.Value))
                {
                    return oldCookie.Value.Split(';').ToList();
                }
                else
                {
                    return new List<string>();
                }
            }
        }

        /// <summary>
        /// Public constructor.
        /// </summary>
        public InSessionDocumentWebApiClient(IApiContext ctx, ICookieProvider cookieMonster)
        {
            _ctx = ctx;
            _cookieMonster = cookieMonster;
        }

        /// <summary>
        /// Get list of drafts.
        /// </summary>
        public Task<ServiceClientResponse<DC.PagedCollection<DC.Document>>> GetDrafts(string documentListName, string responseGroups = "", int? pageSize = null, int? startIndex = null, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            IEnumerable<Document> filteredMocks =
                from d in _mocks
                where !PublishedIds.Contains(d.Id)
                select d;

            List<DC.Document> mappedMocks = Mapper.Map<List<DC.Document>>(filteredMocks);
            var ret = new DC.PagedCollection<DC.Document> { TotalCount = mappedMocks.Count, Items = mappedMocks };

            return (new TestResponse<DC.PagedCollection<DC.Document>>(ret)).Task;
        }

        /// <summary>
        /// Publish one or more documents.
        /// </summary>
        public Task<ServiceClientResponse<List<string>>> PublishDocuments(string documentListName, List<string> documentIds, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            List<string> newPublishedIds = new List<string>();
            newPublishedIds.AddRange(PublishedIds);
            newPublishedIds.AddRange(documentIds);

            HttpCookie newCookie = new HttpCookie(COOKIE_NAME, String.Join(";", newPublishedIds));
            _cookieMonster.SaveResponseCookie(COOKIE_NAME, newCookie);

            return (new TestResponse<List<string>>(documentIds)).Task;
        }

        #region shit i'm not implementing
        public Task<ServiceClientResponse<Content.Contracts.Document>> Create(string documentListName, Content.Contracts.Document document, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> Delete(string documentListName, string documentId, string version = null, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<string>>> Discard(string documentListName, List<string> documentIds, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<Content.Contracts.Document>> FindByName(string documentListName, string documentName, string folderPath = null, string version = null, string status = null, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<Content.Contracts.Document>> Get(string documentListName, string documentId, string version = null, string status = null, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> GetDocumentContent(string documentListName, string documentId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> GetDocumentContentHead(string documentListName, string documentId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<Content.Contracts.PagedCollection<Content.Contracts.DocumentVersionSummary>>> GetVersions(string documentListName, string documentId, int? pageSize = null, int? startIndex = null, string sort = null, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<Content.Contracts.PagedCollection<Content.Contracts.Document>>> List(string documentListName, string filter = null, string responseGroups = null, bool? shouldRecurseFolders = null, string status = null, string sortBy = null, int? pageSize = null, int? startIndex = null, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<Content.Contracts.Document>> Move(string documentListName, string documentId, string folderPath = null, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> Publish(string documentListName, string documentId, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<Content.Contracts.Document>> Update(string documentListName, string documentId, Content.Contracts.Document document, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> UpdateDocumentContent(string documentListName, string documentId, System.IO.Stream stream, Core.Api.Contracts.TargetContextLevelType targetContextLevel = Core.Api.Contracts.TargetContextLevelType.NotSpecified)
        {
            throw new NotImplementedException();
        }

        public IServiceClientMessageHandler Handler
        {
            get
            {
                throw new NotImplementedException();
            }
            set
            {
                throw new NotImplementedException();
            }
        }

        public ConfigOptions Options
        {
            get
            {
                throw new NotImplementedException();
            }
            set
            {
                throw new NotImplementedException();
            }
        }
    }
#endregion
}