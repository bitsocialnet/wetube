import { useLayoutEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AppHeader } from './components/app-header';
import Channel from './views/channel';
import Home from './views/home';
import NotFound from './views/not-found';
import Watch from './views/watch';
import styles from './app.module.css';

// HashRouter has no scroll restoration; start each page at the top.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <div className={styles.app}>
    <ScrollToTop />
    <AppHeader />
    <main className={styles.main}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/c/:channelAddress' element={<Channel />} />
        <Route path='/c/:channelAddress/v/:videoCid' element={<Watch />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </main>
  </div>
);

export default App;
