using System;
using System.Net.Http;
using Mozu.Core.Api.Contracts.Client;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
namespace Mozu.SiteBuilder.Mvc.CMS
{
    public interface ICmsServiceWrapper
    {
        IEnumerable<Task<ServiceClientResponse<Mozu.Content.Contracts.Document>>> Create(System.Collections.Generic.IEnumerable<Mozu.SiteBuilder.Mvc.Models.CMS.Admin.Document> docs);

   

        Task<ServiceClientResponse<Mozu.Content.Contracts.Document>> RawCreate(Mozu.Content.Contracts.Document doc);
        System.Collections.Generic.IEnumerable<System.Threading.Tasks.Task<Tuple<bool, Mozu.Core.Api.Contracts.Client.ServiceClientResponse<StreamContent>>>> Delete(System.Collections.Generic.IEnumerable<Mozu.SiteBuilder.Mvc.Models.CMS.Admin.Document> docs);
        System.Threading.Tasks.Task<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<Mozu.Content.Contracts.Document>> GetByPath(string contentCollection, string name, string folderPath = null, string docStatus = "draft");

        Task<ServiceClientResponse<Mozu.Content.Contracts.Document>> Get(string contentCollection, string id, bool activeVersion = true);
        Task<Tuple<Mozu.Content.Contracts.FolderTree, ServiceClientResponse<Mozu.Content.Contracts.FolderTree>>> GetFolderTree(string collection, string parentId = null, int? levels = null);

        System.Threading.Tasks.Task<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<Mozu.Content.Contracts.PagedCollection<Mozu.Content.Contracts.Document>>> GetList(CmsListRequest request);
        System.Threading.Tasks.Task<Mozu.Core.Api.Contracts.Client.ServiceClientResponse<Mozu.Content.Contracts.PagedCollection<Mozu.Content.Contracts.Document>>> GetList(string contentCollection = null, string filter = null, bool? recurseFolders = null, string status = null, string sortBy = null, int? pageSize=25, int? startIndex=0);


        Task<ServiceClientResponse<List<Mozu.Content.Contracts.Facet>>> GetFacets(string contentCollection,  string propertyName);

        IEnumerable<Task<Mozu.Content.Contracts.Document>> Update(List<Mozu.SiteBuilder.Mvc.Models.CMS.Admin.Document> docs);

        IEnumerable<Task<Mozu.Content.Contracts.Document>> Update(List<Mozu.Content.Contracts.Document> docs);
        Task<Mozu.Content.Contracts.Document> Update(Mozu.Content.Contracts.Document doc);





        bool BypassCache { get; set; }
    }
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
