let questionArray = [];
let correctAnswer;
let guessCondition = false;
let gameInterval;
let questionCounter, questionQuota;
let correctGuess, playtime, timer;
correctGuess = playtime = questionCounter = questionQuota = timer = 0;

$(document).ready(function () {
    $(".mode").on('click', function () {
        questionQuota = $(this).data("quota");
        $("#start-content").hide();
        $("#game-content").show();
        $.ajax({
            method: "GET",
            url: "dota_trivia.json",
        }).done(function (response) {
            fetchQuestions(response, questionQuota);
            gameInterval = setInterval(setQuizAndConditions, 100);
        });
    });

    $(".selectable").on("click", function () {
        if ($(".selectable").index(this) === correctAnswer) {
            correctGuess++;
        }
        guessCondition = true;
    });

    $("#back").on('click', function () {
        $("#end-content").hide();
        resetVariables();
        $("#start-content").show();
    })
});

function fetchQuestions(jsonData, quota) {
    let takenQuestion = [];
    while (takenQuestion.length < quota) {
        let randomNumber = Math.floor(Math.random() * jsonData.length);
        let questionObject = {};
        if ($.inArray(randomNumber, takenQuestion) === -1) {
            takenQuestion.push(randomNumber);
            questionObject.problem = jsonData[randomNumber].problem;
            questionObject.choices = scrambleChoices(jsonData[randomNumber].choices);
            questionArray.push(questionObject);
        }
    }
}

function scrambleChoices(choices) {
    let choicesNumber = [0, 1, 2, 3];
    let choicesArray = [];
    while (choicesNumber.length > 0) {
        let randomNumber = Math.floor(Math.random() * choicesNumber.length);
        let splicedNumber = choicesNumber.splice(randomNumber, 1);
        choicesArray[choicesNumber.length] = choices[splicedNumber];
    }
    return choicesArray;
}

function setQuizAndConditions() {
    if (timer <= 0 || (guessCondition) === true) {
        runQuiz();
        resetCondition();
    } else {
        timer -= 1;
        playtime += 1;
    }
    $("#score").find("span").text(`${correctGuess}/${questionQuota}`);
    $("#timer").find("span").text(Math.ceil(timer/10));
    $("#playtime").find("span").text(Math.floor(playtime));
}

function runQuiz() {
    if (questionArray.length !== 0) {
        setQuestion(questionArray.pop());
        console.log(questionArray);
        console.log("Arr Length: " + questionArray.length);
        questionCounter++;
    } else {
        showResult();
    }
}

function setQuestion(questionObject) {
    let problemObject = questionObject.problem;

    let questionInProblem = problemObject.question;
    let imageInProblem = problemObject.image;
    let loreInProblem = problemObject.lore;
    if (questionInProblem !== undefined) {
        showP($(".question p#question"), questionInProblem);
    } else {
        hideP($(".question p#question"));
    }
    if (imageInProblem !== undefined) {
        showImg($(".question > img"), imageInProblem);
    } else {
        hideImg($(".question > img"));
    }
    if (loreInProblem !== undefined) {
        showP($(".question  p#lore"), `"${loreInProblem}"`);
    } else {
        hideP($(".question  p#lore"));
    }

    //Set choices
    let choicesObject = questionObject.choices;
    let i = 0;
    while (i < choicesObject.length) {
        let currentList = $("ul#choices-list").find("li").eq(i);
        let pElement = currentList.find("p");
        let imageElement = currentList.find("img");
        let textInChoice = choicesObject[i].text;
        let imageInChoice = choicesObject[i].image;
        if (textInChoice !== undefined) {
            showP(pElement, textInChoice);
        } else {
            hideP(pElement)
        }
        if (imageInChoice !== undefined) {
            showImg(imageElement, imageInChoice);
        } else {
            hideImg(imageElement);
        }
        if (choicesObject[i].isCorrect === true) {
            correctAnswer = i;
        }
        i++;
    }
}

function showResult() {
    clearInterval(gameInterval);
    $("#game-content").hide();
    $("#end-content").show();
    $("#result").text(`${correctGuess}/${questionQuota}`);
    $("#playtime").text(`${playtime/10} seconds`);
}

function resetVariables() {
    correctGuess = playtime = questionCounter = questionQuota = 0;
    questionArray.length = 0;
    resetCondition();
}

function resetCondition() {
    timer = 80;
    guessCondition = false;
}

function showP(p, text) {
    p.text(text);
    p.show();
}

function hideP(p) {
    p.empty();
    p.hide();
}

function showImg(img, imgSource) {
    img.attr("src", imgSource);
    img.show();
}

function hideImg(img) {
    img.removeAttr("src");
    img.hide();
}
