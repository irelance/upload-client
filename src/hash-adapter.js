/**
 * Created by irelance on 2017/2/13.
 */
UploadClient.HashAdapter = function (options) {
    this.chunkSize = options.chunkSize;
    this.object = new (eval(options.className))();
    this.reset = function () {
        return this.object[options.method.reset]();
    };
    this.append = function (str) {
        return this.object[options.method.append](str);
    };
    this.final = function () {
        return this.object[options.method.final]();
    };
};
