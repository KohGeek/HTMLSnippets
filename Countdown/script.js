let speedRatio = 1;
let minSpeed = 5;
let speedup = false;
let count = false;
let time = [6, 0, 0, 0];
let beepCount = 0;
let audio = new Audio('beep.mp3');


function flipTo(digit, n) {
    var current = digit.attr('data-num');
    digit.attr('data-num', n);
    digit.find('.front').attr('data-content', current);
    digit.find('.back, .under').attr('data-content', n);
    digit.find('.flap').css('display', 'block');
    setTimeout(function () {
        digit.find('.base').text(n);
        digit.find('.flap').css('display', 'none');
    }, 350);
}

function jumpTo(digit, n) {
    digit.attr('data-num', n);
    digit.find('.base').text(n);
}

function updateGroup(group, n, flip) {
    var digit1 = $('.ten' + group);
    var digit2 = $('.' + group);
    n = String(n);
    if (n.length == 1) n = '0' + n;
    var num1 = n.substr(0, 1);
    var num2 = n.substr(1, 1);
    if (digit1.attr('data-num') != num1) {
        if (flip) flipTo(digit1, num1);
        else jumpTo(digit1, num1);
    }
    if (digit2.attr('data-num') != num2) {
        if (flip) flipTo(digit2, num2);
        else jumpTo(digit2, num2);
    }
}

function updateSingle(group, n, flip) {
    var digit1 = $('.' + group);
    n = String(n);
    if (digit1.attr('data-num') != n) {
        if (flip) flipTo(digit1, n);
        else jumpTo(digit1, n);
    }
}

function setTime(time, flip) {
    updateGroup('hour', time[0], flip);
    updateGroup('min', time[1], flip);
    updateGroup('sec', time[2], flip);
    updateSingle('milli', time[3], flip);
}

//reduce time by 100th of a second
function reduceTime() {
    var hours = time[0];
    var minutes = time[1];
    var seconds = time[2];
    var milli = time[3];

    if (milli > 0) {
        milli--;
    } else {
        milli = 9;
        if (seconds > 0) {
            seconds--;
        } else {
            seconds = 59;
            if (minutes > 0) {
                minutes--;
            } else {
                minutes = 59;
                if (hours > 0) {
                    hours--;
                } else {
                    hours = 0;
                    minutes = 0;
                    seconds = 0;
                    milli = 0;
                }
            }
        }
    }
    return [hours, minutes, seconds, milli];
}

// update time to cookies
function updateTime(str) {
    localStorage.setItem('time' + str, time);
}

// read time from cookies
function readTime(str) {
    data = localStorage.getItem('time' + str);
    if (data == null) {
        data = "6,0,0,0";
    }
    data = data.split(',');
    data = data.map(function (x) {
        return parseInt(x);
    });
    return data;
}

function colourChange(time) {
    let black = new Color("srgb", [0.2, 0.2, 0.2]);
    let colourRange = black.range("red", {
        space: "srgb", // interpolation space
        outputSpace: "srgb"
    });
    percentage = clamp(1 - (time[0] * 3600 + time[1] * 60 + time[2]) / 20, 0, 1);
    document.documentElement.style.setProperty('--text-colour', colourRange(percentage));
}

function timeCalculation() {
    totalTimeinMilli = time[0] * 3600 * 10 + time[1] * 60 * 10 + time[2] * 10 + time[3];
    return totalTimeinMilli;
}

// start countdown
function startCountdown() {
    console.log("Count:" + count)
    if (count && timeCalculation() > 2) {
        setTime(time, true);
        time = reduceTime(time);
        updateTime("0");
        speedRatio = speedup ? speedRatio * 1.2 : 1;
        colourChange(time);

        beepCount++;
        if (beepCount == 10) {
            audio.play();
            beepCount = 0;
        }
    } else if (timeCalculation() < 100) {
        colourChange(time);
        beepCount++;
        if (beepCount == 15) {
            if (document.documentElement.style.getPropertyValue('--text-colour') != "white") {
                document.documentElement.style.setProperty('--text-colour', 'white');
            } else {
                colourChange(time);
            }
            beepCount = 0;
        }
    } else {
        colourChange(time);
    }
    setExactTimeout(function () {
        startCountdown(time);
    }, Math.max(100 / speedRatio, minSpeed), 5);
}

const setExactTimeout = function (callback, duration, resolution) {
    const start = (new Date()).getTime();
    const timeout = setInterval(function () {
        if ((new Date()).getTime() - start > duration) {
            callback();
            clearInterval(timeout);
        }
    }, resolution);

    return timeout;
};

const clearExactTimeout = function (timeout) {
    clearInterval(timeout);
};

function clamp(num, min, max) {
    return num <= min
        ? min
        : num >= max
            ? max
            : num
}

jQuery(function () {

    time = readTime("0");

    setTime(time, false);

    // n for increasing min speed
    // 1 for saving time slot 1
    // ctrl + 1 for loading time slot 1
    // 2 for saving time slot 2
    // ctrl + 2 for loading time slot 2
    document.addEventListener('keydown', function (e) {
        // if (e.key == "Enter") {
        //     speedup = !speedup;
        // } else if (e.key == "r") {
        if (e.key == "r") {
            time = [1, 21, 10, 5];
            setTime(time, true);
            updateTime("0");
        } else if (e.key == "s") {
            count = !count;
            // } else if (e.key == "m") {
            //     minSpeed = Math.max(minSpeed - 2.5, 1);
            // } else if (e.key == "n") {
            //     minSpeed = Math.min(minSpeed + 2.5, 50);
        } else if (e.key == "1") {
            time = [0, 20, 0, 0];
            setTime(time, true);
            updateTime("0");
        } else if (e.key == "2") {
            time = [0, 0, 40, 0];
            setTime(time, true);
            updateTime("0");
        }
    });

    startCountdown(time);

});