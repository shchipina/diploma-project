import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
          <CardTitle className="text-2xl">{t('error404Title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-600">
          <p>{t('error404Message')}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate('/')}>{t('error404Action')}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
