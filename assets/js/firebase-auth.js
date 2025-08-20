// Đăng nhập Google với Firebase
const loginBtn = document.getElementById('login-btn');
const userInfo = document.getElementById('user-info');
const auth = firebase.auth();

loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

auth.onAuthStateChanged(user => {
  if (user) {
    userInfo.textContent = `Xin chào, ${user.displayName}`;
    loginBtn.style.display = 'none';
  } else {
    userInfo.textContent = '';
    loginBtn.style.display = 'inline-block';
  }
});
