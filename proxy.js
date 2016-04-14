var cluster = require('cluster');
var http = require('http');

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < 1; i++) {
        cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
        cluster.fork();
    });
} else {
    var http = require('http');
    var querystring = require('querystring');
    var util = require('util');
    var request = require('request');
    var parse = require('url').parse
        // 创建http服务
    var app = http.createServer(function(req, res) {
        console.log(req.body)
        var method = req.method; //POST & GET ： name=zzl&email=zzl@sina.com
        // 设置接收数据编码格式为 UTF-8
        req.setEncoding('utf-8');
        var postData = "";
        // 数据块接收中
        req.on("data", function(postDataChunk) {
            postData += postDataChunk;
        });
        // 数据接收完毕，执行回调函数
        req.on("end", function() {
            console.log('数据接收完毕');
            // console.log(postData)
            var settings = JSON.parse(postData);
            // console.log(settings)
            var url = settings.url;
            console.log('url -- ' + url)
            var method = settings.method.toUpperCase();
            console.log('method -- ' + method)
            var headers = settings.HTTPHeader;
            var timeout = settings.timeout;
            console.log('headers -- ' + JSON.stringify(headers))
            if (method == "POST") {
                var data = settings.body;
                if (!data) {
                    data = settings.form.values;
                }
                console.log(data)
                request.post({
                    url: url,
                    headers: headers,
                    timeout: timeout
                }, function(error, response, body) {
                    callback(res, error, response, body)
                }).form(data)
            } else if (method == 'PUT') {
                var data = settings.body;
                console.log(data)
                request.put({
                    url: url,
                    headers: headers,
                    timeout: timeout
                }, function(error, response, body) {
                    callback(res, error, response, body)
                }).form(data);
            } else if (method == 'GET') {
                request.get({
                    url: url,
                    headers: headers,
                    timeout: timeout
                }, function(error, response, body) {
                    callback(res, error, response, body)
                });
            } else if (method == 'DELETE') {
                request.del({
                    url: url,
                    headers: headers,
                    timeout: timeout
                }, function(error, response, body) {
                    callback(res, error, response, body)
                });
            } else if (method == 'HEAD') {
                request.head({
                    url: url,
                    headers: headers,
                    timeout: timeout
                }, function(error, response, body) {
                    callback(res, error, response, body)
                });
            }

        });

    });

    function callback(res, error, response, body) {
        if (error && error.code == "ETIMEDOUT") {
            var data = {
                code: 504,
                message: 'Gateway Timeout'
            }
            res.writeHead(504, {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify(data));
        } else {
            res.writeHead(200, {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*"
            });
            res.end(body);
        }
    }
    app.listen(30007);
    console.log('server started');
}