const StartTimer = 399;

let root = document.documentElement;
let player1HP = 100;
let player2HP = 100;
let fightNo = 1;
let time = StartTimer;
let titleBlinker;
let blinkHealth;
let countdown;
let ko = false;
let restoring = false;
let started = true;
let preStart = false;

let isInfinite = true;
let isStartScreen = false;

let changeMode = () => {
    if (isInfinite) {
        root.style.setProperty("--infinite", "block");
        root.style.setProperty("--countdown", "none");
    } else {
        root.style.setProperty("--infinite", "none");
        root.style.setProperty("--countdown", "block");
    }
};

let triggerCountdown = () => {
    let time = StartTimer;

    countdown = setInterval(() => {
        let textElement = document.querySelector(".text.text-center");
        time -= 1;
        // pad time to two digits
        if (time < 10) {
            time = "0" + time;
        }
        textElement.innerText = time;
        if (time == 0) {
            clearInterval(countdown);
        }
    }, 1000);
};

let blinkTitle = () => {
    // if somehow race condition, cancel previous blinker
    clearInterval(titleBlinker);

    titleBlinker = setInterval(() => {
        root.style.setProperty("--ko-text", "block");
        setTimeout(() => {
            root.style.setProperty("--ko-text", "none");
        }, 700);
    }, 1400);
};

let koDisplay = (winPlayer) => {
    let name = document.querySelector(
        ".player" + winPlayer + ".names"
    ).innerText;

    root.style.setProperty("--title-size", "16rem");

    document.querySelector(".title-text").innerText = "KO";
    document.querySelector(".subtitle-text").innerText = name + " wins!";

    blinkTitle();
    clearInterval(countdown);

    // make sure losing player is actually 0 health
    setPlayerHealth(winPlayer == 1 ? 2 : 1, 0, true);
};

let startDisplay = () => {
    preStart = false;
    document.querySelector(".subtitle-text").innerText = "";
    root.style.setProperty("--title-size", "8rem");

    //flash title one time for one text, then once more with another text
    document.querySelector(".title-text").innerText = "ROUND " + fightNo;

    root.style.setProperty("--ko-text", "block");
    setTimeout(() => {
        root.style.setProperty("--ko-text", "none");
        setTimeout(() => {
            document.querySelector(".title-text").innerText = "FIGHT!";
            root.style.setProperty("--ko-text", "block");
            triggerCountdown();
            started = true;
            setTimeout(() => {
                root.style.setProperty("--ko-text", "none");
            }, 1000);
        }, 700);
    }, 1200);

    fightNo++;
};

let setPlayerHealth = (player, hp, isColorChange) => {
    root.style.setProperty("--health" + player, hp + "%");
    if (isColorChange) {
        let lumString = "--luminance" + player;
        root.style.setProperty("--hue" + player, 120 * (hp * 0.01));
        root.style.setProperty(lumString, 50 - hp * 0.01 * 22 + "%");
    }
};

let vibrateHealthBar = (playerNo) => {
    // get player health bar
    let playerHealthBar = document.querySelector(
        ".player" + playerNo + ".healthborder"
    );

    if (playerHealthBar.style.animation === "") {
        playerHealthBar.style.animation = "vibrate 0.2s";
        playerHealthBar.addEventListener("animationend", () => {
            playerHealthBar.style.animation = "";
        });
    }
};

// animate restore healthbar
let restoreHealthBar = () => {
    restoring = true;
    let restoreHealth = setInterval(() => {
        if (player1HP < 100) {
            player1HP += 2;
        }
        if (player2HP < 100) {
            player2HP += 2;
        }
        setPlayerHealth(1, player1HP, true);
        setPlayerHealth(2, player2HP, true);
        if (player1HP >= 100 && player2HP >= 100) {
            clearInterval(restoreHealth);
            restoring = false;
        }
    }, 10);
};

let reducePlayerHealth = (playerNo, changeHP) => {
    // get player health
    let hpString = "--health" + playerNo;
    let oldHP = root.style.getPropertyValue(hpString);
    oldHP = oldHP.replace("%", "");
    oldHP = parseInt(oldHP);

    // clear any blinking healths
    clearInterval(blinkHealth);

    // spamming button can cause glitchy display
    // these code check if button has been spammed recently
    if (playerNo == 1) {
        if (oldHP > player1HP) {
            oldHP = player1HP;
        }
    } else if (playerNo == 2) {
        if (oldHP > player2HP) {
            oldHP = player2HP;
        }
    }

    // setting the health, just to be sure
    setPlayerHealth(playerNo, oldHP, true);

    // change player health
    let newHP = oldHP + changeHP;
    if (newHP <= 0) {
        newHP = 0;
        ko = true;
    } else if (newHP >= 100) {
        newHP = 100;
    }

    // keep track of player health
    if (playerNo == 1) {
        player1HP = newHP;
    } else if (playerNo == 2) {
        player2HP = newHP;
    }

    vibrateHealthBar(playerNo);

    // if change in HP more than or equal 10%, blink .health between old and new value
    if (changeHP >= 10 || changeHP <= -10) {
        blinkHealth = setInterval(() => {
            setPlayerHealth(playerNo, oldHP, false);
            setTimeout(() => {
                setPlayerHealth(playerNo, newHP, false);
            }, 70);
        }, 140);
        setTimeout(() => {
            clearInterval(blinkHealth);
        }, 840);
    }

    setPlayerHealth(playerNo, newHP, true);

    if (ko) koDisplay(playerNo == 1 ? 2 : 1);
};

