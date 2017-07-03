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
var listId = '';
var api_url = 'https://script.google.com/macros/s/AKfycbyfOPAZmOBQShbylnyrh4nv84KMSH-d_CrKbEO3VG813gQ5HqY/exec?callback=?';

function ClientSelect(num) {
    switch (num) {
        case 1:
            listId = 'PLRrQoYa3Zwevr6NGjV2n559bq18DinU7J';
            break;
        case 2:
            listId = 'PLRrQoYa3Zweu6fJmqgeg12N50H6taZST3';
            break;
        case 3:
            listId = 'PLRrQoYa3ZwevDdo0cYqdMbwaZelZ2SKGq';
            break;
        case 4:
            listId = 'PLRrQoYa3ZwevyIhODOo1_ijv_4R3yiBg7';
            break;
        case 5:
            listId = 'PLRrQoYa3Zwety5ebmf0pUo1CS34DSyUKR';
            break;
        case 6:
            listId = 'PLRrQoYa3ZwevcxIGw6ME6zvu6NEFY4RFQ';
            break;
        case 7:
            listId = 'PLRrQoYa3ZwevGnn9_PL5WD6QOYdT_dOyv';
            break;
        case 8:
            listId = 'PLRrQoYa3ZweuwX-OUyIMqgJAIGeLusrJf';
            break;
        default:
            listId = null;
            break;
    }
}

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
        list: listId,
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
        $.getJSON(api_url, {
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