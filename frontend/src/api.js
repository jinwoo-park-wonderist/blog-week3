const BASE_URL = 'http://127.0.0.1:8000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `요청 실패 (status: ${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const api = {
  login: (username, password) =>
    request('/auth/login/', { method: 'POST', body: { username, password } }),

  getPosts: (tagId) =>
    request(tagId ? `/posts/?tag=${tagId}` : '/posts/'),

  getPost: (id) =>
    request(`/posts/${id}/`),

  createPost: (data) =>
    request('/posts/', { method: 'POST', body: data }),

  getComments: (postId) =>
    request(`/comments/?post=${postId}`),

  createComment: (postId, content) =>
    request('/comments/', {
      method: 'POST',
      body: { post: postId, comment_content: content },
    }),

  getTags: () =>
    request('/tags/'),

  createTag: (tagContent) =>
    request('/tags/', { method: 'POST', body: { tag_content: tagContent } }),
};