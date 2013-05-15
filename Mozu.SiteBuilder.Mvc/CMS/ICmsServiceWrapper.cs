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
        Task<ServiceClientResponse<DC.Document>> Create2(AVM.Document doc);

        Task<ServiceClientResponse<DC.Document>> RawCreate2(DC.Document doc);

        Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(DC.Document document);

        Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(string documentListName, string documentId);

        Task<ServiceClientResponse<DC.Document>> GetByPath2(string contentCollection, string name, string status=null);

        Task<ServiceClientResponse<DC.Document>> Get2(string contentCollection, string id);

        Task<ServiceClientResponse<DC.PagedCollection<DC.Document>>> GetList2(string contentCollection = null, string filter = null, string sortBy = null, int? pageSize=25, int? startIndex=0);

        [Obsolete]
        Task<Tuple<DC.FolderTree, ServiceClientResponse<DC.FolderTree>>> GetFolderTree(string collection, string parentId = null, int? levels = null);

        [Obsolete]
        Task<ServiceClientResponse<List<DC.Facet>>> GetFacets(string contentCollection,  string propertyName);

        Task<ServiceClientResponse<DC.Document>> Update2(AVM.Document document);
        Task<ServiceClientResponse<DC.Document>> Update2(DC.Document document);
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
