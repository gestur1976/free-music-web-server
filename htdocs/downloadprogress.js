console.clear();

var lastprogress = '';
var retries = 0;
var percent = 0;
const fileprefix = '/' + document.querySelector('div.progress-text').getAttribute('filename');
const logfile = fileprefix + '.log';
const errorfile = fileprefix + '.err';

function setProgress(progress, ffmpeg) {
    if (!ffmpeg && !progress.localeCompare(lastprogress)) {
        retries++;
        if (retries >= 30) {
            document.querySelector(".progress-text").innerText = "Download error! Restarting...";
            document.querySelector(".progress-text").setAttribute('style', 'color: tomato');
            const text = document.querySelector('div.title').getAnimations('text');
            const type = document.querySelector('div.title').getAttribute('type');
            const params = new URLSearchParams('text=' + text + (type ? '&type=' + type : '') + '&restart=1');
            window.location.replace('/download?' + params.toString());
            window.clearInterval(timer);
        }
    } else {
        retries = 0;
        lastprogress = progress;
        percent = ffmpeg ? 100 : parseInt(/^[ ]*[0-9]+/.exec(progress));
        tiemporestante = ffmpeg ? 'Converting format...' : /[0-9\:]+[ ]*$/.exec(progress);
        if (percent) {
            const rojo = (100 - percent) * 256 / 100;
            const verde = 256 - rojo;
            const azul = rojo / 2;
            document.querySelector('div.bar').setAttribute('style', `width: ${percent}%; background-color: rgb(${rojo}, ${verde}, ${azul})`);
            if (tiemporestante) {
                document.querySelector(".progress-text").innerText = (`${percent} % - ${tiemporestante}`);
            }
        }
    }
}

async function fetchLog() {
    let response = await fetch(logfile);

    if (response.status == 200) {
        let data = await response.text();
        const ffmpeg = /ffmpeg/.exec(data);
        const progress = (/[0-9\]/.exec(/[0-9]+[%] of [^ ]+ at [^ ]+ ETA [^ ]+$/.exec(data) || '0%').toString();
        if (progress) setProgress(progress, ffmpeg ? true : false);

    } else {
        const text = document.querySelector('div.title').getAttribute('text');
        const type = document.querySelector('div.title').getAttribute('type');
        var parameters = 'text=' + text;
        var params;
        if (type) {
            parameters = parameters + '&type=' + type;
        }
        params = new URLSearchParams(parameters);
        window.location.replace('/download?' + params.toString());
        window.clearInterval(timer);
    }
}

const timer = setInterval(function() {
    fetchLog();
}, 500);