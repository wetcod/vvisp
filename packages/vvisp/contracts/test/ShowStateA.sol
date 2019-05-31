pragma solidity ^0.5.0;


contract ShowStateA {

    uint256 a;

    struct MyStruct {
        uint256 b;
        uint128 c;
        uint128 d;
        uint[3] e;
    }

    uint[4] arr;
    uint[4][3] doublearr;
    MyStruct[3] sarray;

    constructor() public {
        a = 1;
        arr = [
            2, 3, 4, 5
        ];
        for (uint i = 0; i < 4; ++i) {
            for (uint j = 0; j < 3; ++j) {
                doublearr[i][j] = i + j;
            }
        }
        for (uint i = 0; i < 3; ++i) {
            sarray[i] = MyStruct(
                i, uint128(i + 1), uint128(i + 2), [i, i + 1, i + 2]
            );
        }
    }
}