import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '64px 0', textAlign: 'center' }}>
      <h1>{t('page_not_found')}</h1>
      <p>
        <Link to='/' style={{ textDecoration: 'underline' }}>
          {t('back_to_wetube')}
        </Link>
      </p>
    </div>
  );
};

export default NotFound;
