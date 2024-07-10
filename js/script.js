document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("gameContainer");
    const startScreen = document.getElementById("startScreen");
    const gameScreen = document.getElementById("gameScreen");
    const scoreScreen = document.getElementById("scoreScreen");
    const startButton = document.getElementById("startButton");
    const restartButton = document.getElementById("restartButton");
    const timerDisplay = document.getElementById("timer");
    const bag = document.getElementById("bag");

    let gameInterval;
    let timerIntervalId;
    let spawnIntervalId;
    let objectsMissed = 0;
    const maxObjectsMissed = 0;
    const fastObjectSpeed = 10;
    const objectSpeed = 8; 
    const spawnInterval = 1000;
    const gameTime = 20; 

    const objectImages = [
        'https://img.icons8.com/?size=100&id=31227&format=png&color=FFFFFF',
        'https://img.icons8.com/?size=100&id=31227&format=png&color=FFFFFF',
        'https://img.icons8.com/?size=100&id=31227&format=png&color=FFFFFF',
        'https://img.icons8.com/?size=100&id=31227&format=png&color=FFFFFF'
    ];

    const fastObjectImage = 'https://img.icons8.com/?size=100&id=31227&format=png&color=ccaa56';

    function startGame() {
        objectsMissed = 0;

        clearInterval(gameInterval);
        clearInterval(timerIntervalId);
        clearInterval(spawnIntervalId);
        clearObjects();

        timerDisplay.textContent = `Tempo: ${gameTime} s`;
        startScreen.style.display = "none";
        gameScreen.style.display = "block";
        gameInterval = setInterval(gameLoop, 16);
        startTimer(gameTime);
        spawnIntervalId = setInterval(spawnObject, spawnInterval);
    }

    function startTimer(duration) {
        let timer = duration;
        timerIntervalId = setInterval(() => {
            timer--;
            timerDisplay.textContent = `Tempo: ${timer} s`;
            if (timer <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(gameInterval);
        clearInterval(timerIntervalId);
        clearInterval(spawnIntervalId);
        clearObjects();
        gameScreen.style.display = "none";
        scoreScreen.style.display = "block";
        if (objectsMissed > maxObjectsMissed) {
            showMessage("Você perdeu!");
        } else {
            showMessage("Você venceu!");
        }
    }

    function spawnObject() {
        const object = document.createElement("img");
        object.classList.add("object");

        let randomIndex;
        if (Math.random() < 0.8) {
            randomIndex = Math.floor(Math.random() * objectImages.length);
            object.src = objectImages[randomIndex];
        } else {
            object.src = fastObjectImage;
        }

        const size = 40;
        object.style.width = size + "px";
        object.style.height = size + "px";

        object.style.position = "absolute";
        object.style.left = Math.random() * (gameContainer.offsetWidth - size) + "px";
        object.style.top = "0px";
        gameScreen.appendChild(object);

        let speed = object.src === fastObjectImage ? fastObjectSpeed : objectSpeed;
        let interval = setInterval(() => {
            object.style.top = object.offsetTop + speed + "px";
            if (object.offsetTop > gameContainer.offsetHeight) {
                clearInterval(interval);
                object.remove();
                objectsMissed++;
                if (objectsMissed > maxObjectsMissed) {
                    endGame();
                }
            }
            if (checkCollision(object, bag)) {
                clearInterval(interval);
                object.remove();
            }
        }, 16);
    }

    function gameLoop() {
    }

    function checkCollision(obj1, obj2) {
        const rect1 = obj1.getBoundingClientRect();
        const rect2 = obj2.getBoundingClientRect();
        return !(rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom);
    }

    function showMessage(msg) {
        scoreScreen.querySelector("h2").textContent = msg;
    }

    function restartGame() {
        objectsMissed = 0;
        scoreScreen.style.display = "none";
        startScreen.style.display = "flex";
        clearObjects();
    }

    function moveBag(event) {
        let x;
        if (event.type === 'touchmove') {
            x = event.touches[0].clientX - gameContainer.offsetLeft;
        } else {
            x = event.clientX - gameContainer.offsetLeft;
        }
        bag.style.left = Math.min(Math.max(x - bag.offsetWidth / 2, 0), gameContainer.offsetWidth - bag.offsetWidth) + "px";
    }

    function clearObjects() {
        const objects = document.querySelectorAll(".object");
        objects.forEach(object => object.remove());
    }

    startButton.addEventListener("click", startGame);
    restartButton.addEventListener("click", restartGame);
    gameContainer.addEventListener("mousemove", moveBag);
    gameContainer.addEventListener("touchmove", moveBag, { passive: false });
});
