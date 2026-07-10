import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import PostCreatePage from './pages/PostCreatePage';
import TagListPage from './pages/TagListPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<PostListPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/posts/new" element={<PostCreatePage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/tags" element={<TagListPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}