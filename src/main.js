let data; // переменная, в которую сохраняется массив в заданиями
let param; // переменная, в которую сохраняются параметры упражнения
let currentTask; // переменная, в которую сохраняется текущее задание
let answered = false;   // true - на задание дан ответ, кнопки не работают, кнопка "Продолжить"
                        // false - на задание не дан ответ, кнопки работают, кнопка "Не знаю"
let variants; // варианты в неперемешенном виде

/* элементы */
const TASK_TEXT = document.querySelector('#tasktext');
const TASK_HELP = document.querySelector('#taskhelp');
const TASK_BUTTONSLIST = document.querySelector('#taskbuttons');
const TASK_IDK = document.querySelector('.dontknowbtn');
const TASK_SOURCE = document.querySelector('#tasksource');

const HEADER_H1 = document.querySelector('header h1');

/* Получение массива */
function getData(link) {
    fetch(link)
        .then(response => response.json())
        .then(commits => {
            data = commits.data;
            param = commits.param;
            document.title = param.title /*+ ' — Русский язык'*/;

            console.log(data.length);

            /* help */
            document.querySelector('#helpdesc').innerText = param.desc;

            if (param.fontsize == 'small') {
                TASK_TEXT.classList.add('small');
            }

            /* генерация задания при запуске */
            generateTask();
        });
}

// get url
let urlData = window.location.search.replace('?','');

//urlData = urlData.replace(/\&/gmi, '","');
//urlData = urlData.replace(/\=/gmi, '":"');

urlData = (urlData.replace(/\&/gmi, '","')).replace(/\=/gmi, '":"');
urlData = '{"' + urlData + '"}';

urlData = JSON.parse(urlData);

//console.log(urlData);

getData('data/' + urlData.task + '.json');

/* Генерация задания */
function generateTask() {

    // Сбрасывает элементы
    TASK_TEXT.innerHTML = '';
    TASK_BUTTONSLIST.innerHTML = '';
    TASK_IDK.innerHTML = 'Не знаю';
    answered = false;
    TASK_SOURCE.innerText = '';
    HEADER_H1.innerText = param.title2;
    
    // Выбирает случайное задание
    currentTask = data[Math.floor(Math.random() * data.length)];
    if (typeof currentTask.vars == 'string') {
        currentTask.vars = Array(currentTask.vars);
    }
    variants = currentTask.vars;
    
    // Источник
    function returnSource() {
        switch (currentTask.source) {
            case 'osfipi':
                return '<a href="http://os.fipi.ru/" target="_blank">os.fipi.ru</a>';
            default:
                return currentTask.source;
        }
    }
    if (currentTask.source) {
        TASK_SOURCE.innerHTML = 'Источник: ' + returnSource();
    }
    else {
        TASK_SOURCE.innerText = '';
    }

    if (param.randomize) {
        for (let i = currentTask.vars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentTask.vars[i], currentTask.vars[j]] = [currentTask.vars[j], currentTask.vars[i]];
        }
    }
    
    // Изменяет элементы
    TASK_TEXT.innerHTML = currentTask.text.replace('_', '________').replace('/', '_');
    
    switch (param.type) {
        case 'input':
            // Вариант 'input': генерация поля ввода
            if (!param.customhint) {
                TASK_HELP.innerText = 'Введите ответ';
            }
            TASK_BUTTONSLIST.innerHTML = '<input id="taskinput"><button id="confirmbtn" class="taskbtn" onclick="checkInput()">Сохранить</button>';
            break;
        default:
            // Вариант 'choose': генерация кнопок
            if (!param.customhint) {
                TASK_HELP.innerText = 'Выберите правильный ответ';
            }
            for (let i of currentTask.vars) {
                TASK_BUTTONSLIST.innerHTML += '<button id="answerbtn" class="taskbtn">' + i + '</button>';
            }
            for (let j of document.querySelectorAll('#answerbtn')) {
                j.addEventListener('click', () => {
                    checkAnswer(j.innerText);
                });
            }
            break;
    }

    // Если присутствует кастомная подсказка, то происходит вот это
    if (param.customhint) {
        let customhint = param.customhint;
        TASK_HELP.innerHTML = customhint.replace('{1}', '<span style="font-weight: 800;">' + currentTask.ch + '</span>');
    }

}

/* Проверка задания (тип choose) */
function checkAnswer(val) {
    if (!answered) {
        answered = true;
        TASK_IDK.innerText = 'Продолжить';
        TASK_IDK.focus();
        TASK_TEXT.innerHTML = TASK_TEXT.innerHTML.replace('________', '<span style="color: var(--theme-color-gray);">' + currentTask.vars[currentTask.cor] + '</span>');
        
        if (val == variants[currentTask.cor]) {
            TASK_HELP.innerHTML = '<span style="color: #70ad47;">Правильно</span>';

        }
        else {
            TASK_HELP.innerHTML = '<span style="color: #ed7d31;">Неправильно</span>';

            // Выделяет неправильный ответ
            for (let i of document.querySelectorAll('#answerbtn')) {
                if ((i.innerText == val) && (val != variants[currentTask.cor])) {
                    i.classList = 'taskbtn wrong';
                }
            }
        }
    }

    // Выделяет правильный ответ
    for (let i of document.querySelectorAll('#answerbtn')) {
        if (i.innerText == variants[currentTask.cor]) {
            i.classList = 'taskbtn correct';
        }
    }
}

/* Проверка задания (тип input) */
function checkInput() {
    if (!answered) {
        answered = true;
        TASK_IDK.innerText = 'Продолжить';
        TASK_IDK.focus();
        document.querySelector('#confirmbtn').remove();

        document.querySelector('#taskinput').setAttribute('readonly', true);
        if (document.querySelector('#taskinput').value.toLowerCase() == currentTask.vars[0].toLowerCase()) {
            TASK_HELP.innerHTML = '<span style="color: #70ad47;">Правильно</span>';
        }
        else {
            TASK_HELP.innerHTML = '<span style="color: #ed7d31;">Неправильно.</span><br/><span style="color: var(--theme-color-gray);font-size: 90%;">Правильный ответ: ' + currentTask.vars[0] + '</span>';
        }
    }
}

/* Проверка задания (для select) */
/*
function checkSelect() {
    if (!answered) {
        answered = true;
        TASK_IDK.innerText = 'Продолжить';
        TASK_IDK.focus();
    }
}
*/

/* Кнопка "Не знаю/Продолжить" */
function idkAnswer() {
    if (!answered) {
        answered = true;
        TASK_IDK.innerText = 'Продолжить';
    }
    else {
        generateTask();
        if (param.type == 'input') {
            document.querySelector('#taskinput').focus();
        }
    }
}