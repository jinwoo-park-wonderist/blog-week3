import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header>
      <Link to="/">Post List</Link>
      {' | '}
      <Link to="/tags">Tag List</Link>
      {isAuthenticated ? (
        <>
          {' | '}
          <Link to="/posts/new">Add post</Link>
          {' | '}
          <button onClick={logout}>LOGOUT</button>
        </>
      ) : (
        <>
          {' | '}
          <Link to="/login">LOGIN</Link>
        </>
      )}
    </header>
  );
}