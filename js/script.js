document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("gameContainer")
    const startScreen = document.getElementById("startScreen")
    const gameScreen = document.getElementById("gameScreen")
    const scoreScreen = document.getElementById("scoreScreen")
    const startButton = document.getElementById("startButton")
    const restartButton = document.getElementById("restartButton")
    const pointsDisplay = document.getElementById("points")
    const inputNickname = document.getElementById("inputNick")
    const textInfoScore = document.getElementById("infoText")
    const bag = document.getElementById("bag")

    let gameInterval;
    // let timerIntervalId;
    let spawnIntervalId;
    let objectsMissed = 0;
    let points = 0;
    const maxObjectsMissed = 0;
    let fastObjectSpeed = 10;
    let objectSpeed = 8; 
    const spawnInterval = 1000;
    let usedCheat = false
    // const gameTime = 20; 

    const objectImages = [
        'https://img.icons8.com/?size=100&id=31227&format=png&color=FFFFFF',
        'https://img.icons8.com/?size=100&id=31227&format=png&color=FFFFFF',
        'https://img.icons8.com/?size=100&id=31227&format=png&color=FFFFFF',
        'https://img.icons8.com/?size=100&id=31227&format=png&color=FFFFFF'
    ];

    const fastObjectImage = 'https://img.icons8.com/?size=100&id=31227&format=png&color=ccaa56';

    function startGame() {
        fastObjectSpeed = 10;
        objectSpeed = 8; 
        objectsMissed = 0;
        points = 0;

        clearInterval(gameInterval);
        // clearInterval(timerIntervalId);
        clearInterval(spawnIntervalId);
        clearObjects();

        pointsDisplay.textContent = `Pontuação: ${points}`;
        startScreen.style.display = "none";
        gameScreen.style.display = "block";
        gameInterval = setInterval(gameLoop, 16);
        // startTimer(gameTime);
        spawnIntervalId = setInterval(spawnObject, spawnInterval);
    }

    // function startTimer(duration) {
    //     let timer = duration;
    //     timerIntervalId = setInterval(() => {
    //         timer--;
    //         pointsDisplay.textContent = `Tempo: ${timer} s`;
    //         if (timer <= 0) {
    //             endGame();
    //         }
    //     }, 1000);
    // }

    function upPoint(ToAdd){
        points += ToAdd
        pointsDisplay.textContent = `Pontuação: ${points}`;
    }

    function endGame() {
        clearInterval(gameInterval);
        // clearInterval(timerIntervalId);
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

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function sendData(score, cheater) {
        const name = inputNickname.value
        const response = await fetch('http://localhost:3000/savingScore', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, score, cheater }), // Converter os dados em JSON
        });

        if (response.ok) {
            const data = await response.json();
            textInfoScore.innerText = "Nickname salvo! Reiniciando..."
            sleep(5000).then(() => {
                // Restarting game
                scoreScreen.style.display = "none";
                startScreen.style.display = "flex";
                textInfoScore.innerText = "Digite seu NickName para salvar!"
                clearObjects();
            });
            

        } else {
            if (response.status == 409)
                textInfoScore.innerText = "Nickname já existente."
            else
                console.error('Erro ao salvar variável:', response.statusText)
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
                upPoint(1);
                if (points % 10 == 0) {
                    objectSpeed += 5
                    fastObjectSpeed += 5
                }
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
        if (inputNickname.value != "") {
            sendData(points, usedCheat)
        }
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


    let sequenciaDeTeclas = [];
    const sequenciaDesejada = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];

    let limparSequencia;

    document.addEventListener('keydown', (event) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            sequenciaDeTeclas.push(event.key);

            if (sequenciaDeTeclas.length > sequenciaDesejada.length) {
                sequenciaDeTeclas.shift();
            }

            if (JSON.stringify(sequenciaDeTeclas) === JSON.stringify(sequenciaDesejada)) {
                console.log('Cheat actived!');
                objectSpeed += -3
                fastObjectSpeed += -3
                usedCheat = true
            }

            clearTimeout(limparSequencia);
            limparSequencia = setTimeout(() => {
                sequenciaDeTeclas = [];
            }, 1000);
        }
    });

});

