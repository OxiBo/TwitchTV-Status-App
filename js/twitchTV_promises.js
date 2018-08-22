$(document).ready(function() {

    const usersAll = ["ESL_SC2", "cretetion", "freecodecamp", "storbeck",
        "habathcx", "OgamingSC2", "RobotCaleb", "noobs2ninjas", "Orange_HS", "Rainbow6", "Ninja", "MOONMOON_OW"
    ];

    const DOMstrings = {
        $content: $('#content'),
        $lookUp: $('#searchUser'),
        $result: $('#result'),
        $users: $('.users'),
        $usersTemplate: $('#usersTemplate')
    }

    const colors = {
        $onlineButton: '#b478ed',
        $offlineButton: '#e6d2f9'
    }

    function loadInfo(channels, users) {
        const url = 'https://wind-bow.glitch.me/twitch-api/';
        const user = encodeURIComponent("ESL_SC2");
        let infoObject = {};

        const userPromises = users.map(user => {
            const userInfo = fetch(`${url}users/${user}?callback`, { cache: "reload" }).then(data => data.json());
            const userStream = fetch(`${url}streams/${user}?callback`, { cache: "reload" }).then(data => data.json())

            return Promise.all([userInfo, userStream]).then(responses => {
                // console.log(JSON.stringify(responses, null, 2));

                if ((responses[0].status >= 404 || responses[0].status <= 422)) {
                    infoObject = {
                        name: 'User does not exist or unavailable',
                        urlStream: 'https://www.twitch.tv/',
                        // urlStream: 'https://thumbsnap.com/i/Rh4aXQqX.png',
                        icon: 'https://thumbsnap.com/i/Rh4aXQqX.png',
                        status: 'unavailable'
                    }
                } else {
                    infoObject = {
                        name: responses[0].display_name,
                        urlStream: `https://www.twitch.tv/${userInfo.name}`,
                        icon: responses[0].logo
                    }

                    if (responses[1].stream == null) {
                        infoObject.status = 'Offline';
                    } else {
                        infoObject.status = `${responses[1].stream.channel.game}:${responses[1].stream.channel.status}`;
                    }
                }

                //display information about channels on the page
                if (channels === 'one') {
                    DOMstrings.$result.html(createHTML(infoObject));
                } else if (channels === 'all') {
                    DOMstrings.$content.append(createHTML(infoObject));
                } else if (channels === 'online' && infoObject.status !== 'Offline') {
                    console.log(infoObject.status)
                    DOMstrings.$content.append(createHTML(infoObject));
                } else if (channels === 'offline' && infoObject.status === "Offline") {
                    DOMstrings.$content.append(createHTML(infoObject));
                }

                // set div background-color to gray if the user is offline
                $('p:contains(Offline)').parent().parent().addClass('offline');
            });

        });

        // Run requests for all users and catch possible errors
        Promise.all(userPromises)
            .catch((error) => {
                // TODO: Display an error on the page (and include error.message).
                console.log("unable to get information from API");
                console.error(error);
                if (channels == 'one') {
                    DOMstrings.$result.empty();
                    DOMstrings.$result.html(`<div class="users offline">failed to load information</div>`);
                } else {
                    DOMstrings.$users.remove();
                    DOMstrings.$result.empty();
                    DOMstrings.$content.html(`<div class="users offline">failed to load information</div>`);
                }
            })
    }

    //display channels on the page
    function createHTML(data) {
        const rawTemplate = DOMstrings.$usersTemplate.html();
        const compiledTemplate = Handlebars.compile(rawTemplate);
        const generatedHTML = compiledTemplate(data);

        return generatedHTML;
    }

    // typeahead implementation
    const typeahead = (function() {
        let substringMatcher = function(strs) {
            return function findMatches(q, cb) {

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

    })();
    // end typeahead

    // load channels when page is ready
    loadInfo('all', usersAll);

    const DOMmanipulation = (function() {
        $('#all').css('background-color', colors.$onlineButton).siblings().css('background-color', colors.$offlineButton);

        // add event listener - when a button is clicked display respective list of channels
        $('.myButton').on('click', function() {
            DOMstrings.$users.remove();
            DOMstrings.$content.empty();
            DOMstrings.$result.empty();
            $(this).css('background-color', colors.$onlineButton).siblings().css('background-color', colors.$offlineButton);
            // console.log($(this).siblings());

            loadInfo(this.id, usersAll);
            console.log(this.id)
            return false
        });

        // find a twitch TV user and display information about it
        $('form').on('submit', function() {
            let lookUp = [DOMstrings.$lookUp.val()];
            DOMstrings.$result.empty();
            loadInfo('one', lookUp);
        });
    })();
})
