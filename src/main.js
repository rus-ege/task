//let url = 'data/paronyms.json';
// let ls; // localStorage (статистика)

let data; // Все задания
let param;
let currentTask; // Текущее задание
let variant; // Правильный вариант ответа
let answered = false; // false - ответ ещё не выбран; true - ответ выбран

// Элементы
const TASK_TEXT = document.querySelector('.context');
const TASK_HINT = document.querySelector('.hint');
const TASK_SOURCE = document.querySelector('.source');
const TASK_BUTTONSLIST = document.querySelector('.buttonslist');
const TASK_SHOWANSWER = document.querySelector('.showanswer');
const TASK_EXPLAIN = document.querySelector('.explain');
const TASK_EXPLAINP = document.querySelector('.explain p');

// Цвета
const COLOR_GRAY = '#3a3a3a';
const COLOR_CORRECT = '#70AD47';
const COLOR_WRONG = '#ED7D31';
const COLOR_WRONG2 = '#FF3333';

// Получает все задания
function getData(link) {
    fetch(link)
    .then(response => response.json())
    .then(commits => {
        data = commits[0].list;
        param = commits[0].param;
        //console.log(param);
        //console.log(data);
        document.title = param.title + ' — Русский язык';
        newTask();
});
}

// Получает задание из URL
let locationSearch = window.location.search.replace('?','');
getData('data/' + locationSearch + '.json');

// Подчищает за прошлыми заданиями
function clearTask() {
    answered = false;
    TASK_EXPLAIN.style.display = 'none';
    TASK_BUTTONSLIST.innerHTML = '';
    TASK_TEXT.innerHTML = '';
    TASK_SHOWANSWER.innerText = 'Не знаю';
    TASK_EXPLAIN.style.display = 'none';
    TASK_SOURCE.innerHTML = 'Источник: ';
}

// Генерирует новое задание
function newTask() {
    // Вызывает функцию, которая подчищает за прошлыми заданиями
    clearTask();

    // Выбирает случайное задание
    currentTask = data[Math.floor(Math.random() * data.length)];

    // Правильный ответ в отдельную переменную
    variant = currentTask.variants[0];

    // Перемешивает варианты
    if (param.randomize) {
        for (let i = currentTask.variants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentTask.variants[i], currentTask.variants[j]] = [currentTask.variants[j], currentTask.variants[i]];
        }
    }

    // Заполняет элемент с текстом и советом
    TASK_TEXT.innerText = currentTask.text.replace('_', '________');
    TASK_HINT.innerText = 'Выберите правильный вариант';
    TASK_HINT.style.color = '#7F7F7F';

    // Пишет, что нужно сделать
    switch (param.type || currentTask.type) {
        case 'choosem':
            TASK_HINT.innerText = 'Выберите несколько правильных вариантов';
            break;
        case 'input':
            TASK_HINT.innerText = 'Введите правильный ответ';
            break;
        default:
            TASK_HINT.innerText = 'Выберите правильный вариант';
            break;
    }
    
    // Источник
    if (currentTask.source) {
        switch (currentTask.source) {
            case "egefipi":
                TASK_SOURCE.innerHTML += '<a href="https://fipi.ru/ege/otkrytyy-bank-zadaniy-ege">ege.fipi.ru</a>';
                break
            case "osfipi":
                TASK_SOURCE.innerHTML += '<a href="http://os.fipi.ru/tasks/1/a">os.fipi.ru</a>';
                break
            default:
                TASK_SOURCE.innerHTML += currentTask.source;
                break
        }
    }
    else {
        TASK_SOURCE.innerHTML += 'не указан';
    }

    if (currentTask.egefipi) {
        TASK_SOURCE.innerHTML = 'Источник: <a href="https://fipi.ru/ege/otkrytyy-bank-zadaniy-ege">из заданий ege.fipi.ru</a>';
    }
    if (currentTask.osfipi) {
        TASK_SOURCE.innerHTML = 'Источник: <a href="http://os.fipi.ru/tasks/1/a">из заданий os.fipi.ru</a>';
    }

    switch (param.type || currentTask.type) {
        case 'choosem':
            TASK_HINT.innerText = 'Выберите несколько правильных вариантов';
            break;
        case 'input':
            TASK_BUTTONSLIST.innerHTML = '<input id="inputanswer" placeholder="Введите ответ">';
            break;
        default:
            // Создаёт кнопки
            for (let i of currentTask.variants) {
                TASK_BUTTONSLIST.innerHTML += '<button class="answerbuttons" data-index="' + i + '">' + i + '</button>';
            }

            // добавление addEventListener -> click всем кнопкам
            for (let i of document.querySelectorAll('.answerbuttons')) {
                i.addEventListener('click', function() {
                    checkAnswer(i.dataset.index);
                });
            }
            break;
    }

    
}

// Проверка правильности решения
function checkAnswer(answer) {
    TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace('________', '<span style="color: ' + COLOR_GRAY + '">' + variant + '</span>');

    if (!answered) {
        answered = true;
        TASK_SHOWANSWER.innerText = 'Продолжить';
        TASK_SHOWANSWER.focus();

        if (answer == variant) {
            TASK_HINT.innerText = 'Правильно!';
			TASK_HINT.style.color = COLOR_CORRECT;
        }
        else {
            TASK_HINT.innerText = 'Неправильно!';
            TASK_HINT.style.color = COLOR_WRONG;

            // Выделяет неправильный ответ
            for (let i of document.querySelectorAll('.answerbuttons')) {
                if (i.dataset.index == answer) {
                    i.style.backgroundColor = COLOR_WRONG2;
                }
            }
        };

        // Выделяет правильный ответ
        for (let i of document.querySelectorAll('.answerbuttons')) {
            if (i.dataset.index == variant) {
                i.style.backgroundColor = COLOR_CORRECT;
            }
        }

        // Показывает div с объяснением
        showExplain();
    }
}

// Кнопка "не знаю"
function idk() {
    if(!answered) {
        answered = true;
        TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace('________', '<span style="color: ' + COLOR_GRAY + '">' + variant + '</span>');
        showExplain();
    }
    else {
        showExplain();
        newTask();
    }
}

// Определения слов
function showExplain() {
    if (param.explain) {
        TASK_EXPLAIN.style.display = 'block';
        TASK_EXPLAINP.innerHTML = '...';
    }
}

// Выбор вариантов ответов с помощью клавиш на клавиатуре
document.addEventListener('keydown', document.addEventListener('keyup', function(event) {
    if (!isNaN(Number(event.key)) && Number(event.key) != 0 && Number(event.key) <= document.querySelectorAll('.answerbuttons').length) {
        document.querySelectorAll('.answerbuttons')[event.key - 1].focus();
    }
    if (event.code == 'Space' && event.code == 'Enter') {
        TASK_SHOWANSWER.focus();
    }
}));

// HELP
let helpopen = false;
let helpbox = document.querySelector('#help');
helpbox.style.display = 'none';
document.querySelector('#helplink').addEventListener('click', () => {
    if (helpopen) {
        helpbox.style.display = 'none';
    }
    else {
        helpbox.style.display = '';
    }
    helpopen = !helpopen;
    console.log(helpopen);
});