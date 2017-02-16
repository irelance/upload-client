/**
 * Created by irelance on 2017/2/10.
 */
var UploadClient = {
    target: undefined,
    options: {},
    init: function (options) {
        var self = this;
        self.options = $.extend(self.options, options);
        self.target = $(self.options.target);
        self.target.html('<div class="upload-client"><div class="header"><div>' +
            self.options.title + '</div><div class="pull-right">' + self.options.buttons + '<button class="create">' +
            self.lang[self.options.lang].create + '</button>' +
            '</div></div><div class="content"></div></div>');
        self.target.find('.content').html(self.table.target);
        self.target.find('.upload-client').append(self.modal.target);
        self.table.init();
        self.modal.init(self.options.modal);
        self.target
            .on('click', '.create', function (e) {
                self.modal.render();
                self.modal.show();
            })
    }
};