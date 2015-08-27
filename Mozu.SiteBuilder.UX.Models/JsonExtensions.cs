// -----------------------------------------------------------------------
// <copyright file="JsonExtensions.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using Newtonsoft.Json.Linq;
    using System.Dynamic;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public static class JsonWrapper
    {
        public static object DeToken(this JToken token)
        {
            if (token != null)
            {
                if (token is JValue)
                {
                    var val = ((JValue)token).Value;
                    if (val is Int64)
                    {
                        val = Convert.ToInt32((Int64)val);
                    }
                    return val;
                }
            }
            if (token is JObject)
            {
                return new JObjectWrapper((JObject)token);
            }
            if (token is JArray)
            {
                return new JArrayWrapper((JArray)token);
            }
            return token;
        }
        class JArrayWrapper : DynamicObject, IList<object>, IEnumerable<object>, System.Collections.IList
        {
            JArray _jar;
            public JArrayWrapper(JArray jar)
            {
                _jar = jar;
            }
            public override string ToString()
            {
                return _jar.ToString();
            }
            public override int GetHashCode()
            {
                return _jar.GetHashCode();
            }


            public int IndexOf(object item)
            {
                throw new NotImplementedException();
            }

            public void Insert(int index, object item)
            {
                throw new NotImplementedException();
            }

            public void RemoveAt(int index)
            {
                throw new NotImplementedException();
            }

            public object this[int index]
            {
                get
                {
                    var token = _jar[index];
                    return JsonWrapper.DeToken(token);
                }
                set
                {
                    throw new NotImplementedException();
                }
            }




            public void Add(object item)
            {
                throw new NotImplementedException();
            }

            public void Clear()
            {
                throw new NotImplementedException();
            }

            public bool Contains(object item)
            {
                throw new NotImplementedException();
            }

            public void CopyTo(object[] array, int arrayIndex)
            {
                throw new NotImplementedException();
            }

            public int Count
            {
                get { return _jar.Count; }
            }

            public bool IsReadOnly
            {
                get { throw new NotImplementedException(); }
            }

            public bool Remove(object item)
            {
                throw new NotImplementedException();
            }

            public IEnumerator<object> GetEnumerator()
            {
                throw new NotImplementedException();
            }

            System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
            {
                for (int i = 0; i < _jar.Count; i++)
                {
                    yield return this[i];
                }
            }

            IEnumerator<object> IEnumerable<object>.GetEnumerator()
            {
                for (int i = 0; i < _jar.Count; i++)
                {
                    yield return this[i];
                }
            }

            int System.Collections.IList.Add(object value)
            {
                this._jar.Add(value);
                return this._jar.Count() - 1;
            }

            public bool IsFixedSize
            {
                get { return false; }
            }

            void System.Collections.IList.Remove(object value)
            {
                if (value is JToken)
                {
                    this._jar.Remove((JToken )value );
                }
            }

            public void CopyTo(Array array, int index)
            {
                throw new NotImplementedException();
            }

            public bool IsSynchronized
            {
                get { return false; }
            }

            public object SyncRoot
            {
                get { return this; ; }
            }
        }

        class JObjectWrapper : DynamicObject, IEnumerable<KeyValuePair<string, object>>
        {
            public JObjectWrapper(JObject job)
            {
                _job = job;
            }
            JObject _job;
            public override string ToString()
            {
                return _job.ToString();
            }
            public override int GetHashCode()
            {
                return _job.GetHashCode();
            }
            public object this[string propertyName]
            {
                get
                {
                    var token = _job[propertyName];
                    return JsonWrapper.DeToken(token);
                }
            }

            public IEnumerator<KeyValuePair<string, object>> GetEnumerator()
            {
                foreach (var kvp in _job)
                {
                    yield return new KeyValuePair<string, object>(kvp.Key, this[kvp.Key]);
                }

            }

            System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
            {
                foreach (var kvp in _job)
                {
                    yield return new KeyValuePair<string, object>(kvp.Key, this[kvp.Key]);
                }
            }

            public override bool TryGetMember(GetMemberBinder binder, out object result)
            {
                result = this[binder.Name];

                return true;
            }
        }
    }
}
