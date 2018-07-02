$(document).ready(function() {


    const usersAll = ["ESL_SC2", "cretetion", "freecodecamp", "storbeck",
        "habathcx", "OgamingSC2", "RobotCaleb", "noobs2ninjas", "Orange_HS", "Rainbow6", "Ninja", "MOONMOON_OW"
    ];
    const $content = $('#content');
    const $lookUp = $('#searchUser');
    const $result = $('#result');
    const $users = $('.users');
    const $usersTemplate = $('#usersTemplate');
    const $onlineButton = '#b478ed';
    const $offlineButton = '#e6d2f9';

    /* function that gets info about twitch TV users performing ajax request*/
    function loadInfo(channels, users) {

        const url = 'https://wind-bow.glitch.me/twitch-api/';

        // iterate over array of twitch TV users to perform ajax request for each one
        for (var i = 0, n = users.length; i < n; i++) {

            let object = {};
            let user = users[i];

            let ajaxRequestTimeout = setTimeout(function() {
                if (channels == 'one') {
                    $result.empty();
                    $result.html('<div class="users offline">failed to load information</div>');
                } else {
                    $users.remove();
                    $result.empty();
                    $content.html('<div class="users offline">failed to load information</div>');
                }
            }, 8000);

            $.ajax({
                url: url + 'users/' + encodeURIComponent(user) + '?callback',
                cache: false,
                success: function(dataUsers) {
                    //console.log(dataUsers);
                    // check if the user exist and requested via html form
                    if ((dataUsers.status >= 404 || dataUsers.status <= 422) && channels == 'one') {
                        object = {
                            name: 'User does not exist or unavailable',
                            urlStream: 'https://www.twitch.tv/',
                            // urlStream: 'https://thumbsnap.com/i/Rh4aXQqX.png',
                            icon: 'https://thumbsnap.com/i/Rh4aXQqX.png',
                            status: 'unavailable'
                        }
                        $result.html(createHTML(object));

                        // $result.html('<div class="container users group test"><img id="notExist" src="https://thumbsnap.com/i/Rh4aXQqX.png" \
                        //  style="max-width:15%"><p id="pNotExist"><strong>-----User does not exist or unavailable-----</strong></p></div>');
                        clearTimeout(ajaxRequestTimeout);
                    } else {
                        // check if user from given array of users exists
                        if (dataUsers.status >= 404 || dataUsers.status <= 422) {
                            object = {
                                name: 'User does not exist or unavailable',
                                urlStream: 'https://www.twitch.tv/',
                                // urlStream: 'https://thumbsnap.com/i/Rh4aXQqX.png',
                                icon: 'https://thumbsnap.com/i/Rh4aXQqX.png',
                                status: ''
                            }
                            console.log(dataUsers.name);
                        } else {
                            object = {
                                name: dataUsers.display_name,
                                urlStream: 'https://www.twitch.tv/' + dataUsers.name,
                                icon: dataUsers.logo
                            }
                        }

                        $.ajax({
                            url: url + 'streams/' + user + '?callback',
                            cache: false,
                            success: function(dataStreams) {
                                //console.log(dataStreams);

                                if (dataStreams.stream == null) {
                                    object.status = 'Offline';
                                } else {
                                    object.status = dataStreams.stream.channel.game + ': ' + dataStreams.stream.channel.status;
                                }


                                //display information about channels on the page
                                if (channels == 'all') {
                                    $content.append(createHTML(object));
                                } else if (channels == 'online' && object.status != 'Offline') {
                                    $content.append(createHTML(object));
                                } else if (channels == 'offline' && object.status == "Offline") {
                                    $content.append(createHTML(object));
                                } else if (channels == 'one') {
                                    $result.html(createHTML(object));
                                }

                                // set div background-color to grey if the user is offline
                                $('p:contains(Offline)').parent().parent().addClass('offline');

                                clearTimeout(ajaxRequestTimeout);

                            },
                            error: function() {
                                console.log("unable to get information from API");
                            }
                        })

                    }

                },

                error: function() {
                    console.log("unable to get information from API");
                }

            })
        }
    }

    //display channels on the page
    function createHTML(data) {
        const rawTemplate = $usersTemplate.html();
        const compiledTemplate = Handlebars.compile(rawTemplate);
        const generatedHTML = compiledTemplate(data);

        return generatedHTML;
    }

    // typeahead implementation
    let substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            console.log("it works")
            let matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function(i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    $('#searchForm .typeahead').typeahead({
        hint: false,
        highlight: false,
        minLength: 1,
        cache: false
    }, {
        name: 'users',
        source: substringMatcher(usersAll)
    });

    // load channels when page is ready
    loadInfo('all', usersAll);
    $('#all').css('background-color', $onlineButton).siblings().css('background-color', $offlineButton);

    // add event listener - when a button is clicked display respective list of channels
    $('.myButton').on('click', function() {
        $users.remove();
        $content.empty();
        $result.empty();
        $(this).css('background-color', $onlineButton).siblings().css('background-color', $offlineButton);
        console.log($(this).siblings());

        loadInfo(this.id, usersAll);
        return false
    })

    // find a twitch TV user and display information about it
    $('form').on('submit', function() {
        let lookUp = [$lookUp.val()];
        $result.empty();
        loadInfo('one', lookUp);
    })

})
