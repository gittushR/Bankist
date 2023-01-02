'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2022-12-28T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//formattingcurrency
let formattedCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//FORMATTINGdATES
let formattedDate = function (date, today = false) {
  let calcDayspassed = (date1, date2) => {
    return Math.round(Math.abs(date1 - date2) / (24 * 60 * 60 * 1000));
  };
  let daysPassed = calcDayspassed(new Date(), date);
  if (!today) {
    if (daysPassed === 0) return 'TODAY';
    if (daysPassed === 1) return 'YESTERDAY';
    if (daysPassed < 8) return `${daysPassed} DAYS AGO`;
  }
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    weekday: 'long',
  };
  const locale = navigator.language;
  return new Intl.DateTimeFormat(locale, options).format(date);
};

let displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ' ';

  let sortedMovs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  sortedMovs.forEach(function (mov, i) {
    let date = new Date(acc.movementsDates[i]);
    let displayDate = formattedDate(date);

    let formattedCurr = formattedCurrency(
      Math.abs(mov),
      acc.locale,
      acc.currency
    );
    let type = mov > 0 ? 'deposit' : 'withdrawal';
    let html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedCurr}</div>
        </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

let displayBalance = function (account) {
  account.balance = account.movements.reduce(function (acc, curr) {
    return acc + curr;
  }, 0);
  labelBalance.textContent = formattedCurrency(
    account.balance,
    account.locale,
    account.currency
  );
};

let addUserName = function (accs) {
  accs.forEach(function (acc) {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(function (name) {
        return name[0];
      })
      .join('');
  });
};
addUserName(accounts);

let difference = function (accs) {
  accs.forEach(function (acc) {
    acc.deposited = new Array();
    acc.deposited = acc.movements.filter(function (mov) {
      return mov > 0;
    });
    acc.withdrawal = acc.movements.filter(function (mov) {
      return mov < 0;
    });
  });
};
difference(accounts);

let displaySummary = function (account) {
  let income = account.deposited.reduce(function (acc, curr) {
    return acc + curr;
  }, 0);
  labelSumIn.textContent = formattedCurrency(
    income,
    account.locale,
    account.currency
  );

  let outgoing = account.withdrawal.reduce(function (acc, curr) {
    return acc + curr;
  }, 0);
  labelSumOut.textContent = formattedCurrency(
    Math.abs(outgoing),
    account.locale,
    account.currency
  );

  let interest = account.deposited
    .map(function (curr) {
      return (curr * account.interestRate) / 100;
    })
    .reduce(function (acc, curr) {
      return acc + curr;
    }, 0);
  labelSumInterest.textContent = formattedCurrency(
    interest,
    account.locale,
    account.currency
  );
};

let updateApp = function (currentUser) {
  displayMovements(currentUser);
  displayBalance(currentUser);
  displaySummary(currentUser);
};

//logoutTimer
let startLogOut = function () {
  let ticker = function () {
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(time % 60).padStart(2, 0);
    //print timer to ui
    labelTimer.textContent = `${min}:${sec}`;
    //when time finished logout user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Login to get started`;
      containerApp.style.opacity = 0;
    }
    //decrease
    time--;
  };
  //set initial timer
  let time = 120;
  //call the timer every 1 sec
  ticker();
  let timer = setInterval(ticker, 1000);
  return timer;
};

//LOGIN
let currentUser, timer;

// currentUser = accounts[0];
// updateApp(currentUser);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentUser = accounts.find(function (acc) {
    return acc.userName === inputLoginUsername.value;
  });
  if (currentUser?.pin === Number(inputLoginPin.value)) {
    //date
    labelDate.textContent = formattedDate(new Date(), true);
    //Display App and Welcome Message
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome back ${
      currentUser.owner.split(' ')[0]
    }`;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Display Movements
    updateApp(currentUser);

    //start logout timer
    if (timer) clearInterval(timer);
    timer = startLogOut();
  }
});

//tRANSFER MONEY
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  let amount = Number(inputTransferAmount.value);
  let receiverAcc = accounts.find(function (acc) {
    return acc.userName === inputTransferTo.value;
  });

  if (amount > currentUser.balance) {
    alert('Insufficient Balance in your account');
  }
  if (receiverAcc.userName === currentUser.userName) {
    alert('Cannot transfer to self!!!');
  }
  if (amount < 0) alert('Enter a valid amount of money!!!');
  //if (!receiverAcc) alert('User account doest not exist!!!');
  if (
    amount > 0 &&
    receiverAcc &&
    currentUser.balance >= amount &&
    receiverAcc?.userName !== currentUser.userName
  ) {
    currentUser.movements.push(-amount);
    receiverAcc.movements.push(amount);
    //current date
    currentUser.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    updateApp(currentUser);
  }
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();

  //reset timer
  clearInterval(timer);
  timer = startLogOut();
});

//Loan Amount
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  let amount = Number(inputLoanAmount.value);
  alert(`You may avail a maximum loan upto 10 times of your highest deposit`);
  if (amount > 0 && currentUser.movements.some(mov => mov >= 0.1 * amount)) {
    setTimeout(function () {
      currentUser.movements.push(amount);
      //add loan date
      currentUser.movementsDates.push(new Date().toISOString());
      updateApp(currentUser);
    }, 3000);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();

  //reset timer
  clearInterval(timer);
  timer = startLogOut();
});

//Delete aCCOUNT
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentUser.userName &&
    Number(inputClosePin.value) === currentUser.pin
  ) {
    alert(
      `You have deleted the account belonging to ${
        currentUser.owner.split(' ')[0]
      }`
    );
    let index = accounts.findIndex(function (acc) {
      return acc.userName === currentUser.userName;
    });
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Log in to get started`;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

//sort movements
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentUser, !sorted);
  sorted = !sorted;
});
