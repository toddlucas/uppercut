$(function() {

    $.mockjax({
        url: '/api/testmodel',
        type: 'get',
        responseText: [
            {   id: 1,
                name: 'name one'
            },
            {   id: 2,
                name: 'name two'
            },
        ]
    });
    
    $.mockjax({
        url: '/api/testmodel',
        type: 'post',
        responseText: {
            id: 3,
            name: 'new model'
        }
    });
    
    $.mockjax({
        url: '/api/testmodel/1',
        responseText: {
            id: 1,
            name: 'test name'
        }
    });

});
