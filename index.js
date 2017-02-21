/**
 * Created by irelance on 2017/2/10.
 */
(function () {
    UploadClient.init({
        target: '#client',
        title: 'test',
        completeStatus: 'complete',
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
        data: 'server/getList.php',
        check: {
            url: 'server/check.php', method: 'post', hidden: {}, column: [
                {o: 'id', i: 'id'},
                {o: 'status', i: 'status'},
                {o: 'hash', i: 'md5'},
                {o: 'size', i: 'size'},
                {o: 'chunk_size', i: 'chunk_size'},
                {o: 'chunk_number', i: 'chunk_number'},
                {o: 'chunks', i: 'chunks'}
            ]
        },
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
