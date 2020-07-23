'use-strict';

let recordObjects = [];
let pageNumber;
let recordPerPage = 5;

const pagination = document.querySelector('.pagination');
const form_addRecord = document.querySelector('.form-submit');
form_addRecord['name'].focus();

let recordEdited;
let index;
let modeEdit = false;

const addRecord = () => {

    recordObjects.length === 0 ? cod = 0 :
        cod = recordObjects[recordObjects.length - 1].cod + 1;

    const Record = {
        cod: cod,
        name: form_addRecord['name'].value,
        dateofbirth: form_addRecord['dateofbirth'].value,
        email: form_addRecord['email'].value,
        tel: form_addRecord['tel'].value
    }

    if (modeEdit) {
        Record.cod = recordEdited.cod;
        addEditedRecordStorage(Record);

    } else {
        recordObjects.push(Record);
        pageNumber = Math.ceil(recordObjects.length / recordPerPage);
        addRecordStorage(recordObjects);
    }
}

const addRecordStorage = recordObjects => {

    localStorage.setItem('recordObjects', JSON.stringify(recordObjects));
    updateView();
    updatePageNumber(pageNumber);
}

const addEditedRecordStorage = (record) => {

    recordObjects.splice(index, 1, record);
    localStorage.setItem('recordObjects', JSON.stringify(recordObjects));

    updatePageNumber(pageNumber);
    modeEdit = false;
    btn_add.children[0].src = "img/icon-add.svg";
}

const loadRecordFromStorage = () => {
    let str = localStorage.getItem('recordObjects');

    if (str) {
        recordObjects = JSON.parse(str);
    }

    updateView();
    pageNumber = Math.ceil(recordObjects.length / recordPerPage);
    updatePageNumber(pageNumber);
}

const templateRecord = records => {
    const tbody = document.getElementById('tbody');

    tbody.innerHTML = '';
    records.forEach((record, i) => {

        const { cod, name, dateofbirth, email, tel } = record;

        tbody.innerHTML += `
            <tr>
               <td><label><input type="checkbox" class="checkbox" data-select="checkbox" data-id=${cod} name=${cod} ></label></td>
                <td>${name}</td>
                <td>${dateofbirth}</td>
                <td>${email}</td>
                <td>${tel}</td>
                 <td><button class="btn btn-edit " data-type="btn-edit " data-id=${cod}><img src="img/edit.svg " title="editar usuário! "></button>
                    <button class="btn btn-delete " data-type="btn-delete " data-id=${cod}><img src="img/delete.svg " title="deletar usuário! "></button>
                 </td>
            </tr>
            `
    });

    form_addRecord.reset();
    form_addRecord['name'].focus();
}

const editRecord = e => {
    const button = e.target.closest('button');

    if (!button) {
        return false;
    }

    const fields = document.querySelectorAll('[data-input]');

    if (button.dataset.type == "btn-edit ") {
        modeEdit = true;

        btn_add.children[0].src = "img/edit-user.svg";

        recordObjects.filter((record, i) => {

            if (record.cod == button.dataset.id) {
                index = i;

                let recordObject = [record.name, record.dateofbirth, record.email, record.tel];
                recordObject.forEach((record, i) => fields[i].value = record);

                recordEdited = record;
            }
        });
    }
}

const messageNumberRegister = () => {
    let numberRegisters = recordObjects.length;
    document.getElementById('countRegister').innerHTML = numberRegisters;
}

const loadPagination = numberPages => {

    pagination.innerHTML = `
    <span class="countPage">Página ${pageNumber} de ${numberPages} :</span>
        <a href="#" title="Voltar" class="pagination__btn-previous" data-type="previous">&laquo;</a>
        <a href="#" title="Próximo" class="pagination__btn-next" data-type="next">&raquo;</a>
    `
    let btnNext = document.querySelector('.pagination__btn-next');

    new Array(numberPages).fill('').map((_, i) => {
        const btnPagination = document.createElement('a');
        let numberPage = document.createTextNode = i + 1;
        btnPagination.innerHTML = numberPage;
        btnPagination.dataset.page = i;
        return pagination.insertBefore(btnPagination, btnNext);
    });

    paginationController();
}

