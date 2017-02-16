/**
 * Created by irelance on 2017/2/16.
 */
ArrayDifferenceSet = function (arr1, arr2) {
    var m = {};
    arr1.forEach(function (al) {
        m[al] = al;
    });
    arr2.forEach(function (bl) {
        delete m[bl];
    });
    return Object.keys(m);
};
ArrayRange = function (start, end) {
    var arr = [];
    for (var i = start; i < end; i++) {
        arr.push(i);
    }
    return arr;
};
