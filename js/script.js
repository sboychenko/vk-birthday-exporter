/**
 * Created by SBoichenko on 19.12.2016.
 */
moment.locale('ru');

/** new toStr proto function for Array*/
function fToStr() {
    var str = "";
    for (i = 0; i < this.length; i++) {
        if (this[i] === undefined) continue;
        str += this[i];
        if (i + 1 < this.length) str += ",";
    }
    return str;
}
Array.prototype.toStr = fToStr;

var birtdayList;
var userInfo;

function dateFormatter(date) {
    if (date.getYear() == "0") {
        return moment(date).format("D MMMM");
    } else {
        return moment(date).format("D MMMM YYYY г.");
    }
}

/** on load */
$(document).ready(function () {
    VK.Auth.getLoginStatus(function (r) {
        if (r.session) {
            console.log("Already auth");
            uiLogin();
        }
        else {
            console.log("Not auth");
        }
    });
});

function getUserInfo(logout) {
    if (logout) {
        $("#userInfo").text("");
        return;
    }
    console.log("Getting user info");
    VK.Api.call(
        "users.get",
        {fields : "first_name,second_name"},
        function (r) {
            if (r.response) {
                $("#userInfo").text("  Пользователь: " + r.response[0].first_name + " " + r.response[0].last_name);
            }
        }
    );

}

/** UI functions */
function uiLogin() {
    getUserInfo();
    $("#login").addClass("disabled");
    $("#logout").removeClass("disabled");
}

function uiLogout() {
    getUserInfo(true);
    $("#login").removeClass("disabled");
    $("#logout").addClass("disabled");
}

function uiExportOn() {
    $("#export").removeClass("disabled");
}

/** buttons action functions */
$("#login").click(function (event) {
    event.preventDefault();
    console.log("login");
    VK.Auth.login(
        function (r) {
            if (r.session) {
                uiLogin();
            }
        },
        VK.access.FRIENDS
    );
});

$("#logout").click(function (event) {
    event.preventDefault();
    console.log("logout");
    VK.Auth.logout(function () {
        uiLogout();
    });
});

$("#start").click(function (event) {

    event.preventDefault();
    VK.Api.call(
        "friends.get",
        {
            order: "name",
            fields: "bdate,nickname,city,domain"

        },
        function (r) {
            if (r.response) {
                var resp = r.response;
                var status = {
                    "all": 0,
                    "deact": 0,
                    "bday": 0
                };

                if (resp.length >= 0) {
                    status.all = resp.length;
                    // Filter blocked users
                    var filterResp = resp.filter(function (e) {
                        return !e.hasOwnProperty("deactivated");
                    });
                    status.deact = filterResp.length;
                    // now without bdate
                    filterResp = filterResp.filter(function (e) {
                        return e.hasOwnProperty("bdate");
                    });
                    status.bday = filterResp.length;
                }

                // Output status
                $("#result").text(
                    "Всего друзей: " + (status.all) +
                    " | Заблокированных: " + (status.all - status.deact) +
                    " | Без дня рождения: " + (status.all - status.bday) +
                    " | Итого: " + filterResp.length);

                // Collect SET of friend`s city ids
                var cityIds = [];
                filterResp.forEach(function (e) {
                    cityIds[e.city] = e.city;
                });

                //console.log(filterResp);

                // Call VK api for cities name
                VK.Api.call(
                    "database.getCitiesById",
                    {
                        "city_ids": cityIds.toStr()
                    },
                    function (r) {
                        if (r.response) {
                            var cityMap = r.response;

                            // Now transform api result to human-read view
                            filterResp.forEach(function (e) {
                                e.check = "<input type='checkbox' id='"+e.uid+"' class='e'/>";
                                // create link
                                e.link = "http://vk.com/" + e.domain;
                                e.alink = "<a href=" + e.link + " target='_blank'>" + e.link + "</a>";
                                // now Date from vk response
                                var dt = e.bdate.split(".");
                                var date;
                                if (dt.length == 2) {
                                    // DD.MM
                                    date = new Date("1900", dt[1] - 1, dt[0]);
                                } else {
                                    // DD.MM.YYYY
                                    date = new Date(dt[2], dt[1] - 1, dt[0]);
                                }
                                e.birthday = date;
                                // Name of City
                                e.city = getCityName(e.city);
                            });

                            // Get city name from api response
                            function getCityName(id) {
                                for (i = 0; i < cityMap.length; i++) {
                                    if (id == cityMap[i].cid) {
                                        return cityMap[i].name;
                                    }
                                }
                                return id==0 ? "-" : id;
                            }

                            $("#data").bootstrapTable({
                                data: filterResp,
                                search : true,
                            });

                            //TODO process only selected
                            birtdayList = filterResp;
                            uiExportOn();

                            $("input#all").change(function (event) {
                                event.preventDefault();
                                if ($(this).prop("checked")) {
                                    $("input.e").prop("checked", true);
                                } else {
                                    $("input.e").prop("checked", false);
                                }
                            });
                        }
                    }
                );
            }
        });
});

$("#export").click(function (event) {
    event.preventDefault();

    if (birtdayList === undefined) {
        alert("Список пуст!");
        return;
    }

    var cal = ics("ru-RU");
    c = 0;
    birtdayList.forEach(function (e) {
        if ($("input#"+e.uid).prop("checked")) {
            cal.addEvent(
                "ДР " + e.first_name + " " + e.last_name,
                e.link,
                e.city,
                e.birthday, e.birthday);
            c++;
        }
    });
    alert("Будет выгруженно " + c + " дней рождений");
    cal.download("vk-birtdays");
});