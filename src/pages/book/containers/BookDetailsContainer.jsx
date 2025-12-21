import {createUseStyles} from 'react-jss';
import {useIntl} from 'react-intl';
import useTheme from 'misc/hooks/useTheme';
import Button from 'components/Button';
import Card from 'components/Card';
import CardActions from 'components/CardActions';
import CardContent from 'components/CardContent';
import CardTitle from 'components/CardTitle';
import IconButton from 'components/IconButton';
import React, {useEffect, useRef, useState} from 'react';
import TextField from 'components/TextField';
import Typography from 'components/Typography';
import IconHome from 'components/icons/Home';
import Select from "../../../components/Select";
import MenuItem from "../../../components/MenuItem";
import Edit from "../../../components/icons/Edit";

const getClasses = createUseStyles((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: `${theme.spacing(2)}px`,
        gap: `${theme.spacing(2)}px`,
        position: 'relative', // <-- add this
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: `${theme.spacing(3)}px`,
        maxWidth: '800px',
        width: '100%',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: `${theme.spacing(1)}px`,
    },
    row: {
        display: 'flex',
        gap: `${theme.spacing(2)}px`,
        alignItems: 'flex-start',
    },
    label: {
        minWidth: '150px',
        fontWeight: 500,
    },
    authorSection: {
        marginTop: `${theme.spacing(2)}px`,
        padding: `${theme.spacing(2)}px`,
        backgroundColor: theme.palette.background.secondary,
        borderRadius: '4px',
    },
    buttons: {
        display: 'flex',
        gap: `${theme.spacing(1)}px`,
        justifyContent: 'flex-end',
    },
    editForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: `${theme.spacing(2)}px`,
    },
    successMessage: {
        position: 'absolute',
        top: `${theme.spacing(2)}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: `${theme.spacing(2)}px`,
        backgroundColor: '#d4edda',
        color: '#155724',
        borderRadius: '4px',
        border: '1px solid #c3e6cb',
        zIndex: 1000,
    },
    errorMessage: {
        padding: `${theme.spacing(2)}px`,
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '4px',
        marginBottom: `${theme.spacing(2)}px`,
        border: '1px solid #f5c6cb',
    },
}));

const errorTypes = {
    EMPTY_TITLE: 'EMPTY_TITLE',
    EMPTY_AUTHOR: 'EMPTY_AUTHOR_CANONICAL_NAME',
    EMPTY_GENRES: 'EMPTY_GENRES',
    EMPTY_PUBLICATION: 'EMPTY_PUBLICATION',
};

function BookDetailsContainer({
                                  book,
                                  authors,
                                  errors,
                                  saveSuccessType,
                                  isFetchingBook,
                                  isSavingBook,
                                  isCreatingMode,
                                  isEditMode,
                                  isFetchingAuthors,
                                  onBack,
                                  onSave,
                                  onEdit,
                                  onCancelEdit
                              }) {
    const { formatMessage } = useIntl();
    const { theme } = useTheme();
    const classes = getClasses({ theme });

    const [editableBook, setEditableBook] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [externalErrors, setExternalErrors] = useState([]);

    useEffect(() => {
        if (book && !editableBook) {
            setEditableBook({
                ...book,
                title: book.title || '',
                genres: book.genres || '',
                publication_date: book.publication_date || '',
                authorId: book.author?.id?.toString() || '',
                authorCanonicalName: book.authorCanonicalName || '',
            });
        }
    }, [book, editableBook]);

    useEffect(() => {
        if (errors && errors.length) {
            const messages = errors.map(error => error.message || error);
            setExternalErrors(messages);
        } else {
            setExternalErrors([]);
        }
    }, [errors]);

    const wasSavingRef = useRef(false);

    useEffect(() => {
        if (
            wasSavingRef.current &&
            !isSavingBook &&
            !errors?.length &&
            !isCreatingMode
        ) {
            setValidationErrors([]);
            setExternalErrors([]);
        }

        wasSavingRef.current = isSavingBook;
    }, [isSavingBook, errors, isCreatingMode]);

    const getValidationErrors = () => {
        const errors = [];
        if (!editableBook?.title?.trim()) {
            errors.push(errorTypes.EMPTY_TITLE);
        }
        if (!editableBook?.authorId) {
            errors.push(errorTypes.EMPTY_AUTHOR);
        }
        if (!editableBook?.genres?.trim()) {
            errors.push(errorTypes.EMPTY_GENRES);
        }
        if (!editableBook?.publication_date) {
            errors.push(errorTypes.EMPTY_PUBLICATION);
        }
        return errors;
    };

    const handleSave = () => {
        const validationErrors = getValidationErrors();
        if (validationErrors.length) {
            setValidationErrors(validationErrors);
            return;
        }
        setValidationErrors([]);
        setExternalErrors([]);
        onSave(editableBook);
    };

    const handleCancel = () => {
        setValidationErrors([]);
        setExternalErrors([]);
        onCancelEdit();
    };

    const handleEdit = () => {
        setValidationErrors([]);
        setExternalErrors([]);
        onEdit();
    };

    const handleFieldChange = (field, value) => {
        setEditableBook(prev => {
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return '-';
        return new Date(dateTime).toLocaleString();
    };

    if (isFetchingBook) {
        return (
            <div className={classes.container}>
                <Typography>
                    {formatMessage({ id: 'loading' })}
                </Typography>
            </div>
        );
    }

    if (!book && !isCreatingMode) {
        return (
            <div className={classes.container}>
                <Typography color="error">
                    {formatMessage({ id: 'book.notFound' })}
                </Typography>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            <Card>
                <CardTitle>
                    <Typography variant="title">
                        {isCreatingMode
                            ? formatMessage({ id: 'book.create' })
                            : formatMessage({ id: 'book.details' })}
                    </Typography>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {!isEditMode && !isCreatingMode && (
                            <IconButton onClick={handleEdit} title={formatMessage({ id: 'btn.edit' })}>
                                <Edit size={24} />
                            </IconButton>
                        )}
                        <IconButton onClick={onBack} title={formatMessage({ id: 'btn.back' })}>
                            <IconHome size={24} />
                        </IconButton>
                    </div>
                </CardTitle>

                <CardContent>
                    {/* Success Message */}
                    {saveSuccessType && (
                        <div className={classes.successMessage}>
                            <Typography>
                                {formatMessage({
                                    id: (() => {
                                        switch (saveSuccessType) {
                                            case 'created':
                                                return 'book.success.created';
                                            case 'updated':
                                                return 'book.success.updated';
                                        }
                                    })(),
                                })}
                            </Typography>
                        </div>
                    )}

                    {/* External Errors from Backend */}
                    {externalErrors.length > 0 && (
                        <div className={classes.errorMessage}>
                            {externalErrors.map((errorMessage, index) => (
                                <Typography key={index}>
                                    {errorMessage}
                                </Typography>
                            ))}
                        </div>
                    )}

                    <div className={classes.content}>
                        {isEditMode ? (
                            <div className={classes.editForm}>
                                <TextField
                                    helperText={validationErrors.includes(errorTypes.EMPTY_TITLE)
                                        && formatMessage({ id: `book.error.${errorTypes.EMPTY_TITLE}` })}
                                    isError={validationErrors.includes(errorTypes.EMPTY_TITLE)}
                                    label={formatMessage({ id: 'field.title' })}
                                    onChange={({ target }) => handleFieldChange('title', target.value)}
                                    required
                                    disabled={isSavingBook}
                                    value={editableBook?.title || ''}
                                />
                                <TextField
                                    helperText={validationErrors.includes(errorTypes.EMPTY_GENRES)
                                        && formatMessage({ id: `book.error.${errorTypes.EMPTY_GENRES}` })}
                                    isError={validationErrors.includes(errorTypes.EMPTY_GENRES)}
                                    label={formatMessage({ id: 'field.genres' })}
                                    onChange={({ target }) => handleFieldChange('genres', target.value)}
                                    required
                                    disabled={isSavingBook}
                                    value={editableBook?.genres || ''}
                                />
                                <Select
                                    label={formatMessage({ id: 'field.author' })}
                                    value={editableBook?.authorId || ''}
                                    required
                                    disabled={isFetchingAuthors || isSavingBook}
                                    isError={validationErrors.includes(errorTypes.EMPTY_AUTHOR)}
                                    helperText={
                                        validationErrors.includes(errorTypes.EMPTY_AUTHOR) &&
                                        formatMessage({ id: `book.error.${errorTypes.EMPTY_AUTHOR}` })
                                    }
                                    onChange={({ target }) => {
                                        const value = target.value;
                                        handleFieldChange('authorId', value);

                                        const selectedAuthor = authors?.find(
                                            a => a.id.toString() === value
                                        );

                                        if (selectedAuthor) {
                                            handleFieldChange(
                                                'authorCanonicalName',
                                                selectedAuthor.name
                                            );
                                        }
                                    }}
                                >
                                    {authors?.map(author => (
                                        <MenuItem key={author.id} value={author.id.toString()}>
                                            {author.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <TextField
                                    helperText={validationErrors.includes(errorTypes.EMPTY_PUBLICATION)
                                        && formatMessage({ id: `book.error.${errorTypes.EMPTY_PUBLICATION}` })}
                                    isError={validationErrors.includes(errorTypes.EMPTY_PUBLICATION)}
                                    inputType="date"
                                    label={formatMessage({ id: 'field.publication' })}
                                    onChange={({ target }) => handleFieldChange('publication_date', target.value)}
                                    required
                                    disabled={isSavingBook}
                                    value={editableBook?.publication_date || Date.now().toString()}
                                />
                            </div>
                        ) : (
                            <>
                                <div className={classes.section}>
                                    <Typography variant="subTitle">
                                        {formatMessage({ id: 'book.information' })}
                                    </Typography>
                                    {!isCreatingMode && (
                                        <div className={classes.row}>
                                            <Typography className={classes.label}>
                                                {formatMessage({ id: 'field.id' })}:
                                            </Typography>
                                            <Typography>
                                                {book.id}
                                            </Typography>
                                        </div>
                                    )}
                                    <div className={classes.row}>
                                        <Typography className={classes.label}>
                                            {formatMessage({ id: 'field.title' })}:
                                        </Typography>
                                        <Typography>
                                            {book?.title || '-'}
                                        </Typography>
                                    </div>
                                    <div className={classes.row}>
                                        <Typography className={classes.label}>
                                            {formatMessage({ id: 'field.author' })}:
                                        </Typography>
                                        <Typography>
                                            {book?.authorCanonicalName || '-'}
                                        </Typography>
                                    </div>
                                    <div className={classes.row}>
                                        <Typography className={classes.label}>
                                            {formatMessage({ id: 'field.genres' })}:
                                        </Typography>
                                        <Typography>
                                            {book?.genres || '-'}
                                        </Typography>
                                    </div>
                                    <div className={classes.row}>
                                        <Typography className={classes.label}>
                                            {formatMessage({ id: 'field.publication' })}:
                                        </Typography>
                                        <Typography>
                                            {formatDate(book?.['publication_date'])}
                                        </Typography>
                                    </div>
                                    {!isCreatingMode && (
                                        <div className={classes.row}>
                                            <Typography className={classes.label}>
                                                {formatMessage({ id: 'field.lastUpdateTime' })}:
                                            </Typography>
                                            <Typography>
                                                {formatDateTime(book?.['last_update_time'])}
                                            </Typography>
                                        </div>
                                    )}
                                </div>

                                {book?.author && (
                                    <div className={classes.authorSection}>
                                        <div className={classes.section}>
                                            <Typography variant="subTitle">
                                                {formatMessage({ id: 'author.information' })}
                                            </Typography>

                                            <div className={classes.row}>
                                                <Typography className={classes.label}>
                                                    {formatMessage({ id: 'field.name' })}:
                                                </Typography>
                                                <Typography>
                                                    {book.author['name']
                                                        ? [
                                                            book.author['name']['first_name'],
                                                            book.author['name']['last_name'],
                                                        ].filter(Boolean).join(' ')
                                                        : '-'}
                                                </Typography>
                                            </div>

                                            <div className={classes.row}>
                                                <Typography className={classes.label}>
                                                    {formatMessage({ id: 'field.canonicalName' })}:
                                                </Typography>
                                                <Typography>
                                                    {book['authorCanonicalName'] || '-'}
                                                </Typography>
                                            </div>

                                            <div className={classes.row}>
                                                <Typography className={classes.label}>
                                                    {formatMessage({ id: 'field.email' })}:
                                                </Typography>
                                                <Typography>
                                                    {book.author['email'] || '-'}
                                                </Typography>
                                            </div>
                                            <div className={classes.row}>
                                                <Typography className={classes.label}>
                                                    {formatMessage({ id: 'field.phoneNumber' })}:
                                                </Typography>
                                                <Typography>
                                                    {book.author['phone_number'] || '-'}
                                                </Typography>
                                            </div>
                                            {book.author['address'] && (
                                                <div className={classes.row}>
                                                    <Typography className={classes.label}>
                                                        {formatMessage({ id: 'field.address' })}:
                                                    </Typography>
                                                    <Typography>
                                                        {[
                                                            book.author['address']['street'],
                                                            book.author['address']['house_number'],
                                                            book.author['address']['city'],
                                                            book.author['address']['state'],
                                                            book.author['address']['zip_code'],
                                                            book.author['address']['country'],
                                                        ].filter(Boolean).join(', ') || '-'}
                                                    </Typography>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </>
                        )}
                    </div>
                </CardContent>
                <CardActions>
                    <div className={classes.buttons}>
                        {isEditMode ? (
                            <>
                                <Button
                                    colorVariant="secondary"
                                    onClick={handleCancel}
                                    variant="secondary"
                                    disabled={isSavingBook}
                                >
                                    <Typography>
                                        {formatMessage({ id: 'btn.cancel' })}
                                    </Typography>
                                </Button>
                                <Button
                                    isLoading={isSavingBook}
                                    onClick={handleSave}
                                    variant="primary"
                                    disabled={isSavingBook}
                                >
                                    <Typography color="inherit">
                                        <strong>
                                            {formatMessage({ id: isCreatingMode ? 'btn.create' : 'btn.save' })}
                                        </strong>
                                    </Typography>
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={onBack}
                                variant="secondary"
                            >
                                <Typography>
                                    {formatMessage({ id: 'btn.back' })}
                                </Typography>
                            </Button>
                        )}
                    </div>
                </CardActions>
            </Card>
        </div>
    );
}

export default BookDetailsContainer;