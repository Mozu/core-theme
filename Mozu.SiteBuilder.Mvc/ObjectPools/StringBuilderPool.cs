using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.ObjectPools
{
    public class StringBuilderPool : ObjectPool<StringBuilder>
    {
        private static StringBuilderPool _default;
        private static object lockObj = new object();
        public static StringBuilderPool Default
        {
            get
            {
                if (_default == null)
                {
                    lock (lockObj)
                    {
                        if (_default == null)
                        {
                            var def = new StringBuilderPool()
                                      {
                                          MaxCapacity = 2000,
                                          DefaultInstanceFactory = () => new StringBuilder(8000),
                                          AfterPutAction = builder => builder.Clear()
                                      };
                            _default = def;
                        }
                    }
                }
                return _default;
            }
        }

       
       
    }
}
