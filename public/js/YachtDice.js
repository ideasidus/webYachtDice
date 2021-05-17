// 코드 너무 스파게티
var socket = io();
var myName = ''
var room = ''

const diceElement = []; //HTML의 주사위 원소를 저장할 배열
const rollButton = document.getElementById("rollButton"); //페이지의 주사위 굴리기 버튼
const turnElement = document.getElementById("turn"); // 페이지에서 차례를 나타내는 부분
const resetArea = document.getElementById("resetArea") // 리셋버튼이 나타나는 div
const resetButton = document.createElement("button"); // 게임 종료후 승자와 게임 재시작 여부를 보여주는 원소

//리셋 버튼의 스타일과 클릭시 호출할 함수를 정함
resetButton.className = "btn btn-primary";
resetButton.style.width = "30%";
resetButton.style.height = "64px";
// resetButton.addEventListener('click', resetGame);

//처음 주사위 다섯개 변수를 초기화 하고 리스너를 설정한 뒤 값을 출력함
for (let i = 0; i < 5; i++) {
  diceElement[i] = document.getElementById("Dice"+i);
  diceElement[i].addEventListener('click', function() {selectDice(i);});
  diceElement[i].innerHTML = 0;
}

//페이지의 점수판을 가져와 변수로 저장
const p1Element = [];
const p2Element = [];
for (let i = 0; i < 15; i++) {
  p1Element[i] = document.getElementById(i+"-1");
  p2Element[i] = document.getElementById(i+"-2");
}
// console.log(dice);


// function overTurn() {
//   p1Turn = !p1Turn;
//   tempScore = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
//   for (let i = 0; i < 5; i++) {
//     if (diceSelected[i])
//     {
//       selectDice(i);
//     }
//     diceElement[i].style.transform = "rotate(0deg)";
//   }
//   rollCount = 3;
//   rollButton.innerHTML = "주사위 굴리기 (" + rollCount + "/3)"
//   setListener();
//   if (p1Turn){
//     turnElement.innerHTML = "P1's Turn";
//   }
//   else {
//     turnElement.innerHTML = "P2's Turn";
//   }

//   for (let i = 0; i < p1Element.length; i++) {
//     if (p1Turn){
//       p1Element[i].style.backgroundColor = "lightgreen";
//       p2Element[i].style.backgroundColor = "#FEFCEF"
//     }
//     else {
//       p1Element[i].style.backgroundColor = "#FEFCEF";
//       p2Element[i].style.backgroundColor = "lightgreen"
//     }
//   }
//   setListener();
//   checkEnd();
// }

// function resetGame() {
//   rollCount = 3;
//   dice = [0, 0, 0, 0 ,0];
//   diceSelected = [false,false,false,false,false];
//   p1Turn = false;
//   p1score = [,,,,,,0,0,,,,,,,0];
//   p2score = [,,,,,,0,0,,,,,,,0];
//   tempScore = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
//   turn = 0;

//   resetArea.removeChild(resetButton);


//   for (let i = 0; i < 15; i++) {
//   p1Element[i].innerHTML = "";
//   p2Element[i].innerHTML = "";
//   p1Element[i].className = "scoreBoard-user p1";
//   p2Element[i].className = "scoreBoard-user p2";
//   }
//   p1Element[6].innerHTML = "0/63";
//   p2Element[6].innerHTML = "0/63";

//   p1Element[6].className += " scoreSet";
//   p1Element[7].className += " scoreSet";
//   p1Element[14].className += " scoreSet";
//   p2Element[6].className += " scoreSet";
//   p2Element[7].className += " scoreSet";
//   p2Element[14].className += " scoreSet";

//   overTurn();
// }

function rollDice() {
  socket.emit('rollDice');
}

//주사위의 선택 여부에 따라 변수의 값과 class를 바꾸는 함수
function selectDice(dice_id){
  socket.emit('selectDice', dice_id);
}

function setScore(event) {
  console.log("setScoreFunc called");
  var score_id = event.target.id.split('-');
  score_id = score_id[0];
  console.log("socketID = " + socket.player);

  socket.emit('setScore', score_id);
  rollButton.removeEventListener('click', rollDice); // 주사위 굴리기를 눌렀을때 rollDice 함수가 불리도록 이벤트 리스너
  if (socket.player == 1)
  {
    for(let i = 0; i < 15; i++) {
      p1Element[i].removeEventListener('click', setScore);
    }
  }
  else
  {
    for(let i = 0; i < 15; i++) {
      p2Element[i].removeEventListener('click', setScore);
    }
  }
}

  //min 이상 max 미만을 반환하는 함수
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }


