const CLIENT_ID    = 'Ov23liCGewLzRyVLpkEs';
const FRONTEND_URL = 'https://manuchi-nuchi.github.io/glossothekk';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const headers = {
      'Access-Control-Allow-Origin': FRONTEND_URL,
      'Access-Control-Allow-Methods': 'GET',
    };

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return Response.redirect(`${FRONTEND_URL}#error=missing_code`);

      // Exchange code for access token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id:     CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const { access_token, error } = await tokenRes.json();
      if (error || !access_token) return Response.redirect(`${FRONTEND_URL}#error=auth_failed`);

      // Fetch user info
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'glossothekk',
        },
      });

      if (!userRes.ok) return Response.redirect(`${FRONTEND_URL}#error=user_fetch_failed`);
      const user = await userRes.json();

      // Pass minimal user info to frontend via URL fragment (never hits server logs)
      const fragment = new URLSearchParams({
        login:      user.login,
        name:       user.name || user.login,
        avatar_url: user.avatar_url,
      });

      return Response.redirect(`${FRONTEND_URL}#${fragment}`);
    }

    return new Response('Not found', { status: 404, headers });
  },
};
