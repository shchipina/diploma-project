import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import logger from '../utils/logger';

interface ErrorReportFormProps {
  errorId?: string;
  traceId?: string;
  onClose: () => void;
}

export default function ErrorReportForm({ errorId, traceId, onClose }: ErrorReportFormProps) {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      logger.info('Error report submitted', {
        errorId,
        traceId,
        description,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      logger.error('Failed to submit error report', error);
      alert(t('errorReportFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-green-600 font-semibold">{t('errorReportSuccess')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('errorReportTitle')}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">{t('errorReportDescription')}</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('errorReportPlaceholder')}
                className="w-full min-h-[100px] p-2 border rounded-md"
                required
              />
            </div>

            {errorId && (
              <div>
                <Label>{t('errorReportId')}</Label>
                <Input value={errorId} disabled className="bg-gray-100" />
              </div>
            )}

            {traceId && (
              <div>
                <Label>{t('errorReportTraceId')}</Label>
                <Input value={traceId} disabled className="bg-gray-100" />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? t('loading') : t('errorReportSubmit')}
            </Button>
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              {t('errorReportCancel')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
