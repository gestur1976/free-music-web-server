const http = require("http");
const url = require('url');
const yt = require('youtube-search-without-api-key');
const { spawn } = require('node:child_process');
const fs = require('fs');
var sanitize = require("sanitize-filename");
const { fstat } = require("fs");
const path = '/usr/local/mediaserver'
const urlPrefix = '';

async function youtubeSearch(queryObject, res, req) {
    var params_youtube_dl = [];
    const text = queryObject.text;
    const restart = queryObject.restart;
    const type = queryObject.type ? queryObject.type : 'audio';
    var format;
    var outputFormat;

    format = type.localeCompare('video') ? format = 'bestaudio' : 'bestvideo[ext=webm]+bestaudio[ext=webm]/best[ext=webm]/best';

    if (!format.localeCompare('bestaudio')) {
        outputFormat = queryObject.output_format ? queryObject.output_format : 'mp3';
        params_youtube_dl = ['-f', format, '-x', '--audio-format', outputFormat, '--prefer-ffmpeg', '--audio-quality', '0'];
    } else {
        outputFormat = queryObject.output_format ? queryObject.output_format : 'webm';
        format = 'bestvideo[width<=1920][ext=' + outputFormat + ']+bestaudio[ext=' + outputFormat + ']/best[width<=1920][ext=' + outputFormat + ']/best'
        params_youtube_dl = ['-f', format, '--merge-output-format', outputFormat, '--prefer-ffmpeg'];
    }

    const videos = await (await yt.search(text)).map(video => video).slice(0, 1);

    if (videos.length) {
        const title = videos[0].title;
        const url_yt = videos[0].url;
        const matches = /.{11}$/.exec(url_yt);
        const filename = sanitize(title).replace(/['\(\)\[\]\&]/g, "");
        const uri = encodeURI(filename);
        const fullpath = path + '/web/' + filename;
        const parameters = new URLSearchParams('filename=' + uri + '&type=' + type + '&text=' + text);

        if (restart) {
            if (fs.existsSync(fullpath + '.log'))
                fs.unlinkSync(fullpath + '.log');
            if (fs.existsSync(fullpath + '.err'))
                fs.unlinkSync(fullpath + '.err');
            if (fs.existsSync(fullpath + '.webm'))
                fs.unlinkSync(fullpath + '.webm');
            if (fs.existsSync(fullpath + '.mp4'))
                fs.unlinkSync(fullpath + '.mp4');
            if (fs.existsSync(fullpath + '.mp3'))
                fs.unlinkSync(fullpath + '.mp3');
        }

        if (fs.existsSync(fullpath + '.log')) {
            res.writeHead(302, {
                'Location': urlPrefix + '/waitingroom.php?' + parameters
            });
            res.end();
            return;
        }

        if (!type.localeCompare('video')) {

            if (fs.existsSync(fullpath + '.mp4')) {
                outputFormat = 'mp4';
                if (fs.existsSync(fullpath + '.webm')) {
                    fs.unlinkSync(fullpath + '.webm')
                    res.writeHead(302, {
                        'Location': urlPrefix + '/' + uri + '.mp4'
                    });
                    res.end();
                    return;
                }
            }   
            else {
                if (fs.existsSync(fullpath + '.webm')) {
                    res.writeHead(302, {
                        'Location': urlPrefix + '/' + uri + '.webm'
                    });
                    res.end();
                    return
                }
            }
        }
        else {
            if (fs.existsSync(fullpath + '.mp3')) {
                res.writeHead(302, {
                    'Location': urlPrefix + '/' + uri + '.mp3'
                });
                res.end();
                return;
            }
        }

        fs.appendFileSync(fullpath + '.log', '[download] 0% ETA 99:99');

        params_youtube_dl.push('--socket-timeout', '10', '--retries', 'infinite', '--output', (fullpath + '.%(ext)s'), url_yt);
        const youtube_dl = spawn(path + "/youtube-dl", params_youtube_dl, { detached: true, stdio: ['pipe', 'pipe', 'pipe'] });

        youtube_dl.stdout.on('data', function(chunk) {
            if (chunk) fs.appendFileSync(fullpath + '.log', chunk);
        });
        youtube_dl.stderr.on('data', function(chunk) {
            if (chunk) fs.appendFileSync(fullpath + '.err', chunk);
        });
        youtube_dl.on('close', function(code, signal) {
            if (fs.existsSync(fullpath + '.log')) fs.unlinkSync(fullpath + '.log');
        });

        res.writeHead(302, {
            'Location': urlPrefix + '/waitingroom.php?' + parameters
        });
        res.end();
    }
}

http.createServer(function(req, res) {
    const queryObject = url.parse(req.url, true).query;

    if (queryObject.text) {
        youtubeSearch(queryObject, res, req);
    }

}).listen(1883, "0.0.0.0");
