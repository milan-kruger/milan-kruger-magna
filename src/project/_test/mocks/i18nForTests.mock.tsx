import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: false,
  resources: {
    en: {
      translation: {
        date: 'Date',
        sequenceNo: 'Sequence No',
        noticeNo: 'Notice No',
        plateNo: 'Plate No',
        offenderName: 'Offender Name',
        status: 'Status',
        open: 'Open',
        closed: 'Closed',
        labelRowsPerPage: 'Rows per page:',
        of: 'of',
        copyNoticeNumber: 'Copy Notice Number',
      },
    },
  },
});

export default i18n;
