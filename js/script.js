document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("gameContainer")
    const startScreen = document.getElementById("startScreen")
    const gameScreen = document.getElementById("gameScreen")
    const scoreScreen = document.getElementById("scoreScreen")
    const startButton = document.getElementById("startButton")
    const restartButton = document.getElementById("restartButton")
    const pointsDisplay = document.getElementById("points")
    const inputNickname = document.getElementById("inputNick")
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
    let quantityUsedCheat = 0;

    const objectImages = [
        './assets/memoria_ram2.png',
        './assets/memoria_ram2.png',
        './assets/memoria_ram2.png',
        './assets/memoria_ram2.png'
    ];

    const fastObjectImage = './assets/memoria_ram.png';

    function startGame() {
        fastObjectSpeed = 10;
        objectSpeed = 8; 
        objectsMissed = 0;
        points = 0;

        clearInterval(gameInterval);
        clearInterval(spawnIntervalId);
        clearObjects();

        pointsDisplay.textContent = `Pontuação: ${points}`;
        startScreen.style.display = "none";
        gameScreen.style.display = "block";
        gameInterval = setInterval(gameLoop, 16);
        spawnIntervalId = setInterval(spawnObject, spawnInterval);
    }

    function upPoint(ToAdd){
        points += ToAdd
        pointsDisplay.textContent = `Pontuação: ${points}`;
    }

    function endGame() {
        clearInterval(gameInterval);
        clearInterval(spawnIntervalId);
        quantityUsedCheat = 0;
        clearObjects();
        gameScreen.style.display = "none";
        scoreScreen.style.display = "block";
        showMessage("Fim de Jogo!");
    }

    async function sendData(name) {
        const cheater = usedCheat
        const score = points
        
            const response = await fetch('http://localhost:3000/savingScore', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, score, cheater }), // Converter os dados em JSON
            });
            if (response.ok) {
                
                restartButton.innerText = "Resetando..."
                restartButton.style.backgroundColor = "#1b0c01" 
                restartButton.style.cursor = "not-allowed"
                restartButton.disabled = true
                
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Sua pontuação de " + score + " foi salva.",
                    background: '#321f17',
                    color: '#caa568',
                    showConfirmButton: false,
                    timer: 3000,
                    toast: true
                }).then(() => {
                    // Restarting game
                    restartButton.innerText = "Voltar ao Início"
                    restartButton.style.backgroundColor = "#321f17"
                    restartButton.style.cursor = "auto"
                    restartButton.disabled = false
                    restartGame()
                })
            } else {
                console.error('Erro ao salvar variável:', response.statusText)
                return response.status
            }

        
    }

    function restartGame() {
        scoreScreen.style.display = "none"
        startScreen.style.display = "flex"
        clearObjects();
    }

    function optionSave() {
        const score = points
        if (score > 0)
            Swal.fire({
                title: "Salve sua pontuação de " + score + " pontos!",
                input: "text",
                inputAttributes: {
                autocapitalize: "off",
                placeholder: "Nickname",
                autocomplete: "off"
                },
                showDenyButton: true,
                confirmButtonText: "Salvar!",
                showLoaderOnConfirm: true,
                background: '#321f17',
                color: '#caa568',
                toast: true,
                position: 'top-end',
                preConfirm: async (name) => {
                    if (name.length >= 3) {
                        result = await sendData(name)
                        
                        if (result == 409) 
                            Swal.showValidationMessage(`Nickname já existente.`)
                        if (result == 500) 
                            Swal.showValidationMessage(`Por favor, chame o monitor responsável.`)
                    } else {
                        if (name.length < 1)
                            Swal.showValidationMessage(`Digite algo antes de salvar.`)
                        else
                            Swal.showValidationMessage(`O Nickname precisa ter no mínimo 3 caracteres.`)
                    }
                },
                denyButtonText: "Não Salvar"
            }).then((result) => {
                if (result.isDenied) {
                    restartGame()
                }
            })
        else
            restartGame()
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
            if (checkCollision(object, bag) && objectsMissed == 0) {
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
    restartButton.addEventListener("click", optionSave);
    gameContainer.addEventListener("mousemove", moveBag);
    gameContainer.addEventListener("touchmove", moveBag, { passive: false });


    let sequenciaDeTeclas = [];
    const sequenciaDesejada = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
cmd
    let limparSequencia;

    document.addEventListener('keydown', (event) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            sequenciaDeTeclas.push(event.key);

            if (sequenciaDeTeclas.length > sequenciaDesejada.length) {
                sequenciaDeTeclas.shift();
            }

            if (JSON.stringify(sequenciaDeTeclas) === JSON.stringify(sequenciaDesejada)) {
                if (objectSpeed > 5 && quantityUsedCheat < 3) {
                    console.log('Cheat actived!');
                    objectSpeed += -3
                    fastObjectSpeed += -3
                    usedCheat = true
                }
            }

            clearTimeout(limparSequencia);
            limparSequencia = setTimeout(() => {
                sequenciaDeTeclas = [];
            }, 1000);
        }
    });

});

