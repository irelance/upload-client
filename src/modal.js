/**
 * Created by irelance on 2017/2/10.
 */
UploadClient.modal = {
    options: undefined,
    target: $('<div class="modal"><div class="modal-dialog"><div class="modal-header"><div class="close">×</div><h3></h3></div><div class="modal-content"></div><div class="modal-footer"></div></div></div>'),
    creator: undefined,
    init: function (options) {
        var self = this;
        self.creator = new UploadClient.Creator();
        self.options = options;
        options.sort(function (a, b) {
            return a.sort == b.sort ? 0 : a.sort > b.sort ? 1 : -1;
        });
        self.target
            .on('click', '.close', function () {
                self.hide();
            })
            .on('click', '.upload', function () {
                var inputs = self.target.find('input'),
                    data = {};
                inputs.each(function (i, v) {
                    data[v.name] = v.value;
                });
                data = $.extend(UploadClient.options.check.hidden, data, self.creator.data);
                if (!data.hash) {
                    self.creator.renderMessage(UploadClient.lang[UploadClient.options.lang]['fileStart'], 'error');
                    return false;
                }
                $.ajax({
                    type: UploadClient.options.check.method,
                    url: UploadClient.options.check.url,
                    data: data,
                    success: function (result) {
                        if (result.status) {
                            var item = new UploadClient.Item();
                            self.creator.file.off('change');
                            item.file = self.creator.file;
                            item.init(result.data);
                            item.render();
                            item.onHashSuccess();
                            item.buttons.upload.trigger('click');
                        }
                    }
                });
                self.hide();
            });
    },
    show: function () {
        this.target.show();
    },
    hide: function () {
        this.target.hide();
    },
    render: function () {
        this.target.find('.modal-header h3').html(UploadClient.lang[UploadClient.options.lang].modalTitle);
        this.target.find('.modal-footer').html('<button class="close">' +
            UploadClient.lang[UploadClient.options.lang].modalCancel +
            '</button><button class="upload">' + UploadClient.lang[UploadClient.options.lang].modalUpload +
            '</button>');
        var content = this.target.find('.modal-content');
        content.html('');
        this.options.forEach(function (v) {
            if (v.uploader) {
                this.creator.init();
                content.append(this.creator.target);
            } else {
                content.append('<div class="form-group"><label>' + v.label + '</label><input name="' + v.id + '"></div>');
            }
        }.bind(this));
    }
};
