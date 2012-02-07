$(function() {

    var TestModel = Uppercut.Model.derive({
        init: function (data) {
            this.id = data.id;
            this.name = data.name;
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