const emailContainer = document.querySelector(".email");
const idContainer = document.querySelector(".id");
const pwdContainer = document.querySelector(".pwd");
const pwdCheckContainer = document.querySelector(".pwd-check");
const nameContainer = document.querySelector(".name");
const years = document.querySelector(".years");
const months = document.querySelector(".months");
const days = document.querySelector(".days");
const genderContainer = document.querySelector(".gender");

const socket = io();
console.log(socket);

function showFail() {
  Swal.fire({
    title: `이미 존재하는 계정 입니다.`,
    confirmButtonColor: "#615f5f",
    confirmButtonText: `확인`,
  });
  return;
}
function showComplete() {
  Swal.fire({
    icon: "success",
    title: `회원가입 되었습니다.`,
    showConfirmButton: false,
    timer: 3000,
  }).then(function changeHtml() {
    location.href = "/";
  });
  return;
}
function showAlert(text) {
  Swal.fire({
    title: `${text}을(를) 확인하세요`,
    confirmButtonColor: "#615f5f",
    confirmButtonText: `확인`,
  });

  return;
}

function handleLogin(event) {
  //error있을 시 알림 박스띄우기
  // 해당 ps-box 테두리 빨강색으로 바꾸고 다시 로그인버튼 누를시 문제없으면 원래색으로 돌리기
  const regTypePwd = /[A-Za-z0-9~!@#$%^&*()_+|<>?:{}]{8,16}/; // test : 주어진 문자열 str 중 정규 표현식이 일치하는 부분이 있으면 true, 아니면, false.
  const regTypeYears = /[0-9]{4}/;
  const regTypeDays = /[0-9]{1,2}/;
  if (emailContainer.value == "") {
    showAlert("이메일 주소");
    return;
  }
  if (idContainer.value == "") {
    showAlert("아이디 규약");
    return;
  }
  if (!regTypePwd.test(pwdContainer.value)) {
    showAlert("비밀번호 규약");
    return;
  }

  if (!regTypePwd.test(pwdCheckContainer.value)) {
    showAlert("비밀번호 재확인 규약");
    return;
  } else {
    if (pwdCheckContainer.value != pwdContainer.value) {
      showAlert("비밀번호와 비밀번호 재확인 일치");
      return;
    }
  }

  if (nameContainer.value == "") {
    showAlert("이름");
    return;
  }
  if (years.value == "" || !regTypeYears.test(years.value)) {
    showAlert("생년연도의 '년(4자)'");
    return;
  }
  if (months.value == "월") {
    showAlert("생년연도의 '월'");
    return;
  }
  if (days.value == "" || !regTypeDays.test(days.value)) {
    showAlert("생년연도의 '일'");
    return;
  }
  if (genderContainer.value == "성별") {
    showAlert("성별");
    return;
  }
  console.log(idContainer.value, pwdContainer.value);
  socket.emit("signUp", { user: idContainer.value, pw: pwdContainer.value });
}
socket.on("signUp", function (res) {
  console.log(res);
  if (res == "fail") {
    showFail();
  } else {
    showComplete();
    location.href = "/";
  }
});
