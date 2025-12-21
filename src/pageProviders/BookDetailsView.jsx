import React, {useEffect, useState} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';
import useTheme from 'misc/hooks/useTheme';

import PageContainer from './components/PageContainer';
import BookDetails from "../pages/book";

const BookDetailsView = (props) => {
    const {
        fetchBook,
        createBook,
        updateBook,
        deleteBook,
        fetchAuthor,
        fetchAuthors
    } = props;

    const { bookId } = useParams();
    const [searchParams] = useSearchParams();
    const { theme } = useTheme();
    const creatingMode = bookId.includes('new');

    const [book, setBook] = useState(null);
    const [authors, setAuthors] = useState(null);
    const [errors, setErrors] = useState([]);
    const [isFetchingBook, setIsFetchingBook] = useState(false);
    const [isFetchingAuthors, setIsFetchingAuthors] = useState(false);
    const [isSavingBook, setIsSavingBook] = useState(false);
    const [isEditMode, setIsEditMode] = useState(creatingMode);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (creatingMode) {
            setBook({
                id: 'new',
                title: '',
                authorCanonicalName: '',
                authorId: '',
                genres: '',
                publication_date: null,
                lastUpdateTime: null,
                author: null
            });

            setErrors([]);
            setIsFetchingBook(false);
            setIsFetchingAuthors(true);
            setIsEditMode(true);
            return;
        }

        if (typeof fetchBook === 'function' && bookId) {
            setIsFetchingBook(true);
            fetchBook(bookId)
                .then(bookDetails => {
                    fetchAuthor(bookDetails['author']['id']).then(authorDetails => {
                        bookDetails.authorCanonicalName = bookDetails['author']['name'];
                        bookDetails.author = authorDetails;

                        setBook(bookDetails);
                        setErrors([]);
                        setIsFetchingBook(false);
                    });

                })
                .catch((err) => {
                    errorHandler(err, setErrors);
                    setIsFetchingBook(false);
                });
        }
    }, [bookId, creatingMode, theme]);

    useEffect(() => {
        if (isFetchingAuthors){
            fetchAuthors()
                .then(authorInfos => {
                    setAuthors(authorInfos['list']);
                    setIsFetchingAuthors(false);
                })
                .catch((err) => {
                    errorHandler(err, setErrors);
                    setIsFetchingAuthors(false);
                });
        }
    }, [isFetchingAuthors])

    const handleSave = (payload) => {
        setIsSavingBook(true);
        setErrors([]);
        setSuccessMessage(null);

        if (creatingMode) {
            return createBook(payload)
                .then(({ data }) => {
                    setIsSavingBook(false);
                    if (typeof window !== 'undefined') {
                        window.location.assign('/books');
                    }
                    setSuccessMessage('Book successfully created!');
                    return data;
                })
                .catch((err) => {
                    setIsSavingBook(false);
                    errorHandler(err, setErrors);
                });
        }

        const id = payload?.id || bookId;
        return updateBook(id, payload)
            .then(data => {
                setIsSavingBook(false);
                if (typeof fetchBook === 'function') {
                    return fetchBook(id).then(refreshed => {
                        return fetchAuthor(refreshed['author']['id']).then(authorDetails => {
                            refreshed.authorCanonicalName = refreshed['author']['name'];
                            refreshed.author = authorDetails;

                            setBook(refreshed);
                            setErrors([]);
                            setIsEditMode(false);
                            setSuccessMessage('Book successfully updated');

                            setTimeout(() => {
                                setSuccessMessage(null);
                            }, 3000);

                            return refreshed;
                        });
                    });
                }
                return data;
            })
            .catch((err) => {
                setIsSavingBook(false);
                errorHandler(err, setErrors);
                return Promise.reject(err);
            });
    };

    const handleEdit = () => {
        setIsEditMode(true);
        setErrors([]);
        setSuccessMessage(null);
    };

    const handleCancelEdit = () => {
        if (creatingMode) {
            handleBack();
        } else {
            setIsEditMode(false);
            setErrors([]);
            setSuccessMessage(null);
            if (typeof fetchBook === 'function' && bookId) {
                setIsFetchingBook(true);
                fetchBook(bookId)
                    .then(bookDetails => {
                        fetchAuthor(bookDetails['author']['id']).then(authorDetails => {
                            bookDetails.authorCanonicalName = bookDetails['author']['name'];
                            bookDetails.author = authorDetails;

                            setBook(bookDetails);
                            setIsFetchingBook(false);
                        });
                    })
                    .catch((err) => {
                        errorHandler(err, setErrors);
                        setIsFetchingBook(false);
                    });
            }
        }
    };

    const handleBack = () => {
        if (typeof window !== 'undefined') {
            window.location.assign('/books');
        }
    };

    return (
        <PageContainer>
            <BookDetails
                book={book}
                authors={authors}
                errors={errors}
                successMessage={successMessage}
                isFetchingBook={isFetchingBook}
                isSavingBook={isSavingBook}
                isCreatingMode={creatingMode}
                isEditMode={isEditMode}
                isFetchingAuthors={isFetchingAuthors}
                onBack={handleBack}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancelEdit={handleCancelEdit}
            />
        </PageContainer>
    );
};

const errorHandler = (err, setErrors) => {
    const messages = Array.isArray(err)
        ? err.map(e => e.description || e.code || String(e))
        : [(err && err.message) || String(err)];
    setErrors(messages);
    return err;
};

export default BookDetailsView;