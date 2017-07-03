var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var litlat = '';
var title = '広告タイトル';
var detail = '広告詳細';
var ListPeriod = 0;
var currentIndex = 0;
var like = 0;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        width: '1520',
        height: '855',
        // パラメータの設定
        playerVars: {
            controls: 0,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            fs: 0,
            iv_load_policy: 3
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    player.loadPlaylist({
        list: 'PLRrQoYa3Zwevr6NGjV2n559bq18DinU7J',
        listType: 'playlist',
        index: '0'
    });
    autoplay: 1
}

function onPlayerStateChange(event) {
    chainsaw();
    if (player.getDuration() >= 35 && event.data == YT.PlayerState.PLAYING) {
        setTimeout(cutrigger, 30000);
    }
    reloadtrigger();
}

function onPlayerError(event) {
    cutrigger();
}

function chainsaw() {
    if (player.getPlayerState() == 1) {
        litlat = player.getVideoUrl().split("=");
        $.getJSON('https://script.google.com/macros/s/AKfycbyfOPAZmOBQShbylnyrh4nv84KMSH-d_CrKbEO3VG813gQ5HqY/exec?callback=?', {
            id: litlat[litlat.length - 1]
        })

        .done(function(data) {
            if ((data) && (data.AdData != null)) {
                title = data.AdData[0].EventTitle;
                detail = '<marquee hspace="200" scrollamount="12">' + data.AdData[0].EventDescription + '</marquee>';
                like = data.AdData[0].Like;
            } else {
                title = '広告タイトル';
                detail = '<marquee hspace="200" scrollamount="12"></marquee>';
                like = 0;
            }
            document.getElementById('theme').innerHTML = title;
            document.getElementById('data').innerHTML = detail;
            document.getElementById('likecount').innerHTML = "★" + like + "<br>いいね!";
        });
    }
}

function cutrigger() {
    ListPeriod = player.getPlaylist().length - 1;
    getIndex();
    if (player.getPlaylistIndex() == ListPeriod) {
        location.reload();
    } else {
        player.nextVideo();
    }
}

function reloadtrigger() {
    ListPeriod = player.getPlaylist().length - 1;
    getIndex();
    if (currentIndex == ListPeriod && player.getPlayerState() == 0) {
        location.reload();
    }
}

function getIndex() {
    if (player.getPlayerState() == 1) {
        currentIndex = player.getPlaylistIndex();
    }
}