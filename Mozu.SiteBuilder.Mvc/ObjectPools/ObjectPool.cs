using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.ObjectPools
{
    

    public abstract class ObjectPool<T> where T : class
    {
         System.Collections.Concurrent.ConcurrentStack<T> m_bag = new System.Collections.Concurrent.ConcurrentStack<T>();

        /// <summary>
        /// Maximum capactity of the pool, used in Put to discards objects if the capacity was reached.
        /// </summary>
        public  int MaxCapacity = 10;

        /// <summary>
        /// Default instance factory method, used to create new instances if the pool is empty.
        /// </summary>
        public  Func<T> DefaultInstanceFactory = null;

        /// <summary>
        /// Default method to be called whenever ans instance should be disposed.<para/>
        /// Used when the MaxCapacity is reached or when the Clear method is called.
        /// </summary>
        public  Action<T> DefaultInstanceDispose = null;


        /// <summary>
        /// Default method to be called whenever ans instance should be disposed.<para/>
        /// Used when the MaxCapacity is reached or when the Clear method is called.
        /// </summary>
        public  Action<T> AfterPutAction = null;



        /// <summary>
        /// Removes a stored object from the pool and return it.
        /// If the pool is empty, instanceFactory will be called to generate a new object.
        /// </summary>
        /// <param name="instanceFactory">The instance factory method used to create a new instance if pool is empty.</param>
        public  T Get(Func<T> instanceFactory)
        {
            T item;
            if (!m_bag.TryPop(out item))
            {
                return instanceFactory();
            }
            return item;
        }

        public ItemContainer GetContainer()
        {
            T item;
            if (!m_bag.TryPop(out item))
            {
                item = DefaultInstanceFactory();
            }
            return new ItemContainer(item, this);
        }

        public class ItemContainer : IDisposable
        {
            private readonly T _item;
            private readonly ObjectPool<T> _pool;

            

            public T Item
            {
                get { return _item; }
            }

            public ItemContainer(T item, ObjectPool<T> pool)
            {
                _item = item;
                _pool = pool;
            }

            void IDisposable.Dispose()
            {
               _pool.Put(_item);
            }
        }

        /// <summary>
        /// Removes a stored object from the pool and return it.
        /// If the pool is empty and a 'DefaultInstanceFactory' was provided, 
        /// then 'DefaultInstanceFactory' will be called to generate a new object,
        /// otherwise null is returned.
        /// </summary>
        public  T Get()
        {
            T item;
            if (!m_bag.TryPop(out item))
            {
                if (DefaultInstanceFactory == null)
                    return null;
                return DefaultInstanceFactory();
            }
            return item;
        }

        /// <summary>
        /// Puts the specified item in the pool.
        /// Is the 'MaxCapacity' has been reached the item is ignored.
        /// If a Default Intance Dispose method was provided, it will be called for the ignored item.
        /// </summary>
        public  void Put(T item)
        {
            // add to pool if it is not full
            if (m_bag.Count < MaxCapacity)
            {
                if (AfterPutAction != null)
                {
                    AfterPutAction(item);
                }
                m_bag.Push(item);
            }
            else if (DefaultInstanceDispose != null)
            {
                DefaultInstanceDispose(item);
            }
        }

        /// <summary>
        /// Clears this instance by removing all stored items.<para/>
        /// If a Default Intance Dispose method was provided, it will be called for
        /// every remove item.
        /// </summary>
        public  void Clear()
        {
            if (DefaultInstanceDispose != null)
            {
                T item;
                while (m_bag.TryPop(out item))
                {
                    DefaultInstanceDispose(item);
                }
            }
            m_bag.Clear();
        }

        /// <summary>
        /// Gets the number of objects in the pool.
        /// </summary>
        /// <value>The count.</value>
        public  int Count
        {
            get { return m_bag.Count; }
        }
    }
}
