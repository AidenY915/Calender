const calenderBody = document.getElementById("calenderBody");

const today = new Date();
const todayYear = today.getFullYear();
const todayMonth = today.getMonth();
const todayDate = today.getDate();

const lastDateOfMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

let displayedYear = todayYear;
let displayedMonth = todayMonth;

const scheduleMap = new Map();

const holidayMap = new Map();
setHolidayMap();

function repaintCalender() {
  let startDay = new Date(displayedYear, displayedMonth, 1).getDay();
  let lastDate = lastDateOfMonth[displayedMonth];
  if (
    (displayedYear % 400 == 0 ||
      (displayedYear % 4 == 0 && displayedYear % 100 != 0)) &&
    displayedMonth == 1
  )
    lastDate++;
  let dateCnt = 1;
  let cell = 0;
  let calenderBodyString = "";

  document.getElementById("caption").innerHTML = `${
    displayedYear + "<br/>" + months[displayedMonth]
  }`;

  while (dateCnt <= lastDate) {
    calenderBodyString += "<tr>";
    for (let i = 0; i < 7; i++) {
      if (cell < startDay || dateCnt > lastDate) {
        calenderBodyString += "<td></td>";
      } else {
        let dateId = displayedYear + "" + displayedMonth + "" + dateCnt;
        let scheduleList = scheduleMap.get(dateId);
        scheduleList =
          scheduleList == undefined || scheduleList == null ? [] : scheduleList;
        let scheduleString = "";
        scheduleList.forEach((element) => {
          scheduleString += element + "<br/>";
        });
        let isHoliday = holidayMap.get(displayedMonth + "" + dateCnt);
        isHoliday = isHoliday == null ? "" : " " + isHoliday;

        let isToday =
          dateId == "" + todayYear + todayMonth + todayDate ? "today" : "";
        calenderBodyString += `<td id='${dateId}' class="dateCell${isHoliday}">
        <button class='scheduleSetButton' onclick="onclickDateCell('${dateId}' )">
        <span><span id = ${isToday}>${dateCnt}</span><span class = "holidaySpan">${isHoliday}</span></span>
        <div>${scheduleString}</div>
        </button>
        </td>`;
        dateCnt++;
      }
      cell++;
    }
    calenderBodyString += "</tr>";
  }
  calenderBody.innerHTML =
    "<tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr>" +
    calenderBodyString;
}

function changeMonth(direction) {
  switch (direction) {
    case -1:
      displayedMonth--;
      if (displayedMonth < 0) {
        displayedMonth = 11;
        displayedYear--;
      }
      break;
    case 1:
      displayedMonth++;
      if (displayedMonth > 11) {
        displayedMonth = 0;
        displayedYear++;
      }
  }
  repaintCalender();
}

function setSchedule(dateId) {
  let existing = scheduleMap.get(dateId);
  existing = existing == undefined || existing == null ? [] : existing;
  let newSchedule = prompt("새 스케쥴을 입력하세요.");
  if (newSchedule == "" || newSchedule == null) return;
  existing.push(newSchedule);
  scheduleMap.set(dateId, existing);
  console.log(scheduleMap);
  repaintCalender();
}

function updateSchedule(dateId, i) {
  const scheduleList = scheduleMap.get(`${dateId}`);
  console.log(dateId);
  console.log(scheduleList);
  scheduleList[i] = prompt(
    "새 스케쥴을 입력하세요. 아무것도 입력하지 않을 경우, 삭제됩니다.",
    scheduleList[i]
  );
  if (scheduleList[i] == "") scheduleList.splice(i, 1);
  repaintCalender();
  showDetail(`${dateId}`);
}

function showDetail(dateId) {
  //ul리스트에서 들을 클릭 시 프롬프트로 뛰우고 변경
  const detailDiv = document.getElementById("scheduleDetail");
  if (scheduleMap.get(dateId).length == 0) {
    detailDiv.style.display = "none";
    return;
  } else {
    detailDiv.style.display = "block";
  }
  let innerHtmlString = "<ul>";
  const scheduleList = scheduleMap.get(dateId);
  let i = 0;
  scheduleList.forEach((e) => {
    innerHtmlString += `<li><button onclick="updateSchedule(${dateId},${i++})">${e}</button></li>`;
  });
  innerHtmlString += "</ul>";
  console.log(innerHtmlString);
  detailDiv.innerHTML = innerHtmlString;
}

function onclickDateCell(dateId) {
  setSchedule(dateId);
  showDetail(dateId);
}

function setHolidayMap() {
  holidayMap.set("01", "새해 첫 날");
  holidayMap.set("21", "삼일절");
  holidayMap.set("45", "어린이날");
  holidayMap.set("56", "현충일");
  holidayMap.set("715", "광복절");
  holidayMap.set("93", "개천절");
  holidayMap.set("99", "한글날");
  holidayMap.set("1125", "크리스마스");
}

let scheduleName = "schedule.json";

function loadScheduleList(inputID) {
  const input = document.getElementById(inputID);
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const data = JSON.parse(content);
      data.forEach((element) => {
        scheduleMap.set(element.id, element.scheduleList);
      });
      console.log(scheduleMap);
      repaintCalender();
      scheduleName = file.name;
    };
    reader.readAsText(file);
  }
}

function saveScheduleList() {
  const data = [];
  scheduleMap.forEach((value, key) => {
    data.push({ id: key, scheduleList: value });
  });
  const jsonData = JSON.stringify(data);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  scheduleName = prompt("스케쥴 파일의 이름을 입력하세요.", scheduleName);

  const a = document.getElementById("download");
  a.href = url;
  a.download = scheduleName;
  a.click();
  URL.revokeObjectURL(url);
}

repaintCalender();
