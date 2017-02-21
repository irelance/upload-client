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
        refresh: $('<button class="upload-client-button-refresh">' + UploadClient.lang[UploadClient.options.lang].refresh + '</button>')
    };
    this.data = {};
    this.isValid = false;
    this.file = $('<input type="file">');
    this.init = function (item) {
        var self = this;
        self.hash = new UploadClient.HashAdapter(UploadClient.options.hash.adapters[UploadClient.options.hash.defaults]);
        self.clearData(item);
        var includes = ['id', 'status', 'hash', 'size', 'chunk_size', 'chunk_number'];
        self.isValid = true;
        includes.forEach(function (v) {
            if (self.data[v] == undefined) {
                self.isValid = false;
            }
        });
        if (self.isValid) {
            self.render();
            self.file.on('change', function (e) {
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
    this.clearData = function (data) {
        if (typeof data == 'object') {
            this.data = $.extend(this.data, data);
            for (var i in data) {
                if (typeof data[i] == 'string' && data[i].match(/^[0-9]+$/)) {
                    this.data[i] = parseInt(data[i]);
                }
            }
            if (UploadClient.options.completeStatus == this.data.status) {
                this.data.chunks = [];
            } else if (this.data.chunks) {
                this.data.chunks = ArrayDifferenceSet(ArrayRange(0, this.data.chunk_number), this.data.chunks);
            } else {
                this.data.chunks = undefined;
                this.handleCheck();
            }
        }
    };
    this.render = function () {
        this.target.html('');
        this.uploader.html('');
        this.unbind();
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
            this.renderButtons();
            this.onFileStart();
            this.uploader.prepend(this.message);
            this.bind();
        }
    };
    this.unbind = function () {
        // buttons
        this.buttons.upload.off('click');
        this.buttons.pause.off('click');
        this.buttons.merge.off('click');
        this.buttons.refresh.off('click');
        // message
        this.message.off('click');
    };
    this.bind = function () {
        var self = this;
        // buttons
        self.buttons.upload.on('click', function (e) {
            if (!self.canUpload) {
                self.onFileStart(true);
                return false;
            }
            self.onUpload();
        });
        self.buttons.pause.on('click', function (e) {
            self.onPause();
        });
        self.buttons.merge.on('click', function (e) {
            self.handleMerge();
        });
        self.buttons.refresh.on('click', function (e) {
            self.handleCheck();
        });
        // message
        self.message.on('click', function (e) {
            if (UploadClient.options.completeStatus == self.data.status) {
                self.renderMessage(UploadClient.lang[UploadClient.options.lang]['fileComplete'], 'success');
            } else {
                self.file.trigger('click');
            }
        });
    };
    this.destory = function () {
        this.unbind();
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
        this.buttons.refresh.show();
        this.uploadOrMerge();
    };
    this.uploadOrMerge = function () {
        this.buttons.upload.hide();
        this.buttons.merge.hide();
        if (this.data.status == UploadClient.options.completeStatus) {
            return false;
        }
        if (this.data.chunks && this.data.chunks.length) {
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
        this.retries = UploadClient.options.upload.retries;
        this.isProcess = UploadClient.options.upload.workers;
        for (var w = 0; w < UploadClient.options.upload.workers; w++) {
            this.handleUpload();
        }
    };
    this.handleCheck = function () {
        var self = this;
        $.ajax({
            type: UploadClient.options.check.method,
            url: UploadClient.options.check.url,
            data: $.extend(UploadClient.options.check.hidden, {
                id: self.data.id
            }),
            success: function (result) {
                if (result.status && result.data.chunks) {
                    self.clearData(result.data);
                    self.render();
                }
            }
        });
    };
    this.handleMerge = function () {
        var self = this;
        self.renderMessage(UploadClient.lang[UploadClient.options.lang]['mergeStart'], '');
        $.ajax({
            type: UploadClient.options.merge.method,
            url: UploadClient.options.merge.url,
            data: $.extend(UploadClient.options.merge.hidden, {
                id: self.data.id,
                hash: self.data.hash
            }),
            success: function (result) {
                if (result.status) {
                    self.renderMessage(UploadClient.lang[UploadClient.options.lang]['mergeSuccess'], 'success');
                    self.data.status = UploadClient.options.completeStatus;
                    self.render();
                } else {
                    self.renderMessage(UploadClient.lang[UploadClient.options.lang]['mergeFail'], 'error');
                    self.buttons.pause.hide();
                    self.buttons.merge.show();
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
            self.buttons.pause.hide();
            self.buttons.upload.show();
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
                    type: UploadClient.options.upload.method,
                    url: UploadClient.options.upload.url,
                    data: $.extend(UploadClient.options.upload.hidden, {
                        id: self.data.id,
                        current_chunk_number: number,
                        start: start,
                        end: end,
                        data: window.btoa(fileReader.result)
                    }),
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
