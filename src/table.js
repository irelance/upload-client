/**
 * Created by irelance on 2017/2/10.
 */
UploadClient.table = {
    target: $('<table><thead><tr></tr></thead><tbody></tbody></table>'),
    init: function () {
        UploadClient.options.display.sort(function (a, b) {
            return a.sort == b.sort ? 0 : a.sort > b.sort ? 1 : -1;
        });
        var header = this.target.find('thead>tr');
        UploadClient.options.display.forEach(function (v) {
            if (v.uploader) {
                header.append('<th>' + v.uploader + '</th>');
            } else {
                header.append('<th>' + v.header + '</th>');
            }
        });
        switch (typeof UploadClient.options.data) {
            case 'string':
                $.ajax({
                    url: UploadClient.options.data,
                    success: function (result) {
                        if (result.status) {
                            UploadClient.options.data = result.data;
                            UploadClient.table.render();
                        }
                    }
                });
                break;
            case 'object':
                this.render();
                break;
        }
    },
    render: function () {
        var tbody = this.target.children('tbody');
        UploadClient.options.data.forEach(function (v) {
            var item = new UploadClient.Item();
            item.init(v);
            tbody.append(item.target);
        });
    }
};