setPlayerHealth(1, 100, true);
setPlayerHealth(2, 100, true);
document.querySelector(".text.text-center").innerText = StartTimer;
changeMode();

// grab keyboard inputs
document.addEventListener("keydown", function (event) {
    // r key, reset healthbars and timers and status, except round count
    if (!gamepadConnected && !ko && !restoring) {
        // a key, reduce player 1 health by 3%
        if (event.key === 'a') {
            reducePlayerHealth(1, -3);
        }
        // z key, reduce player 1 health by 10%
        else if (event.key === 'z') {
            reducePlayerHealth(1, -10);
        }
        // l key, reduce player 2 health by 3%
        else if (event.key === 'l') {
            reducePlayerHealth(2, -3);
        }
        // , key, reduce player 2 health by 10%
        else if (event.key === ',') {
            reducePlayerHealth(2, -10);
        } else if (event.key === "delete") {
            reducePlayerHealth(2, -100);
        }
    }
    if (event.key === "r") {
        restoreHealthBar();
        clearInterval(titleBlinker);
        clearInterval(countdown);
        root.style.setProperty("--ko-text", "none");

        document.querySelector(".text.text-center").innerText = StartTimer;

        ko = false;
        if (isStartScreen) {
            started = false;
            preStart = true;
        } else {
            started = true;
            preStart = false;
        }
    }
});

// Add listener for gamepad connected, add detection for button
// 1, 2, 14, 15 and 11 (starting index 1)
// 1 = 10% damage, player 2
// 2 = 3% damage, player 2
// 14 = 3% damage, player 1
// 15 = 10% damage, player 1
// 11 = 100% damage, player 2
// holding down counts as pressing once
// releasing does not count as pressing
// use animationframe to check for button press

let gamepadConnected = false;
let gamepad = null;
let gamepadButton1 = false;
let gamepadButton2 = false;
let gamepadButton14 = false;
let gamepadButton15 = false;
let gamepadButton11 = false;

let gamepadLoop = () => {
    if (gamepadConnected && !restoring && !ko) {
        gamepad = navigator.getGamepads()[0];
        if (gamepad.buttons[1].pressed) {
            if (!gamepadButton1) {
                gamepadButton1 = true;
                reducePlayerHealth(2, -10);
                console.log("gamepad button 1 pressed");
            }
        } else {
            gamepadButton1 = false;
        }
        if (gamepad.buttons[2].pressed) {
            if (!gamepadButton2) {
                gamepadButton2 = true;
                reducePlayerHealth(2, -3);
                console.log("gamepad button 2 pressed");
            }
        } else {
            gamepadButton2 = false;
        }
        if (gamepad.buttons[14].pressed) {
            if (!gamepadButton14) {
                gamepadButton14 = true;
                reducePlayerHealth(1, -3);
                console.log("gamepad button 14 pressed");
            }
        } else {
            gamepadButton14 = false;
        }
        if (gamepad.buttons[15].pressed) {
            if (!gamepadButton15) {
                gamepadButton15 = true;
                reducePlayerHealth(1, -10);
                console.log("gamepad button 15 pressed");
            }
        } else {
            gamepadButton15 = false;
        }
        if (gamepad.buttons[11].pressed) {
            if (!gamepadButton11) {
                gamepadButton11 = true;
                reducePlayerHealth(2, -100);
                console.log("gamepad button 11 pressed");
            }
        } else {
            gamepadButton11 = false;
        }
    }
    window.requestAnimationFrame(gamepadLoop);
};

window.addEventListener("gamepadconnected", (e) => {
    gamepadConnected = true;
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", gamepad.index, gamepad.id, gamepad.buttons.length, gamepad.axes.length);
});

window.addEventListener("gamepaddisconnected", (e) => {
    gamepadConnected = false;
    gamepad = null;
    console.log("Gamepad disconnected.");
});

window.requestAnimationFrame(gamepadLoop);
