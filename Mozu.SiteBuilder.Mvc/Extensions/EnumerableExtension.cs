using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.Extensions
{


    public static class EnumerableExtension
    {
        public struct PartitionResult<T>
        {
            private IEnumerable<T> t;
            private IEnumerable<T> f;

            public PartitionResult(IEnumerable<T> Tr, IEnumerable<T> Fa)
            {
                t = Tr;
                f = Fa;
            }
            public IEnumerable<T> True { get { return t; } }
            public IEnumerable<T> False
            {
                get { return f; }
            }
        }

        /// <summary>
        /// splits an enumerable into a true and false enumerable
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="source"></param>
        /// <param name="predicate"></param>
        /// <returns></returns>
        public static PartitionResult<T> Partition<T>(this IEnumerable<T> source, Func<T, bool> predicate)
        {
            var d = source.GroupBy(i => predicate(i)).ToDictionary(x => x.Key, x => x);

            return new PartitionResult<T>(d.ContainsKey(true) ? d[true] : Enumerable.Empty<T>(), d.ContainsKey(false) ? d[false] : Enumerable.Empty<T>());
        }

        public static IEnumerable<T> GetOrError<T>(this PartitionResult<T> partition, Func<IEnumerable<T>, Exception> errorFunc)
        {
            if (partition.False.Any()) throw errorFunc(partition.False);
            return partition.True;
        }
    }
}
