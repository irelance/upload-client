/**
 * Created by irelance on 2017/2/10.
 */
(function () {
    UploadClient.init({
        target: '#client',
        title: 'test',
        lang: 'zh_cn',
        display: [
            {
                header: 'ID',
                render: function (item) {
                    return item.id
                },
                sort: 1
            },
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
            {id: 'name', label: '名称', sort: 3},
            {uploader: true, label: '上传文件', sort: 20}
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
                chunk_number: 4,
                chunks: [0, 1, 3]
            }
        ],
        check: {url: 'server/check.php', method: 'post', hidden: {}},
        upload: {
            url: 'server/upload.php',
            method: 'post',
            hidden: {},
            chunkSize: 3000/*2097152*/,
            workers: 4,
            retries: 20
        },
        merge: {url: 'server/merge.php', method: 'post', hidden: {}}
    });
})();
