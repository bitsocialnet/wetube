import { useLayoutEffect, useState, type ReactNode } from 'react';
import { Route, Routes, useLocation, useMatch, useParams } from 'react-router-dom';
import { AppHeader } from './components/app-header';
import { Sidebar } from './components/sidebar';
import { PLANNED_PAGES } from './data/navigation';
import { getChannelAddressFromHandle } from './lib/channels';
import Channel from './views/channel';
import Home from './views/home';
import NotFound from './views/not-found';
import Planned from './views/planned';
import Watch from './views/watch';
import WatchLater from './views/watch-later';
import styles from './app.module.css';

const SIDEBAR_EXPANDED_KEY = 'wetube:sidebar-expanded';
const SMALL_SCREEN_QUERY = '(max-width: 768px)';

const readSidebarExpanded = () => {
  try {
    return window.localStorage.getItem(SIDEBAR_EXPANDED_KEY) === 'true';
  } catch {
    return false;
  }
};

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

const App = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(readSidebarExpanded);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // As on YouTube, the watch page has no sidebar; the menu button opens it as a drawer.
  const watchMatch = useMatch('/:channelHandle/v/:videoCid');
  const onWatchPage = Boolean(getChannelAddressFromHandle(watchMatch?.params.channelHandle));

  // The menu button expands the rail on wide screens and opens the drawer on the watch page and phones.
  const toggleSidebar = () => {
    if (onWatchPage || window.matchMedia(SMALL_SCREEN_QUERY).matches) {
      setDrawerOpen((open) => !open);
      return;
    }
    const next = !sidebarExpanded;
    setSidebarExpanded(next);
    try {
      window.localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(next));
    } catch {
      // Not persisted; the choice still applies to this page.
    }
  };

  return (
    <div className={styles.app}>
      <ScrollToTop />
      <AppHeader onToggleSidebar={toggleSidebar} />
      <div className={styles.body}>
        <Sidebar expanded={sidebarExpanded} overlay={onWatchPage} drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} />
        <main className={styles.main}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/feed/watch-later' element={<WatchLater />} />
            {PLANNED_PAGES.map((page) => (
              <Route key={page.path} path={page.path} element={<Planned />} />
            ))}
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
    </div>
  );
};

export default App;
