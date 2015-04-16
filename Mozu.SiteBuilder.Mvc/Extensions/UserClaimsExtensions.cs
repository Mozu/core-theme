using Mozu.Core;
using Mozu.Core.Behaviors;
using System;
using System.Collections.Concurrent;
using System.Linq;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class UserClaimExtensions
    {
        private static ConcurrentDictionary<Type, int> cachedThings = new ConcurrentDictionary<Type, int>();
        public static bool HasBehavior<T>(this LightweightUserClaims claims) where T : BehaviorDefinition, new()
        {
            var tid = cachedThings.GetOrAdd(typeof(T), t => new T().Id);
            return claims.BehaviorIds.Contains(tid);
        }
    }
}
