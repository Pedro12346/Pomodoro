class Timer {
  timer;
  timerMinutes = 0;
  timerSeconds = 0;
  timerHours = 0;
  startTime;
  controller;
  isPaused;

  constructor(controller) {
    this.isPaused = true;
    this.controller = controller;
  }

  timeLeft() {
    let obj = {};
    let currentTime = new Date().getTime();
    let diff = this.startTime - currentTime;
    obj.hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    obj.minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    obj.secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);
    obj.diff = diff;
    return obj;
  }

  createInterval() {
    let self = this;

    let id = setInterval(function() {
      let t = self.timeLeft();

      self.timerHours = t.hoursLeft;
      self.timerMinutes = t.minutesLeft;
      self.timerSeconds = t.secondsLeft;
      if(t.diff < 0) {
        controller.timerFinished();
        //self.pause(); /*caused an error*/
      } else {
        controller.displayTime(t);
      }
    },1000);

    return id;
  }

  play() {
    this.startTime = new Date();
    this.startTime.setMinutes(this.startTime.getMinutes() + this.timerMinutes);
    this.startTime.setSeconds(this.startTime.getSeconds() + this.timerSeconds);
    this.startTime = this.startTime.getTime() + 1000;
    this.isPaused = false;
    this.timer = this.createInterval();
  }

  pause() {
    this.isPaused = true;
    clearInterval(this.timer);
  }

  reset(minutes) {
    this.pause();
    this.timerHours = 0;
    this.timerMinutes =  parseInt(minutes, 10);
    this.timerSeconds = 0;
  }
}

class UIController {

  changeSessionTitle(text) {
    $(".time-session-title").text(text);
  }

  changeTimeText(text) {
    $("#time-remaining-text").text(text);
  }

  changeTimeButtonText(text) {
    $(".time-button").text(text);
  }

  changeTimeButtonColorStyle(styleClass) {
    $(".time-button").removeClass("btn-warning");
    $(".time-button").removeClass("btn-primary");

    $(".time-button").addClass(styleClass);
  }

  changeMinutesSpentToday(minutes) {
    $(".minutes-spent-today").text(minutes);
  }

  changePomodorosCompletedToday(total) {
    $(".pomodoros-completed-today").text(total);
  }

  changeLastPomodoroCompletedTime(text) {
    $(".last-completed-today").text(text);
  }

  createHistoryTable(history) {
    $(".history-table-body").empty();

    for(let i = 0; i < history.length; i++) {
      let d = new Date(history[i].date);
      let date =  d.getDay() + " - " + (d.getMonth() + 1) + " - "+ d.getFullYear();
      let at = "";

      if(d.getHours().toString().length === 1) {
        at += "0" + d.getHours();
      } else {
        at += d.getHours();
      }

      at += ":";

      if(d.getMinutes().toString().length === 1) {
        at += "0" + d.getMinutes();
      } else {
        at += d.getMinutes();
      }

      let duration = history[i].durationInMinutes;
      let row = "<tr><td>" + date + "</td>" +  "<td>" + at + "</td>"  + "<td>" + duration +"</td></tr>";
      $(".history-table-body").append(row);
    }
  }

  displayTime(time) {
    let s = "";

    if(time.hoursLeft.toString().length >= 2) {
      s += time.hoursLeft.toString();
    } else if(time.hoursLeft.toString().length < 2 && time.hoursLeft.toString() !== "0") {
      s += "0" + time.hoursLeft + ":";
    }

    if(time.minutesLeft.toString().length < 2) {
      s += "0" + time.minutesLeft + ":";
    } else {
      s += time.minutesLeft.toString() + ":";
    }

    if(time.secondsLeft.toString().length < 2) {
      s += "0" + time.secondsLeft;
    } else {
      s += time.secondsLeft.toString();
    }

    this.changeTimeText(s);
  }


  displaySessionCompletedModal() {
    $("#sessionCompletedModal").modal("show");
  }


  hideCancelButton() {
    $(".cancel-time-button").css("display", "none");
  }

  unhideCancelButton() {
    $(".cancel-time-button").css("display","block");
  }

  setNumberOfPodomorosFormSelectedValue(value) {
    $(".select-" + value).attr("selected", "selected");
  }

  setTimePerPomodoroInputValue(value) {
    $("#timePerPomodoro").attr("value", value);
  }

  setBreakTimeInputValue(value) {
    $("#breakTime").attr("value", value);
  }

  updateSettingsValues(numberOfPodomoros, timePerPomodoro, breakMinutes) {
    this.setNumberOfPodomorosFormSelectedValue(numberOfPodomoros);
    this.setTimePerPomodoroInputValue(timePerPomodoro);
    this.setBreakTimeInputValue(breakMinutes);
  }

