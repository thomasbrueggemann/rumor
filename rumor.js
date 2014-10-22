var twitter = require("node-tweet-stream");
var config  = require("./config");
var aylien 	= require("./aylien");

var t = new twitter(config.twitter);

t.on("tweet", check);

t.on("error", function(e) {
	console.error(e);
});

t.track("#thomastest2014");

///////////////////////////////////////////////////////

// RUMOR
function rumor(tweet, answer) {

	aylien.call("entities", {"text": tweet.text}, function(entityResult) {

		aylien.call("sentiment", {"text": tweet.text}, function(sentimentResult) {

			var hasPerson = ("person" in entityResult.entities && entityResult.entities.person.length > 0);
			var hasSource = ("url" in entityResult.entities && entityResult.entities.url.length > 0);
			var isSubjective = (sentimentResult.subjectivity == "subjective" && sentimentResult.subjectivity_confidence > 0.5);

			if((hasPerson || hasSource) && !isSubjective) {
				return answer(false, sentimentResult, entityResult);
			}
			else {
				return answer(true, sentimentResult, entityResult);
			}
		});
	});
}

// SOURCE AMBIGUITY
function sourceAmbiguity(tweet, sentimentResult, answer) {
	var hasSource = ("url" in entityResult.entities && entityResult.entities.url.length > 0);

	if(hasSource && sentimentResult.polarity == "negative" && sentimentResult.polarity_confidence > 0.25) {
		answer(true);
	}
	else {
		answer(false);
	}
}

// ANXIETY
function anxiety(tweet, answer) {
	var whitelist = ["angst", "furcht", "fürchte", "scared", "scary", "horrible", "terrifying", "terible", "furchbar", "schlimm", "schlecht", "bad", "ängstlich", "schrecklick", "schreck", "horror"];
	var splitText = tweet.text.split(" ");
	for(var i in splitText) {
		if(whitelist.indexOf(splitText[i].toLowerCase()) >= 0) {
			answer(true);
			return;
		}
	}

	answer(false);
}

// PERSONAL INVOLVEMENT
function personalInvolvement(tweet, answer) {
	var whitelist = ["i'm", "ich", "meine", "unsere", "wir", "we", "our", "ours", "mine", "i"];
	var splitText = tweet.text.split(" ");
	for(var i in splitText) {
		if(whitelist.indexOf(splitText[i].toLowerCase()) >= 0) {
			answer(true);
			return;
		}
	}

	answer(false);
}

// CONTENT AMBIGUITY
function contentAmbiguity(tweet, answer) {
	if(tweet.text.indexOf("?") > 5) {
		answer(true);
	}
	else {
		answer(false);
	}
}

// SOCIAL TIES
function socialTies(tweet, answer) {

	if(!("entities" in tweet)) return answer(false);

	if(tweet.entities.user_mentions.length > 0) {
		answer(true);
	}
	else {
		answer(false);
	}
}

////////////////////////////////////////////////////////////

function check(tweet) {

	console.log("");
	console.log("------")
	console.log(tweet.user.screen_name + ":");
	console.log(tweet.text);
	console.log("");

	rumor(tweet, function(answer, sentimentResult, entityResult) 
	{ 
		                                                           console.log("> Rumor               : ", answer); 
		sourceAmbiguity(tweet, sentimentResult, function(answer) { console.log("> SourceAmbiguity     : ", answer); });
		anxiety                         (tweet, function(answer) { console.log("> Anxiety             : ", answer); });
		personalInvolvement             (tweet, function(answer) { console.log("> PersonalInvolvement : ", answer); });
		contentAmbiguity                (tweet, function(answer) { console.log("> ContentAmbiguity    : ", answer); });
		socialTies                      (tweet, function(answer) { console.log("> SocialTies          : ", answer); });

	});
}