const express = require('express');
const app = new express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

var rooms = {};
rooms['full'] = 2;
rooms['empty'] = 0;

var name;
var room;
var player = 0;

// 3000번 포트에 개방
server.listen(3000, function () {
  console.log("Socket IO server listening on port 3000")
});

// 루트페이지 호출 시 join-room.html 반환 (이름과 방코드 입력)
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/join-room.html');
});

// 이름과 코드입력시 /game 호출하면, 게임 페이지 반환
app.post('/game', function (req, res) {
  name = req.body.name;
  room = req.body.room;
  if (rooms[room] >= 2) {
    res.sendFile(__dirname + '/join-room.html');
  }
  else {
    res.sendFile(__dirname + '/index.html');
  }
})

io.on('connection', function (socket) {
  var rollCount = 3; //주사위 던지는 횟수를 세는 변수
  var dice = [0, 0, 0, 0, 0]; // 주사위 5개의 변수
  var selectedDice = [false, false, false, false, false]; // 주사위의 선택 여부를 나타내는 변수
  var score = [, , , , , , 0, 0, , , , , , , 0]; //p1의 점수판, 중간합계, 보너스, 총합은 선언되어 있고 나머지는 undefined
  var tempScore = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //주사위 눈에 따라 계산되는 임시 점수 변수
  var turn = 0; //몇번 차례가 돌았는지 기록하는 변수
  //기존 방에 재참여하여 인원수를 늘리는 것을 막는 코드.
  console.log( name +" connect to socket");

  socket.name = name;
  socket.room = room;

  socket.emit('myData', {
    name: name,
    room: room
  });

  console.log(name + " try join room " + room);

  // room에 join시킨다. 인원수를 체크하고 새로운 방을 만들거나 기존방에 참가.
  // 2명 이상일 시 따로 처리해야함.
  if (rooms[room] == undefined) {
    rooms[room] = 0;
  }

  socket.join(room);
  rooms[room]++;
  player = rooms[room];
  socket.player = player;
  console.log("room " + room + " 접속인원 " + rooms[room] + "(명)");
  io.to(room).emit('chat message', "player " + player + ", " + name + " 이(가) 게임에 참여했습니다.");
  console.log(name + " join room " + room);

  if (rooms[room] == 2) {
    io.to(room).emit('overTurn', socket.player);
  }
  else {
    
  }

  socket.on('gameData', function () {

  })

  socket.on('forceDisconnect', function () {
    socket.disconnect();
  });

  socket.on('disconnect', function () {
    console.log('user disconnected: ' + socket.name);
    socket.leave(socket.room);
    if (room) {
      rooms[room]--;
    }
  });

  socket.on('rollDice', function () {
    console.log("(" + socket.player + ")" + name + "server rollDice");

    if (rollCount > 0) {
      for (let i = 0; i < 5; i++) {
        if (!selectedDice[i]) {
          dice[i] = getRandomInt(1, 7);
        }
      }
      rollCount--;
      calcScore();
      io.to(room).emit('updateDice', dice, selectedDice, rollCount);
      io.to(room).emit('showTempScore', score, tempScore, socket.player);
    }
  });

  socket.on('selectDice', function (dice_id) {
    console.log("(" + socket.player + ")" + name + "server selectDice");

    if (rollCount < 3) {
      selectedDice[dice_id] = !selectedDice[dice_id];
      io.to(room).emit('selectDiceUpdate', selectedDice[dice_id], dice_id);
    }
  })

  socket.on('overTurn', function(otherplayer){
    console.log("(" + socket.player + ")" + name + "server overTurn");

    tempScore = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 5; i++) {
      selectedDice[i] = false;
    }
    rollCount = 3;
    io.to(room).emit('updateDice', dice, selectedDice, rollCount);
    io.to(room).emit('highlight', otherplayer);
    if(otherplayer != socket.player)
    {
      console.log(socket.player);
      io.to(socket.id).emit("setListener", socket.player, score);
    }
    // checkEnd();
  });

  socket.on("setScore", function(score_id) {
    console.log("(" + socket.player + ")" + name + "server setScore");

    score[score_id] = tempScore[score_id];
    calcSum();
    checkBonus();
    io.to(room).emit('updateScore', score, socket.player);
    socket.broadcast.to(room).emit('overTurn', score, socket.player);
  })

  //min 이상 max 미만을 반환하는 함수
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }

  //점수 계산하는 함수 tempScore에 값 저장
  function calcScore() {
    var diceCount = [0, 0, 0, 0, 0, 0];
    var diceSum = 0;

    for (var i = 0; i < 5; i++) {
      diceCount[dice[i] - 1] = diceCount[dice[i] - 1] + 1;
      diceSum += dice[i];
    }

    for (var i = 0; i < 6; i++) {
      tempScore[i] = 0;
      tempScore[i] = (i + 1) * diceCount[i];
    }

    //tempScore[6] Subtotal
    //tempScore[7] Bonus

    // Choice
    tempScore[8] = 0;
    tempScore[8] = diceSum;

    // 4 of a kind
    tempScore[9] = 0;
    for (var i = 0; i < 6; i++) {
      if (diceCount[i] >= 4) {
        tempScore[9] = diceSum;
        break;
      }
    }

    // Full House
    tempScore[10] = 0;
    var fullHouseCheck = [0, 0];
    for (var i = 0; i < 6; i++) {
      if (diceCount[i] == 2) {
        fullHouseCheck[0] = 1;
      }
      if (diceCount[i] == 3) {
        fullHouseCheck[1] = 1;
      }
    }
    if (fullHouseCheck[0] == 1 && fullHouseCheck[1] == 1) {
      tempScore[10] = diceSum;
    }

    // S. Straight
    tempScore[11] = 0;
    if ((diceCount[0] > 0 && diceCount[1] > 0 && diceCount[2] > 0 && diceCount[3] > 0) ||
      (diceCount[1] > 0 && diceCount[2] > 0 && diceCount[3] > 0 && diceCount[4] > 0) ||
      (diceCount[2] > 0 && diceCount[3] > 0 && diceCount[4] > 0 && diceCount[5] > 0))
      tempScore[11] = 15;

    // L. Straight
    tempScore[12] = 0;
    if ((diceCount[0] > 0 && diceCount[1] > 0 && diceCount[2] > 0 && diceCount[3] > 0 && diceCount[4] > 0) ||
      (diceCount[1] > 0 && diceCount[2] > 0 && diceCount[3] > 0 && diceCount[4] > 0 && diceCount[5] > 0))
      tempScore[12] = 30;

    // Yachoo
    tempScore[13] = 0;
    if (dice[0] == dice[1] && dice[1] == dice[2] && dice[2] == dice[3] && dice[3] == dice[4])
      tempScore[13] = 50;
  }

  //게임 종료를 판별하는 함수
  function checkEnd() {
    turn++;
    if (turn > 24) {
      
      if (p1score[14] > p2score[14]) {
        resetButton.textContent = "[Player 1] 승리! 새 게임 시작";
      }
      else if (p1score[14] < p2score[14]) {
        resetButton.textContent = "[Player 2] 승리! 새 게임 시작";
      }
      else {
        resetButton.textContent = "비겼습니다! 새 게임 시작";
      }
      resetArea.appendChild(resetButton);
    }
  }

  //점수 설정시 1~6의 합과 전체 합을 구하는 함수
  function calcSum() {
    score[6] = 0;
    score[7] = 0;
    for (let i = 0; i < 6; i++) {
      if (score[i] != undefined) {
        score[6] += score[i];
      }
    }
    score[14] = 0
    for (let i = 6; i < 14; i++) {
      if (score[i] != undefined) {
        score[14] += score[i];
      }
    }
  }

  //1~6의 합이 63을 넘으면 보너스를 부여하는 함수
  function checkBonus() {
    if(score[6] >= 63)
    {
      score[7] = 35;
    }
  }

});