const paginationController = () => {

    const btnPageNumber = document.querySelectorAll("[data-page]"),
        btnControllPagination = document.querySelectorAll("[data-type]");

    [...btnPageNumber, ...btnControllPagination].forEach(btn => {
        btn.addEventListener('click', e => {

            document.querySelector('.content').style = 'overflow-y: hidden';

            const errors = {
                pageNumberEqualZeroOrEqualOne: pageNumber === 0 || pageNumber === 1,
                pageNumberEqualPageCurrent: pageNumber === Math.ceil(recordObjects.length / recordPerPage)
            }

            if (e.target.dataset.type == 'previous')
                !errors.pageNumberEqualZeroOrEqualOne ? pageNumber -= 1 : true;

            else if (e.target.dataset.type == 'next')
                !errors.pageNumberEqualPageCurrent ? pageNumber += 1 : true;

            else
                pageNumber = parseInt(e.target.innerHTML);

            updatePageNumber(pageNumber);
        });
    });
}

const updatePageNumber = pageNumber => {

    const pageCounter = document.querySelector('.countPage');
    let end = pageNumber * recordPerPage;
    let start = end - recordPerPage;
    let recordPage = recordObjects.slice(start, end);

    pageCounter.innerHTML = `Página ${pageNumber} de ${Math.ceil(recordObjects.length / recordPerPage)} :`

    templateRecord(recordPage);
    paintCurrentPage(pageNumber);
}

const paintCurrentPage = btnPos => {

    const pagers = [...document.querySelectorAll("[data-page]")]
    if (pagers.length === 0) {
        return;
    }

    [...pagination.children].forEach(btn => btn.classList.remove('btn-active'));
    pagers[btnPos - 1].classList.add('btn-active');
}

const searchRecords = e => {
    e.preventDefault();
    const bar_search = document.getElementById('bar_search');

    if (!bar_search.value) {
        loadRecordFromStorage();
        document.querySelector('.txtNotFound').classList.add('d-none');

    } else {
        const searchRecordInFields = (record) => {
            let regex = new RegExp('' + bar_search.value + '', 'g' + 'i');

            return ['name', 'dateofbirth', 'email', 'tel'].map((el) => {
                return record[el].toString().match(regex) === null ? false : true
            });
        }

        let records = recordObjects.filter(record => 
            searchRecordInFields(record).includes(true) ?
                record : false);

        if (records.length === 0)
            document.querySelector('.txtNotFound').classList.remove('d-none')
        else
            document.querySelector('.txtNotFound').classList.add('d-none')

        records.length !== 0 ? templateRecord(records) : true;
    }
}

const validateFieldsRecord = e => {
    e.preventDefault();

    document.querySelector('.txtValidate').innerHTML = '';

    let fields = ['name', 'dateofbirth', 'email', 'tel'];
    const validatePhone = /^\(\d{2}\)\d{4,5}-\d{4}$/gi;
    const validateEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi;
    const validateName = /(?=^.{2,60}$)^[A-ZÀÁÂĖÈÉÊÌÍÒÓÔÕÙÚÛÇ][a-zàáâãèéêìíóôõùúç]+(?:[ ](?:das?|dos?|de|e|[A-Z][a-z]+))*$/;

    let dateMin = new Date(form_addRecord['dateofbirth'].value) < new Date('01/01/1900');
    let dateMax = new Date(form_addRecord['dateofbirth'].value) > new Date();

    let testName = !validateName.test(form_addRecord['name'].value);
    let testPhone = !validatePhone.test(form_addRecord['tel'].value);
    let testEmail = !validateEmail.test(form_addRecord['email'].value);
    let testBirthdayDate = dateMin || dateMax || form_addRecord['dateofbirth'].value === '';

    let errorsFields = [testName, testBirthdayDate, testEmail, testPhone];
    let fieldsNamePortuguese = ['nome', 'data de aniversário', 'email', 'contato'];

    let validateFields = errorsFields.filter((err, i) => {

        if (err) {
            form_addRecord[fields[i]].style.border = '1px solid #b62222fd';
            document.querySelector('.txtValidate').innerHTML += `
                <li>Favor preencher corretamente o campo ${fieldsNamePortuguese[i]}</li>
                `
            return 'error';

        } else {
            form_addRecord[fields[i]].style.border = '1px solid #7a48df';
        }
    });

    validateFields.length === 0 ? addRecord() : true;
}

