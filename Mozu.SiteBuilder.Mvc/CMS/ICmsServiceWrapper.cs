using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Core.Api.Contracts.Client;
using AVM = Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public interface ICmsServiceWrapper
    {
        [Obsolete]
        IEnumerable<Task<ServiceClientResponse<DC.Document>>> Create(System.Collections.Generic.IEnumerable<Mozu.SiteBuilder.Mvc.Models.CMS.Admin.Document> docs);

        Task<ServiceClientResponse<DC.Document>> Create2(AVM.Document doc);

        [Obsolete]
        Task<ServiceClientResponse<DC.Document>> RawCreate(DC.Document doc);

        Task<ServiceClientResponse<DC.Document>> RawCreate2(DC.Document doc);

        [Obsolete]
        System.Collections.Generic.IEnumerable<System.Threading.Tasks.Task<Tuple<bool, Mozu.Core.Api.Contracts.Client.ServiceClientResponse<StreamContent>>>> Delete(System.Collections.Generic.IEnumerable<Mozu.SiteBuilder.Mvc.Models.CMS.Admin.Document> docs);

        Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(DC.Document document);

        [Obsolete]
        Task<ServiceClientResponse<DC.Document>> GetByPath(string contentCollection, string name, string folderPath = null, string docStatus = "draft");
        Task<ServiceClientResponse<DC.Document>> GetByPath2(string contentCollection, string name);

        [Obsolete]
        Task<ServiceClientResponse<DC.Document>> Get(string contentCollection, string id, bool activeVersion = true);

        Task<ServiceClientResponse<DC.Document>> Get2(string contentCollection, string id);

        [Obsolete]
        Task<Tuple<DC.FolderTree, ServiceClientResponse<DC.FolderTree>>> GetFolderTree(string collection, string parentId = null, int? levels = null);

        [Obsolete]
        Task<ServiceClientResponse<DC.PagedCollection<DC.Document>>> GetList(CmsListRequest request);

        [Obsolete]
        Task<ServiceClientResponse<DC.PagedCollection<DC.Document>>> GetList(string contentCollection = null, string filter = null, bool? recurseFolders = null, string status = null, string sortBy = null, int? pageSize=25, int? startIndex=0);

        Task<ServiceClientResponse<DC.PagedCollection<DC.Document>>> GetList2(string contentCollection = null, string filter = null, string sortBy = null, int? pageSize=25, int? startIndex=0);

        [Obsolete]
        Task<ServiceClientResponse<List<DC.Facet>>> GetFacets(string contentCollection,  string propertyName);

        [Obsolete]
        IEnumerable<Task<DC.Document>> Update(List<Mozu.SiteBuilder.Mvc.Models.CMS.Admin.Document> docs);

        [Obsolete]
        IEnumerable<Task<DC.Document>> Update(List<DC.Document> docs);

        [Obsolete]
        Task<DC.Document> Update(DC.Document doc);

        Task<ServiceClientResponse<DC.Document>> Update2(DC.Document document);

        [Obsolete]
        bool BypassCache { get; set; }
    }

    [Obsolete]
    public class CmsListRequest
    {
        public class CmsListRequestFilterItem
        {
            public string Name { get; set; }
            public object Value { get; set; }
            public string Operator { get; set; }
        }
        List<KeyValuePair<string, bool>> _sort;
        List<string> _filters;
        public string Collection{get;set;}
        public string DocumentType { get; set; }
        public bool HasFilters
        {
            get { return _filters != null && _filters.Count > 0; }
        }
        public bool HasSort
        {
            get { return _sort != null && _sort.Count > 0; }
        }


        public List<string> Filters
        {
            get
            {
                if (_filters == null)
                {
                    _filters = new List<string>();
                }
                return _filters;
            }
            set
            {
                _filters = value;
            }
        }
        public List<KeyValuePair<string, bool>> Sort
        {
            get
            {
                if (_sort == null)
                {
                    _sort = new List<KeyValuePair<string, bool>>();
                }
                return _sort;
            }
            set
            {
                _sort = value;
            }
        }

        public string FolderId { get; set; }
        public string FolderPath { get; set; }
           
        public string ToFilterString ()
        {
            if (!string.IsNullOrEmpty(FolderId))
            {
                this.Filters.Add("FolderId eq " + FolderId);
            }
            if (!string.IsNullOrEmpty(FolderPath))
            {
                this.Filters.Add(string.Format("Path eq \"{0}\"", FolderPath));
            }
            if (!string.IsNullOrEmpty(DocumentType))
            {
                this.Filters.Add("DocumentType eq " + DocumentType);
            }
            if (this.HasFilters)
            {
                return string.Join(" and ", this.Filters);
            }
            return null;
        }
        public int? PageSize{get;set;}
        public int? StartIndex{get;set;}
        public bool? Recurse { get; set; }

        internal string ToSortString()
        {
            if (this.HasFilters)
            {
               return string.Join(" and " , this.Sort.Select (x=> x.Key + " " + ( (x.Value )? "asc" :"desc")));
            }
            return null;
        }

        public string DocumentStatus { get; set; }
    }
}
