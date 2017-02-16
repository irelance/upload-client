/**
 * Created by irelance on 2017/2/10.
 */
UploadClient.Item = function () {
    this.target = $('<tr></tr>');
    this.uploader = $('<div class="uploader"></div>');
    this.message = $('<div class="message"></div>');
    this.canUpload = false;
    this.isProcess = UploadClient.options.upload.workers;
    this.retries = UploadClient.options.upload.retries;
    this.buttons = {
        custom: '',
        upload: $('<button class="upload-client-button-upload process">' + UploadClient.lang[UploadClient.options.lang].upload + '</button>'),
        pause: $('<button class="upload-client-button-pause">' + UploadClient.lang[UploadClient.options.lang].pause + '</button>'),
        merge: $('<button class="upload-client-button-merge process">' + UploadClient.lang[UploadClient.options.lang].merge + '</button>'),
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
                if (typeof item[v] == 'string' && item[v].match(/^[0-9]+$/)) {
                    item[v] = parseInt(item[v]);
                }
                if (item[v] == undefined) {
                    self.isValid = false;
                }
            });
        }
        if (self.isValid) {
            self.data = item;
            self.data.chunks = ArrayDifferenceSet(ArrayRange(0, self.data.chunk_number), self.data.chunks);
            self.uploader
                .on('click', '.upload-client-button-upload', function (e) {
                    if (!self.canUpload) {
                        self.onFileStart(true);
                        return false;
                    }
                    self.onUpload();
                })
                .on('click', '.upload-client-button-pause', function (e) {
                    self.onPause();
                })
                .on('click', '.upload-client-button-merge', function (e) {
                    self.handleMerge();
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
        var percent = Math.ceil((this.data.chunk_number - this.data.chunks.length) / this.data.chunk_number * 100);
        this.renderMessage('上传进度: ' + percent + '%', 'process');
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
        this.uploadOrMerge();
    };
    this.uploadOrMerge = function () {
        this.buttons.upload.hide();
        this.buttons.merge.hide();
        if (this.data.chunks.length) {
            this.buttons.upload.show();
        } else {
            this.buttons.merge.show();
        }
    };
    this.onFileStart = function (isError) {
        var error = isError ? 'error' : '';
        this.canUpload = false;
        this.renderMessage(UploadClient.lang[UploadClient.options.lang]['fileStart'], error);
        this.uploadOrMerge();
    };
    this.onHashSuccess = function () {
        this.canUpload = true;
        this.renderMessage(UploadClient.lang[UploadClient.options.lang]['hashSuccess'], 'success');
    };
    this.onPause = function () {
        this.isProcess = 0;
        this.renderMessage(UploadClient.lang[UploadClient.options.lang]['pause'], '');
        this.uploadOrMerge();
        this.buttons.pause.hide();
    };
    this.onUpload = function () {
        this.buttons.pause.show();
        this.buttons.upload.hide();
        this.isProcess = UploadClient.options.upload.workers;
        for (var w = 0; w < UploadClient.options.upload.workers; w++) {
            this.handleUpload();
        }
    };
    this.handleMerge = function () {
        var self = this;
        self.renderMessage(UploadClient.lang[UploadClient.options.lang]['mergeStart'], '');
        $.ajax({
            type: 'post',
            url: UploadClient.options.merge.url,
            data: {
                id: self.data.id,
                hash: self.data.hash
            },
            success: function (result) {
                if (result.status) {
                    self.renderMessage(UploadClient.lang[UploadClient.options.lang]['mergeSuccess'], 'success');
                } else {
                    self.renderMessage(UploadClient.lang[UploadClient.options.lang]['mergeFail'], 'error');
                }
            }
        }).always(function () {
            self.buttons.merge.hide();
            self.buttons.pause.hide();
            self.buttons.upload.hide();
        });
    };
    this.handleUpload = function () {
        var self = this;
        if (self.retries <= 0) {
            self.renderMessage(UploadClient.lang[UploadClient.options.lang]['networkError'], 'error');
            return self.isProcess--;
        }
        var number = parseInt(self.data.chunks.pop());
        if (isNaN(number)) {
            return self.isProcess--;
        }
        if (self.isProcess) {
            var fileReader = new FileReader(),
                start = number * self.data.chunk_size,
                end = Math.min(self.file[0].files[0].size, start + self.data.chunk_size);
            fileReader.readAsBinaryString(self.file[0].files[0].slice(start, end));
            fileReader.onload = function (e) {
                $.ajax({
                    type: 'post',
                    url: UploadClient.options.upload.url,
                    data: {
                        id: self.data.id,
                        chunk_number: number,
                        start: start,
                        end: end,
                        data: window.btoa(fileReader.result)
                    },
                    success: function (result) {
                        if (result.status) {
                            self.renderProcess();
                        } else {
                            self.data.chunks.push(number);
                            self.retries--;
                        }
                    },
                    error: function () {
                        self.data.chunks.push(number);
                        self.retries--;
                    }
                }).always(function () {
                    if (self.data.chunks.length) {
                        self.handleUpload();
                    } else {
                        self.renderMessage(UploadClient.lang[UploadClient.options.lang]['uploadSuccess'], 'success');
                        self.isProcess--;
                        if (!self.isProcess) {
                            self.handleMerge();
                        }
                    }
                });
            };
        }
    };
};
