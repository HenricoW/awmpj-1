var google = require('googleapis');
var gmail = google.gmail('v1');
var drive = google.drive('v2');

var key = require('./GmailAPItest-090be0084e20.json');
var jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/drive.readonly'],
    null
);

jwtClient.authorize((err,tokens) => {
    if(err){
        console.log(err);
        return;
    }

    // make authorized request to list labels
    gmail.users.labels.list({
        auth: jwtClient,
        userId: 'me'
    }, (err, resp) => {
        if(err){
            console.log(err);
        } else {
            console.log(resp);
        }
    });
    // drive.files.list({
    //     auth: jwtClient
    // }, function (err, resp) {
    //     // handle err and response
    //     if(err){
    //         console.log(err);
    //     } else {
    //         console.log(resp);
    //     }
    // });
});

/**
 * Retrieve Messages in user's mailbox matching query.
 *
 * @param userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param query String used to filter the Messages listed.
 * @param callback Function to call when the request is complete.
 */
function listMessages(userId, query, callback) {
    var getPageOfMessages = function(request, result) {
        request.execute(function(resp) {
            result = result.concat(resp.messages);
            var nextPageToken = resp.nextPageToken;
            if (nextPageToken) {
                request = gapi.client.gmail.users.messages.list({
                    // auth: jwtClient,
                    'userId': userId,
                    'pageToken': nextPageToken,
                    'q': query
                });
                getPageOfMessages(request, result);
            } else {
                callback(result);
            }
        });
    };

    var initialRequest = gapi.client.gmail.users.messages.list({
        // auth: jwtClient,
        'userId': userId,
        'q': query
    });

    getPageOfMessages(initialRequest, []);
  }