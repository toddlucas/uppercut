$(function() {

    var TestModel = Uppercut.Knockout.Model.derive({
        init: function (data) {
            this.id = ko.observable(data.id);
            this.name = ko.observable(data.name);
        }
    });
   
    asyncTest('Model read', function () {
        var m1 = new TestModel({ id: 1, name: "m1" });
        
        var ep = new Uppercut.Endpoint({ url: '/api/testmodel' });
        
        ep.read(m1, {
            success: function(model) {
                equals(model.name(), 'test name');
                start();
            }
        });
    });
});
