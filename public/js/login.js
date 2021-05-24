const idContainer = document.querySelector(".id");
const pwdContainer = document.querySelector(".pwd");
const signUpBtn = document.querySelector(".abs-Btn .sign-up");

function checkedHP() {
  //it is fired when the 'Hide_password check box' is checked by Onclick function
  const hidePwdBox = document.querySelector(".check-box-form .hide-PWD");
  if (hidePwdBox.checked) {
    pwdContainer.type = "password";
  } else {
    pwdContainer.type = "text";
  }
}
function handleSignUp(event) {
  location.href = "/signUp"; //select
}
function init() {
  signUpBtn.addEventListener("click", handleSignUp);
}
init();
