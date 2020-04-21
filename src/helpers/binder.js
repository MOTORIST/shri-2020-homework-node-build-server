class Binder {}

Binder.getAllMethods = function (instance, cls) {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).filter((name) => {
    const method = instance[name];
    return !(!(method instanceof Function) || method === cls);
  });
};

Binder.bind = function (instance, cls) {
  Binder.getAllMethods(instance, cls).forEach((mtd) => {
    instance[mtd] = instance[mtd].bind(instance);
  });
};

module.exports = Binder;
