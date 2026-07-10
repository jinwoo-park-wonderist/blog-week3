import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function PostCreatePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getTags().then(setTags).catch(() => setError('Tag load failed.'));
  }, []);

  function toggleTag(tagId) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const created = await api.createPost({
        post_title: title,
        post_content: content,
        post_tag_ids: selectedTagIds,
      });
      navigate(`/posts/${created.id}`);
    } catch (err) {
      setError('Submit post failed.');
    }
  }

  return (
    <div>
      <h2>Submit Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label>Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div>
          <label>Tag</label>
          {tags.map((tag) => (
            <label key={tag.id}>
              <input
                type="checkbox"
                checked={selectedTagIds.includes(tag.id)}
                onChange={() => toggleTag(tag.id)}
              />
              {tag.tag_content}
            </label>
          ))}
        </div>
        {error && <p>{error}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}