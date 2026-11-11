import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ padding: '64px 0', textAlign: 'center' }}>
    <h1>Page not found</h1>
    <p>
      <Link to='/' style={{ textDecoration: 'underline' }}>
        Back to WeTube
      </Link>
    </p>
  </div>
);

export default NotFound;
