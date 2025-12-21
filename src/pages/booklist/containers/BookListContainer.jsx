import { createUseStyles } from 'react-jss';
import { useIntl } from 'react-intl';
import useTheme from 'misc/hooks/useTheme';
import Button from 'components/Button';
import Card from 'components/Card';
import CardContent from 'components/CardContent';
import CardTitle from 'components/CardTitle';
import Dialog from 'components/Dialog';
import IconButton from 'components/IconButton';
import IconClose from 'components/icons/Close';
import React, { useEffect, useState } from 'react';
import TextField from 'components/TextField';
import Typography from 'components/Typography';

const getClasses = createUseStyles((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: `${theme.spacing(2)}px`,
        gap: `${theme.spacing(2)}px`,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: `${theme.spacing(2)}px`,
    },
    headerActions: {
        display: 'flex',
        gap: `${theme.spacing(1)}px`,
    },
    booksList: {
        display: 'flex',
        flexDirection: 'column',
        gap: `${theme.spacing(1)}px`,
    },
    bookItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${theme.spacing(2)}px`,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
            '& $deleteButton': {
                opacity: 1,
            },
        },
    },
    bookInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: `${theme.spacing(0.5)}px`,
        flex: 1,
    },
    deleteButton: {
        opacity: 0,
        transition: 'opacity 0.2s',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: `${theme.spacing(2)}px`,
        marginTop: `${theme.spacing(2)}px`,
    },
    dialogContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: `${theme.spacing(2)}px`,
    },
    dialogButtons: {
        display: 'flex',
        gap: `${theme.spacing(1)}px`,
        justifyContent: 'flex-end',
        marginTop: `${theme.spacing(2)}px`,
    },
    emptyState: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${theme.spacing(4)}px`,
    },
}));

