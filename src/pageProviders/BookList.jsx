import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useTheme from 'misc/hooks/useTheme';

import PageContainer from './components/PageContainer';
import BookList from "../pages/booklist";

const BookListView = (props) => {
    const {
        fetchBooks,
        deleteBook,
    } = props;

    const { theme } = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();

    const getInitialState = () => {
        try {
            const saved = sessionStorage.getItem('bookListState');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    page: parsed.currentPage || 0,
                    filters: parsed.filters || []
                };
            }
        } catch (e) {
            console.error('Error restoring state:', e);
        }
        return {
            page: parseInt(searchParams.get('page')) || 0,
            filters: []
        };
    };

    const initialState = getInitialState();
    const [books, setBooks] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(initialState.page);
    const [isFetchingBooks, setIsFetchingBooks] = useState(false);
    const [isDeletingBook, setIsDeletingBook] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [filters, setFilters] = useState(initialState.filters);
    const pageSize = 8;

    useEffect(() => {
        try {
            sessionStorage.setItem('bookListState', JSON.stringify({
                currentPage,
                filters
            }));
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }, [currentPage, filters]);

    const loadPage = (page = 0, activeFilters = filters) => {
        setIsFetchingBooks(true);

        const params = new URLSearchParams(searchParams);
        params.set('page', (page + 1).toString());
        setSearchParams(params);

        return fetchBooks(activeFilters, page, pageSize)
            .then(({ data }) => {
                setBooks(data.content || []);
                setTotalPages(data.totalPages || 1);
                setCurrentPage(page);
                setIsFetchingBooks(false);
                return data;
            }).catch((err) => {
                setBooks([]);
                setTotalPages(1);
                setCurrentPage(0);
                setIsFetchingBooks(false);
                return Promise.reject(err);
            });
    };

    useEffect(() => {
        if (typeof fetchBooks === 'function' && theme && theme.button && theme.button.color) {
            loadPage(currentPage, filters);
        }
    }, [theme]);

    const handlePageChange = (page) => loadPage(page, filters);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        return loadPage(0, newFilters);
    };

    const handleDeleteBook = (bookId) => {
        setIsDeletingBook(true);
        setDeleteError(null);
        return deleteBook(bookId)
            .catch((err) => {
                setIsDeletingBook(false);
                const errorMessage = err?.message ||
                    (Array.isArray(err) ? (err[0]?.description || err[0]?.code) : String(err));
                setDeleteError(errorMessage);
                return Promise.reject(err);
            }).then(() => {
                setIsDeletingBook(false);
                return loadPage(currentPage, filters);
            });
    };

    const handleBookClick = (bookId) => {
        if (typeof window !== 'undefined') {
            window.location.assign(`/books/${bookId}`);
        }
    };

    const handleCreateClick = () => {
        if (typeof window !== 'undefined') {
            window.location.assign(`/books/new`);
        }
    };

    return (
        <PageContainer>
            <BookList
                books={books}
                totalPages={totalPages}
                currentPage={currentPage}
                isFetchingBooks={isFetchingBooks}
                isDeletingBook={isDeletingBook}
                deleteError={deleteError}
                filters={filters}
                onPageChange={handlePageChange}
                onFilterChange={handleFilterChange}
                onBookClick={handleBookClick}
                onCreateClick={handleCreateClick}
                onDeleteBook={handleDeleteBook}
            />
        </PageContainer>
    );
};

export default BookListView;