  updateTodayStats(stats) {
    let pomodorosCompleted = stats.pomodorosCompletedToday;
    let minutesSpentToday = stats.minutesSpentToday;
    let lastPomodoroCompleted = stats.lastPomodoroCompleted;

    this.changePomodorosCompletedToday(pomodorosCompleted);
    this.changeMinutesSpentToday(minutesSpentToday);
    this.changeLastPomodoroCompletedTime(lastPomodoroCompleted);
  }
}

class LocalStorageController {

  getSettingsFromLocalStorage() {
    let obj= {};


    if(isNaN(localStorage.getItem("numberOfPodomoros")) || localStorage.getItem("numberOfPodomoros") === null) {
      obj.numberOfPodomoros = 4;
    } else {
      obj.numberOfPodomoros = parseInt(localStorage.getItem("numberOfPodomoros"),10);
    }

    if(isNaN(localStorage.getItem("timerMinutes")) || localStorage.getItem("timerMinutes") === null) {
      obj.timePerPomodoro = 25;
    } else {
      obj.timePerPomodoro = parseInt(localStorage.getItem("timerMinutes"),10);
    }

    if(isNaN(localStorage.getItem("breakMinutes")) || localStorage.getItem("breakMinutes") === null) {
      obj.breakTime = 5;
    } else {
      obj.breakTime = parseInt(localStorage.getItem("breakMinutes"),10);
    }

    return obj;
  }

  saveSettingsInLocalStorage(numberOfPodomoros, timePerPomodoro, breakTime) {
    localStorage.setItem("numberOfPodomoros", numberOfPodomoros);
    localStorage.setItem("timerMinutes", timePerPomodoro);
    localStorage.setItem("breakMinutes", breakTime);
  }


  getHistory() {
    let history = [];

    if(localStorage.getItem("history") === null) {
      history = [];
    } else {
      history = JSON.parse(localStorage.getItem("history"));
    }

    return history;
  }

  addCompletedPomodoroToHistory(date, durationInMinutes) {
    let history = this.getHistory();

    history.push({date: date, durationInMinutes: parseInt(durationInMinutes, 10)});

    localStorage.setItem("history", JSON.stringify(history));
  }
}

class Stats {

  LocalStorageController = new LocalStorageController();

  pomodoroFinishedToday(pomodoroDate) {
    let now = new Date();

    if(now.getDay() == pomodoroDate.getDay() && now.getMonth() == pomodoroDate.getMonth() && now.getFullYear() == pomodoroDate.getFullYear()) {
      return true;
    }

    return false;
  }

  minutesSpentToday() {
    let history = this.LocalStorageController.getHistory();
    let minutes = 0;


    for(let i = 0; i < history.length; i++) {
      let date = new Date(history[i].date);

      if(this.pomodoroFinishedToday(date)) {
        minutes += history[i].durationInMinutes;
      }
    }

    return minutes;
  }

  pomodorosCompletedToday() {
    let history = this.LocalStorageController.getHistory();
    let total = 0;

    for(let i = 0; i < history.length; i++) {
      let date = new Date(history[i].date);

      if(this.pomodoroFinishedToday(date)) {
        total += 1;
      }
    }

    return total;
  }

  lastPomodoroCompleted() {
    let history = this.LocalStorageController.getHistory();
    let text = "";

    if(history.length >= 1) {
      let date = new Date(history.pop().date);

      if(this.pomodoroFinishedToday(date)) {
        if(date.getHours().toString().length === 1) {
          text += "0" + date.getHours();
        } else {
          text += date.getHours();
        }

        text += ":";

        if(date.getMinutes().toString().length === 1) {
          text += "0" + date.getMinutes();
        } else {
          text += date.getMinutes();
        }
      }
    } else {
      text = "-";
    }

    return text;
  }

  todayStats() {
    let obj = {};
    obj.minutesSpentToday = this.minutesSpentToday();
    obj.pomodorosCompletedToday = this.pomodorosCompletedToday();
    obj.lastPomodoroCompleted = this.lastPomodoroCompleted();
    return obj;
  }
}



class Controller {
  UIController;
  LocalStorageController;
  timer;
  timerMinutes;
  breakMinutes;
  numberOfPodomoros;
  pomodorosLeft;
  breakTime = false;
  Stats;
  constructor() {
    this.UIController = new UIController();
    this.LocalStorageController = new LocalStorageController();
    this.Stats = new Stats();
    this.timer = new Timer(this);
    this.loadSettingsFromLocalStorage();
    this.resetTimer();
    this.saveSettingsInLocalStorage();
    this.loadHistoryTable();
    this.updateTodayStats()
    this.UIController.changeTimeText(this.timerMinutes + ":00");
  }

