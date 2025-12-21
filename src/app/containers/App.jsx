import React, {useEffect, useState} from 'react';
import {BrowserRouter, Route, Routes,} from 'react-router-dom';
import {useDispatch, useSelector,} from 'react-redux';
import {addAxiosInterceptors} from 'misc/requests';
import * as pages from 'constants/pages';
import AuthoritiesProvider from 'misc/providers/AuthoritiesProvider';
import DefaultPage from 'pageProviders/Default';
import Loading from 'components/Loading';
import LoginPage from 'pageProviders/Login';
import PageContainer from 'pageProviders/components/PageContainer';
import pageURLs from 'constants/pagesURLs';
import SecretPage from 'pageProviders/Secret';
import ThemeProvider from 'misc/providers/ThemeProvider';
import UserProvider from 'misc/providers/UserProvider';

import actionsUser from '../actions/user';
import actionsBook from '../actions/book';
import actionsAuthor from '../actions/author';

import Header from '../components/Header';
import IntlProvider from '../components/IntlProvider';
import MissedPage from '../components/MissedPage';
import SearchParamsConfigurator from '../components/SearchParamsConfigurator';
import BookListView from "../../pageProviders/BookList";
import BookDetailsView from "../../pageProviders/BookDetailsView";

function App() {
    const dispatch = useDispatch();
    const [state, setState] = useState({
        componentDidMount: false,
    });

    const {
        errors,
        isFailedSignIn,
        isFailedSignUp,
        isFetchingSignIn,
        isFetchingSignUp,
        isFetchingUser,
    } = useSelector(({ user }) => user);

    useEffect(() => {
        addAxiosInterceptors({
            onSignOut: () => dispatch(actionsUser.fetchSignOut()),
        });
        dispatch(actionsUser.fetchUser());
        setState({
            ...state,
            componentDidMount: true,
        });
    }, []);

    // navigation helpers using react-router navigate inside routes (we'll create functions passed to the views)
    // Note: can't call useNavigate at top-level before Router; we will create wrapper components below that obtain navigate.

    return (
        <UserProvider>
            <AuthoritiesProvider>
                <ThemeProvider>
                    <BrowserRouter>
                        <SearchParamsConfigurator />
                        {/* This is needed to let first render passed for App's
              * configuration process will be finished (e.g. locationQuery
              * initializing) */}
                        {state.componentDidMount && (
                            <IntlProvider>
                                <Header onLogout={() => dispatch(actionsUser.fetchSignOut())} />
                                {isFetchingUser && (
                                    <PageContainer>
                                        <Loading />
                                    </PageContainer>
                                )}
                                {!isFetchingUser && (
                                    <Routes>
                                        <Route
                                            element={<DefaultPage />}
                                            path={`${pageURLs[pages.defaultPage]}`}
                                        />
                                        <Route
                                            element={<SecretPage />}
                                            path={`${pageURLs[pages.secretPage]}`}
                                        />
                                        <Route
                                            element={(
                                                <LoginPage
                                                    errors={errors}
                                                    isFailedSignIn={isFailedSignIn}
                                                    isFailedSignUp={isFailedSignUp}
                                                    isFetchingSignIn={isFetchingSignIn}
                                                    isFetchingSignUp={isFetchingSignUp}
                                                    onSignIn={(({
                                                                    email,
                                                                    login,
                                                                    password,
                                                                }) => dispatch(actionsUser.fetchSignIn({
                                                        email,
                                                        login,
                                                        password,
                                                    })))}
                                                    onSignUp={(({
                                                                    email,
                                                                    firstName,
                                                                    lastName,
                                                                    login,
                                                                    password,
                                                                }) => dispatch(actionsUser.fetchSignUp({
                                                        email,
                                                        firstName,
                                                        lastName,
                                                        login,
                                                        password,
                                                    })))}
                                                />
                                            )}
                                            path={`${pageURLs[pages.login]}`}
                                        />
                                        {/* Book list route - use element as a small wrapper to supply navigation and action callbacks */}
                                        <Route
                                            path={`${pageURLs[pages.bookList]}`}
                                            element={(
                                                <BookListView
                                                    // backend action helpers (mocked in src/app/actions/book.js)
                                                    fetchBooks={actionsBook.fetchBooks}
                                                    // deleteBook should accept (bookId) and return promise
                                                    deleteBook={actionsBook.deleteBook}
                                                    // navigation callbacks expected by UI
                                                    onBookClick={(bookId) => {
                                                        // safe navigation: only accept bookId (no event), use window navigation
                                                        if (typeof window !== 'undefined') {
                                                            window.location.assign(pageURLs[pages.book].replace(':bookId', bookId));
                                                        }
                                                    }}
                                                    onCreateClick={() => {
                                                        if (typeof window !== 'undefined') {
                                                            window.location.assign(pageURLs[pages.book].replace(':bookId', 'new'));
                                                        }
                                                    }}
                                                    onPageChange={(page, filters, pageSize) => {
                                                        return actionsBook.fetchBooks(filters, page, pageSize);
                                                    }}
                                                    onFilterChange={(filters, page = 0, pageSize = 8) => {
                                                        return actionsBook.fetchBooks(filters, page, pageSize);
                                                    }}
                                                />
                                            )}
                                        />
                                        {/* Book details route */}
                                        <Route
                                            path={`${pageURLs[pages.book]}`}
                                            element={(
                                                <BookDetailsView
                                                    fetchBook={(bookId) => actionsBook.fetchBook(bookId)}
                                                    createBook={(payload) => actionsBook.createBook(payload)}
                                                    updateBook={(bookId, payload) => actionsBook.updateBook(bookId, payload)}
                                                    deleteBook={(bookId) => actionsBook.deleteBook(bookId)}
                                                    fetchAuthor={(authorId) => actionsAuthor.fetchAuthor(authorId)}
                                                    fetchAuthors={() => actionsAuthor.fetchAuthors()}
                                                    onBack={() => {
                                                        if (typeof window !== 'undefined') {
                                                            window.location.assign(pageURLs[pages.bookList]);
                                                        }
                                                    }}
                                                    // onSave - components typically call onSave(payload); decide create vs update by presence of id
                                                    onSave={(payload) => {
                                                        if (!payload) return Promise.reject(new Error('Empty payload'));
                                                        if (payload.id) {
                                                            return actionsBook.updateBook(payload.id, payload);
                                                        }
                                                        return actionsBook.createBook(payload);
                                                    }}
                                                    // onSuccessSave is a callback the component may use to notify success; we provide a noop here
                                                    onSuccessSave={() => {}}
                                                />
                                            )}
                                        />
                                        <Route
                                            element={(
                                                <MissedPage
                                                    redirectPage={`${pageURLs[pages.defaultPage]}`}
                                                />
                                            )}
                                            path="*"
                                        />
                                    </Routes>
                                )}
                            </IntlProvider>
                        )}
                    </BrowserRouter>
                </ThemeProvider>
            </AuthoritiesProvider>
        </UserProvider>
    );
}

export default App;
