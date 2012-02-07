$(function() {

    var TestModel = Uppercut.Knockout.Model.derive({
        init: function (data) {
            this.id = ko.observable(data.id);
            this.name = ko.observable(data.name);
        }
    });
   
    test('Collection.append', function () {
        var collection = new Uppercut.Knockout.Collection();
        
        var a1 = [
            new TestModel({ id: 1, name: "model 1" }),
            new TestModel({ id: 2, name: "model 2" })
        ];
        
        collection.append(a1);
        
        equals(collection.models()[0].id(), 1);
        equals(collection.models()[1].id(), 2);
    });
    
    test('Collection.append with model', function () {
        var collection = new Uppercut.Knockout.Collection();
        
        var a1 = [
            { id: 1, name: "model 1" },
            { id: 2, name: "model 2" }
        ];
        
        collection.append(a1, { model: TestModel });
        
        ok(collection.models()[0] instanceof TestModel);
        equals(collection.models()[0].id(), 1);
        ok(collection.models()[1] instanceof TestModel);
        equals(collection.models()[1].id(), 2);
    });
    
    asyncTest('Endpoint.fetch', function () {
        var ep = new Uppercut.Endpoint();
        var collection = new Uppercut.Knockout.Collection();
        
        ep.fetch(collection, {
            url: '/api/testmodel', 
            model: TestModel,
            success: function(coll) {
                equals(coll.models()[0].id(), 1);
                equals(coll.models()[0].name(), 'name one');
                equals(coll.models()[1].id(), 2);
                equals(coll.models()[1].name(), 'name two');
                equals(coll.models().length, 2);
                start();
            }
        });
    });
    
    asyncTest('Endpoint.add', function () {
        var ep = new Uppercut.Endpoint();
        var collection = new Uppercut.Knockout.Collection(null, { url: '/api/testmodel' });
        
        var m1 = new TestModel({ name: "new model" });
        ep.add(collection, m1, {
            success: function(coll, model) {
                equals(model.id(), 3);
                equals(coll.models().length, 1);
                start();
            }
        });
    });
    
    asyncTest('Endpoint.fetch and .add', function () {
        var ep = new Uppercut.Endpoint();
        var collection = new Uppercut.Knockout.Collection(null, { url: '/api/testmodel', model: TestModel });
        
        ep.fetch(collection, {
            success: function(coll) {
                equals(coll.models()[0].id(), 1);
                equals(coll.models()[0].name(), 'name one');
                equals(coll.models()[1].id(), 2);
                equals(coll.models()[1].name(), 'name two');
                start();
            }
        });

        var m1 = new TestModel({ name: "new model" });

        ep.add(collection, m1, {
            success: function(coll, model) {
                equals(model.id(), 3);
                equals(coll.models().length, 3);
                start();
            }
        });
    });
    
    asyncTest('Endpoint.add and .fetch', function () {
        var ep = new Uppercut.Endpoint();
        var collection = new Uppercut.Knockout.Collection(null, { url: '/api/testmodel', model: TestModel });

        var m1 = new TestModel({ name: "new model" });
        
        ep.add(collection, m1, {
            success: function(coll, model) {
                equals(model.id(), 3);
                equals(coll.models().length, 1);
                start();
            }
        });
        
        ep.fetch(collection, {
            success: function(coll) {
                equals(coll.models()[0].id(), 1);
                equals(coll.models()[0].name(), 'name one');
                equals(coll.models()[1].id(), 2);
                equals(coll.models()[1].name(), 'name two');
                equals(coll.models().length, 2);
                start();
            }
        });
    });

    asyncTest('Endpoint.add and .fetch with append', function () {
        var ep = new Uppercut.Endpoint();
        var collection = new Uppercut.Knockout.Collection(null, { url: '/api/testmodel', model: TestModel });

        var m1 = new TestModel({ name: "new model" });
        
        ep.add(collection, m1, {
            success: function(coll, model) {
                equals(model.id(), 3);
                equals(coll.models().length, 1);
                start();
            }
        });
        
        ep.fetch(collection, {
            append: true,
            success: function(coll) {
                equals(coll.models()[0].id(), 3);
                equals(coll.models()[0].name(), 'new model');
                equals(coll.models()[1].id(), 1);
                equals(coll.models()[1].name(), 'name one');
                equals(coll.models()[2].id(), 2);
                equals(coll.models()[2].name(), 'name two');
                equals(coll.models().length, 3);
                start();
            }
        });
    });
});
