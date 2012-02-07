$(function() {

    var TestModel = Uppercut.Knockout.Model.derive({
        init: function (data) {
            this.id = ko.observable(data.id);
            this.name = ko.observable(data.name);
        }
    });
   
    $.mockjax({
        url: '/api/testmodel/1',
        responseText: {
            id: 1,
            name: 'test name'
        }
    });
    
    test('Model read', function () {
        var m1 = new TestModel({ id: 1, name: "m1" });
        
        var ep = new Uppercut.Endpoint({ url: '/api/testmodel' });
        
        ep.read(m1, {
            success: function(model) {
                equals(model.name, 'test name');
            }
        });
        
    });
});