using System;
using Mozu.SiteBuilder.UX.Models;

namespace Mozu.SiteBuilder.Mvc
{
    public class SearchContext : ModelBase, ISearchContext
    {
        string _query;
        int _catId;
        bool _init;
        Lazy<System.Web.HttpContextBase> _ctx;

        public SearchContext(Lazy<System.Web.HttpContextBase> ctx)
        {
            _ctx = ctx;

        }

        void Init()
        {
            if (!_init)
                return;
            _init = true;

            var ctx = _ctx.Value;
            Query = ctx.Request["query"];
            int catId;
            if (int.TryParse(ctx.Request["categoryId"], out catId))
            {
                CategoryId = catId;
            }
            else
            {
                CategoryId = -1;
            }
        }
        public string Query
        {
            get
            {
                Init();
                return _query;
            }
            set
            {
                _query = value;
            }
        }
        public int CategoryId
        {
            get
            {
                Init();
                return _catId;
            }
            set
            {
                _catId = value;
            }
        }
    }
}
