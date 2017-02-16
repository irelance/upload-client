/**
 * Created by irelance on 2017/2/10.
 */
(function () {
    UploadClient.init({
        target: '#client',
        title: 'test',
        lang: 'zh_cn',
        buttons: '',
        display: [
            {
                header: '名称',
                render: function (item) {
                    return item.name;
                },
                sort: 1
            }, {
                uploader: '操作',
                buttons: function (item) {
                    var deleteBtn = $('<button data-id="' + item.id + '">delete</button>');
                    deleteBtn.on('click', function (e) {
                        alert('delete');
                    });
                    return [deleteBtn];
                },
                sort: 2
            }
        ],
        modal: [
            {id: 'name', label: '名称', sort: 1},
            {uploader: true, label: '上传文件', sort: 2}
        ],
        data: [
            {
                id: 1,
                name: '官方sdk.zip',
                status: 'processing',
                path: '',
                hash: '3374d0055e6c4cd087f597a661d3151d',
                size: 10240,
                chunk_size: 1024,
                chunk_number: 10,
                chunks: []
            }
        ],
        check: {url: 'server/check.php'},
        upload: {url: 'http://', chunkSize: 2097152},
        merge: {url: 'http://'},
        hash: {
            defaults: "md5", chunkSize: 2097152,
            adapters: {
                md5: {className: "SparkMD5", method: {reset: "reset", append: "appendBinary", final: "end"}},
                sha1: {className: "Rusha", method: {reset: "resetState", append: "append", final: "end"}}
            }
        }
    });
})();