function BookListContainer({
                               books,
                               totalPages,
                               currentPage,
                               isFetchingBooks,
                               isDeletingBook,
                               deleteError,
                               filters, // Array: [{ attribute: 'TITLE', value: '...' }, ...]
                               onPageChange,
                               onFilterChange,
                               onBookClick,
                               onCreateClick,
                               onDeleteBook,
                           }) {
    const { formatMessage } = useIntl();
    const { theme } = useTheme();
    const classes = getClasses({ theme });

    // Helper function to extract filter values from array
    const getFilterValue = (filterArray, attribute) => {
        const filter = filterArray?.find(f => f.attribute === attribute);
        return filter?.value || '';
    };

    const [state, setState] = useState({
        isFilterDialogOpen: false,
        isDeleteDialogOpen: false,
        bookToDelete: null,
        filterTitle: getFilterValue(filters, 'TITLE'),
        filterAuthorCanonicalName: getFilterValue(filters, 'AUTHOR_CANONICAL_NAME'),
    });

    // Update local state when filters prop changes (e.g., when restored from sessionStorage)
    useEffect(() => {
        setState(prevState => ({
            ...prevState,
            filterTitle: getFilterValue(filters, 'TITLE'),
            filterAuthorCanonicalName: getFilterValue(filters, 'AUTHOR_CANONICAL_NAME'),
        }));
    }, [filters]);

    useEffect(() => {
        if (!isDeletingBook && !deleteError && state.isDeleteDialogOpen) {
            setState({
                ...state,
                isDeleteDialogOpen: false,
                bookToDelete: null,
            });
        }
    }, [isDeletingBook, deleteError]);

    const handleApplyFilter = () => {
        const newFilters = [];

        if (state.filterTitle && state.filterTitle !== "") {
            newFilters.push({
                'attribute': 'TITLE',
                'value': state.filterTitle,
            });
        }

        if (state.filterAuthorCanonicalName && state.filterAuthorCanonicalName !== "") {
            newFilters.push({
                'attribute': 'AUTHOR_CANONICAL_NAME',
                'value': state.filterAuthorCanonicalName,
            });
        }

        onFilterChange(newFilters);
        setState({
            ...state,
            isFilterDialogOpen: false,
        });
    };

    const handleClearFilter = () => {
        setState({
            ...state,
            filterTitle: '',
            filterAuthorCanonicalName: '',
        });

        onFilterChange([]);
    };

    const handleDeleteClick = (e, book) => {
        e.stopPropagation();

        if (book === undefined)
            return;

        setState({
            ...state,
            isDeleteDialogOpen: true,
            bookToDelete: book,
        });
    };

    const handleConfirmDelete = () => {
        if (state.bookToDelete) {
            onDeleteBook(state.bookToDelete.id);
        }
    };

    const handleCancelDelete = () => {
        setState({
            ...state,
            isDeleteDialogOpen: false,
            bookToDelete: null,
        });
    };

    const hasActiveFilters = state.filterTitle || state.filterAuthorCanonicalName;

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <Typography variant="title">
                    {formatMessage({ id: 'books.list' })}
                </Typography>
                <div className={classes.headerActions}>
                    <Button
                        colorVariant="secondary"
                        onClick={() => setState({
                            ...state,
                            isFilterDialogOpen: true,
                        })}
                        variant="secondary"
                    >
                        <Typography>
                            {formatMessage({ id: 'btn.filter' })}
                            {hasActiveFilters && ' ✓'}
                        </Typography>
                    </Button>
                    <Button
                        onClick={onCreateClick}
                        variant="primary"
                    >
                        <Typography color="inherit">
                            {formatMessage({ id: 'btn.addBook' })}
                        </Typography>
                    </Button>
                </div>
            </div>

            {isFetchingBooks ? (
                <div className={classes.emptyState}>
                    <Typography>
                        {formatMessage({ id: 'loading' })}
                    </Typography>
                </div>
            ) : books && books.length > 0 ? (
                <>
                    <div className={classes.booksList}>
                        {books.map(book => (
                            <div
                                key={book.id}
                                className={classes.bookItem}
                                onClick={() => onBookClick(book.id)}
                            >
                                <div className={classes.bookInfo}>
                                    <Typography variant="subTitle">
                                        {book.title + ' (№ ' + book['id'] + ')'}
                                    </Typography>
                                    <Typography color="secondary">
                                        {book['full_author_name']}
                                    </Typography>
                                </div>
                                <Button
                                    className={classes.deleteButton}
                                    onClick={(e) => handleDeleteClick(e, book)}
                                    variant="secondary"
                                >
                                    <Typography color="inherit">
                                        {formatMessage({ id: 'btn.delete' })}
                                    </Typography>
                                </Button>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className={classes.pagination}>
                            <Button
                                disabled={currentPage === 0}
                                onClick={() => onPageChange(currentPage - 1)}
                                variant="secondary"
                            >
                                <Typography>
                                    {formatMessage({ id: 'btn.previous' })}
                                </Typography>
                            </Button>
                            <Typography>
                                {formatMessage(
                                    { id: 'pagination.info' },
                                    { current: currentPage + 1, total: totalPages }
                                )}
                            </Typography>
                            <Button
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => onPageChange(currentPage + 1)}
                                variant="secondary"
                            >
                                <Typography>
                                    {formatMessage({ id: 'btn.next' })}
                                </Typography>
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className={classes.emptyState}>
                    <Typography color="secondary">
                        {formatMessage({ id: 'books.empty' })}
                    </Typography>
                </div>
            )}

            {/* Filter Dialog */}
            <Dialog
                maxWidth="sm"
                open={state.isFilterDialogOpen}
            >
                <Card>
                    <CardTitle>
                        <Typography variant="subTitle">
                            {formatMessage({ id: 'filter.title' })}
                        </Typography>
                        <IconButton onClick={() => setState({
                            ...state,
                            isFilterDialogOpen: false,
                        })}>
                            <IconClose size={24} />
                        </IconButton>
                    </CardTitle>
                    <CardContent>
                        <div className={classes.dialogContent}>
                            <TextField
                                label={formatMessage({ id: 'field.title' })}
                                onChange={({ target }) => setState({
                                    ...state,
                                    filterTitle: target.value,
                                })}
                                value={state.filterTitle}
                            />
                            <TextField
                                label={formatMessage({ id: 'field.author' })}
                                onChange={({ target }) => setState({
                                    ...state,
                                    filterAuthorCanonicalName: target.value,
                                })}
                                value={state.filterAuthorCanonicalName}
                            />
                            <div className={classes.dialogButtons}>
                                <Button
                                    colorVariant="secondary"
                                    onClick={handleClearFilter}
                                    variant="secondary"
                                >
                                    <Typography>
                                        {formatMessage({ id: 'btn.clear' })}
                                    </Typography>
                                </Button>
                                <Button
                                    onClick={handleApplyFilter}
                                    variant="primary"
                                >
                                    <Typography color="inherit">
                                        <strong>
                                            {formatMessage({ id: 'btn.apply' })}
                                        </strong>
                                    </Typography>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                maxWidth="xs"
                open={state.isDeleteDialogOpen}
            >
                <Card>
                    <CardTitle>
                        <Typography variant="subTitle">
                            {formatMessage({ id: 'delete.confirmation' })}
                        </Typography>
                        <IconButton onClick={handleCancelDelete}>
                            <IconClose size={24} />
                        </IconButton>
                    </CardTitle>
                    <CardContent>
                        <div className={classes.dialogContent}>
                            {deleteError ? (
                                <Card variant="error">
                                    <CardContent>
                                        <Typography color="error">
                                            {deleteError}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Typography>
                                    {formatMessage(
                                        { id: 'delete.confirmation.message' },
                                        { title: state.bookToDelete?.title }
                                    )}
                                </Typography>
                            )}
                            <div className={classes.dialogButtons}>
                                <Button
                                    colorVariant="secondary"
                                    onClick={handleCancelDelete}
                                    variant="secondary"
                                >
                                    <Typography>
                                        {formatMessage({ id: 'btn.cancel' })}
                                    </Typography>
                                </Button>
                                <Button
                                    isLoading={isDeletingBook}
                                    onClick={handleConfirmDelete}
                                    variant="primary"
                                >
                                    <Typography color="inherit">
                                        <strong>
                                            {formatMessage({ id: 'btn.delete' })}
                                        </strong>
                                    </Typography>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Dialog>
        </div>
    );
}

export default BookListContainer;