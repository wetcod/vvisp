pragma solidity ^0.5.0;


contract Added {
    uint a = 7;
}


contract ShowStateB {

    enum E { a, b, c }

    uint128 a = 9;
    uint128 b = 2;
    uint128[2] aa = [3, 4];

    bytes bb; // full

    bool c = true;
    E e = E.b;
    E f = E.c;

    bytes cc;   // full

    function (uint128) internal g = setA;
    uint8 h = 1;
    address i;
    uint8 j = 2;

    string k = "123456"; // full

    constructor() public {
        bb.push("0");
        bb.push("1");
        bb.push("2");
        bb.push("3");

        i = address(this);
    }

    function setB(uint128 _b) public {
        b = _b;
    }

    function setAA(uint _index, uint128 _value) public {
        aa[_index] = _value;
    }

    function setA(uint128 _a) internal {
        a = _a;
    }
}
