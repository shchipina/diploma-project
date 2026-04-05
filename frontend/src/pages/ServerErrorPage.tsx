import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useState } from 'react';
import ErrorReportForm from '../components/ErrorReportForm';

export default function ServerErrorPage() {
  const { t } = useTranslation();
  const [showReportForm, setShowReportForm] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const errorId = params.get('errorId');
  const traceId = params.get('traceId');

  const handleRefresh = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl font-bold text-red-300 mb-4">500</div>
          <CardTitle className="text-2xl">{t('error500Title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-600 space-y-4">
          <p>{t('error500Message')}</p>

          {(errorId || traceId) && (
            <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-3 rounded space-y-1">
              {errorId && (
                <div>
                  <span className="font-semibold">{t('errorReportId')}:</span> {errorId}
                </div>
              )}
              {traceId && (
                <div>
                  <span className="font-semibold">{t('errorReportTraceId')}:</span> {traceId}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleRefresh} className="w-full">
            {t('error500Action')}
          </Button>
          <Button onClick={() => setShowReportForm(true)} variant="outline" className="w-full">
            {t('error500Report')}
          </Button>
        </CardFooter>
      </Card>

      {showReportForm && (
        <ErrorReportForm
          errorId={errorId || undefined}
          traceId={traceId || undefined}
          onClose={() => setShowReportForm(false)}
        />
      )}
    </div>
  );
}
