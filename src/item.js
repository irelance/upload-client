/**
 * Created by irelance on 2017/2/10.
 */
UploadClient.Item = function () {
    this.target = $('<tr></tr>');
    this.uploader = $('<div class="uploader"></div>');
    this.message = $('<div class="message"></div>');
    this.canUpload = false;
    this.isPause = false;
    this.buttons = {
        custom: '',
        upload: $('<button class="upload-client-button-upload process">' + UploadClient.lang[UploadClient.options.lang].upload + '</button>'),
        pause: $('<button class="upload-client-button-pause">' + UploadClient.lang[UploadClient.options.lang].pause + '</button>'),
    };
    this.data = {};
    this.isValid = false;
    this.file = $('<input type="file">');
    this.init = function (item) {
        var self = this;
        self.hash = new UploadClient.HashAdapter(UploadClient.options.hash.adapters[UploadClient.options.hash.defaults]);
        if (typeof item == 'object') {
            var includes = ['id', 'status', 'hash', 'size', 'chunk_size', 'chunk_number', 'chunks'];
            self.isValid = true;
            includes.forEach(function (v) {
                if (item[v] == undefined) {
                    self.isValid = false;
                }
            });
        }
        if (self.isValid) {
            self.data = item;
            self.uploader
                .on('click', '.upload-client-button-upload', function (e) {
                    if (!self.canUpload) {
                        self.onFileStart(true);
                        return false;
                    }
                    //todo
                    self.onUpload();
                })
                .on('click', '.upload-client-button-pause', function (e) {
                    self.onPause();
                })
                .on('click', '.message', function (e) {
                    self.file.trigger('click');
                });
            self.file
                .on('change', function (e) {
                    self.onFileStart();
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
                            var hash = self.hash.final();
                            if (self.data.hash != hash) {
                                self.renderMessage(UploadClient.lang[UploadClient.options.lang]['hashFail'], 'error');
                                return false;
                            }
                            self.onHashSuccess();
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
        }
    };
    this.render = function () {
        if (this.isValid) {
            UploadClient.options.display.forEach(function (v) {
                var td = $('<td></td>');
                if (v.uploader) {
                    td.append(this.uploader);
                    this.buttons.custom = v.buttons(this.data);
                } else {
                    td.html(v.render(this.data));
                }
                this.target.append(td);
            }.bind(this));
            UploadClient.table.target.children('tbody').append(this.target);
            this.renderButtons();
            this.onFileStart();
            this.uploader.prepend(this.message);
        }
    };
    this.destory = function () {
        this.target.remove();
    };
    this.renderMessage = function (value, className) {
        this.message.html('<p class="' + className + '">' + value + '</p>');
    };
    this.renderProcess = function () {
    };
    this.renderButtons = function () {
        for (var i in this.buttons) {
            if (i != 'custom') {
                this.buttons[i].hide();
                this.uploader.append(this.buttons[i]);
            }
        }
        if (typeof this.buttons.custom == 'string') {
            this.uploader.append(this.buttons.custom);
        } else if (typeof this.buttons.custom == 'object' && this.buttons.custom.forEach) {
            this.buttons.custom.forEach(function (v) {
                this.uploader.append(v);
            }.bind(this));
        }
        this.onPause();
    };
    this.onFileStart = function (isError) {
        var error = isError ? 'error' : '';
        this.canUpload = false;
        this.renderMessage(UploadClient.lang[UploadClient.options.lang]['fileStart'], error);
    };
    this.onHashSuccess = function () {
        this.canUpload = true;
        this.renderMessage(UploadClient.lang[UploadClient.options.lang]['hashSuccess'], 'success');
    };
    this.onPause = function () {
        this.isPause = true;
        this.renderMessage(UploadClient.lang[UploadClient.options.lang]['pause'], '');
        this.buttons.upload.show();
        this.buttons.pause.hide();
    };
    this.onUpload = function () {
        this.isPause = false;
        this.buttons.pause.show();
        this.buttons.upload.hide();
    };
};
