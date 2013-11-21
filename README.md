UAV
===

csce635

Error Log

//6:36 PM Nov. 20 BlockCrowd2.js 


NullReferenceException: Object reference not set to an instance of an object
Behaviour.Add_motor (ICallable motor) (at Assets/BlockCrowd2.js:44)
BlockCrowd2.Behaviour_module () (at Assets/BlockCrowd2.js:161)
BlockCrowd2.Update () (at Assets/BlockCrowd2.js:92)

//8:01 PM Nov. 20

MissingFieldException: Boo.Lang.Hash.motor
Boo.Lang.Runtime.DynamicDispatching.PropertyDispatcherFactory.FindExtension (IEnumerable`1 candidates)
Boo.Lang.Runtime.DynamicDispatching.PropertyDispatcherFactory.Create (SetOrGet gos)
Boo.Lang.Runtime.DynamicDispatching.PropertyDispatcherFactory.CreateSetter ()
Boo.Lang.Runtime.RuntimeServices.DoCreatePropSetDispatcher (System.Object target, System.Type type, System.String name, System.Object value)


//8:46 PM Nov.20

MissingFieldException: Boo.Lang.Hash.fly_at_given_altitude
Boo.Lang.Runtime.DynamicDispatching.PropertyDispatcherFactory.FindExtension (IEnumerable`1 candidates)
Boo.Lang.Runtime.DynamicDispatching.PropertyDispatcherFactory.Create (SetOrGet gos)
Boo.Lang.Runtime.DynamicDispatching.PropertyDispatcherFactory.CreateSetter ()
Boo.Lang.Runtime.RuntimeServices.DoCreatePropSetDispatcher (System.Object target, System.Type type, System.String name, System.Object
MissingFieldException: Boo.Lang.Hash.random_move_3D
Boo.Lang.Runtime.DynamicDispatching.PropertyDispatcherFactory.FindExtension (IEnumerable`1 candidates)
Boo.Lang.Runtime.DynamicDispatching.PropertyDispatcherFactory.Create (SetOrGet gos)
Boo.Lang.Runtime.DynamicDispatching.PropertyDispatcherFactory.CreateSetter ()
Boo.Lang.Runtime.RuntimeServices.DoCreatePropSetDispatcher (System.Object target, System.Type type, System.String name, System.Object value)
Boo.Lang.Runtime.RuntimeServices.CreatePropSetDispatcher (System.Object target, System.String name, System.Object value)
Boo.Lang.Runtime.RuntimeServices+<SetProperty>c__AnonStorey19.<>m__F ()
Boo.Lang.Runtime.DynamicDispatching.DispatcherCache.Get (Boo.Lang.Runtime.DynamicDispatching.DispatcherKey key, Boo.Lang.Runtime.DynamicDispatching.DispatcherFactory factory)
Boo.Lang.Runtime.RuntimeServices.GetDispatcher (System.Object target, System.String cacheKeyName, System.Type[] cacheKeyTypes, Boo.Lang.Runtime.DynamicDispatching.DispatcherFactory factory)
Boo.Lang.Runtime.RuntimeServices.GetDispatcher (System.Object target, System.Object[] args, System.String cacheKeyName, Boo.Lang.Runtime.DynamicDispatching.DispatcherFactory factory)
Boo.Lang.Runtime.RuntimeServices.SetProperty (System.Object target, System.String name, System.Object value)
BlockCrowd2.Behaviour_module () (at Assets/BlockCrowd2.js:181)
BlockCrowd2.Update () (at Assets/BlockCrowd2.js:98)


//10:16

ArgumentNullException: Argument cannot be null.
Parameter name: target
Boo.Lang.Runtime.RuntimeServices.InvokeCallable (System.Object target, System.Object[] args)
BlockCrowd2.Execution_module () (at Assets/BlockCrowd2.js:212)
BlockCrowd2.Update () (at Assets/BlockCrowd2.js:105)
