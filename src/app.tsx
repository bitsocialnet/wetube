import { useLayoutEffect, type ReactNode } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AppHeader } from './components/app-header';
import { getChannelAddressFromHandle } from './lib/channels';
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

// React Router matches whole segments only, so /@:address can't be a route pattern. Channel routes
// match any segment and render only when it starts with @.
const ChannelRoute = ({ children }: { children: ReactNode }) => (getChannelAddressFromHandle(useParams().channelHandle) ? children : <NotFound />);

const App = () => (
  <div className={styles.app}>
    <ScrollToTop />
    <AppHeader />
    <main className={styles.main}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/:channelHandle'
          element={
            <ChannelRoute>
              <Channel />
            </ChannelRoute>
          }
        />
        <Route
          path='/:channelHandle/v/:videoCid'
          element={
            <ChannelRoute>
              <Watch />
            </ChannelRoute>
          }
        />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </main>
  </div>
);

export default App;
