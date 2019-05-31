pragma solidity ^0.5.0;


contract ShowStateC {

    bool a = true;
    int8 b = 1;
    int16 c = 2;
    int256 d = 3;
    int e = 4;
    uint8 f = 5;
    uint256 g = 6;
    uint h = 7;
    address i = address(0x1111);
    address payable j = address(0x2222);
    byte k = "a";
    bytes1 m = "b";
    bytes2 n = 0x3333;
    bytes32 o = "def";
    ShowStateC p = ShowStateC(i);
    uint8 ttt = 1;
    bytes q = "1234";
    string r = "5678";

    enum E { a, b, c }
    E s = E.a;
    E t = E.c;

    function (bool) external u = this.setA;
    function (bool) internal v = setA;
    function () external view returns (int8) w = this.getB;
    function () internal view returns (int8) x = getB;

    uint[3] aa = [1, 2, 3];
    uint[2][2] bb = [[5, 6], [7, 8]];
    uint[] ii;

    mapping(uint => uint) cc;

    struct Ss {
        uint a;
        string b;
        uint64 c;
    }
    Ss dd = Ss(1, "2", 3);
    uint64 xxxx = 4;

    struct Tt {
        Tt[] a;
        mapping(uint => uint) b;
        mapping(bytes => Tt) c;
        E d;
    }
    Tt[3] gg;

    mapping(uint => uint)[3] hh;

    constructor() public {
        cc[1] = 2;
        cc[2] = 3;

        ii.push(1);
        ii.push(2);
    }

    function setA(bool _a) public {
        a = _a;
    }

    function getB() public view returns (int8) {
        return b;
    }
}
