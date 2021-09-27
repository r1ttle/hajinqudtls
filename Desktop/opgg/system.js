var worst = 0;
var worse = 0;
var common = 0;
var better = 0;
var best = 0;

var tier;
var rank;
var LP;
var wins;
var losses;
var winRate;

var IDX = 0;

function searchToggle(obj, evt) {
    var container = $(obj).closest('.search-wrapper');
    if (!container.hasClass('active')) {
        container.addClass('active');
        evt.preventDefault();
    }
    else if (container.hasClass('active') && $(obj).closest('.input-holder').length == 0) {
        container.removeClass('active');

        container.find('.search-input').val('');
    }
}

function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
  }

function myfunc() {
    location.href = "result.html";
}

function myfunc2() {
    location.href = "search.html";
}

function myfunc3() {
    location.href = "error.html";
}

function myfunc4() {
    location.href = "Index.html";
}

function setNickname() {

    var name = document.getElementById("search").value;
    window.localStorage.setItem('name', name);
    console.log(window.localStorage.getItem('name'));
}

function setResult() {

    window.localStorage.setItem('worst', worst);
    window.localStorage.setItem('worse', worse);
    window.localStorage.setItem('common', common);
    window.localStorage.setItem('better', better);
    window.localStorage.setItem('best', best);

}

function loadNickname() {
    return window.localStorage.getItem('name');
}


function loadInfo(){

    if(IDX == 10){

        var teamLucky = Math.max(worst, worse, common, better, best);

        document.getElementById("teamSkill").innerHTML = "팀운: " + teamLucky;

        document.getElementById("tier").innerHTML = tier;

        document.getElementById("leaguePoints").innerHTML = LP;

        document.getElementById("wins").innerHTML = wins;

        document.getElementById("losses").innerHTML = losses;

        document.getElementById("winRate").innerHTML = winRate;
    }
    else{
        setTimeout(function() {
            loadInfo();
         }, 1000);
    }
}

function enterkey(element, API_KEY) {

    var nickname = element;

    $.ajax({
        method: "GET",
        url: "https://cors0327.herokuapp.com/https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + nickname + "?api_key=" + API_KEY,
        data: { summonerName: nickname },

        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": "https://developer.riotgames.com"
        },
        success: function (result) {

            console.log(result)

            $.ajax({
                method: "GET",
                url: "https://cors0327.herokuapp.com/https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/" + result.id + "?api_key=" + API_KEY,
                data: { encryptedSummonerId: result.id },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",
                    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                    "Origin": "https://developer.riotgames.com"
                }
            })
                .done(function (msg) {
                    console.log(msg);

                    var i = 0;

                    for (i = 0; i < 2; i++) {
                        if (msg[i].queueType == "RANKED_SOLO_5x5") {
                            console.log(msg[i].tier);
                            tier = msg[i].tier + " " + msg[i].rank;
                            LP = "점수: " + msg[i].leaguePoints + "LP";
                            wins = "wins: " + msg[i].wins;
                            losses = "losses: " + msg[i].losses;
                            winRate = "승률: " + ((msg[i].wins /  (msg[i].wins + msg[i].losses))*100).toFixed(1) + "%";
                            break;
                        }
                    }
                })

            $.ajax({
                method: "GET",
                url: "https://cors0327.herokuapp.com/https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/" + result.accountId + "?api_key=" + API_KEY,
                data: { encryptedAccountId: result.accountId },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",
                    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                    "Origin": "https://developer.riotgames.com"
                }
            })
                .done(function (msg) {

                    var index;
                    var gameID = [];

                    for (index = 0; index < 10; index++) {
                        gameID[index] = msg.matches[index].gameId

                        $.ajax({
                            method: "GET",
                            url: "https://cors0327.herokuapp.com/https://kr.api.riotgames.com/lol/match/v4/matches/" + gameID[index] + "?api_key=" + API_KEY,
                            data: { matchId: gameID[index] },
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36",
                                "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
                                "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
                                "Origin": "https://developer.riotgames.com"
                            }
                        })
                            .done(function (msg) {

                                console.log(msg);

                                var KDA;
                                var myTeam;
                                var myKDA = 0;
                                var otherKDA = 0;

                                var mySkill;
                                var teamSkill;

                                for (index = 0; index < 10; index++) {
                                    if (msg.participantIdentities[index].player.summonerName == nickname) {
                                        if (parseFloat(((msg.participants[index].stats.kills + msg.participants[index].stats.assists) / msg.participants[index].stats.deaths)).toFixed(2) == Infinity) {
                                            myKDA = parseFloat(((msg.participants[index].stats.kills + msg.participants[index].stats.assists)).toFixed(2));
                                        }
                                        else {
                                            myKDA = parseFloat(((msg.participants[index].stats.kills + msg.participants[index].stats.assists) / msg.participants[index].stats.deaths).toFixed(2));
                                        }
                                        myTeam = msg.participants[index].teamId;
                                    }
                                    KDA = ((msg.participants[index].stats.kills + msg.participants[index].stats.assists) / msg.participants[index].stats.deaths).toFixed(2);
                                    console.log(msg.participantIdentities[index].player.summonerName + ",  kda:" + KDA);
                                }


                                for (index = 0; index < 10; index++) {
                                    if (msg.participants[index].teamId == myTeam && msg.participantIdentities[index].player.summonerName != nickname) {

                                        if (parseFloat(((msg.participants[index].stats.kills + msg.participants[index].stats.assists) / msg.participants[index].stats.deaths)).toFixed(2) == Infinity) {
                                            otherKDA += parseFloat((msg.participants[index].stats.kills + msg.participants[index].stats.assists).toFixed(2));
                                        }
                                        else {
                                            otherKDA += parseFloat(((msg.participants[index].stats.kills + msg.participants[index].stats.assists) / msg.participants[index].stats.deaths).toFixed(2));
                                        }
                                    }
                                }

                                otherKDA /= 4;

                                console.log("나의 KDA : " + myKDA);
                                console.log("팀원의 KDA : " + otherKDA);

                                if (otherKDA < 1) {
                                    teamSkill = "인력거";
                                    worst++;
                                }
                                else if (1 <= otherKDA && otherKDA < 2) {
                                    teamSkill = "마차";
                                    worse++;
                                }
                                else if (2 <= otherKDA && otherKDA <= 3) {
                                    teamSkill = "자가용";
                                    common++;
                                }
                                else if (3 <= otherKDA && otherKDA <= 6) {
                                    teamSkill = "버스";
                                    better++;
                                }
                                else if (otherKDA > 5) {
                                    teamSkill = "KTX";
                                    best++;
                                }
                                
                                console.log(IDX);
                                IDX++;
                            })
                    }
                });
        },
        error: function (request, status, error) {
            myfunc3();
        }
    })
}

function output(){
    console.log(worst);
    console.log(worse);
    console.log(common);
    console.log(better);
    console.log(best);
}