import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useTheme from 'misc/hooks/useTheme';

import PageContainer from './components/PageContainer';
import BookDetails from "../pages/book";

const BookDetailsView = (props) => {
    const {
        fetchBook,
        createBook,
        updateBook,
        fetchAuthor,
        fetchAuthors
    } = props;

    const { bookId } = useParams();
    const { theme } = useTheme();
    const creatingMode = bookId.includes('new');

    const [book, setBook] = useState(null);
    const [authors, setAuthors] = useState([]);
    const [errors, setErrors] = useState([]);
    const [isFetchingBook, setIsFetchingBook] = useState(false);
    const [isFetchingAuthors, setIsFetchingAuthors] = useState(false);
    const [isSavingBook, setIsSavingBook] = useState(false);
    const [isEditMode, setIsEditMode] = useState(creatingMode);
    const [saveSuccessType, setSaveSuccessType] = useState(null);

    useEffect(() => {
        if (creatingMode) {
            setBook({
                id: 'new',
                title: '',
                authorCanonicalName: '',
                authorId: '',
                genres: '',
                publication_date: '',
                author: null
            });
            setIsEditMode(true);
            setIsFetchingAuthors(true);
            return;
        }

        setIsFetchingBook(true);
        fetchBook(bookId)
            .then(bookDetails =>
                fetchAuthor(bookDetails.author.id).then(authorDetails => {
                    bookDetails.author = authorDetails;
                    bookDetails.authorCanonicalName =
                        [authorDetails.name.first_name, authorDetails.name.last_name]
                            .filter(Boolean)
                            .join(' ');
                    setBook(bookDetails);
                    setIsFetchingBook(false);
                })
            )
            .catch(err => {
                errorHandler(err, setErrors);
                setIsFetchingBook(false);
            });
    }, [bookId, creatingMode, theme]);

    useEffect(() => {
        if (!isEditMode && !creatingMode) return;

        setIsFetchingAuthors(true);
        fetchAuthors()
            .then(res => {
                setAuthors(res.list || []);
                setIsFetchingAuthors(false);
            })
            .catch(err => {
                errorHandler(err, setErrors);
                setIsFetchingAuthors(false);
            });
    }, [isEditMode, creatingMode]);

    const handleSave = (payload) => {
        setIsSavingBook(true);
        setErrors([]);
        setSaveSuccessType(null);

        if (creatingMode) {
            return createBook(payload)
                .then(() => {
                    window.location.assign('/books');
                    setSaveSuccessType('created');
                })
                .catch(err => {
                    setIsSavingBook(false);
                    errorHandler(err, setErrors);
                });
        }

        return updateBook(bookId, payload)
            .then(() =>
                fetchBook(bookId).then(refetched =>
                    fetchAuthor(refetched.author.id).then(authorDetails => {
                        refetched.author = authorDetails;
                        refetched.authorCanonicalName =
                            [authorDetails.name.first_name, authorDetails.name.last_name]
                                .filter(Boolean)
                                .join(' ');
                        setBook(refetched);
                        setIsEditMode(false);
                        setIsSavingBook(false);
                        setSaveSuccessType('updated');
                        setTimeout(() => setSaveSuccessType(null), 3000);
                    })
                )
            )
            .catch(err => {
                setIsSavingBook(false);
                errorHandler(err, setErrors);
            });
    };

    const handleEdit = () => {
        setIsEditMode(true);
        setErrors([]);
        setSaveSuccessType(null);
    };

    const handleCancelEdit = () => {
        if (creatingMode) {
            window.location.assign('/books');
        } else {
            setIsEditMode(false);
        }
    };

    const handleBack = () => {
        window.location.assign('/books');
    };

    return (
        <PageContainer>
            <BookDetails
                book={book}
                authors={authors}
                errors={errors}
                saveSuccessType={saveSuccessType}
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
    setErrors([(err && err.message) || String(err)]);
};

export default BookDetailsView;
