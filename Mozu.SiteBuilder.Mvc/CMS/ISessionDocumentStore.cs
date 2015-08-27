//// -----------------------------------------------------------------------
//// <copyright file="SessionBackedCmsClient.cs" company="Microsoft">
//// TODO: Update copyright text.
//// </copyright>
//// -----------------------------------------------------------------------

//using Mozu.Content.Contracts;

//namespace Mozu.SiteBuilder.Mvc.CMS
//{
//    using System;
//    using System.Collections.Generic;
//    using System.Linq;
//    using System.Text;
//    using Mozu.Core.Api.Contracts.Client;
//    using Mozu.SiteBuilder.Mvc.Models.CMS;

//    /// <summary>
//    /// TODO: Update summary.
//    /// </summary>
    
//    public interface  ISessionDocumentStore
//    {
//        Document Get(string id, string collection);
//        void Put(Document d);
//        IEnumerable<Document> GetAll();
//        void Flush();
//        void Start();
//    }

//    public class SessionDocumentStore : ISessionDocumentStore , IEqualityComparer<Document >
//    {
//        System.Web.HttpContextBase _ctx;
//        HashSet <Document> _docs;
//        SessionDocumentStore ( System.Web.HttpContextBase ctx)
//        {
//            _ctx = ctx;
//            _docs = (HashSet<Document>)_ctx.Session["SessionDocumentStore"];

//        }
//        public Document Get(string id, string collection)
//        {
//            if (_docs == null)
//                return null;
//            return _docs.FirstOrDefault(x => x.Id.Equals(id, StringComparison.OrdinalIgnoreCase) && x.Collection.Equals(collection, StringComparison.OrdinalIgnoreCase));
           
//        }
       

//        public void Put(Document d)
//        {
//            if (_docs == null)
//            {
//                _ctx.Session["SessionDocumentStore"] = _docs = new HashSet<Document>(this);
//            }

//            _docs.Add(d);
//        }

//        public IEnumerable<Document> GetAll()
//        {
//            if (_docs == null)
//            {
//                return Enumerable.Empty<Document>();
//            }
//            return _docs;
//        }

//        public void Flush()
//        {
//            if (_docs == null)
//            {
//                return;
//            }
//            _docs.Clear();
//        }

//        public void Start()
//        {
//            if (_docs == null)
//            {
//                return;
//            }
//            _docs.Clear();
//        }

//        bool IEqualityComparer<Document>.Equals(Document x, Document y)
//        {
//            if (x == null && y == null)
//            {
//                return true;
//            }
//            if ((x == null && y != null) || (y == null && x != null))
//            {
//                return false;
//            }
//            return x.Collection.Equals( y.Collection, StringComparison.OrdinalIgnoreCase) && x.Id.Equals(y.Id, StringComparison.OrdinalIgnoreCase );
//        }

//        int IEqualityComparer<Document>.GetHashCode(Document obj)
//        {
//            if (obj == null)
//                return 1;
//            return obj.Id.GetHashCode() * obj.Collection.GetHashCode();
//        }
//    }
//}