const controllerDialog = message => {

    const dialog_message = document.querySelector('#dialog_message'),
        btn_close = document.querySelector('.btn-close'),
        btn_confirm = document.querySelector('.btn-confirm'),
        btn_cancel = document.querySelector('.btn-cancel'),
        overlay = document.querySelector('.dialog-background');

    OpenOrCloseDialogAndOverlay('remove');

    dialog_message.innerHTML = ` ${message} `;

    return new Promise((resolve, reject) => {

        [btn_close, btn_confirm, btn_cancel, overlay].forEach((btn) => {

            btn.addEventListener('click', (e) => {

                let actionDialog;

                e.target.closest('button') ? actionDialog = e.target.closest('button').dataset.dialog :
                    actionDialog = e.target.dataset.dialog;

                if (actionDialog === 'cancel' || actionDialog === 'close') {
                    OpenOrCloseDialogAndOverlay('add');
                    reject(false);

                } else if (actionDialog === 'confirm') {
                    OpenOrCloseDialogAndOverlay('add');
                    resolve(true);
                }
            });
        });
    });
}

const OpenOrCloseDialogAndOverlay = method => {
    const dialog = document.querySelector('.dialog')
    const overlay = document.querySelector('.dialog-background');

    dialog.classList[method]('d-none');
    overlay.classList[method]('d-none');
}

const deleteAllRecordsOrRecordsSelected = e => {
    let recordChecked = [];

    let checkbox = document.querySelectorAll('[type="checkbox"]');
    recordChecked = [...checkbox].filter(record => record.checked == true);

    if (recordChecked.length > 0) {
        let message = 'Excluir todos os registros selecionados?'
        recordChecked.forEach((record) => {
            let id = parseInt(record.dataset.id);

            deleteRecord(id, message);
        });

    } else {
        [...checkbox].forEach(record => record.checked = true);
        let message = 'Excluir todos os registros ?';
        deleteAllRecords(message);
    }
}

const deleteAllRecords = message => {

    controllerDialog(message)
        .then(confirm => {
            if (confirm) {
                localStorage.removeItem('recordObjects');
                document.location.reload(true);
            }
        })
        .catch(() => {
            const checkbox = document.querySelectorAll('[type="checkbox"]');
            [...checkbox].forEach(record => record.checked = false);
            return;
        });
}

const getIdButtonDeleteClicked = e => {
    let button = e.target.closest('button');

    if (!button) {
        return;
    }

    if (button.dataset.type == "btn-delete ") {
        let id = parseInt(button.dataset.id);
        let message = 'Excluir este registro ?';
        deleteRecord(id, message);
    }
}

const deleteRecord = (id, message) => {

    controllerDialog(message)
        .then(confirm => {
            if (confirm) {
                recordObjects = recordObjects.filter(record => record.cod !== id);

                if (Math.ceil(recordObjects.length / recordPerPage) < pageNumber) {
                    pageNumber = Math.ceil(recordObjects.length / recordPerPage);
                }

                addRecordStorage(recordObjects);
            }
        }).catch(() => { return });
}

const updateView = () => {
    templateRecord(recordObjects);
    messageNumberRegister();
    loadPagination(Math.ceil(recordObjects.length / recordPerPage));
}

loadRecordFromStorage();

const btn_add = document.querySelector('.btn-add');
const btn_search = document.getElementById('btn_search');
const btn_trash = document.querySelector('.btn-trash');

btn_trash.addEventListener('click', deleteAllRecordsOrRecordsSelected);
document.addEventListener('click', getIdButtonDeleteClicked);
document.addEventListener('click', editRecord);
btn_add.addEventListener('click', validateFieldsRecord);
btn_search.addEventListener('click', searchRecords);
