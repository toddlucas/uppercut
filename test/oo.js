$(function () {
    test('Object.inherit', function () {
        // Classes
        var Person = uc.inherit(Object);
        var Warrior = uc.inherit(Person);
        var Ninja = uc.inherit(Warrior);

        // Instances
        var person = new Person();
        var warrior = new Warrior();
        var ninja = new Ninja();

        // Tests
        ok(person instanceof Object && person instanceof Person && person.constructor === Person);
        ok(warrior instanceof Object && warrior instanceof Person && warrior instanceof Warrior && warrior.constructor === Warrior);
        ok(ninja instanceof Object && ninja instanceof Person && ninja instanceof Warrior && ninja instanceof Ninja && ninja.constructor === Ninja);
    });

    test('Object.create', function () {
        Object.derive = uc.Model.derive;

        // Classes
        Person = Object.derive();
        Warrior = Person.derive();
        Ninja = Warrior.derive();

        // Instances
        var person = new Person();
        var warrior = new Warrior();
        var ninja = new Ninja();

        // Tests
        ok(person instanceof Object && person instanceof Person && person.constructor === Person);
        ok(warrior instanceof Object && warrior instanceof Person && warrior instanceof Warrior && warrior.constructor === Warrior);
        ok(ninja instanceof Object && ninja instanceof Person && ninja instanceof Warrior && ninja instanceof Ninja && ninja.constructor === Ninja);
    });

    test('Model.create', function () {
        var M1 = uc.Model.derive();

        var m1 = new M1;

        ok(m1 instanceof Object);
        ok(m1 instanceof M1);
        ok(m1.constructor === M1);
    });
});
