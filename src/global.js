/**
 * Created by irelance on 2017/2/10.
 */
var UploadClient = {
    target: undefined,
    options: {
        title: '',
        lang: 'zh_cn',
        display: [],
        modal: [],
        data: [],
        check: {url: '', method: 'post', hidden: {}},
        upload: {
            url: '',
            method: 'post',
            hidden: {},
            chunkSize: 2097152,
            workers: 4,
            retries: 20
        },
        merge: {url: '', method: 'post', hidden: {}},
        hash: {
            defaults: "md5", chunkSize: 2097152,
            adapters: {
                md5: {className: "SparkMD5", method: {reset: "reset", append: "appendBinary", final: "end"}},
                sha1: {className: "Rusha", method: {reset: "resetState", append: "append", final: "end"}}
            }
        }
    },
    init: function (options) {
        var self = this;
        if (!window.btoa || !window.FileReader) {
            self.target.html(UploadClient.lang[UploadClient.options.lang]['html5SupportError']);
            return false;
        }
        self.options = $.extend(self.options, options);
        self.target = $(self.options.target);
        self.target.html('<div class="upload-client"><div class="header"><div>' +
            self.options.title + '</div><div class="pull-right"><button class="create">' +
            self.lang[self.options.lang].create + '</button>' +
            '</div></div><div class="content"></div></div>');
        self.target.find('.content').html(self.table.target);
        self.target.find('.upload-client').append(self.modal.target);
        self.table.init();
        self.modal.init(self.options.modal);
        self.target.on('click', '.create', function (e) {
            self.modal.render();
            self.modal.show();
        });
    }
};
