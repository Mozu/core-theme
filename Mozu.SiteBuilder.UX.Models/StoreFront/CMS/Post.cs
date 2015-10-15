//// -----------------------------------------------------------------------
//// <copyright file="Post.cs" company="Microsoft">
//// TODO: Update copyright text.
//// </copyright>
//// -----------------------------------------------------------------------

//namespace Mozu.SiteBuilder.Mvc.Models.CMS
//{
//    using System;
//    using System.Collections.Generic;
//    using System.Linq;
//    using System.Text;
    
//    using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
//    using Mozu.SiteBuilder.UX.Models;

//    /// <summary>
//    /// TODO: Update summary.
//    /// </summary>
//    public class Post : CmsDocumentBase
//    {
//        public Post(ICmsTypeHelper typeHelper, IEditableContext context)
//            : base(typeHelper, context)
//        {
           
//        }

//        public string author
//        {
//            get;
//            set;
//        }
//        public string url
//        {
//            get { return "/blogs/" + this.Name; }
//        }
//        public DateTime? date
//        {
//            get { return this.InsertDate; }
//        }
//        string _teaser;
//        public string teaser
//        {
//            get
//            {
//                if (_teaser == null)
//                {
//                    var bod = (string)this["body"];
//                    _teaser = CreateTeaser(bod, 50);

//                }
//                return _teaser;
//            }
//        }
//        static string CreateTeaser(string src, int wordCount)
//        {
//            if (src == null)
//            {
//                return src;
//            }
//            var tmp = StripTagsCharArray(src);

//            int wsIdx = 0;
//            int countedWords = 0;
//            for (int idx = 0; idx < src.Length; idx++)
//            {
//                var twds = tmp.IndexOf(' ', wsIdx+1);
//                if (twds == wsIdx + 1)
//                {
//                    wsIdx = twds;
//                    continue;
//                }
//                wsIdx = twds;
//                countedWords++;
//                if (countedWords >= wordCount)
//                {
//                    break;
//                }

//            }
//            return wsIdx < tmp.Length ? tmp : tmp.Substring(0, wsIdx);
//        }

//        static string StripTagsCharArray(string source)
//        {
//            char[] array = new char[source.Length];
//            int arrayIndex = 0;
//            bool inside = false;

//            for (int i = 0; i < source.Length; i++)
//            {
//                char let = source[i];
//                if (let == '<')
//                {
//                    inside = true;
//                    continue;
//                }
//                if (let == '>')
//                {
//                    inside = false;
//                    continue;
//                }
//                if (!inside)
//                {
//                    array[arrayIndex] = let;
//                    arrayIndex++;
//                }
//            }
//            return new string(array, 0, arrayIndex);
//        }

//    }
    
//    public class Blog : CmsDocumentBase
//    {
//        public Blog(ICmsTypeHelper typeHelper, IEditableContext context)
//            : base(typeHelper, context)
//        {

//        }

//        public dynamic config
//        {
//            get { return this["page_configuration"] ?? CmsDocumentBase.EmptyProperty; }
//        }
        
//        public List<Post> posts { get; set; }

//        public List<Facet> Tags { get; set; }
//    }
//}