  displayTime(time) {
    this.UIController.displayTime(time);
  } 

  setTimePerPomodoro(minutes) {
    this.timerMinutes = minutes;
  }

  setBreakTime(minutes){
    this.breakMinutes = minutes;
  }

  setNumberOfPodomoros(numberOfPodomoros) {
    this.numberOfPodomoros = numberOfPodomoros;
    this.pomodorosLeft = this.numberOfPodomoros;
  }

  updateSettings() {
    let numberOfPodomoros = document.getElementById("numberOfPodomorosPerSession").value;
    let timePerPomodoro = document.getElementById("timePerPomodoro").value;
    let breakMinutes = document.getElementById("breakTime").value;

    this.setNumberOfPodomoros(numberOfPodomoros);
    this.setTimePerPomodoro(timePerPomodoro);
    this.setBreakTime(breakMinutes);
    this.resetTimer();

    this.UIController.updateSettingsValues(numberOfPodomoros, timePerPomodoro, breakMinutes);
    this.saveSettingsInLocalStorage();
  }

  timerFinished() {
    this.playSound();
    if(this.breakTime) {
      this.UIController.changeSessionTitle("Session time");
      this.breakTime = false;
      this.timer.reset(this.timerMinutes);
      this.playTimer();
    } else if(this.pomodorosLeft > 1) {
      this.UIController.changeSessionTitle("Break time");
      this.breakTime = true;
      this.pomodorosLeft--;
      this.LocalStorageController.addCompletedPomodoroToHistory(new Date(),this.timerMinutes);
      this.loadHistoryTable();
      this.updateTodayStats()
      this.timer.reset(this.breakMinutes);
      this.playTimer();
    } else {
      this.UIController.changeSessionTitle("Session time");
      this.UIController.displaySessionCompletedModal();
      this.pomodorosLeft = this.numberOfPodomoros;
      this.loadHistoryTable();
      this.updateTodayStats()
      this.resetTimer();
    }
  }

  resetTimer() {

    if(this.breakTime) {
      this.timer.reset(this.breakMinutes);
      this.UIController.changeTimeText(this.breakMinutes + ":00");
    } else {
      this.timer.reset(this.timerMinutes);
      this.UIController.changeTimeText(this.timerMinutes + ":00");
    }
    this.UIController.changeTimeButtonText("Start");
    this.UIController.changeTimeButtonColorStyle("btn-primary");
    this.UIController.hideCancelButton();
  }

  pauseTimer() {
    this.UIController.changeTimeButtonText("Continue");
    this.UIController.changeTimeButtonColorStyle("btn-primary");
    this.timer.pause();
  }

  playTimer() {
    this.UIController.changeTimeButtonText("Pause");
    this.UIController.changeTimeButtonColorStyle("btn-warning");
    this.UIController.unhideCancelButton();
    this.timer.play();
  }

  playSound() {
    let audio = new Audio(".mp3");
    audio.play();
  }

  isTimerPaused() {
    return this.timer.isPaused;
  }

  loadSettingsFromLocalStorage() {

    let obj = this.LocalStorageController.getSettingsFromLocalStorage();

    this.setNumberOfPodomoros(obj.numberOfPodomoros);
    this.setTimePerPomodoro(obj.timePerPomodoro);
    this.setBreakTime(obj.breakTime)

    this.UIController.updateSettingsValues(this.numberOfPodomoros, this.timerMinutes, this.breakMinutes);
  }

  saveSettingsInLocalStorage() {
    this.LocalStorageController.saveSettingsInLocalStorage(this.numberOfPodomoros, this.timerMinutes, this.breakMinutes);
  }

  loadHistoryTable() {
    let history = this.LocalStorageController.getHistory();
    this.UIController.createHistoryTable(history);
  }

  updateTodayStats() {
    let todayStats = this.Stats.todayStats();
    this.UIController.updateTodayStats(todayStats);
  }
}

let controller = new Controller();

$(".time-button").on("click", function () {
  if(controller.isTimerPaused()) {
    controller.playTimer();
  } else {
    controller.pauseTimer();
  }
})

$(".cancel-time-button").on("click", function () {
  controller.resetTimer();
})

$(".sessionSettings").on("click", function () {
  controller.resetTimer();
})


$("#save-settings-changes").on("click", function () {
  controller.updateSettings();
})
