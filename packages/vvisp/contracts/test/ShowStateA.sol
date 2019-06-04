pragma solidity ^0.5.0;


contract ShowStateA {

    struct Addr {
        uint a;
        uint b;
    }

    struct Info {
        uint64 a;
        uint64 b;
        mapping(uint64 => uint64) c;
        Addr[2] d;
    }

    struct Person {
        Info a;
        uint200[3] b;
        mapping(uint => Addr) c;
    }

    Person a;
    Person[2] b;
    Person c;

    constructor() public {
        a = Person(1, 2, )
    }
}