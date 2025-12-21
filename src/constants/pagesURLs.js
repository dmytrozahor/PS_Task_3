import * as pages from './pages';
import config from 'config';

const result = {
  [pages.defaultPage]: `${config.UI_URL_PREFIX}/${pages.defaultPage}`,
  [pages.login]: `${config.UI_URL_PREFIX}/${pages.login}`,
  [pages.secretPage]: `${config.UI_URL_PREFIX}/${pages.secretPage}`,
  [pages.book]: `${config.UI_URL_PREFIX}/${pages.book}`,
  [pages.bookList]: `${config.UI_URL_PREFIX}/${pages.bookList}`,
};

export default result;
