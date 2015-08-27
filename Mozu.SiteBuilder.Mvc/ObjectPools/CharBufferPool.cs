using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.ObjectPools
{
    public class CharBufferPool:  ObjectPool<char[]>
    {
        private static CharBufferPool _default;
        private static object lockObj = new object();
        public static CharBufferPool Default
        {
            get
            {
                if (_default == null)
                {
                    lock (lockObj)
                    {
                        if (_default == null)
                        {
                            var def = new CharBufferPool()
                                      {
                                          MaxCapacity = 2000,
                                          MaxBufferSize = 30000,
                                          DefaultInstanceFactory = () => new char[30000]
                                      };
                            _default = def;
                        }
                    }
                }
                return _default;
            }
        }

        public int MaxBufferSize
        {
            get;  set;
        }

       
    }
}
