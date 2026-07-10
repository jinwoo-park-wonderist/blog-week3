import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';

export default function PostListPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const tagId = searchParams.get('tag');

  useEffect(() => {
    api
      .getPosts(tagId)
      .then(setPosts)
      .catch(() => setError('Post List load failed.'));
  }, [tagId]);

  return (
    <div>
      <h2>Post List{tagId ? ` (Tag #${tagId})` : ''}</h2>
      {error && <p>{error}</p>}
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.post_title}</Link>
            {' — by '}
            {post.post_author?.nick_name}
          </li>
        ))}
      </ul>
    </div>
  );
}