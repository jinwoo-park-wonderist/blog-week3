import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function PostDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPost(id).then(setPost).catch(() => setError('Post load failed.'));
    api.getComments(id).then(setComments).catch(() => setError('Comment load failed.'));
  }, [id]);

  async function handleCommentSubmit(e) {
    e.preventDefault();
    try {
      const created = await api.createComment(id, newComment);
      setComments([...comments, created]);
      setNewComment('');
    } catch (err) {
      setError('Post comment failed.');
    }
  }

  if (!post) return <p>loading...</p>;

  return (
    <div>
      <h2>{post.post_title}</h2>
      <p>Author: {post.post_author?.nick_name}</p>
      <p>{post.post_content}</p>
      <p>
        Tag:{' '}
        {post.post_tag.map((tag) => tag.tag_content).join(', ') || 'None'}
      </p>

      <h3>Comment</h3>
      {error && <p>{error}</p>}
      <ul>
        {comments.map((c) => (
          <li key={c.id}>
            {c.comment_author?.nick_name}: {c.comment_content}
          </li>
        ))}
      </ul>

      {isAuthenticated ? (
        <form onSubmit={handleCommentSubmit}>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Comment content"
          />
          <button type="submit">Submit Comment</button>
        </form>
      ) : (
        <p>Login needed</p>
      )}
    </div>
  );
}