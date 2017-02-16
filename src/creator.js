/**
 * Created by irelance on 2017/2/14.
 */
UploadClient.Creator = function () {
    this.target = $('<div class="form-group"><label>' + UploadClient.lang[UploadClient.options.lang].uploaderLabel + '</label></div>');
    this.message = $('<div class="message"></div>');
    this.file = undefined;
    this.hash = undefined;
    this.data = {};
    this.init = function () {
        var self = this;
        self.data = {
            chunk_size: UploadClient.options.upload.chunkSize,
            chunk_number: 0,
            size: 0,
            hash: ''
        };
        self.hash = new UploadClient.HashAdapter(UploadClient.options.hash.adapters[UploadClient.options.hash.defaults]);
        self.file = $('<input type="file">');
        self.renderMessage(UploadClient.lang[UploadClient.options.lang]['fileStart']);
        self.target.append(self.message);
        self.target
            .on('click', '.message', function (e) {
                self.file.trigger('click');
            });
        self.file
            .on('change', function (e) {
                var file = this.files[0];
                if (file == undefined) {
                    return false;
                }
                self.hash.reset();
                var fileReader = new FileReader(),
                    chunkSize = UploadClient.options.hash.chunkSize,
                    chunks = Math.ceil(file.size / chunkSize),
                    currentChunk = 0;
                fileReader.onload = function (e) {
                    self.hash.append(e.target.result);
                    currentChunk++;
                    if (currentChunk < chunks) {
                        loadNext();
                    } else {
                        self.data.hash = self.hash.final();
                        self.data.size = file.size;
                        self.data.name = file.name;
                        self.data.chunk_number = Math.ceil(self.data.size / self.data.chunk_size);
                        self.renderMessage(UploadClient.lang[UploadClient.options.lang]['hashSuccess'], 'success');
                        return true;
                    }
                };
                function loadNext() {
                    self.renderMessage(UploadClient.lang[UploadClient.options.lang]['hashProcess'] + Math.ceil(100 * currentChunk / chunks) + '%', 'process');
                    var start = currentChunk * chunkSize, end = start + chunkSize >= file.size ? file.size : start + chunkSize;
                    fileReader.readAsBinaryString(file.slice(start, end));
                }

                loadNext();
            });
    };
    this.renderMessage = function (value, className) {
        this.message.html('<p class="' + className + '">' + value + '</p>');
    };
};
