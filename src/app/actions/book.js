import axios from 'misc/requests';
import config from 'config';

/**
 * Mocked book actions / api helpers with local cache persistence.
 *
 * Exposes functions that return promises in the same shape components expect.
 * Replace implementations with real backend endpoints when available.
 *
 * Available functions:
 * - fetchBooks({ title, authorCanonicalName }, page, pageSize)
 * - fetchBook(bookId)
 * - createBook(bookPayload)
 * - updateBook(bookId, bookPayload)
 * - deleteBook(bookId)
 */

const {
  BOOKS_SERVICE,
} = config || { BOOKS_SERVICE: 'http://localhost:8080/api/books' };

const fetchBooks = (filters = {}, page = 1, size = 8) => {
  const params = {
    page,
    size,
    filters: filters
  };

   return axios.post(`${BOOKS_SERVICE}/_list`, params)
        .then((res) => {
            return Promise.resolve({
                data: {
                    content: res['list'],
                    totalPages: res['total_pages']
                },
            });
        });
};

const fetchBook = (bookId) => {
  return axios.get(`${BOOKS_SERVICE}/${bookId}`)
    .then((res) => {
      return Promise.resolve(res);
    });
};

const createBook = (bookPayload) => {
  return axios.post(`${BOOKS_SERVICE}`, {
      title: bookPayload['title'],
      author_id: bookPayload['authorId'],
      genres: bookPayload['genres'],
      publish_date: bookPayload['publication_date']
  })
      .then((bookId) => {
          return fetchBook(bookId['message']);
      })
      .then((res) => {
      return Promise.resolve({ data: res });
    });
};

const updateBook = (bookId, bookPayload) => {
  return axios.put(`${BOOKS_SERVICE}/${bookId}`, {
      'author_id': bookPayload['authorId'],
      'author_name': bookPayload['authorCanonicalName'],
      'title': bookPayload['title'],
      'publish_date': bookPayload['publication_date'],
      'genres': bookPayload['genres']
  })
    .then(res => {
      return Promise.resolve(res);
    });
};

const deleteBook = (bookId) => {
  return axios.delete(`${BOOKS_SERVICE}/${bookId}`, {
      data: {}
  }).then(res => {
      return Promise.resolve(res);
  })
};

export default {
  fetchBooks,
  fetchBook,
  createBook,
  updateBook,
  deleteBook,
};