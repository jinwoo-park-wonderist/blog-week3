import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function TagListPage() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    api.getTags().then(setTags).catch(() => setError('Failed to load Tag'));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const created = await api.createTag(newTag);
      setTags([...tags, created]);
      setNewTag('');
    } catch (err) {
      setError('Failed to submit Tag');
    }
  }

  return (
    <div>
      <h2>Tag List</h2>
      {error && <p>{error}</p>}
      <ul>
        {tags.map((tag) => (
          <li key={tag.id}>
            <Link to={`/posts?tag=${tag.id}`}>{tag.tag_content}</Link>
          </li>
        ))}
      </ul>

      {isAuthenticated && (
        <form onSubmit={handleSubmit}>
          <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="New Tag" />
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
}