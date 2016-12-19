/**
 * Created by SBoichenko on 19.12.2016.
 */
$(function () {
    VK.Auth.getLoginStatus(function(r){
        if(r.session) {
            console.log("Already auth");
            console.log(r);
            uiLogin();
        }
        else {
            uiLogout();
        }
    });
});

function uiLogin() {
    $("#login").addClass("disabled");
    $("#logout").removeClass("disabled");
}

function uiLogout() {
    $("#login").removeClass("disabled");
    $("#logout").addClass("disabled");
}

$("#login").click(function (event) {
    event.preventDefault();
    console.log("login");
    VK.Auth.login(null, VK.access.FRIENDS);
    uiLogin();
});

$("#logout").click(function (event) {
    event.preventDefault();
    console.log("logout");
    VK.Auth.logout( function () {
        uiLogout();
    });
});

$("#start").click(function (event) {
    event.preventDefault();
    VK.Api.call(
        "friends.get",
        {
            order : "name",
            fields : "bdate,nickname,city,domain",

        },
        function (r) {
            var resp = r.response;
            var status = {
                "all" : 0,
                "deact" : 0,
                "bday" : 0
            };

            if (resp.length >= 0) {
                status.all = resp.length;

                var woDeact = resp.filter(function (e) {
                    return !e.hasOwnProperty("deactivated");
                });
                status.deact = woDeact.length;

                var woEmptyBday = woDeact.filter(function (e) {
                    return e.hasOwnProperty("bdate");
                });
                status.bday = woEmptyBday.length;

            }

            woEmptyBday.forEach(function (e) {
                e.link = "http://vk.com/"+e.domain;
                e.link = "<a href="+e.link+" target='_blank'>"+e.link + "</a>";
                e.birthday = e.bdate;
            });

            console.log(woEmptyBday);
            $("#result").text(
                "Всего друзей: "+(status.all)+
                " | Заблокированных: "+(status.all - status.deact)+
                " | Без дня рождения: "+(status.all-status.bday)+
                " | Итого: "+woEmptyBday.length);

            $("#data").bootstrapTable(
                {data : woEmptyBday}
            );
        });
});