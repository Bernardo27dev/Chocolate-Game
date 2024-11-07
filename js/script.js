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
    const cheatsCounter = document.getElementById("cheatCounter")

    let gameInterval;
    // let timerIntervalId;
    let spawnIntervalId;
    let objectsMissed = 0;
    let points = 0;
    const maxObjectsMissed = 0;
    let fastObjectSpeed = 5;
    let objectSpeed = 3; 
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
        if (points == 3 && quantityUsedCheat == 0) {
            let timerInterval;
            Swal.fire({
                title: "<span style='font-size: 24px;'>Psst! Use o código <span style='font-size: 28px;'>J.B.I.</span></span>",
                timer: 6000,
                timerProgressBar: true,
                showConfirmButton: false,
                background: '#781dff',
                color: '#ffffff',
                toast: true,
                position: 'top-end',
                willClose: () => {
                    clearInterval(timerInterval);
                }
            })
        }
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
        cheatsCounter.setAttribute('data-text', '')
        cheatsCounter.innerText = ''
        cheatsCounter.style.color = '#fff'
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
                restartButton.style.backgroundColor = "#340776" 
                restartButton.style.cursor = "not-allowed"
                restartButton.disabled = true
                
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: (score > 1) ? "Sua pontuação de " + score + " pontos, foi salva." : "Sua pontuação de " + score + " ponto, foi salva.",
                    background: '#781dff',
                    color: '#ffffff',
                    showConfirmButton: false,
                    timer: 3000,
                    toast: true
                }).then(() => {
                    // Restarting game
                    restartButton.innerText = "Voltar ao Início"
                    restartButton.style.backgroundColor = "#781dff"
                    restartButton.style.cursor = "pointer"
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
                title: (score > 1) ? "<span style='font-size: 24px;'>Salve sua pontuação de <br><span style='font-size: 26px;'>" + score + " pontos!</span></span>" : "<span style='font-size: 24px;'>Salve sua pontuação de <br><span style='font-size: 26px;'>" + score + " ponto...</span></span>",
                input: "text",
                inputAttributes: {
                autocapitalize: "off",
                placeholder: "Nickname",
                autocomplete: "off"
                },
                showDenyButton: true,
                inputAutoFocus: true,
                confirmButtonText: "Salvar!",
                showLoaderOnConfirm: true,
                background: '#781dff',
                color: '#ffffff',
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
                    objectSpeed += 1
                    fastObjectSpeed += 1
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
    const sequenciaDesejada = ['j', 'b', 'i'];
    let limparSequencia;
    let inAction = false;

    document.addEventListener('keydown', (event) => {
        try {
            if (inAction == false) 
                sequenciaDeTeclas.push(event.key.toLowerCase());
        } catch {
            if (inAction == false) 
                sequenciaDeTeclas.push(event.key);
        }

        if (sequenciaDeTeclas.length > sequenciaDesejada.length) {
            sequenciaDeTeclas.shift();
        }

        if (JSON.stringify(sequenciaDeTeclas) === JSON.stringify(sequenciaDesejada)) {
            if (objectSpeed > 5 && quantityUsedCheat < 3) { 
                inAction = true
                setTimeout(() => { 
                    quantityUsedCheat == 3 ? cheatsCounter.style.color = "#ffff00" : cheatsCounter.style.color = "#ffffff"
                    cheatsCounter.setAttribute('data-text', 'J.B.I. : ' + quantityUsedCheat)
                    cheatsCounter.innerText = 'J.B.I. : ' + quantityUsedCheat
                }, 2000)              
                console.log('Cheat actived!')
                objectSpeed += -3
                fastObjectSpeed += -3
                usedCheat = true
                quantityUsedCheat++
                setTimeout(() => {
                    inAction = false
                }, 5000)
                cheatsCounter.setAttribute('data-text', 'VELOCIDADE R3DUZ1D4')
                cheatsCounter.innerText = 'VELOCIDADE REDUZIDA'
                cheatsCounter.style.color = "red"
            } else {
                if (quantityUsedCheat >= 3) {
                    inAction = true
                    setTimeout(() => {
                        inAction = false
                    }, 3000)
                    if (quantityUsedCheat > 7) {
                        objectSpeed += 5
                        fastObjectSpeed += 5
                        quantityUsedCheat++
                        cheatsCounter.setAttribute('data-text', 'FATAL 3RR0R!')
                        cheatsCounter.innerText = 'FATAL 3RR0R!'
                    } else if (quantityUsedCheat == 4) {
                        cheatsCounter.setAttribute('data-text', 'ERROR!')
                        cheatsCounter.innerText = 'ERR0R!'
                        setTimeout(() => {
                            quantityUsedCheat++   
                            cheatsCounter.setAttribute('data-text', 'J.B.I. : Limite Excedido.')
                            cheatsCounter.innerText = 'J.B.I. : Limite Excedido.'
                        }, 2000)
                    } else if (quantityUsedCheat == 5) {
                        cheatsCounter.setAttribute('data-text', '3rR0r!')
                        cheatsCounter.innerText = '3rR0r!'
                        setTimeout(() => {
                            quantityUsedCheat++
                            cheatsCounter.setAttribute('data-text', 'J.B.I. : Limite Excedido.')
                            cheatsCounter.innerText = 'J.B.I. : Limite Excedido.'
                        }, 2000)
                    } else if (quantityUsedCheat == 6) {
                        cheatsCounter.setAttribute('data-text', 'msgerrorbox :(')
                        cheatsCounter.innerText = 'msgerrorbox :('
                        setTimeout(() => {
                            quantityUsedCheat++
                            cheatsCounter.setAttribute('data-text', 'J.B.I. : Limite Excedido.')
                            cheatsCounter.innerText = 'J.B.I. : Limite Excedido.'
                        }, 2000)
                    } else {
                        quantityUsedCheat++
                        cheatsCounter.style.color = "red"
                        cheatsCounter.setAttribute('data-text', 'J.B.I. : Limite Excedido.')
                        cheatsCounter.innerText = 'J.B.I. : Limite Excedido.'
                    }
                }
            }
        }

        clearTimeout(limparSequencia);
        limparSequencia = setTimeout(() => {
            sequenciaDeTeclas = [];
        }, 1000);
    });

});

