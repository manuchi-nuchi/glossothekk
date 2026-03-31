const CLIENT_ID   = 'Ov23liCGewLzRyVLpkEs';
const WORKER_URL  = 'https://glossothekk-auth.manuchi-nuchi.workers.dev';

function login() {
  const params = new URLSearchParams({
    client_id:    CLIENT_ID,
    redirect_uri: `${WORKER_URL}/callback`,
    scope:        'read:user',
  });
  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
}

function logout() {
  localStorage.removeItem('gh_user');
  showLogin();
}

function showLogin() {
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('profile').style.display = 'none';
}

function showProfile(user) {
  document.getElementById('login-section').style.display = 'none';
  const el = document.getElementById('profile');
  el.style.display = 'block';
  el.querySelector('img').src              = user.avatar_url;
  el.querySelector('img').alt              = user.name;
  el.querySelector('h2').textContent       = user.name;
  el.querySelector('.username').textContent = `@${user.login}`;
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-login').addEventListener('click', login);
  document.getElementById('btn-logout').addEventListener('click', logout);

  // Check if GitHub just redirected back with user info in the fragment
  if (window.location.hash) {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const error  = params.get('error');
    const login  = params.get('login');

    // Clear fragment from URL
    history.replaceState(null, '', window.location.pathname);

    if (login) {
      const user = {
        login:      params.get('login'),
        name:       params.get('name'),
        avatar_url: params.get('avatar_url'),
      };
      localStorage.setItem('gh_user', JSON.stringify(user));
      showProfile(user);
      return;
    }

    if (error) {
      console.error('Auth error:', error);
    }
  }

  // Check for existing session in localStorage
  const stored = localStorage.getItem('gh_user');
  if (stored) {
    showProfile(JSON.parse(stored));
  } else {
    showLogin();
  }
});