// 소켓에 접속
socket.on("gameFull", function (room) {
  alert("방코드 " + room + " 은(는) 인원이 가득차 있습니다. 다른 코드를 입력해 주세요.");
})

socket.on("myData", function(data){
  console.log("myData called");
  myName = data.name;
  room = data.room;
  console.log(myName, room);
})

// 서버로부터의 메시지가 수신되면
socket.on("chat message", function (data) {
  $("#chat").append($('<li>').text(data));
});

socket.on('updateDice', function(dice, selectedDice, rollCount){
  console.log("client updateDice");
  console.log(dice, selectedDice, rollCount);

  for (let i = 0; i < 5; i++) {
    if (!selectedDice[i]) {
      diceElement[i].style.transform = "rotate(" + (getRandomInt(-60, 61)) + "deg)"
    }
    diceElement[i].innerHTML = dice[i];
  }
  rollButton.innerHTML = "주사위 굴리기 (" + rollCount + "/3)"
});

socket.on('selectDiceUpdate', function(selected, dice_id) {
  console.log("client selectDiceUpdate");

    if (selected) {
      diceElement[dice_id].className="SelectedDice";
      diceElement[dice_id].style.transform = "rotate(0deg)";
    }
    else
    {
      diceElement[dice_id].className="Dice";
      diceElement[dice_id].style.transform = "rotate(" + getRandomInt(-60, 61) + "deg)";
    }  
});

socket.on("showTempScore", function(score, tempScore, player){
  console.log("client showTempScore");
  if (player == 1) {
    for (let i = 0; i < 6; i++) {
      if(score[i] == undefined){
        p1Element[i].innerHTML = tempScore[i];
      }
    }
    for (let i = 8; i < 15; i++) {
      if(score[i] == undefined){
        p1Element[i].innerHTML = tempScore[i];
      }
    }
  }
  else{
    for (let i = 0; i < 6; i++) {
      if(score[i] == undefined){
        p2Element[i].innerHTML = tempScore[i];
      }
    }
    for (let i = 8; i < 15; i++) {
      if(score[i] == undefined){
        p2Element[i].innerHTML = tempScore[i];
      }
    }
  }
})

socket.on('setListener', function(player, score){
  console.log("client setListener for player " +  player);
  console.log("it's score is " + score);

  rollButton.addEventListener('click', rollDice); // 주사위 굴리기를 눌렀을때 rollDice 함수가 불리도록 이벤트 리스너
  if (player == 1) {
    for(let i = 0; i < 15; i++) {
      if (score[i] == undefined) {
        p1Element[i].addEventListener('click', setScore);
      }
    }
  }
  else {
    for(let i = 0; i < 15; i++) {
      if (score[i] == undefined) {
        p2Element[i].addEventListener('click', setScore);
      }
    }
  }
})

socket.on('overTurn', function(otherplayer) {
  console.log("client overTurn");

  for (let i = 0; i < 5; i++) {
    diceElement[i].style.transform = "rotate(0deg)";
  }
  if (otherplayer == 2){
    turnElement.innerHTML = "P1's Turn";
  }
  else {
    turnElement.innerHTML = "P2's Turn";
  }
  socket.emit('overTurn', otherplayer);
});

socket.on('updateScore', function(score, player) {
  console.log("client updateScore");

  if(player == 1){
    for (let i = 0; i < 15; i++) {
      if(score[i] == undefined)
      {
        p1Element[i].innerHTML = "";
      }
      else
      {
        p1Element[i].innerHTML = score[i];
        p1Element[i].className += " scoreSet";    
      }
    }
    p1Element[6].innerHTML += "/63";
  }
  else
  {
    for (let i = 0; i < 15; i++) {
      if(score[i] == undefined)
      {
        p2Element[i].innerHTML = "";
      }
      else
      {
        p2Element[i].innerHTML = score[i];
        p2Element[i].className += " scoreSet"; 
      }
    }
    p2Element[6].innerHTML += "/63";
  }
})

socket.on('highlight', function(player) {
  console.log("client highlight");

  for (let i = 0; i < p1Element.length; i++) {
    if (player == 2){
      p1Element[i].style.backgroundColor = "lightgreen";
      p2Element[i].style.backgroundColor = "#FEFCEF"
    }
    else {
      p1Element[i].style.backgroundColor = "#FEFCEF";
      p2Element[i].style.backgroundColor = "lightgreen"
    }
  }
})